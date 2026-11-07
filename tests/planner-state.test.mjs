import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { MEALS, dayCount, restorePlan, eligibleRecipes, chooseNext, decide, undo, resizePlan, isComplete } from '../planner-state.mjs';

const { recipes } = JSON.parse(await fs.readFile(new URL('../data/planner/recipes.json',import.meta.url),'utf8'));
const catalog = new Map(recipes.map(recipe=>[recipe.id,recipe]));
const byCategory = category => recipes.filter(recipe=>recipe.category===category);
function likeFrom(plan,category) {
  const recipe = eligibleRecipes(plan,catalog).find(recipe=>recipe.category===category);
  assert(recipe,`No eligible recipe for ${category}`);
  return decide({...plan,currentId:recipe.id},catalog,'like');
}

test('catalog contains all 1,115 main recipes, no sides, snacks or condiments, and local covers',async()=>{
  assert.equal(recipes.length,1115);
  assert.equal(catalog.size,recipes.length);
  for (const recipe of recipes) {
    assert(MEALS.some(meal=>meal.id===recipe.category));
    assert(recipe.ingredients.length && recipe.instructions.length);
    await fs.access(new URL(`../${recipe.image}`,import.meta.url));
  }
});

test('settings clamp and round day counts to the supported range',()=>{
  for (const [input,expected] of [[0,1],[-2,1],[1,1],[3,3],[7,7],[9,7],[2.6,3],['4',4],['invalid',1],[Infinity,1]]) assert.equal(dayCount(input),expected);
});

for (const days of [1,3,7]) {
  test(`${days} day plan removes only full categories and stops exactly at ${days*4} likes`,()=>{
    let plan = restorePlan({days},catalog);
    for (let index=0;index<days;index++) plan=likeFrom(plan,'lunch');
    assert.equal(plan.selected.lunch.length,days);
    assert(!eligibleRecipes(plan,catalog).some(recipe=>recipe.category==='lunch'));
    assert(eligibleRecipes(plan,catalog).some(recipe=>recipe.category==='dessert'));
    assert(!isComplete(plan));
    for (const category of ['dessert','breakfast','dinner']) for(let index=0;index<days;index++) plan=likeFrom(plan,category);
    assert(isComplete(plan));
    assert.equal(Object.values(plan.selected).flat().length,days*4);
    assert.equal(eligibleRecipes(plan,catalog).length,0);
    assert.equal(chooseNext(plan,catalog).currentId,null);
    const before = JSON.stringify(plan);
    assert.equal(JSON.stringify(decide({...plan,currentId:plan.selected.lunch[0]},catalog,'like').selected),JSON.stringify(plan.selected));
    assert.equal(JSON.stringify(plan),before);
  });
}

test('random selection spans individual recipes across all available categories',()=>{
  const plan=restorePlan({},catalog), candidates=eligibleRecipes(plan,catalog);
  for(const category of MEALS) {
    const index=candidates.findIndex(recipe=>recipe.category===category.id);
    assert.equal(chooseNext(plan,catalog,()=> (index+.5)/candidates.length).currentId,candidates[index].id);
  }
});

test('skipping fills no slot and excludes a recipe, undo restores that exact card',()=>{
  const initial=chooseNext(restorePlan({},catalog),catalog,()=>0);
  const skipped=decide(initial,catalog,'skip');
  assert.equal(Object.values(skipped.selected).flat().length,0);
  assert(!eligibleRecipes(skipped,catalog).some(recipe=>recipe.id===initial.currentId));
  const restored=undo(chooseNext(skipped,catalog),catalog);
  assert.equal(restored.currentId,initial.currentId);
  assert(!restored.skipped.includes(initial.currentId));
});

test('undoing the final like reopens its category and prevents duplicate likes',()=>{
  const initial=chooseNext(restorePlan({},catalog),catalog,()=>0);
  const recipe=catalog.get(initial.currentId);
  const liked=decide(initial,catalog,'like');
  assert(!eligibleRecipes(liked,catalog).some(item=>item.category===recipe.category));
  const twice=decide({...liked,currentId:recipe.id},catalog,'like');
  assert.equal(twice.selected[recipe.category].length,1);
  const restored=undo(chooseNext(liked,catalog),catalog);
  assert.equal(restored.currentId,recipe.id);
  assert.equal(restored.selected[recipe.category].length,0);
});

test('increasing and decreasing days preserves valid choices and resets stale undo history',()=>{
  let plan=restorePlan({days:3},catalog);
  for(let index=0;index<3;index++)plan=likeFrom(plan,'lunch');
  const original=plan.selected.lunch;
  plan=resizePlan(plan,1,catalog);
  assert.deepEqual(plan.selected.lunch,original.slice(0,1));
  assert.equal(plan.history.length,0);
  assert(!eligibleRecipes(plan,catalog).some(recipe=>recipe.category==='lunch'));
  plan=resizePlan(plan,7,catalog);
  assert.equal(plan.selected.lunch.length,1);
  assert(eligibleRecipes(plan,catalog).some(recipe=>recipe.category==='lunch'));
});

test('saved state reloads its current card, likes, skips and undo history',()=>{
  let plan=chooseNext(restorePlan({days:3},catalog),catalog,()=>0);
  plan=decide(plan,catalog,'like');
  plan=chooseNext(plan,catalog,()=>0);plan=decide(plan,catalog,'skip');
  plan=chooseNext(plan,catalog,()=>0);
  assert.deepEqual(restorePlan(JSON.parse(JSON.stringify(plan)),catalog),plan);
});

test('malformed or outdated stored selections do not fill or expose unsupported categories',()=>{
  const id=byCategory('lunch')[0].id;
  const plan=restorePlan({days:3,selected:{lunch:[id,id,'missing'],breakfast:[id],snacks:['snack']},skipped:[id,'missing'],currentId:'missing',history:[null,{kind:'like',id:'missing'}]},catalog);
  assert.deepEqual(plan.selected.lunch,[id]);
  assert.deepEqual(plan.selected.breakfast,[]);
  assert(!Object.hasOwn(plan.selected,'snacks'));
  assert.equal(plan.currentId,null);assert.deepEqual(plan.history,[]);
});

test('an exhausted category is incomplete; revisiting skipped recipes keeps existing likes',()=>{
  const small=new Map(MEALS.map(meal=>[meal.id,{id:meal.id,category:meal.id}]));
  let plan=restorePlan({},small);
  for(const meal of MEALS){plan={...plan,currentId:meal.id};plan=decide(plan,small,meal.id==='lunch'?'like':'skip');}
  assert(!isComplete(plan));assert.equal(chooseNext(plan,small).currentId,null);
  const revisit={...plan,skipped:[],history:[]};
  assert.equal(eligibleRecipes(revisit,small).length,3);assert.deepEqual(revisit.selected.lunch,['lunch']);
});
