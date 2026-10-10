# From repository root: node scripts/catalog-image-paths.cjs, then python scripts/catalog-thumbnails.py
# Regenerate after adding/replacing photos; new products without a thumbnail use their original image.
from pathlib import Path
from PIL import Image,ImageOps
import json,hashlib
paths=json.loads(Path('tmp/catalog-image-paths.json').read_text(encoding='utf-8'))
out=Path('catalogus/thumbnails');out.mkdir(exist_ok=True)
result={};before=after=0;skipped=[]
for name in paths:
 p=Path(name)
 if not p.is_file():skipped.append(name);continue
 try:
  with Image.open(p) as im:
   im=ImageOps.exif_transpose(im);im.thumbnail((480,480),Image.Resampling.LANCZOS)
   if im.mode not in ('RGB','RGBA'):im=im.convert('RGBA')
   key=hashlib.sha256(p.read_bytes()).hexdigest()[:20]+'.webp';dest=out/key
   if not dest.exists():im.save(dest,'WEBP',quality=83,method=6)
   result[name]='thumbnails/'+key;before+=p.stat().st_size;after+=dest.stat().st_size
 except (OSError,ValueError):skipped.append(name)
Path('catalogus/thumbnails.js').write_text('window.CATALOG_THUMBNAILS = '+json.dumps(result,ensure_ascii=False)+';\n',encoding='utf-8')
print(json.dumps({'images':len(result),'originalMB':round(before/1e6,1),'thumbnailMB':round(after/1e6,1),'skipped':skipped}))

