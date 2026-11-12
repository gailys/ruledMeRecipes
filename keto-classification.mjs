// App rule, not a clinical definition: four meals x 5 g = 20 g net carbs/day.
export const VERY_LOW_CARB_GRAMS=5;
export function isVeryLowCarb(nutrition,increase=0) {
  const carbs=nutrition?.netCarbsGrams;
  return Number.isFinite(carbs) && carbs>=0 && carbs*(1+Math.max(0,Number(increase)||0)/100)<=VERY_LOW_CARB_GRAMS+1e-9;
}
