const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('real language selector publishes speech language and keeps translated name cache',async()=>{
 const buttons=[],events=[];let rows=[{dataset:{product:'apple'},title:'Helder Appelsap',querySelector(){return{textContent:this.title};}}];
 function element(tag){return{tag,children:[],dataset:{},classList:{toggle(){}},setAttribute(key,value){this[key]=value;},append(...children){this.children.push(...children);},after(){}};}
 const nav={after(){},append(button){buttons.push(button);},querySelectorAll(){return buttons;}};
 const translator={libReady:true,translate(source,code){for(const row of rows)row.title=code==='fr'?'Jus de pomme':code==='en'?'Apple juice':'Helder Appelsap';return true;},revert(){for(const row of rows)row.title='Helder Appelsap';}};
 const document={currentScript:{src:'https://example.test/catalogus/languages.js'},documentElement:{dir:'ltr'},querySelector:s=>s==='.catalog-languages'?nav:null,querySelectorAll:s=>s==='.product-open[data-product]'?rows:[],getElementById:()=>null,createElement:element,addEventListener(){},head:{append(script){queueMicrotask(()=>script.onload());}}};
 const window={__GT:{translator},dispatchEvent:event=>events.push(event)};
 const context={window,document,URL,location:{href:'https://example.test/catalogus/'},MutationObserver:class{observe(){}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},setTimeout,clearTimeout,queueMicrotask};vm.runInNewContext(fs.readFileSync('catalogus/languages.js','utf8'),context);
 await buttons.find(b=>b.dataset.lang==='fr').onclick();assert.equal(window.CatalogTranslation.language,'fr');assert.equal(events.at(-1).type,'catalog:language-changed');assert.equal(events.at(-1).detail.language,'fr');assert.equal(window.CatalogTranslation.getProductNames().get('apple'),'Jus de pomme');
 window.CatalogTranslation.beforeUpdate();rows=[];assert.equal(window.CatalogTranslation.getProductNames().get('apple'),'Jus de pomme');
 await buttons.find(b=>b.dataset.lang==='iw').onclick();assert.equal(window.CatalogTranslation.language,'iw');assert.equal(document.documentElement.dir,'rtl');assert.equal(events.at(-1).detail.language,'iw');assert.equal(window.CatalogTranslation.getProductNames().has('apple'),false);
});
