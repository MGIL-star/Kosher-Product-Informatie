// Transcriptie van de door de gebruiker aangeleverde etiketten. Geen webingrediënten.
const fs = require('fs');
const path = require('path');
const rows = [];
const M = 'Machsike Hadass Antwerpen (Parve)';
const E = 'Badatz Edah Hachareidis';
function add(photo, brand, name, variant, ean, ingredients, allergens, mayContain, kosher, photos, category='Zoute snacks') {
  rows.push({id:photo,brand,name,category,variant,ean,ingredients,allergens:allergens?allergens.split('|'):[],mayContain,kosher,
    image:'',sourcePhotos:photos.split(',').map(n=>n+'.jpg'),productInfo:variant?{Inhoud:variant}:{}});
}
add(1,'Osem','Dunne pretzels met zeezout','350 g','077544000742','Tarwebloem, palmolie, suiker, gerstemout, zeezout (1,9%), rijsmiddel (natriumcarbonaat), zuurteregelaar (natriumhydroxide), emulgator (sojalecithine).','Tarwe (gluten)|Gerst (gluten)|Soja','Sesam.','OU (Parve) · Rabbinaat Yokneam','1,2,2a');
add(6,'Osem','Dunne pretzels met sesam','350 g','077544000728','Tarwebloem, sesamzaad, palmolie, suiker, gerstemout, zeezout, natriumbicarbonaat, natriumhydroxide, sojalecithine.','Tarwe (gluten)|Sesam|Gerst (gluten)|Soja','','OU (Parve)','6,7,8');
add(3,'Osem','Pretzelringen met sesam','','077544162327','Tarwebloem, sesamzaad (12%), palmolie, zeezout, suikers, gedroogde gist, gerstemout, emulgator (sojalecithine), rijsmiddel (natriumcarbonaat), zuurteregelaars (citroenzuur, natriumhydroxide).','Tarwe (gluten)|Sesam|Gerst (gluten)|Soja','','OU (Parve) · Rabbinaat Yokneam','3,4,5');
add(9,'Osem','Gezouten pretzels','400 g','077544162044','Tarwebloem, palmolie, zeezout (2,1%), suikers, gerstemout, rijsmiddel (natriumcarbonaat), zuurteregelaars (citroenzuur, natriumhydroxide), emulgator (sojalecithine).','Tarwe (gluten)|Gerst (gluten)|Soja','Sesam.','OU (Parve) · Rabbinaat Yokneam','9,10,11');
add(12,'Osem','Gezouten pretzelstokjes','400 g','077544162549','Tarwebloem, palmolie, zeezout (2%), suiker, zuurteregelaars (citroenzuur, natriumhydroxide), rijsmiddel (natriumbicarbonaat), emulgator (sojalecithine).','Tarwe (gluten)|Soja','Sesam.','Parve','12,13,14');
add(15,'Beigel & Beigel','XL-pretzels met zout','400 g','7290000461700','Tarwebloem, plantaardige olie, zout, gerstemout, gist, zuurteregelaar (E524).','Tarwe (gluten)|Gerst (gluten)','Soja, sesam, mosterd, hazelnoten, pinda’s en amandelen.',E,'15,16,17');
add(18,'Beigel & Beigel','XL-pretzels met sesam','400 g','7290000461724','Tarwebloem, sesamzaad (12%), plantaardige olie, zout, gist, zuurteregelaar (E524).','Tarwe (gluten)|Sesam','Soja, mosterd, hazelnoten, pinda’s en amandelen.',E+' · Rabbinaat Safed (Parve)','18,19,20');
add(21,'Beigel & Beigel','Gezouten pretzels','','084685000517','Tarwemeel, palmolie, zout, gerstemoutstroop, gist, zuurteregelaar (E524).','Tarwe (gluten)|Gerst (gluten)','Pinda’s, soja, amandelen, hazelnoten, mosterd en sesam.','', '21,22,23');
add(24,'Gratify','Glutenvrije dunne pretzels Everything','300 g','819021011205','Maïszetmeel, koolzaadolie, sojameel, rijstmeel, suiker, sesamzaad, maanzaad, gedroogde ui, zeezout, cellulosegom, sojalecithine, gedroogde gist, gedroogde knoflook, natriumbicarbonaat, dinatriumdifosfaat, soda.','Soja|Sesam','',E+' · Rabbinaat Yokneam','24,25,26');
add(27,'Gratify','Glutenvrije dunne pretzels met sesam','300 g','819021011083','Maïszetmeel, koolzaadolie, sesamzaad, sojameel, rijstmeel, suiker, zeezout, cellulosegom, sojalecithine, gedroogde gist, natriumbicarbonaat, dinatriumdifosfaat, soda.','Soja|Sesam','',E+' · Rabbinaat Yokneam','27,28,29');
add(30,'Gratify','Glutenvrije pretzels met zeezout','300 g','819021011540','Maïszetmeel, palmolie, zeezout, suiker, cellulosegom, sojalecithine, gedroogde gist, natriumbicarbonaat, dinatriumdifosfaat, soda.','Soja','Sesam.','OU (Parve) · '+E+' · Rabbinaat Yokneam','30,31,32');
add(33,'Beigel & Beigel','Dunne pretzelstokjes met zout','150 g','008982000797','Tarwemeel, palmolie, zout, zuurteregelaar (natriumhydroxide).','Tarwe (gluten)','Amandelen, hazelnoten, pinda’s, sesam, soja, gerst en mosterd.','OU (Parve) · '+E,'33,34,35');
add(36,'Beigel & Beigel','Pretzelstokjes met sesam','150 g','008982000636','Tarwemeel, sesamzaad (10%), zout, palmolie, gerstemoutstroop, gist, zuurteregelaar (natriumhydroxide).','Tarwe (gluten)|Sesam|Gerst (gluten)','Pinda’s, soja, amandelen, hazelnoten, mosterd en sesam.','Parve','36,37,38');
add(39,'Hadar','Pretzelroosters met zout','300 g','7290018790588','Tarwebloem, palmolie, zout (2,2%), zuurteregelaar (E524), tarwemout, gist, rijsmiddel (ammoniumcarbonaten).','Tarwe (gluten)','Sesam, gerst en soja.',E+' · Rabbinaat Nof HaGalil (Parve)','39,40,41');
add(42,'Hadar','Pretzelroosters met sesam','300 g','7290018790618','Tarwebloem, palmolie, sesamzaad (4%), zuurteregelaar (E524), tarwemout, zout, gist, rijsmiddel (ammoniumcarbonaten).','Tarwe (gluten)|Sesam','Gerst en soja.',E+' · Rabbinaat Nof HaGalil (Parve)','42,43,44');
add(58,'Shneider’s','Mr. Hipster ketelchips met zeezout','','194961002453','Aardappelen (EU), zonnebloemolie, olijfolie, zout.','','Mosterd en melk.','STAR-K (Parve)','58,59,60','Chips');
add(55,'Shneider’s','Mr. Hipster ketelchips mediterraan','','194961002477','Aardappelen (EU), zonnebloemolie, olijfolie, mediterraans smaakaroma [suiker, specerijen (ui, knoflook, paprika, peterselie), aroma’s, glucosestrooppoeder, zout, tomatenpoeder, zuurteregelaars (citroenzuur, appelzuur), zoetstof (aspartaam)].','','Mosterd en melk.','STAR-K (Parve)','55,56,57','Chips');
add(52,'Elisha','Aardappelchips','75 g','5425000531791','Aardappelen (75%; gele, rode en blauwe aardappelen in wisselende verhoudingen), plantaardige oliën (zonnebloemolie en koolzaadolie in wisselende verhoudingen), zout.','','',M,'52,53,54','Chips');
add(49,'Elisha','Groentechips','75 g','5425000531777','Groenten (71%; wortel, zoete aardappel, rode biet en pastinaak in wisselende verhoudingen), plantaardige oliën (zonnebloemolie en koolzaadolie in wisselende verhoudingen), zout.','','',M,'49,50,51','Chips');
add(45,'Elisha','Zoete-aardappelchips','75 g','5425000531784','Zoete aardappel (71%), plantaardige oliën (zonnebloemolie en koolzaadolie in wisselende verhoudingen), zout (1%).','','',M,'45,46,47,48','Chips');
add(61,'Elisha','Aardappelsnack paprika','75 g','5425000533689','Aardappelbereiding (74%; aardappelgranules, aardappelvlokken, aardappelzetmeel, zout), zonnebloemolie, paprikakruiden [uienpoeder, specerijen (1,7%; paprika), suiker, dextrose, zout, gistextract, aroma, knoflookpoeder, kleurstof (paprika-extract)], antioxidant (rozemarijnextract).','','Gluten en soja.',M,'61,62,63','Chips');
add(64,'Elisha','Aardappelsnack gezouten','75 g','5425000533672','Aardappelbereiding (84%; aardappelgranules, aardappelvlokken, aardappelzetmeel, zout), zonnebloemolie, zout (1%).','','Gluten en soja.',M,'64,65,66','Chips');
add(67,'Elisha','Mini snacks rode rijst en kikkererwten','80 g','5425000534488','Volkoren rode rijst (70%), kikkererwten (20%), plantaardige oliën (9%; zonnebloemolie en maïsolie), zout.','','Sesam.',M,'67,68,69','Rijst- en maïssnacks');
add(70,'Elisha','Mini snacks maïs en peulvruchten','80 g','5425000534204','Maïs, peulvruchten (30%; rode linzen, groene erwten, gele erwten, zwarte bonen), plantaardige oliën (9%; zonnebloemolie en maïsolie), zout.','','Sesam.',M,'70,71','Rijst- en maïssnacks');
add(72,'Elisha','Mini maïssnacks','80 g','5425000534303','Maïs (90%), plantaardige oliën (9%; zonnebloemolie en maïsolie), zout.','','Sesam.',M,'72,73','Rijst- en maïssnacks');
add(74,'Elisha','Mini snacks rode linzen en zwarte rijst','80 g','5425000534389','Rode-linzenmeel (70%), zwarte rijst (20%), plantaardige oliën (9%; zonnebloemolie en maïsolie), zout.','','Sesam.',M,'74,75','Rijst- en maïssnacks');
add(76,'Shufra','Magnetronpopcorn light','255 g (3 × 85 g)','689423002855','Popcornmaïs, palmolie, zout.','','','OU (Parve)','76,77,78','Popcorn');
add(79,'Beigel & Beigel','Cracker Crisps met zure-room- en uiensmaak','300 g','008982000513','Tarwemeel, gedroogde aardappelvlokken, palmolie, maïszetmeel (genetisch gemodificeerd), rijstmeel, zout, havermeel, suiker, gerstemoutextract, aroma’s (soja), rijsmiddelen (E500(ii), E503(ii)), emulgator (koolzaadlecithine), smaakversterkers (E621, E631, E627), kleurstof (bètacaroteen).','Tarwe (gluten)|Haver (gluten)|Gerst (gluten)|Soja','Pinda’s, amandelen, hazelnoten, sesam en mosterd.','OU (Parve) · Rabbinaat Safed','79,80,81','Crackers');
add(82,'Beigel & Beigel','Dag Dag gezouten visvormige crackers','250 g','7290116533544','Tarwemeel, palmolie, glucosestroop (bevat genetisch gemodificeerde maïs), gerstemoutextract, suiker, zout, gist, emulgator (E472e).','Tarwe (gluten)|Gerst (gluten)','Haver, pinda’s, soja, amandelen, hazelnoten, mosterd en sesam.',E,'82,83,84','Crackers');
add(85,'Beigel & Beigel','Mini crackers sesamcocktail','300 g','7290112495174','Tarwebloem, plantaardige olie, sesamzaad (5%), suiker, glucosestroop, gerstemout, rijsmiddelen (ammoniumbicarbonaat, natriumbicarbonaat), emulgator (E471), zout, dextrose, gemodificeerd zetmeel (E1422).','Tarwe (gluten)|Gerst (gluten)|Sesam','Soja, mosterd, hazelnoten, pinda’s en amandelen.',E,'85,86,87','Crackers');
add(88,'Beigel & Beigel','Ronde mini crackers met zout','300 g','7290112495150','Tarwebloem, plantaardige olie, suiker, zout, glucosestroop, rijsmiddelen (ammoniumbicarbonaat, natriumbicarbonaat, dinatriumdifosfaat), gerstemout, emulgatoren (E471, E334), aroma’s.','Tarwe (gluten)|Gerst (gluten)','Sesam, soja, mosterd, hazelnoten, pinda’s en amandelen.','Rabbinaat Safed','88,89,90','Crackers');
add(91,'Beigel & Beigel','Mini crackers zoutcocktail','300 g','7290112495143','Tarwebloem, plantaardige olie, suiker, gerstemout, glucosestroop, rijsmiddelen (ammoniumbicarbonaat, natriumbicarbonaat), emulgator (E471), zout, dextrose.','Tarwe (gluten)|Gerst (gluten)','Soja, sesam, mosterd, hazelnoten, pinda’s en amandelen.',E,'91,92,93','Crackers');
add(94,'Poco Loco','Tortillarolletjes Hot & Spicy','125 g','5412514931087','Maïsbloem (69%), zonnebloemolie, maltodextrine, zout, ui, dextrose, suiker, gistextract, chili (0,1%), paprika, natuurlijke aroma’s, zuurteregelaars (citroenzuur, calciumlactaat).','','Soja.','Rabbijn Pinchas Avraham Meyers (Parve) · Bishul Yisrael','94,95,96','Rijst- en maïssnacks');
add(97,'Poco Loco','Tortillarolletjes zoete tomaat','125 g','5412514931063','Maïsbloem (67%), zonnebloemolie, suiker, zout, tomatenpoeder (1,2%), aroma’s, maltodextrine, kruiden, voedingszuur (citroenzuur), kleurstof (paprika-extract), zetmeel.','','Soja.','Rabbijn Pinchas Avraham Meyers (Parve) · Bishul Yisrael','97,98,99','Rijst- en maïssnacks');
add(100,'Elisha','Knapperige suikerhoorntjes','30 stuks','5425000532644','Tarwebloem, suiker, voedingsvezels, kokosolie, emulgator (lecithine, E322), zout, aroma (vanilline).','Tarwe (gluten)','',M,'100,101','IJshoorntjes');
add(102,'Shevach','Corn Balls Classic maïsbolletjes','375 g','5425000534945','Volkoren maïsmeel (90%), suiker, zout.','','Pinda’s en andere noten.',E+' (Parve)','102,103,104','Ontbijtgranen');
const tortilla='Tarwebloem (64%), water, stabilisator (E422), raapzaadolie, tarwegluten, tarwevezel, dextrose, voedingszuur (E296), emulgator (E471), rijsmiddel (E500), zout, conserveermiddel (E282), meelverbeteraar (E920).';
add(105,'Poco Loco','Tortilla’s Original, maat M','320 g (8 stuks)','5412514555559',tortilla,'Tarwe (gluten)','','Parve','105,106','Tortilla’s en wraps');
add(107,'Poco Loco','Wraps Original, maat L','370 g (6 stuks)','5412514350000',tortilla,'Tarwe (gluten)','','Rabbijn Pinchas Avraham Meyers (Parve)','107,108','Tortilla’s en wraps');
add(110,'Elisha','Sprinkles donkerblauw','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'donkerblauw',Allergenen:'Nog te controleren op het etiket.'}});
add(111,'Elisha','Sprinkles geel','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'geel',Allergenen:'Nog te controleren op het etiket.'}});
add(112,'Elisha','Sprinkles lichtblauw','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'lichtblauw',Allergenen:'Nog te controleren op het etiket.'}});
add(113,'Elisha','Sprinkles rood','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'rood',Allergenen:'Nog te controleren op het etiket.'}});
add(114,'Elisha','Sprinkles oranje','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'oranje',Allergenen:'Nog te controleren op het etiket.'}});
add(115,'Elisha','Sprinkles groen','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'groen',Allergenen:'Nog te controleren op het etiket.'}});
add(116,'Elisha','Sprinkles lila','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'lila',Allergenen:'Nog te controleren op het etiket.'}});
add(117,'Elisha','Sprinkles wit','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'wit',Allergenen:'Nog te controleren op het etiket.'}});
add(118,'Elisha','Sprinkles kleurenmix','120 g','','Ingrediënten nog te controleren op het etiket.','','',M,'','Bakdecoratie');
Object.assign(rows[rows.length-1],{allergens:null,sourcePhotos:[],productInfo:{Inhoud:'120 g',Kleur:'kleurenmix',Allergenen:'Nog te controleren op het etiket.'}});
rows.find(p=>p.id===55).warning='Bevat een bron van fenylalanine.';
for (const id of [45,49,52]) rows.find(p=>p.id===id).allergenNote='Geproduceerd in een fabriek waar ook pinda’s, sesam, soja en noten worden verwerkt.';
// Frontkleur is geen bewijs voor ingrediënten. De foto's en labels blijven afzonderlijk traceerbaar.
const sourcesPath=path.join(__dirname,'image-sources.json');
const sources=fs.existsSync(sourcesPath)?JSON.parse(fs.readFileSync(sourcesPath,'utf8')):{};
for(const p of rows){
  const src=sources[p.id+'.jpg'];
  if(src){ p.image=src.localImage; if(src.imagePresentation)p.imagePresentation=src.imagePresentation; if(src.imageEdited)p.imageEdited=true; if(src.imageIllustration)p.imageIllustration=true; }
}
fs.writeFileSync(path.join(__dirname,'products.js'),'window.KPI_PRODUCTS = '+JSON.stringify(rows,null,2)+';\n');
console.log('Meter 13:',rows.length,'producten;',rows.filter(p=>p.image).length,'foto’s');
