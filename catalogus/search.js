(() => {
  'use strict';
  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const families = [
    ['snoep', 'bonbon', 'bonbons', 'sucreries', 'ממתקים', 'סוכריות', 'snoepjes', 'snoepgoed', 'candy', 'candies', 'kauwgom', 'gum', 'marshmallow', 'marshmallows', 'taffy', 'dragee', 'lolly', 'lollies', 'toffee', 'must', 'happy time'],
    ['koek', 'עוגיות', 'עוגה', 'עוגות', 'gateau', 'gateaux', 'gaufres', 'koekjes', 'koeken', 'biscuit', 'biscuits', 'cookies', 'cookie', 'wafel', 'wafels', 'wafer', 'wafers', 'babka', 'cake', 'ontbijtkoek', 'speculaas'],
    ['chips', 'crisps', 'bamba', 'bissli', 'pretzels', 'zoutjes', 'popcorn', 'pufuleti', 'doritos', 'pringles', 'maissnacks', 'aardappelsnack', 'barbecueringen', 'tortillarolletjes', 'croustilles', 'חטיפים', 'ציפס', 'צ יפס'],
    ['chocolade', 'chocolate', 'chocolat', 'chocola', 'choco', 'cacao', 'cocoa', 'שוקולד', 'chocoladereep', 'chocoladerepen'],
    ['brood', 'pain', 'pains', 'לחם', 'לחמניות', 'broodjes', 'brioche', 'pita', 'challe', 'challah'],
    ['kaas', 'fromage', 'גבינה', 'גבינות', 'cheese', 'roomkaas', 'smeerkaas'],
    ['yoghurt', 'yogurt', 'yaourt', 'יוגורט', 'yoghurtjes'],
    ['appelsap','apple juice','jus de pomme','מיץ תפוחים'],
    ['druivensap','grape juice','jus de raisin','מיץ ענבים'],
    ['sinaasappelsap','orange juice','jus d orange','מיץ תפוזים'],
    ['melk','milk','lait','חלב'],
    ['sap', 'vruchtensap', 'juice', 'jus', 'מיץ'],
    ['pasta', 'spaghetti', 'macaroni', 'penne', 'fusilli'],
    ['koffie', 'coffee', 'cafe', 'קפה'], ['thee', 'tea', 'the', 'תה'],
    ['soep','soepen','soup','soups','soupe','מרק'],
    ['saus','sauzen','sauce','sauces','רוטב','רטבים'],
    ['rijst','rice','riz','אורז'],
    ['vis','fish','poisson','דג','דגים'],
    ['kip','chicken','poulet','עוף']
  ];
  // One edit, including swapped adjacent letters, for short queries; two for long words.
  function distance(a, b) {
    const rows = Array.from({length:a.length+1}, () => []);
    for(let i=0;i<=a.length;i++) rows[i][0]=i;
    for(let j=0;j<=b.length;j++) rows[0][j]=j;
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) {
      rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) rows[i][j]=Math.min(rows[i][j],rows[i-2][j-2]+1);
    }
    return rows[a.length][b.length];
  }
  const close = (a,b) => a.length>=4 && Math.abs(a.length-b.length)<= (a.length>=8?2:1) && distance(a,b)<=(a.length>=8?2:1);
  const relatedPatterns={
    chips:/chips|bamba|bissli|pretzel|pufuleti|maissnack|aardappelsnack|barbecuering|tortillarol|popcorn|doritos|pringles/,
    koek:/koek|biscuit|wafel|wafer|sprits|babka|cake/,
    chocolade:/chocol|choco|cacao|cocoa/
  };
  // Shopping concepts are separate from literal substrings: ijs is not rijst.
  const iceAliases=['ijslolly','ijslollies','ijslollys','ijs lolly','ijs lollie','ijs lollies','ijs lollys','ijslollie','waterijs','waterijsje','waterijsjes','water ijs','fruitijs','fruitijsje','fruitijsjes','vriesijs','vriesijsjes','ijsjes om in te vriezen','ijsjes om zelf in te vriezen','ijsjes voor de vriezer','ijsjes die je zelf invriest','zelf in te vriezen ijsjes','om zelf in te vriezen','om in te vriezen','roomijs','schepijs','ijsje','ijsjes','ice cream','icecream','ice lolly','ice lollies','ice pop','ice pops','freezer pop','freezer pops','freeze pop','freeze pops','popsicle','popsicles','glace','glaces','glace a l eau','sucette glacee','sucettes glacees','ארטיק','ארטיקים','קרטיב','קרטיבים','שלגון','שלגונים','גלידה','גלידות','ice','ijs'].map(norm).sort((a,b)=>b.length-a.length);
  const iceTypoAliases=iceAliases.filter(alias=>alias.length>=5&&!alias.includes(' '));
  const intentQueries=new Map();
  function intentQuery(value){
    const original=norm(value);if(intentQueries.has(original))return intentQueries.get(original);
    let q=original,previous;
    do{previous=q;q=q.replace(/^(?:ik zoek|ik wil graag|ik wil|zoek naar|zoek|toon|laat mij|laat me|hebben jullie|heb je|wat hebben jullie aan|wat heb je aan|show me|i am looking for|i want|je cherche|montre moi|avez vous|אני מחפש|אני מחפשת|יש לכם) /u,'').replace(/^(?:iets|een product|producten) (om|met|voor) /,(_,purpose)=>purpose==='om'?'om ':'');}while(q!==previous);
    q=q.replace(/^(?:een|de|het|a|an|some|the|un|une|du|des|de la|le|la|les) /,'').replace(/ (?:zien|alsjeblieft|alstublieft|please)$/,'');
    for(const alias of iceAliases)q=(' '+q+' ').split(' '+alias+' ').join(' ijs ').trim();
    q=q.split(' ').map(word=>iceTypoAliases.some(alias=>close(word,alias))?'ijs':word).join(' ');
    q=q.trim();if(intentQueries.size>100)intentQueries.clear();intentQueries.set(original,q);return q;
  }
  function isIce(product,text){
    if(product.catalogType==='nonfood'||product.group==='home')return false;
    const category=norm(product.category);
    if(/^(?:ijs|ijsjes|ice cream|glace|גלידה)$/.test(category))return true;
    if(/hoorntje|hoorntjes|cones|cone|ijsazijn|ijsthee|ijskoffie/.test(text))return false;
    return text.split(' ').some(word=>/^(?:ijs|ijsje|ijsjes|ijslolly|ijslollies|fruitijs|fruitijsje|fruitijsjes|waterijs|waterijsje|waterijsjes|roomijs|schepijs|vriesijs|vriesijsjes|popsicle|popsicles|sorbet|sorbetijs|icecream|glace|glaces|ארטיק|ארטיקים|קרטיב|קרטיבים|שלגון|שלגונים|גלידה|גלידות)$/.test(word));
  }
  const expandedQueries=new Map();
  function matches(product, query, translation='') {
    let q=norm(query);
    const location=q.match(/(?:^| )(?:op |in |van )?meter ?(\d{1,2})(?: |$)/);
    if(location){if(product.meter!=='meter-'+Number(location[1]))return false;q=q.replace(location[0],' ').trim();}
    q=intentQuery(q);
    // Recognize whole translated phrases before splitting query words.
    if(expandedQueries.has(q))q=expandedQueries.get(q);
    else{const original=q;for(const group of families){for(const alias of group.slice(1).sort((a,b)=>b.length-a.length)){const phrase=norm(alias);q=(' '+q+' ').split(' '+phrase+' ').join(' '+norm(group[0])+' ').trim();}}if(expandedQueries.size>100)expandedQueries.clear();expandedQueries.set(original,q);}
     if(!q)return true;
    // A sweet cookie with pretzel filling is not a bag of crisps.
    if(q.split(' ').includes('chips')&&/koek|biscuit|chocol|cake|gebak/.test(norm(product.category))&&!/aardappelchips|tortillachips|maischips/.test(norm(product.name)))return false;
    const barcode=String(product.ean||'').replace(/\D/g,'');
    if(/^\d[\d\s-]*$/.test(query))return barcode.includes(query.replace(/\D/g,''));
    // Shelf headings are deliberately excluded: a chocolate shelf also contains baking powder.
    // Mixed category labels can join unrelated families, e.g. coffee and cocoa.
    const category=/[&·]/.test(product.category||'')?'':product.category;
    const text=norm([product.name,product.searchName,product.englishName,product.brand,product.variant,category,...(Array.isArray(product.aliases)?product.aliases:[product.aliases]),translation].join(' '));
    const words=text.split(' ');
    return (!q.split(' ').includes('ijs')&&!/[^\x00-\x7F]/.test(q)&&Boolean(window.KPI_searchMatches?.(text,q))) || q.split(' ').every(term => {
      if(term==='ijs')return isIce(product,text);
      if(text.includes(term))return true;
      const family=families.find(group=>group.some(alias=>alias===term || close(term,alias)));
      if(family&&relatedPatterns[family[0]]?.test(text))return true;
      if(family && family.some(alias=>words.some(word=>word===alias || word.startsWith(alias)) || (alias.includes(' ')&&text.includes(alias))))return true;
      return words.some(word=>close(term,word));
    });
  }
  function suggestions(query){
    const q=intentQuery(query);const words=q.split(' ');
    if(words.includes('ijs'))return [{query:'ijs',label:'Alle ijsjes en ijslolly’s'}];
    const family=families.find(group=>group.some(alias=>words.some(word=>word===norm(alias)||close(word,norm(alias)))));
    if(!family)return [];
    const labels={chips:'Alle chips en hartige snacks',koek:'Alle koekjes en wafels',chocolade:'Alles met chocolade',snoep:'Alle snoepjes',brood:'Alle broodjes',kaas:'Alle kaas',yoghurt:'Alle yoghurt',sap:'Alle sappen',pasta:'Alle pasta',koffie:'Alle koffie',thee:'Alle thee',soep:'Alle soepen',saus:'Alle sauzen'};
    return [{query:family[0],label:labels[family[0]]||family[0]}];
  }
  window.CatalogSearch={matches,normalize:norm,suggestions};
})();
