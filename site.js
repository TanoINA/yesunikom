'use strict';

document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = window.matchMedia('(max-width: 760px)').matches;
let setStageAnimationPaused = () => {};

// =========================================
// 1. CLOUD ENGINE STATIS (PRE-BAKED CANVAS 1X, TANPA PARALLAX)
// =========================================
(function initClouds() {
    const stage = document.getElementById('cloud-stage');
    const defsSource = document.querySelector('#cloud-svg-defs defs');
    if (!stage) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const cloudConfigs = [
        {
            width: '44vw', minWidth: 220, maxWidth: 640,
            baseX: -10, baseY: 6, opacity: 0.5,
            filter: 'url(#cumulus-fluff-mid)', mobileShow: false,
            puffs: [
                { cx: 30, cy: 58, rx: 22, ry: 14, fill: 'url(#cloud-grad-soft)' },
                { cx: 52, cy: 48, rx: 26, ry: 19, fill: 'url(#cloud-grad-soft)' },
                { cx: 70, cy: 56, rx: 22, ry: 15, fill: 'url(#cloud-grad-soft)' }
            ]
        },
        {
            width: '62vw', minWidth: 280, maxWidth: 940,
            baseX: 8, baseY: 38, mobileX: -8, mobileY: 22, opacity: 0.88,
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
            baseX: 56, baseY: 50, mobileX: 34, mobileY: 54, opacity: 0.84,
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
            baseX: -14, baseY: 62, mobileX: -18, mobileY: 66, opacity: 0.82,
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
            baseX: 34, baseY: 70, mobileX: 28, mobileY: 74, opacity: 0.88,
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
            baseX: 68, baseY: 75, mobileX: -12, mobileY: 83, opacity: 0.78,
            filter: 'url(#cumulus-fluff-mid)', mobileShow: true,
            puffs: [
                { cx: 38, cy: 56, rx: 24, ry: 14, fill: 'url(#cloud-grad-soft)' },
                { cx: 58, cy: 48, rx: 25, ry: 17, fill: 'url(#cloud-grad-bright)' },
                { cx: 74, cy: 58, rx: 18, ry: 12, fill: 'url(#cloud-grad-soft)' }
            ]
        },
        {
            width: '36vw', minWidth: 240, maxWidth: 520,
            baseX: 60, baseY: 14, mobileX: 38, mobileY: 88, opacity: 0.74,
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
    activeConfigs.forEach((cfg) => {
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
    });
})();

// =========================================
// 2. ANIMASI GSAP OBJEK INTERAKTIF (AUTO-PAUSE SAAT OFF-SCREEN & REDUCED MOTION)
// =========================================
(function initInteractiveObjects() {
    if (typeof gsap === 'undefined') return;

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
        let stageVisible = true;
        let modalPaused = false;
        const syncPlayState = () => {
            const shouldPlay = stageVisible && !modalPaused;
            idleTweens.forEach((tw) => (shouldPlay ? tw.play() : tw.pause()));
        };
        setStageAnimationPaused = (paused) => {
            modalPaused = paused;
            syncPlayState();
        };
        const stageObserver = new IntersectionObserver((entries) => {
            stageVisible = entries[0].isIntersecting;
            syncPlayState();
        });
        stageObserver.observe(stageEl);
        return () => {
            stageObserver.disconnect();
            setStageAnimationPaused = () => {};
        };
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
            document.body.classList.add('modal-open');
            setStageAnimationPaused(true);
            dialog.showModal();
            dialog.scrollTop = 0;
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
        setStageAnimationPaused(false);
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
const storyIcon = document.getElementById('storyModalIcon');
const storyKicker = document.getElementById('storyModalKicker');
const storySub = document.getElementById('storyModalSub');
const storyPanels = [...document.querySelectorAll('[data-story-panel]')];
const storyTitles = { sejarah: 'Where It Began', nilai: 'Our Little World', kegiatan: 'What We Do' };
const storyMeta = {
    sejarah: {
        icon: 'assets/images/pesawat_kertas.png',
        kicker: 'WHERE IT BEGAN • SEJARAH YES',
        sub: 'Perjalanan komunitas debat bahasa Inggris sejak 2007 hingga menjadi UKM resmi UNIKOM.'
    },
    nilai: {
        icon: 'assets/images/burung_merpati.png',
        kicker: 'OUR LITTLE WORLD • VISI & 3 PILAR',
        sub: 'Ruang aman (Sanctuary) untuk bertumbuh dengan semangat kekeluargaan dan nilai PIQIE.'
    },
    kegiatan: {
        icon: 'assets/images/bunga.png',
        kicker: 'WHAT WE DO • KEGIATAN RUTIN',
        sub: 'Program mingguan dan bulanan untuk mengasah bahasa Inggris, komunikasi, dan kepemimpinan.'
    }
};

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
            if (storyMeta[key]) {
                if (storyIcon) storyIcon.src = storyMeta[key].icon;
                if (storyKicker) storyKicker.textContent = storyMeta[key].kicker;
                if (storySub) storySub.textContent = storyMeta[key].sub;
            }
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
