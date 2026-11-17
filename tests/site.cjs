const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
const server = http.createServer((req, res) => {
    const name = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end(); return;
    }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    let browser;
    try {
        browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium'), headless: true });
        const errors = [];
        const resized = await browser.newPage({ viewport:{width:1024,height:768}, reducedMotion:'reduce' });
        await resized.goto(base);
        for (const year of ['2007','2012']) {
            assert.equal(await resized.locator('main').evaluate((el, value) => el.textContent.split(value).length - 1, year), 1, `${year} appears only once in main content`);
            assert((await resized.locator('.history').textContent()).includes(year), `${year} remains in the history`);
        }
        assert((await resized.locator('.history').textContent()).includes('4 September'), 'History preserves the founding date');
        for (const scenario of [
            { from:{width:1024,height:768}, to:{width:390,height:844}, trigger:'.navigation .join-trigger', focus:'.menu-toggle' },
            { from:{width:390,height:844}, to:{width:1024,height:768}, trigger:'.navigation .join-trigger', focus:'.navigation .join-trigger' },
            { from:{width:1024,height:768}, to:{width:390,height:844}, trigger:'.hero-actions .join-trigger', focus:'.hero-actions .join-trigger' }
        ]) {
            await resized.setViewportSize(scenario.from);
            if (scenario.from.width <= 760) await resized.locator('.menu-toggle').click();
            await resized.locator(scenario.trigger).click();
            await resized.setViewportSize(scenario.to);
            await resized.waitForFunction(() => document.querySelector('.navigation').classList.contains('is-collapsed') === (innerWidth <= 760));
            await resized.keyboard.press('Escape');
            await resized.waitForFunction(() => !document.body.classList.contains('modal-open'));
            assert(await resized.locator(scenario.focus).evaluate(el => document.activeElement === el && el.getClientRects().length > 0), `Visible focus restored after ${scenario.from.width} to ${scenario.to.width} resize from ${scenario.trigger}`);
        }
        await resized.close();
        console.log('PASS focus restoration across desktop/mobile resize');
        for (const viewport of [{width:1440,height:1000},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
            const context = await browser.newContext({ viewport });
            const page = await context.newPage();
            page.on('pageerror', error => errors.push(error.message));
            page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url()); });
            await page.goto(base);
            assert.equal(await page.locator('.site-header').evaluate(el => getComputedStyle(el).position), 'sticky', 'Header remains sticky with JS');
            await page.evaluate(() => document.fonts.ready);
            assert(await page.locator('.hero-poster').evaluate(img => img.complete && img.naturalWidth > 0), 'Hero poster loads');
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${viewport.width}`);
            if (viewport.width <= 760) {
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
            assert(await dialog.evaluate(d => d.open));
            const bounds = await dialog.boundingBox();
            assert(Math.abs(bounds.x + bounds.width / 2 - viewport.width / 2) < 2, 'Dialog horizontally centered');
            assert(bounds.y >= 0 && bounds.y + bounds.height <= viewport.height + 1, 'Dialog fits viewport');
            assert(await dialog.evaluate(d => d.scrollWidth <= d.clientWidth), 'No dialog horizontal overflow');
            assert(await page.locator('.full-poster img').evaluate(img => img.complete && img.naturalWidth > 0), 'Modal poster loads');
            await page.screenshot({ path: path.join(output, `modal-${viewport.width}x${viewport.height}.png`) });
            await page.locator('.contact-button').scrollIntoViewIfNeeded();
            const cta = await page.locator('.contact-button').boundingBox();
            assert(cta.y >= bounds.y && cta.y + cta.height <= bounds.y + bounds.height + 1, 'Registration CTA reachable by scrolling');
            assert(await page.locator('.modal-toolbar').evaluate(el => {const r=el.getBoundingClientRect();return r.y>=0&&r.bottom<=innerHeight;}), 'Close toolbar remains reachable');
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => !document.body.classList.contains('modal-open'));
            assert.equal(await dialog.evaluate(d => d.open), false);
            assert.equal(await page.evaluate(() => document.body.classList.contains('modal-open')), false);
            assert.equal(await page.evaluate(() => document.activeElement === document.querySelector(innerWidth <= 760 ? '.menu-toggle' : '.navigation .join-trigger')), true, 'Focus restored');
            await page.locator('.hero-actions .join-trigger').click();
            await page.waitForTimeout(300);
            await page.locator('#closeModal').click();
            assert.equal(await dialog.evaluate(d => d.open), false, 'Close button works');
            await page.locator('.hero-actions .join-trigger').click();
            await page.waitForTimeout(300);
            await page.mouse.click(2, 2);
            assert.equal(await dialog.evaluate(d => d.open), false, 'Backdrop closes dialog');
            await page.screenshot({ path: path.join(output, `page-${viewport.width}x${viewport.height}.png`), fullPage: true });
            console.log(`PASS ${viewport.width}x${viewport.height}: layout, posters, menu, modal bounds, scroll, closing, focus`);
            await context.close();
        }
        const reduced = await browser.newPage({ viewport: {width:390,height:844}, reducedMotion:'reduce' });
        await reduced.goto(base);
        assert.equal(await reduced.locator('.hero-copy').evaluate(el => getComputedStyle(el).animationName), 'none');
        assert.equal(await reduced.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
        await reduced.close();
        console.log('PASS reduced motion');
        for (const width of [320,390]) {
            const nojs = await browser.newPage({ javaScriptEnabled:false, viewport:{width,height:844}, reducedMotion:'reduce' });
            await nojs.goto(base);
            assert(await nojs.locator('.navigation').isVisible(), 'Navigation visible without JS');
            await nojs.locator('.navigation .join-trigger').click();
            assert(new URL(nojs.url()).hash === '#pendaftaran', 'Registration fallback accessible');
            await nojs.waitForFunction(() => window.scrollY > 0);
            assert(await nojs.evaluate(() => {
                const header = document.querySelector('.site-header').getBoundingClientRect();
                const title = document.querySelector('#recruitment-title').getBoundingClientRect();
                return title.top >= Math.max(0,header.bottom) && title.bottom <= innerHeight;
            }), `Recruitment title is visible below header without JS at ${width}px`);
            await nojs.close();
        }
        console.log('PASS no-JavaScript fallback and visible anchor targets');
        assert.deepEqual(errors, [], 'No browser JavaScript or local HTTP errors');
    } finally {
        if (browser) await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
