import pathlib,re,decimal,json
root=pathlib.Path(__file__).resolve().parent
report_path=root/'energy-rounding-20261105.json'
report=json.loads(report_path.read_text(encoding='utf-8')) if report_path.exists() else []
line=re.compile(r'("(?:Energie|Energy)"\s*:\s*")([^"\r\n]*)(")',re.I)
number=re.compile(r'(?<![\d.,])(\d+(?:[.,]\d+)?)\s*(kJ|kcal)\b',re.I)
for p in list(root.glob('meter-*/products.js'))+list(root.glob('diepvries-*/products.js'))+list(root.glob('koeling-*/products.js'))+list((root/'assets/js').glob('products-*.js')):
    text=p.read_bytes().decode('utf-8-sig')
    def change(m):
        old=m[2]
        def rounded(n):
            value=decimal.Decimal(n[1].replace(',','.'))
            mode=decimal.ROUND_FLOOR if n[2].lower()=='kj' else decimal.ROUND_CEILING
            return str(value.to_integral_value(rounding=mode))+' '+n[2]
        new=number.sub(rounded,old)
        if old!=new:report.append({'file':str(p.relative_to(root)),'before':old,'after':new})
        return m[1]+new+m[3]
    updated=line.sub(change,text)
    if updated!=text:p.write_bytes(updated.encode('utf-8'))
(root/'energy-rounding-20261105.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
print('Updated energy entries:',len(report),'in',len(set(r['file'] for r in report)),'files')
changed={r['file'].replace('\\','/') for r in report}
for page in root.glob('*/index.html'):
    text=page.read_text(encoding='utf-8-sig')
    updated=text
    for match in re.finditer(r'src="([^"]+)"',text):
        url=match[1]
        base=url.split('?')[0]
        try:relative=(page.parent/base).resolve().relative_to(root).as_posix()
        except ValueError:continue
        if relative in changed:updated=updated.replace(url,base+'?v=20261105-energy-rounding')
    if updated!=text:page.write_text(updated,encoding='utf-8')
for filename in ['catalogus/catalog.js','catalogus/index.html']:
    page=root/filename
    text=page.read_text(encoding='utf-8')
    page.write_text(text.replace('20261105-meter5-nutrition','20261105-energy-rounding'),encoding='utf-8')
