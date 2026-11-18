(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numbers={een:1,twee:2,drie:3,vier:4,vijf:5,zes:6,zeven:7,acht:8,negen:9,tien:10,elf:11,twaalf:12,dertien:13,veertien:14,vijftien:15,zestien:16,zeventien:17,achttien:18,negentien:19,twintig:20};
  function parse(value){
    let text=String(value||'').trim().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
    let previous;
    do{previous=text;text=text.replace(/^(?:ik wil(?: graag)?|graag|voeg|doe(?: maar)?)\s+/i,'');}while(previous!==text);
    text=text.replace(/\s+(?:toevoegen|toe)(?:\s+aan (?:mijn|de|het|uw) (?:boodschappenlijst(?:je)?|winkelwagen))?$/i,'').trim();
    const normalized=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const quantity=normalized.match(/^(\d{1,3}|een|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien|veertien|vijftien|zestien|zeventien|achttien|negentien|twintig)(?:\s*[x×]\s*|\s+)/);
    let count=1;
    if(quantity&&!/^7 days\b/i.test(text)){
      count=Number(quantity[1])||numbers[quantity[1]]||1;
      text=text.slice(quantity[0].length).replace(/^(?:pakken|pak|potten|pot|flessen|fles|zakken|zak|stuks|stuk|blikken|blik|dozen|doos)\s+/i,'');
    }
    return {query:text.trim(),quantity:Math.max(1,Math.min(999,count))};
  }
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
    choices=catalog.products.filter(p=>window.CatalogSearch.matches(p,query)).sort((a,b)=>{
      const rank=p=>window.CatalogSearch.normalize(p.name)===query?0:window.CatalogSearch.normalize(p.name).startsWith(query)?1:2;
      return rank(a)-rank(b);
    });
    status(choices.length?'Kies het juiste product en controleer het aantal.':'Geen producten gevonden. Pas de tekst aan of spreek opnieuw in.');
    $('#voice-results').innerHTML=choices.map((p,i)=>`<article class="voice-result">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:'<span></span>'}<div><span class="brand">${esc(p.brand)}</span><h3>${esc(p.name)}</h3><p>${esc(p.variant)}</p><button type="button" class="outline" data-voice-choice="${i}">Toevoegen</button></div></article>`).join('');
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
    local.start({
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
    active.lang='nl-NL';active.continuous=false;active.interimResults=false;active.maxAlternatives=1;
    active.onstart=()=>{if(token===session){status('Ik luister. Noem één product en eventueel een aantal.');$('#voice-listen').textContent='Klaar met inspreken';}};
    active.onresult=event=>{
      if(token!==session)return;
      const text=event.results?.[0]?.[0]?.transcript||'';
      $('#voice-text').value=text;search(text);
    };
    active.onerror=event=>{if(token!==session)return;if(['service-not-allowed','network','language-not-supported'].includes(event.error)){prepareLocal();return;}status(({'not-allowed':'Microfoontoegang is geblokkeerd. Sta de microfoon toe voor deze website.','service-not-allowed':'Spraakherkenning is niet beschikbaar in deze browser. Gebruik het tekstveld.','audio-capture':'Geen microfoon beschikbaar. Controleer de microfoon op uw toestel.','no-speech':'Ik heb niets verstaan. Probeer opnieuw of typ de productnaam.','network':'De spraakherkenning kon geen verbinding maken. Probeer opnieuw of typ de productnaam.','aborted':'Inspreken gestopt.'})[event.error]||'Inspreken is niet gelukt. Probeer opnieuw of typ de productnaam.');};
    active.onend=()=>{if(token===session){recognition=null;$('#voice-listen').textContent='Opnieuw inspreken';}};
    try{status('Microfoon starten…');active.start();}catch{stop();status('De microfoon kon niet starten. Probeer opnieuw of gebruik het tekstveld.');}
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-voice-open]')){
      if(!dialog.open)dialog.showModal();listen();return;
    }
    const choice=event.target.closest('[data-voice-choice]');if(!choice)return;
    const p=choices[Number(choice.dataset.voiceChoice)];const amount=$('#voice-quantity');
    if(!p||!amount.reportValidity()||!window.catalogActions)return;
    stop();window.catalogActions.addToCart(p.key,Number(amount.value));status(amount.value+' × '+p.name+' toegevoegd aan uw boodschappenlijst.');choice.textContent='Toegevoegd';choice.disabled=true;
  });
  $('#voice-listen').onclick=listen;
  const localButton=$('#voice-local');if(localButton)localButton.onclick=prepareLocal;
  $('#voice-search').addEventListener('submit',event=>{event.preventDefault();stop();search($('#voice-text').value);});
  dialog.addEventListener('close',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
