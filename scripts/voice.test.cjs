const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(options={}){
 const elements=new Map(),handlers=new Map(),added=[],timers=new Map();let clock=0;
 const document={activeElement:null,hidden:false,querySelector:selector=>element(selector),addEventListener(type,fn){handlers.set('document:'+type,fn);}};
 function element(id){if(!elements.has(id))elements.set(id,{value:id==='#voice-quantity'?'1':'',textContent:'',innerHTML:'',open:false,showModal(){this.open=true;},focus(){document.activeElement=this;},blur(){if(document.activeElement===this)document.activeElement=null;},reportValidity(){const q=Number(this.value);return Number.isInteger(q)&&q>=1&&q<=999;},addEventListener(type,fn){handlers.set(id+':'+type,fn);}});return elements.get(id);}
 const products=[{key:'milk-a',name:'Houdbare Melk',brand:'A',variant:'1 l',image:''},{key:'milk-b',name:'Houdbare Melk',brand:'B',variant:'1 l',image:''},{key:'bread',name:'Brood',brand:'C',variant:'500 g',image:''},{key:'apple',name:'Helder Appelsap',brand:'A',variant:'1 l',image:''},{key:'chips-a',name:'Pufuleti Maïssnacks met Zout',brand:'Gusto',category:'Snacks',image:''},{key:'chips-b',name:'Barbecueringen Gezinsverpakking',brand:'Lieber’s',category:'Snacks',image:''},{key:'cookie',name:'Fingers met Cacaowafel en Vanillecrème',brand:'Elite',category:'Chocoladesnacks',image:''}];
 const window={catalogPreview:{products},catalogActions:{addToCart:(...args)=>added.push(args)},CatalogTranslation:{language:options.language||'nl',getProductNames:()=>new Map(options.translations||[]),refresh(){}},addEventListener(type,fn){handlers.set('window:'+type,fn);},SpeechRecognition:class{constructor(){assert.fail('Browser speech must not start');}},CatalogLocalSpeech:class{constructor(){assert.fail('Local model must not load');}}};
 const context={window,document,setTimeout(fn){const id=++clock;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}};
 for(const file of ['catalogus/search.js','catalogus/voice-languages.js','catalogus/voice.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
 const open=()=>handlers.get('document:click')({target:{closest:s=>s==='[data-voice-open]'?{}:null}});
 return{window,document,products,element,handlers,timers,added,open,parse:window.CatalogVoice.parse,input(text){element('#voice-text').value=text;handlers.get('#voice-text:input')();},flush(){for(const [id,fn]of [...timers]){timers.delete(id);fn();}},choose(index){const b={dataset:{voiceChoice:String(index)}};handlers.get('document:click')({target:{closest:s=>s==='[data-voice-choice]'?b:null}});return b;}};
}
test('opening speech input focuses device keyboard without requesting a recorder or model',()=>{
 const h=harness();h.open();assert(h.element('#voice-dialog').open);assert.equal(h.document.activeElement,h.element('#voice-text'));assert(h.element('#voice-keyboard-help').textContent.includes('microfoontje'));assert.equal(h.added.length,0);
});
test('dictated text searches automatically and adds only after a product choice',()=>{
 const h=harness();h.open();h.input('twee pakken melk');h.flush();assert(h.element('#voice-results').innerHTML.includes('Houdbare Melk'));assert.equal(h.element('#voice-quantity').value,2);assert.equal(h.added.length,0);h.choose(1);assert.deepEqual(h.added,[['milk-b',2]]);assert.equal(h.document.activeElement,null);
});
test('dictation updates use the latest text and never add intermediate results',()=>{
 const h=harness();h.open();h.input('melk');h.input('appelsap');assert.equal(h.timers.size,1);h.flush();assert(h.element('#voice-results').innerHTML.includes('Helder Appelsap'));assert(!h.element('#voice-results').innerHTML.includes('Houdbare Melk'));assert.equal(h.added.length,0);
});
test('chips and koekjes show complete related product families',()=>{
 const h=harness();h.open();h.input('chips');h.flush();assert(h.element('#voice-results').innerHTML.includes('Pufuleti'));assert(h.element('#voice-results').innerHTML.includes('Barbecueringen'));h.input('koekjes');h.flush();assert(h.element('#voice-results').innerHTML.includes('Cacaowafel'));assert.equal(h.added.length,0);
});
test('catalogue language controls the parser and explains matching keyboard language',()=>{
 for(const [language,locale]of [['nl','nl-NL'],['fr','fr-FR'],['en','en-GB'],['iw','he-IL']]){const h=harness({language});h.open();assert.equal(h.element('#voice-text').lang,locale);assert(h.element('#voice-keyboard-help').textContent);}
 const h=harness();for(const [language,text,query,count]of [['nl','voeg twee flessen appelsap toe','appelsap',2],['fr','ajoute deux bouteilles de jus de pomme','jus de pomme',2],['en','please add three bottles of apple juice','apple juice',3],['iw','תוסיף שני בקבוקי מיץ תפוחים','מיץ תפוחים',2]]){const p=h.parse(text,language);assert.equal(p.query,query);assert.equal(p.quantity,count);}
});
test('French and Hebrew dictated product groups find actual products',()=>{
 for(const [language,text]of [['fr','deux bouteilles de jus de pomme'],['iw','שני בקבוקי מיץ תפוחים'],['en','two bottles of apple juice']]){const h=harness({language});h.open();h.input(text);h.flush();assert(h.element('#voice-results').innerHTML.includes('Helder Appelsap'));assert.equal(h.element('#voice-quantity').value,2);assert.equal(h.added.length,0);}
});
test('changing language cancels pending dictation search and clears stale choices',()=>{
 const h=harness();h.open();h.input('melk');h.window.CatalogTranslation.language='fr';h.handlers.get('window:catalog:language-changed')();h.flush();assert.equal(h.element('#voice-text').lang,'fr-FR');assert.equal(h.element('#voice-text').value,'');assert.equal(h.element('#voice-results').innerHTML,'');assert.equal(h.added.length,0);
});
test('composition and closing prevent premature searches',()=>{
 const h=harness();h.open();h.handlers.get('#voice-text:compositionstart')();h.input('מיץ');assert.equal(h.timers.size,0);h.element('#voice-text').value='מיץ תפוחים';h.handlers.get('#voice-text:compositionend')();h.flush();assert(h.element('#voice-results').innerHTML.includes('Helder Appelsap'));h.input('melk');h.element('#voice-dialog').open=false;h.handlers.get('#voice-dialog:close')();assert.equal(h.timers.size,0);
});
test('invalid quantity or unknown word never adds an arbitrary product',()=>{
 const h=harness();h.open();h.input('ruimtevoertuig');h.flush();assert(h.element('#voice-status').textContent.includes('Geen passende'));h.choose(0);assert.equal(h.added.length,0);h.input('melk');h.flush();h.element('#voice-quantity').value='0';h.choose(0);assert.equal(h.added.length,0);
});
test('production page does not load the rejected speech model',()=>{
 const html=fs.readFileSync('catalogus/index.html','utf8');assert(!html.includes('local-speech.js'));assert(!html.includes('voice-local'));assert(html.includes('voice-keyboard'));assert(!fs.readFileSync('catalogus/voice.js','utf8').includes('new Recognition'));
});
test('dictated ice lolly finds meter 16 product and offers a broader search for unknown flavours',()=>{
 const h=harness();h.products.push({key:'meter-16:32',meter:'meter-16',name:'Fruitijsjes om in te Vriezen',brand:'Ice Li',category:'IJsjes',variant:'8 × 100 ml',image:''});h.open();h.input('ijslolly');h.flush();assert(h.element('#voice-results').innerHTML.includes('Fruitijsjes om in te Vriezen'));assert.equal(h.added.length,0);
 h.input('twee ijslolly mango');h.flush();assert(h.element('#voice-results').innerHTML.includes('data-voice-suggest="ijs"'));
 const b={dataset:{voiceSuggest:'ijs'}};h.handlers.get('document:click')({target:{closest:selector=>selector==='[data-voice-suggest]'?b:null}});assert(h.element('#voice-results').innerHTML.includes('Fruitijsjes om in te Vriezen'));assert.equal(h.element('#voice-quantity').value,2);assert.equal(h.added.length,0);
});
