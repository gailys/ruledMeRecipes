# Receptų kalbos

Originalūs receptai lieka anglų kalba. `recipes.lt.json` saugo atskirus lietuviškus pavadinimus ir gaminimo žingsnius visiems 1331 receptams. Katalogų generavimas įrašo juos į kiekvieno recepto `translations.en` ir `translations.lt`, nekeisdamas pagrindinių `title` ir `instructions` laukų.

Lietuviški tekstai yra automatinio vertimo juodraščiai su kulinarinių terminų taisymais. Tik įrašai su `status: reviewed` turi atskirai redaguotą visą pavadinimą ir instrukcijas; likusiems reikia redakcinės peržiūros. `editorial-overrides.lt.json` saugo rankinius pataisymus. Brownie, onigiri ir kiti saugomi patiekalų vardai neverčiami pažodžiui.

`lt-records.jsonl` yra tęstinis neapdorotų vertimų žurnalas. `lt-pending.json` aprašo trūkstamus ar nepavykusius įrašus. Šaltinio teksto SHA-256 leidžia aptikti pasikeitusį originalą ir nepriskirti jam seno vertimo.

Atnaujinimas:

1. `node scripts/translate-recipes.mjs` – pratęsia vertimą, išsaugo rezultatus ir pritaiko kulinarinius bei rankinius pataisymus. Naudoja viešą Google Translate žiniatinklio prieigą; sustoja gavęs 403 ar 429, jos neapeina.
2. Redaguojant rankiniu būdu, pataisymus įrašyti į `editorial-overrides.lt.json`, tada paleisti `node scripts/edit-recipe-translations.mjs`.
3. `node scripts/build-web.mjs` – įtraukia abi kalbas į programėlės katalogus.

Porcijos keičia ingredientų kiekius pagal vienos porcijos bazę, žmonių / porcijų skaičių ir nustatytą procentinį porcijos padidinimą. Originalaus gaminimo teksto skaičiai nėra automatiškai dauginami: tarp jų yra ir laikas, ir temperatūra.
