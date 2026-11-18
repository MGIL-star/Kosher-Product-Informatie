(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const language=()=>window.CatalogVoiceLanguages.canonical(window.CatalogTranslation?.language||'nl');
  const parse=(value,code=language())=>window.CatalogVoiceLanguages.parse(value,code);
  const messages={
    nl:{help:'Tik op het microfoontje op uw toetsenbord en spreek in. Gebruik dezelfde toetsenbordtaal als de catalogus. Controleer daarna het product en het aantal.',loading:'De producten worden nog geladen. Probeer het zo opnieuw.',empty:'Spreek bijvoorbeeld appelsap, chips of twee pakken melk in.',none:'Geen passende producten gevonden. Controleer de tekst of spreek opnieuw in.',found:n=>n+' passende producten gevonden. Kies het juiste product en controleer het aantal.',added:(n,name)=>n+' × '+name+' toegevoegd aan uw boodschappenlijst.'},
    en:{help:'Tap the microphone on your keyboard and speak. Use the same keyboard language as the catalogue. Then check the product and quantity.',loading:'The products are still loading. Please try again shortly.',empty:'Say apple juice, chips, or two bottles of milk, for example.',none:'No matching products found. Check the text or dictate again.',found:n=>n+' matching products found. Choose the right product and check the quantity.',added:(n,name)=>n+' × '+name+' added to your shopping list.'},
    fr:{help:'Touchez le microphone du clavier et parlez. Utilisez la même langue pour le clavier et le catalogue. Vérifiez ensuite le produit et la quantité.',loading:'Les produits sont encore en cours de chargement. Réessayez dans un instant.',empty:'Dites par exemple jus de pomme, chips ou deux bouteilles de lait.',none:'Aucun produit correspondant. Vérifiez le texte ou dictez à nouveau.',found:n=>n+' produits correspondants. Choisissez le bon produit et vérifiez la quantité.',added:(n,name)=>n+' × '+name+' ajouté à votre liste de courses.'},
    iw:{help:'לחצו על המיקרופון במקלדת ודברו. השתמשו באותה שפה במקלדת ובקטלוג. לאחר מכן בדקו את המוצר ואת הכמות.',loading:'המוצרים עדיין נטענים. נסו שוב בעוד רגע.',empty:'אמרו למשל מיץ תפוחים, חטיפים או שני בקבוקי חלב.',none:'לא נמצאו מוצרים מתאימים. בדקו את הטקסט או הכתיבו שוב.',found:n=>'נמצאו '+n+' מוצרים מתאימים. בחרו את המוצר ובדקו את הכמות.',added:(n,name)=>n+' × '+name+' נוספו לרשימת הקניות.'}
  };
  const ui=()=>messages[language()];
  const dialog=$('#voice-dialog'),field=$('#voice-text');
  let choices=[],timer,composing=false;
  window.CatalogVoice={parse};
  const status=message=>$('#voice-status').textContent=message;
  function stop(){clearTimeout(timer);timer=null;}
  function showLanguage(){const d=window.CatalogVoiceLanguages.config(language());$('#voice-language').textContent=d.label;field.lang=d.locale;field.dir=language()==='iw'?'rtl':'ltr';$('#voice-keyboard-help').textContent=ui().help;}
  function search(value){
    stop();const request=parse(value);$('#voice-quantity').value=request.quantity;
    const catalog=window.catalogPreview;
    if(!catalog){status(ui().loading);return;}
    if(!request.query){choices=[];$('#voice-results').innerHTML='';status(ui().empty);return;}
    const query=window.CatalogSearch.normalize(request.query);
    const translated=window.CatalogTranslation?.getProductNames?.()||new Map();
    choices=catalog.products.filter(p=>window.CatalogSearch.matches(p,query,translated.get(p.key)||'')).sort((a,b)=>{
      const rank=p=>window.CatalogSearch.normalize(p.name)===query?0:window.CatalogSearch.normalize(p.name).startsWith(query)?1:2;
      return rank(a)-rank(b);
    });
    status(choices.length?ui().found(choices.length):ui().none);
    $('#voice-results').innerHTML=choices.map((p,i)=>`<article class="voice-result">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:'<span></span>'}<div><span class="brand notranslate" translate="no">${esc(p.brand)}</span><h3 data-source-title="${esc(p.name)}">${esc(p.name)}</h3><p>${esc(p.variant)}</p><button type="button" class="outline" data-voice-choice="${i}">Toevoegen</button></div></article>`).join('');
    if(!choices.length)$('#voice-results').innerHTML=window.CatalogSearch.suggestions(request.query).map(item=>'<button type="button" class="outline" data-voice-suggest="'+esc(item.query)+'">'+esc(item.label)+'</button>').join('');
    window.CatalogTranslation?.refresh?.();
  }
  function openKeyboard(){showLanguage();field.focus({preventScroll:true});status('');}
  function schedule(){stop();if(composing||!dialog.open)return;timer=setTimeout(()=>{if(dialog.open)search(field.value);},650);}
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-voice-open]')){if(!dialog.open)dialog.showModal();openKeyboard();return;}
    const suggestion=event.target.closest('[data-voice-suggest]');if(suggestion){field.value=$('#voice-quantity').value+' '+suggestion.dataset.voiceSuggest;field.blur();search(field.value);return;}
    const choice=event.target.closest('[data-voice-choice]');if(!choice||choice.disabled)return;
    const p=choices[Number(choice.dataset.voiceChoice)],amount=$('#voice-quantity');
    if(!p||!amount.reportValidity()||!window.catalogActions)return;
    stop();field.blur();window.catalogActions.addToCart(p.key,Number(amount.value));
    const name=window.CatalogTranslation?.getProductNames?.().get(p.key)||p.name;
    status(ui().added(amount.value,name));choice.textContent='Toegevoegd';choice.disabled=true;
  });
  $('#voice-keyboard').onclick=openKeyboard;
  $('#voice-search').addEventListener('submit',event=>{event.preventDefault();field.blur();search(field.value);});
  field.addEventListener('input',schedule);
  field.addEventListener('compositionstart',()=>{composing=true;stop();});
  field.addEventListener('compositionend',()=>{composing=false;schedule();});
  dialog.addEventListener('close',()=>{stop();field.blur();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();field.blur();}});
  window.addEventListener?.('catalog:language-changed',()=>{stop();choices=[];$('#voice-results').innerHTML='';field.value='';showLanguage();if(dialog.open)status(ui().help);});
})();
