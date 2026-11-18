'use strict';

document.documentElement.classList.add('js');

const hero = document.querySelector('.hero');
const cloudLayer = document.querySelector('.hero-clouds');
if (hero && cloudLayer && 'IntersectionObserver' in window) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let current = 0;
    let target = 0;
    let visible = false;
    let lastTime = 0;
    const paintClouds = () => {
        cloudLayer.style.setProperty('--cloud-shift', current.toFixed(2) + 'px');
        cloudLayer.style.setProperty('--cloud-scale', (current / 280).toFixed(4));
    };
    const stopClouds = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
    };
    const animateClouds = time => {
        const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
        lastTime = time;
        current += (target - current) * (1 - Math.exp(-elapsed / 100));
        if (Math.abs(target - current) < .1) {
            current = target;
            frame = 0;
            lastTime = 0;
        } else {
            frame = requestAnimationFrame(animateClouds);
        }
        paintClouds();
    };
    const updateTarget = () => {
        const bounds = hero.getBoundingClientRect();
        target = Math.min(1, Math.max(0, -bounds.top / bounds.height)) * 280;
        if (!frame && Math.abs(target - current) >= .1) frame = requestAnimationFrame(animateClouds);
    };
    const syncClouds = () => {
        window.removeEventListener('scroll', updateTarget);
        window.removeEventListener('resize', updateTarget);
        stopClouds();
        if (reducedMotion.matches) {
            current = target = 0;
            paintClouds();
        } else if (visible) {
            window.addEventListener('scroll', updateTarget, { passive: true });
            window.addEventListener('resize', updateTarget, { passive: true });
            updateTarget();
        }
    };
    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        syncClouds();
    });
    reducedMotion.addEventListener('change', syncClouds);
    paintClouds();
    observer.observe(hero);
}

const navigation = document.getElementById('navigation');
const menuToggle = document.querySelector('.menu-toggle');
const mobileViewport = window.matchMedia('(max-width: 760px)');

function closeMenu() {
    navigation.classList.toggle('is-collapsed', mobileViewport.matches);
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
}
menuToggle.hidden = false;
closeMenu();
mobileViewport.addEventListener('change', closeMenu);
menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-collapsed', !expanded);
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.textContent = expanded ? 'Tutup' : 'Menu';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuToggle.focus();
    }
});

const dialog = document.getElementById('joinModal');
const closeButton = document.getElementById('closeModal');
let opener;
if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('.join-trigger').forEach(link => {
        link.setAttribute('aria-haspopup', 'dialog');
        link.setAttribute('aria-controls', 'joinModal');
        link.addEventListener('click', event => {
            event.preventDefault();
            opener = link;
            closeMenu();
            dialog.showModal();
            dialog.scrollTop = 0;
            document.body.classList.add('modal-open');
        });
    });
    closeButton.addEventListener('click', () => dialog.close());
    let backdropPointerDown = false;
    function outsideDialog(event) {
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    dialog.addEventListener('pointerdown', event => { backdropPointerDown = outsideDialog(event); });
    dialog.addEventListener('click', event => {
        if (event.target === dialog && backdropPointerDown && outsideDialog(event)) dialog.close();
        backdropPointerDown = false;
    });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        if (opener && opener.isConnected) {
            const focusTarget = opener.getClientRects().length ? opener : menuToggle;
            focusTarget.focus({ preventScroll: true });
        }
    });
}

document.getElementById('year').textContent = new Date().getFullYear();
const modalPoster = document.querySelector('.full-poster img');
function posterFailed() {
    modalPoster.parentElement.hidden = true;
    document.getElementById('poster-error').hidden = false;
}
modalPoster.addEventListener('error', posterFailed);
if (modalPoster.complete && modalPoster.naturalWidth === 0) posterFailed();
