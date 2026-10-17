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
  nav.innerHTML = '<button type="button" class="product-dialog-nav-button" data-product-nav="previous" aria-label="Vorig product" title="Vorig product"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14.5 5-7 7 7 7"/></svg></button><span class="product-dialog-nav-count" aria-live="polite"></span><button type="button" class="product-dialog-nav-button" data-product-nav="next" aria-label="Volgend product" title="Volgend product"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.5 5 7 7-7 7"/></svg></button>';
  dialog.insertBefore(nav, host);

  const keyOf = button => button?.dataset.product || button?.dataset.productId || null;
  const visibleCards = () => [...document.querySelectorAll(cardsSelector)].filter(button => {
    const style = getComputedStyle(button);
    return !button.disabled && button.getClientRects().length > 0 && style.visibility !== 'hidden';
  });

  function update() {
    const cards = visibleCards();
    const index = cards.findIndex(button => keyOf(button) === activeKey);
    const hasSequence = cards.length > 1 && index !== -1;
    nav.hidden = !dialog.open || !hasSequence;
    nav.querySelector('[data-product-nav="previous"]').disabled = index <= 0;
    nav.querySelector('[data-product-nav="next"]').disabled = index < 0 || index >= cards.length - 1;
    nav.querySelector('.product-dialog-nav-count').textContent = hasSequence ? `${index + 1} / ${cards.length}` : '';
  }

  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest(cardsSelector) : null;
    if (!button) return;
    activeKey = keyOf(button);
    requestAnimationFrame(update);
  }, true);

  nav.addEventListener('click', event => {
    const direction = event.target.closest('[data-product-nav]')?.dataset.productNav;
    if (!direction) return;
    const cards = visibleCards();
    const index = cards.findIndex(button => keyOf(button) === activeKey);
    const target = cards[index + (direction === 'next' ? 1 : -1)];
    if (!target) return;
    activeKey = keyOf(target);
    target.click();
    requestAnimationFrame(update);
  });

  dialog.addEventListener('close', () => {
    activeKey = null;
    update();
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  new MutationObserver(update).observe(host, { childList: true, subtree: true });
})();
