(function () {
  'use strict';

  // Whole ingredient names: do not match melkzuur, kokosmelk or nootmuskaat.
  const names = /^(?:tarwe(?:meel|bloem|zetmeel|gluten|eiwit|griesmeel|mout)?|rogge(?:meel|bloem)?|gerst(?:emout|emoutextract|mout|moutextract|meel)?|haver(?:meel|vlokken|bloem)?|spelt(?:meel|bloem)?|gluten|glutenbevattende|schaaldieren|garnalen|garnaal|krab|kreeft|ei|eieren|eigeel|eidooier|eidooiers|eiwit|eipoeder|eigeelpoeder|eierpoeder|eierdooier|eierdooiers|vis|tonijn|ansjovis|sardine|sardines|sprot|sprotten|karper|zilverkarper|zalm|kabeljauw|koolvis|haring|heek|pinda(?:s|’s|'s)?|aardnoten|arachide(?:n)?|soja(?:bonen|meel|bloem|eiwit|proteïne|lecithine|saus)?|melk|melkpoeder|melkeiwit(?:ten)?|weipoeder|wei|weieiwit|caseïne|caseïnaat|lactose|boter|room|kaas|yoghurt|amandel(?:en|meel)?|hazelno(?:ot|ten)|walno(?:ot|ten)|cashew(?:s|noten|noot)?|pecanno(?:ot|ten)|parano(?:ot|ten)|pistache(?:s|noten)?|macadamia(?:noten)?|noten|selderij(?:zaad|poeder)?|knolselderij|mosterd(?:zaad|zaden|poeder|meel)?|sesam(?:zaad|zaden|pasta)?|sulfiet(?:en)?|zwaveldioxide|lupine(?:meel)?|weekdieren|mosselen|oesters|inktvis)$/iu;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  window.KPI_emphasizeAllergens = function (value) {
    return String(value).split(/([\p{L}]+(?:[’'][\p{L}]+)?)/u).map(part => {
      const safe = escapeHtml(part);
      return names.test(part) ? `<strong>${safe}</strong>` : safe;
    }).join('');
  };
})();
