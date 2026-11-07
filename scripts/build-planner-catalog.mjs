import fs from 'node:fs/promises';
import { MEALS } from '../planner-state.mjs';
const root = new URL('../data/',import.meta.url);
const recipes = [];
for (const {id} of MEALS) {
  const archive = JSON.parse(await fs.readFile(new URL(`${id}/recipes.json`,root),'utf8'));
  if (archive.saved !== archive.expected || archive.failures.length || archive.imageFailures.length) throw new Error(`Incomplete ${id} archive`);
  for (const recipe of archive.recipes) {
    recipes.push({id:recipe.id,title:recipe.title,category:id,url:recipe.url,image:`./data/${id}/${recipe.featuredImage}`,servings:recipe.servings,totalMinutes:recipe.totalMinutes,nutrition:recipe.nutritionPerServing,ingredients:recipe.ingredients,instructions:recipe.instructions.map(step=>step.text)});
  }
}
await fs.mkdir(new URL('planner/',root),{recursive:true});
await fs.writeFile(new URL('planner/recipes.json',root),JSON.stringify({schemaVersion:1,recipes})+'\n');
console.log(`Built planner catalog: ${recipes.length} recipes, four main categories.`);
