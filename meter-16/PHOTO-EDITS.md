# Packshotbewerking — 1 oktober 2026

Modus: ingebouwde imagegen-tool, bewerking van bestaande productfoto’s.
De bronbestanden blijven bewaard. Productgegevens volgen de oorspronkelijke etiketten, niet de geretoucheerde foto’s.

## Bestanden

- `images/original-chips-strak.png` — product 1
- `images/honey-chips-strak.png` — product 2
- `images/corn-chips-strak.png` — product 3
- `images/kettle-original-strak.png` — product 4
- `images/popta-strak.png` — product 6
- `images/cotton-candy-strak.png` — product 7
- `images/licorice-strak.png` — product 14

## Prompt voor Original, Corn Chips en Cotton Candy

Retouch this exact product packshot for a professional grocery catalog: straighten the bag upright in a direct front view, make it neatly filled with smooth taut packaging, reduce major wrinkles and dents, clean bright studio lighting on pure white background. Preserve the exact brand, flavor, colors, logo, design and ALL printed text including weight. Do not invent text or change the product. Entire bag visible and centered, 5% margin, square image. Realistic photograph, one bag only.

## Prompt voor Honey, Popta en Licorice

Retouch this exact product packshot for a professional grocery catalog: straighten the bag upright in a direct front view with horizontal top and bottom, make its packaging smooth and taut, reduce major wrinkles and dents, clean bright studio lighting on pure white background. Preserve exact brand, flavor, colors, logo, design and ALL printed text including weight and any Hebrew text. Preserve transparent areas and the actual contents. Do not invent text, logos or claims or change the product. Entire bag visible and centered, 5% margin, square image. Realistic photograph, one bag only.

Honey-correctie: Make one precise correction to this image: remove the two lines of black Hebrew text directly beneath the yellow 0g TRANS FAT PER SERVING badge. These two lines were erroneously added. Fill only their area with the matching plain red bag background. Preserve everything else exactly: all other text, Honey potato Chips, logo, badge, NET WT. 0.75 OZ (21g), bag shape, colors and white background.

## Prompt voor Kettle Original

Edit image 1 only: Lieber's Kettle Cooked Original potato chips catalog packshot. Image 2 is only a reference for the taut, straight, evenly lit appearance of the bag. Make the Original bag neatly filled and symmetrical, smooth out major wrinkles and dents, straighten the front label, brighten the dull exposure to clean studio lighting. Preserve the ORIGINAL variant, navy blue trim, cream and brown striped packaging, authentic logo and all lettering exactly including NET WT 5 OZ (141g). Do not change to barbecue or red trim. Pure white background, entire bag visible, upright centered front view, realistic product photograph. Output one square image of Original only, bag nearly fills height with 5% white margin. Do not add or alter claims or text.

## Controle

De zeven geselecteerde uitvoerbeelden zijn visueel gecontroleerd op merk, variant, leesbare hoofdtekst, kleur, gewicht en rechte presentatie. De eerste Honey-uitvoer is afgekeurd vanwege toegevoegde Hebreeuwse tekst en vervangen door de correctie. Kettle BBQ dient als stijlreferentie en is behouden. Overige flessen, potten, blikken en nette packshots behouden hun bestaande foto en uitlijning.

De gele pretzelverpakkingen zijn nog niet verwerkt: de gevonden gele foto bij B-Kosher toont de verkeerde pretzelvorm. De paarse foto's moeten nog door passende gele online packshots worden vervangen.

## Goedgekeurde standaard en vervolgbewerking

De gebruiker heeft op 1 oktober 2026 Kettle Original als kwaliteitsstandaard aangewezen en de nieuwe Sourdough- en Cherry Nibs-foto's expliciet goedgekeurd: “dit zijn fotos zoals het hoort”. Alle verdere bewerkingen volgen deze afwerking, met behoud van het juiste product en de verpakkingsvariant.

- `images/sourdough-strak.png`: juiste gele Sourdough-zak van 123Fresh; bron bewaard als `images/sourdough-yellow-source.jpg`. Imagegen maakte de zak recht en gladder. Een onterecht toegevoegd omcirkeld U-symbool is in een tweede bewerking verwijderd.
- `images/cherry-nibs-strak.png`: bestaande online Cherry Nibs-foto eerst met Photopea Distort rechtgezet, daarna met imagegen helder en glad afgewerkt. Regenboogkop, productnaam, 113 g en rode geribbelde snoepjes behouden.
- De gedeelde fotokaders blijven 180 px op desktop, 120 px op mobiel en 250 px in de detailweergave, gelijk aan de andere meters. Begrenzingen volgen het zichtbare product; verhoudingen blijven intact.

Sourdough-instructie: Edit the exact yellow Lieber's Sourdough Pretzels bag; use Kettle Original only as a quality reference. Upright front view, taut filled bag, horizontal seams, smooth front, white background and balanced studio lighting. Preserve yellow/red packaging, logo, all wording, 12 OZ (340g), clear window and nugget contents. No invented text. Follow-up: remove only the erroneously added circled U after (340g).

