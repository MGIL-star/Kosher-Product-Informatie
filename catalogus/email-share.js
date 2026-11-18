(() => {
  'use strict';
  const button=document.getElementById('email-share-button');
  const status=document.getElementById('email-status');
  let generation=0,prepared=null,signature='',sharing=false;
  const supported=()=>{
    try{return typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[new File(['preview'],'boodschappenlijst.png',{type:'image/png'})]});}catch{return false;}
  };
  function rows(){
    const catalog=window.catalogPreview;
    return Object.entries(catalog?.cart||{}).map(([key,qty])=>({p:catalog.products.find(p=>p.key===key),qty}));
  }
  function loadImage(url){
    if(!url)return Promise.resolve(null);
    return new Promise((resolve,reject)=>{
      const img=new Image();const timer=setTimeout(()=>{img.onload=img.onerror=null;reject(Error('image-timeout'));},15000);
      img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(Error('image'));};img.src=url;
    });
  }
  function wrap(ctx,value,width){
    const result=[];let line='';
    for(const char of String(value||'')){
      if(char==='\n'||(line&&ctx.measureText(line+char).width>width)){result.push(line.trim());line=char==='\n'?'':char;}
      else line+=char;
    }
    if(line.trim())result.push(line.trim());return result;
  }
  async function createFiles(list,token){
    const measure=document.createElement('canvas').getContext('2d');
    measure.font='600 30px Arial';
    const entries=list.map(row=>({...row,lines:wrap(measure,row.p.name,670)}));
    const pages=[[]];let height=180;
    for(const row of entries){row.height=Math.max(215,row.lines.length*39+125);if(height+row.height>4800&&pages.at(-1).length){pages.push([]);height=180;}pages.at(-1).push(row);height+=row.height;}
    const files=[];
    for(const [pageIndex,page] of pages.entries()){
      if(token!==generation)return null;
      const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=180+page.reduce((sum,row)=>sum+row.height,0);
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#183c32';ctx.font='600 38px Arial';ctx.fillText('Uw boodschappenlijst',40,65);
      ctx.font='24px Arial';const total=list.reduce((sum,row)=>sum+row.qty,0);ctx.fillText(total+' artikelen · '+list.length+' verschillende producten'+(pages.length>1?' · '+(pageIndex+1)+'/'+pages.length:''),40,110);
      let y=155;
      for(const row of page){
        const photo=await loadImage(row.p.image);if(token!==generation)return null;
        ctx.strokeStyle='#e1e7e2';ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(960,y);ctx.stroke();
        if(photo){const scale=Math.min(155/photo.naturalWidth,170/photo.naturalHeight);const w=photo.naturalWidth*scale,h=photo.naturalHeight*scale;ctx.drawImage(photo,40+(155-w)/2,y+20+(170-h)/2,w,h);}
        ctx.fillStyle='#68786e';ctx.font='22px Arial';ctx.fillText(row.p.brand||'',225,y+35,720);
        ctx.fillStyle='#183c32';ctx.font='600 30px Arial';let textY=y+76;for(const line of row.lines){ctx.fillText(line,225,textY);textY+=39;}
        ctx.font='24px Arial';ctx.fillText(row.p.variant||'',225,textY+2,720);ctx.font='600 26px Arial';ctx.fillText('Aantal: '+row.qty,225,textY+45);y+=row.height;
      }
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('image-export')),'image/png'));
      files.push(new File([blob],pages.length===1?'boodschappenlijst.png':'boodschappenlijst-'+(pageIndex+1)+'.png',{type:'image/png'}));
    }
    return files;
  }
  async function prepare(){
    const token=++generation;prepared=null;button.disabled=true;
    if(!supported()){status.textContent='Deze browser kan geen lijst met foto’s rechtstreeks delen. Gebruik hiervoor een browser op uw telefoon met ondersteuning voor het deelmenu.';return;}
    const list=rows();
    if(!list.length){status.textContent='Voeg eerst producten toe aan uw boodschappenlijst.';return;}
    if(list.some(row=>!row.p||!Number.isInteger(row.qty)||row.qty<1)){status.textContent='Niet alle producten zijn geladen. Vernieuw de pagina en probeer opnieuw.';return;}
    signature=JSON.stringify(list.map(row=>[row.p.key,row.qty]));
    status.textContent='Uw lijst met foto’s en aantallen wordt klaargemaakt…';
    try{
      const files=await createFiles(list,token);if(token!==generation||!files)return;
      if(!navigator.canShare({files})){status.textContent='Deze lijst is te groot voor het deelmenu van deze browser. Maak de lijst kleiner en probeer opnieuw.';return;}
      prepared=files;button.disabled=false;status.textContent='Klaar om te delen. Kies Mail in het deelmenu.';
    }catch{if(token===generation){status.textContent='De foto’s konden niet allemaal worden geladen. Open de winkelwagen opnieuw om het nog eens te proberen.';}}
  }
  button.addEventListener('click',async()=>{
    if(sharing||!prepared)return;
    const current=JSON.stringify(rows().map(row=>[row.p?.key,row.qty]));
    if(current!==signature){prepare();return;}
    sharing=true;button.disabled=true;
    try{
      // No asynchronous preparation here: the native picker needs the original tap.
      await navigator.share({files:prepared,title:'Uw boodschappenlijst · Granot Trading',text:'Mijn boodschappenlijst met productfoto’s en aantallen.'});
      status.textContent='De lijst is gedeeld. Controleer en verstuur de e-mail in uw mail-app.';
    }catch(error){status.textContent=error?.name==='AbortError'?'Delen geannuleerd. Uw boodschappenlijst blijft bewaard.':'Het deelmenu kon niet openen. Probeer opnieuw in uw gewone browser.';}
    finally{sharing=false;button.disabled=!prepared;}
  });
  window.addEventListener('catalog:cart-rendered',prepare);
})();
