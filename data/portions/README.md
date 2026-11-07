# Vienos porcijos receptai

`recipes.json` – atskiras visų kategorijų katalogas, perskaičiuotas vienai bazinei porcijai. Originalūs receptai `data/<kategorija>/recipes/` nepakeisti.

- `servings`: 1, kai porcija nustatyta; `null`, jei šaltinyje jos negalima nustatyti.
- `originalServings`, `originalIngredients`: originalus porcijų skaičius ir ingredientų tekstas.
- `ingredientsPerServing`: tikslūs skaitiniai ingredientų kiekiai vienai porcijai. Jie neapvalinami prieš sumuojant krepšelį.
- `ingredients`: vienos porcijos ingredientų tekstinis atvaizdavimas; skaičiavimams naudojami `ingredientsPerServing` laukai.
- `normalizationStatus`: `one-serving`, `one-serving-component` (naudojamas paruoštas patiekalas) arba `unknown-servings` (reikalingas rankinis patikslinimas).
- `normalizationEvidence`: šaltiniu pagrįstas paaiškinimas, kai originaliame indekse trūko porcijų skaičiaus.

`summary.json` pateikia kiekius ir neišspręstus įrašus. `data/portion-overrides.json` saugomi iš originalių puslapių patikslinti duomenys; spėjami kiekiai nerašomi.

Kiekvienam žmogui skiriama viena bazinė kiekvieno patiekalo porcija. Galutinis ingredientas = kiekis vienai porcijai × žmonių skaičius × (1 + padidinimas / 100). Pvz., 2 žmonės ir +20 % = 2,4 bazinės porcijos.

Procentas taikomas visiems meniu patiekalams, įskaitant desertus. Vieno žmogaus maistingumo rodikliai padauginami tik iš porcijos padidinimo. Gaminimo laikas, temperatūra ir originalios instrukcijos neperskaičiuojamos. Be skaičiaus pateikti ingredientai, pvz., druska pagal skonį, paliekami be skaitinio kiekio. Paruošti komponentai išlieka paruoštais komponentais.

Atnaujinimas: `node scripts/normalize-recipes.mjs`. Programėlės publikavimo procesas automatiškai atnaujina šį katalogą ir paruošia tik keturių pagrindinių kategorijų duomenis.
