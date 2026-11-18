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
test('email embeds photo bytes, escapes names and preserves quantities',async()=>{
 const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{addEventListener(){},textContent:'',getTracks(){return[];}});return elements.get(id);};
 let exported;
 const ctx={window:{catalogPreview:{cart:{one:3,two:2},products:[{key:'one',name:'Koek & <test>',brand:'Elite',variant:'100 g',image:'https://example.test/photo.png'},{key:'two',name:'Melk',brand:'Shefa',variant:'1 l'}]}},document:{querySelector:element,addEventListener(){},createElement(){return{click(){}};}},navigator:{},crypto:require('node:crypto').webcrypto,TextEncoder,Uint8Array,Blob,btoa:s=>Buffer.from(s,'binary').toString('base64'),URL:{createObjectURL(blob){exported=blob;return'blob:test';},revokeObjectURL(){}},setTimeout(){},fetch:async()=>({ok:true,blob:async()=>new Blob([new Uint8Array([1,2,3])],{type:'image/png'})})};
 vm.runInNewContext(fs.readFileSync('catalogus/cart-tools.js','utf8'),ctx);
 await element('#email-export').onclick();
 const eml=await exported.text();assert(eml.includes('X-Unsent: 1'));assert(eml.includes('Content-ID: <product-0>'));assert(eml.includes('AQID'));
 const encoded=eml.split('Content-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n--')[0];const html=Buffer.from(encoded.replace(/\s/g,''),'base64').toString();assert(html.includes('Koek &amp; &lt;test&gt;'));assert(html.includes('Aantal: 3'));assert(html.includes('Aantal: 2'));assert(html.includes('cid:product-0'));assert(html.indexOf('Koek')<html.indexOf('Melk'));
 ctx.fetch=async()=>({ok:false});exported=null;await element('#email-export').onclick();assert.equal(exported,null);assert(element('#email-status').textContent.includes('geen onvolledige'));
});
test('scanner finds exact barcodes and stops tracks on close',()=>{
 const elements=new Map();const handlers=new Map();let stopped=0;let rendered=0;let closed=0;
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',addEventListener(type,fn){handlers.set(id+':'+type,fn);},dispatchEvent(){rendered++;},close(){closed++;},scrollIntoView(){}});return elements.get(id);};
 const ctx={window:{catalogPreview:{products:[{ean:'0123456789012'}]}},document:{querySelector:element,addEventListener(){}},navigator:{},Event:class{},setTimeout(){}};
 vm.runInNewContext(fs.readFileSync('catalogus/cart-tools.js','utf8'),ctx);
 element('#barcode-input').value='123456789012';handlers.get('#barcode-form:submit')({preventDefault(){}});assert.equal(element('#search').value,'0123456789012');assert.equal(rendered,1);assert.equal(closed,1);
 element('#barcode-input').value='9999999999999';handlers.get('#barcode-form:submit')({preventDefault(){}});assert(element('#scan-status').textContent.includes('Geen product gevonden'));assert.equal(rendered,1);
 handlers.get('#cart-dialog:close')();assert.equal(element('#barcode-video').hidden,true);
});
// Camera tests use controlled video frames and media streams; no physical webcam.
function cameraHarness(options={}) {
 const elements=new Map(),handlers=new Map(),timers=[];let stops=0,requests=0,searches=0;
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',hidden:true,textContent:'',srcObject:null,addEventListener(type,fn){handlers.set(id+':'+type,fn);},dispatchEvent(){searches++;},close(){handlers.get('#cart-dialog:close')?.();},scrollIntoView(){},play:options.play||async function(){}});return elements.get(id);};
 const track={stop(){stops++;}};const stream={getTracks:()=>[track]};
 class Detector{static getSupportedFormats=options.formats||async function(){return ['ean_13','ean_8'];};async detect(){if(options.detect)return options.detect();return [];}}
 const document={hidden:false,querySelector:element,addEventListener(type,fn){handlers.set('document:'+type,fn);}};
 const ctx={window:{catalogPreview:{products:[{ean:'7290112336644'}]},BarcodeDetector:Detector},BarcodeDetector:Detector,document,navigator:{mediaDevices:{getUserMedia:async()=>{requests++;if(options.media)return options.media(stream);return stream;}}},Event:class{},setTimeout(fn){timers.push(fn);}};
 if(options.unsupported)delete ctx.window.BarcodeDetector;
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
 const h=cameraHarness({unsupported:true});await h.start();assert.equal(h.requests,0);assert(h.element('#scan-status').textContent.includes('ondersteunt geen'));
 const denied=cameraHarness({media:async()=>{throw Error('NotAllowedError');}});await denied.start();assert(denied.element('#scan-status').textContent.includes('cameratoegang'));assert.equal(denied.element('#barcode-video').hidden,true);
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
