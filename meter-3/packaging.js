// Extra verpakkingen als zelfstandige productkaarten, alleen voor Meter 3.
(function () {
  const grid = document.querySelector('#product-grid');
  const observer = new MutationObserver(addPackagingCards);
  function addPackagingCards() {
    observer.disconnect();
    grid.querySelectorAll('[data-packaging-card]').forEach(card => card.remove());
    const originals = [...grid.querySelectorAll('.product-card')];
    let extra = 0;
    for (const original of originals) {
      const originalButton = original.querySelector('[data-product-id]');
      const product = window.KPI_PRODUCTS.find(p => p.id === Number(originalButton.dataset.productId));
      for (const [index, variant] of (product?.packagingVariants || []).entries()) {
        if (!variant.image) continue;
        const card = original.cloneNode(true);
        card.dataset.packagingCard = 'true';
        const button = card.querySelector('button');
        button.dataset.packagingIndex = String(index);
        button.setAttribute('aria-label', 'Bekijk ' + product.brand + ' ' + product.name + ' ' + variant.name);
        const image = card.querySelector('img');
        image.src = variant.image;
        image.alt = variant.imageAlt;
        card.querySelector('.card-text strong').textContent = product.name + ' Sixpack';
        card.querySelector('.card-text > span').textContent = variant.quantity + ' × ' + variant.unitContent + (product.alcoholLabel ? ' · Alcohol: ' + product.alcoholLabel : '');
        original.after(card);
        extra++;
      }
    }
    if (extra) document.querySelector('#result-count').textContent = originals.length + ' producten · ' + (originals.length + extra) + ' verpakkingen';
    observer.observe(grid, { childList: true });
  }
  addPackagingCards();
  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-product-id]');
    if (!button) return;
    const product = window.KPI_PRODUCTS.find(p => p.id === Number(button.dataset.productId));
    if (!product?.packagingVariants?.length) return;
    const container = document.querySelector('#dialog-content .dialog-product');
    if (!container) return;
    if (button.dataset.packagingIndex !== undefined) {
      const selected = product.packagingVariants[Number(button.dataset.packagingIndex)];
      if (selected) {
        const image = container.querySelector('.product-visual img');
        image.src = selected.image;
        image.alt = selected.imageAlt;
        container.querySelector('#dialog-title').textContent = product.name + ' Sixpack';
        container.querySelector('.dialog-heading > span').textContent = selected.quantity + ' × ' + selected.unitContent + (product.alcoholLabel ? ' · Alcohol: ' + product.alcoholLabel : '');
      }
    }
  });
}());
