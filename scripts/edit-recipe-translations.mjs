import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const directory=new URL('data/translations/',root);
const data=JSON.parse(await fs.readFile(new URL('recipes.lt.json',directory),'utf8'));
const originals=JSON.parse(await fs.readFile(new URL('data/portions/recipes.json',root),'utf8')).recipes.map(recipe=>({...recipe,title:recipe.translations?.en?.title || recipe.title,instructions:recipe.translations?.en?.instructions || recipe.instructions}));
const overrides=JSON.parse(await fs.readFile(new URL('editorial-overrides.lt.json',directory),'utf8'));
const titleEdits=JSON.parse(await fs.readFile(new URL('title-edits.lt.json',directory),'utf8'));
function culinary(text,source) {
  let result=text
    .replace(/varpinių pipirų/gi,'paprikų').replace(/varpiniai pipirai/gi,'paprikos').replace(/varpinius pipirus/gi,'paprikas')
    .replace(/šokolado traškučių/gi,'šokolado gabaliukų').replace(/šokolado traškučius/gi,'šokolado gabaliukus').replace(/šokolado traškučiai/gi,'šokolado gabaliukai')
    .replace(/šokolado drožles/gi,'šokolado gabaliukus').replace(/šokolado drožlių/gi,'šokolado gabaliukų')
    .replace(/šlapius ingredientus/gi,'skystus ingredientus').replace(/šlapi ingredientai/gi,'skysti ingredientai')
    .replace(/ant vidutinės ir stiprios ugnies/gi,'ant vidutiniškai kaitrios ugnies')
    .replace(/maišytuvo puodelį/gi,'trintuvo indą').replace(/blenderį/gi,'trintuvą').replace(/blenderio/gi,'trintuvo')
    .replace(/Surinkite ir paruoškite visus (?:savo )?ingredientus\./gi,'Pasiruoškite visus ingredientus.')
    .replace(/Mėgaukitės!/g,'Skanaus!').replace(/ir mėgaukitės!/g,'ir skanaus!')
    .replace(/(\d+(?:[.,]\d+)?)\s*°?\s*F\b/g,(_,value)=>`${Math.round((Number(value.replace(',','.'))-32)*5/9)} °C`);
  if(/\bfold\s+in\b/i.test(source))result=result.replace(/Sulenkite\b/g,'Švelniai įmaišykite').replace(/sulenkite\b/g,'švelniai įmaišykite');
  if(/\bcumin\b/i.test(source) && !/\bcaraway\b/i.test(source))result=result.replace(/kmyn/g,'kumin');
  if(/\bturkey\b/i.test(source))result=result.replace(/Turkijos/g,'kalakutienos').replace(/turkijos/g,'kalakutienos').replace(/Turkiją/g,'kalakutieną').replace(/turkiją/g,'kalakutieną').replace(/Turkija/g,'kalakutiena').replace(/turkija/g,'kalakutiena');
  if(/Mrs\.?\s*Dash/i.test(source))result=result.replace(/ponios brūkšnelio/gi,'„Mrs. Dash“ prieskonių mišinio');
  if(/\bwaffle/i.test(source))result=result.replace(/Leiskite virti/gi,'Kepkite');
  result=result
    .replace(/vištienos nugarinę/gi,'mažąją vištienos filė').replace(/vištienos nugarinės/gi,'mažosios vištienos filė')
    .replace(/greitojo puodo/gi,'daugiafunkcio puodo').replace(/greitajame puode/gi,'daugiafunkciame puode').replace(/greitąjį puodą/gi,'daugiafunkcį puodą')
    .replace(/su Sauté nustatymu/gi,'įjungę apkepinimo režimą').replace(/su „Sauté“ nustatymu/gi,'įjungę apkepinimo režimą')
    .replace(/Pro patarimas:/gi,'Patarimas:').replace(/šaukštu patrinkite žuvį/gi,'šaukštu laistykite žuvį')
    .replace(/į sausą –/gi,'į sausų ingredientų mišinį –')
    .replace(/maišykite, kad susijungtumėte/gi,'gerai išmaišykite').replace(/išspauskite gabalėlių perteklių/gi,'ištrinkite gumulėlius')
    .replace(/sudėkite į maišymo dubenį/gi,'sudėkite į dubenį').replace(/maišymo dubenį/gi,'dubenį')
    .replace(/žaliosios pupelės/gi,'šparaginės pupelės').replace(/žaliąsias pupeles/gi,'šparagines pupeles')
    .replace(/picos pluta/gi,'picos padas').replace(/picos plutą/gi,'picos padą').replace(/picos plutos/gi,'picos pado')
    .replace(/aukščiausios kokybės pirmojo spaudimo alyvuogių aliej/gi,'ypač tyrą alyvuogių aliej');
  if(/green onions?|spring onions?|scallions?/i.test(source))result=result.replace(/žaliąjį svogūną/gi,'svogūnų laiškus').replace(/žaliojo svogūno/gi,'svogūnų laiškų').replace(/žaliasis svogūnas/gi,'svogūnų laiškai');
  if(/pulse/i.test(source))result=result.replace(/Pulsuokite/gi,'Smulkinkite trumpais impulsais');
  if(/\bfold\b/i.test(source) && /chocolate|cream|egg whites|berries|dry ingredients|batter/i.test(source) && !/tortilla|wrap|paper/i.test(source))result=result.replace(/Sulenkite/gi,'Švelniai įmaišykite');
  return result;
}
let reviewed=0;
for(const recipe of originals) {
  const entry=data.recipes[recipe.id];if(!entry)continue;
  entry.title=culinary(entry.title,recipe.title);
  entry.instructions=entry.instructions.map((text,index)=>culinary(text,recipe.instructions[index]));
  const override=overrides[recipe.id];
  if(override)Object.assign(entry,override);
  if(titleEdits[recipe.id])entry.title=titleEdits[recipe.id];
  if(override?.instructions){entry.status='reviewed';reviewed++;}
}
data.reviewed=reviewed;data.defaultLanguage='lt';
await fs.writeFile(new URL('recipes.lt.json',directory),JSON.stringify(data,null,2)+'\n');
console.log(`Applied culinary editing to ${data.translated} translations; ${reviewed} fully edited recipes.`);
