(function () {
  'use strict';

  const products = window.KPI_PRODUCTS || [];
  const nonFood = window.KPI_CATALOG_MODE === 'nonfood';
  const showReferences = window.KPI_SHOW_REFERENCES !== false;
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
    <p>De getoonde productinformatie is met zorg samengesteld. ${nonFood ? 'Verpakking, uitvoering en gebruiksaanwijzing kunnen door de fabrikant worden gewijzigd.' : 'Ingrediënten, allergenen, verpakking en productsamenstelling kunnen door de fabrikant worden gewijzigd.'} De getoonde foto’s dienen ter illustratie en kunnen afwijken van de actuele verpakking of het product zoals dit in de winkel verkrijgbaar is. Controleer bij twijfel altijd het etiket op de actuele verpakking.</p>
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
      const crop = product.imageFrame;
      if (crop && [crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) && crop.width > 0 && crop.height > 0) {
        const style = `--pack-ratio:${crop.aspectRatio};--image-width:${100 / crop.width}%;--image-height:${100 / crop.height}%;--image-left:${-100 * crop.x / crop.width}%;--image-top:${-100 * crop.y / crop.height}%`;
        return `<div class="product-visual${sizeClass}"><div class="product-packshot" style="${style}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.brand)} ${escapeHtml(product.name)}" loading="lazy"></div></div>`;
      }
      return `<div class="product-visual${sizeClass}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.brand)} ${escapeHtml(product.name)}" loading="lazy"></div>`;
    }
    return `<div class="product-visual product-image-pending${sizeClass}" role="img" aria-label="Productfoto nog niet beschikbaar"><span>Productfoto volgt</span></div>`;
  }

  function card(product) {
    return `<article class="product-card">
      <button type="button" data-product-id="${product.id}" aria-label="Bekijk ${escapeHtml(product.brand)} ${escapeHtml(product.name)}">
        ${productImage(product)}
        <span class="card-text"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.brand)}${product.englishName ? ` · ${escapeHtml(product.englishName)}` : ''}</small>${product.variant ? `<span>${escapeHtml(product.variant)}</span>` : ''}${product.identificationNote ? `<span class="identification-status">${escapeHtml(product.identificationLabel || 'Variant nog te bevestigen')}</span>` : ''}</span>
        <span class="card-action">${nonFood ? 'Productinformatie' : 'Ingrediënten &amp; allergenen'} <span aria-hidden="true">→</span></span>
      </button>
    </article>`;
  }

  function render() {
    const query = normalize(search.value.trim());
    const visible = products.filter(product => {
      const matchesFilter = activeFilter === 'Alle' || product.category === activeFilter;
      const haystack = normalize(`${product.brand} ${product.name} ${product.searchName || ''} ${product.variant} ${product.ingredients} ${product.ean || ''} ${Object.values(product.productInfo || {}).join(' ')}`);
      return matchesFilter && haystack.includes(query);
    });
    grid.innerHTML = visible.map(card).join('');
    count.textContent = `${visible.length} ${visible.length === 1 ? 'product' : 'producten'}`;
    empty.hidden = visible.length !== 0;
    if (!visible.length) {
      const hasProducts = products.length > 0;
      document.querySelector('#empty-title').textContent = hasProducts ? 'Geen producten gevonden' : 'Nog geen producten toegevoegd';
      document.querySelector('#empty-copy').textContent = hasProducts ? 'Probeer een andere zoekterm of kies een ander filter.' : 'Deze pagina staat klaar voor de echte productgegevens.';
    }
  }

  function openProduct(product) {
    const allergens = nonFood || product.allergens === null
      ? '<span class="allergen-free">Nog te controleren</span>'
      : product.allergens.length
      ? product.allergens.map(item => /^(geen allergenen vermeld|geen declaratieplichtige allergenen vermeld)$/i.test(item.trim())
        ? '<span class="allergen-free">Geen allergenen vermeld</span>'
        : `<span class="allergen">${escapeHtml(item)}</span>`).join('')
      : '<span class="allergen-free">Geen allergenen vermeld</span>';
    dialogContent.innerHTML = `<div class="dialog-product">
      ${productImage(product, true)}
      <p class="image-disclaimer">${product.imageEdited ? 'Bewerkte productfoto; verpakking kan afwijken.' : product.imageIllustration ? 'Illustratie van het product, geen verpakkingsfoto.' : 'Afbeelding kan afwijken van de actuele verpakking.'}</p>
      <div class="dialog-heading"><h2 id="dialog-title">${escapeHtml(product.name)}</h2><p>${escapeHtml(product.brand)}${product.englishName ? ` · ${escapeHtml(product.englishName)}` : ''}</p>${product.variant ? `<span>${escapeHtml(product.variant)}</span>` : ''}</div>
      ${product.productInfo ? `<section><h3>${product.isWine ? 'Productinformatie / wijnstijl' : 'Productinformatie'}</h3>${Object.entries(product.productInfo).map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}</section>` : ''}
      ${nonFood && product.composition ? `<section class="product-composition"><h3>${escapeHtml(product.composition.heading || 'Ingrediënten (INCI)')}</h3>${product.composition.text ? `<p>${escapeHtml(product.composition.text)}</p>` : ''}${product.composition.note ? `<p class="composition-note">${escapeHtml(product.composition.note)}</p>` : ''}${showReferences && product.composition.source ? `<p><a href="${escapeHtml(product.composition.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(product.composition.source.label)}</a></p>` : ''}</section>` : ''}
      ${nonFood && product.backLabel ? `<section class="back-label"><h3>Achterkant van de verpakking</h3><p>${escapeHtml(product.backLabel.note)}</p><a href="${escapeHtml(product.backLabel.image)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(product.backLabel.image)}" alt="Etiket ${escapeHtml(product.brand)} ${escapeHtml(product.name)}" loading="lazy"><span>Etiket vergroten ↗</span></a></section>` : ''}
      ${!nonFood && product.ingredients ? `<section><h3>${product.ingredientsPartial ? 'Bekende ingrediënten' : 'Ingrediënten'}</h3><p>${window.KPI_emphasizeAllergens(product.ingredients)}</p>${product.ingredientsNote ? `<p>${escapeHtml(product.ingredientsNote)}</p>` : ''}</section>` : ''}
      ${!nonFood && product.allergens !== null ? `<section><h3>Allergenen</h3><div class="allergen-list">${allergens}</div>${product.allergenNote ? `<p>${escapeHtml(product.allergenNote)}</p>` : ''}</section>` : ''}
      ${product.mayContain ? `<section><h3>Kan bevatten</h3><p>${escapeHtml(product.mayContain)}</p></section>` : ''}
      ${product.warning ? `<section class="product-warning"><h3>Waarschuwing</h3><p>${escapeHtml(product.warning)}</p></section>` : ''}
      ${product.kosher ? `<section class="hechsher"><h3>Hechser</h3><p>${escapeHtml(hechsherText(product.kosher))}</p>${product.kosherNote ? `<p class="kosher-note">${escapeHtml(product.kosherNote)}</p>` : ''}</section>` : ''}
      ${nonFood && product.identificationNote ? `<section class="identification-note"><h3>Identificatie</h3><p>${escapeHtml(product.identificationNote)}</p></section>` : ''}
      ${nonFood && showReferences && product.supplier ? `<section><h3>Bij Israelwinkel</h3><p><a href="${escapeHtml(product.supplier.url)}" target="_blank" rel="noopener noreferrer">Bekijk ${escapeHtml(product.name)}${product.supplier.variant ? ` — ${escapeHtml(product.supplier.variant)}` : ''}</a></p>${product.supplier.sku ? `<p>Artikelnummer: ${escapeHtml(product.supplier.sku)}</p>` : ''}</section>` : ''}
      ${nonFood && showReferences && product.sources?.length ? `<section><h3>Bronnen</h3>${product.sources.filter(source => /^https:\/\//.test(source.url)).map(source => `<p><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a></p>`).join('')}</section>` : ''}
      ${product.ean ? `<section class="ean"><h3>Barcode / EAN</h3><p>${escapeHtml(product.ean)}</p></section>` : ''}
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
  const filters = document.querySelector('.filters');
  [...new Set(products.map(product => product.category))].forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter';
    button.type = 'button';
    button.dataset.filter = category;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = category;
    filters.append(button);
  });
  render();
}());

