'use strict';

document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = window.innerWidth <= 768;

// =========================================
// 1. CLOUD ENGINE HEMAT CPU (PRE-BAKED CANVAS + INTERSECTION OBSERVER)
// =========================================
(function initClouds() {
    const hero = document.querySelector('.hero');
    const stage = document.getElementById('cloud-stage');
    const defsSource = document.querySelector('#cloud-svg-defs defs');
    if (!hero || !stage) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const cloudConfigs = [
        {
            width: '44vw', minWidth: 220, maxWidth: 640,
            baseX: -10, baseY: 6, travelX: 32, travelY: -8, depth: 0.45,
            scaleStart: 0.9, scaleEnd: 1.02, opacity: 0.5,
            filter: 'url(#cumulus-fluff-mid)', mobileShow: false,
            puffs: [
                { cx: 30, cy: 58, rx: 22, ry: 14, fill: 'url(#cloud-grad-soft)' },
                { cx: 52, cy: 48, rx: 26, ry: 19, fill: 'url(#cloud-grad-soft)' },
                { cx: 70, cy: 56, rx: 22, ry: 15, fill: 'url(#cloud-grad-soft)' }
            ]
        },
        {
            width: '62vw', minWidth: 280, maxWidth: 940,
            baseX: 8, baseY: 38, mobileX: -8, mobileY: 22,
            travelX: -42, travelY: -16, depth: 1.0,
            scaleStart: 0.95, scaleEnd: 1.14, opacity: 0.88,
            filter: 'url(#cumulus-fluff-heavy)', mobileShow: true,
            puffs: [
                { cx: 50, cy: 62, rx: 38, ry: 18, fill: 'url(#cloud-grad-bright)' },
                { cx: 26, cy: 64, rx: 19, ry: 13, fill: 'url(#cloud-grad-bright)' },
                { cx: 74, cy: 63, rx: 20, ry: 14, fill: 'url(#cloud-grad-bright)' },
                { cx: 48, cy: 67, rx: 34, ry: 13, fill: 'url(#cloud-shadow-core)' },
                { cx: 50, cy: 38, rx: 22, ry: 20, fill: 'url(#cloud-grad-bright)' },
                { cx: 36, cy: 48, rx: 19, ry: 16, fill: 'url(#cloud-grad-bright)' },
                { cx: 64, cy: 46, rx: 20, ry: 17, fill: 'url(#cloud-grad-bright)' },
                { cx: 53, cy: 31, rx: 15, ry: 13, fill: 'url(#cloud-highlight-puff)' }
            ]
        },
        {
            width: '54vw', minWidth: 260, maxWidth: 800,
            baseX: 56, baseY: 50, mobileX: 34, mobileY: 54,
            travelX: -54, travelY: -15, depth: 0.85,
            scaleStart: 0.92, scaleEnd: 1.1, opacity: 0.84,
            filter: 'url(#cumulus-fluff-heavy)', mobileShow: true,
            puffs: [
                { cx: 48, cy: 60, rx: 34, ry: 16, fill: 'url(#cloud-grad-bright)' },
                { cx: 30, cy: 62, rx: 18, ry: 12, fill: 'url(#cloud-grad-bright)' },
                { cx: 68, cy: 61, rx: 19, ry: 13, fill: 'url(#cloud-grad-bright)' },
                { cx: 46, cy: 43, rx: 20, ry: 16, fill: 'url(#cloud-grad-bright)' },
                { cx: 58, cy: 46, rx: 18, ry: 15, fill: 'url(#cloud-grad-bright)' },
                { cx: 48, cy: 36, rx: 14, ry: 12, fill: 'url(#cloud-highlight-puff)' }
            ]
        },
        {
            width: '52vw', minWidth: 260, maxWidth: 760,
            baseX: -14, baseY: 62, mobileX: -18, mobileY: 66,
            travelX: 48, travelY: -14, depth: 0.9,
            scaleStart: 0.94, scaleEnd: 1.12, opacity: 0.82,
            filter: 'url(#cumulus-fluff-mid)', mobileShow: true,
            puffs: [
                { cx: 34, cy: 55, rx: 22, ry: 14, fill: 'url(#cloud-grad-soft)' },
                { cx: 54, cy: 50, rx: 25, ry: 16, fill: 'url(#cloud-grad-bright)' },
                { cx: 72, cy: 58, rx: 19, ry: 12, fill: 'url(#cloud-grad-soft)' },
                { cx: 52, cy: 63, rx: 28, ry: 11, fill: 'url(#cloud-shadow-core)' }
            ]
        },
        {
            width: '58vw', minWidth: 280, maxWidth: 880,
            baseX: 34, baseY: 70, mobileX: 28, mobileY: 74,
            travelX: -36, travelY: -16, depth: 1.2,
            scaleStart: 0.96, scaleEnd: 1.16, opacity: 0.88,
            filter: 'url(#cumulus-fluff-heavy)', mobileShow: true,
            puffs: [
                { cx: 50, cy: 60, rx: 36, ry: 16, fill: 'url(#cloud-grad-bright)' },
                { cx: 32, cy: 56, rx: 20, ry: 14, fill: 'url(#cloud-grad-bright)' },
                { cx: 66, cy: 54, rx: 21, ry: 15, fill: 'url(#cloud-grad-bright)' },
                { cx: 48, cy: 41, rx: 22, ry: 17, fill: 'url(#cloud-grad-bright)' },
                { cx: 50, cy: 33, rx: 15, ry: 12, fill: 'url(#cloud-highlight-puff)' }
            ]
        },
        {
            width: '46vw', minWidth: 250, maxWidth: 700,
            baseX: 68, baseY: 75, mobileX: -12, mobileY: 83,
            travelX: 42, travelY: -12, depth: 0.75,
            scaleStart: 0.9, scaleEnd: 1.08, opacity: 0.78,
            filter: 'url(#cumulus-fluff-mid)', mobileShow: true,
            puffs: [
                { cx: 38, cy: 56, rx: 24, ry: 14, fill: 'url(#cloud-grad-soft)' },
                { cx: 58, cy: 48, rx: 25, ry: 17, fill: 'url(#cloud-grad-bright)' },
                { cx: 74, cy: 58, rx: 18, ry: 12, fill: 'url(#cloud-grad-soft)' }
            ]
        },
        {
            width: '36vw', minWidth: 240, maxWidth: 520,
            baseX: 60, baseY: 14, mobileX: 38, mobileY: 88,
            travelX: -28, travelY: -10, depth: 0.65,
            scaleStart: 0.92, scaleEnd: 1.06, opacity: 0.74,
            filter: 'url(#cumulus-fluff-mid)', mobileShow: true,
            puffs: [
                { cx: 36, cy: 56, rx: 22, ry: 13, fill: 'url(#cloud-grad-soft)' },
                { cx: 54, cy: 46, rx: 24, ry: 17, fill: 'url(#cloud-grad-bright)' },
                { cx: 70, cy: 55, rx: 19, ry: 13, fill: 'url(#cloud-grad-soft)' }
            ]
        }
    ];

    function bakeCloudCanvas(cfg) {
        const size = isMobile ? 260 : 420;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.className = 'cloud-canvas';

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('xmlns', SVG_NS);
        svg.setAttribute('width', String(size));
        svg.setAttribute('height', String(size));
        svg.setAttribute('viewBox', '-35 -35 170 170');

        if (defsSource) svg.appendChild(defsSource.cloneNode(true));

        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('filter', cfg.filter);

        cfg.puffs.forEach((p) => {
            const el = document.createElementNS(SVG_NS, 'ellipse');
            el.setAttribute('cx', p.cx);
            el.setAttribute('cy', p.cy);
            el.setAttribute('rx', p.rx);
            el.setAttribute('ry', p.ry);
            el.setAttribute('fill', p.fill);
            group.appendChild(el);
        });

        svg.appendChild(group);
        const svgStr = new XMLSerializer().serializeToString(svg);
        const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }));

        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
        };
        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;

        return canvas;
    }

    const activeConfigs = isMobile ? cloudConfigs.filter((c) => c.mobileShow) : cloudConfigs;
    const clouds = activeConfigs.map((cfg) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'cloud-cluster';
        wrapper.style.width = `clamp(${cfg.minWidth}px, ${cfg.width}, ${cfg.maxWidth}px)`;
        const x = isMobile && cfg.mobileX !== undefined ? cfg.mobileX : cfg.baseX;
        const y = isMobile && cfg.mobileY !== undefined ? cfg.mobileY : cfg.baseY;
        wrapper.style.left = `${x}%`;
        wrapper.style.top = `${y}%`;
        wrapper.style.opacity = cfg.opacity;
        wrapper.appendChild(bakeCloudCanvas(cfg));
        stage.appendChild(wrapper);
        return { el: wrapper, cfg };
    });

    let current = 0;
    let target = 0;
    let currentPx = 0;
    let currentPy = 0;
    let targetPx = 0;
    let targetPy = 0;
    let rafId = 0;
    let heroVisible = false;

    function paint() {
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;
        for (let i = 0; i < clouds.length; i++) {
            const { el, cfg } = clouds[i];
            const depth = cfg.depth || 1;
            const dx = (cfg.travelX / 100) * w * current + currentPx * 24 * depth;
            const dy = (cfg.travelY / 100) * h * current + currentPy * 14 * depth;
            const sc = cfg.scaleStart + (cfg.scaleEnd - cfg.scaleStart) * current;
            el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
        }
    }

    function tick() {
        const diff = target - current;
        const diffPx = targetPx - currentPx;
        const diffPy = targetPy - currentPy;
        current += diff * 0.1;
        currentPx += diffPx * 0.08;
        currentPy += diffPy * 0.08;
        if (Math.abs(diff) < 0.0008 && Math.abs(diffPx) < 0.001 && Math.abs(diffPy) < 0.001) {
            current = target;
            currentPx = targetPx;
            currentPy = targetPy;
            paint();
            rafId = 0;
            return;
        }
        paint();
        rafId = requestAnimationFrame(tick);
    }

    function onScroll() {
        if (!heroVisible || prefersReducedMotion.matches) return;
        const rect = hero.getBoundingClientRect();
        target = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function onPointerMove(event) {
        if (!heroVisible || prefersReducedMotion.matches) return;
        targetPx = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        targetPy = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    prefersReducedMotion.addEventListener('change', () => {
        if (prefersReducedMotion.matches) {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
            }
            current = 0;
            target = 0;
            currentPx = 0;
            currentPy = 0;
            targetPx = 0;
            targetPy = 0;
            paint();
        } else {
            onScroll();
        }
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            heroVisible = entries[0].isIntersecting;
            if (heroVisible) {
                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('pointermove', onPointerMove, { passive: true });
                window.addEventListener('pointerdown', onPointerMove, { passive: true });
                onScroll();
            } else {
                window.removeEventListener('scroll', onScroll);
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerdown', onPointerMove);
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = 0;
                }
            }
        });
        observer.observe(hero);
    }
    paint();
})();

