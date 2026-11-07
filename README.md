# Mano keto receptai

Installable Lithuanian PWA for saving Ruled.me recipes, scaling servings, and building a translated shopping list.

Data is stored locally in the browser. Recipe pages are read through the public Jina Reader endpoint because GitHub Pages cannot run a server-side importer.

The local Ruled.me recipe archive and scraper instructions are documented in [data/README.md](data/README.md). It includes category JSON, local images, original recipe pages, and a combined dataset for future app development.

## Meniu kūrėjas

„Meniu“ (`#discover`) rodo receptų braukimą, kol visas dienų meniu nesurinktas. Siūlomi tik pusryčiai, pietūs, vakarienė ir desertai, o užpildytos kategorijos iš atrankos pašalinamos. Atrankos metu pasirinkimų skaičius ir pasirinkti patiekalai nerodomi. Pirmą kartą prisijungus prie profilio pasirenkamas 1–7 dienų laikotarpis; vėliau jį galima keisti tik nustatymuose.

Pirmą kartą arba ištrynus pasirinkimus nustatomas dienų skaičius ir gamybos pradžios poslinkis: 0 – šiandien, +1 – rytoj, +2 – poryt (iki +365 dienų). Datos skaičiuojamos Europe/Vilnius laiku. Užbaigus atranką, meniu prasideda pasirinktą dieną; jei ta diena jau praėjo, pradžia perkeliama į užbaigimo dieną. Iki gamybos pradžios rodomas suplanuotas meniu su tikrosiomis datomis. Pagrindinis ekranas tada viršuje rodo kompaktišką šiandienos meniu su visais keturiais patiekalais, o žemiau – visų likusių dienų meniu. Jei kitas meniu jau paruoštas iš anksto, jo dienos taip pat rodomos būsimų dienų sąraše. Kitą dieną rodomas kitos dienos meniu, o pasibaigus laikotarpiui vėl prasideda atranka. Naują meniu taip pat galima pradėti nustatymuose. Kol dabartinis meniu galioja, kitas renkamas atskirai: galima grįžti prie šiandienos patiekalų, o iš anksto baigtas kitas meniu įsigalioja pasibaigus dabartiniam.

Užbaigus meniu, jo ingredientai automatiškai pridedami į aktyvaus profilio pirkinių krepšelį pagal vienos porcijos kiekius, nustatytą žmonių skaičių ir bendrą porcijos padidinimą. Produktų kiekiai sujungiami naudojant esamą pirkinių sąrašo logiką; „Turimi namuose“ pažymėti produktai praleidžiami. Perkėlimo žurnalas (`keto-menu-cart-imports-v1`) apsaugo nuo pakartotinio pridėjimo po perkrovimo ir leidžia papildyti ingredientus pratęsus planą.

Nustatymuose galima įjungti arba išjungti priminimą apie kitą meniu ir pasirinkti likusių dienų ribą (1–7, numatyta 2). Programėlės dialogas rodomas ne dažniau kaip kartą per dieną vienam meniu, skaičiuojant ir šiandieną. Nustatymai ir priminimo rodymo datos saugomi pagal profilį (`keto-menu-preferences-v1`).

Atidarytą receptą galima pridėti prie mėgstamų arba pašalinti iš jų. „Receptai → Mėgstami“ rodo mėgstamus receptus. Naudojami esami profilio prisegimai ir jų sinchronizavimas.

Nustatymų mygtukas „Ištrinti visus pasirinktus receptus“ išvalo aktyvaus profilio dabartinį, kitą ir nebaigtą meniu bei praleidimus. Po patvirtinimo vėl atidaromas laikotarpio ir gamybos pradžios pasirinkimas. Mėgstami receptai ir pirkinių krepšelis neištrinami.

Meniu, laikotarpis ir praleisti receptai saugomi naršyklėje atskirai kiekvienam vartotojo profiliui (`keto-meal-plans-v1`); meniu į serverį dar nesinchronizuojamas. Receptų tekstai lieka originalo kalba. Senasis receptų rinkinys ir pirkinių sąrašas veikia atskirai.

```sh
node --test tests/planner-state.test.mjs
node scripts/build-web.mjs
node scripts/preview.mjs
```

Peržiūra: `http://127.0.0.1:4173/`. Vietinė UI testavimo peržiūra `http://127.0.0.1:4173/__planner-preview#discover` naudoja tik vietinius bandomuosius profilius ir nesijungia prie tikro sinchronizavimo serverio. Šis peržiūros režimas neįtraukiamas į publikavimo rinkinį.

Publikavimui naudojamas `dist/`: programėlė, 1 115 pagrindinių receptų katalogas ir tik jų viršelių nuotraukos. GitHub Pages veiksmas paruošia šį rinkinį automatiškai. Pilnas archyvas lieka `data/`.

## Local preview

Serve the repository with any static web server, for example `npx serve .`.

