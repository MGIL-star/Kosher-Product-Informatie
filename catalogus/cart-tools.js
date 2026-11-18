(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  let stream, generation=0;
  const status=message=>{ $('#scan-status').textContent=message; const cameraStatus=$('#camera-status');if(cameraStatus)cameraStatus.textContent=message; };
  function stop(){generation++;stream?.getTracks().forEach(track=>track.stop());stream=null;$('#barcode-video').srcObject=null;$('#barcode-video').hidden=true;}
  function find(value){
    const code=String(value).replace(/\D/g,'');
    if(code.length<8){status('Voer een barcode in van minimaal 8 cijfers.');return;}
    const products=window.catalogPreview?.products;
    if(!products){status('De producten worden nog geladen. Probeer het zo opnieuw.');return;}
    const canonical=s=>String(s||'').replace(/\D/g,'').replace(/^0+(?=\d)/,'');
    const found=products.filter(p=>canonical(p.ean)===canonical(code));
    if(!found.length){status('Geen product gevonden bij deze barcode. Controleer het nummer of zoek op naam.');return;}
    stop();$('#scanner-dialog')?.close();$('#cart-dialog').close();$('#search').value=String(found[0].ean);$('#search').dispatchEvent(new Event('input'));$('#assortiment').scrollIntoView({behavior:'smooth'});
  }
  $('#barcode-form').addEventListener('submit',e=>{e.preventDefault();find($('#barcode-input').value);});
  $('#scan-stop').onclick=()=>{stop();status('Camera gestopt.');};
  function cameraError(error){
    if(error?.name==='NotAllowedError'||error?.name==='SecurityError')return 'Cameratoegang is geblokkeerd. Sta de camera toe voor deze website in uw browserinstellingen en probeer opnieuw.';
    if(error?.name==='NotFoundError')return 'Geen camera gevonden. Controleer of er een camera is aangesloten.';
    if(error?.name==='NotReadableError')return 'De camera is al in gebruik of niet beschikbaar. Sluit andere camera-apps en probeer opnieuw.';
    return 'De camera kon niet starten. Probeer opnieuw of open de catalogus in Safari, Chrome of Edge.';
  }
  function fallbackDetector(){
    const Reader=window.ZXingBrowser?.BrowserMultiFormatOneDReader;
    if(!Reader)throw Error('Scanner unavailable');
    const reader=new Reader();let canvas;
    const expected=error=>['NotFoundException','ChecksumException','FormatException'].includes(error?.getKind?.()||error?.name);
    return {async detect(video){
      if(!video.videoWidth||!video.videoHeight)return [];
      try{return [{rawValue:reader.decode(video).getText()}];}catch(error){if(!expected(error))throw error;}
      canvas ||= document.createElement('canvas');
      // Enlarge the centre band without losing the original camera resolution.
      const sw=video.videoWidth*.92,sh=video.videoHeight*.5;
      canvas.width=Math.min(1500,Math.round(sw));canvas.height=Math.round(canvas.width*sh/sw);
      let ctx=canvas.getContext('2d');ctx.drawImage(video,(video.videoWidth-sw)/2,(video.videoHeight-sh)/2,sw,sh,0,0,canvas.width,canvas.height);
      try{return [{rawValue:reader.decodeFromCanvas(canvas).getText()}];}catch(error){if(!expected(error))throw error;}
      // Sideways barcodes need horizontal scan lines too.
      const scale=Math.min(1,1500/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.round(video.videoHeight*scale);canvas.height=Math.round(video.videoWidth*scale);
      ctx=canvas.getContext('2d');ctx.translate(canvas.width,0);ctx.rotate(Math.PI/2);ctx.drawImage(video,0,0,canvas.height,canvas.width);
      try{return [{rawValue:reader.decodeFromCanvas(canvas).getText()}];}catch(error){if(!expected(error))throw error;}
      return [];
    }};
  }
  $('#scan-start').onclick=async()=>{
    stop();const token=generation;
    if(window.isSecureContext===false){status('Open de catalogus via een beveiligde https-verbinding om de camera te gebruiken.');return;}
    if(!navigator.mediaDevices?.getUserMedia){status('Deze browser geeft geen cameratoegang. Open de catalogus in Safari, Chrome of Edge, of voer de barcode in.');return;}
    status('Camera starten… Sta cameratoegang toe als uw browser daarom vraagt.');
    try {
      let detector;
      if(window.BarcodeDetector){
        try{
          const supported=await window.BarcodeDetector.getSupportedFormats();
          const formats=['ean_13','ean_8','upc_a','upc_e','code_128'].filter(f=>supported.includes(f));
          if(formats.length)detector=new window.BarcodeDetector({formats});
        }catch{/* Use the bundled scanner when the native detector cannot start. */}
      }
      if(token!==generation)return;
      const fallback=window.ZXingBrowser?fallbackDetector():null;
      const native=detector;
      detector={async detect(video){
        if(native){try{const codes=await native.detect(video);if(codes.length)return codes;}catch(error){if(!fallback)throw error;}}
        return fallback?fallback.detect(video):[];
      }};
      if(!native&&!fallback)throw Error('Scanner unavailable');
      let acquired;
      try{acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});}
      catch(error){if(error?.name!=='OverconstrainedError'||token!==generation)throw error;acquired=await navigator.mediaDevices.getUserMedia({video:true,audio:false});}
      if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
      stream=acquired;const track=acquired.getVideoTracks?.()[0];
      try{if(track?.getCapabilities?.().focusMode?.includes('continuous'))track.applyConstraints({advanced:[{focusMode:'continuous'}]}).catch(()=>{});}catch{}
      const cameraDialog=$('#scanner-dialog');if(cameraDialog&&!cameraDialog.open)cameraDialog.showModal();
      const video=$('#barcode-video');video.hidden=false;video.muted=true;video.setAttribute('playsinline','');video.setAttribute('autoplay','');video.srcObject=stream;await video.play();if(token!==generation)return;status('Houd de volledige barcode in het midden, op ongeveer 15–25 cm afstand. Zorg voor scherp beeld en voldoende licht.');
      let errors=0;
      const scan=async()=>{
        if(token!==generation)return;
        try{
          const codes=await detector.detect(video);if(token!==generation)return;errors=0;
          if(codes.length){$('#barcode-input').value=codes[0].rawValue;find(codes[0].rawValue);if(token!==generation)return;}
        }catch{
          if(token!==generation)return;
          if(++errors>=3){
            stop();status('De camera kan de barcode niet uitlezen. Probeer opnieuw of voer de barcode in.');return;
          }
        }
        if(token===generation)setTimeout(scan,300);
      };scan();
    }catch(error){if(token===generation){stop();status(cameraError(error));}}
  };
  $('#cart-dialog').addEventListener('close',()=>{stop();$('#scanner-dialog')?.close();});
  $('#scanner-dialog')?.addEventListener('close',stop);
  const cameraClose=$('#camera-close');if(cameraClose)cameraClose.onclick=()=>{stop();$('#scanner-dialog').close();};
  const cameraRetry=$('#camera-retry');if(cameraRetry)cameraRetry.onclick=()=>$('#scan-start').onclick();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
