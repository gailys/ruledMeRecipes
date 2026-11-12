import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const root=new URL('../',import.meta.url);
const directory=new URL('data/translations/',root);
await fs.mkdir(directory,{recursive:true});
const journal=new URL('lt-records.jsonl',directory);
const output=new URL('recipes.lt.json',directory);
const recipes=JSON.parse(await fs.readFile(new URL('data/portions/recipes.json',root),'utf8')).recipes;
const records=new Map();
try {for(const line of (await fs.readFile(journal,'utf8')).split('\n').filter(Boolean)){const row=JSON.parse(line);records.set(row.id,row);}}catch(error){if(error.code!=='ENOENT')throw error;}
const hash=recipe=>crypto.createHash('sha256').update(JSON.stringify([recipe.title,recipe.instructions])).digest('hex');
const keep=/\b(brownies?|onigiri|sushi|ramen|kimchi|gnocchi|tiramisu|panna cotta|risotto|guacamole|quesadilla|quesadillas|burritos?|tacos?|pesto|focaccia|chorizo|halloumi|mascarpone|sriracha|shirataki|Ruled\.me)\b/gi;
function polish(text) {
  return text.replace(/ketogenin(?:ė|ės|is|iai)\b/gi,'keto').replace(/\bKeto draugiškas\b/gi,'Keto').replace(/grietinėlės sūrio/g,'kreminio sūrio').replace(/grietinėlės sūrį/g,'kreminį sūrį').replace(/grietinėlės sūris/g,'kreminis sūris').replace(/grietinėlės sūriu/g,'kreminiu sūriu').replace(/maltos jautienos/g,'jautienos faršo').replace(/maltą jautieną/g,'jautienos faršą').replace(/malta jautiena/g,'jautienos faršas').replace(/\s+([,.!?:;])/g,'$1').trim();
}
async function translate(recipe) {
  const terms=[];
  const parts=[recipe.title,...recipe.instructions].map(text=>text.replace(keep,term=>{const token=`ZXQTERM${terms.length}QXZ`;terms.push(term);return token;}));
  const source=parts.map((part,index)=>`ZXQSTEP${index}QXZ\n${part}`).join('\n\n');
  const url=new URL('https://translate.googleapis.com/translate_a/single');
  for(const [key,value] of Object.entries({client:'gtx',sl:'en',tl:'lt',dt:'t',q:source}))url.searchParams.set(key,value);
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`Translation service returned ${response.status}`);
  const payload=await response.json();
  let translated=payload[0].map(row=>row[0] || '').join('');
  translated=translated.replace(/ZXQ\s*TERM\s*(\d+)\s*QXZ/gi,(_,index)=>terms[Number(index)] || '');
  const chunks=translated.split(/ZXQ\s*STEP\s*\d+\s*QXZ/gi).slice(1).map(polish);
  if(chunks.length!==parts.length || chunks.some(text=>!text || /ZXQ/i.test(text)))throw new Error(`Translation segment mismatch for ${recipe.id}`);
  return {id:recipe.id,sourceHash:hash(recipe),language:'lt',status:'draft',method:'machine-assisted-with-culinary-glossary',title:chunks[0],instructions:chunks.slice(1)};
}
const pending=recipes.filter(recipe=>records.get(recipe.id)?.sourceHash!==hash(recipe));
const limit=Number(process.env.RECIPE_TRANSLATION_LIMIT || pending.length);
let cursor=0,finished=0,stopped=false;
const failures=[];
async function worker() {
  while(!stopped && cursor<Math.min(limit,pending.length)) {
    const recipe=pending[cursor++];
    try {
      const row=await translate(recipe);
      await fs.appendFile(journal,JSON.stringify(row)+'\n');records.set(row.id,row);finished++;
      if(finished%25===0 || limit<10)console.log(`Translated ${records.size}/${recipes.length}: ${recipe.title}`);
      await new Promise(resolve=>setTimeout(resolve,350));
    }catch(error){failures.push({id:recipe.id,error:error.message});console.error(recipe.id,error.message);if(/429|403/.test(error.message))stopped=true;}
  }
}
const concurrency=Math.max(1,Math.min(6,Number(process.env.RECIPE_TRANSLATION_WORKERS || 3)));
await Promise.all(Array.from({length:concurrency},worker));
const translations=Object.fromEntries(recipes.filter(recipe=>records.get(recipe.id)?.sourceHash===hash(recipe)).map(recipe=>[recipe.id,records.get(recipe.id)]));
await fs.writeFile(output,JSON.stringify({schemaVersion:1,sourceLanguage:'en',language:'lt',defaultLanguage:'en',total:recipes.length,translated:Object.keys(translations).length,recipes:translations},null,2)+'\n');
await fs.writeFile(new URL('lt-pending.json',directory),JSON.stringify({remaining:recipes.filter(recipe=>!translations[recipe.id]).map(recipe=>recipe.id),failures},null,2)+'\n');
console.log(`Saved ${Object.keys(translations).length}/${recipes.length} Lithuanian translations.`);
await import('./edit-recipe-translations.mjs');
