"""Meet lege marges voor CSS-weergave; wijzigt geen afbeeldingspixels."""
from pathlib import Path
from PIL import Image, ImageChops
import json
root=Path(__file__).parent
file=root/'image-sources.json'
sources=json.loads(file.read_text(encoding='utf-8'))
sources.setdefault('orange-noir', {'localImage':'images/product-orange-noir-user.png','originalPhoto':'Door gebruiker aangeleverde Orange Noir'})
for source in sources.values():
    if source.get('imagePresentation'):
        continue
    image=Image.open(root/source['localImage']).convert('RGBA')
    white=Image.new('RGBA',image.size,'white')
    white.alpha_composite(image)
    difference=ImageChops.difference(white.convert('RGB'),Image.new('RGB',image.size,'white'))
    mask=difference.convert('L').point(lambda v:255 if v>45 else 0)
    bounds=mask.getbbox()
    if not bounds: continue
    w,h=image.size
    x0,y0,x1,y1=bounds
    margin=max(2,round(max(w,h)*0.008))
    x0=max(0,x0-margin);y0=max(0,y0-margin);x1=min(w,x1+margin);y1=min(h,y1+margin)
    source['imagePresentation']={'corners':[[x0/w,y0/h],[x1/w,y0/h],[x1/w,y1/h],[x0/w,y1/h]],'aspectRatio':(x1-x0)/(y1-y0)}
file.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
