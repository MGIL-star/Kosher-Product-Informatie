// Guard only outward, one-finger gestures at scroll boundaries; keep zoom and normal scrolling.
(() => {
  let x=0,y=0;
  document.addEventListener('touchstart',e=>{if(e.touches.length===1){x=e.touches[0].clientX;y=e.touches[0].clientY;}},{passive:true});
  document.addEventListener('touchmove',e=>{
    if(e.touches.length!==1||!e.cancelable)return;
    const dy=e.touches[0].clientY-y,dx=e.touches[0].clientX-x;
    x=e.touches[0].clientX;y=e.touches[0].clientY;
    if(Math.abs(dy)<=Math.abs(dx))return;
    for(let el=e.target instanceof Element?e.target:null;el;el=el.parentElement){
      if(el===document.body||el===document.documentElement)break;
      if(/auto|scroll/.test(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight){
        if(dy>0&&el.scrollTop>0||dy<0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)return;
        // A dialog must not transfer its boundary gesture to the page behind it.
        if(el.matches('dialog[open]')){e.preventDefault();return;}
      }
    }
    const root=document.scrollingElement;
    if(dy>0&&root.scrollTop<=0||dy<0&&root.scrollTop+root.clientHeight>=root.scrollHeight-1)e.preventDefault();
  },{passive:false});
  const key='catalog-scroll-position';
  let timer,ready=false;
  function save(){if(!ready)return;try{sessionStorage.setItem(key,JSON.stringify({y:scrollY,search:document.querySelector('#search').value}));}catch{}}
  addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(save,200);},{passive:true});
  addEventListener('pagehide',save);
  addEventListener('catalog-ready',()=>{
    const navigation=performance.getEntriesByType('navigation')[0];
    if(!['reload','back_forward'].includes(navigation?.type)){ready=true;return;}
    try{
      const saved=JSON.parse(sessionStorage.getItem(key));
      if(!saved||!Number.isFinite(saved.y)){ready=true;return;}
      const search=document.querySelector('#search');search.value=saved.search||'';search.dispatchEvent(new Event('input'));
      requestAnimationFrame(()=>requestAnimationFrame(()=>{scrollTo({top:saved.y,behavior:'instant'});ready=true;}));
    }catch{ready=true;}
  },{once:true});
})();


