// Importeer ongewijzigde webfoto's uit een door de browser geëxporteerd manifest.
const fs = require('fs');
const path = require('path');
const manifestPath = path.join(__dirname, 'image-sources.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const [photo, page, assetId] = process.argv.slice(2);
if (!photo || !page || !assetId) throw Error('Gebruik: node import-images.cjs fotonummer bronpagina asset-id');
const root = path.join(process.env.TEMP, 'browser-use', 'assets');
let found;
for (const dir of fs.readdirSync(root, {withFileTypes:true})) {
  if (!dir.isDirectory()) continue;
  const mp = path.join(root, dir.name, 'manifest.json');
  if (!fs.existsSync(mp)) continue;
  const data = JSON.parse(fs.readFileSync(mp, 'utf8'));
  const entries = Array.isArray(data) ? data : data.assets || [];
  const asset = entries.find(a => a.id === assetId);
  if (asset) { found = {...asset, folder:path.dirname(mp)}; break; }
}
if (!found) throw Error('Asset niet gevonden: ' + assetId);
const sourceFile = found.path ? path.resolve(found.folder, found.path) : path.join(found.folder, assetId + path.extname(new URL(found.url).pathname));
const extension = path.extname(sourceFile) || ({'image/webp':'.webp','image/png':'.png','image/jpeg':'.jpg'}[found.contentType]);
if (!extension) throw Error('Onbekend afbeeldingsformaat');
const localImage = 'images/product-' + photo + '-web' + extension;
fs.mkdirSync(path.join(__dirname, 'images'), {recursive:true});
fs.copyFileSync(sourceFile, path.join(__dirname, localImage));
manifest[photo + '.jpg'] = {localImage, page, imageUrl:found.url, retrieved:'2026-09-24'};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(photo + ': ' + localImage);
