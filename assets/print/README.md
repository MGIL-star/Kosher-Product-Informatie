# DYMO productlabels

Werkende printerinstelling door gebruiker bevestigd: DYMO LabelWriter 450, papier 30334 – 2-1/4 in × 1-1/4 in, Actual size. Niet Fit to printable area.

Gedeelde opmaak voor 14 DKW-meters en 3 diepvries-schappen: fysiek 57 × 32 mm, horizontale tekst zonder rotatie, 2 mm binnenmarge. De eerdere 32 × 57 mm-rotatieproef is vervallen.

Calibri, basis 8 pt, automatisch kleiner wanneer nodig, productnaam en kopjes vet; overige ingrediënten- en allergenentekst normaal. Alle onderdelen gebruiken dezelfde lettergrootte. Circa 0,45 mm tussen productnaam, ingrediënten en allergenen; compacte regelafstand. De tekst groeit of krimpt als geheel binnen de beschikbare ruimte (ondergrens 4,5 pt); uitzonderlijk lange lijsten kunnen horizontaal compacter worden gezet. Niets afkappen, geen tweede label.

Alleen bestaande productgegevens gebruiken; korte naam uit shortName waar aanwezig. Ontbrekende of gedeeltelijke gegevens blijven herkenbaar, niets verzonnen. De kaartknoppen en productvensters gebruiken één gedeelde printactie. Automatisch window.print() zodra het label klaarstaat. Geen directe printeraansturing.

Vaste projectstandaard: nieuwe productpagina’s worden gemaakt met scripts/create-product-page.cjs en templates/product-page/index.html. De gedeelde catalogus, modal en printknoppen worden automatisch geladen. De labelrenderer accepteert nieuwe meter- en diepvries-schapnummers zonder wijziging van een vaste lijst.
