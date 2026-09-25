const fs = require('node:fs');
const path = require('node:path');
const products = [];
const photoSources = fs.existsSync(path.join(__dirname, 'photo-sources.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'photo-sources.json'), 'utf8')) : {};
const sweetWarning = 'Overmatig gebruik kan een laxerend effect hebben. Verstikkingsgevaar: niet geschikt voor kinderen jonger dan 5 jaar.';
const bir = 'Badatz Igud Rabbonim (BIR) (Parve)';
const manchester = 'Manchester Beth Din (Parve)';
function add(id, brand, name, weight, ean, ingredients, allergens, mayContain, kosher, photos, extra = {}) {
  const selected = photoSources[id];
  const available = photos.filter(p => fs.existsSync(path.join(__dirname, 'source-labels', p + '.jpg')));
  products.push({id, brand, name, variant: weight || 'Gewicht nog te bevestigen', ean, ingredients, allergens, mayContain, kosher,
    category: id <= 5 ? 'Snoepjes' : id <= 8 ? 'Kauwgom' : id === 10 ? 'Toffees' : 'Chocolade',
    image: selected ? selected.file : '',
    imageEdited: Boolean(selected && selected.edited),
    imageSource: selected ? selected.page : '',
    productInfo: {Inhoud: weight || 'Nog te bevestigen op het etiket'},
    sourcePhotos: available.map(p => `source-labels/${p}.jpg`),
    sourcePhotoIds: photos,
    warning: id <= 8 ? sweetWarning : '', ...extra});
}
add(1, 'Elite MUST', 'Suikervrije snoepjes met citroensmaak', '80 g', '7290112336644',
  'Zoetstoffen (isomalt, sucralose), zuurteregelaar (citroenzuur), aroma’s.', [], 'Melk en soja.', bir,
  ['94dbd03b-614c-41ce-98ad-7db707ecebe1','35f646d2-4864-4f82-a95e-f6a6c1c3ddec','bc70b3db-7502-4351-b3dc-93ccfc25efc8']);
add(2, 'Elite MUST', 'Suikervrije snoepjes met yoghurtsmaak (aardbei en bosbes)', '80 g', '7290112336637',
  'Zoetstoffen (isomalt, sucralose), plantaardig vet, zuurteregelaar (citroenzuur), aroma’s, kleurstoffen (paprika-extract, anthocyanen uit zwartewortelextract), zwartewortelconcentraat, zout, emulgator (sojalecithine).', ['Soja'], 'Melk.', bir,
  ['a3f4cfaf-f84d-4f89-bc15-985a3be778a2','7c82dab3-ce65-4093-81f1-055bcef4f3cb','2825dd5b-be4a-4a5b-8c1d-e3dcd3638524'],
  {allergenNote: 'Ingrediënten en allergenen overgenomen van het huidige Hebreeuwse etiket op de originele verpakking.'});
add(3, 'Elite MUST', 'Suikervrije snoepjes met de smaak van framboos en citroen', '80 g', '7290112337474',
  'Zoetstoffen (isomalt, sucralose), zuurteregelaar (citroenzuur), aroma’s, kleurstof (anthocyanen uit zwartewortelextract).', [], 'Melk en soja.', bir,
  ['de951387-e898-47d8-b162-3c0327c6aaca','6d647122-c79e-468f-a709-33d187c3f6fb','4c33ee2d-2343-464e-a5da-d1ee27e4707a']);
add(4, 'Elite MUST', 'Suikervrije snoepjes met koffiesmaak', '80 g', '7290112337481',
  'Zoetstoffen (isomalt, sucralose), plantaardig vet, aroma’s, oploskoffiepoeder (1,3%), water, emulgator (sojalecithine).', ['Soja'], 'Melk.', bir,
  ['05c737f7-37ae-4216-b9f3-c26bad517fa9','94a39d25-e452-4888-b510-8f03a17a0fa5','d1b03e9e-c6f0-4075-ac29-29172c30ba2d'],
  {warning: 'Hoog cafeïnegehalte (56 mg per 100 g). Niet aanbevolen voor zwangere vrouwen en kinderen jonger dan 12 jaar. ' + sweetWarning});
add(5, 'Elite MUST', 'Suikervrije snoepjes met de smaak van dulce de leche', '80 g', '7290112336651',
  'Zoetstoffen (isomalt, sucralose), plantaardig vet, stabilisator (glycerol), zout, kleurstof (karamel), aroma’s, water, zwartewortelconcentraat, emulgator (sojalecithine).', ['Soja'], 'Melk.', bir,
  ['e6807b08-74cb-46fb-a720-7092483a99cd','83d3b742-cf50-473b-b5df-6fb1d1040159','90ff922e-b9c7-440a-96b5-6b55fab97750'],
  {allergenNote: 'Ingrediënten en allergenen overgenomen van het huidige Hebreeuwse etiket op de originele verpakking.'});
add(6, 'Elite MUST', 'Suikervrije kauwgomblokjes met aardbeiensmaak en vloeibare vulling', '58 g', '7290110556563',
  'Zoetstoffen (sorbitol, maltitol, maltitolstroop, isomalt, acesulfaam-K, sucralose), gombasis, bevochtigingsmiddel (glycerol), zuurteregelaars (appelzuur, citroenzuur), verdikkingsmiddelen (arabische gom, cellulosegom), aroma’s, kleurstof (anthocyanen uit zwartewortelextract).', [], '', manchester + '; OU (Parve)',
  ['ee7859a3-0db2-41b5-b873-9329b9f532ab','bcbf7a31-b506-44d9-b59c-f2efab3da9cc','9159ee61-3fb5-4390-9404-61afbd893706'],
  {});
add(7, 'Elite MUST', 'Suikervrije kauwgom met de smaak van fruit en munt', '66 g', '7290119374298',
  'Zoetstoffen (isomalt, sorbitol, xylitol, maltitolstroop, mannitol, acesulfaam-K, sucralose), gombasis, zuurteregelaar (calciumcarbonaat), bevochtigingsmiddel (glycerol), aroma’s, verdikkingsmiddel (arabische gom), emulgator (lecithine), glansmiddel (carnaubawas), kleurstof (bietenrood).', null, 'Soja (uit voorzorg; niet bevestigd door etiket of fabrikant).', manchester + '; OU (Parve)',
  ['9cee900d-8d1a-4b50-b904-bc3c50e20d41','b6e37933-17f2-42f4-828d-f51ff514d0f4','c137e81d-c305-4649-83e7-f37432863085'],
  {ingredientsPartial: true, ingredientsNote: 'De ingrediëntenlijst vermeldt lecithine zonder herkomst. Soja is uit voorzorg opgenomen bij ‘Kan bevatten’; de volledige allergenenverklaring is nog niet bevestigd.'});
add(8, 'Elite MUST', 'Suikervrije kauwgom met milde muntsmaak', '28 g', '7290008754415',
  'Zoetstoffen (isomalt, sorbitol, maltitolstroop, xylitol, mannitol, acesulfaam-K, sucralose), gombasis, zuurteregelaar (calciumcarbonaat), aroma’s, verdikkingsmiddel (arabische gom), bevochtigingsmiddel (glycerol), emulgator (lecithine), glansmiddel (carnaubawas).', null, '', manchester,
  ['09e7aa35-441a-4ed2-bc86-a28e391f5182','f9415f0c-e0f7-4ad4-b8cd-0db72152dce4','ad4120d2-455e-4c84-9b93-0f52621bbaab'],
  {allergenNote: 'De ingrediëntenlijst vermeldt lecithine zonder herkomst. Ook online is voor deze barcode geen afzonderlijke allergenenverklaring of sporenverklaring bevestigd.'});
add(9, 'Elite', 'Mini Mekupelet melkchocolade', '400 g', '7290010116386',
  'Suiker, cacaoboter, cacaomassa, melkpoeder, melkvet, emulgator (raapzaadlecithine), vanilline. Cacaobestanddelen: ten minste 30%.', ['Melk'], 'Pinda’s, amandelen, hazelnoten, pecannoten, ei, soja en sesam.', 'Badatz Edah Hacharedit en Badatz Beit Yosef (melk, volgens online productvermelding)',
  ['fb1a6608-61ab-42ce-b467-50a1f35d6bcf','5be2188e-e1d2-41cb-9263-2320df3948c9','8763ce8c-cc47-40d4-b96a-e2a3711000de']);
add(10, 'Shneider’s', 'Taffy Time toffees met fruitsmaken', '800 g', '194961000961',
  'Suiker, glucosestroop, kokosolie, verdikkingsmiddel (arabische gom), voedingszuur (citroenzuur), aroma’s, zout.', [], 'Melk en hazelnoten.', 'Nog te bevestigen op de verpakking',
  ['10f08052-7678-4a1a-b19b-b4d4b74e4809','b14c403c-646a-4654-aa16-21dffd469a70','aa125430-cc02-47f6-b497-6018b9b976ed'],
  {productInfo: {Inhoud: '800 g', Smaken: 'Aardbei, citroen, groene appel, bosbes, kers en sinaasappel'}, allergenNote: 'Vervaardigd in een fabriek waar melk en hazelnoten worden verwerkt.'});
const chocolateAllergens = ['Melk', 'Hazelnoten', 'Tarwe (gluten)', 'Soja'];
const chocolateMay = 'Pinda’s, andere noten, ei en sesam.';
const dairy = 'OU-D (Chalav Yisrael); rabbinaat Nof HaGalil';
add(11, 'Elite', 'Mini Snap melkchocoladereepjes met wafel', '400 g', '077245108303',
  'Melkchocolade [suiker, magere melkpoeder, cacaoboter, cacaomassa, melkvet, emulgatoren (PGPR, raapzaadlecithine), kunstmatig aroma (vanilline)], tarwebloem, suiker, plantaardige vetten (palm, palmpit), plantaardige oliën (palm, palmpit), volle melkpoeder, sojameel, weipoeder (melk), magere cacao (behandeld met alkali), maltitol, raapzaadlecithine, rijsmiddelen (natriumbicarbonaat, ammoniumbicarbonaat), zout, kunstmatig aroma (vanilline), enzym (proteïnase), hazelnootpasta.', chocolateAllergens, chocolateMay, dairy,
  ['4ad5ff80-36ae-4510-bb12-01e86fc80a74','9f9f958f-e798-46c6-971a-3af662ff7fb2','fd0aaf80-12ca-4dea-a6a7-078588934839'],
  {productInfo: {Inhoud: '400 g', Aantal: '21 tot 22 stuks'}});
add(12, 'Elite', 'Mini Pesek Zman Classic melkchocoladereepjes met wafel en hazelnootcrème', '400 g', '077245108310',
  'Melkchocolade [suiker, magere melkpoeder, cacaoboter, cacaomassa, melkvet, emulgatoren (PGPR, raapzaadlecithine), kunstmatig aroma (vanilline)], suiker, hazelnootpasta, palmvet, palmolie, tarwebloem, sojameel, cacaomassa, raapzaadlecithine, rijsmiddelen (natriumbicarbonaat, ammoniumbicarbonaat), zout, enzym (proteïnase).', chocolateAllergens, chocolateMay, dairy,
  ['e0d09f8a-d87e-4dfe-bb27-76f3610f7157','8b7987be-dd73-4ff7-9a9a-f929cf8bb4b4'],
  {productInfo: {Inhoud: '400 g', Aantal: '19 tot 20 stuks'}});
const shneiderKosher = 'Rabbi E. L. Schneebalg; STAR-K (Parve)';
const marshKosher = 'CRC Hisachdus Harabonim; Rabbi E. L. Schneebalg; STAR-K (Parve)';
const noSeparateAllergens = 'Op de aangeleverde foto is geen afzonderlijke sporenverklaring zichtbaar.';
add(13, 'Shneider’s', 'Candy Planet gesuikerde colaflesjes', '120 g', '194961003283',
  'Glucosestroop, suiker, gemodificeerd zetmeel, voedingszuren (citroenzuur, appelzuur), zuurteregelaars (natriummalaten, natriumcitraten), geleermiddel (carrageen), kleurstof (karamel), natuurlijk aroma, tarwezetmeel.', ['Tarwe (gluten)'], '', shneiderKosher,
  ['929ebe5d-e88b-49ab-9894-40f81617cb5a','2c7c4f2f-37a4-4aeb-abf5-6175bd7593d2'],
  {category: 'Snoepjes', allergenNote: 'Bevat tarwezetmeel. Het etiket vermeldt daarnaast minder dan 20 ppm gluten.'});
add(14, 'Shneider’s', 'Candy Planet bananen', '120 g', '194961003313',
  'Glucosestroop, suiker, geleermiddel (pectine), voedingszuur (citroenzuur), gehydrolyseerd plantaardig eiwit, natuurlijk aroma, zuurteregelaar (natriumcitraten), kleurstof (curcumine), tarwezetmeel.', ['Tarwe (gluten)'], '', shneiderKosher,
  ['470f35e2-9b81-4ba3-9b46-e9c98cabcf0c','065c21db-3d28-45a0-af99-a2039871a9c4'],
  {category: 'Snoepjes', allergenNote: 'Tarwe en gluten zijn beide vermeld onder allergenen. Bevat tarwezetmeel. Het Franse etiket vermeldt minder dan 20 ppm gluten; het Hebreeuwse etiket vermeldt dat het product gluten bevat.'});
add(15, 'Shneider’s', 'Candy Planet dubbele kersen', '120 g', '194961003245',
  'Glucosestroop, suiker, visgelatine, water, bevochtigingsmiddel (sorbitol, E420), voedingszuren (citroenzuur, E330; melkzuur, E270), zuurteregelaar (natriumlactaat, E325), aroma’s, glansmiddelen (bijenwas, E901; carnaubawas, E903), kleurstoffen (E102, E129, E133).', ['Vis'], '', marshKosher,
  ['a0950406-b9b2-4a61-b94a-a331eb1851d8','d78e850e-7f47-438a-913d-91b74c3a305c'],
  {category: 'Snoepjes', warning: 'E102 en E129 kunnen de activiteit of oplettendheid van kinderen nadelig beïnvloeden.'});
add(16, 'Shneider’s', 'Candy Planet gladde colaflesjes', '120 g', '194961003238',
  'Glucosestroop, suiker, visgelatine, water, bevochtigingsmiddel (sorbitol, E420), voedingszuren (citroenzuur, E330; melkzuur, E270), zuurteregelaar (natriumlactaat, E325), aroma’s, glansmiddelen (bijenwas, E901; carnaubawas, E903), kleurstoffen (E150d).', ['Vis'], '', marshKosher,
  ['d0e96d35-41ad-43ad-aa54-a88e33656045','271b562c-984c-4f2c-8581-1b2317a351e9'],
  {category: 'Snoepjes'});
add(17, 'Shneider’s', 'Candy Planet krokodillen', '120 g', '194961003337',
  'Glucosestroop, suiker, gemodificeerd tarwezetmeel, gehydrolyseerd erwteneiwit, carnaubawas, zonnebloemolie, aroma’s, kleurstoffen (paprikaoleohars, curcumine).', ['Tarwe (gluten)'], '', shneiderKosher,
  ['19df55c1-c60a-405b-a83f-238e2e642ffc','f091bb73-2e31-4afe-95e0-cee942da5b58'],
  {category: 'Snoepjes', allergenNote: 'Bevat tarwezetmeel. Het etiket vermeldt daarnaast minder dan 20 ppm gluten.'});
add(18, 'Shneider’s', 'Candy Planet gummibeertjes', '120 g', '194961004006',
  'Glucosestroop, suiker, visgelatine, water, bevochtigingsmiddel (sorbitol, E420), voedingszuren (citroenzuur, E330; melkzuur, E270), zuurteregelaar (natriumlactaat, E325), aroma’s, glansmiddelen (bijenwas, E901; carnaubawas, E903), kleurstoffen (E102, E129, E133).', ['Vis'], '', marshKosher,
  ['f0da02e7-3654-41ea-b1b6-8e1066e71539','7c40c2f4-eceb-4e0b-8228-4b44f9069914'],
  {category: 'Snoepjes', warning: 'E102 en E129 kunnen de activiteit of oplettendheid van kinderen nadelig beïnvloeden.'});
const marshIngredients = 'Glucosefructosestroop, suiker, water, visgelatine, dextrose, maïszetmeel, voedingszuur (appelzuur), zuurteregelaar (natriumcitraat). Afhankelijk van de variant: natuurlijke vanille- en aardbeienaroma’s, kleurstoffen (curcumine, betanine, E141).';
const marshExtra = {category: 'Marshmallows', allergenNote: 'Vervaardigd in een fabriek waar melk en soja worden verwerkt.'};
add(19, 'Shneider’s', 'Mini marshmallows wit en roze', '175 g', '838948010184',
  marshIngredients, ['Vis'], 'Melk en soja.', marshKosher,
  ['abc1d5d5-6bd1-4e84-82f3-8e814cc89c8f','b61a2811-f249-4734-95e4-0ef3e045cc16','3445c1fc-4938-4fba-b7e4-5f87593c028c'], marshExtra);
add(20, 'Shneider’s', 'BBQ marshmallows wit', '175 g', '838948002752',
  marshIngredients, ['Vis'], 'Melk en soja.', marshKosher,
  ['8fadcf03-03ff-4dc0-bce5-8c647b9547e7','e66d1906-3586-47e2-a28c-a39d4e0f1420','31916e43-78d6-4bd9-b397-2071e976d935'], marshExtra);
add(21, 'Shneider’s', 'Marshmallow Kids', '175 g', '838948000093',
  marshIngredients, ['Vis'], 'Melk en soja.', marshKosher,
  ['94729967-aa0b-4e81-b258-2fa00f8c3f56','4633965c-7e84-41e0-8a76-bdebf831c6fb','51d6aad8-843f-4fd6-864a-ca2e100af9b0'], marshExtra);
add(22, 'Shneider’s', 'Candy Planet Mr Black dropmix', '150 g', '194961003085',
  'Rietsuikermelasse (sulfieten), tarwebloem, glucosestroop (tarwe), zout, zoethoutextract, suiker, carnaubawas, zonnebloemolie, aroma’s, kleurstoffen (paprikaoleohars, groentesap, kurkumaoleohars), palmvet, arabische gom, gehydrolyseerd erwteneiwit.', ['Tarwe (gluten)', 'Sulfieten'], '', shneiderKosher,
  ['e56be4b1-c875-4d60-9944-39d8cc6ebfe5','86d28601-ba6c-4100-8222-4496a1e7cabd'],
  {category: 'Drop', warning: 'Bevat zoethout.'});
products.find(p => p.id === 3).kosher = 'Igud Harabanim & OU (Parve)';
for (const p of products) {
  if (p.brand === 'Elite' && p.category === 'Chocolade') p.kosher = 'OU-D (Chalav Yisrael) rabbinaat Nof HaGalil';
  if (p.brand === 'Shneider’s') p.kosher = 'Rabbi E.L Schneebalg en STAR-K (Parve)';
  p.kosher = p.kosher.replace(/\s*;\s*/g, ' ');
  const digits = [...p.ean].map(Number);
  if (digits.reduce((s, d, i) => s + d * ((digits.length - i) % 2 === 0 ? 3 : 1), 0) % 10) throw new Error('Ongeldige barcode: ' + p.id);
}
const shelfOrder = [1, 2, 3, 4, 5, 6, 7, 8, 22, 13, 14, 15, 16, 17, 18, 10, 11, 12, 9, 19, 20, 21];
products.sort((a, b) => shelfOrder.indexOf(a.id) - shelfOrder.indexOf(b.id));
fs.writeFileSync(path.join(__dirname, 'products.js'), 'window.KPI_PRODUCTS = ' + JSON.stringify(products, null, 2) + ';\n');
console.log(`Meter 11: ${products.length} producten; barcodes gecontroleerd.`);
