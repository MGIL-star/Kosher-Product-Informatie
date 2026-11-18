(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const language=()=>window.CatalogVoiceLanguages.canonical(window.CatalogTranslation?.language||'nl');
  const spoken=()=>window.CatalogVoiceLanguages.config(language());
  const parse=(value,code=language())=>window.CatalogVoiceLanguages.parse(value,code);
  function showLanguage(){const d=spoken(),label=$('#voice-language');if(label)label.textContent=d.label;const field=$('#voice-text');field.lang=d.locale;}
  window.CatalogVoice={parse};
  const dialog=$('#voice-dialog');
  let recognition=null,session=0,choices=[],local=null,localMode=false;
  const status=message=>$('#voice-status').textContent=message;
  function stop(){session++;local?.cancel();$('#voice-listen').disabled=false;const active=recognition;recognition=null;if(active){active.onresult=active.onerror=active.onend=active.onstart=null;try{active.abort();}catch{}}$('#voice-listen').textContent='Opnieuw inspreken';}
  function search(value){
    const request=parse(value);$('#voice-quantity').value=request.quantity;
    const catalog=window.catalogPreview;
    if(!catalog){status('De producten worden nog geladen. Probeer het zo opnieuw.');return;}
    if(!request.query){status('Noem een product, bijvoorbeeld twee pakken melk.');choices=[];$('#voice-results').innerHTML='';return;}
    const query=window.CatalogSearch.normalize(request.query);
    const translated=window.CatalogTranslation?.getProductNames?.()||new Map();
    choices=catalog.products.filter(p=>window.CatalogSearch.matches(p,query,translated.get(p.key)||'')).sort((a,b)=>{
      const rank=p=>window.CatalogSearch.normalize(p.name)===query?0:window.CatalogSearch.normalize(p.name).startsWith(query)?1:2;
      return rank(a)-rank(b);
    });
    status(choices.length?'Kies het juiste product en controleer het aantal.':'Geen producten gevonden. Pas de tekst aan of spreek opnieuw in.');
    $('#voice-results').innerHTML=choices.map((p,i)=>`<article class="voice-result">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:'<span></span>'}<div><span class="brand notranslate" translate="no">${esc(p.brand)}</span><h3 data-source-title="${esc(p.name)}">${esc(p.name)}</h3><p>${esc(p.variant)}</p><button type="button" class="outline" data-voice-choice="${i}">Toevoegen</button></div></article>`).join('');
    window.CatalogTranslation?.refresh?.();
  }
  async function prepareLocal(){
    stop();localMode=true;
    const Local=window.CatalogLocalSpeech;
    if(!Local||!(local ||= new Local()).supported()){
      status('Deze browser kan geen spraakherkenner starten. U kunt de productnaam typen of de dicteerknop op uw toetsenbord gebruiken.');$('#voice-text').focus?.();return;
    }
    const token=session;const progressFiles=new Map();$('#voice-listen').disabled=true;$('#voice-listen').textContent='Spraakherkenning laden…';
    status('De extra spraakherkenning wordt op uw toestel geladen. Dit kan de eerste keer even duren. Uw opname blijft op uw toestel.');
    try{
      await local.load(progress=>{
        if(token!==session)return;
        if(progress.status==='progress'&&progress.file){progressFiles.set(progress.file,progress.loaded||0);const mb=Math.floor([...progressFiles.values()].reduce((a,b)=>a+b,0)/1048576);status('Extra spraakherkenning laden… '+mb+' MB ontvangen. Bij de eerste keer kan dit even duren.');}
      });
      if(token!==session)return;$('#voice-listen').disabled=false;$('#voice-listen').textContent='Inspreken op dit toestel';status('De extra spraakherkenning is klaar. Klik op Inspreken op dit toestel, spreek uw product in en klik daarna op Klaar met inspreken.');
    }catch{if(token===session){local.cancel();$('#voice-listen').disabled=false;$('#voice-listen').textContent='Opnieuw laden';status('De extra spraakherkenning kon niet laden. Controleer uw internetverbinding en probeer opnieuw, of gebruik de dicteerknop op uw toetsenbord.');}}
  }
  function listenLocal(){
    if(!local?.ready){prepareLocal();return;}
    if(local.listening){local.finish();return;}
    if(local.busy){status('Uw opname wordt nog herkend. Even geduld.');return;}
    const token=++session;
    local.start({language:language(),
      onStart:()=>{if(token===session){$('#voice-listen').textContent='Klaar met inspreken';status('Ik luister. Noem één product en een aantal. Klik daarna op Klaar met inspreken.');}},
      onStatus:message=>{if(token===session){$('#voice-listen').textContent='Even geduld…';status(message);}},
      onResult:text=>{if(token===session){$('#voice-listen').textContent='Opnieuw inspreken';$('#voice-text').value=text;search(text);}},
      onError:message=>{if(token===session){$('#voice-listen').textContent='Opnieuw inspreken';status(message);}}
    });
  }
  function listen(){
    if(localMode){listenLocal();return;}
    if(recognition){recognition.stop();return;}
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Recognition){prepareLocal();return;}
    const token=++session;const active=new Recognition();recognition=active;
    active.lang=spoken().locale;active.continuous=false;active.interimResults=false;active.maxAlternatives=5;
    active.onstart=()=>{if(token===session){status('Ik luister. Noem één product en eventueel een aantal.');$('#voice-listen').textContent='Klaar met inspreken';}};
    active.onresult=event=>{
      if(token!==session)return;
      const alternatives=Array.from(event.results?.[0]||[]).map(result=>result.transcript).filter(Boolean);
      const names=window.CatalogTranslation?.getProductNames?.()||new Map();
      const score=text=>{const query=window.CatalogSearch.normalize(parse(text).query);if(!query)return 0;return Math.max(0,...(window.catalogPreview?.products||[]).map(p=>window.CatalogSearch.normalize(p.name+' '+(names.get(p.key)||'')).includes(query)?3:window.CatalogSearch.matches(p,query,names.get(p.key)||'')?1:0));};
      const text=alternatives.map((text,index)=>({text,index,score:score(text)})).sort((a,b)=>b.score-a.score||a.index-b.index)[0]?.text||'';
      $('#voice-text').value=text;search(text);
    };
    active.onerror=event=>{if(token!==session)return;if(['service-not-allowed','network','language-not-supported'].includes(event.error)){prepareLocal();return;}status(({'not-allowed':'Microfoontoegang is geblokkeerd. Sta de microfoon toe voor deze website.','service-not-allowed':'Spraakherkenning is niet beschikbaar in deze browser. Gebruik het tekstveld.','audio-capture':'Geen microfoon beschikbaar. Controleer de microfoon op uw toestel.','no-speech':'Ik heb niets verstaan. Probeer opnieuw of typ de productnaam.','network':'De spraakherkenning kon geen verbinding maken. Probeer opnieuw of typ de productnaam.','aborted':'Inspreken gestopt.'})[event.error]||'Inspreken is niet gelukt. Probeer opnieuw of typ de productnaam.');};
    active.onend=()=>{if(token===session){recognition=null;$('#voice-listen').textContent='Opnieuw inspreken';}};
    try{status('Microfoon starten…');active.start();}catch{stop();status('De microfoon kon niet starten. Probeer opnieuw of gebruik het tekstveld.');}
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-voice-open]')){
      showLanguage();if(!dialog.open)dialog.showModal();listen();return;
    }
    const choice=event.target.closest('[data-voice-choice]');if(!choice)return;
    const p=choices[Number(choice.dataset.voiceChoice)];const amount=$('#voice-quantity');
    if(!p||!amount.reportValidity()||!window.catalogActions)return;
    stop();window.catalogActions.addToCart(p.key,Number(amount.value));status(amount.value+' × '+p.name+' toegevoegd aan uw boodschappenlijst.');choice.textContent='Toegevoegd';choice.disabled=true;
  });
  $('#voice-listen').onclick=()=>{showLanguage();listen();};
  window.addEventListener?.('catalog:language-changed',()=>{stop();choices=[];$('#voice-results').innerHTML='';$('#voice-text').value='';showLanguage();if(dialog.open)status('De spreektaal is gewijzigd. Spreek uw product opnieuw in.');});
  const localButton=$('#voice-local');if(localButton)localButton.onclick=prepareLocal;
  $('#voice-search').addEventListener('submit',event=>{event.preventDefault();stop();search($('#voice-text').value);});
  dialog.addEventListener('close',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
