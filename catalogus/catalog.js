(() => {
  'use strict';
  const root = new URL('../', location.href);
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = s => String(s ?? '').toLocaleLowerCase('nl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const icons = {all:'Alles',drinks:'Dranken',pantry:'Voorraadkast',tea:'Koffie & thee',treats:'Koek & chocolade',snacks:'Snacks',bread:'Brood & brioche',home:'Verzorging & huishouden',refrigerated:'Koeling',frozen:'Diepvries'};
  const sources = Array.from({length:17}, (_, i) => ({n:i+1, folder:i===3?'meter-4-tafelzuur':`meter-${i+1}`, data:i===2?'assets/js/products-meter-3.js?v=20261022-mojito-name-fix':i===3?'assets/js/products-meter-4.js':i===4?'meter-5/products.js?v=20261022-harissa-barcode-hechsher':i===9?'meter-10/products.js?v=20261022-kopernik-name-fix':i===11?'meter-12/products.js?v=20261015-para-crunch-white-biscuit':i===14?'meter-15/products.js?v=20261022-doritos-size-match':i===15?'meter-16/products.js?v=20261022-pretzel-name':`meter-${i+1}/products.js`}));
  for(let n=1;n<=3;n++) sources.push({n:17+n,folder:`diepvries-schap-${n}`,data:`diepvries-schap-${n}/products.js?v=20261029-freezer-info-energy`});
  const sectionTitles = [
    'Water · Vruchtensappen', 'Wijn · Druivensap', 'Olie · Azijn · Dranken',
    'Groenten · Olijven · Augurken', 'Sauzen · Soepen · Visconserven',
    'Koffie · Thee · Crackers', 'Pasta · Soep · Maaltijdmixen', 'Honing · Beleg · Kruiden',
    'Cake · Wafels · Repen', 'Koekjes · Biscuits', 'Snoep · Kauwgom',
    'Chocolade · Granola · Bakproducten', 'Chips · Pretzels · Wraps',
    'Bamba · Bissli · Noten', 'Brood · Brioche · Snacks', 'Snacks · Snoep · Sauzen',
    'Verzorging · Huishouden · Kaarsen', 'Diepvries: Vlees · Kip · Vis',
    'Diepvries: Bagels · Pizza · Deegwaren', 'Diepvries: Snacks · Vegetarisch · IJs'
  ];
  sources.forEach(source => source.title = sectionTitles[source.n - 1]);
  sources.push({n:21,title:'Vleeswaren · Salades · Dips',folder:'koeling-schap-1',data:'koeling-schap-1/products.js?v=20261029-nutrition-batch-3'});
  sources.push({n:22,title:'Kaas · Zuivel · Verse Pasta',folder:'koeling-schap-2',data:'koeling-schap-2/products.js?v=20261030-chocoladeroomdessert-nutrition'});
  let products=[], active='all', failures=[];
  const translatedSearch = new Map();
  let cart={};
  try {const saved=JSON.parse(localStorage.getItem('kosher-catalog-cart') || '{}');for(const [k,v] of Object.entries(saved))if(Number.isInteger(v)&&v>0)cart[k]=Math.min(v,999);}catch{}
  const classify = (p,n,folder) => folder?.startsWith('koeling-')?'refrigerated':n>17?'frozen':n===17?'home':n<=2||n===16&&p.category==='Dranken'?'drinks':n===6?'tea':[9,10,11,12].includes(n)?'treats':[13,14,16].includes(n)?'snacks':n===15?(p.category==='Brood & brioche'?'bread':'snacks'):'pantry';
  async function sharedScript(path){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
  function image(p,cls=''){return p.image?`<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`:'';}
  function save(){try{localStorage.setItem('kosher-catalog-cart',JSON.stringify(cart));}catch{}updateCount();}
  function updateCount(){window.CatalogTranslation?.beforeUpdate();const count=Object.values(cart).reduce((a,b)=>a+b,0);$('#cart-count').textContent=`${count} ${count===1?'artikel':'artikelen'}`;window.CatalogTranslation?.refresh();}
  function toast(message){window.CatalogTranslation?.beforeUpdate();$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2200);window.CatalogTranslation?.refresh();}
  function add(key){cart[key]=Math.min((cart[key]||0)+1,999);save();toast('Toegevoegd aan uw boodschappenlijst');if($('#cart-dialog').open)renderCart();}
  function selectCategory(key){active=key;renderCategories();render();}
  function renderCategories(){const counts={};for(const p of products)counts[p.group]=(counts[p.group]||0)+1;$('#categories').innerHTML=Object.entries(icons).filter(([k])=>k==='all'||counts[k]).map(([k,label])=>`<button data-group="${k}" aria-pressed="${active===k}">${label}<span>${k==='all'?products.length:counts[k]}</span></button>`).join('');}
  function card(p){return `<article class="product-card"><button class="product-open" data-product="${esc(p.key)}" aria-label="Bekijk ${esc(p.name)}"><div class="photo${p.image?'':' placeholder'}">${p.image?image(p):'Foto volgt'}</div><div class="card-copy"><h3 data-source-title="${esc(p.name)}">${esc(p.name)}</h3><span class="brand notranslate" translate="no">${esc(p.brand)}</span><p class="weight">${esc(p.variant)}</p></div></button><button class="cart-icon-add" data-add="${esc(p.key)}" aria-label="${esc(p.name)} toevoegen aan boodschappenlijst" title="Toevoegen aan boodschappenlijst"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2.5 12h11l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></button></article>`;}
  function render(){
    for (const card of document.querySelectorAll('.product-open[data-product]')) {
      const title = card.querySelector('h3')?.textContent;
      if (title) translatedSearch.set(card.dataset.product, title);
    }
    window.CatalogTranslation?.beforeUpdate();
    const query=normalize($('#search').value);
    const filtered=products.filter(p=>(active==='all'||p.group===active)&&window.KPI_searchMatches(`${p.name} ${p.searchName||''} ${Array.isArray(p.aliases)?p.aliases.join(' '):p.aliases||''} ${translatedSearch.get(p.key)||''} ${p.englishName||''} ${p.brand} ${p.variant} ${p.category} ${p.meterTitle}`,query));
    $('#result-title').textContent='Ons assortiment';
    $('#result-count').textContent=`${filtered.length} ${filtered.length===1?'product':'producten'}`;
    $('#products').innerHTML=sources.map(source=>{
      const items=filtered.filter(p=>p.meter===source.folder);
      if(!items.length)return '';
      return `<section class="meter-section" aria-labelledby="meter-${source.n}"><div class="meter-heading"><h2 id="meter-${source.n}">${esc(source.title)}</h2><span>${items.length} ${items.length===1?'product':'producten'}</span></div><div class="product-grid">${items.map(card).join('')}</div></section>`;
    }).join('')||'<p class="no-results">Geen producten gevonden. Probeer een andere zoekterm.</p>';
    window.CatalogTranslation?.refresh();
  }
  function section(title,text){return text?`<section><h3>${title}</h3><p>${esc(text)}</p></section>`:'';}
  function openProduct(key) {window.CatalogTranslation?.beforeUpdate();
    const p=products.find(p=>p.key===key);if(!p)return;
    const declaredAllergens=Array.isArray(p.allergens)
      ? p.allergens.filter(a=>! /^(geen allergenen vermeld|geen declaratieplichtige allergenen vermeld)$/i.test(String(a).trim()))
      : [];
    const allergens=declaredAllergens.length
      ? declaredAllergens.map(a=>'<span class="allergen">'+esc(a)+'</span>').join('')
      : '<span class="allergen-free">Geen allergenen vermeld</span>';
    const info=Object.entries(p.productInfo||{}).map(([label,value])=>'<p><strong>'+esc(label)+':</strong> '+esc(value)+'</p>').join('')
      +(p.preparation?'<p><strong>Bereiding:</strong> '+esc(p.preparation)+'</p>':'')
      +(p.note?'<p>'+esc(p.note)+'</p>':'');
    const parve=(p.kosherStatus==='Parve'||/\(Parve\)/i.test(p.note||''))&&!/parve/i.test(p.kosher||'');
    const kosherLines=Array.isArray(p.kosherLines)&&p.kosherLines.length?p.kosherLines:(p.kosher?[String(p.kosher).concat(parve?' (Parve)':'')]:[]);
    const kosher=kosherLines.map(line=>String(line).replace(/^Kosher Parve\s*·\s*([^·.]+)/i,'$1 (Parve)').replace(/^Parve\s*·\s*([^·.]+)/i,'$1 (Parve)').replace(/\s*·\s*Parve\b/gi,' (Parve)').replace(/\s*[·,]\s*/g,' ').replace(/\.$/,'').trim()).filter(Boolean).map(esc).join('<br>');
    $('#product-detail').innerHTML='<div class="dialog-product">'
      +'<div class="product-visual product-visual-large">'+image(p,'detail-image')+'</div>'
      +'<p class="image-disclaimer">Afbeelding kan afwijken van de actuele verpakking.</p>'
      +'<div class="dialog-heading"><h2 data-source-title="'+esc(p.name)+'" id="dialog-title">'+esc(p.name)+'</h2><p class="notranslate" translate="no">'+esc(p.brand)+'</p>'+(p.variant?'<span>'+esc(p.variant)+'</span>':'')+'</div>'
      +'<div class="catalog-purchase"><button class="primary" data-add="'+esc(p.key)+'">Toevoegen aan boodschappenlijst</button></div>'
      +(info?(p.meter.startsWith('diepvries-schap-')?'<section>'+info+'</section>':'<section><h3>'+(p.isWine?'Productinformatie / wijnstijl':'Productinformatie')+'</h3>'+info+'</section>'):'')
      +(p.ingredients?'<section><h3>'+(p.ingredientsPartial?'Bekende ingrediënten':'Ingrediënten')+'</h3><p>'+window.KPI_emphasizeAllergens(p.ingredients)+'</p>'+(p.ingredientNote||p.ingredientsNote?'<p>'+esc(p.ingredientNote||p.ingredientsNote)+'</p>':'')+'</section>':'')
      +(p.catalogType==='nonfood'&&p.composition?'<section class="product-composition"><h3>'+esc(p.composition.heading||'Ingrediënten (INCI)')+'</h3>'+(p.composition.text?'<p>'+esc(p.composition.text)+'</p>':'')+(p.composition.note?'<p class="composition-note">'+esc(p.composition.note)+'</p>':'')+'</section>':'')
      +(p.catalogType!=='nonfood'?'<section><h3>Allergenen</h3><div class="allergen-list">'+allergens+'</div>'+(p.allergenNote?'<p>'+esc(p.allergenNote)+'</p>':'')+'</section>':'')
      +section('Kan bevatten',p.mayContain)+section('Waarschuwing',p.warning)
      +(kosher?'<section class="hechsher"><h3>Hechser</h3><p class="notranslate" translate="no">'+kosher+'</p></section>':'')
      +'<section class="ean'+(p.nutrition?' ean-with-nutrition':'')+'"><h3>Barcode / EAN</h3><p>'+esc(p.ean||'Niet bekend')+'</p></section>'
      +(p.nutrition?'<section class="nutrition"><h3>Voedingswaarden '+esc(p.nutritionUnit||'per 100 g')+'</h3><table class="nutrition-table"><tbody>'+Object.entries(p.nutrition).map(([label,value])=>'<tr><th scope="row">'+esc(label)+'</th><td>'+esc(value)+'</td></tr>').join('')+'</tbody></table></section>':'')+'</div>';
    window.KPI_normalizeProductLayout($('#product-detail'), p);
    const productDialog = $('#product-dialog'); if (!productDialog.open) productDialog.showModal();
    window.CatalogTranslation?.refresh();
  }
  function cartRows(){return Object.entries(cart).map(([key,qty])=>({p:products.find(p=>p.key===key),qty,key})).filter(row=>row.p);}
  function renderCart(){window.CatalogTranslation?.beforeUpdate();const rows=cartRows();const total=rows.reduce((sum,row)=>sum+row.qty,0);$('#cart-summary').textContent=`${total} ${total===1?'artikel':'artikelen'} · ${rows.length} ${rows.length===1?'product':'verschillende producten'}`;$('#cart-items').innerHTML=rows.length?rows.map(({p,qty,key})=>`<div class="cart-item">${p.image?image(p):'<div></div>'}<div><span class="brand notranslate" translate="no">${esc(p.brand)}</span><h3 data-source-title="${esc(p.name)}">${esc(p.name)}</h3><p>${esc(p.variant)}</p><div class="quantity"><button data-minus="${key}" aria-label="Eén minder ${esc(p.name)}">−</button><input type="number" min="1" max="999" value="${qty}" data-qty="${key}" aria-label="Aantal ${esc(p.name)}"><button data-plus="${key}" aria-label="Eén meer ${esc(p.name)}">+</button><button class="remove" data-remove="${key}">Verwijderen</button></div></div></div>`).join(''):'<div class="empty-cart"><h3>Uw boodschappenlijst is nog leeg</h3><p>Ontdek het assortiment en voeg uw favorieten toe.</p><button class="outline" data-close="cart-dialog">Verder kijken</button></div>';$('#whatsapp-share').hidden=!rows.length;window.CatalogTranslation?.refresh();}
  function openCart(){renderCart();$('#cart-dialog').showModal();window.CatalogTranslation?.refresh();}
  document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.add)add(b.dataset.add);if(b.dataset.product)openProduct(b.dataset.product);if(b.dataset.close)document.getElementById(b.dataset.close).close();if(b.dataset.group)selectCategory(b.dataset.group);if(b.dataset.category){selectCategory(b.dataset.category==='Diepvries'?'frozen':'home');$('#assortiment').scrollIntoView();}if(b.dataset.remove){delete cart[b.dataset.remove];save();renderCart();}if(b.dataset.minus||b.dataset.plus){const k=b.dataset.minus||b.dataset.plus;cart[k]=Math.max(1,Math.min(999,cart[k]+(b.dataset.plus?1:-1)));save();renderCart();}});
  $('#cart-items').addEventListener('change',e=>{if(e.target.dataset.qty){cart[e.target.dataset.qty]=Math.max(1,Math.min(999,parseInt(e.target.value,10)||1));save();renderCart();}});
  $('#whatsapp-share').addEventListener('submit',event=>{event.preventDefault();const input=$('#whatsapp-phone');if(!input.reportValidity())return;const raw=input.value.trim();let digits=raw.replace(/\D/g,'');if(raw.startsWith('00'))digits=digits.slice(2);else if(!raw.startsWith('+')){input.setCustomValidity('Gebruik een internationaal nummer met landnummer, bijvoorbeeld +31 6 12345678.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;}if(digits.length<8){input.setCustomValidity('Controleer het telefoonnummer en landnummer.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;}const rows=cartRows();if(!rows.length)return;const lines=rows.map(({p,qty})=>`${qty}x ${[p.brand,p.name,p.variant].filter(Boolean).join(' ')}`);const message=lines.join('\n');const link=document.createElement('a');link.href=`https://wa.me/${digits}?text=${encodeURIComponent(message)}`;link.target='_blank';link.rel='noopener noreferrer';link.click();});
  $('#cart-open').onclick=openCart;$('#cart-bottom').onclick=openCart;$('#search').oninput=render;$('#sort').onchange=render;
  for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
  updateCount();
  async function load(){for(const source of sources){try{await new Promise((resolve,reject)=>{window.KPI_PRODUCTS=undefined;const script=document.createElement('script');script.src=new URL(source.data+'?catalog='+Date.now(),root);script.onload=resolve;script.onerror=reject;document.head.append(script);});const list=window.KPI_PRODUCTS;if(!Array.isArray(list))throw Error('Invalid data');for(const original of list){if(original.temporarilyHidden)continue;if(original.detailsPending && source.folder!=='koeling-schap-2')continue;products.push({...original,key:`${source.folder}:${original.id}`,meter:source.folder,meterTitle:source.title,group:classify(original,source.n,source.folder),image:original.image?new URL(original.image,new URL(source.folder+'/',root)).href:''});}}catch{failures.push(source.folder);}}
    if(failures.length){$('#load-error').hidden=false;$('#load-error').textContent='Een deel van het assortiment kon niet worden geladen. Vernieuw de pagina om het opnieuw te proberen.';}
    window.CATALOG_GROUPS=sources.map(source=>({title:source.title,products:products.filter(p=>p.meter===source.folder)}));
    await sharedScript(new URL('assets/js/apply-photo-layout.js',root).href);
    // Existing product files are the only source; there is no separate catalogue copy.
    renderCategories();render();const picks=[products.find(p=>p.key==='meter-8:56'),products.find(p=>p.key==='meter-6:48'),products.find(p=>p.key==='meter-13:1')].filter(p=>p?.image);if($('#hero-products'))$('#hero-products').innerHTML=picks.map(p=>image(p)).join('');
    for(const key of Object.keys(cart))if(!products.some(p=>p.key===key)&&!failures.length)delete cart[key];save();
    await sharedScript(new URL('photo-layout.js?v=20261010-cart-space',location.href).href);
    window.catalogPreview={get products(){return products;},get cart(){return {...cart};},failures};
  }
  load();
})();
