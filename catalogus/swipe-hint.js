(() => {
  'use strict';
  const dialog = document.querySelector('#product-dialog');
  const host = document.querySelector('#product-detail, #dialog-content');
  if (!dialog || !host) return;
  const cardsSelector = '#products .product-open[data-product], #product-grid [data-product-id]';
  const storageKey = 'catalog-swipe-hint-seen-v3';
  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === '1'; } catch {}
  let timer, hideTimer, hint;
  function dismiss() {
    clearTimeout(timer);
    timer = null;
    clearTimeout(hideTimer);
    hint?.remove();
    hint = null;
  }
  function schedule() {
    if (seen || !dialog.open || !window.matchMedia('(max-width: 639px)').matches) return;
    if (document.querySelectorAll(cardsSelector).length < 2) return;
    const photo = host.querySelector('.product-visual-large');
    if (!photo || timer) return;
    timer = setTimeout(() => {
      timer = null;
      if (!dialog.open || !photo.isConnected) return;
      seen = true;
      try { sessionStorage.setItem(storageKey, '1'); } catch {}
      hint = document.createElement('div');
      hint.className = 'product-swipe-hint';
      hint.setAttribute('role', 'status');
      hint.setAttribute('aria-label', 'Veeg naar links of rechts voor een ander product');
      hint.innerHTML = '<span class="swipe-side swipe-side-left"><span class="swipe-side-arrow" aria-hidden="true">←</span><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M14 26V9a3 3 0 0 1 6 0v13-5a3 3 0 0 1 6 0v6-3a3 3 0 0 1 6 0v5-2a3 3 0 0 1 6 0v10c0 8-5 12-12 12h-3c-4 0-7-2-9-5L5 28a3 3 0 0 1 5-3l4 5"/></svg></span><span class="swipe-side swipe-side-right"><span class="swipe-side-arrow" aria-hidden="true">→</span><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M14 26V9a3 3 0 0 1 6 0v13-5a3 3 0 0 1 6 0v6-3a3 3 0 0 1 6 0v5-2a3 3 0 0 1 6 0v10c0 8-5 12-12 12h-3c-4 0-7-2-9-5L5 28a3 3 0 0 1 5-3l4 5"/></svg></span>';
      photo.classList.add('swipe-hint-anchor');
      photo.append(hint);
      hideTimer = setTimeout(() => {
        hint?.classList.add('is-leaving');
        hideTimer = setTimeout(dismiss, 250);
      }, 4500);
    }, 350);
  }
  dialog.addEventListener('close', () => { dismiss(); timer = null; });
  dialog.addEventListener('touchstart', dismiss, { passive: true });
  document.addEventListener('click', event => {
    if (!event.target.closest(cardsSelector)) return;
    dismiss(); timer = null;
    requestAnimationFrame(schedule);
  });
  new MutationObserver(schedule).observe(host, { childList: true });
  new MutationObserver(schedule).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  schedule();
})();
