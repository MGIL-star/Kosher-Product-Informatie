(function () {
  'use strict';

  const products = window.KPI_PRODUCTS || [];
  const grid = document.querySelector('#product-grid');
  const search = document.querySelector('#search');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const dialog = document.querySelector('#product-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  const siteFooter = document.querySelector('[data-site-disclaimer]');
  let activeFilter = 'Alle';

  const siteDisclaimer = `<div class="site-disclaimer">
    <strong>Productinformatie &amp; afbeeldingen</strong>
    <p>De getoonde productinformatie is met zorg samengesteld. Ingrediënten, allergenen, verpakking en productsamenstelling kunnen door de fabrikant worden gewijzigd. De getoonde foto’s dienen ter illustratie en kunnen afwijken van de actuele verpakking of het product zoals dit in de winkel verkrijgbaar is. Controleer bij twijfel altijd het etiket op de actuele verpakking.</p>
  </div>`;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const normalize = (value) => value.toLocaleLowerCase('nl-NL').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function hechsherText(value) {
    let text = String(value);
    text = text.replace(/^Kosher Parve\s*·\s*([^·.]+)/i, '$1 (Parve)');
    text = text.replace(/^Parve\s*·\s*([^·.]+)/i, '$1 (Parve)');
    text = text.replace(/\s*·\s*Parve\b/gi, ' (Parve)');
    return text.replace(/\s*[·,]\s*/g, ' ').replace(/\.$/, '').trim();
  }

  function productImage(product, large = false) {
    const sizeClass = large ? ' product-visual-large' : '';
    if (product.image) {
      const packScale = 1;
      return `<div class="product-visual${sizeClass}" data-pack-scale="${packScale}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.brand)} ${escapeHtml(product.name)} ${escapeHtml(product.variant || '')}" loading="lazy"></div>`;
    }
    return `<div class="product-visual product-image-pending${sizeClass}" role="img" aria-label="Productfoto nog niet beschikbaar"><span>Productfoto volgt</span></div>`;
  }

  function card(product) {
    return `<article class="product-card">
      <button type="button" data-product-id="${product.id}" aria-label="Bekijk ${escapeHtml(product.brand)} ${escapeHtml(product.name)}">
        ${productImage(product)}
        <span class="card-text"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.brand)}${product.englishName ? ` · ${escapeHtml(product.englishName)}` : ''}</small>${product.variant ? `<span>${escapeHtml(product.variant)}</span>` : ''}</span>
        <span class="card-action">Ingrediënten &amp; allergenen <span aria-hidden="true">→</span></span>
      </button>
    </article>`;
  }

  function render() {
    const query = normalize(search.value.trim());
    const visible = products.filter(product => {
      const matchesFilter = activeFilter === 'Alle' || product.category === activeFilter;
      const haystack = normalize(`${product.brand} ${product.name} ${product.englishName || ''} ${product.variant} ${product.ingredients}`);
      return matchesFilter && haystack.includes(query);
    });
    grid.innerHTML = visible.map(card).join('');
    count.textContent = `${visible.length} ${visible.length === 1 ? 'product' : 'producten'}`;
    empty.hidden = visible.length !== 0;
    if (!visible.length) {
      const hasProducts = products.length > 0;
      document.querySelector('#empty-title').textContent = hasProducts ? 'Geen producten gevonden' : 'Nog geen producten toegevoegd';
      document.querySelector('#empty-copy').textContent = hasProducts ? 'Probeer een andere zoekterm of kies een ander filter.' : 'Meter 14 staat klaar voor de echte productgegevens.';
    }
  }

  function openProduct(product) {
    const allergens = product.allergens === null
      ? '<span class="allergen-free">Nog te controleren op de verpakking</span>'
      : product.allergens.length
      ? product.allergens.map(item => /^(geen allergenen vermeld|geen declaratieplichtige allergenen vermeld)$/i.test(item.trim())
        ? '<span class="allergen-free">Geen declaratieplichtige allergenen vermeld</span>'
        : `<span class="allergen">${escapeHtml(item)}</span>`).join('')
      : '<span class="allergen-free">Geen declaratieplichtige allergenen vermeld</span>';
    dialogContent.innerHTML = `<div class="dialog-product">
      ${productImage(product, true)}
      <p class="image-disclaimer">${escapeHtml(product.imageDisclaimer || 'Afbeelding kan afwijken van de actuele verpakking.')}</p>
      <div class="dialog-heading"><h2 id="dialog-title">${escapeHtml(product.name)}</h2><p>${escapeHtml(product.brand)}${product.englishName ? ` · ${escapeHtml(product.englishName)}` : ''}</p>${product.variant ? `<span>${escapeHtml(product.variant)}</span>` : ''}</div>
      <section><h3>Ingrediënten</h3><p>${window.KPI_emphasizeAllergens(product.ingredients)}</p></section>
      <section><h3>Allergenen</h3><div class="allergen-list">${allergens}</div></section>
      ${product.mayContain ? `<section><h3>Kan bevatten</h3><p>${escapeHtml(product.mayContain)}</p></section>` : ''}
      ${product.warning ? `<section class="product-warning"><h3>Waarschuwing</h3><p>${escapeHtml(product.warning)}</p></section>` : ''}
      ${product.kosher ? `<section class="hechsher"><h3>Hechsher</h3><p>${escapeHtml(hechsherText(product.kosher))}</p></section>` : ''}
      <section class="ean"><h3>Barcode / EAN</h3><p>${escapeHtml(product.ean || 'Niet bekend')}</p></section>
    </div>`;
    dialog.showModal();
  }

  document.querySelector('.filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', active);
    });
    render();
  });
  search.addEventListener('input', render);
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-product-id]');
    if (button) openProduct(products.find(product => product.id === Number(button.dataset.productId)));
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  if (siteFooter) siteFooter.innerHTML = siteDisclaimer;
  render();
}());
