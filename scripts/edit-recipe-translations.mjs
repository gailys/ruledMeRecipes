import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const directory=new URL('data/translations/',root);
const data=JSON.parse(await fs.readFile(new URL('recipes.lt.json',directory),'utf8'));
const originals=JSON.parse(await fs.readFile(new URL('data/portions/recipes.json',root),'utf8')).recipes;
const overrides=JSON.parse(await fs.readFile(new URL('editorial-overrides.lt.json',directory),'utf8'));
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
  if(/Mrs\.?\s*Dash/i.test(source))result=result.replace(/ponios brūkšnelio/gi,'„Mrs. Dash“ prieskonių mišinio');
  if(/\bwaffle/i.test(source))result=result.replace(/Leiskite virti/gi,'Kepkite');
  return result;
}
let reviewed=0;
for(const recipe of originals) {
  const entry=data.recipes[recipe.id];if(!entry)continue;
  entry.title=culinary(entry.title,recipe.title);
  entry.instructions=entry.instructions.map((text,index)=>culinary(text,recipe.instructions[index]));
  const override=overrides[recipe.id];
  if(override)Object.assign(entry,override);
  if(override?.instructions){entry.status='reviewed';reviewed++;}
}
data.reviewed=reviewed;
await fs.writeFile(new URL('recipes.lt.json',directory),JSON.stringify(data,null,2)+'\n');
console.log(`Applied culinary editing to ${data.translated} translations; ${reviewed} fully edited recipes.`);
