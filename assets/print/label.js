(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const groups = ['meter-1','meter-2','meter-3','meter-4-tafelzuur','meter-5','meter-6','meter-8','meter-9','meter-10','meter-11','meter-12','meter-13','meter-14','meter-15','diepvries-schap-1','diepvries-schap-2','diepvries-schap-3'];
  const label = document.querySelector('#label');
  const content = document.querySelector('#label-content');
  function paragraph(title, text, bold = false) {
    const p = document.createElement('p'), b = document.createElement('strong');
    b.className = 'label-heading'; b.textContent = title + ': ';
    const value = document.createElement(bold ? 'strong' : 'span');
    value.textContent = text; p.append(b, value); content.append(p);
  }
  function fit() {
    label.style.fontFamily = 'Arial, Helvetica, sans-serif';
    content.style.width = '100%'; content.style.transform = 'none';
    const style = getComputedStyle(label);
    const height = label.getBoundingClientRect().width * 32 / 57 - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 1;
    const title = content.querySelector('h1');
    title.style.fontSize = '7pt';
    // Keep the complete short name on one line, scaling independently of the body.
    const range = document.createRange(); range.selectNodeContents(title);
    const width = range.getBoundingClientRect().width;
    const titleSize = Math.min(7, 7 * (content.clientWidth - 1) / width);
    title.style.fontSize = titleSize + 'pt';
    label.style.fontSize = '4.5pt';
    if (content.getBoundingClientRect().height > height) {
      label.style.fontFamily = '"Arial Narrow", Arial, Helvetica, sans-serif';
    }
    // Keep one complete label even on devices without Arial Narrow.
    if (content.getBoundingClientRect().height > height) {
      content.style.width = (100 / .85) + '%';
      content.style.transformOrigin = 'top left';
      content.style.transform = 'scaleX(.85)';
    }
    let low = 4.5, high = 32;
    for (let i = 0; i < 22; i++) {
      const size = (low + high) / 2; label.style.fontSize = size + 'pt';
      if (content.getBoundingClientRect().height <= height && content.scrollWidth <= content.clientWidth) low = size; else high = size;
    }
    label.style.fontSize = low + 'pt';
    const fits = content.getBoundingClientRect().height <= height && content.scrollWidth <= content.clientWidth;
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
  if (!groups.includes(params.get('group'))) {content.textContent = 'Onbekende productgroep.'; return;}
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
    paragraph('Allergenen', allergens, true);
    await document.fonts.ready;
    const fits = fit(); document.body.dataset.ready = 'true';
    window.addEventListener('beforeprint', fit);
    if (fits && params.get('print') === '1') requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };
  document.head.append(script);
}());
