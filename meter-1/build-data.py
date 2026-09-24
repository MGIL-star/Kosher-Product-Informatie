import json
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parent
products = json.loads((root / 'product-data.json').read_text(encoding='utf-8'))
for product in products:
    image = Image.open(root / product['image']).convert('RGBA')
    background = Image.new('RGBA', image.size, 'white')
    background.alpha_composite(image)
    diff = ImageChops.difference(background.convert('RGB'), Image.new('RGB', image.size, 'white'))
    bbox = diff.convert('L').point(lambda v: 255 if v > 45 else 0).getbbox()
    w, h = image.size
    margin = max(2, round(max(w, h) * .008))
    l,t,r,b = bbox
    l,t,r,b = max(0,l-margin),max(0,t-margin),min(w,r+margin),min(h,b+margin)
    product['imagePresentation'] = {'corners': [[l/w,t/h],[r/w,t/h],[r/w,b/h],[l/w,b/h]], 'aspectRatio': (r-l)/(b-t)}
(root / 'products.js').write_text('window.KPI_PRODUCTS = ' + json.dumps(products, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Built {len(products)} products')
