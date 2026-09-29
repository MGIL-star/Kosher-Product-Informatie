// One presentation pipeline for meter pages and the local catalogue.
// Keep real packaging proportions and reuse the reviewed perspective corners.
(() => {
  const products = window.CATALOG_GROUPS?.flatMap(g => g.products) || window.KPI_PRODUCTS || [];
  const byImage = new Map();
  products.forEach(p => {
    if (p.image) byImage.set(new URL(p.image, document.baseURI).href, p);
    (p.packagingVariants || []).forEach(v => {
      if (v.image) byImage.set(new URL(v.image, document.baseURI).href, v);
    });
  });
  function matrix(source, target) {
    const rows = source.flatMap(([x,y],i) => {
      const [u,v] = target[i];
      return [[x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]];
    });
    for(let c=0;c<8;c++) {
      let pivot=c;
      for(let r=c+1;r<8;r++) if(Math.abs(rows[r][c])>Math.abs(rows[pivot][c])) pivot=r;
      [rows[c],rows[pivot]]=[rows[pivot],rows[c]];
      const d=rows[c][c]; if(Math.abs(d)<1e-12)return null;
      rows[c]=rows[c].map(v=>v/d);
      for(let r=0;r<8;r++) if(r!==c) {
        const f=rows[r][c]; rows[r]=rows[r].map((v,i)=>v-f*rows[c][i]);
      }
    }
    const [a,b,c,d,e,f,g,h]=rows.map(r=>r[8]);
    return `matrix3d(${[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1]})`;
  }
  function fit(frame) {
    const img=frame.querySelector('img'), p=img && byImage.get(img.src);
    if(!p || !img.naturalWidth || !frame.clientWidth)return;
    let points=p.imagePresentation?.corners, ratio=p.imagePresentation?.aspectRatio;
    if(!points) {
      const f=p.imageFrame, b=p.imageBounds;
      const box=f?[f.x,f.y,f.x+f.width,f.y+f.height]:b;
      if(!box)return;
      const [l,t,r,bottom]=box;
      points=[[l,t],[r,t],[r,bottom],[l,bottom]];
      ratio=f?.aspectRatio || (r-l)*img.naturalWidth/((bottom-t)*img.naturalHeight);
    }
    if(!(ratio>0))return;
    const margin=frame.clientWidth<150?10:18;
    const height=Math.min(frame.clientHeight-2*margin,(frame.clientWidth-2*margin)/ratio);
    const width=height*ratio, left=(frame.clientWidth-width)/2, top=(frame.clientHeight-height)/2;
    const xs=points.map(p=>p[0]), rw=2*width/(Math.max(...xs)-Math.min(...xs));
    const rh=rw*img.naturalHeight/img.naturalWidth;
    const transform=matrix(points.map(([x,y])=>[x*rw,y*rh]),[[left,top],[left+width,top],[left+width,top+height],[left,top+height]]);
    if(!transform)return;
    Object.assign(frame.style,{position:'relative',overflow:'hidden',background:'#fff'});
    Object.assign(img.style,{position:'absolute',left:'0',top:'0',padding:'0',maxWidth:'none',maxHeight:'none',width:rw+'px',height:rh+'px',objectFit:'fill',transformOrigin:'0 0',transform,clipPath:`polygon(${points.map(([x,y])=>`${x*100}% ${y*100}%`).join(',')})`});
    frame.dataset.photoFitted='true';
  }
  const resize=new ResizeObserver(entries=>entries.forEach(e=>fit(e.target)));
  const observed=new WeakSet();
  function scan() {
    document.querySelectorAll('.visual,.product-visual').forEach(frame=>{
      const nested=frame.querySelector('.product-packshot,.wine-pack');
      if(nested) { const image=nested.querySelector('img');if(image)frame.append(image);nested.remove(); }
      const img=frame.querySelector(':scope > img');
      if(!img)return;
      if(!observed.has(frame)) {
        observed.add(frame);resize.observe(frame);
        img.addEventListener('load',()=>fit(frame));
      }
      fit(frame);
    });
  }
  const observer=new MutationObserver(scan);
  ['catalog','detail-content','product-grid','dialog-content'].forEach(id=>{
    const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true});
  });
  scan();
})();
