const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(options={}){
 const elements=new Map(),listeners=new Map(),drawing=[];let shared=null;
 const button={disabled:false,addEventListener(type,fn){listeners.set('button:'+type,fn);}};
 elements.set('email-share-button',button);elements.set('email-status',{textContent:''});
 const cart={a:2,b:3};const products=[{key:'a',name:'Biscuitjes met Chocolade',brand:'Osem',variant:'500 g',image:'https://example.test/koek.jpg'},{key:'b',name:'Snoepjes',brand:'Elite',variant:'80 g',image:'https://example.test/snoep.jpg'}];
 const context={window:{catalogPreview:{get cart(){return {...cart};},products},addEventListener(type,fn){listeners.set(type,fn);}},document:{getElementById:id=>elements.get(id),createElement(tag){assert.equal(tag,'canvas');const commands=[];const ctx={font:'',fillStyle:'',measureText:s=>({width:s.length*16}),fillRect(){},fillText(...args){commands.push(['text',...args]);},stroke(){},beginPath(){},moveTo(){},lineTo(){},drawImage(img){commands.push(['image',img.url]);}};drawing.push(commands);return{width:0,height:0,getContext:()=>ctx,toBlob(fn){fn(new Blob([JSON.stringify(commands)],{type:'image/png'}));}};}},navigator:options.unsupported?{}:{canShare:()=>true,share:args=>{shared=args;if(options.shareError)return Promise.reject(options.shareError);return Promise.resolve();}},File,Image:class{naturalWidth=200;naturalHeight=300;set src(value){this.url=value;queueMicrotask(()=>options.badPhoto?this.onerror():this.onload());}},setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync('catalogus/email-share.js','utf8'),context);
 return {button,status:elements.get('email-status'),cart,products,drawing,prepare:()=>listeners.get('catalog:cart-rendered')(),click:()=>listeners.get('button:click')(),get shared(){return shared;}};
}
test('mail sharing includes both photos, quantities and original product order',async()=>{
 const h=harness();await h.prepare();assert.equal(h.button.disabled,false);await h.click();assert.equal(h.shared.files.length,1);const f=h.shared.files[0];assert.equal(f.type,'image/png');assert.equal(f.name,'boodschappenlijst.png');const drawing=JSON.parse(await f.text());const text=drawing.filter(c=>c[0]==='text').map(c=>c[1]);assert(text.includes('Aantal: 2'));assert(text.includes('Aantal: 3'));assert(text.indexOf('Biscuitjes met Chocolade')<text.indexOf('Snoepjes'));assert.deepEqual(drawing.filter(c=>c[0]==='image').map(c=>c[1]),['https://example.test/koek.jpg','https://example.test/snoep.jpg']);assert.deepEqual(h.cart,{a:2,b:3});
});
test('share picker opens directly on tap without preceding async work',async()=>{
 const h=harness();await h.prepare();const pending=h.click();assert(h.shared);await pending;
});
test('changed quantity rebuilds list instead of sharing stale quantities',async()=>{
 const h=harness();await h.prepare();h.cart.a=7;await h.click();assert.equal(h.shared,null);await h.prepare();await h.click();assert((await h.shared.files[0].text()).includes('Aantal: 7'));
});
test('cancel leaves the list intact and does not claim the email was sent',async()=>{
 const h=harness({shareError:{name:'AbortError'}});await h.prepare();await h.click();assert(h.status.textContent.includes('geannuleerd'));assert.equal(h.button.disabled,false);assert.equal(h.cart.a,2);
});
test('photo failure prevents sharing an incomplete list',async()=>{
 const h=harness({badPhoto:true});await h.prepare();assert.equal(h.button.disabled,true);assert(h.status.textContent.includes('niet allemaal'));await h.click();assert.equal(h.shared,null);
});
test('unsupported browser does not download anything or ask for an account',async()=>{
 const h=harness({unsupported:true});await h.prepare();assert.equal(h.button.disabled,true);assert(h.status.textContent.includes('deelmenu'));assert.equal(h.shared,null);assert.equal(h.drawing.length,0);
});
test('large shopping list is shared in complete ordered pages',async()=>{
 const h=harness();for(let i=0;i<48;i++){const key='extra'+i;h.products.push({key,name:'Product '+i,brand:'Merk',variant:'100 g',image:''});h.cart[key]=1;}await h.prepare();await h.click();assert(h.shared.files.length>1);const data=(await Promise.all(h.shared.files.map(file=>file.text()))).join('');assert(data.includes('Product 0'));assert(data.includes('Product 47'));assert(data.indexOf('Product 0')<data.indexOf('Product 47'));
});
