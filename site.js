'use strict';

document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Jeda animasi CSS objek panggung saat keluar layar
const stageEl = document.querySelector('.interactive-stage');
if (stageEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
        stageEl.classList.toggle('is-offscreen', !entries[0].isIntersecting);
    }).observe(stageEl);
}

// =========================================
// 1. NAVIGASI MOBILE & HELPER DIALOG
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
