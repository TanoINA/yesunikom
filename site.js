'use strict';

document.documentElement.classList.add('js');

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
