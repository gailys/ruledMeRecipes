import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const category = process.argv[2] || 'breakfast';
assert(['breakfast','lunch','dinner','dessert','snacks','side-items','condiments'].includes(category));
const root = new URL(`../data/${category}/`, import.meta.url);
const projectRoot=new URL('../',import.meta.url);
const archive = JSON.parse(await fs.readFile(new URL('recipes.json',root),'utf8'));
assert.equal(archive.recipes.length,archive.expected);
assert.equal(archive.failures.length,0);
assert.equal(archive.imageFailures.length,0);
const ids = new Set(), paths = new Set();
for (const recipe of archive.recipes) {
  assert.equal(recipe.category,category);
  assert(!ids.has(recipe.id),`Duplicate ${recipe.id}`); ids.add(recipe.id);
  assert(recipe.ingredients.length && recipe.instructions.length && recipe.title && recipe.url,recipe.slug);
  assert(recipe.instructions.every(step=>step.text),`Empty instruction: ${recipe.slug}`);
  const individual = JSON.parse(await fs.readFile(new URL(`recipes/${recipe.slug}.json`,root),'utf8'));
  assert.deepEqual(recipe,individual);
  await fs.access(new URL(recipe.sourceHtml,root));
  assert(recipe.featuredImage,`Missing cover: ${recipe.slug}`);
  assert(recipe.images.some(image=>image.path === recipe.featuredImage),`Unknown cover: ${recipe.slug}`);
  for (const image of recipe.images) {
    assert(image.path && new URL(image.path,root).href.startsWith(projectRoot.href));
    paths.add(image.path);
  }
}
for (const path of paths) {
  const bytes = await fs.readFile(new URL(path,root));
  const signature = bytes.subarray(0,12).toString('hex');
  assert(signature.startsWith('ffd8ff') || signature.startsWith('89504e470d0a1a0a') || signature.startsWith('47494638') || (bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP') || (bytes.toString('ascii',4,8)==='ftyp' && /avif|avis/.test(bytes.toString('ascii',8,32))),`Invalid image: ${path}`);
}
console.log(`Verified ${category}: ${ids.size} complete recipes and ${paths.size} local images.`);
