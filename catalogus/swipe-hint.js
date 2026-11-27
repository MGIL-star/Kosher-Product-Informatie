(() => {
  'use strict';
  const dialog = document.querySelector('#product-dialog');
  const host = document.querySelector('#product-detail');
  if (!dialog || !host) return;
  const storageKey = 'catalog-swipe-hint-seen-v1';
  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === '1'; } catch {}
  let timer, hideTimer, hint;
  function dismiss() {
    clearTimeout(timer);
    clearTimeout(hideTimer);
    hint?.remove();
    hint = null;
  }
  function schedule() {
    if (seen || !dialog.open || !window.matchMedia('(max-width: 639px)').matches) return;
    if (document.querySelectorAll('#products .product-open[data-product]').length < 2) return;
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
      hint.innerHTML = '<span><b aria-hidden="true">↔</b> Veeg naar links of rechts</span>';
      photo.append(hint);
      hideTimer = setTimeout(() => {
        hint?.classList.add('is-leaving');
        hideTimer = setTimeout(dismiss, 250);
      }, 2500);
    }, 350);
  }
  dialog.addEventListener('close', () => { dismiss(); timer = null; });
  dialog.addEventListener('touchstart', dismiss, { passive: true });
  document.addEventListener('click', event => {
    if (!event.target.closest('#products .product-open[data-product]')) return;
    dismiss(); timer = null;
    requestAnimationFrame(schedule);
  });
  new MutationObserver(schedule).observe(host, { childList: true });
})();
