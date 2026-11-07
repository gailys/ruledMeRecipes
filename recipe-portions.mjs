// One unrounded base portion per recipe; display formatting never changes the stored amounts.
export const peopleCount=value=>Math.min(99,Math.max(1,Math.floor(Number(value) || 1)));
export const portionIncrease=value=>Math.min(500,Math.max(0,Math.floor(Number(value) || 0)));
export const portionMultiplier=(people=1,increase=0)=>peopleCount(people)*(1+portionIncrease(increase)/100);
const fractions={'¼':'1/4','½':'1/2','¾':'3/4','⅐':'1/7','⅑':'1/9','⅒':'1/10','⅓':'1/3','⅔':'2/3','⅕':'1/5','⅖':'2/5','⅗':'3/5','⅘':'4/5','⅙':'1/6','⅚':'5/6','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'};
const amount='(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)';
const leadingAmount=new RegExp(`^(${amount})(?:\\s*(?:–|—|-|to)\\s*(${amount}))?\\s*(.*)$`,'i');
const units=/^(fluid ounces?|fl\.?\s?oz\.?|tablespoons?|tbsp\.?|teaspoons?|tsp\.?|millilit(?:er|re)s?|ml|kilograms?|kg|grams?|g|lit(?:er|re)s?|l|cups?|ounces?|oz\.?|pounds?|lbs?\.?|cloves?|slices?|large|medium|small|cans?|packages?|pinches|pinch|dashes|dash|drops?)(?=\s|$)\s*(.*)$/i;
function numeric(value) {
  const mixed=value.trim().split(/\s+/);
  if(mixed.length===2)return Number(mixed[0])+numeric(mixed[1]);
  if(value.includes('/')){const [a,b]=value.split('/').map(Number);return b>0 ? a/b : NaN;}
  return Number(value);
}
export function parsePortionIngredient(raw) {
  const original=String(raw).trim();
  const text=original.replace(/(\d)([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g,'$1 $2').replace(/[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g,char=>fractions[char]).replace(/(\d),(?=\d{3}(?:\D|$))/g,'$1').replace(/(\d),(\d)/g,'$1.$2').replace(/\s+/g,' ');
  const match=text.match(leadingAmount);
  if(!match || match[3].startsWith('%'))return {quantity:null,unit:'',name:original,quantityRaw:'',original,scalable:false};
  const first=numeric(match[1]),last=match[2] ? numeric(match[2]) : null;
  if(!Number.isFinite(first) || (last!=null && !Number.isFinite(last)))return {quantity:null,unit:'',name:original,quantityRaw:'',original,scalable:false};
  const unitMatch=match[3].match(units);
  const unit=unitMatch?.[1]?.replace(/\.$/,'') || '';
  const name=(unitMatch ? unitMatch[2] : match[3]).replace(/^of\s+/i,'').trim();
  if(!name)return {quantity:null,unit:'',name:original,quantityRaw:'',original,scalable:false};
  return {quantity:last==null ? first : null,...(last==null ? {} : {quantityMin:first,quantityMax:last}),unit,name,quantityRaw:'',original,scalable:true};
}
const plain=value=>Number(value.toPrecision(12)).toString();
export function ingredientText(item) {
  const quantity=Number.isFinite(item.quantity) ? plain(item.quantity) : Number.isFinite(item.quantityMin) ? `${plain(item.quantityMin)}–${plain(item.quantityMax)}` : item.quantityRaw || '';
  return [quantity,item.unit,item.name].filter(Boolean).join(' ');
}
export function normalizeRecipe(recipe) {
  const originalServings=Number(recipe.originalServings ?? recipe.servings);
  const known=Number.isFinite(originalServings) && originalServings>0;
  const originalIngredients=recipe.originalIngredients || recipe.ingredients;
  const ingredientsPerServing=originalIngredients.map(line=>{
    const item=parsePortionIngredient(line);
    if(!known)return {...item,quantity:null,quantityMin:null,quantityMax:null,unit:'',name:item.original,quantityRaw:'',scalable:false,reason:'unknown-servings'};
    const alreadyPerServing=/\bper\s+(?:serving|portion|person|slider)\b/i.test(item.original);
    const divisor=alreadyPerServing ? 1 : originalServings;
    return {...item,...(alreadyPerServing ? {basis:'per-serving-in-source'} : {}),quantity:item.quantity==null ? null : item.quantity/divisor,...(item.quantityMin==null ? {} : {quantityMin:item.quantityMin/divisor,quantityMax:item.quantityMax/divisor})};
  });
  return {servings:known ? 1 : null,originalServings:known ? originalServings : null,originalIngredients,ingredientsPerServing,ingredients:ingredientsPerServing.map(ingredientText),normalizationStatus:known ? 'one-serving' : 'unknown-servings'};
}
export function scaleRecipeIngredients(recipe,people=1,increase=0) {
  const base=Array.isArray(recipe.ingredientsPerServing) ? recipe.ingredientsPerServing : normalizeRecipe(recipe).ingredientsPerServing;
  const factor=portionMultiplier(people,increase);
  return base.map(item=>({...item,quantity:item.quantity==null ? null : item.quantity*factor,...(item.quantityMin==null ? {} : {quantityMin:item.quantityMin*factor,quantityMax:item.quantityMax*factor,quantityRaw:`${plain(item.quantityMin*factor)}–${plain(item.quantityMax*factor)}`})}));
}