// =========================================
// 2. ANIMASI GSAP OBJEK INTERAKTIF (AUTO-PAUSE SAAT OFF-SCREEN & REDUCED MOTION)
// =========================================
(function initInteractiveObjects() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
        const idleTweens = [
            gsap.to('.paper-plane img', {
                y: -11,
                rotation: 2,
                duration: 2.1,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            }),
            gsap.to('.dove img', {
                y: -13,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            }),
            gsap.to('.daisy img', {
                rotation: 7,
                transformOrigin: 'bottom center',
                duration: 1.7,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            })
        ];

        const stageEl = document.querySelector('.interactive-stage');
        if (!stageEl || !('IntersectionObserver' in window)) return;
        const stageObserver = new IntersectionObserver((entries) => {
            const visible = entries[0].isIntersecting;
            idleTweens.forEach((tw) => (visible ? tw.play() : tw.pause()));
        });
        stageObserver.observe(stageEl);
        return () => stageObserver.disconnect();
    });

    mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.to('.paper-plane', {
            x: () => Math.min(180, window.innerWidth * 0.14),
            y: -26,
            rotation: 10,
            ease: 'none',
            scrollTrigger: {
                trigger: '.interactive-stage',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                invalidateOnRefresh: true
            }
        });

        gsap.to('.dove', {
            x: () => -Math.min(130, window.innerWidth * 0.1),
            y: -24,
            rotation: -6,
            ease: 'none',
            scrollTrigger: {
                trigger: '.interactive-stage',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    });

    mm.add('(max-width: 760px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.to('.paper-plane', {
            x: 20,
            y: -22,
            rotation: 9,
            ease: 'none',
            scrollTrigger: {
                trigger: '.interactive-stage',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        gsap.to('.dove', {
            x: -18,
            y: -18,
            rotation: -6,
            ease: 'none',
            scrollTrigger: {
                trigger: '.interactive-stage',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
})();

// =========================================
// 3. NAVIGASI MOBILE & HELPER DIALOG
// =========================================
const navigation = document.getElementById('navigation');
const menuToggle = document.querySelector('.menu-toggle');
const mobileViewport = window.matchMedia('(max-width: 900px)');

function closeMenu() {
    if (!navigation || !menuToggle) return;
    navigation.classList.toggle('is-collapsed', mobileViewport.matches);
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
}

function restoreTriggerFocus(opener) {
    if (!opener) return;
    if (mobileViewport.matches && navigation?.contains(opener) && menuToggle) {
        menuToggle.focus();
        return;
    }
    opener.focus();
}

function bindDialog(dialog, triggerSelector, closeSelector, onBeforeOpen, onAfterClose) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    let opener;
    document.querySelectorAll(triggerSelector).forEach((trigger) => {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', dialog.id);
        trigger.addEventListener('click', (event) => {
            if (onBeforeOpen && onBeforeOpen(trigger) === false) return;
            event.preventDefault();
            opener = trigger;
            closeMenu();
            dialog.showModal();
            dialog.scrollTop = 0;
            document.body.classList.add('modal-open');
        });
    });
    dialog.querySelector(closeSelector)?.addEventListener('click', () => dialog.close());
    const isOutsideDialog = (event) => {
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom;
    };
    let backdropPointerDown = false;
    dialog.addEventListener('pointerdown', (event) => { backdropPointerDown = isOutsideDialog(event); });
    dialog.addEventListener('pointerup', (event) => {
        if (backdropPointerDown && isOutsideDialog(event)) dialog.close();
        backdropPointerDown = false;
    });
    dialog.addEventListener('pointercancel', () => { backdropPointerDown = false; });
    dialog.addEventListener('close', () => {
        onAfterClose?.();
        document.body.classList.remove('modal-open');
        restoreTriggerFocus(opener);
    });
}

if (navigation && menuToggle) {
    menuToggle.hidden = false;
    closeMenu();
    mobileViewport.addEventListener('change', closeMenu);
    menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
        navigation.classList.toggle('is-collapsed', !expanded);
        menuToggle.setAttribute('aria-expanded', String(expanded));
        menuToggle.textContent = expanded ? 'Tutup' : 'Menu';
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            menuToggle.focus();
        }
    });
}

