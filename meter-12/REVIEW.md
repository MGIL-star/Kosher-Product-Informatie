# Meter 12 — goedgekeurd voor publicatie

63 artikelen, op schapvolgorde uit foto 160.jpg. Foto 52 is op verzoek overgeslagen; nummer 155 ontbreekt door de nummering. Nederlandse producttitels staan onder alle afbeeldingen. Originele productnamen blijven doorzoekbaar.

## Gegevens

`build-data.cjs` is de bron; `node meter-12/build-data.cjs` bouwt `products.js` opnieuw. Ingrediënten zijn vertaald van de aangeleverde etiketten. Voor witte chocolade met koffie is op verzoek het oorspronkelijke etiket gebruikt, niet de Nederlandse importsticker.

Orange Noir: ingrediënten gecontroleerd bij [Instacart](https://www.instacart.ca/products/17459788-schmerling-s-finest-swiss-dark-chocolate-orange-noir-3-5-oz): suiker, cacaomassa, cacaoboter, amandelen 8%, sinaasappelaroma en vanilline; minimaal 55% cacao; mogelijke sporen van hazelnoten. De winkelverpakking heeft nog geen aangeleverde achterzijde.

De hechshervermeldingen voor alle Schmerling-, Elite- en Shneider’s-artikelen zijn aangepast volgens de expliciete correcties van de gebruiker. Dit zijn redactionele correcties, geen nieuwe onafhankelijke certificeringscontrole. Bij Shneider’s melkfondue staat geen Parve. Osem vanille, Franse vanille en melkkaramel: Badatz Edah Hachareidis of Jerusalem, bevestigd in de productvermeldingen van SnackFood.Delivery; de afwijkende chocolade-Pesachverpakking behoudt haar eigen vermelding.

## Afbeeldingen en bewerkingsopdrachten

Alle websitebestanden staan in `images/`; bronnen en gekozen bestanden staan per artikel in `image-sources.json`. Originele bestanden zijn behouden. De ingebouwde ImageGen-tool is gebruikt, geen Photoshop of API-CLI.

Gebruikte bewerkingsopdrachten per groep:

- WOW 121/123/125/127: maak de verpakking recht van voren, schoon en scherp op wit, met behoud van de eigen variant, in dezelfde presentatie als de graanbolletjes met melkchocolade.
- Marsepein 134/135: gelijke horizontale presentatie van de eigen verpakking en marsepein; chocoladevariant en naturel op elkaar afgestemd.
- Fondue 144/146: gebruik de aangeleverde winkelverpakking als referentie; verwijder hand en winkelachtergrond, corrigeer perspectief, behoud ontwerp en teksten, wit fond. Bij 144 is de extra bovenste 56%-badge verwijderd; de badge onderaan blijft.
- Elite 98/100/102 en Osem 35: rechte, heldere verpakkingsfoto met behoud van de variant en het oorspronkelijke ontwerp.
- Schmerling 72/74/77/88: rechte en scherpe frontale verpakking. Schmerling 90: scherpere weergave met behoud van ontwerp. Onjuiste gegenereerde Parve-tekst in melkchocoladevarianten is gecorrigeerd/verwijderd.
- Mascarpone: aangeleverde afbeelding behouden; alleen perspectiefcorrectie in de weergave. Big Bite, Classic en Orange Noir gebruiken de aangeleverde afbeeldingen.

`image-fit.js` corrigeert perspectief en lege randen uitsluitend in de weergave. `measure-packshots.py` meet beeldmarges zonder pixels te wijzigen. Het eenmalige script `set-presentations.cjs` niet opnieuw uitvoeren zonder de nieuw gekozen afbeeldingen mee te nemen.

## Controle

63 unieke artikelen en alle 63 afbeeldingsbestanden aanwezig. JavaScript-syntax gecontroleerd. Productdialoog, zoekfunctie en mobiele weergave gecontroleerd in de lokale preview. De gebruiker heeft de volledige meter goedgekeurd en publicatie via main en GitHub Pages expliciet opgedragen.

De QR-code en QR-PDF staan onder `output/qr/` en `output/pdf/`. PDF-formaat 105 × 75 mm, overeenkomstig Meter 10. Zowel de PNG als de gerenderde PDF zijn automatisch teruggelezen en verwijzen naar https://mgil-star.github.io/Kosher-Product-Informatie/meter-12/.
