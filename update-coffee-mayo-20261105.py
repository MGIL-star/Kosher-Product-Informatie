import pathlib,json
root=pathlib.Path(__file__).resolve().parent
for meter in [6,7]:
    p=root/f'meter-{meter}/products.js'
    s=p.read_text(encoding='utf-8-sig')
    data=json.loads(s[s.index('['):s.index('\n];')+2])
    names={'Oploskoffie Naturel','Taster’s Choice Oploskoffie Naturel','Red Mug Oploskoffie','Turkse Koffie met Kardemom','Turkse Koffie'}
    for item in data:
        if item['name'] in names:
            item['nutrition']={'Energie':'4 kJ / 1 kcal'}
            item['nutritionUnit']='per 100 ml'
            item['nutritionSource']='Door gebruiker aangeleverd, 5 november 2026.'
        if meter==6 and item['name'] in {'Oploskoffie met Vanillesmaak','Oploskoffie met Mokkasmaak'}:
            item['nutrition']={'Energie':'1569 kJ / 375 kcal','Koolhydraten':'50 g'}
            item['nutritionUnit']='per 100 g'
            item['nutritionSource']='Door gebruiker aangeleverd, 5 november 2026; kJ berekend uit kcal.'
    p.write_text('window.KPI_PRODUCTS = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
