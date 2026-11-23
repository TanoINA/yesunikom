const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    const name = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end();
        return;
    }
    res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
});

(async () => {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    let browser;
    try {
        browser = await chromium.launch({
            channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium'),
            headless: true
        });
        const errors = [];

        const resized = await browser.newPage({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
        resized.on('pageerror', (error) => errors.push(error.message));
        resized.on('response', (response) => {
            if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url());
        });
        await resized.goto(base);

        // Documentation & OpenGraph metadata
        assert.equal(await resized.locator('#dokumentasi .documentation-status').textContent(), 'Sedang disiapkan', 'Documentation is clearly marked as not yet available');
        assert.equal(await resized.locator('#dokumentasi').isVisible(), true, 'Documentation section remains visible when JS is active');
        assert.equal(await resized.locator('#dokumentasi img').count(), 0, 'No placeholder photographs presented as real activities');
        const shareImage = await resized.locator('meta[property="og:image"]').getAttribute('content');
        assert.equal(shareImage, 'https://tanoina.github.io/yesunikom/share-yes.png', 'Share image uses the public absolute URL');
        assert.equal(await resized.locator('meta[property="og:image:width"]').getAttribute('content'), '1200');
        assert.equal(await resized.locator('meta[property="og:image:height"]').getAttribute('content'), '630');
        assert.equal(await resized.locator('link[rel="canonical"]').getAttribute('href'), 'https://tanoina.github.io/yesunikom/');

        const imageResponse = await resized.request.get(`${base}/share-yes.png`);
        assert.equal(imageResponse.status(), 200, 'Share image can be served');
        assert.match(imageResponse.headers()['content-type'], /^image\/png/);
        const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
        assert.match(workflow, /\bshare-yes\.png\b/, 'Share image is included in the Pages artifact');
        assert.match(workflow, /\bassets\b/, 'Assets directory is included in the Pages artifact');
        const imageBuffer = await imageResponse.body();
        assert.equal(imageBuffer.readUInt32BE(16), 1200, 'Share PNG width');
        assert.equal(imageBuffer.readUInt32BE(20), 630, 'Share PNG height');

        // Favicon, QR registration link, and Story modals (pop-up only when JS is active)
        assert.equal(await resized.locator('#storyContent').isHidden(), true, 'Story content is hidden from scroll flow when JS is active');
        assert.equal(await resized.locator('link[rel="icon"]').getAttribute('href'), 'logo-yes.png', 'Favicon is configured');
        assert.equal(await resized.locator('#joinModal .contact-button').getAttribute('href'), 'https://q.me-qr.com/ecmae54w', 'Direct QR registration link is present');

        await resized.locator('.paper-plane').click();
        await resized.waitForFunction(() => document.getElementById('storyModal').open);
        assert.equal(await resized.locator('#story-title').textContent(), 'Where It Began');
        for (const year of ['2007', '2012']) {
            assert((await resized.locator('.history').innerText()).includes(year), `${year} remains in history`);
        }
        assert((await resized.locator('.history').innerText()).includes('4 September'), 'History preserves the founding date');
        await resized.mouse.click(2, 2);
        await resized.waitForFunction(() => !document.getElementById('storyModal').open);

        await resized.locator('.navigation [data-story="nilai"]').click();
        await resized.waitForFunction(() => document.getElementById('storyModal').open);
        assert.equal(await resized.locator('#story-title').textContent(), 'Our Little World');
        assert.match(await resized.locator('#tentang').innerText(), /Sanctuary/, 'About section includes the current vision');
        assert.deepEqual(await resized.locator('.focus-list h3').allTextContents(), ['English Skills', 'Communication', 'Leadership']);
        await resized.locator('[data-close-story]').click();
        await resized.waitForFunction(() => !document.getElementById('storyModal').open);

        await resized.locator('.navigation [data-story="kegiatan"]').click();
        await resized.waitForFunction(() => document.getElementById('storyModal').open);
        assert.equal(await resized.locator('#story-title').textContent(), 'What We Do');
        assert.deepEqual(await resized.locator('#kegiatan .schedule-row h3').allTextContents(), [
            'Forum Group Discussion (FGD)', 'Public Speaking Class', 'Debate Class', 'TOEFL Preparation Class'
        ]);
        assert.deepEqual(await resized.locator('#kegiatan .schedule-day').allTextContents(), [
            'Kamis15.30–17.30 WIB', 'Jumat15.30–17.30 WIB', 'BerkalaFlexible Day', 'BerkalaFlexible Day'
        ]);
        assert.deepEqual(await resized.locator('#kegiatan .monthly h4').allTextContents(), ['YES Goes Out', 'Sharing Session']);
        await resized.keyboard.press('Escape');
        await resized.waitForFunction(() => !document.getElementById('storyModal').open);

        // Focus restoration across desktop/mobile resize (900px nav breakpoint)
        for (const scenario of [
            { from: { width: 1024, height: 768 }, to: { width: 390, height: 844 }, trigger: '.navigation .join-trigger', focus: '.menu-toggle' },
            { from: { width: 390, height: 844 }, to: { width: 1024, height: 768 }, trigger: '.navigation .join-trigger', focus: '.navigation .join-trigger' },
            { from: { width: 1024, height: 768 }, to: { width: 390, height: 844 }, trigger: '.hero-actions .join-trigger', focus: '.hero-actions .join-trigger' }
        ]) {
            await resized.setViewportSize(scenario.from);
            if (scenario.from.width <= 900) await resized.locator('.menu-toggle').click();
            await resized.locator(scenario.trigger).click();
            await resized.setViewportSize(scenario.to);
            await resized.waitForFunction(() => document.querySelector('.navigation').classList.contains('is-collapsed') === (innerWidth <= 900));
            await resized.keyboard.press('Escape');
            await resized.waitForFunction(() => !document.body.classList.contains('modal-open'));
            assert(
                await resized.locator(scenario.focus).evaluate((el) => document.activeElement === el && el.getClientRects().length > 0),
                `Visible focus restored after ${scenario.from.width} to ${scenario.to.width} resize from ${scenario.trigger}`
            );
        }
        await resized.close();
        console.log('PASS story modals, documentation, metadata, and focus restoration');

        // Clouds + Interactive stage overlap checks
        for (const width of [1440, 390]) {
            const clouds = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'no-preference' });
            clouds.on('pageerror', (error) => errors.push(error.message));
            await clouds.goto(base);
            assert.equal(await clouds.locator('.hero-sky-bg').count(), 1, 'Hero contains a sky background');
            assert.equal(await clouds.locator('.hero-sky-bg').getAttribute('aria-hidden'), 'true', 'Sky is decorative');
            assert.equal(await clouds.locator('.hero-sky-bg').evaluate((el) => getComputedStyle(el).pointerEvents), 'none', 'Clouds do not intercept clicks');
            assert.equal(await clouds.locator('#cloud-stage .cloud-cluster').count(), width <= 768 ? 3 : 4, 'Responsive cloud count');
            await clouds.evaluate(() => document.fonts.ready);

            await clouds.locator('#jelajahi').scrollIntoViewIfNeeded();
            await clouds.waitForTimeout(450);
            const stageBounds = await clouds.evaluate(() => {
                const overlap = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
                const guide = document.querySelector('.stage-guide').getBoundingClientRect();
                const plane = document.querySelector('.paper-plane').getBoundingClientRect();
                const dove = document.querySelector('.dove').getBoundingClientRect();
                return {
                    planeOverlapsGuide: overlap(guide, plane),
                    doveOverlapsGuide: overlap(guide, dove),
                    planeOverlapsDove: overlap(plane, dove),
                    planeInView: plane.left >= 0 && plane.right <= innerWidth,
                    doveInView: dove.left >= 0 && dove.right <= innerWidth
                };
            });
            assert.equal(stageBounds.planeOverlapsGuide, false, `Paper plane clear of guide at ${width}px`);
            assert.equal(stageBounds.doveOverlapsGuide, false, `Dove clear of guide at ${width}px`);
            assert.equal(stageBounds.planeOverlapsDove, false, `Paper plane clear of dove at ${width}px`);
            assert.equal(stageBounds.planeInView, true, `Paper plane stays inside viewport at ${width}px`);
            assert.equal(stageBounds.doveInView, true, `Dove stays inside viewport at ${width}px`);
            await clouds.close();
        }
        console.log('PASS clouds and interactive stage layout');

        // Multi-viewport layout, assets, menu, and join modal checks
        for (const viewport of [
            { width: 1440, height: 1000 },
            { width: 1024, height: 768 },
            { width: 768, height: 1024 },
            { width: 390, height: 844 },
            { width: 320, height: 568 },
            { width: 844, height: 390 }
        ]) {
            const context = await browser.newContext({ viewport });
            const page = await context.newPage();
            page.on('pageerror', (error) => errors.push(error.message));
            page.on('response', (response) => {
                if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url());
            });
            await page.goto(base);
            assert.equal(await page.locator('.site-header').evaluate((el) => getComputedStyle(el).position), 'sticky', 'Header remains sticky with JS');
            await page.evaluate(() => document.fonts.ready);
            assert(await page.locator('.hero-poster').evaluate((img) => img.complete && img.naturalWidth > 0), 'Hero poster loads');
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${viewport.width}x${viewport.height}`);

            if (viewport.width <= 900) {
                await page.locator('.menu-toggle').click();
                assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
                await page.locator('.navigation .join-trigger').click();
                assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
            } else {
                assert.equal(await page.locator('.menu-toggle').isVisible(), false);
                await page.locator('.navigation .join-trigger').click();
            }

            await page.waitForTimeout(300);
            const dialog = page.locator('#joinModal');
            assert(await dialog.evaluate((d) => d.open));
            const bounds = await dialog.boundingBox();
            assert(Math.abs(bounds.x + bounds.width / 2 - viewport.width / 2) < 2, 'Dialog horizontally centered');
            assert(bounds.y >= 0 && bounds.y + bounds.height <= viewport.height + 1, 'Dialog fits viewport');
            assert(await dialog.evaluate((d) => d.scrollWidth <= d.clientWidth), 'No dialog horizontal overflow');
            assert(await page.locator('.full-poster img').evaluate((img) => img.complete && img.naturalWidth > 0), 'Modal poster loads');
            await page.screenshot({ path: path.join(output, `modal-${viewport.width}x${viewport.height}.png`) });
            await page.locator('.contact-button').scrollIntoViewIfNeeded();
            const cta = await page.locator('.contact-button').boundingBox();
            assert(cta.y >= bounds.y && cta.y + cta.height <= bounds.y + bounds.height + 1, 'Registration CTA reachable by scrolling');
            assert(await page.locator('#joinModal .modal-toolbar').evaluate((el) => {
                const r = el.getBoundingClientRect();
                return r.y >= 0 && r.bottom <= innerHeight;
            }), 'Close toolbar remains reachable');

            await page.keyboard.press('Escape');
            await page.waitForFunction(() => !document.body.classList.contains('modal-open'));
            assert.equal(await dialog.evaluate((d) => d.open), false);
            assert.equal(await page.evaluate(() => document.body.classList.contains('modal-open')), false);
            assert.equal(
                await page.evaluate(() => document.activeElement === document.querySelector(innerWidth <= 900 ? '.menu-toggle' : '.navigation .join-trigger')),
                true,
                'Focus restored'
            );

            await page.locator('.hero-actions .join-trigger').click();
            await page.waitForTimeout(300);
            await page.locator('[data-close-dialog]').click();
            assert.equal(await dialog.evaluate((d) => d.open), false, 'Close button works');

            await page.locator('.hero-actions .join-trigger').click();
            await page.waitForTimeout(300);
            await page.mouse.click(2, 2);
            assert.equal(await dialog.evaluate((d) => d.open), false, 'Backdrop closes dialog');
            await page.screenshot({ path: path.join(output, `page-${viewport.width}x${viewport.height}.png`), fullPage: true });
            console.log(`PASS ${viewport.width}x${viewport.height}: layout, posters, menu, modal bounds, scroll, closing, focus`);
            await context.close();
        }

        const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
        await reduced.goto(base);
        assert.equal(await reduced.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
        await reduced.close();
        console.log('PASS reduced motion');

        for (const width of [320, 390]) {
            const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 844 }, reducedMotion: 'reduce' });
            await nojs.goto(base);
            assert(await nojs.locator('.navigation').isVisible(), 'Navigation visible without JS');
            assert(await nojs.locator('#tentang').isVisible(), 'About section visible without JS');
            assert(await nojs.locator('#kegiatan').isVisible(), 'Activities section visible without JS');
            assert(await nojs.locator('.documentation-status').isVisible(), 'Documentation status is visible');
            const question = nojs.locator('.faq-list details').first();
            const answer = question.locator('p');
            assert.equal(await answer.isVisible(), false, 'FAQ answers start collapsed');
            await question.locator('summary').press('Enter');
            assert(await answer.isVisible(), 'FAQ opens with keyboard without JS');
            await question.locator('summary').press('Space');
            assert.equal(await answer.isVisible(), false, 'FAQ closes with keyboard');
            await nojs.locator('.navigation .join-trigger').click();
            assert(new URL(nojs.url()).hash === '#pendaftaran', 'Registration fallback accessible');
            await nojs.waitForFunction(() => window.scrollY > 0);
            assert(await nojs.evaluate(() => {
                const header = document.querySelector('.site-header').getBoundingClientRect();
                const title = document.querySelector('#recruitment-title').getBoundingClientRect();
                return title.top >= Math.max(0, header.bottom) && title.bottom <= innerHeight;
            }), `Recruitment title is visible below header without JS at ${width}px`);
            await nojs.close();
        }
        console.log('PASS no-JavaScript fallback and visible anchor targets');
        assert.deepEqual(errors, [], 'No browser JavaScript or local HTTP errors');
    } finally {
        if (browser) await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
