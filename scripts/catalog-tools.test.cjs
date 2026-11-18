const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('catalogus/search.js','utf8'),context);
const matches=context.window.CatalogSearch.matches;
test('related words, typos, accents and multiple terms',()=>{
 for(const query of ['snoep','sneop','snope'])assert(matches({name:'Marshmallows',brand:'Candy Planet'},query),query);
 for(const query of ['koek','koekk','koek elite'])assert(matches({name:'Vanille Wafels',brand:'Elite'},query),query);
 assert(matches({name:'Dragée'},'dragee'));
 assert(!matches({name:'Bakpoeder',meterTitle:'Chocolade · Koek'},'koek'));
 assert(!matches({name:'Aardbeienjam'},'snoep'));
 assert(!matches({name:'Vanille Wafels',brand:'Elite'},'koek osem'));
 assert(matches({ean:'7290112336644'},'7290112336644'));
 assert(!matches({ean:'7290112336644'},'7290112336645'));
});
test('scanner finds exact barcodes and stops tracks on close',()=>{
 const elements=new Map();const handlers=new Map();let stopped=0;let rendered=0;let closed=0;
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',addEventListener(type,fn){handlers.set(id+':'+type,fn);},dispatchEvent(){rendered++;},close(){if(id==='#cart-dialog')closed++;},scrollIntoView(){}});return elements.get(id);};
 const ctx={window:{catalogPreview:{products:[{ean:'0123456789012'}]}},document:{querySelector:element,addEventListener(){}},navigator:{},Event:class{},setTimeout(){}};
 vm.runInNewContext(fs.readFileSync('catalogus/cart-tools.js','utf8'),ctx);
 element('#barcode-input').value='123456789012';handlers.get('#barcode-form:submit')({preventDefault(){}});assert.equal(element('#search').value,'0123456789012');assert.equal(rendered,1);assert.equal(closed,1);
 element('#barcode-input').value='9999999999999';handlers.get('#barcode-form:submit')({preventDefault(){}});assert(element('#scan-status').textContent.includes('Geen product gevonden'));assert.equal(rendered,1);
 handlers.get('#cart-dialog:close')();assert.equal(element('#barcode-video').hidden,true);
});
// Camera tests use controlled video frames and media streams; no physical webcam.
function cameraHarness(options={}) {
 const elements=new Map(),handlers=new Map(),timers=[];let stops=0,requests=0,searches=0;
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',hidden:true,textContent:'',srcObject:null,setAttribute(){},videoWidth:1280,videoHeight:720,addEventListener(type,fn){handlers.set(id+':'+type,fn);},dispatchEvent(){searches++;},open:id==='#cart-dialog',showModal(){this.open=true;},close(){if(!this.open)return;this.open=false;handlers.get(id+':close')?.();},scrollIntoView(){},play:options.play||async function(){}});return elements.get(id);};
 const track={stop(){stops++;}};const stream={getTracks:()=>[track]};
 class Detector{static getSupportedFormats=options.formats||async function(){return ['ean_13','ean_8'];};async detect(){if(options.detect)return options.detect();return [];}}
 const document={hidden:false,querySelector:element,createElement(){return {width:0,height:0,getContext(){return {drawImage(){},translate(){},rotate(){}};}};},addEventListener(type,fn){handlers.set('document:'+type,fn);}};
 const ctx={window:{catalogPreview:{products:[{ean:'7290112336644'}]},BarcodeDetector:Detector},BarcodeDetector:Detector,document,navigator:{mediaDevices:{getUserMedia:async()=>{requests++;if(options.media)return options.media(stream);return stream;}}},Event:class{},setTimeout(fn){timers.push(fn);}};
 if(options.unsupported)delete ctx.window.BarcodeDetector;
 if(options.noMedia)delete ctx.navigator.mediaDevices;
 if(options.fallback)ctx.window.ZXingBrowser={BrowserMultiFormatOneDReader:class{decode(){if(options.fallbackDecode)return options.fallbackDecode();return {getText:()=>options.fallback};}decodeFromCanvas(canvas){return options.canvasDecode(canvas);}}};
 if(options.secure===false)ctx.window.isSecureContext=false;
 vm.runInNewContext(fs.readFileSync('catalogus/cart-tools.js','utf8'),ctx);
 return {element,handlers,timers,document,start:()=>element('#scan-start').onclick(),stop:()=>element('#scan-stop').onclick(),get stops(){return stops;},get requests(){return requests;},get searches(){return searches;}};
}
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
test('camera detects known barcode and releases camera',async()=>{
 const h=cameraHarness({detect:async()=>[{rawValue:'7290112336644'}]});await h.start();await flush();assert.equal(h.requests,1);assert.equal(h.searches,1);assert.equal(h.stops,1);assert.equal(h.element('#barcode-video').srcObject,null);
});
test('unknown camera barcode does not navigate and camera can be stopped',async()=>{
 const h=cameraHarness({detect:async()=>[{rawValue:'9999999999999'}]});await h.start();await flush();assert.equal(h.searches,0);assert(h.element('#scan-status').textContent.includes('Geen product'));h.stop();assert.equal(h.stops,1);assert.equal(h.element('#barcode-video').hidden,true);
});
test('unsupported camera and denied access show useful messages',async()=>{
 const h=cameraHarness({noMedia:true});await h.start();assert.equal(h.requests,0);assert(h.element('#scan-status').textContent.includes('geen cameratoegang'));
 const denied=cameraHarness({media:async()=>{throw Object.assign(Error('denied'),{name:'NotAllowedError'});}});await denied.start();assert(denied.element('#scan-status').textContent.toLowerCase().includes('cameratoegang'));assert.equal(denied.element('#barcode-video').hidden,true);
});
test('closing during format check never requests camera',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r);const h=cameraHarness({formats:()=>pending});const start=h.start();h.handlers.get('#cart-dialog:close')();resolve(['ean_13']);await start;assert.equal(h.requests,0);
});
test('closing while permission is pending releases eventual camera',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r);const h=cameraHarness({media:async stream=>{await pending;return stream;}});const start=h.start();await flush();h.handlers.get('#cart-dialog:close')();resolve();await start;assert.equal(h.stops,1);assert.equal(h.element('#barcode-video').srcObject,null);
});
test('late video play completion does not restart a closed scanner',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r);const h=cameraHarness({play:()=>pending});const start=h.start();await flush();h.stop();resolve();await start;assert.equal(h.element('#scan-status').textContent,'Camera gestopt.');assert.equal(h.timers.length,0);assert.equal(h.stops,1);
});
test('hiding page stops camera and repeated decoder failures report error',async()=>{
 const h=cameraHarness();await h.start();h.document.hidden=true;h.handlers.get('document:visibilitychange')();assert.equal(h.stops,1);
 const failing=cameraHarness({detect:async()=>{throw Error('frame error');}});await failing.start();await flush();await failing.timers.shift()();await failing.timers.shift()();assert.equal(failing.stops,1);assert(failing.element('#scan-status').textContent.includes('niet uitlezen'));
});
test('camera opens without native barcode API using bundled fallback',async()=>{
 const h=cameraHarness({unsupported:true,fallback:'7290112336644'});await h.start();await flush();assert.equal(h.requests,1);assert.equal(h.searches,1);assert.equal(h.stops,1);
});
test('native API unavailable formats still fall back to camera decoding',async()=>{
 const h=cameraHarness({formats:async()=>[],fallback:'7290112336644'});await h.start();await flush();assert.equal(h.requests,1);assert.equal(h.searches,1);
});
test('insecure pages never request camera',async()=>{
 const h=cameraHarness({secure:false});await h.start();assert.equal(h.requests,0);assert(h.element('#scan-status').textContent.includes('https'));
});
test('camera error explains blocked permission or missing device',async()=>{
 for(const [name,message] of [['NotAllowedError','geblokkeerd'],['NotFoundError','Geen camera'],['NotReadableError','al in gebruik']]){
  const h=cameraHarness({media:async()=>{throw Object.assign(Error(name),{name});}});await h.start();assert(h.element('#scan-status').textContent.includes(message),name);
 }
});
test('bundled decoder reads real EAN-13 pixel data',()=>{
 const zxing=require('../assets/vendor/zxing/zxing-browser-0.1.5.min.js');
 const ean='7290112336644';const odd=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];const even=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];const right=odd.map(s=>s.replace(/[01]/g,b=>b==='0'?'1':'0'));const parity=['OOOOOO','OOEOEE','OOEEOE','OOEEEO','OEOOEE','OEEOOE','OEEEOO','OEOEOE','OEOEEO','OEEOEO'][+ean[0]];
 let bits='0'.repeat(12)+'101';for(let i=1;i<=6;i++)bits+=(parity[i-1]==='O'?odd:even)[+ean[i]];bits+='01010';for(let i=7;i<13;i++)bits+=right[+ean[i]];bits+='101'+'0'.repeat(12);
 const width=bits.length*3,height=120,pixels=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const offset=(y*width+x)*4;const v=bits[Math.floor(x/3)]==='1'?0:255;pixels[offset]=pixels[offset+1]=pixels[offset+2]=v;pixels[offset+3]=255;}
 const canvas={width,height,getContext(){return {getImageData(){return {data:pixels};}};}};
 assert.equal(new zxing.BrowserMultiFormatOneDReader().decodeFromCanvas(canvas).getText(),ean);
});
test('empty native detections also run the fallback reader',async()=>{
 const h=cameraHarness({detect:async()=>[],fallback:'7290112336644'});await h.start();await flush();assert.equal(h.searches,1);assert.equal(h.element('#barcode-input').value,'7290112336644');
});
test('fallback tries centre crop and rotation after full frame has no barcode',async()=>{
 const missing=()=>{throw {getKind:()=> 'NotFoundException'};};let attempts=0;
 const h=cameraHarness({unsupported:true,fallback:true,fallbackDecode:missing,canvasDecode(canvas){attempts++;if(attempts===1)missing();assert(canvas.height>canvas.width);return{getText:()=> '7290112336644'};}});await h.start();await flush();assert.equal(attempts,2);assert.equal(h.searches,1);
});
test('camera opens full-screen dialog and close releases the stream',async()=>{
 const h=cameraHarness();await h.start();assert.equal(h.element('#scanner-dialog').open,true);h.element('#camera-close').onclick();assert.equal(h.element('#scanner-dialog').open,false);assert.equal(h.stops,1);assert.equal(h.element('#cart-dialog').open,true);
});
test('search keeps Hebrew words and recognizes translated grocery phrases',()=>{
 for(const query of ['appelsap','apple juice','jus de pomme','מיץ תפוחים']){assert(matches({name:'Helder Appelsap'},query),query);assert(!matches({name:'Witte Azijn'},query),query);}
 assert.equal(context.window.CatalogSearch.normalize('חָלָב'),'חלב');assert(matches({name:'Houdbare Melk'},'חלב'));assert(!matches({name:'Brood'},'מטוס'));
 context.window.KPI_searchMatches=()=>true;assert(!matches({name:'Brood'},'מטוס'));delete context.window.KPI_searchMatches;
});
test('generic food groups include named variants and exclude unrelated baking words',()=>{
 const p={chips:[{name:'Pufuleti Maïssnacks met Zout',category:'Snacks'},{name:'Tortillarolletjes Hot & Spicy',category:'Rijst- en maïssnacks'},{name:'Barbecueringen Gezinsverpakking',category:'Snacks'}],koekjes:[{name:'Fingers met Cacaowafel en Vanillecrème',category:'Chocoladesnacks'},{name:'Vanillespritsen',category:'Koekjes'}],chocolade:[{name:'Cacaopoeder',category:'Bakingrediënten'},{name:'Instant Chocolit',category:'Koffie & Chocolit'},{name:'Witte Chocolade',category:'Chocolade'}]};
 for(const [query,products]of Object.entries(p))for(const product of products)assert(matches(product,query),query+': '+product.name);
 assert(!matches({name:'Kruiden voor Gebakken Aardappelen',category:'Kruidenmixen'},'koekjes'));assert(!matches({name:'Ketelgebakken Chips Naturel',category:'Snacks'},'koekjes'));assert(!matches({name:'Instant Koffie',category:'Koffie & Chocolit'},'chocolade'));
});
test('real catalogue examples without the group word are still found',()=>{
 for(const [file,id,query]of [['meter-12/products.js',67,'koekjes'],['meter-13/products.js',94,'chips'],['meter-13/products.js',67,'chips'],['meter-16/products.js',6,'chips'],['meter-15/products.js',9,'chips']]){const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);const product=c.window.KPI_PRODUCTS.find(p=>p.id===id);assert(product,file+':'+id);assert(matches(product,query),query+': '+product.name);}
});
test('crisps query excludes sweet pretzel cookies and chocolate bars',()=>{
 assert(!matches({name:'Koekjes met Pretzelcrèmevulling',category:'Koekjes'},'chips'));assert(!matches({name:'Melkchocolade met Pretzels',category:'Chocolade'},'chips'));assert(matches({name:'Dunne Pretzels met Zeezout',category:'Zoute snacks'},'chips'));
});
test('ice lolly concepts find real Ice Li freezer pops on meter 16',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync('meter-16/products.js','utf8'),c);const product={...c.window.KPI_PRODUCTS.find(p=>p.id===32),meter:'meter-16'};assert.equal(product.name,'Fruitijsjes om in te Vriezen');
 for(const query of ['ijslolly','IJslollies','ijs lolly','ijs lollie','ijsloly','waterijs','fruitijsje','ijs','ijsjes om zelf in te vriezen','ijsjes voor de vriezer','iets om zelf in te vriezen','ik zoek een ijslolly','hebben jullie waterijs','laat me ijslolly zien','ice pops','popsicles','glace à l’eau','ארטיק'])assert(matches(product,query),query);
 assert(matches(product,'ijslolly op meter 16'));assert(!matches(product,'ijslolly op meter 15'));assert(matches(product,'meter 16'));
});
test('ice intent does not confuse rice, iced tea, empty cones or candy lollies',()=>{
 const notIce=[{name:'Basmatirijst',category:'Rijst'},{name:'Rijstwafels',category:'Wafels'},{name:'Ijsthee met Perzik',category:'Dranken'},{name:'Lege IJshoorntjes',englishName:'Ice Cream Cones',category:'Koekjes'},{name:'Ball Lollypops',category:'Snoepjes'},{name:'Gezichtswater Ice',catalogType:'nonfood',group:'home'}];
 for(const product of notIce)assert(!matches(product,'ijslolly'),product.name);
 context.window.KPI_searchMatches=()=>true;assert(!matches({name:'Rijst'},'ijs'));delete context.window.KPI_searchMatches;
 assert(matches({name:'Mini Ijsjes Vanille en Aardbei',category:'IJs'},'ijs'));assert(matches({name:'Basmatirijst',category:'Rijst'},'rijst'));
});
test('natural requests and broader suggestions help without ignoring requested flavours',()=>{
 assert(matches({name:'Witte Chocolade',category:'Chocolade'},'ik zoek iets met chocolade'));
 assert(matches({name:'Tortillachips Naturel',category:'Chips'},'toon chips alsjeblieft'));
 assert(!matches({name:'Fruitijsjes om in te Vriezen',category:'IJsjes'},'ijslolly mango'));
 const suggestions=context.window.CatalogSearch.suggestions('ijslolly mango');assert.equal(suggestions[0].query,'ijs');assert(suggestions[0].label.includes('ijslolly'));
 assert.equal(context.window.CatalogSearch.suggestions('chips kaas')[0].query,'chips');
});
