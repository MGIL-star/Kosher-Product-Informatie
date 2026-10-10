(function () {
  'use strict';
  // DKW meter 1 defines the order for every product detail view.
  window.KPI_normalizeProductLayout = function (container, product = {}) {
    const root = container.querySelector('.dialog-product');
    if (!root) return;
    const hiddenLabel = label => /herkomst|fabrikant|producent|manufacturer|country.of.origin|^(land|regio|productie)\s*:?(\s*)$/i.test(label);
    for (const section of [...root.children].filter(el => el.tagName === 'SECTION')) {
      const heading = section.querySelector('h3');
      if (hiddenLabel(heading?.textContent || '')) { section.remove(); continue; }
      for (const line of [...section.children].filter(el => el.tagName === 'P')) {
        const label = line.querySelector('strong');
        if (label && hiddenLabel(label.textContent)) line.remove();
      }
      if (section.children.length === 1 && heading) section.remove();
    }
    // Keep supplied customer-facing details visible even on older meter renderers.
    const supplied = Object.fromEntries(Object.entries(product.productInfo || {}).filter(([label]) => !hiddenLabel(label)));
    if (product.storage && !Object.keys(supplied).some(k => /bewar|bewaar/i.test(k))) supplied.Bewaaradvies = product.storage;
    if (product.packagingClaims?.length) supplied['Volgens de verpakking'] = product.packagingClaims.join('. ');
    const missing = Object.entries(supplied).filter(([, value]) => value && !root.textContent.includes(String(value)));
    if (missing.length) {
      let info = [...root.children].find(el => /^Productinformatie/.test(el.querySelector('h3')?.textContent || ''));
      if (!info) {
        info = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = 'Productinformatie';
        info.append(heading);
        root.append(info);
      }
      for (const [label, value] of missing) {
        const line = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = label + ': ';
        line.append(strong, document.createTextNode(String(value)));
        info.append(line);
      }
    }
    const rank = title => {
      if (/^Productinformatie/.test(title)) return 0;
      if (/^(Ingrediënten|Bekende ingrediënten|Samenstelling)/.test(title)) return 1;
      if (title === 'Allergenen') return 2;
      if (title === 'Kan bevatten') return 3;
      if (title === 'Waarschuwing') return 4;
      if (title === 'Hechser') return 98;
      if (title === 'Barcode / EAN') return 99;
      return 6;
    };
    const sections = [...root.children].filter(el => el.tagName === 'SECTION');
    let info = sections.find(el => /^Productinformatie/.test(el.querySelector('h3')?.textContent || ''));
    for (const section of sections) {
      const title = section.querySelector('h3');
      if (!title || !['Bereiding', 'Bewaaradvies', 'Inhoud'].includes(title.textContent)) continue;
      if (!info) {
        info = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = 'Productinformatie';
        info.append(heading);
        root.append(info);
      }
      const label = title.textContent;
      title.remove();
      const first = section.querySelector('p');
      if (first) {
        const strong = document.createElement('strong');
        strong.textContent = label + ': ';
        first.prepend(strong);
      }
      info.append(...section.childNodes);
      section.remove();
    }
    [...root.children].filter(el => el.tagName === 'SECTION')
      .sort((a, b) => rank(a.querySelector('h3')?.textContent || '') - rank(b.querySelector('h3')?.textContent || ''))
      .forEach(el => root.append(el));
  };
}());
