// Hoekpunten van de bestaande voorzijde; geen gewijzigde verpakkingspixels.
const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'image-sources.json');
const m=JSON.parse(fs.readFileSync(file,'utf8'));
function front(n,size,points,ratio){m[n+'.jpg'].imagePresentation={corners:points.map(([x,y])=>[x/size,y/size]),aspectRatio:ratio};}
for(const n of [1,5,7])front(n,800,[[60,144],[657,108],[657,697],[58,653]],1.05);
front(3,856,[[53,113],[774,68],[775,777],[50,725]],1.05);
for(const n of [20,23,26])front(n,600,[[135,11],[513,36],[517,575],[135,589]],0.72);
front(29,600,[[92,55],[452,43],[451,560],[92,525]],0.77);
front(32,600,[[93,58],[454,48],[451,563],[93,530]],0.77);
front(38,600,[[105,61],[456,50],[455,554],[105,519]],0.77);
front(41,600,[[106,57],[473,45],[470,571],[106,535]],0.77);
for(const n of [70,82,84])front(n,800,[[224,43],[561,28],[591,732],[268,775]],0.47);
front(130,600,[[182,4],[493,27],[493,538],[184,590]],0.66);
front(136,600,[[123,44],[402,30],[398,563],[129,539]],0.56);
front(148,600,[[6,184],[593,154],[592,410],[35,474]],2.08);
front(151,600,[[7,138],[529,183],[505,486],[20,390]],2.08);
front(154,600,[[46,166],[501,192],[490,456],[50,393]],2.08);
m['135.jpg']={...m['135.jpg'],localImage:'images/product-135-edited.png',imageEdited:true,editMethod:'ImageGen: frontaal naast chocoladevariant, etiket volgens gebruikersfoto135'};
fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');
