import json,pathlib,shutil
ROOT=pathlib.Path(__file__).resolve().parent
path=ROOT/'products.js'
text=path.read_text(encoding='utf-8-sig')
items=json.loads(text[text.index('['):text.index('\n];')+2])
byid={p['id']:p for p in items}
records={}
def fmt(v,u='g'):
    if isinstance(v,float):v=round(v,3)
    return str(v).replace('.',',')+' '+u
def add(i,kj,kcal,fat,sat,carb,sugar,fibre,protein,salt,**extra):
    n={'Energie':fmt(kj,'kJ')+' / '+fmt(kcal,'kcal'),'Vetten':fmt(fat)}
    if sat is not None:n['Waarvan verzadigde vetzuren']=fmt(sat)
    n['Koolhydraten']=fmt(carb)
    n['Waarvan suikers']=fmt(sugar)
    if fibre is not None:n['Vezels']=fmt(fibre)
    n['Eiwitten']=fmt(protein)
    n['Zout']=fmt(salt)
    n.update(extra)
    byid[i].update(nutrition=n,nutritionUnit='per 100 g',nutritionChecked='2026-11-05')
    records[str(i)]={'nutrition':n,'nutritionUnit':'per 100 g'}
def portion(i,g,kcal,fat,sat,carb,sugar,fibre,protein,sodium,**extra):
    f=100/g
    def scale(v):return '< '+str(round(float(v[1:])*f,3)) if isinstance(v,str) and v.startswith('<') else v*f
    e={}
    for key,(v,unit) in extra.items():e[key]=fmt(scale(v),unit)
    e['Natrium']=fmt(sodium*f,'mg')
    add(i,round(kcal*f*4.184),round(kcal*f,2),scale(fat),scale(sat),scale(carb),scale(sugar),scale(fibre),scale(protein),round(sodium*f*.0025,3),**e)
    byid[i]['nutritionOriginal']={'unit':f'per {g} g','kcal':kcal,'fat':fat,'saturated':sat,'carbohydrates':carb,'sugars':sugar,'fibre':fibre,'protein':protein,'sodiumMg':sodium,'extra':extra}
add(1,1528,365,1,.2,80,'< 0.5',3.7,11.4,.025)
add(2,1435,343,2.3,.4,76,2,11,16,.02)
add(3,2236,537,35.7,19.8,44.3,.9,None,8.6,.79)
zero={'Transvetten':(0,'g'),'Cholesterol':(0,'mg'),'Vitamine D':(0,'µg')}
portion(4,15,60,1,0,11,1,.5,2,75,**zero,**{'Toegevoegde suikers':(1,'g'),'Calcium':(38,'mg'),'IJzer':(2,'mg'),'Kalium':(331,'mg')})
portion(5,15,58,1,0,11,1,1,2,60,**zero,**{'Toegevoegde suikers':(1,'g'),'Calcium':(4,'mg'),'IJzer':(.3,'mg'),'Kalium':(464,'mg')})
z={**zero,'Calcium':(0,'mg'),'IJzer':(0,'mg'),'Kalium':(0,'mg')}
portion(12,33,170,8,1.5,21,2,1,3,130,**z,**{'Toegevoegde suikers':(2,'g')})
portion(11,28,130,5,1,19,1,1,3,110,**z,**{'Toegevoegde suikers':(1,'g')})
portion(9,28,120,3.5,1,20,'<1','<1',3,220,**z,**{'Toegevoegde suikers':('<1','g')})
add(6,2176,520,25,3.4,65,7.5,2.3,7.5,1.9)
portion(13,22,100,4,0,15,1,1,3,90,**z,**{'Toegevoegde suikers':(0,'g')})
add(14,1940,458,16,1.7,64,8.8,6.5,12,1)
add(15,1645,388,3,.6,80.7,.9,3.4,7.9,.28)
add(16,1636,385,.7,0,86.2,.6,.4,8,.28)
add(17,1672,394,1.4,.4,89,'< 0.5',1.5,5.6,.3)
add(18,1619,382,1.3,.3,82.6,.4,3.4,8.2,.28)
add(19,1441,340,1.3,.2,75,.6,3.2,5.4,.49)
add(20,1500,354,2.3,.3,74,1,4.9,6.9,.50)
add(21,2005,479,22,13,61,27,6.1,6.2,.01)
for product in items:
    if product['brand']=='Wissotzky':
        add(product['id'],0,0,0,None,0,0,None,.06,0,Natrium='0 mg')
        # Only energy, protein, carbohydrate, fat and sodium were supplied for tea.
        del product['nutrition']['Waarvan suikers']
        product['nutritionSource']='Gebruiker bevestigt deze aangeleverde theewaarden voor alle thee, 5 november 2026.'
portion(23,12,50,0,0,11,10,'<1','<1',0,**z,**{'Toegevoegde suikers':(10,'g')})
add(22,1657,396,2,1,90,82,None,4.5,0)
sources={
1:['06bf8fe3-644e-438b-a86e-3446125c17b9'],2:['7b523846-01c0-48f1-b32e-e4572b86949f'],3:['7dc197b5-3652-4e85-b19d-6aa94f73d1ac'],4:['514e6cf6-0dba-4dc8-9bf0-cbadf88a6788'],5:['426126c7-f90b-405d-bebe-5c7b1a06ac0c'],12:['9af481bb-d23c-472d-a410-7d3c6723ddb1','b093d9e7-f95c-4ea6-98d0-de29645b796a'],11:['dd09fcf6-fe8f-4410-a2a3-44b98ca049bc'],9:['457e879d-13d1-456a-8d56-430f3f22fdf8'],6:['10a7ccc4-a489-49b1-992d-318276f4ecf0','4ac10a69-847e-4f71-a56d-2ac48cf78b42'],13:['9c442195-c910-4e73-96ff-7daa7f5d302a'],14:['4d1bcd66-ff6e-4e2f-8d21-5ff82b1b0fac'],15:['e7ced9ba-6a08-4060-9dc8-deb22a802f63'],16:['03907c6a-e0de-4a9e-a2b8-4a47ea559405'],17:['5adcb7da-1b5b-4205-b622-e6a17c49cb0a'],18:['3da095b8-a734-4316-a218-9a6b251f50dd'],19:['3099d1c7-93eb-46e0-8e3c-16f2a55cdec0'],20:['6fb918ef-86d3-47c1-953d-b6b4db675842'],21:['391af593-5863-4ef4-a80f-e5db5b68d76e','5f53eb67-2956-4134-a3dc-c3c6769e5f83'],23:['4fb24e7c-95a6-445a-8c8a-45b386697620'],22:['4e7b8755-f239-4aef-b908-57ffdd5637b1']}
for product in items:
    if product['brand']=='Wissotzky':sources[product['id']]=['f110125c-7217-47e5-938a-20741e62fd99']
dest=ROOT/'source-labels'/'20261105-nutrition'
dest.mkdir(parents=True,exist_ok=True)
for i,uuids in sources.items():
    paths=[]
    for uuid in uuids:
        filename=uuid+'.jpg'
        target=dest/filename
        if not target.exists():shutil.copy2(pathlib.Path('C:/Users/ellag/AppData/Local/Temp')/('codex-clipboard-'+filename),target)
        paths.append('source-labels/20261105-nutrition/'+filename)
    byid[i]['sourcePhotos']=list(dict.fromkeys(byid[i].get('sourcePhotos',[])+paths))
    records[str(i)]['sourcePhotos']=paths
path.write_text('window.KPI_PRODUCTS = '+json.dumps(items,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(dest/'transcription.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print('Nutrition updated:',len(records),'products; IDs retained:',len(items))
