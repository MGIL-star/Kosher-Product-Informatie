const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const [group, ...titleWords] = process.argv.slice(2);
if (!/^(?:meter-[1-9][0-9]*(?:-[a-z0-9]+)*|diepvries-schap-[1-9][0-9]*)$/.test(group || '')) {
  throw new Error('Gebruik: node scripts/create-product-page.cjs meter-16 "DKW Meter 16"');
}
const destination = path.join(root, group);
if (fs.existsSync(destination)) throw new Error('Deze productpagina bestaat al; niets overschreven.');
const title = titleWords.join(' ') || group;
const escapedTitle = title.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const template = fs.readFileSync(path.join(root, 'templates/product-page/index.html'), 'utf8');
fs.mkdirSync(destination);
fs.writeFileSync(path.join(destination, 'index.html'), template.replaceAll('{{TITLE}}', escapedTitle));
fs.writeFileSync(path.join(destination, 'products.js'), 'window.KPI_PRODUCTS = [];\n');
console.log('Productpagina gemaakt met gedeelde catalogus, productmodal en DYMO-printknoppen: ' + group);
