import json, pathlib, re, shutil
ROOT=pathlib.Path(__file__).resolve().parent
p=ROOT/'products.js'
s=p.read_text(encoding='utf-8-sig')
products=json.loads(s[s.index('['):s.index('\n];')+2])
byid={x['id']:x for x in products}
records={}
def val(v,u='g'):
    return str(v).replace('.',',')+' '+u
def add(i,kj,kcal,fat,sat,carb,sugar,protein,salt,**extra):
    n={'Energie':f'{str(kj).replace(".",",")} kJ / {str(kcal).replace(".",",")} kcal','Vetten':val(fat)}
    if sat is not None:n['Waarvan verzadigde vetzuren']=val(sat)
    n['Koolhydraten']=val(carb)
    n['Waarvan suikers']=val(sugar)
    if 'Vezels' in extra:n['Vezels']=extra.pop('Vezels')
    n['Eiwitten']=val(protein)
    if salt is not None:n['Zout']=val(salt)
    n.update(extra)
    byid[i]['nutrition']=n
    byid[i]['nutritionUnit']='per 100 g'
    byid[i]['nutritionChecked']='2026-11-05'
    records[str(i)]={'nutrition':n,'nutritionUnit':'per 100 g'}
def cal(i,kcal,*args,**kwargs):add(i,round(kcal*4.184),kcal,*args,**kwargs)
add(1,2803,670,60,10.5,4,1.5,24.6,.5,Vezels='8 g',Calcium='120 mg',IJzer='7,7 mg')
add(2,2740,655,57,10,4.5,1.4,25,.5,Vezels='12 g',Calcium='720 mg',IJzer='10,1 mg')
add(3,2862,684,60,10,12,1,24,0)
for i in [4,5]:add(i,2891,691,61.5,9.8,10.7,.8,23.05,.02,Vezels='1,3 g',Transvetten='0 g',Cholesterol='0 g')
add(6,2929,700,60,13.33,13.33,0,26.67,.375,Vezels='3,33 g',Transvetten='0 g',Cholesterol='0 mg',Natrium='150 mg',Calcium='133,33 mg',IJzer='0 mg',Kalium='0 mg',**{'Toegevoegde suikers':'0 g','Vitamine D':'0 µg'})
byid[6]['nutritionOriginal']={'unit':'per 30 g','kcal':210,'fat':18,'saturated':4,'carbohydrates':4,'fibre':1,'protein':8,'sodiumMg':45,'calciumMg':40}
add(50,163,39,.9,.2,6.5,1.1,2,6,Vezels='2,8 g')
cal(7,71,0,0,10,8.7,0,0,Transvetten='0 g',Cholesterol='0 mg',Natrium='0 mg',**{'Suiker (theelepels)':'2,25'})
add(8,825,197,0,0,48,44,.7,1.7,Vezels='1,1 g')
add(9,1047,251,15,1.7,27,27,1.1,.93)
add(10,1018,243,13,1.5,30,28,.9,1.2)
cal(12,112,0,None,23,18,5,5.75,Natrium='2300 mg',**{'Suiker (theelepels)':'4,5'})
cal(13,275,25,3.9,12,9.8,.5,.985,Transvetten='< 0,5 g',Cholesterol='0 mg',Natrium='394 mg',**{'Suiker (theelepels)':'2,5'})
add(15,398,95,6.2,.3,6.5,1.4,5.4,2.9)
add(16,456,109,7.5,.5,5.1,1.4,5.5,3.2)
add(22,1674,406,39.4,4.2,8.3,3.2,3.3,1.7,Vezels='2,5 g')
add(24,1641,398,39.7,4.4,5.4,3,3.5,2.08,Vezels='2,6 g')
add(25,210,50,2.2,2.1,6,3.1,.8,.79,Vezels='3,6 g')
add(28,168,40,1.5,1.4,4.2,.6,1.8,.69,Vezels='1,3 g')
add(26,290,70,4.3,.3,8.1,3.7,1,.63,Vezels='1,3 g')
add(27,194,46,2.2,2.1,5.1,2.4,.9,.67,Vezels='1,3 g')
for i in [51,29]:add(i,293.5,69.5,1.5,.3,5,2.2,2.6,7)
add(31,71,17,0,0,3.9,1,0,7.4)
add(32,1214,293,2,.4,8.6,5.5,2.2,1.2)
byid[32]['ean']='3760413390125'
add(33,754,180,8.1,1.4,.7,0,26,14.3)
byid[33]['nutritionUnit']='per 100 g uitgelekt product'
# Naturel tuna label prints the energy units in reverse: physical consistency gives 435 kJ / 104 kcal.
add(34,435,104,1.2,.1,0,0,23,.52)
byid[34]['nutritionSourceEnergy']='Etiket drukt 435 kcal / 104 kJ; eenheden verwisseld overgenomen als 435 kJ / 104 kcal.'
add(37,1478,353,28,5.3,0,0,24,1.1)
add(35,1456,352,32,5,0,0,16,1.3)
add(36,867,207,11.9,.8,0,0,24.7,1.4)
add(49,867,207,11.9,.8,0,0,24.7,1.2)
cal(44,90,4.3,1.3,4.4,0,8.5,.915,Transvetten='< 0,5 g',Cholesterol='51 mg',Natrium='366 mg')
cal(45,84,1.7,1.1,9.5,4.3,7,.89,Transvetten='< 0,5 g',Cholesterol='48 mg',Natrium='356 mg',**{'Suiker (theelepels)':'1'})
cal(46,87,2.7,.9,9.1,2.1,6.7,.875,Transvetten='< 0,5 g',Cholesterol='30 mg',Natrium='350 mg',**{'Suiker (theelepels)':'0,5'})
for i in [44,45,46]:byid[i]['nutritionUnit']='per 100 g uitgelekt product'
add(38,1473,356,32,8,.5,'< 0.1',17,1.4)
add(39,822,196.43,10.71,1.79,0,0,23.21,.89,Vezels='0 g',Cholesterol='53,57 mg')
byid[39]['nutritionOriginal']={'unit':'per 56 g','kcal':110,'fat':6,'saturated':1,'cholesterolMg':30,'salt':.5,'protein':13,'carbohydrates':0,'sugars':0,'fibre':0}
add(41,754,180,8.82,1.058,0,0,23.97,1.02)
add(42,461,110,1.01,.17,.1,.1,22.99,1.02)
add(43,922,224,12.9,3.3,0,0,26.4,.7)
add(17,3048,728,80,5.6,.5,.3,1.5,1.1,Vezels='0 g',**{'Enkelvoudig onverzadigde vetzuren':'51,2 g','Meervoudig onverzadigde vetzuren':'22,3 g'})
add(18,1143,277,26,2.2,9.8,3.5,.7,1.7,Vezels='1,1 g')
add(19,3071,747,82,6.7,1,.9,1.4,.86,Vezels='0 g')
add(21,3054,742,80,6.6,3.4,.3,1.7,1.1,Vezels='0,5 g',**{'Enkelvoudig onverzadigde vetzuren':'51,2 g','Meervoudig onverzadigde vetzuren':'22,3 g'})
add(20,3071,747,82,6.7,0,0,1.4,.86)
add(14,473,111,0,0,26,23,1.8,1)
add(52,502,120,0,None,30,14,0,1.51,Natrium='604 mg',**{'Suiker (theelepels)':'3,5'})
byid[52]['nutritionUnit']='per 100 ml'
for i in records:records[i]['nutritionUnit']=byid[int(i)]['nutritionUnit']
byid[32]['image']='images/32-diced-garlic.png'
byid[32]['imageEdited']=True
byid[32]['imageEditPrompt']='Keep closed jar, lid, label, text and composition unchanged; change visible garlic paste into distinct small diced garlic cubes.'
sources=json.loads((ROOT/'source-labels'/'20261105-nutrition'/'sources.json').read_text())
for key,photos in sources.items():
    item=byid[int(key)]
    paths=[]
    for uuid in photos:
        filename=uuid+'.jpg'
        target=ROOT/'source-labels'/'20261105-nutrition'/filename
        if not target.exists():shutil.copy2(pathlib.Path('C:/Users/ellag/AppData/Local/Temp')/('codex-clipboard-'+filename),target)
        paths.append('source-labels/20261105-nutrition/'+filename)
    item['sourcePhotos']=list(dict.fromkeys(item.get('sourcePhotos',[])+paths))
    records[key]['sourcePhotos']=paths
p.write_text('window.KPI_PRODUCTS = '+json.dumps(products,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
dest=ROOT/'source-labels'/'20261105-nutrition'
dest.mkdir(parents=True,exist_ok=True)
(dest/'transcription.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print('Nutrition updated:',len(records),'products. IDs preserved:',len(products))
