import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './build-planner-catalog.mjs';

const project = await fs.realpath(fileURLToPath(new URL('../',import.meta.url)));
const output = path.resolve(project,'dist');
// Only replace the build directory owned by this script, never an arbitrary folder.
if (path.dirname(output) !== project || path.basename(output) !== 'dist') throw new Error('Invalid build directory');
let exists = false;
try { await fs.access(output); exists = true; } catch(error) { if (error.code !== 'ENOENT') throw error; }
if (exists) {
  try { await fs.access(path.join(output,'.recipe-build')); }
  catch { throw new Error('Existing dist directory is not owned by this build.'); }
  await fs.rm(output,{recursive:true,force:true});
}
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'.recipe-build'),'Mano keto static output\n');
const catalog = JSON.parse(await fs.readFile(path.join(project,'data/planner/recipes.json'),'utf8'));
const library = JSON.parse(await fs.readFile(path.join(project,'data/library/recipes.json'),'utf8'));
const assets = new Set(['index.html','app.js','sync.js','styles.css','meal-planner.js','meal-planner.css','planner-state.mjs','recipe-portions.mjs','sw.js','manifest.webmanifest','ingredient-dictionary.json','icons/icon-192.png','icons/icon-512.png','data/planner/recipes.json',...catalog.recipes.map(recipe=>recipe.image.replace(/^\.\//,''))]);
let bytes=0;
assets.add('data/library/recipes.json');
for(const recipe of library.recipes)assets.add(recipe.image.replace(/^\.\//,''));
for (const asset of assets) {
  const source = path.resolve(project,asset), target = path.resolve(output,asset);
  if (!source.startsWith(project+path.sep) || !target.startsWith(output+path.sep)) throw new Error(`Invalid asset: ${asset}`);
  await fs.mkdir(path.dirname(target),{recursive:true});
  await fs.copyFile(source,target);
  bytes += (await fs.stat(target)).size;
}
console.log(`Static app ready in dist/: ${assets.size} files, ${(bytes/1024/1024).toFixed(1)} MiB. Original recipe archives remain in data/.`);
