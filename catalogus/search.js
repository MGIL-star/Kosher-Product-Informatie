(() => {
  'use strict';
  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const families = [
    ['snoep', 'snoepjes', 'snoepgoed', 'candy', 'candies', 'kauwgom', 'gum', 'marshmallow', 'marshmallows', 'taffy', 'dragee', 'lolly', 'lollies', 'toffee', 'must', 'happy time'],
    ['koek', 'koekjes', 'koeken', 'biscuit', 'biscuits', 'cookies', 'cookie', 'wafel', 'wafels', 'wafer', 'wafers', 'babka', 'cake', 'ontbijtkoek', 'speculaas'],
    ['chips', 'crisps', 'bamba', 'bissli', 'pretzels', 'zoutjes'],
    ['chocolade', 'chocolate', 'chocoladereep', 'chocoladerepen'],
    ['brood', 'broodjes', 'brioche', 'pita', 'challe', 'challah'],
    ['kaas', 'cheese', 'roomkaas', 'smeerkaas'],
    ['yoghurt', 'yogurt', 'yoghurtjes'],
    ['sap', 'vruchtensap', 'juice'],
    ['pasta', 'spaghetti', 'macaroni', 'penne', 'fusilli'],
    ['koffie', 'coffee'], ['thee', 'tea']
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
  function matches(product, query, translation='') {
    const q=norm(query); if(!q)return true;
    const barcode=String(product.ean||'').replace(/\D/g,'');
    if(/^\d[\d\s-]*$/.test(query))return barcode.includes(query.replace(/\D/g,''));
    // Shelf headings are deliberately excluded: a chocolate shelf also contains baking powder.
    const text=norm([product.name,product.searchName,product.englishName,product.brand,product.variant,product.category,...(Array.isArray(product.aliases)?product.aliases:[product.aliases]),translation].join(' '));
    const words=text.split(' ');
    return Boolean(window.KPI_searchMatches?.(text,q)) || q.split(' ').every(term => {
      if(text.includes(term))return true;
      const family=families.find(group=>group.some(alias=>alias===term || close(term,alias)));
      if(family && family.some(alias=>words.some(word=>word===alias || word.startsWith(alias)) || (alias.includes(' ')&&text.includes(alias))))return true;
      return words.some(word=>close(term,word));
    });
  }
  window.CatalogSearch={matches,normalize:norm};
})();