Cherry Nibs-instructie: Edit Lieber's Cherry Nibs 4 OZ (113g), rainbow The Candy House header and clear bag. Use Kettle Original only as a quality reference. Preserve graphics, logo, stripes/scallops, product name, weight and short red ridged candy. Smooth plastic wrinkles, straighten header and bag, white background, whole bag centered. No new text or symbols.

Nog open: passende gele Braided-foto en de verticale Ball Lollypops-verpakking. Deze zijn nog niet als correct goedgekeurd.

## Aanvullende packshots naar dezelfde standaard

- Product 5: `images/kettle-bbq-strak.png`, bron `images/kettle-bbq.png`. Rode BBQ-verpakking strak, recht en helder; Kettle Original uitsluitend als afwerkingsreferentie.
- Product 15: `images/cherry-pull-peel-strak.png`, bron `images/found-15.jpg`. Winkelwatermerk verwijderd, kop en zak rechtgezet, lange rode slierten en 172 g behouden.
- Product 21: `images/teriyaki-strak.png`, bron `images/found-21.jpg`. Winkelwatermerk verwijderd, fles recht en label helder; paarse Teriyaki-variant 296 ml behouden.
- Product 22: `images/soy-strak.png`, bron `images/found-22.jpg`. Winkelwatermerk verwijderd, fles recht en label helder; rode Soy Sauce-variant 296 ml behouden.
- Product 25: `images/cholent-strak.png`, bron `images/found-25.jpg`. Liggende zak behouden, label strakgetrokken, bonenmix en 454 g behouden.

Bewerkingen uitgevoerd met imagegen; elk uitvoerbeeld visueel beoordeeld op product, hoofdtekst, kleur en afwerking. Kleine drukdetails in geretoucheerde beelden zijn geen bron voor ingrediënten- of allergeneninformatie.

Prompts: Retouch the exact source product, straighten front view and seams, reduce major wrinkles, preserve original logo, all printed text, variant, contents and weight. Pure white square studio background, entire product visible. For Pull-N-Peel, Teriyaki and Soy: remove the B-Kosher watermark and restore underlying product/background. For Cholent: retain landscape bag proportions and beans, flatten label. For BBQ: use Kettle Original only as polish reference; retain red seams, BARBECUE and 5 OZ (142g).

## Ball Lollypops en Ice Li

- `images/ball-lollypops-strak.png`: online verticale 85g-zak van Sabeny, bron bewaard in `images/ball-lollypops-source.jpg`. Referentiefoto 27 alleen gebruikt voor de exacte Ball Lollypops-opdruk en rood/oranje/gele wikkels. De verkeerde brede zak is vervangen.
- `images/iceli-strak.png`: online Ice Li-packshot horizontaal rechtgezet met behoud van het liggende verpakkingsontwerp. Kleine Hebreeuwse drukdetails zijn niet betrouwbaar geverifieerd en worden niet gebruikt als productinformatiebron.

Lolly-instructie: Edit online packshot to present precise Ball Lollypops variant in reference photo 27; reference is identity-only. Preserve rainbow The Candy House header and 3 OZ (85g); yellow label BALL LOLLYPOPS. Clear tall bag, individually wrapped round red/orange/yellow lollipops, white sticks. Straight header, bright white studio background, entire bag centered. Cherry Nibs is quality reference only.

Ice Li-instructie: Rotate exact online packshot to horizontal landscape orientation. Straighten bag edges and reduce creases, preserve existing Hebrew wording, blue trim, white center and fruit/ice-pop imagery. Whole package centered on square white canvas; no translated or new text.

Hiermee zijn 16 foto's digitaal afgewerkt. Alleen de gele Braided Pretzels is nog niet opgelost; de vraag over gebruik van de winkelreferentie geldt niet meer voor Ball Lollypops omdat hiervoor een online bron is gevonden.

## Gele Braided Pretzels — afgerond

De gebruiker herhaalde expliciet dat Braided Pretzels in de gele zak moest staan. `images/braided-yellow-strak.png` vervangt nu de paarse foto. Online gele Sourdough-verpakking gebruikt als sjabloon en foto 22 als variantreferentie. Gevlochten pretzelstaafjes zichtbaar; Sourdough/Levain en het zoutwaarschuwingssymbool van het sjabloon verwijderd. Geen aanvullende productclaims toegevoegd. Gehele zak recht en op wit, 340 g. Totaal 17 digitaal afgewerkte foto's.

Op verzoek zijn de secties Fotobewerking en Fotobron uit de productvensters van meter 16 verwijderd. Interne bronregistratie blijft in dit document en de productdata beschikbaar.

## Honey BBQ rechtgezet

`images/honey-bbq-strak.png` vervangt `images/product-19.jpg`. Built-in imagegen gebruikt. Prompt: straighten the bottle and front label to a frontal upright packshot on white; preserve Honey BBQ variant, bottle shape, label design and 510g. Tweede correctie: SINCE 1939 in het logo herstellen. Productgegevens ongewijzigd.
