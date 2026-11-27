(() => {
  'use strict';
  const dialog = document.querySelector('#product-dialog');
  const host = document.querySelector('#product-detail');
  if (!dialog || !host) return;
  const storageKey = 'catalog-swipe-hint-seen-v2';
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
      hint.innerHTML = '<span class="swipe-tip"><span class="swipe-tip-gesture" aria-hidden="true"><svg class="swipe-tip-arrows" viewBox="0 0 64 36"><path d="m10 11-5 5 5 5m-5-5h12m37-5 5 5-5 5m5-5H47"/></svg><svg class="swipe-tip-hand" viewBox="0 0 32 36"><path d="M11 20V7a3 3 0 0 1 6 0v10-3a2.5 2.5 0 0 1 5 0v4-2a2.5 2.5 0 0 1 5 0v9c0 5-3 8-8 8h-2c-3 0-5-1-7-4l-6-8a2.6 2.6 0 0 1 4-3l3 3"/></svg></span><span class="swipe-tip-copy"><strong>Veeg en ontdek meer</strong><small>Naar links of rechts</small></span></span>';
      photo.append(hint);
      hideTimer = setTimeout(() => {
        hint?.classList.add('is-leaving');
        hideTimer = setTimeout(dismiss, 250);
      }, 3000);
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
