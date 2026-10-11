// Match salad tubs to grilled aubergine; the taller shug tubs use the original red shug.
(() => {
 const bounds = {"tasty-auberginedip-closed.png": [0.0709729, 0.1889952, 0.930622, 0.84689], "tasty-auberginepate-closed.png": [0.0837321, 0.192185, 0.9178628, 0.8444976], "tasty-auberginesalade-closed.png": [0.1363636, 0.2065391, 0.8676236, 0.8269537], "tasty-babaganoush-closed.png": [0.0733652, 0.2711324, 0.9266348, 0.7966507], "tasty-gegrilde-auberginedip-closed.png": [0.0956938, 0.2049442, 0.9059011, 0.8460925], "tasty-groene-shug-closed.png": [0.0861244, 0.1323764, 0.9146730, 0.8708134], "tasty-haring-closed.png": [0.1052632, 0.2057416, 0.8963317, 0.8405104], "tasty-hummus-closed.png": [0.1427432, 0.222488, 0.8572568, 0.7982456], "tasty-matbucha-closed.png": [0.0813397, 0.1834131, 0.9178628, 0.8508772], "tasty-rode-shug-closed.png": [0.0861244, 0.1148325, 0.9146730, 0.8708134], "tasty-rodekoolsalade-closed.png": [0.11563, 0.222488, 0.8835726, 0.8317384], "tasty-tahin-closed.png": [0.099681, 0.2200957, 0.9011164, 0.8221691], "tasty-tonijn-bosui-closed.png": [0.0972887, 0.2025518, 0.9066986, 0.8197767], "tasty-tonijn-ei-closed.png": [0.1124402, 0.2208931, 0.8875598, 0.823764], "tasty-zalmspread-closed.png": [0.122807, 0.2256778, 0.877193, 0.823764], "tasty-zoetzure-aubergine-closed.png": [0.0606061, 0.2488038, 0.9393939, 0.8157895]};
 const observed = new WeakSet();
 function fit(frame) {
  const img=frame.querySelector('img'); if(!img || !img.complete || !img.naturalWidth)return;
  const filename=img.src.split('/').pop().split('?')[0];
  const box=bounds[filename]; if(!box)return;
  const reference=bounds[/^tasty-(rode|groene)-shug-closed\.png$/.test(filename) ? 'tasty-rode-shug-closed.png' : 'tasty-gegrilde-auberginedip-closed.png'];
  const f=getComputedStyle(frame), i=getComputedStyle(img);
  if(!img.dataset.tastyPadding)img.dataset.tastyPadding=JSON.stringify([parseFloat(i.paddingLeft)||0,parseFloat(i.paddingRight)||0,parseFloat(i.paddingTop)||0,parseFloat(i.paddingBottom)||0]);
  const [il,ir,it,ib]=JSON.parse(img.dataset.tastyPadding);
  const l=(parseFloat(f.paddingLeft)||0)+il,r=(parseFloat(f.paddingRight)||0)+ir,t=(parseFloat(f.paddingTop)||0)+it,b=(parseFloat(f.paddingBottom)||0)+ib;
  const availableW=frame.clientWidth-l-r,availableH=frame.clientHeight-t-b;
  const unit=Math.min(availableW,availableH); if(unit<=0)return;
  const x=l+(availableW-unit)/2,y=t+(availableH-unit)/2;
  const width=unit*(reference[2]-reference[0])/(box[2]-box[0]);
  const height=unit*(reference[3]-reference[1])/(box[3]-box[1]);
  frame.style.position='relative';
  Object.assign(img.style,{position:'absolute',left:(x+unit*reference[0]-width*box[0])+'px',top:(y+unit*reference[1]-height*box[1])+'px',width:width+'px',height:height+'px',padding:'0',maxWidth:'none',maxHeight:'none',objectFit:'fill',transform:'none'});
 }
 const resize=new ResizeObserver(entries=>entries.forEach(e=>fit(e.target)));
 function scan(){document.querySelectorAll('.photo,.product-visual').forEach(frame=>{
  const img=frame.querySelector('img');if(!img || !bounds[img.src.split('/').pop().split('?')[0]])return;
  if(!observed.has(frame)){observed.add(frame);resize.observe(frame);img.addEventListener('load',()=>fit(frame));}fit(frame);
 });}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
})();
