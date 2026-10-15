(function () {
  'use strict';
  // Display only supplied places/statuses, separated consistently from the name.
  window.KPI_formatHechsher = function (value) {
    let text = String(value).trim()
      .replace(/\b(?:Badatz\s+)?Cha(?:tam|sam) Sofer\b/gi, 'Badatz Chatam Sofer')
      .replace(/\bBne[i ]*Brak\b/gi, 'Bnei Brak')
      .replace(/\s*[,·]\s*/g, ' - ');
    const status = [];
    text = text.replace(/\s*(?:-\s*)?\((Parve|Chalav Yisrael|Zuivel)\)/gi, (_, name) => {
      status.push(name); return '';
    });
    text = text.replace(/\s+(?:of\s+)?\(?(Bnei Brak|Jeruzalem|Jerusalem|Antwerpen|Londen|London|Parijs|Straatsburg|Genève|Amsterdam|Den Haag|Kiryat Gat|Kiryat Ata|Nof HaGalil|Petach Tikva|Zichron Yaakov|Mateh Asher|Matte Asher|Netanya|Sderot|Yavne|Haifa|Lod|Arava|Safed|Volendam|Yokneam|Nitra–Monsey|Monsey)\)?(?=\s*(?:$| - ))/g, ' - $1');
    text = text.replace(/(?:\s*-\s*){2,}/g, ' - ').replace(/\s+-\s*$/, '').trim();
    return [text, ...status.map(name => '(' + name + ')')].filter(Boolean).join(' ').replace(/\s+[-–—]\s+/g, ' ').replace(/\s+/g, ' ').trim();
  };
  // DKW meter 1 defines the order for every product detail view.
  window.KPI_normalizeProductLayout = function (container, product = {}) {
    const root = container.querySelector('.dialog-product');
    if (!root) return;
    for (const list of root.querySelectorAll('.allergen-list')) {
      const items = [...list.querySelectorAll('.allergen')];
      if (!items.length) continue;
      let names = items.map(el => el.textContent.trim().replace(/,\s*$/, '').toLocaleLowerCase('nl'));
      const grains = names.filter(name => /^(gerst|tarwe|rogge|haver|spelt)(?: \(gluten\))?$/.test(name));
      if (names.includes('gluten') && grains.length === 1) {
        names = names.filter(name => name !== 'gluten').map(name => name === grains[0] && !name.endsWith('(gluten)') ? name + ' (gluten)' : name);
      }
      list.replaceChildren();
      names.forEach((name, index) => {
        const allergen = document.createElement('span');
        allergen.className = 'allergen';
        const text = name ? name[0].toLocaleUpperCase('nl') + name.slice(1) : name;
        allergen.textContent = text + (index < names.length - 1 ? ', ' : '');
        list.append(allergen);
      });
    }
    // Present supplied trace-allergen warnings under the shared Let op heading.
    for (const section of root.querySelectorAll('section')) {
      let heading = section.querySelector('h3');
      const label = section.querySelector('p > strong:first-child');
      if (/^kan bevatten\s*:?\s*$/i.test(heading?.textContent || '') || /^kan bevatten\s*:?\s*$/i.test(label?.textContent || '')) {
        section.classList.add('trace-allergen-notice');
        if (!heading) {
          heading = document.createElement('h3');
          section.prepend(heading);
          label.remove();
        }
        heading.textContent = 'Let op';
      }
    }
    const ingredientSection = [...root.querySelectorAll('section')].find(section => /^(Ingrediënten|Bekende ingrediënten)$/.test(section.querySelector('h3')?.textContent || ''));
    if (ingredientSection) {
      for (const note of [product.ingredientNote, product.ingredientsNote].filter(Boolean)) {
        if (ingredientSection.textContent.includes(note)) continue;
        const paragraph = document.createElement('p');
        paragraph.textContent = note;
        ingredientSection.append(paragraph);
      }
    }
    for (const section of root.querySelectorAll('section')) {
      if (section.querySelector('h3')?.textContent !== 'Hechsjer') continue;
      const line = section.querySelector('p');
      if (!line) continue;
      const lines = (product.kosherLines || [product.kosher || line.textContent]).flatMap(text => text.split(/\s*(?: \/ | · |;|,| en |\s+[—–]\s+|\s+\.\s+)\s*(?=(?:Badatz|OU\b|OU-D|OU-P|CRC\b|STAR-K|OK\b|BIR\b|Rabbijn|Rabbi\b|Rabbinaat|Opperrabbinaat|Machsike|Manchester|Nirbater|Beth Zedek|MKL\b))|\n/i)).map(text => text.replace(/\s*\((?:KLP|Pesach[^)]*)\)/gi, '').replace(/\bKP\s*·\s*/g, '').replace(/\bOU-P\b/g, 'OU').trim()).filter(Boolean);
      const parve = product.kosherStatus === 'Parve' || lines.some(text => /^\(?parve\)?$/i.test(text));
      const names = lines.filter(text => !/^\(?parve\)?$/i.test(text));
      if (parve && names.length && !names.some(text => /\bparve\b/i.test(text))) names[0] += ' (Parve)';
      line.classList.add('notranslate');
      line.setAttribute('translate', 'no');
      line.replaceChildren();
      names.map(text => window.KPI_formatHechsher(text)).sort((a, b) => b.length - a.length).forEach((text, index) => {
        if (index) line.append(document.createElement('br'));
        line.append(document.createTextNode(text));
      });
    }
    const meter = (String(product.meter || window.location.pathname).match(/(?:^|\/)(meter-\d+)(?:[^/]*)(?:\/|$)/) || [])[1];
    const hideDkwAdvice = /^meter-\d+$/.test(meter || '') && meter !== 'meter-2';
    const hiddenLabel = label => (hideDkwAdvice && /^(kenmerken|bewaren|bewaaradvies|bewaarvoorschriften|gebruik|gebruiksadvies|gebruiksaanwijzing)\s*:?\s*$/i.test(label)) || /visgehalte|uitlekgewicht|omschrijving|^(?:netto\s+)?inhoud\s*:?(\s*)$|bereiding|preparation|pesach|passover|kasjroet|herkomst|fabrikant|producent|manufacturer|country.of.origin|^(land|regio|productie)\s*:?(\s*)$/i.test(label);
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
    if (product.storage && !hiddenLabel('Bewaaradvies') && !Object.keys(supplied).some(k => /bewar|bewaar/i.test(k))) supplied.Bewaaradvies = product.storage;
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
    // Factory allergen notices have their own "Let op" section; other notices
    // use the same warning section and order as the olive pit warnings.
    const isFactoryNotice = value => /\b(?:bedrijf|fabriek|omgeving)\b[\s\S]*\b(?:verwerkt|gebruikt)\b/i.test(String(value || ''));
    const factoryNotices = [...new Set([product.notice, product.allergenNote, product.mayContain, product.warning, ...Object.values(product.productInfo || {})].filter(value => typeof value === 'string' && value.trim() && (value === product.notice || isFactoryNotice(value) || ([product.allergenNote, product.mayContain].includes(value) && /^kan\b[\s\S]*\bbevatten\b/i.test(value)))))];
    let warningSection = [...root.children].find(el => el.tagName === 'SECTION' && el.querySelector('h3')?.textContent === 'Waarschuwing');
    const getWarningSection = () => {
      if (!warningSection) {
        warningSection = document.createElement('section');
        if (!product.meter) warningSection.classList.add('product-warning');
        const heading = document.createElement('h3');
        heading.textContent = 'Waarschuwing';
        warningSection.append(heading);
        root.append(warningSection);
      }
      return warningSection;
    };
    for (const section of [...root.children].filter(el => el.tagName === 'SECTION')) {
      const heading = section.querySelector('h3');
      if (section.classList.contains('trace-allergen-notice') || section.classList.contains('factory-allergen-notice')) continue;
      const wholeNotice = /^let op\s*:?\s*$/i.test(heading?.textContent || '');
      for (const paragraph of [...section.children].filter(el => el.tagName === 'P')) {
        const label = paragraph.querySelector('strong');
        if (!wholeNotice && !/^let op\s*:?\s*$/i.test(label?.textContent || '')) continue;
        if (!wholeNotice) label.remove();
        getWarningSection().append(paragraph);
      }
      if (section !== warningSection && section.children.length === 1 && heading) section.remove();
    }
    if (factoryNotices.length) {
      // Remove the old occurrences before adding one clearly labelled section.
      for (const section of [...root.children].filter(el => el.tagName === 'SECTION')) {
        for (const paragraph of [...section.children].filter(el => el.tagName === 'P')) {
          if (factoryNotices.some(text => paragraph.textContent.trim().endsWith(text.trim()))) paragraph.remove();
        }
        if (!section.querySelector('p, .allergen-list') && !section.textContent.replace(section.querySelector('h3')?.textContent || '', '').trim()) section.remove();
      }
      const notice = document.createElement('section');
      notice.className = 'factory-allergen-notice';
      const heading = document.createElement('h3');
      heading.textContent = 'Let op';
      notice.append(heading);
      for (const text of factoryNotices) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        notice.append(paragraph);
      }
      root.append(notice);
    }
    const rank = title => {
      if (/^Productinformatie/.test(title)) return 0;
      if (/^(Ingrediënten|Bekende ingrediënten|Samenstelling)/.test(title)) return 1;
      if (title === 'Allergenen') return 2;
      if (title === 'Kan bevatten') return 3;
      if (/^Let op:?$/.test(title)) return 3.5;
      if (title === 'Waarschuwing') return 4;
      if (title === 'Hechsjer') return 98;
      if (/^Barcode [\/&] EAN$/.test(title)) return 99;
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
    // Shared label styling for both QR pages and the full catalogue.
    for (const heading of root.querySelectorAll('section > h3')) {
      heading.textContent = heading.textContent
        .replace(/^Bekende ingrediënten$/, 'Ingrediënten')
        .replace('Productinformatie / wijnstijl', 'Productinformatie & wijnstijl')
        .replace('Barcode / EAN', 'Barcode & EAN');
      if (/^Ingrediënten(?: \(INCI\))?$/.test(heading.textContent)) heading.classList.add('ingredient-heading');
    }
    for (const label of root.querySelectorAll('section > p > strong:first-child')) {
      if (/:\s*$/.test(label.textContent)) {
        label.classList.add('detail-field-label');
        label.parentElement.classList.add('detail-field-row');
      }
    }

  };
}());
