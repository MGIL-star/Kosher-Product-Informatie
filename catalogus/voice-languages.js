(() => {
  'use strict';
  const definitions={
    nl:{locale:'nl-NL',label:'Catalogustaal: Nederlands',numbers:['een','twee','drie','vier','vijf','zes','zeven','acht','negen','tien','elf','twaalf','dertien','veertien','vijftien','zestien','zeventien','achttien','negentien','twintig'],prefix:/^(?:ik wil(?: graag)?|graag|voeg|doe(?: maar)?)\s+/i,suffix:/\s+(?:toevoegen|toe)(?:\s+aan (?:mijn|de|het|uw) (?:boodschappenlijst(?:je)?|winkelwagen))?$/i,units:/^(?:pakken|pak|potten|pot|flessen|fles|zakken|zak|stuks|stuk|blikken|blik|dozen|doos)\s+/i,articles:/^(?:een)\s+/i},
    en:{locale:'en-GB',label:'Catalogue language: English',numbers:['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'],prefix:/^(?:please|add|i want|i would like|i['’]d like)\s+/i,suffix:/\s+to (?:my|the) (?:shopping list|basket|cart)$/i,units:/^(?:bottles|bottle|packs|pack|packets|packet|bags|bag|pieces|piece|cans|can|boxes|box|cartons|carton|loaves|loaf)(?:\s+of)?\s+/i,articles:/^(?:a|an|some|the)\s+/i},
    fr:{locale:'fr-FR',label:'Langue du catalogue : Français',numbers:['un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt'],prefix:/^(?:je voudrais|je veux|j['’]aimerais|ajoute|ajouter|s['’]il vous plaît)\s+/i,suffix:/\s+(?:à|a) (?:ma liste|mon panier)(?: de courses)?$/i,units:/^(?:bouteilles|bouteille|paquets|paquet|sachets|sachet|pots|pot|boîtes|boîte|boites|boite)(?:\s+(?:de|du|des))?\s+/i,articles:/^(?:de la|du|des|de|le|la|les|un|une)\s+/i},
    iw:{locale:'he-IL',label:'שפת הקטלוג: עברית',numbers:['אחד','שניים','שלוש','ארבע','חמש','שש','שבע','שמונה','תשע','עשר','אחד עשר','שנים עשר','שלושה עשר','ארבעה עשר','חמישה עשר','שישה עשר','שבעה עשר','שמונה עשר','תשעה עשר','עשרים'],prefix:/^(?:אני רוצה|אני צריך|אני צריכה|תוסיף לי|תוסיפי לי|תוסיף|תוסיפי|הוסף|להוסיף|בבקשה)\s+/u,suffix:/\s+(?:לרשימה|לרשימת הקניות|לעגלה)(?: שלי)?$/u,units:/^(?:בקבוקי|בקבוקים|בקבוק|חבילות|חבילת|חבילה|שקיות|שקית|קופסאות|קופסת|קופסה|יחידות|יחידה)\s+/u,articles:/^$/}
  };
  const canonical=code=>code==='he'?'iw':Object.hasOwn(definitions,code)?code:'nl';
  const config=code=>definitions[canonical(code)];
  const normalize=value=>String(value).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');
  function parse(value,language='nl'){
    const code=canonical(language),d=config(code);
    let text=String(value||'').normalize('NFC').trim().replace(/[.!?。؟]+$/u,'').replace(/\s+/g,' '),previous;
    do{previous=text;text=text.replace(d.prefix,'');}while(previous!==text);
    text=text.replace(d.suffix,'').trim();
    const numbers=Object.fromEntries(d.numbers.map((word,i)=>[normalize(word),i+1]));
    if(code==='fr')Object.assign(numbers,{une:1,'dix sept':17,'dix huit':18,'dix neuf':19});
    if(code==='iw')Object.assign(numbers,{'אחת':1,'שני':2,'שתי':2,'שתיים':2,'שלושה':3,'ארבעה':4,'חמישה':5,'שישה':6,'שבעה':7,'תשעה':9});
    const aliases=Object.keys(numbers).sort((a,b)=>b.length-a.length);
    const normalized=normalize(text);let count=1,consumed=0;
    const numeric=normalized.match(/^(\d{1,3})(?:\s*[x×]\s*|\s+)/);
    if(numeric&&!/^7 days\b/i.test(text)){count=Number(numeric[1]);consumed=numeric[0].length;}
    else for(const alias of aliases){if(normalized.startsWith(alias+' ')){count=numbers[alias];consumed=alias.length+1;break;}}
    if(consumed)text=text.slice(consumed);
    text=text.replace(d.units,'').replace(d.articles,'').trim();
    return{query:text,quantity:Math.max(1,Math.min(999,count))};
  }
  window.CatalogVoiceLanguages={config,canonical,parse};
})();
