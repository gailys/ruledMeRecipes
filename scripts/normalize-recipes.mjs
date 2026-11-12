import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { normalizeRecipe } from '../recipe-portions.mjs';
import { isVeryLowCarb, VERY_LOW_CARB_GRAMS } from '../keto-classification.mjs';
const root=new URL('../data/',import.meta.url);
const overrides=JSON.parse(await fs.readFile(new URL('portion-overrides.json',root),'utf8')).recipes;
let languageData={recipes:{}};
try{languageData=JSON.parse(await fs.readFile(new URL('translations/recipes.lt.json',root),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
export const normalizedRecipes=[];
for(const category of ['breakfast','lunch','dinner','dessert','snacks','side-items','condiments']) {
  const archive=JSON.parse(await fs.readFile(new URL(`${category}/recipes.json`,root),'utf8'));
  for(const recipe of archive.recipes) {
    const override=overrides[recipe.id];
    let portions=normalizeRecipe(override?.originalServings ? {...recipe,servings:override.originalServings} : recipe);
    if(override?.ingredientsForOneServing)portions={...normalizeRecipe({servings:1,ingredients:override.ingredientsForOneServing}),originalServings:null,originalIngredients:recipe.ingredients,normalizationStatus:'one-serving-component',servingDefinition:override.servingDefinition};
    const instructions=recipe.instructions.map(step=>step.text);
    const storedTranslation=languageData.recipes[recipe.id];
    const sourceHash=createHash('sha256').update(JSON.stringify([recipe.title,instructions])).digest('hex');
    const translated=storedTranslation?.sourceHash===sourceHash ? storedTranslation : null;
    const translations={en:{title:recipe.title,instructions},...(translated ? {lt:{title:translated.title,instructions:translated.instructions,status:translated.status}} : {})};
    const veryLowCarb=portions.normalizationStatus!=='unknown-servings' && isVeryLowCarb(recipe.nutritionPerServing);
    normalizedRecipes.push({id:recipe.id,slug:recipe.slug,title:recipe.title,category,url:recipe.url,image:`./data/${category}/${recipe.featuredImage}`,totalMinutes:recipe.totalMinutes,nutrition:recipe.nutritionPerServing,veryLowCarb,instructions,instructionsBasis:'original-recipe',translations,sourceRecord:`${category}/recipes/${recipe.slug}.json`,...portions,...(override ? {normalizationEvidence:override.evidence,normalizationNotes:override.notes || null} : {})});
  }
}
const summary={recipes:normalizedRecipes.length,normalized:normalizedRecipes.filter(recipe=>recipe.normalizationStatus!=='unknown-servings').length,unknownServings:normalizedRecipes.filter(recipe=>recipe.normalizationStatus==='unknown-servings').map(recipe=>({id:recipe.id,title:recipe.title,url:recipe.url})),preparedComponentRecipes:normalizedRecipes.filter(recipe=>recipe.normalizationStatus==='one-serving-component').map(recipe=>({id:recipe.id,title:recipe.title,definition:recipe.servingDefinition})),ingredientsWithoutNumericQuantity:normalizedRecipes.reduce((sum,recipe)=>sum+recipe.ingredientsPerServing.filter(item=>!item.scalable).length,0)};
await fs.mkdir(new URL('portions/',root),{recursive:true});
await fs.writeFile(new URL('portions/keto-classification.json',root),JSON.stringify({field:'veryLowCarb',maxNetCarbsGramsPerServing:VERY_LOW_CARB_GRAMS,plannedMealsPerDay:4,netCarbsBudgetGramsPerDay:20,rule:'App-specific conservative screening rule; not a diagnosis or a guarantee of ketosis. Missing or invalid net carbs or unknown serving yields are false. Runtime also checks the increased portion.',sources:['https://www.albertahealthservices.ca/assets/info/nutrition/if-nfs-ng-restricted-carbohydrate-diet.pdf','https://pubmed.ncbi.nlm.nih.gov/38934469/'],trueCount:normalizedRecipes.filter(recipe=>recipe.veryLowCarb).length,falseCount:normalizedRecipes.filter(recipe=>!recipe.veryLowCarb).length},null,2)+'\n');
await fs.writeFile(new URL('portions/recipes.json',root),JSON.stringify({schemaVersion:1,basis:'one-serving',recipes:normalizedRecipes},null,2)+'\n');
await fs.writeFile(new URL('portions/summary.json',root),JSON.stringify(summary,null,2)+'\n');
console.log(`Normalized ${summary.normalized}/${summary.recipes} recipes to one serving; ${summary.unknownServings.length} recipes have no known yield. Original archives preserved.`);
