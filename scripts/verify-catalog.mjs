import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../data/',import.meta.url);
const projectRoot=new URL('../',import.meta.url);
const catalog = JSON.parse(await fs.readFile(new URL('recipes.json',root),'utf8'));
const expected = catalog.categories.reduce((total,item)=>total+item.expected,0);
assert.equal(catalog.totalRecipes,expected);
assert.equal(catalog.recipes.length,expected);
const ids = new Set(), urls = new Set();
for (const category of catalog.categories) {
  assert.equal(category.saved,category.expected);
  assert.equal(category.failures.length,0);
  assert.equal(category.imageFailures.length,0);
  assert.equal(catalog.recipes.filter(recipe=>recipe.category===category.category).length,category.expected);
}
let references = 0;
for (const recipe of catalog.recipes) {
  assert(!ids.has(recipe.id),`Duplicate ID: ${recipe.id}`); ids.add(recipe.id);
  assert(!urls.has(recipe.url),`Duplicate URL: ${recipe.url}`); urls.add(recipe.url);
  const paths = [recipe.sourceHtml,recipe.featuredImage,...recipe.images.map(image=>image.path)];
  for (const path of paths) {
    assert(path && new URL(path,root).href.startsWith(projectRoot.href),`Invalid path: ${path}`);
    await fs.access(new URL(path,root)); references++;
  }
}
console.log(`Verified combined catalog: ${ids.size} unique recipes, ${catalog.categories.length} categories, ${references} local file references.`);