// =========================================
// 4. CERITA INTERAKTIF & DIALOG PENDAFTARAN
// =========================================
const storyDialog = document.getElementById('storyModal');
const storyContent = document.getElementById('storyContent');
const storyBody = document.getElementById('storyModalBody');
const storyTitle = document.getElementById('story-title');
const storyPanels = [...document.querySelectorAll('[data-story-panel]')];
const storyTitles = { sejarah: 'Where It Began', nilai: 'Our Little World', kegiatan: 'What We Do' };

if (storyDialog && storyContent && storyBody && storyTitle && storyPanels.length === 3 && typeof storyDialog.showModal === 'function') {
    storyBody.append(...storyPanels);
    storyContent.hidden = true;
    storyPanels.forEach((panel) => { panel.hidden = true; });

    bindDialog(
        storyDialog,
        '[data-story]',
        '[data-close-story]',
        (trigger) => {
            const key = trigger.dataset.story;
            if (!storyTitles[key]) return false;
            storyPanels.forEach((panel) => { panel.hidden = panel.dataset.storyPanel !== key; });
            storyTitle.textContent = storyTitles[key];
            return true;
        },
        () => {
            storyPanels.forEach((panel) => { panel.hidden = true; });
        }
    );
}

bindDialog(document.getElementById('joinModal'), '.join-trigger', '[data-close-dialog]');

// =========================================
// 6. TAHUN DINAMIS, FALLBACK POSTER & FLY UP
// =========================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const modalPoster = document.querySelector('.full-poster img');
if (modalPoster) {
    const posterFailed = () => {
        modalPoster.parentElement.hidden = true;
        const err = document.getElementById('poster-error');
        if (err) err.hidden = false;
    };
    modalPoster.addEventListener('error', posterFailed);
    if (modalPoster.complete && modalPoster.naturalWidth === 0) posterFailed();
}

const flyUpBtn = document.getElementById('flyUpBtn');
if (flyUpBtn) {
    flyUpBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
}
