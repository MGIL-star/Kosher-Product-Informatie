(function () {
  'use strict';
  const grid = document.querySelector('#product-grid');
  const content = document.querySelector('#dialog-content');
  if (!grid || !content) return;
  const products = window.KPI_PRODUCTS || [];
  const group = location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).pop();
  let selected;
  const anchors = new Map();
  function positionButtons() {
    anchors.forEach((slot, b) => {
      if (!b.isConnected) { anchors.delete(b); return; }
      const card = b.parentElement.getBoundingClientRect();
      const rect = slot.getBoundingClientRect();
      b.style.left = (rect.left - card.left) + 'px';
      b.style.top = (rect.top - card.top) + 'px';
    });
  }
  const resize = new ResizeObserver(positionButtons);
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6z"/><path d="M17 12h1"/></svg>';
  function button(product) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'kpi-print-button';
    b.title = 'Print label (57 × 32 mm)';
    b.setAttribute('aria-label', 'Print label voor ' + product.name);
    b.innerHTML = icon;
    b.addEventListener('click', event => {
      event.stopPropagation();
      const url = new URL('../assets/print/label.html', location.href);
      url.search = new URLSearchParams({group, id: product.id, print: '1'});
      window.open(url.href, '_blank', 'noopener');
    });
    return b;
  }
  function decorate() {
    grid.querySelectorAll('.product-card').forEach(card => {
      if (card.querySelector('.kpi-print-button')) return;
      const trigger = card.querySelector('[data-product-id]');
      const p = trigger && products.find(p => String(p.id) === trigger.dataset.productId);
      if (p) {
        const text = card.querySelector('.card-text');
        let weight = text.querySelector(':scope > span');
        if (!weight) { weight = document.createElement('span'); text.append(weight); }
        const slot = document.createElement('span');
        slot.className = 'kpi-print-slot';
        slot.setAttribute('aria-hidden', 'true');
        weight.append(slot);
        const b = button(p);
        card.append(b);
        anchors.set(b, slot);
        resize.observe(text);
      }
    });
    const heading = content.querySelector('.dialog-heading');
    if (selected && heading && !heading.querySelector('.kpi-print-button')) {
      let weight = heading.querySelector(':scope > span');
      if (!weight) { weight = document.createElement('span'); heading.append(weight); }
      weight.append(button(selected));
    }
    positionButtons();
  }
  grid.addEventListener('click', event => {
    const trigger = event.target.closest('[data-product-id]');
    if (trigger) selected = products.find(p => String(p.id) === trigger.dataset.productId);
  }, true);
  const observer = new MutationObserver(decorate);
  observer.observe(grid, {childList: true, subtree: true});
  observer.observe(content, {childList: true, subtree: true});
  decorate();
  window.addEventListener('resize', positionButtons);
  document.fonts.ready.then(positionButtons);
}());
