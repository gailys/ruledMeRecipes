import fs from 'node:fs/promises';
import path from 'node:path';
import { MEALS } from '../planner-state.mjs';
import { normalizedRecipes } from './normalize-recipes.mjs';
const root = new URL('../data/',import.meta.url);
const recipes = normalizedRecipes.filter(recipe=>MEALS.some(meal=>meal.id===recipe.category));
await fs.mkdir(new URL('planner/',root),{recursive:true});
await fs.writeFile(new URL('planner/recipes.json',root),JSON.stringify({schemaVersion:1,recipes})+'\n');
console.log(`Built planner catalog: ${recipes.length} recipes, four main categories.`);
const library = [];
await fs.mkdir(new URL('library/images/',root),{recursive:true});
for (const recipe of normalizedRecipes) {
  let image=recipe.image;
  if(image.includes('nenaudojama/')) {
    const destination=`data/library/images/${recipe.id}${path.extname(image)}`;
    // These covers are committed assets. The ignored archive is not available in CI.
    try {
      await fs.access(new URL('../'+destination,root));
    } catch(error) {
      if(error.code!=='ENOENT')throw error;
      throw new Error(`Missing committed recipe cover: ${destination}. Add it to the repository; builds do not use the ignored nenaudojama archive.`,{cause:error});
    }
    image='./'+destination;
  }
  library.push({...recipe,image});
}
await fs.writeFile(new URL('library/recipes.json',root),JSON.stringify({schemaVersion:1,recipes:library})+'\n');
await import('./build-ingredient-dictionary.mjs');
