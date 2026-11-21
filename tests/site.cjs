const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });

const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.join(root, pathname === '/' ? 'index.html' : pathname);
    if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    fs.createReadStream(target).pipe(res);
});

const viewports = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 }
];

(async () => {
    let browser;
    const errors = [];
    try {
        await new Promise((resolve) => server.listen(0, resolve));
        const base = `http://127.0.0.1:${server.address().port}/`;
        browser = await chromium.launch();

        const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        desktop.on('pageerror', (e) => errors.push(e.message));
        desktop.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
        desktop.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
        await desktop.goto(base, { waitUntil: 'domcontentloaded' });

        assert.equal(await desktop.locator('h1').count(), 1, 'One h1 on the page');
        assert.equal(await desktop.locator('.hero-line').count(), 3, 'Hero statement has three lines');
        assert.match(await desktop.title(), /Youth English Society/);

        const headings = await desktop.locator('h2').allTextContents();
        assert.deepEqual(headings, ['Tentang YES', 'Jadwal', 'Dokumentasi', 'Gabung']);

        const sessions = await desktop.locator('.session').evaluateAll((nodes) => nodes.map((n) => ({
            when: n.querySelector('.when').textContent.trim(),
            what: n.querySelector('.what').textContent.trim()
        })));
        assert.deepEqual(sessions, [
            { when: 'Kamis, 15.30 sampai 17.30 WIB', what: 'Forum Group Discussion' },
            { when: 'Jumat, 15.30 sampai 17.30 WIB', what: 'Public Speaking Class' },
            { when: 'Berkala', what: 'Debate Class' },
            { when: 'Berkala', what: 'TOEFL Preparation Class' },
            { when: 'Bulanan', what: 'YES Goes Out' }
        ]);

        const pillars = await desktop.locator('.pillars dt').allTextContents();
        assert.deepEqual(pillars, ['English Skills', 'Communication', 'Leadership']);

        const dates = await desktop.locator('.dates dt').allTextContents();
        assert.deepEqual(dates, ['2007', '2012']);
        assert.match(await desktop.locator('.dates').innerText(), /4 September/);

        assert.match(await desktop.locator('#tentang').innerText(), /Sanctuary/);
        assert.match(await desktop.locator('#tentang').innerText(), /PIQIE/);

        await desktop.waitForFunction(() => {
            const img = document.querySelector('.poster img');
            return img && img.complete && img.naturalWidth > 0;
        }, null, { timeout: 15000 });
        assert(await desktop.locator('.poster img').evaluate((img) => img.complete && img.naturalWidth === 1080), 'Poster loads at full width');

        const fonts = await desktop.evaluate(() => ({
            display: getComputedStyle(document.querySelector('.hero-title')).fontFamily,
            text: getComputedStyle(document.body).fontFamily
        }));
        assert.match(fonts.display, /Bricolage Grotesque/);
        assert.match(fonts.text, /Instrument Sans/);

        const heroSize = await desktop.locator('.hero-title').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        assert(heroSize > 60, `Hero is display size on desktop, got ${heroSize}px`);

        // Contrast of body copy against paper
        const contrast = await desktop.evaluate(() => {
            const parse = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
            const lum = ([r, g, b]) => {
                const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
                return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const ratio = (a, b) => {
                const [l1, l2] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x);
                return (l1 + 0.05) / (l2 + 0.05);
            };
            const bg = getComputedStyle(document.body).backgroundColor;
            const muted = getComputedStyle(document.querySelector('.sheet-aside')).color;
            const ink = getComputedStyle(document.body).color;
            return { muted: +ratio(muted, bg).toFixed(2), ink: +ratio(ink, bg).toFixed(2) };
        });
        assert(contrast.ink >= 4.5, `Body text contrast ${contrast.ink}`);
        assert(contrast.muted >= 4.5, `Aside text contrast ${contrast.muted}`);

        await desktop.screenshot({ path: path.join(output, 'redesign-1440.png'), fullPage: true });

        for (const viewport of viewports) {
            const page = await browser.newPage({ viewport });
            await page.goto(base, { waitUntil: 'domcontentloaded' });
            // Wait until the external stylesheet is applied so layout is settled
            await page.waitForFunction(() => getComputedStyle(document.body).margin === '0px' && document.fonts.status === 'loaded', null, { timeout: 20000 });
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            if (overflow > 0) {
                const detail = await page.evaluate(() => {
                    const cw = document.documentElement.clientWidth;
                    return [...document.querySelectorAll('body *')].filter((el) => {
                        const r = el.getBoundingClientRect();
                        return r.right > cw + 1 && r.width > 0;
                    }).slice(0, 8).map((el) => el.tagName + '.' + el.className + ' right=' + Math.round(el.getBoundingClientRect().right) + ' w=' + Math.round(el.getBoundingClientRect().width));
                });
                console.error('OVERFLOW', viewport.width, overflow, JSON.stringify(detail));
            }
            assert(overflow <= 0, `No horizontal overflow at ${viewport.width}px, got ${overflow}px`);

            const hero = await page.locator('.hero-title').boundingBox();
            assert(hero.x >= 0 && hero.x + hero.width <= viewport.width + 1, `Hero fits at ${viewport.width}px`);

            const size = await page.locator('.hero-title').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
            assert(size >= 30 && size <= 120, `Hero size sane at ${viewport.width}px, got ${size}px`);

            // Anchor targets must clear the sticky header
            for (const id of ['tentang', 'jadwal', 'dokumentasi', 'gabung']) {
                await page.evaluate((target) => {
                    window.location.hash = '';
                    window.location.hash = target;
                }, id);
                await page.waitForFunction(() => {
                    const settled = window.__settledY === Math.round(window.scrollY);
                    window.__settledY = Math.round(window.scrollY);
                    return settled;
                }, null, { timeout: 5000, polling: 100 }).catch(() => {});
                const clear = await page.evaluate((target) => {
                    const header = document.querySelector('.site-header').getBoundingClientRect();
                    const section = document.getElementById(target).getBoundingClientRect();
                    return section.top >= header.bottom - 2;
                }, id);
                if (!clear) {
                    const detail = await page.evaluate((t) => {
                        const h = document.querySelector('.site-header').getBoundingClientRect();
                        const s = document.getElementById(t).getBoundingClientRect();
                        return { headerBottom: Math.round(h.bottom), headerH: Math.round(h.height), sectionTop: Math.round(s.top), hash: location.hash, scrollY: Math.round(scrollY) };
                    }, id);
                    console.error('ANCHOR', viewport.width, id, JSON.stringify(detail));
                }
                assert(clear, `#${id} clears the sticky header at ${viewport.width}px`);
            }

            await page.screenshot({ path: path.join(output, `redesign-${viewport.width}.png`), fullPage: true });
            await page.close();
        }
        console.log('PASS content, schedule, contrast, layout at 1440/1024/768/390/320');

        const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
        await reduced.goto(base, { waitUntil: 'domcontentloaded' });
        assert.equal(await reduced.locator('.hero-line').first().evaluate((el) => getComputedStyle(el).animationName), 'none');
        await reduced.close();
        console.log('PASS reduced motion');

        for (const width of [320, 390]) {
            const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 844 } });
            await nojs.goto(base, { waitUntil: 'domcontentloaded' });
            assert(await nojs.locator('.site-nav').isVisible(), 'Navigation visible without JS');
            assert.equal(await nojs.locator('.session').count(), 5, 'All sessions present without JS');
            const question = nojs.locator('.faq details').first();
            const answer = question.locator('p');
            assert.equal(await answer.isVisible(), false, 'FAQ starts collapsed');
            await question.locator('summary').press('Enter');
            assert(await answer.isVisible(), 'FAQ opens with keyboard without JS');
            await question.locator('summary').press('Space');
            assert.equal(await answer.isVisible(), false, 'FAQ closes with keyboard');
            await nojs.close();
        }
        console.log('PASS no-JavaScript fallback');

        assert.deepEqual(errors, [], 'No browser or HTTP errors');
    } finally {
        if (browser) await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
})().catch((error) => { console.error(error); process.exitCode = 1; });
