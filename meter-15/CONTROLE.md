# DKW meter 15 — lokale controleversie

Status: lokale preview, niet gecommit, gepusht of gepubliceerd. Wacht op inhoudelijke en visuele goedkeuring.

Preview: http://localhost:4173/meter-15/

Bron van productinformatie: de 18 fysieke productfoto's `1.jpg` t/m `18.jpg` van de gebruiker. Tien afzonderlijke producten, waaronder Gusto 45 g en 85 g. Geen gegevens van online verpakkingen gebruikt ter vervanging van fysieke etiketten. Geen eigen snapshots of gegenereerde afbeeldingen als productfoto gebruikt.

## Producten, barcodes en online foto's

| Product | Gewicht | Barcode op fysieke foto | Online fotobron | Resolutie |
|---|---|---|---|---|
| Osem Bamba Pindasnacks | 200 g | 077544000797 | [Tesco](https://www.tesco.com/groceries/en-GB/products/287614819) | 1600 × 1600 |
| Osem Bamba met Marshmallowvulling | 60 g | 077544006638 | [Seasons Kosher](https://seasonskosher.com/Queens/category/10576/marshmallow/414748/osem-bamba-marshmallow-filling-21-oz) | 2000 × 2000 |
| Liel Briochebroodjes met Chocoladestukjes | 280 g | 3662444003329 | [Liel fabrikant](https://liel.fr/b-vienoiserie/20-8-petits-pains-pepite-chocolat-300g-3662444003329.html) | 1892 × 4201 |
| Liel Briochebroodjes Naturel | 280 g | 3662444003336 | [Liel fabrikant](https://liel.fr/b-vienoiserie/21-8-petits-pains-280g-3662444003336.html) | 2066 × 4085 |
| Liel Croissants | 320 g | 3662444003305 | [Liel fabrikant](https://liel.fr/b-vienoiserie/78-croissants-x8-320g-3662444003305.html) | 607 × 1323 |
| Liel Gesneden Brioche Naturel | 500 g | 3662444003282 | [Liel fabrikant](https://liel.fr/b-vienoiserie/133-brioche-tranchee-500g-3662444003282.html) | 1780 × 3701 |
| Liel Gesneden Brioche met Chocoladestukjes | 500 g | 3662444003299 | [Liel fabrikant](https://liel.fr/b-vienoiserie/38-brioche-tranchee-pepites-choc-500g-3662444003299.html) | 2112 × 3553 |
| Liel Wit Sandwichbrood | 550 g | 3662444005576 | [Liel fabrikant](https://liel.fr/b-vienoiserie/19-pain-de-mie-nature-550g-liel-3662444005576.html) | 255 × 448 — beperkte scherpte |
| Gusto Pufuleti Maïssnacks met Zout | 85 g | 5941868200087 | [Kifli](https://www.kifli.hu/114282-gusto-natur-extrudalt-kukoricapehely) | Origineel PNG |
| Gusto Pufuleti Maïssnacks met Zout | 45 g | 5941868203248 | [Continental Food Store](https://cfsuk.shop/products/gusto-pufuleti-corn-salted-puffs-45-g) | 1200 × 1200 |

De oorspronkelijke afbeeldingsbestanden zijn opgeslagen in `images/`. Voor de Liel-foto's zijn de oorspronkelijke bestanden onder `https://liel.fr/img/p/` gebruikt, niet de kleine webwinkelminiaturen.

### Afwijkingen van foto's

- Bamba marshmallow: Hebreeuwse online verpakking van dezelfde smaak en 60 g. De etiketgegevens komen uit de Engelse fysieke verpakking.
- Liel chocoladebroodjes: fabrikantpagina noemt 300 g, maar de originele fabrikantfoto toont 280 g en dezelfde barcode. De actuele fysieke verpakking blijft leidend voor 280 g en 9,5% chocoladestukjes.
- Liel-fabrikantfoto's tonen soms oudere etiketten en certificeringen. De gegevens in de vensters zijn van de aangeleverde fysieke foto's.
- Gusto 45 g: andere bedrukking op de online zak; dezelfde merk-, smaak- en gewichtsvariant.
- In ieder productvenster staat de bestaande melding: “Afbeelding kan afwijken van de actuele verpakking.”

## Nog te controleren

1. **Gusto 45 g:** ingrediënten, allergenen en “kan bevatten” ontbreken op de aangeleverde beelden. Foto 18 toont voedingswaarden en barcode. Deze velden zijn zichtbaar als nog te controleren; er staat nadrukkelijk niet dat het product allergeenvrij is. De lijst van Gusto 85 g is niet gekopieerd.
2. **Bamba marshmallow:** foto 5 bevat een volledig leesbare Amerikaanse ingrediëntenlijst, die is vertaald. Het Britse blok aan de zijkant vermeldt 25,4%, maar de bijbehorende woorden vallen buiten beeld. Dat percentage is niet aan een ingrediënt gekoppeld zonder bewijs.
3. **Liel sandwichbrood:** de Engelse lijst op foto 13 is vertaald. De Hebreeuwse lijst op dezelfde foto bevat daarnaast dextrose. Dit verschil tussen talen op het fysieke etiket vraagt controle; geen online lijst gebruikt om dat stilzwijgend op te lossen.
4. **Gusto 85 g:** de Nederlandse etikettekst noemt maïszetmeel; andere talen op dezelfde verpakking noemen maïsgries. In de preview is de Nederlandse tekst behouden.
5. **Sandwichbroodfoto:** de originele fabrikantfoto is 255 × 448 pixels. Ook de fabrikantcatalogus en gerichte zoekacties leverden geen aantoonbaar scherpere foto van precies die verpakking. Deze foto voldoet daardoor nog niet volledig aan de gevraagde hoge scherpte.
6. **Bamba 200 g:** de plaatsnaam bij Chief Rabbinate is door de vouw niet leesbaar en is niet aangevuld. Badatz Edah HaChareidis en Parve zijn wel herkenbaar.

## Technische controle

- Exact dezelfde gedeelde CSS-bestanden, header, achtergrond, lettertypen, kaarten en dialog-opmaak als meter 6; geen nieuw ontwerp.
- `catalog.js` is een lokale kopie van de gedeelde renderer met alleen een apart “Kan bevatten”-blok, een neutrale onbekend-status voor ontbrekende allergenen en de juiste meternaam bij lege data. Bestaande meters worden daardoor niet gewijzigd.
- Tien unieke product-ID's en tien unieke barcodes. Alle UPC/EAN-controlecijfers geldig; cijfers ook met fysieke foto's vergeleken.
- Alle tien afbeeldingen laden, ook in de productvensters.
- Zoeken op Bamba: twee resultaten. Onbekende zoekterm: juiste lege melding.
- Filters: Snacks vier producten, Brood & brioche zes, Alle tien.
- Alle tien vensters openen met hun eigen titel, barcode, ingrediënten, allergenen, afzonderlijk “Kan bevatten” en hechsher. Sluitknop werkt voor alle tien.
- Mobiele weergave op 390 × 844 gecontroleerd: geen horizontale overflow, leesbaar productvenster en werkende sluitknop. Viewport na controle hersteld.
- JavaScript-syntax gecontroleerd; geen consolefouten in de browser.
- Alleen nieuwe bestanden onder `meter-15/`; geen wijziging aan andere meters of schappen.

Geen commit, push of publicatie uitvoeren voordat de gebruiker akkoord geeft.

## Fotocontrole 15 september 2026
- Productfoto’s groter weergegeven: 230 px desktop / 160 px mobiel. Originele Liel Frankrijk-foto’s behouden; subtiel contrast voor de twee broodjesfoto’s.
- Gusto 45 g: nieuwe foto van Foodplus (518 × 600), https://uk.foodplus.eu/en_GB/p/Corn-Salted-Puffs-Pufuleti-Simpli-45g-Gusto/26419 .
- Gusto 85 g: nieuwe grotere foto van Mega Image (1600 × 1600), https://www.mega-image.ro/Dulciuri-si-snacks/Popcorn-covrigei-si-pufuleti/Snacks-uri-si-pufuleti/Pufuleti-85g/p/18481 . Bedrukking verschilt van eigen verpakking; bestaande verpakkingsmelding blijft van toepassing. Etiketgegevens niet overgenomen van online foto.
- Engelse Bamba Marshmallow-foto niet gevonden in gecontroleerde winkelbronnen; huidige Hebreeuwse foto behouden. Geen Engelse tekst op de afbeelding verzonnen.
- Geen commit, push of publicatie.

- Gusto 85 g: de eerdere Mega Image-foto vervangen door de expliciet door de gebruiker geselecteerde foto, opgeslagen als images/gusto-85g-selected.png. Productgegevens ongewijzigd.

- Broodfoto’s: vijf Elisha-packshots geselecteerd, met bijbehorende bron in products.js. Wit sandwichbrood behoudt de goedgekeurde fabrikantfoto. Alle zes op dezelfde beeldhoogte met behoud van verhouding; kleurfilter verwijderd. Etiketinformatie blijft gebaseerd op eigen foto’s.
- Volgorde: Bamba 200 g, Bamba Marshmallow, Gusto 85 g, Gusto 45 g, daarna zes broodproducten.
