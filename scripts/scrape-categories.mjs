import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
const requested = process.argv.length === 3 && process.argv[2] === '--catalog-only' ? [] : process.argv.length > 2 ? process.argv.slice(2) : ['lunch','dinner','dessert','snacks','side-items','condiments'];
const allowed = ['breakfast','lunch','dinner','dessert','snacks','side-items','condiments'];
if (requested.some(c=>!allowed.includes(c))) throw new Error('Unknown category');
async function run(script,category) {
  const code = await new Promise((resolve,reject)=>{
    const child = spawn(process.execPath,[fileURLToPath(new URL(script,import.meta.url)),category],{stdio:'inherit'});
    child.on('error',reject); child.on('exit',resolve);
  });
  return code === 0;
}
let failed = false;
for (const category of requested) {
  console.log(`Starting ${category}`);
  if (!await run('./scrape-recipes.mjs',category)) failed = true;
  if (!await run('./verify-recipes.mjs',category)) failed = true;
}
const root = new URL('../data/',import.meta.url);
const assetPath=(category,value)=>value ? path.relative(fileURLToPath(root),fileURLToPath(new URL(value,new URL(`${category}/`,root)))).split(path.sep).join('/') : null;
const summary = {schemaVersion:1,generatedAt:new Date().toISOString(),categories:[],recipes:[]};
for (const category of allowed) {
  let archive;
  try { archive = JSON.parse(await fs.readFile(new URL(`${category}/recipes.json`,root),'utf8')); }
  catch(error) { if (error.code === 'ENOENT') continue; throw error; }
  summary.categories.push({category,expected:archive.expected,saved:archive.saved,imageCount:archive.imageCount,failures:archive.failures,imageFailures:archive.imageFailures,archive:`${category}/recipes.json`});
  for (const recipe of archive.recipes) summary.recipes.push({...recipe,images:recipe.images.map(image=>({...image,path:assetPath(category,image.path)})),featuredImage:assetPath(category,recipe.featuredImage),sourceHtml:assetPath(category,recipe.sourceHtml)});
}
summary.totalRecipes = summary.recipes.length;
await fs.writeFile(new URL('recipes.json',root),JSON.stringify(summary,null,2)+'\n');
await fs.writeFile(new URL('scrape-report.json',root),JSON.stringify({...summary,recipes:undefined},null,2)+'\n');
console.log(`Combined archive: ${summary.totalRecipes} recipes`);
if (!await run('./verify-catalog.mjs','')) failed = true;
if (failed) process.exitCode = 1;
