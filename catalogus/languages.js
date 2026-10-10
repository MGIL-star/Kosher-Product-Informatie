// Catalogue-only automatic translation using GTranslate's current library.
(() => {
  'use strict';
  const names = {nl:'Nederlands',en:'English',fr:'Français',iw:'עברית'};
  const nav = document.querySelector('.catalog-languages');
  const status = document.createElement('span');
  status.className = 'translation-status'; status.setAttribute('role','status');
  nav.after(status);
  let loading, active = 'nl', translated = false, refreshTimer;
  function cleanProductTitles(code) {
    if (!['en','fr','iw'].includes(code)) return;
    document.querySelectorAll('[data-source-title]').forEach(el => {
      // Preserve punctuation already present in the Dutch name and never alter
      // ingredients, quantities, barcodes or brand names.
      if (/[-\u2010\u2011]/u.test(el.dataset.sourceTitle)) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const clean = node.nodeValue.replace(/\u00ad/g,'').replace(/(\p{L})[-\u2010\u2011](?=\p{L})/gu,'$1 ');
        if (clean !== node.nodeValue) node.nodeValue = clean;
      }
    });
  }
  // Translations arrive in batches, including cached results and open dialogs.
  const titleObserver = new MutationObserver(() => {
    if (translated) cleanProductTitles(active);
  });
  ['products','product-detail','cart-items'].forEach(id => {
    const target = document.getElementById(id);
    if (target) titleObserver.observe(target,{subtree:true,childList:true,characterData:true});
  });
  window.CatalogTranslation = {
    beforeUpdate() {
      clearTimeout(refreshTimer);
      if (translated && window.__GT?.translator?.libReady) window.__GT.translator.revert();
      translated = false;
    },
    refresh() {
      clearTimeout(refreshTimer);
      if (active !== 'nl') refreshTimer = setTimeout(() => {
        if (window.__GT?.translator?.libReady) {
          const code = active;
          window.__GT.translator.resultCallback = () => cleanProductTitles(code);
          translated = true;window.__GT.translator.translate('nl',code);
          cleanProductTitles(code);
        }
      },150);
    }
  };
  function library() {
    if (loading) return loading;
    loading = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.gtranslate.net/widgets/latest/lib.min.js';
      const timeout = setTimeout(() => reject(Error('timeout')),20000);
      script.onerror = () => {clearTimeout(timeout);reject(Error('load'));};
      script.onload = () => {
        const translator = window.__GT?.translator;
        if (!translator) {clearTimeout(timeout);reject(Error('library'));return;}
        const ready = () => {clearTimeout(timeout);resolve(translator);};
        if (translator.libReady) ready(); else translator.readyCallback = ready;
      };
      document.head.append(script);
    });
    return loading;
  }
  function select(code) {
    for (const button of nav.querySelectorAll('button')) {
      const selected = button.dataset.lang === code;
      button.setAttribute('aria-pressed',String(selected));
      button.classList.toggle('gt-current-lang',selected);
    }
  }
  let request = 0;
  for (const [code,name] of Object.entries(names)) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'glink notranslate'; button.dataset.lang = code;
    button.title = name; button.lang = code === 'iw' ? 'he' : code; button.setAttribute('aria-label',name);
    const img = document.createElement('img');
    img.src = code === 'nl' ? 'netherlands-flag.svg' : code === 'iw' ? 'israel-flag.svg?v=2' : 'https://cdn.gtranslate.net/flags/svg/' + code + '.svg';
    img.alt = ''; img.width = 32; img.height = 24;
    const label = document.createElement('span'); label.textContent = name;
    const frame = document.createElement('span'); frame.className = 'flag-icon'; frame.append(img);
    button.append(frame,label);nav.append(button);
    button.onclick = async () => {
      const current = ++request;
      status.textContent = 'Vertaling laden…';
      try {
        const translator = await library();
        if (current !== request) return;
        translator.resultCallback = () => {
          if (current !== request) return;
          status.textContent = translator.error ? 'Vertalen is tijdelijk niet beschikbaar. Probeer het opnieuw.' : '';
          cleanProductTitles(code);
        };
        translated = code !== 'nl';
        if (!translator.translate('nl',code)) throw Error('translate');
        cleanProductTitles(code);
        active = code;
        select(code);
        document.documentElement.dir = code === 'iw' ? 'rtl' : 'ltr';
        if (code === 'nl') status.textContent = '';
      } catch {status.textContent = 'Vertalen is tijdelijk niet beschikbaar. Vernieuw de pagina om het opnieuw te proberen.';}
    };
  }
  select('nl');
})();
