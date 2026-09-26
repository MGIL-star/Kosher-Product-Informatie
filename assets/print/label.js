(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const validGroup = /^(?:meter-[1-9][0-9]*(?:-[a-z0-9]+)*|diepvries-schap-[1-9][0-9]*)$/;
  const label = document.querySelector('#label');
  const content = document.querySelector('#label-content');
  function paragraph(title, text, bold = false) {
    const p = document.createElement('p'), b = document.createElement('strong');
    b.className = 'label-heading'; b.textContent = title + ': ';
    const value = document.createElement(bold ? 'strong' : 'span');
    value.textContent = text; p.append(b, value); content.append(p);
  }
  function fit() {
    label.style.fontFamily = 'Calibri, Arial, sans-serif';
    content.style.width = '100%'; content.style.transform = 'none';
    const style = getComputedStyle(label);
    const height = label.clientWidth * 32 / 57 - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 1;
    const title = content.querySelector('h1');
    title.style.fontSize = '1em';
    const fitsContent = () => content.offsetHeight <= height && content.scrollWidth <= content.clientWidth;
    label.style.fontSize = '4.5pt';
    // Only exceptionally long text needs narrower spacing.
    if (!fitsContent()) {
      content.style.width = (100 / .85) + '%';
      content.style.transformOrigin = 'top left';
      content.style.transform = 'scaleX(.85)';
    }
    if (!fitsContent()) {
      content.style.width = (100 / .75) + '%';
      content.style.transformOrigin = 'top left';
      content.style.transform = 'scaleX(.75)';
    }
    // Maximize the common size without clipping any title or body text.
    let low = 4.5, high = 8;
    for (let i = 0; i < 22; i++) {
      const size = (low + high) / 2; label.style.fontSize = size + 'pt';
      if (fitsContent()) low = size; else high = size;
    }
    label.style.fontSize = low + 'pt';
    const fits = content.offsetHeight <= height && content.scrollWidth <= content.clientWidth;
    document.body.dataset.fits = String(fits);
    let notice = document.querySelector('#fit-notice');
    if (!notice) {
      notice = document.createElement('p'); notice.id = 'fit-notice';
      notice.setAttribute('role', 'alert'); document.body.append(notice);
    }
    notice.hidden = fits;
    notice.textContent = 'Deze tekst past nog niet volledig op één label van 57 × 32 mm bij 4,5 pt. Er is niets weggelaten. Automatisch afdrukken is gestopt.';
    return fits;
  }
  if (!validGroup.test(params.get('group') || '')) {content.textContent = 'Onbekende productgroep.'; return;}
  const script = document.createElement('script');
  const sharedSources = {'meter-3': '../js/products-meter-3.js', 'meter-4-tafelzuur': '../js/products-meter-4.js'};
  script.src = sharedSources[params.get('group')] || '../../' + params.get('group') + '/products.js';
  script.src += '?v=20260926-print-final';
  script.onerror = () => {content.textContent = 'Productgegevens konden niet worden geladen.';};
  script.onload = async () => {
    const p = (window.KPI_PRODUCTS || []).find(p => String(p.id) === params.get('id'));
    if (!p) {content.textContent = 'Product niet gevonden.'; return;}
    document.title = 'Label - ' + p.name;
    const title = document.createElement('h1'); title.textContent = p.shortName || p.name; content.append(title);
    paragraph(p.ingredientsPartial ? 'Bekende ingrediënten' : 'Ingrediënten', p.ingredients || 'Niet bevestigd.');
    let allergens = 'Niet bevestigd.';
    if (Array.isArray(p.allergens) && p.allergens.length) allergens = p.allergens.join(', ');
    else if (p.allergensConfirmedAbsent === true) allergens = 'Geen vermeld.';
    else if (Array.isArray(p.allergens) && !p.detailsPending && !Object.hasOwn(p, 'allergensConfirmedAbsent')) allergens = 'Geen declaratieplichtige allergenen vermeld.';
    // Only allergen content belongs on the label, never editorial/source notes.
    const traces = String(p.allergenNote || '').split(/(?<=[.!?])\s+/).filter(sentence =>
      /^Kan\b.*bevatten/i.test(sentence) ||
      /^(Geproduceerd|Gemaakt|Vervaardigd)\b.*(fabriek|bedrijf|omgeving|lijn)\b.*(verwerkt|gebruikt|gemaakt)/i.test(sentence) && !/koosjer|parve/i.test(sentence) ||
      /^Niet geschikt.*allergie/i.test(sentence));
    if (p.mayContain) allergens += ' Kan bevatten: ' + p.mayContain;
    if (traces.length) allergens += ' ' + traces.join(' ');
    paragraph('Allergenen', allergens);
    await document.fonts.ready;
    const fits = fit(); document.body.dataset.ready = 'true';
    window.addEventListener('beforeprint', fit);
    if (fits && params.get('print') === '1') requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };
  document.head.append(script);
}());
