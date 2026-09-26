(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const groups = ['meter-1','meter-2','meter-3','meter-4-tafelzuur','meter-5','meter-6','meter-8','meter-9','meter-10','meter-11','meter-12','meter-13','meter-14','meter-15','diepvries-schap-1','diepvries-schap-2','diepvries-schap-3'];
  const label = document.querySelector('#label');
  const content = document.querySelector('#label-content');
  function paragraph(title, text) {
    const p = document.createElement('p'), b = document.createElement('strong');
    b.textContent = title + ': '; p.append(b, document.createTextNode(text)); content.append(p);
  }
  function fit() {
    const style = getComputedStyle(label);
    const height = label.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 1;
    let low = .1, high = 10;
    for (let i = 0; i < 22; i++) {
      const size = (low + high) / 2; label.style.fontSize = size + 'px';
      if (content.getBoundingClientRect().height <= height && content.scrollWidth <= content.clientWidth) low = size; else high = size;
    }
    label.style.fontSize = low + 'px';
  }
  if (!groups.includes(params.get('group'))) {content.textContent = 'Onbekende productgroep.'; return;}
  const script = document.createElement('script');
  const sharedSources = {'meter-3': '../js/products-meter-3.js', 'meter-4-tafelzuur': '../js/products-meter-4.js'};
  script.src = sharedSources[params.get('group')] || '../../' + params.get('group') + '/products.js';
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
    fit(); document.body.dataset.ready = 'true';
    window.addEventListener('beforeprint', fit);
    if (params.get('print') === '1') requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };
  document.head.append(script);
}());
