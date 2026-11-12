export const MEAL_IDS=['breakfast','lunch','dinner','dessert'];
const weights={breakfast:.25,lunch:.325,dinner:.325,dessert:.1};
export function normalizeMembers(value,people=1,name='Asmuo') {
  const rows=Array.isArray(value) && value.length ? value : Array.from({length:Math.min(20,Math.max(1,Number(people)||1))},(_,index)=>({id:`person-${index+1}`,name:index ? `Asmuo ${index+1}` : name,calories:2000,meals:MEAL_IDS}));
  return rows.slice(0,20).map((member,index)=>({id:String(member.id || `person-${index+1}`),name:String(member.name || `Asmuo ${index+1}`).slice(0,60),calories:Math.min(10000,Math.max(100,Number(member.calories)||2000)),meals:MEAL_IDS.filter(id=>member.meals?.includes(id))}));
}
export function householdMeals(members){return MEAL_IDS.filter(id=>members.some(member=>member.meals.includes(id)));}
export function mealTargets(member) {
  const mains=member.meals.filter(id=>id!=='dessert');
  const dessert=member.meals.includes('dessert') && mains.length ? .1 : 0;
  const total=mains.reduce((sum,id)=>sum+weights[id],0);
  return Object.fromEntries(member.meals.map(id=>[id,member.calories*(id==='dessert' ? (mains.length ? dessert : 1) : (1-dessert)*weights[id]/total)]));
}
export function balanceDay(recipes,members,{veryLowCarbOnly=false}={}) {
  const people=members.map(member=>{
    const targets=mealTargets(member);
    const meals=member.meals.map(category=>{
      const recipe=recipes[category],base=recipe?.nutrition?.calories,carbs=recipe?.nutrition?.netCarbsGrams;
      const known=Number.isFinite(base) && base>0;
      const factor=known ? targets[category]/base : 0;
      return {category,recipeId:recipe?.id,factor,base:known ? base : null,carbs:Number.isFinite(carbs) ? carbs : null};
    });
    const complete=meals.length>0 && meals.every(meal=>meal.base!=null);
    const calories=meals.reduce((sum,meal)=>sum+(meal.base || 0)*meal.factor,0);
    const netCarbs=meals.every(meal=>meal.carbs!=null) ? meals.reduce((sum,meal)=>sum+meal.carbs*meal.factor,0) : null;
    const carbLimitExceeded=veryLowCarbOnly && meals.some(meal=>meal.carbs!=null && meal.carbs*meal.factor>5+1e-9);
    return {...member,meals,complete,actualCalories:calories,netCarbs,carbLimitExceeded,withinTarget:complete && Math.abs(calories-member.calories)<.5};
  });
  const totals=Object.fromEntries(MEAL_IDS.map(category=>[category,people.reduce((sum,person)=>sum+(person.meals.find(meal=>meal.category===category)?.factor || 0),0)]));
  return {people,totals};
}
export function scaleByFactor(recipe,factor) {
  const multiplier=factor/(recipe.ingredientsPerServing ? 1 : recipe.servings || 1);
  return (recipe.ingredientsPerServing || recipe.ingredients || []).map(item=>({...item,quantity:item.quantity==null ? null : item.quantity*multiplier,...(Number.isFinite(item.quantityMin) ? {quantityMin:item.quantityMin*multiplier,quantityMax:item.quantityMax*multiplier} : {})}));
}
export function servingShares(people) {
  const total=people.reduce((sum,person)=>sum+Math.max(0,person.factor || 0),0);
  if(!total)return people.map(person=>({...person,percent:0}));
  const rows=people.map((person,index)=>{const exact=Math.max(0,person.factor || 0)/total*100;return {...person,index,percent:Math.floor(exact),remainder:exact-Math.floor(exact)};});
  let remaining=100-rows.reduce((sum,row)=>sum+row.percent,0);
  for(const row of [...rows].filter(row=>row.factor>0).sort((a,b)=>b.remainder-a.remainder || a.index-b.index)){if(remaining--<=0)break;row.percent++;}
  return rows;
}
