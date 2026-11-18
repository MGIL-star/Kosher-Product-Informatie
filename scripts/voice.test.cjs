const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(options={}){
 const elements=new Map(),handlers=new Map(),instances=[],added=[];
 const element=id=>{if(!elements.has(id))elements.set(id,{value:id==='#voice-quantity'?'1':'',open:false,textContent:'',innerHTML:'',disabled:false,showModal(){this.open=true;},reportValidity(){const q=Number(this.value);return Number.isInteger(q)&&q>=1&&q<=999;},addEventListener(type,fn){handlers.set(id+':'+type,fn);}});return elements.get(id);};
 class Speech{constructor(){instances.push(this);}start(){this.onstart?.();}abort(){this.aborted=true;}stop(){this.onend?.();}}
 const products=[{key:'milk-a',name:'Houdbare Melk',brand:'A',variant:'1 l',image:''},{key:'milk-b',name:'Houdbare Melk',brand:'B',variant:'1 l',image:''},{key:'bread',name:'Brood',brand:'C',variant:'500 g',image:''}];
 const document={hidden:false,querySelector:element,addEventListener(type,fn){handlers.set('document:'+type,fn);}};
 const window={catalogPreview:{products},catalogActions:{addToCart:(...args)=>added.push(args)}};
 if(!options.unsupported)window.SpeechRecognition=Speech;
 const context={window,document};vm.runInNewContext(fs.readFileSync('catalogus/search.js','utf8'),context);vm.runInNewContext(fs.readFileSync('catalogus/voice.js','utf8'),context);
 const clickOpen=()=>handlers.get('document:click')({target:{closest:s=>s==='[data-voice-open]'?{}:null}});
 return{window,document,element,handlers,instances,added,open:clickOpen,parse:window.CatalogVoice.parse,speak(text){instances.at(-1).onresult?.({results:[[{transcript:text}]]});},choose(index){const button={dataset:{voiceChoice:String(index)}};handlers.get('document:click')({target:{closest:s=>s==='[data-voice-choice]'?button:null}});return button;}};
}
test('Dutch voice quantities and polite phrases are recognized',()=>{
 const h=harness();for(const [text,query,quantity] of [['voeg twee pakken melk toe','melk',2],['Ik wil graag drie flessen druivensap','druivensap',3],['één pak melk','melk',1],['4x koekjes','koekjes',4],['brood','brood',1],['7 Days cake','7 Days cake',1]]){const parsed=h.parse(text);assert.equal(parsed.query,query,text);assert.equal(parsed.quantity,quantity,text);}
});
test('speech shows product choices and adds only the selected product',()=>{
 const h=harness();h.open();assert.equal(h.element('#voice-dialog').open,true);assert.equal(h.instances[0].lang,'nl-NL');h.speak('twee pakken melk');assert.equal(h.added.length,0);assert(h.element('#voice-results').innerHTML.includes('milk')===false);assert(h.element('#voice-results').innerHTML.includes('Houdbare Melk'));assert.equal(h.element('#voice-quantity').value,2);h.choose(1);assert.deepEqual(h.added,[['milk-b',2]]);
});
test('user can correct the spoken quantity before adding',()=>{
 const h=harness();h.open();h.speak('twee pakken melk');h.element('#voice-quantity').value='5';h.choose(0);assert.deepEqual(h.added,[['milk-a',5]]);
});
test('unknown product and invalid quantity never add an arbitrary product',()=>{
 const h=harness();h.open();h.speak('ruimtevoertuig');assert(h.element('#voice-status').textContent.includes('Geen producten'));h.choose(0);assert.equal(h.added.length,0);h.speak('melk');h.element('#voice-quantity').value='0';h.choose(0);assert.equal(h.added.length,0);
});
test('unsupported speech keeps manual text search available',()=>{
 const h=harness({unsupported:true});h.open();assert(h.element('#voice-status').textContent.includes('typen'));h.element('#voice-text').value='twee pakken melk';h.handlers.get('#voice-search:submit')({preventDefault(){}});assert(h.element('#voice-results').innerHTML.includes('Houdbare Melk'));assert.equal(h.added.length,0);
});
test('permission errors explain microphone access and close aborts listening',()=>{
 const h=harness();h.open();h.instances[0].onerror({error:'not-allowed'});assert(h.element('#voice-status').textContent.includes('Microfoontoegang'));h.handlers.get('#voice-dialog:close')();assert.equal(h.instances[0].aborted,true);h.speak('melk');assert.equal(h.added.length,0);
});
