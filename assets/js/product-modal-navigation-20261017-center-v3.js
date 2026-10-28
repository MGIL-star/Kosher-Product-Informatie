(() => {
  'use strict';

  const dialog = document.querySelector('#product-dialog');
  const host = document.querySelector('#product-detail, #dialog-content');
  if (!dialog || !host) return;

  let activeKey = null;
  const cardsSelector = '#product-grid [data-product-id], #products .product-open[data-product]';
  const nav = document.createElement('nav');
  nav.className = 'product-dialog-navigation';
  nav.setAttribute('aria-label', 'Navigeren tussen producten');
  nav.innerHTML = '<button type="button" class="product-dialog-nav-button" data-product-nav="previous" aria-label="Vorig product" title="Vorig product"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14.5 5-7 7 7 7"/></svg></button><button type="button" class="product-dialog-nav-button" data-product-nav="next" aria-label="Volgend product" title="Volgend product"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.5 5 7 7-7 7"/></svg></button>';
  dialog.insertBefore(nav, host);

  const keyOf = button => button?.dataset.product || button?.dataset.productId || null;
  const visibleCards = () => [...document.querySelectorAll(cardsSelector)].filter(button => {
    const style = getComputedStyle(button);
    return !button.disabled && button.getClientRects().length > 0 && style.visibility !== 'hidden';
  });

  function placeNavigation() {
    const photo = host.querySelector('.dialog-product .product-visual-large');
    if (!photo) return;
    if (nav.parentElement !== photo) photo.append(nav);
    photo.classList.add('product-navigation-photo-anchor');
  }

  function update() {
    placeNavigation();
    const cards = visibleCards();
    const index = cards.findIndex(button => keyOf(button) === activeKey);
    const hasSequence = cards.length > 1 && index !== -1;
    nav.hidden = !dialog.open || !hasSequence;
    nav.querySelector('[data-product-nav="previous"]').disabled = index <= 0;
    nav.querySelector('[data-product-nav="next"]').disabled = index < 0 || index >= cards.length - 1;
  }

  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest(cardsSelector) : null;
    if (!button) return;
    activeKey = keyOf(button);
    requestAnimationFrame(update);
  }, true);

  function navigate(direction) {
    const cards = visibleCards();
    const index = cards.findIndex(button => keyOf(button) === activeKey);
    const target = cards[index + (direction === 'next' ? 1 : -1)];
    if (!target) return;
    activeKey = keyOf(target);
    target.click();
    requestAnimationFrame(update);
  }

  nav.addEventListener('click', event => {
    const direction = event.target.closest('[data-product-nav]')?.dataset.productNav;
    if (direction) navigate(direction);
  });

  let touchStart = null;
  dialog.addEventListener('touchstart', event => {
    if (!window.matchMedia('(max-width: 639px)').matches || !event.target.closest('.product-visual-large')) return;
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  dialog.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    navigate(deltaX < 0 ? 'next' : 'previous');
  }, { passive: true });
  dialog.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  dialog.addEventListener('close', () => {
    activeKey = null;
    update();
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  window.addEventListener('resize', () => requestAnimationFrame(update), { passive: true });
  new MutationObserver(update).observe(host, { childList: true, subtree: true });
})();
