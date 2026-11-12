export const MEALS = Object.freeze([
  { id: 'breakfast', label: 'Pusryčiai', icon: '☀' },
  { id: 'lunch', label: 'Pietūs', icon: '◒' },
  { id: 'dinner', label: 'Vakarienė', icon: '☾' },
  { id: 'dessert', label: 'Desertai', icon: '♡' },
]);

export function dayCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(7, Math.max(1, Math.round(number))) : 1;
}

export function restorePlan(value = {}, catalog) {
  if (!value || typeof value !== 'object') value = {};
  const days = dayCount(value.days ?? 1);
  const chosen = new Set();
  const selected = Object.fromEntries(MEALS.map(({ id }) => [id,
    (Array.isArray(value.selected?.[id]) ? value.selected[id] : []).filter(recipeId => {
      if (catalog.get(recipeId)?.category !== id || chosen.has(recipeId)) return false;
      chosen.add(recipeId); return true;
    }).slice(0, days),
  ]));
  const selectedIds = new Set(Object.values(selected).flat());
  const skipped = [...new Set(Array.isArray(value.skipped) ? value.skipped : [])].filter(id => catalog.has(id) && !selectedIds.has(id));
  const configured = value.configured === true || (value.configured == null && Object.hasOwn(value,'days'));
  const startDate = typeof value.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.startDate) && Number.isFinite(Date.parse(value.startDate)) ? value.startDate : null;
  const requestedStartDate = typeof value.requestedStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.requestedStartDate) && Number.isFinite(Date.parse(value.requestedStartDate)) ? value.requestedStartDate : null;
  const startOffset = Number.isFinite(Number(value.startOffset)) ? Math.min(365,Math.max(0,Math.floor(Number(value.startOffset)))) : 0;
  const previousMenu = value.activeMenu && typeof value.activeMenu === 'object' ? restorePlan({...value.activeMenu,activeMenu:null,scheduledMenus:[]},catalog) : null;
  const activeMenu = previousMenu && isComplete(previousMenu) && previousMenu.startDate ? previousMenu : null;
  const scheduledMenus = activeMenu && Array.isArray(value.scheduledMenus) ? value.scheduledMenus.filter(menu=>menu && typeof menu==='object').map(menu=>restorePlan({...menu,activeMenu:null,scheduledMenus:[]},catalog)).filter(menu=>isComplete(menu) && menu.startDate) : [];
  const activeMeals=Array.isArray(value.activeMeals) && value.activeMeals.length ? MEALS.map(meal=>meal.id).filter(id=>value.activeMeals.includes(id)) : MEALS.map(meal=>meal.id);
  const plan = { activeMeals, id: typeof value.id === 'string' ? value.id : null, days, configured, startDate, requestedStartDate, startOffset, selected, skipped, currentId: value.currentId || null, history: [], activeMenu, scheduledMenus, buildingNext: Boolean(activeMenu && value.buildingNext), cartExported: typeof value.cartExported === 'string' ? value.cartExported : null };
  if (!eligibleRecipes(plan, catalog).some(recipe => recipe.id === plan.currentId)) plan.currentId = null;
  plan.history = (Array.isArray(value.history) ? value.history : []).filter(action =>
    action && catalog.has(action.id) && (action.kind === 'like' ? selected[catalog.get(action.id).category]?.includes(action.id) : action.kind === 'skip' && skipped.includes(action.id)),
  ).slice(-50);
  return plan;
}

export function eligibleRecipes(plan, catalog) {
  const excluded = new Set([...Object.values(plan.selected).flat(), ...plan.skipped]);
  return [...catalog.values()].filter(recipe =>
    (plan.activeMeals || MEALS.map(meal=>meal.id)).includes(recipe.category) && Object.hasOwn(plan.selected, recipe.category) && plan.selected[recipe.category].length < plan.days && !excluded.has(recipe.id),
  );
}

export function chooseNext(plan, catalog, random = Math.random) {
  const eligible = eligibleRecipes(plan, catalog);
  if (eligible.some(recipe => recipe.id === plan.currentId)) return plan;
  return { ...plan, currentId: eligible.length ? eligible[Math.floor(random() * eligible.length)]?.id || eligible[0].id : null };
}

export function decide(plan, catalog, kind) {
  const recipe = catalog.get(plan.currentId);
  if (!['like', 'skip'].includes(kind) || !recipe || !eligibleRecipes(plan, catalog).some(item => item.id === recipe.id)) return plan;
  return {
    ...plan, currentId: null,
    selected: kind === 'like' ? { ...plan.selected, [recipe.category]: [...plan.selected[recipe.category], recipe.id] } : plan.selected,
    skipped: kind === 'skip' ? [...plan.skipped, recipe.id] : plan.skipped,
    history: [...plan.history, { kind, id: recipe.id }].slice(-50),
  };
}

export function undo(plan, catalog) {
  const action = plan.history.at(-1);
  if (!action || !catalog.has(action.id)) return plan;
  const recipe = catalog.get(action.id);
  return {
    ...plan, currentId: action.id, history: plan.history.slice(0, -1),
    selected: action.kind === 'like' ? { ...plan.selected, [recipe.category]: plan.selected[recipe.category].filter(id => id !== action.id) } : plan.selected,
    skipped: action.kind === 'skip' ? plan.skipped.filter(id => id !== action.id) : plan.skipped,
  };
}

export function resizePlan(plan, days, catalog) {
  return restorePlan({ ...plan, days, configured: true, startDate: days === plan.days ? plan.startDate : null, currentId: null, history: [] }, catalog);
}

export function isComplete(plan) {
  return (plan.activeMeals || MEALS.map(meal=>meal.id)).every(id => plan.selected[id].length === plan.days);
}
