import fs from 'node:fs/promises';
import vm from 'node:vm';
import { PRODUCT_TRANSLATIONS } from '../product-translations.mjs';

const root=new URL('../',import.meta.url);
const source=await fs.readFile(new URL('app.js',root),'utf8');
// Reuse the app's canonical names so translations do not change pantry identities.
const context={PRODUCT_TRANSLATIONS};
vm.runInNewContext(source.slice(source.indexOf('const translations ='),source.indexOf('// Approximate grams'))+'\n'+source.slice(source.indexOf('function canonicalIngredientName'),source.indexOf('function inferCategory'))+'\nglobalThis.names=translations;globalThis.canonical=canonicalIngredientName;',context);
const archive=JSON.parse(await fs.readFile(new URL('data/portions/recipes.json',root),'utf8'));
const entries=new Map();
for(const recipe of archive.recipes)for(const item of recipe.ingredientsPerServing) {
  const key=context.canonical(item.name);
  const entry=entries.get(key) || {key,english:key,defaultLt:context.names[key] || '',count:0,variants:[]};
  entry.count++;
  if(!entry.variants.includes(item.name))entry.variants.push(item.name);
  entries.set(key,entry);
}
const missing=[...entries.values()].filter(entry=>!entry.defaultLt);
if(missing.length)throw new Error('Missing product translations: '+missing.map(entry=>entry.key).join(', '));
await fs.writeFile(new URL('ingredient-dictionary.json',root),JSON.stringify({recipesAudited:archive.recipes.length,entries:[...entries.values()].sort((a,b)=>a.defaultLt.localeCompare(b.defaultLt,'lt'))},null,2)+'\n');
console.log(`Product dictionary generated: ${entries.size} names across ${archive.recipes.length} recipes.`);
