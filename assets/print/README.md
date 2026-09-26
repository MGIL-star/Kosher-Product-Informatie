# Productlabels (57 x 32 mm)

Alle 14 DKW-meters en 3 diepvries-schappen laden product-print.js en product-print.css. Bestaande catalogusrenderers en productdata zijn niet gewijzigd. Kaartknoppen zijn aparte knoppen, geen geneste knoppen. Mobiel staan de iconen onder de foto's; in modals naast de naam.

De gedeelde label.html/label.js/label.css laden de bestaande products.js van de gekozen groep (meter 3 en 4 gebruiken hun bestaande gedeelde databestanden). Een klik opent één productlabel en roept eenmaal window.print() aan. Alleen naam, ingrediënten en allergenen worden weergegeven; sporeninformatie valt onder allergenen. Bron-/redactienotities, foto, barcode, voedingswaarden en hechsher worden niet afgedrukt. Onbekende informatie blijft onbekend; gedeeltelijke ingrediënten heten Bekende ingrediënten.

@page: 57mm 32mm, marge 0; labelbinnenmarge 2mm. Tekst past zich aan beschikbare hoogte en breedte aan, zonder afkappen. Heel lange lijsten worden noodzakelijkerwijs klein.

Selecteer in de gewone browser de DYMO LabelWriter 450, papier 57 x 32 mm, schaal 100%, geen extra printermarges en kop-/voetteksten uit. Browsercode kan de printer en driverinstellingen niet automatisch afdwingen. Mobiel vereist een beschikbare printerverbinding/printservice. Geen DYMO SDK of installatie toegevoegd.

Controle 26 september 2026:
- Meter 11 desktop: kaartknoppen en modalknop, juiste productkoppeling.
- Diepvries schap 1: 16 knoppen; na zoeken op Tilapia 3 producten en 3 knoppen.
- Mobiele 390px iframeweergaven: meter 11 en diepvries 1; foto's vrij van printericonen.
- 20 labels, inclusief langste ingrediëntenlijst uit elk van de 17 groepen, korte lijst, ontbrekende allergenen en Prime Cut-bronnotitie: afmetingen 215.42 x 120.94 CSS pixels (57 x 32 mm), geen overloop, exact naam en twee tekstblokken. Alle controles geslaagd.
- Lange Mini Snap en Vissticks visueel gecontroleerd.
- In-app browser toont label maar geen native printpreview. Native preview, driverinstellingen en fysieke DYMO-afdruk nog op gebruikers-pc te controleren; geen fysieke print geclaimd.