## Nenaudojamos nuotraukos

Programėlėje nenaudojamos receptų nuotraukos perkeltos į `nenaudojama/`. [JSON aprašas](nenaudojama/nuotraukos.json) susieja kiekvieną failą su receptais, senais ir naujais keliais bei šaltinio adresais. 1 115 naudojamų viršelių palikti `data/`. Pilno archyvo JSON nuorodos atnaujintos. Perkėlimui pakartoti: `node scripts/archive-unused-images.mjs`. Visas `nenaudojama/` aplankas ignoruojamas Git, įskaitant JSON aprašą; failai lieka vietiniame diske ir nepatenka į `dist/`. Perkėlimas tame pačiame projekte bendros užimamos disko vietos nesumažina.

Po visais dienų receptais rodomas mygtukas „Sudaryti tolimesnį meniu“. Jei atranka jau pradėta, jis leidžia ją tęsti. Galima iš anksto surinkti kelis tolesnius laikotarpius: kiekvienas išsaugomas su savo pradžios data, įsigalioja eilės tvarka ir pridedamas prie artimiausių dienų sąrašo. Dabartiniai ir anksčiau sudaryti meniu išlieka.

Prie kiekvieno šiandienos ir būsimų dienų patiekalo yra „Pakeisti“ mygtukas. Atidaroma tos pačios kategorijos receptų atranka; senasis patiekalas lieka vietoje iki naujo pasirinkimo patvirtinimo. Pakeičiamas tik konkretus dienos patiekalas, kiti pasirinkimai ir datos išsaugomi. Siūlomi receptai nesikartoja tame meniu. Naujo recepto ingredientai pridedami į krepšelį; anksčiau įrašyti produktai automatiškai neištrinami.

Braukimo lange „Daugiau nesiūlyti“ išsaugo recepto blokavimą aktyviam profiliui šiame įrenginyje (`keto-blocked-recipes-v1`). Blokuoti receptai nepatenka nei į pagrindinę atranką, nei į patiekalo keitimo pasiūlymus, net ir iš naujo rodant praleistus receptus, išvalius meniu ar pradėjus naują laikotarpį. Jau suplanuoti patiekalai ir mėgstamų sąrašas nekeičiami.

Meniu apačioje „Atnaujinti pirkinių krepšelį“ visiškai pakeičia aktyvaus profilio krepšelį šiandienos ir būsimų dienų ingredientais iš visų baigtų suplanuotų meniu. Pašalinami ir rankiniu būdu pridėti produktai bei senos žymos. Kiekiai sumuojami, „Turimi namuose“ išimtys taikomos. Ankstesnės dienos ir nebaigti meniu neįtraukiami. Perkėlimo žurnalas atnaujinamas, kad perkrovimas nepridėtų produktų dar kartą.

Pakeitus suplanuotą patiekalą, ekrano apačioje rodomas fiksuotas „Atnaujinti pirkinių krepšelį“ mygtukas. Jis lieka matomas slenkant ir kitose programėlės skiltyse, kol krepšelis sėkmingai perrenkamas. Būsena saugoma profiliui (`keto-menu-cart-dirty-v1`) ir išlieka po perkrovimo. Po sėkmingo atnaujinimo plūduriuojantis mygtukas paslepiamas; įprastas meniu apačios mygtukas lieka.

## Žmonių skaičius ir porcijos dydis

Nustatymuose „Kiek žmonių valgys?“ (1–99) ir „Porcijos padidinimas (%)“ (0–500, pvz. +20 %) taikomi visiems suplanuotiems patiekalams ir desertams. Numatyta 1 žmogus ir +0 %. Vienas žmogus gauna vieną bazinę porciją. Kiekis = vienos porcijos ingredientai × žmonių skaičius × (1 + padidinimas / 100). 2 žmonės ir +20 % reiškia 2,4 bazinės porcijos.

Originalūs receptai išsaugoti; [vienos porcijos katalogas](data/portions/README.md) generuojamas atskirai visoms kategorijoms. Programėlės katalogas remiasi tuo pačiu pagrindu, o krepšelio kiekiai sumuojami prieš atvaizdavimo apvalinimą. Druska pagal skonį ir kiti neskaitiniai kiekiai nekeičiami. Instrukcijos lieka originalios, gaminimo laikas ir temperatūra nesumažinami proporcingai porcijoms.

Pakeitus žmonių skaičių ar procentą, plūduriuojantis mygtukas leidžia visiškai perrinkti krepšelį pagal naujus nustatymus. Esamas krepšelis neperrašomas automatiškai. Nustatymai saugomi pagal profilį; senesnių meniu naudotojams parodomas krepšelio atnaujinimo mygtukas. Receptų kortelės rodo tikslinį žmonių skaičių ir padidinimą, atidarytame recepte ingredientai perskaičiuoti, o maistingumas rodomas vienam žmogui su tuo pačiu procentu.
