(function () {
  'use strict';

  // Whole ingredient names: do not match melkzuur, kokosmelk or nootmuskaat.
  const names = /^(?:tarwe(?:meel|bloem|zetmeel|gluten|eiwit|griesmeel|mout)?|rogge(?:meel|bloem)?|gerst(?:emout|emoutextract|mout|moutextract|meel)?|haver(?:meel|vlokken|bloem)?|spelt(?:meel|bloem)?|gluten|glutenbevattende|schaaldieren|garnalen|garnaal|krab|kreeft|ei|eieren|eigeel|eidooier|eidooiers|eiwit|eipoeder|eigeelpoeder|eierpoeder|eierdooier|eierdooiers|vis|tonijn(?:stukken|filets)?|ansjovis|sardine|sardines|sprot|sprotten|karper|zilverkarper|zalm|kabeljauw|koolvis|haring|heek|pinda(?:s|’s|'s)?|aardnoten|arachide(?:n)?|soja(?:bonen|meel|bloem|eiwit|proteïne|lecithine|saus)?|melk|melkpoeder|melkeiwit(?:ten)?|weipoeder|wei|weieiwit|caseïne|caseïnaat|lactose|boter|room|kaas|yoghurt|amandel(?:en|meel)?|hazelno(?:ot|ten)|walno(?:ot|ten)|cashew(?:s|noten|noot)?|pecanno(?:ot|ten)|parano(?:ot|ten)|pistache(?:s|noten)?|macadamia(?:noten)?|noten|selderij(?:zaad|poeder)?|knolselderij|mosterd(?:zaad|zaden|poeder|meel)?|sesam(?:zaad|zaden|pasta)?|sulfiet(?:en)?|zwaveldioxide|lupine(?:meel)?|weekdieren|mosselen|oesters|inktvis)$/iu;
  const compounds = /^(?:volkorentarwemeel|tarwe(?:dextrose|kiemen|vezel|vlokken|zemelen)|gerste(?:bloem|gluten|meel)|gerstemoutstroop|havermoutvlokken|(?:geiten|koe|schapen)melk|geitenroom|volle(?:melkpoeder)|melk(?:bestanddelen|chocolade|fermenten|mineralen|room|vet)|muensterkaas|roomkaas|scharreleieren|hazelnoot(?:crèmevulling|pasta)|pinda(?:kaas|pasta)|selderijextract|mosterdzaadjes|sesamzaadjes|soja(?:lecithinen|olie|sauspoeder|vlokken)|visgelatine|natriummetabisulfiet)$/iu;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  window.KPI_emphasizeAllergens = function (value) {
    let firstWord = true;
    const ingredients = String(value).replace(/(tonijn(?:stukken|filets)?)\s*\(\s*vis\s*(?:[,;]\s*([^)]*)|\s*)\)/gi, (_, name, details) => name + (details ? ' (' + details.trim() + ')' : ''));
    return ingredients.replace(/\[/g, '(').replace(/\]/g, ')').replace(/;\s*/g, ', ').split(/([\p{L}]+(?:[’'][\p{L}]+)?(?:\d+[a-z]*)?)/u).map(part => {
      if (!/^[\p{L}]/u.test(part)) return escapeHtml(part);
      const allergen = names.test(part) || compounds.test(part);
      // Keep additive and vitamin codes readable; normalize prose consistently.
      const code = /^(?:E\d+[a-z]*|B\d+|CMC|BHA|BHT|EDTA|TBHQ|MSG)$/i.test(part);
      let formatted = code ? part.toUpperCase() : part.toLocaleLowerCase('nl');
      if (firstWord && !code) formatted = formatted[0].toLocaleUpperCase('nl') + formatted.slice(1);
      firstWord = false;
      const safe = escapeHtml(formatted);
      return allergen ? `<strong>${safe}</strong>` : safe;
    }).join('');
  };
})();
