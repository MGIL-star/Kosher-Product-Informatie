# Kosher-Product-Informatie

## Nieuwe meters en diepvries-schappen

Maak nieuwe productpagina’s vanuit de gedeelde standaardtemplate:

```sh
node scripts/create-product-page.cjs meter-16 "DKW Meter 16"
node scripts/create-product-page.cjs diepvries-schap-4 "Diepvries Schap 4"
```

De template gebruikt de gedeelde productcatalogus en productmodal en bevat automatisch de DYMO-printknoppen en gedeelde labelopmaak. Vul uitsluitend de nieuwe `products.js` met de productgegevens; er is geen aparte labeldatabase. Voeg de gewenste navigatielink op de startpagina toe. Bestaande pagina’s worden nooit overschreven.

DYMO is een vaste standaard voor alle huidige en toekomstige DKW-meters en diepvries-schappen: Calibri 8 pt, alle tekst per label dezelfde grootte, automatisch kleiner bij lange teksten, één label van 57 × 32 mm met 2 mm marge. Alleen productnaam, ingrediënten en allergenen worden afgedrukt. Printer: LabelWriter 450, papier 30334, Actual size. Zie `assets/print/README.md`.
