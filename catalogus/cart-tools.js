(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let stream, generation=0;
  const status=message=>$('#scan-status').textContent=message;
  function stop(){generation++;stream?.getTracks().forEach(track=>track.stop());stream=null;$('#barcode-video').srcObject=null;$('#barcode-video').hidden=true;}
  function find(value){
    const code=String(value).replace(/\D/g,'');
    if(code.length<8){status('Voer een barcode in van minimaal 8 cijfers.');return;}
    const products=window.catalogPreview?.products;
    if(!products){status('De producten worden nog geladen. Probeer het zo opnieuw.');return;}
    const canonical=s=>String(s||'').replace(/\D/g,'').replace(/^0+(?=\d)/,'');
    const found=products.filter(p=>canonical(p.ean)===canonical(code));
    if(!found.length){status('Geen product gevonden bij deze barcode. Controleer het nummer of zoek op naam.');return;}
    stop();$('#cart-dialog').close();$('#search').value=String(found[0].ean);$('#search').dispatchEvent(new Event('input'));$('#assortiment').scrollIntoView({behavior:'smooth'});
  }
  $('#barcode-form').addEventListener('submit',e=>{e.preventDefault();find($('#barcode-input').value);});
  $('#scan-stop').onclick=()=>{stop();status('Camera gestopt.');};
  $('#scan-start').onclick=async()=>{
    stop();const token=generation;
    if(!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia){status('Deze browser ondersteunt geen camerascanner. Gebruik een losse scanner of voer de barcode hieronder in.');return;}
    try {
      const supported=await BarcodeDetector.getSupportedFormats();
      const formats=['ean_13','ean_8','upc_a','upc_e','code_128'].filter(f=>supported.includes(f));
      if(token!==generation)return;
      if(!formats.length){status('Deze browser ondersteunt geen geschikte productbarcodes. Gebruik de barcode-invoer.');return;}
      const detector=new BarcodeDetector({formats});
      const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
      stream=acquired;const video=$('#barcode-video');video.hidden=false;video.srcObject=stream;await video.play();if(token!==generation)return;status('Houd de barcode stil en goed verlicht voor de camera.');
      let errors=0;
      const scan=async()=>{if(token!==generation)return;try{const codes=await detector.detect(video);if(token!==generation)return;errors=0;if(codes.length){$('#barcode-input').value=codes[0].rawValue;find(codes[0].rawValue);if(token!==generation)return;}}catch{if(token!==generation)return;if(++errors>=3){stop();status('De camera kan de barcode niet uitlezen. Probeer opnieuw of voer de barcode in.');return;}}if(token===generation)setTimeout(scan,300);};scan();
    }catch{if(token===generation){stop();status('Camera niet beschikbaar. Controleer cameratoegang en of een camera is aangesloten, of gebruik de barcode-invoer.');}}
  };
  $('#cart-dialog').addEventListener('close',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const base64=bytes=>{let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);};
  const wrap=s=>s.match(/.{1,76}/g)?.join('\r\n')||'';
  $('#email-export').onclick=async()=>{
    const button=$('#email-export');const rows=Object.entries(window.catalogPreview?.cart||{}).map(([key,qty])=>({p:window.catalogPreview.products.find(p=>p.key===key),qty})).filter(r=>r.p);
    if(!rows.length){$('#email-status').textContent='Voeg eerst producten toe aan uw boodschappenlijst.';return;}
    button.disabled=true;$('#email-status').textContent='E-mail met productfoto’s voorbereiden…';
    try{
      const boundary='catalog-'+crypto.randomUUID();const parts=[];let html='<html><body style="font-family:Arial,sans-serif;color:#183b30;max-width:640px;margin:24px auto"><h1>Uw boodschappenlijst</h1><p>'+rows.reduce((sum,row)=>sum+row.qty,0)+' artikelen · '+rows.length+' verschillende producten</p><table style="width:100%;border-collapse:collapse">';
      for(const [i,{p,qty}] of rows.entries()){
        let photo='';
        if(p.image){const response=await fetch(p.image);if(!response.ok)throw Error('photo');const blob=await response.blob();const type=blob.type.split(';')[0];if(!/^image\/(jpeg|png|webp|gif|avif)$/.test(type))throw Error('photo');parts.push(`--${boundary}\r\nContent-Type: ${type}\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <product-${i}>\r\nContent-Disposition: inline\r\n\r\n${wrap(base64(new Uint8Array(await blob.arrayBuffer())))}`);photo=`<img src="cid:product-${i}" width="100" style="width:100px;height:110px;object-fit:contain" alt="${esc(p.name)}">`;}
        html+=`<tr><td style="width:112px;padding:16px 0;border-bottom:1px solid #ddd">${photo}</td><td style="padding:16px 0;border-bottom:1px solid #ddd"><span style="font-size:14px">${esc(p.brand)}</span><h2 style="font-size:18px;margin:6px 0">${esc(p.name)}</h2><p style="margin:6px 0">${esc(p.variant)}</p><strong>Aantal: ${qty}</strong></td></tr>`;
      }
      html+='</table></body></html>';
      const message=`X-Unsent: 1\r\nSubject: Mijn boodschappenlijst\r\nMIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(base64(new TextEncoder().encode(html)))}\r\n${parts.join('\r\n')}\r\n--${boundary}--\r\n`;
      const url=URL.createObjectURL(new Blob([message],{type:'message/rfc822'}));const link=document.createElement('a');link.href=url;link.download='boodschappenlijst.eml';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
      $('#email-status').textContent='E-mailbestand gedownload met foto’s en aantallen. Open het in uw e-mailprogramma, kies de ontvanger en verstuur het. De ondersteuning voor openen als concept verschilt per e-mailprogramma.';
    }catch{$('#email-status').textContent='De foto’s konden niet allemaal worden geladen. Probeer het opnieuw; er is geen onvolledige e-mail gemaakt.';}finally{button.disabled=false;}
  };
})();
