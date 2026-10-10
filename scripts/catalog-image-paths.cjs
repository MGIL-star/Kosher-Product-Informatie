const fs = require('fs'), vm = require('vm'), path = require('path');
const sources = Array.from({length:17},(_,i)=>({folder:i===3?'meter-4-tafelzuur':`meter-${i+1}`,data:i===2?'assets/js/products-meter-3.js':i===3?'assets/js/products-meter-4.js':`meter-${i+1}/products.js`}));
for (const folder of ['diepvries-schap-1','diepvries-schap-2','diepvries-schap-3','koeling-schap-1']) sources.push({folder,data:folder+'/products.js'});
const origin='https://catalog.test/'; const products=[];
for(const s of sources){const c={window:{}};vm.runInNewContext(fs.readFileSync(s.data,'utf8'),c);for(const p of c.window.KPI_PRODUCTS){if(p.image) products.push({...p,image:new URL(p.image,origin+s.folder+'/').href});}}
const c={window:{CATALOG_GROUPS:[{products}]},URL,document:{baseURI:origin,currentScript:{src:origin+'assets/js/apply-photo-layout.js'}}};
vm.runInNewContext(fs.readFileSync('assets/js/photo-layout-data.js','utf8'),c);
vm.runInNewContext(fs.readFileSync('assets/js/apply-photo-layout.js','utf8'),c);
fs.mkdirSync('tmp',{recursive:true});fs.writeFileSync('tmp/catalog-image-paths.json',JSON.stringify([...new Set(products.map(p=>decodeURIComponent(new URL(p.image).pathname.slice(1))))]));
