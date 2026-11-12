import { isVeryLowCarb } from './keto-classification.mjs?v=88';
import { MEALS, dayCount, restorePlan, chooseNext, decide, undo, resizePlan, isComplete } from './planner-state.mjs?v=88';
import { peopleCount, portionIncrease, portionMultiplier } from './recipe-portions.mjs?v=88';

const KEY = 'keto-meal-plans-v1';
const PREFERENCES_KEY = 'keto-menu-preferences-v1';
const BLOCKED_KEY = 'keto-blocked-recipes-v1';
const CART_DIRTY_KEY = 'keto-menu-cart-dirty-v2';
const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const number = value => Number.isFinite(value) ? new Intl.NumberFormat('lt-LT', {maximumFractionDigits:1}).format(value) : '–';
const durationColor = minutes => !Number.isFinite(minutes) || minutes <= 0 ? '' : minutes <= 15 ? 'duration-green' : minutes <= 30 ? 'duration-yellow' : minutes <= 60 ? 'duration-orange' : 'duration-red';
const todayKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Vilnius',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const value = type => parts.find(part=>part.type===type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};

export function createMealPlanner({ root, settingsSelect, getProfileId, showToast, onMenuComplete, onRebuildCart, formatIngredients, onPortionsChange, isFavorite, toggleFavorite, onOpenRecipe, isRecipeBlocked, onRecipeReplaced }) {
  let returningFromDetails=false;
  let catalog, loading, error = '', profile, plan, active = false, busy = false, generation = 0, drag = null;
  let persistenceError = false;
  let cartError='';
  let cartErrorMenuId=null;
  let replacement=null;
  let cartDirtyMemory={};
  const floatingCart=document.createElement('div');
  floatingCart.className='floating-cart-update';floatingCart.hidden=true;
  floatingCart.setAttribute('role','region');floatingCart.setAttribute('aria-label','Pirkinių krepšelio atnaujinimas');
  floatingCart.innerHTML='<button type="button" class="primary dark" title="Išvalo krepšelį ir sudeda ingredientus pagal suplanuotą meniu"><span aria-hidden="true">↻</span> Atnaujinti pirkinių krepšelį</button>';
  document.body.append(floatingCart);
  function cartNeedsUpdate() {
    if(Object.hasOwn(cartDirtyMemory,profileKey()))return cartDirtyMemory[profileKey()];
    try{return JSON.parse(localStorage.getItem(CART_DIRTY_KEY) || '{}')?.[profileKey()]===true;}catch{return false;}
  }
  function syncFloatingCart() {
    const visible=Boolean(getProfileId() && cartNeedsUpdate());
    floatingCart.hidden=!visible;document.body.classList.toggle('has-cart-update',visible);
  }
  function setCartDirty(value) {
    cartDirtyMemory[profileKey()]=value;
    let values;try{values=JSON.parse(localStorage.getItem(CART_DIRTY_KEY) || '{}');}catch{values={};}
    if(!values || typeof values!=='object' || Array.isArray(values))values={};
    values[profileKey()]=value;
    try{localStorage.setItem(CART_DIRTY_KEY,JSON.stringify(values));}catch{showToast('Krepšelio atnaujinimo būsena išsaugota tik iki puslapio perkrovimo.');}
    syncFloatingCart();
  }
  floatingCart.querySelector('button').addEventListener('click',async()=>{
    const owner=profileKey();await loadCatalog();
    if(!catalog || owner!==profileKey()){showToast('Nepavyko įkelti meniu. Pabandykite dar kartą.');return;}
    profile=null;loadProfile();rebuildShoppingCart();
  });
  window.addEventListener('storage',event=>{if(event.key===CART_DIRTY_KEY){cartDirtyMemory={};syncFloatingCart();}});
  function blockedRecipes() {
    try {
      const ids=JSON.parse(localStorage.getItem(BLOCKED_KEY) || '{}')?.[profileKey()];
      return new Set(Array.isArray(ids) ? ids : []);
    }catch{return new Set();}
  }
  function suggestionCatalog() {
    const blocked=blockedRecipes();
    return new Map([...catalog].filter(([id,recipe])=>!blocked.has(id) && matchesRecipeFilters(recipe)));
  }
  function matchesRecipeFilters(recipe) {
    if(isRecipeBlocked?.(recipe))return false;
    const settings=preferences();
    if(settings.maxMinutes && (!Number.isFinite(recipe.totalMinutes) || recipe.totalMinutes<=0 || recipe.totalMinutes>settings.maxMinutes))return false;
    if(settings.veryLowCarbOnly && (recipe.veryLowCarb!==true || !isVeryLowCarb(recipe.nutrition,settings.increase)))return false;
    return true;
  }
  function findMenu(id) {
    return [plan,plan?.activeMenu,...(plan?.scheduledMenus || [])].find(menu=>menu?.id===id);
  }
  function replacementCandidates() {
    const menu=findMenu(replacement?.menuId);
    if(!menu)return [];
    const excluded=new Set([...Object.values(menu.selected).flat(),...replacement.skipped,...blockedRecipes()]);
    return [...catalog.values()].filter(recipe=>recipe.category===replacement.category && !excluded.has(recipe.id) && matchesRecipeFilters(recipe));
  }
  function beginReplacement(button) {
    const menu=findMenu(button.dataset.menuId),category=button.dataset.category,day=Number(button.dataset.day);
    if(!menu || !Number.isInteger(day) || menu.selected[category]?.[day]!==button.dataset.id)return;
    replacement={menuId:menu.id,category,day,date:button.dataset.date,originalId:button.dataset.id,currentId:null,skipped:[]};
    generation++;render();root.querySelector('.swipe-card')?.focus({preventScroll:true});
    root.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function blockRecipe(id) {
    if(!catalog.has(id) || profile!==profileKey() || id!==(replacement ? replacement.currentId : plan.currentId))return;
    let blocked;try{blocked=JSON.parse(localStorage.getItem(BLOCKED_KEY) || '{}') || {};}catch{blocked={};}
    if(typeof blocked!=='object' || Array.isArray(blocked))blocked={};
    blocked[profile]=[...new Set([...blockedRecipes(),id])];
    try{localStorage.setItem(BLOCKED_KEY,JSON.stringify(blocked));}
    catch{showToast('Nepavyko išsaugoti blokavimo. Receptas neužblokuotas.');return;}
    if(replacement){replacement.skipped=replacement.skipped.filter(value=>value!==id);replacement.currentId=null;}
    else {plan={...plan,currentId:null,history:plan.history.filter(action=>action.id!==id)};save();}
    showToast('Receptas užblokuotas. Šiam profiliui jo daugiau nesiūlysime.');render();root.querySelector('.swipe-card')?.focus({preventScroll:true});
  }
  const reminder=document.querySelector('#menu-reminder-dialog');
  const reminderEnabled=document.querySelector('#menu-reminder-enabled');
  const reminderDays=document.querySelector('#menu-reminder-days');
  const peopleInput=document.querySelector('#plan-people');
  const increaseInput=document.querySelector('#plan-portion-increase');
  const maxMinutesInput=document.querySelector('#plan-max-minutes');
  const veryLowCarbInput=document.querySelector('#plan-very-low-carb');
  let reminderOwner;
  function preferences() {
    let all={};try{all=JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}') || {};}catch{}
    const value=all[profileKey()] || {};
    return {people:peopleCount(value.people),increase:portionIncrease(value.increase),maxMinutes:[15,20,30,45,60,90].includes(Number(value.maxMinutes)) ? Number(value.maxMinutes) : 0,veryLowCarbOnly:typeof value.veryLowCarbOnly==='boolean' ? value.veryLowCarbOnly : Number(value.maxCarbs)>0,portionsVersion:value.portionsVersion || 0,reminderEnabled:value.reminderEnabled!==false,reminderDays:dayCount(value.reminderDays ?? 2),reminded:value.reminded && typeof value.reminded==='object' ? value.reminded : {}};
  }
  for(const control of [maxMinutesInput,veryLowCarbInput])control.addEventListener('change',()=>{
    savePreferences({...preferences(),maxMinutes:Number(maxMinutesInput.value),veryLowCarbOnly:veryLowCarbInput.checked});
    generation++;busy=false;drag=null;
    if(plan){plan={...plan,currentId:null};save();}
    if(replacement)replacement.currentId=null;
    render();
  });
  function savePreferences(value) {
    let all={};try{all=JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}') || {};}catch{}
    all[profileKey()]=value;
    try{localStorage.setItem(PREFERENCES_KEY,JSON.stringify(all));}catch{showToast('Nepavyko išsaugoti programėlės nustatymų.');}
  }
  function portionLabel() {
    const settings=preferences();return `${settings.people} asm.${settings.increase ? ` · +${settings.increase} %` : ''}`;
  }
  function menuCartSignature(menu) {
    const settings=preferences();return `portions-v1:${settings.people}:${settings.increase}|${MEALS.flatMap(meal=>menu.selected[meal.id]).join('|')}`;
  }
  function portionNutrition(recipe,key) {
    const value=recipe.nutrition?.[key];return Number.isFinite(value) ? value*(1+preferences().increase/100) : null;
  }
  for(const control of [peopleInput,increaseInput])control.addEventListener('change',()=>{
    if(!peopleInput.checkValidity() || !increaseInput.checkValidity()){control.reportValidity();return;}
    const before=preferences();
    const people=peopleCount(peopleInput.value),increase=portionIncrease(increaseInput.value);
    savePreferences({...before,people,increase,portionsVersion:1});
    if(before.people!==people || before.increase!==increase){
      if(plan && [plan,plan.activeMenu,...plan.scheduledMenus].some(menu=>menu && isComplete(menu)))setCartDirty(true);
      onPortionsChange();
    }
    syncSettings();render();
  });
  for(const control of [reminderEnabled,reminderDays])control.addEventListener('change',()=>{
    savePreferences({...preferences(),reminderEnabled:reminderEnabled.checked,reminderDays:dayCount(reminderDays.value),reminded:{}});
    syncSettings();
  });
  reminder.addEventListener('click',event=>{
    const button=event.target.closest('[data-menu-reminder]');if(!button)return;
    const owner=reminderOwner;reminder.close();
    if(button.dataset.menuReminder==='start' && owner===profileKey())void startNextMenu();
  });
  function offerReminder(menu,day) {
    const settings=preferences(),remaining=menu.days-day,today=todayKey();
    if(menu.startDate>today)return;
    if(!settings.reminderEnabled || remaining>settings.reminderDays || remaining<1 || plan.scheduledMenus.length || (plan.activeMenu && isComplete(plan)) || settings.reminded[menu.id]===today || document.querySelector('dialog[open]'))return;
    reminderOwner=profileKey();
    document.querySelector('#menu-reminder-message').textContent=`Dabartiniame meniu liko ${remaining} ${remaining===1 ? 'diena' : 'dienos'}. Pasiruošk kitam laikotarpiui.`;
    savePreferences({...settings,reminded:{...settings.reminded,[menu.id]:today}});
    reminder.showModal();
  }
  const onboarding = document.querySelector('#planner-onboarding-dialog');
  const startOffsetInput=document.querySelector('#first-plan-start-offset');
  function startDatePreview() {
    const offset=Number(startOffsetInput.value);
    const preview=document.querySelector('#first-plan-start-date');
    if(!Number.isInteger(offset) || offset<0 || offset>365){preview.textContent='Įvesk dienų skaičių nuo 0 iki 365.';return;}
    const date=new Date(Date.parse(todayKey())+offset*86400000).toISOString().slice(0,10);
    const label=new Intl.DateTimeFormat('lt-LT',{timeZone:'Europe/Vilnius',dateStyle:'full'}).format(new Date(`${date}T12:00:00Z`));
    preview.textContent=`${offset===0 ? 'Šiandien' : offset===1 ? '+1 – rytoj' : offset===2 ? '+2 – poryt' : `+${offset} dienos`}: ${label}`;
  }
  startOffsetInput.addEventListener('input',startDatePreview);
  let onboardingOwner;
  function offerOnboarding() {
    if (!getProfileId() || plan?.configured || document.querySelector('dialog[open]')) return;
    onboardingOwner=profileKey();
    document.querySelector('#first-plan-days').value=String(plan.days);
    startOffsetInput.value=String(plan.startOffset || 1);startDatePreview();
    onboarding.showModal();
  }
  onboarding.addEventListener('cancel',event=>event.preventDefault());
  document.querySelector('#planner-onboarding-form').addEventListener('submit',event=>{
    event.preventDefault();
    if (!catalog || onboardingOwner!==profileKey()) {onboarding.close();return;}
    if(!startOffsetInput.checkValidity())return;
    const offset=Number(startOffsetInput.value);
    plan=resizePlan(plan,dayCount(document.querySelector('#first-plan-days').value),catalog);
    plan={...plan,startOffset:offset,requestedStartDate:new Date(Date.parse(todayKey())+offset*86400000).toISOString().slice(0,10),startDate:null};
    save(); onboarding.close(); syncSettings(); render();
  });
  for(const id of ['login-dialog','users-dialog']) document.querySelector(`#${id}`).addEventListener('close',async()=>{
    if(!getProfileId())return;
    await loadCatalog();
    if(!catalog)return;
    loadProfile(); offerOnboarding(); render();
  });
  const confirmation = document.querySelector('#planner-confirm-dialog');
  let pendingConfirmation;
  confirmation.addEventListener('click',event=>{
    const choice=event.target.closest('[data-plan-confirm]');
    if(choice) confirmation.close(choice.dataset.planConfirm);
  });
  confirmation.addEventListener('close',()=>{
    pendingConfirmation?.(confirmation.returnValue==='confirm'); pendingConfirmation=null;
  });
  function confirmChange(message,label='Taip, pakeisti',title='Pakeisti meniu?') {
    confirmation.querySelector('.planner-confirm-message').textContent=message;
    confirmation.querySelector('[data-plan-confirm="confirm"]').textContent=label;
    document.querySelector('#planner-confirm-title').textContent=title;
    confirmation.returnValue=''; confirmation.showModal();
    return new Promise(resolve=>{pendingConfirmation=resolve;});
  }
  const read = () => { try { const value = JSON.parse(localStorage.getItem(KEY) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } };
  const profileKey = () => getProfileId() || 'local';
  function save() {
    if(!plan.id)plan={...plan,id:crypto.randomUUID()};
    try { const plans = read(); plans[profile] = plan; localStorage.setItem(KEY,JSON.stringify(plans)); persistenceError = false; }
    catch { persistenceError = true; showToast('Nepavyko išsaugoti meniu šiame įrenginyje. Patikrinkite naršyklės saugyklą.'); }
  }
  function loadProfile() {
    const next = profileKey();
    if (next === profile && plan) return;
    generation++; busy = false; drag = null; profile = next;
    replacement=null;
    cartError='';if(reminder.open)reminder.close();
    if(onboarding.open)onboarding.close();
    root.querySelector('dialog')?.close();
    plan = restorePlan(read()[profile],catalog);
    const portionSettings=preferences();
    if(portionSettings.portionsVersion!==1) {
      savePreferences({...portionSettings,portionsVersion:1});
      
      onPortionsChange();
    }
    let missingIds=false;
    for(const menu of [plan,plan.activeMenu,...plan.scheduledMenus])if(menu && !menu.id){menu.id=crypto.randomUUID();missingIds=true;}
    if(missingIds)save();
    if(plan.activeMenu)plan={...plan,buildingNext:false};
  }
  async function loadCatalog() {
    if (catalog || loading) return loading;
    error = '';
    loading = (async()=>{
      const response = await fetch('./data/planner/recipes.json');
      if (!response.ok) throw new Error('catalog');
      const data = await response.json();
      if (data.schemaVersion !== 1 || !Array.isArray(data.recipes) || !data.recipes.length) throw new Error('catalog');
      const valid = data.recipes.filter(recipe=> MEALS.some(meal=>meal.id===recipe.category) && recipe.id && recipe.title && Array.isArray(recipe.ingredients) && Array.isArray(recipe.instructions));
      if (!MEALS.every(meal=>valid.some(recipe=>recipe.category===meal.id))) throw new Error('catalog');
      catalog = new Map(valid.map(recipe=>[recipe.id,recipe]));
    })().catch(()=>{error='Nepavyko įkelti receptų. Patikrinkite ryšį ir bandykite dar kartą.';}).finally(()=>{ loading = null; if (active) render(); });
    return loading;
  }
  function syncSettings() {
    const value = catalog && profile === profileKey() && plan ? plan.days : dayCount(read()[profileKey()]?.days ?? 1);
    settingsSelect.value = String(value);
    const settings=preferences();
    peopleInput.value=String(settings.people);increaseInput.value=String(settings.increase);
    maxMinutesInput.value=String(settings.maxMinutes);veryLowCarbInput.checked=settings.veryLowCarbOnly;
    document.querySelector('#plan-portions-summary').textContent=`Kiekvienam patiekalui: ${settings.people} asm. × ${number(1+settings.increase/100)} = ${number(portionMultiplier(settings.people,settings.increase))} bazinės porcijos.`;
    reminderEnabled.checked=settings.reminderEnabled;reminderDays.value=String(settings.reminderDays);reminderDays.disabled=!settings.reminderEnabled;
  }
  function exportMenuIngredients(menu=plan) {
    if(document.querySelector('#login-dialog[open], #users-dialog[open]'))return;
    const signature=menuCartSignature(menu);
    if(menu.cartExported===signature)return;
    if(!menu.id){menu.id=crypto.randomUUID();save();}
    try {
      const settings=preferences();
      onMenuComplete(MEALS.flatMap(meal=>menu.selected[meal.id].map(id=>catalog.get(id))),{menuId:menu.id,profileId:profile,people:settings.people,increase:settings.increase});
      menu.cartExported=signature;cartError='';cartErrorMenuId=null;save();
    }catch{cartErrorMenuId=menu.id;cartError='Nepavyko pridėti meniu ingredientų į pirkinių krepšelį. Pabandykite dar kartą.';}
  }
  async function startNextMenu() {
    const owner=profileKey();await loadCatalog();
    if(!catalog || owner!==profileKey())return;
    loadProfile();
    if(plan.activeMenu) {
      if(isComplete(plan)) {
        const last=plan.scheduledMenus.at(-1) || plan.activeMenu;
        const nextDate=new Date(Date.parse(last.startDate)+last.days*86400000).toISOString().slice(0,10);
        const completed={...plan,activeMenu:null,scheduledMenus:[],buildingNext:false,startDate:plan.requestedStartDate>nextDate ? plan.requestedStartDate : nextDate};
        plan={...restorePlan({days:plan.days,configured:true},catalog),activeMenu:plan.activeMenu,scheduledMenus:[...plan.scheduledMenus,completed],buildingNext:true};
      }else plan={...plan,buildingNext:true};
    }else if(isComplete(plan) && plan.startDate) {
      const current={...plan,activeMenu:null,scheduledMenus:[],buildingNext:false};
      plan={...restorePlan({days:plan.days,configured:true},catalog),activeMenu:current,buildingNext:true};
    }else {
      if(!await confirmChange('Rinktis naują meniu? Dabartiniai nebaigti pasirinkimai bus išvalyti.') || owner!==profileKey())return;
      plan=restorePlan({days:plan.days,configured:true},catalog);
    }
    generation++;busy=false;drag=null;save();
    document.querySelector('#settings-dialog').close();render();
  }
  function dailyRecipeCards(menu,day,date) {
    const cards=MEALS.map(meal=>{
      const recipe=catalog.get(menu.selected[meal.id][day]);
      return `<div class="daily-recipe-row"><button class="daily-recipe" data-planner="details" data-id="${html(recipe.id)}"><img src="${html(recipe.image)}" alt="" loading="lazy"><span class="daily-recipe-copy"><small>${meal.label}</small><strong>${html(recipe.title)}</strong>${isRecipeBlocked?.(recipe) ? '<small class="blocked-menu-note">Užblokuotas produktas – pakeiskite receptą</small>' : ''}<span>${recipe.totalMinutes ? `${number(recipe.totalMinutes)} min · ` : ''}${html(portionLabel())}</span></span><span class="daily-recipe-arrow" aria-hidden="true">›</span></button><button class="daily-replace" data-planner="replace" data-id="${html(recipe.id)}" data-menu-id="${html(menu.id)}" data-category="${meal.id}" data-day="${day}" data-date="${date}" aria-label="Pakeisti receptą: ${html(recipe.title)}"><span aria-hidden="true">↻</span><span>Pakeisti</span></button></div>`;
    }).join('');
    const calories=MEALS.map(meal=>portionNutrition(catalog.get(menu.selected[meal.id][day]) || {},'calories'));
    const known=calories.filter(value=>Number.isFinite(value) && value>=0);
    const total=new Intl.NumberFormat('lt-LT',{maximumFractionDigits:0}).format(known.reduce((sum,value)=>sum+value,0));
    const increase=preferences().increase;
    return `${cards}<div class="day-calorie-summary"><span>${known.length===MEALS.length ? 'Dienos kalorijos vienam žmogui' : 'Žinomų patiekalų kalorijos vienam žmogui'}</span><strong>${known.length ? `${total} kcal` : 'Duomenų nėra'}</strong><small>1 porcija kiekvieno patiekalo${increase ? ` · porcijos padidintos ${number(increase)} %` : ''}${known.length<MEALS.length ? ` · ${MEALS.length-known.length} patiekalų kalorijų duomenų trūksta` : ''}</small></div>`;
  }
  function rebuildShoppingCart() {
    if(profile!==profileKey())return;
    const today=todayKey();
    const menus=plan.activeMenu ? [plan.activeMenu,...plan.scheduledMenus,...(isComplete(plan) ? [plan] : [])] : (isComplete(plan) ? [plan] : []);
    if(!menus.length){showToast('Pirmiausia sudarykite meniu. Dabartinis krepšelis paliktas.');return;}
    const batches=[];let cursor=null;
    for(const menu of menus) {
      const start=menu.startDate || (menu.requestedStartDate>cursor && menu.requestedStartDate>today ? menu.requestedStartDate : cursor || today);
      const first=Math.max(0,Math.floor((Date.parse(today)-Date.parse(start))/86400000));
      const recipes=[];
      for(let day=first;day<menu.days;day++)for(const meal of MEALS)recipes.push(catalog.get(menu.selected[meal.id][day]));
      batches.push({menuId:menu.id,recipeIds:MEALS.flatMap(meal=>menu.selected[meal.id]),recipes});
      cursor=new Date(Date.parse(start)+menu.days*86400000).toISOString().slice(0,10);
    }
    try {
      const settings=preferences();onRebuildCart(batches,{profileId:profile,people:settings.people,increase:settings.increase});
      for(const menu of menus)menu.cartExported=menuCartSignature(menu);
      cartError='';cartErrorMenuId=null;setCartDirty(false);save();render();
    }catch{showToast('Nepavyko atnaujinti krepšelio. Pabandykite dar kartą.');}
  }
  function renderToday(day,date,menu=plan) {
    document.body.classList.remove('is-swiping');
    exportMenuIngredients(menu);
    const formatDate=value=>new Intl.DateTimeFormat('lt-LT',{timeZone:'Europe/Vilnius',dateStyle:'full'}).format(new Date(`${value}T12:00:00Z`));
    const waiting=date<menu.startDate;
    const future=[];
    for(let index=Math.max(0,day+1);index<menu.days;index++)future.push({menu,day:index,date:new Date(Date.parse(menu.startDate)+index*86400000).toISOString().slice(0,10)});
    if(plan.activeMenu && menu===plan.activeMenu)for(const scheduled of plan.scheduledMenus) {
      for(let index=0;index<scheduled.days;index++)future.push({menu:scheduled,day:index,date:new Date(Date.parse(scheduled.startDate)+index*86400000).toISOString().slice(0,10)});
    }
    if(plan.activeMenu && menu===plan.activeMenu && isComplete(plan)) {
      const last=plan.scheduledMenus.at(-1) || menu;
      const nextDate=new Date(Date.parse(last.startDate)+last.days*86400000).toISOString().slice(0,10);
      const start=Date.parse(plan.requestedStartDate>nextDate ? plan.requestedStartDate : nextDate);
      for(let index=0;index<plan.days;index++)future.push({menu:plan,day:index,date:new Date(start+index*86400000).toISOString().slice(0,10)});
    }
    root.innerHTML=`<header class="planner-heading daily-heading"><div><p class="eyebrow"><time datetime="${date}">${html(formatDate(date))}</time></p><h1>${waiting ? 'Meniu paruoštas' : 'Šiandienos meniu'}<span>.</span></h1>${waiting ? `<p class="menu-start-note">Gamyba prasidės <time datetime="${menu.startDate}">${html(formatDate(menu.startDate))}</time>.</p>` : ''}</div></header>
      ${!waiting ? `<section class="daily-recipes" aria-label="Šiandienos patiekalai">${dailyRecipeCards(menu,day,date)}</section>` : ''}
      ${future.length ? `<section class="remaining-menu" aria-labelledby="remaining-menu-title"><h2 id="remaining-menu-title">${waiting ? 'Suplanuotas meniu' : 'Artimiausių dienų meniu'}</h2><div class="remaining-days">${future.map(item=>`<section class="remaining-day"><h3><time datetime="${item.date}">${html(formatDate(item.date))}</time></h3><div class="remaining-day-recipes">${dailyRecipeCards(item.menu,item.day,item.date)}</div></section>`).join('')}</div></section>` : ''}
      ${cartNeedsUpdate() ? '<div class="cart-rebuild"><button class="primary dark" data-planner="rebuild-cart">↻ Atnaujinti pirkinių krepšelį</button><p>Išvalo visą krepšelį ir sudeda šiandienos bei būsimų dienų meniu ingredientus.</p></div>' : ''}
      <footer class="extend-menu"><button class="primary dark" data-planner="start-next">${plan.activeMenu && !isComplete(plan) ? 'Tęsti tolimesnio meniu rinkimą' : 'Sudaryti tolimesnį meniu'} <span aria-hidden="true">→</span></button></footer>
      ${cartError ? `<p class="status error" role="alert">${html(cartError)} <button class="text-button" data-planner="retry-cart">Bandyti dar kartą</button></p>` : ''}
      ${persistenceError ? '<p class="status error" role="alert">Meniu pakeitimai dar neišsaugoti šiame įrenginyje.</p>' : ''}<dialog class="planner-detail-dialog" aria-labelledby="planner-detail-title"></dialog>`;
    offerReminder(menu,day);
  }
  function render() {
    if (!active) return;
    if (!catalog) {
      document.body.classList.remove('is-swiping');
      root.innerHTML = `<div class="planner-loading" role="status"><p class="eyebrow">Meniu kūrėjas</p><h1>${error ? 'Pabandykime dar kartą' : 'Ruošiame receptus…'}</h1><p>${error || 'Jūsų būsimi pusryčiai, pietūs, vakarienės ir desertai jau pakeliui.'}</p>${error ? '<button class="primary dark" data-planner="retry">Bandyti dar kartą</button>' : '<span class="planner-spinner" aria-hidden="true"></span>'}</div>`;
      if (!error) void loadCatalog();
      return;
    }
    loadProfile();
    if (busy || drag || root.querySelector('dialog[open]')) return;
    document.body.classList.remove('is-swiping');
    if(replacement){renderDiscovery(true);return;}
    syncSettings();
    if (!plan.configured) {
      root.innerHTML = '<div class="planner-loading"><p class="eyebrow">Meniu kūrėjas</p><h1>Paruoškime tavo meniu.</h1><p>Pasirink laikotarpį ir pradėk atrasti receptus.</p></div>';
      offerOnboarding();
      return;
    }
    const today = todayKey();
    while(plan.activeMenu) {
      const current=plan.activeMenu;
      const day=Math.floor((Date.parse(today)-Date.parse(current.startDate))/86400000);
      if(day>=current.days) {
        if(plan.scheduledMenus.length) {
          plan={...plan,activeMenu:plan.scheduledMenus[0],scheduledMenus:plan.scheduledMenus.slice(1)};save();continue;
        }
        const nextStart=new Date(Date.parse(current.startDate)+current.days*86400000).toISOString().slice(0,10);
        plan={...plan,activeMenu:null,buildingNext:false,startDate:isComplete(plan) ? (plan.requestedStartDate>nextStart ? plan.requestedStartDate : nextStart) : null};save();
        break;
      }else {
        if(isComplete(plan)) {
          exportMenuIngredients();
          if(plan.buildingNext){plan={...plan,buildingNext:false};save();}
        }
        if(!plan.buildingNext || isComplete(plan)){renderToday(day,today,current);return;}
        break;
      }
    }
    if (isComplete(plan)) {
      if (!plan.startDate) { plan={...plan,startDate:plan.requestedStartDate>today ? plan.requestedStartDate : today}; save(); }
      const day = Math.floor((Date.parse(today)-Date.parse(plan.startDate))/86400000);
      if (day < plan.days) { exportMenuIngredients();renderToday(day,today); return; }
      plan=restorePlan({days:plan.days,configured:true},catalog); save();
    }
    if (plan.startDate) {plan={...plan,startDate:null};save();}
    renderDiscovery();
  }
  function renderDiscovery(changing=false) {
    document.body.classList.add('is-swiping');
    let recipe;
    if(changing) {
      const target=findMenu(replacement?.menuId);
      if(!target || replacement.date<todayKey() || target.selected[replacement.category]?.[replacement.day]!==replacement.originalId) {replacement=null;render();return;}
      const candidates=replacementCandidates();
      if(!candidates.some(item=>item.id===replacement.currentId))replacement.currentId=candidates.length ? candidates[Math.floor(Math.random()*candidates.length)].id : null;
      recipe=catalog.get(replacement.currentId);
    }else {
      const next=chooseNext(plan,suggestionCatalog());
      if(next!==plan){plan=next;save();}
      recipe=catalog.get(plan.currentId);
    }
    const meal = MEALS.find(item=>item.id===recipe?.category);
    const canUndo=changing ? replacement.skipped.length>0 : plan.history.length>0;
    const hasSkipped=changing ? replacement.skipped.length>0 : plan.skipped.length>0;
    root.innerHTML = `
      <header class="planner-heading discovery-heading"><h1>Pasirinkite savo meniu</h1></header>
      ${changing ? '<button class="text-button back-to-today" data-planner="cancel-replace">← Grįžti į meniu</button>' : plan.activeMenu ? '<button class="text-button back-to-today" data-planner="back-today">← Grįžti į šiandienos meniu</button>' : ''}<section class="discovery" aria-label="Receptų pasirinkimas">
        ${recipe ? `
        <article class="swipe-card" tabindex="0" aria-label="${html(recipe.title)}. Rodyklė į kairę – praleisti, į dešinę – pasirinkti." aria-describedby="swipe-hint">
          <div class="swipe-photo"><img src="${html(recipe.image)}" alt="${html(recipe.title)}" draggable="false" fetchpriority="high"><span class="swipe-category">${meal.icon} ${meal.label}</span><span class="swipe-stamp is-like" aria-hidden="true">PATINKA</span><span class="swipe-stamp is-skip" aria-hidden="true">KITĄ KARTĄ</span></div>
          <div class="swipe-copy"><div class="swipe-recipe-meta"><span class="swipe-duration ${durationColor(recipe.totalMinutes)}"><span aria-hidden="true">◷</span><span>Gaminimo laikas: <strong>${Number.isFinite(recipe.totalMinutes) && recipe.totalMinutes > 0 ? `${number(recipe.totalMinutes)} min` : 'nenurodytas'}</strong></span></span><span>${html(portionLabel())}</span></div><h2>${html(recipe.title)}</h2><div class="swipe-nutrition"><span><strong>${number(portionNutrition(recipe,'calories'))}</strong> kcal</span><span><strong>${number(portionNutrition(recipe,'netCarbsGrams'))} g</strong> neto angl.</span><span><strong>${number(portionNutrition(recipe,'proteinGrams'))} g</strong> baltymų</span><small>1 asmeniui${preferences().increase ? ` (+${preferences().increase} %)` : ''}</small></div><button class="planner-recipe-link" data-planner="details" data-id="${html(recipe.id)}">Ingredientai ir gaminimas <span aria-hidden="true">↗</span></button></div>
        </article><div class="swipe-actions"><button class="swipe-action swipe-no" data-planner="skip" aria-label="Praleisti receptą"><span aria-hidden="true">×</span><small>Praleisti</small></button><button class="swipe-undo" data-planner="undo" ${canUndo ? '' : 'disabled'} aria-label="Atšaukti paskutinį pasirinkimą"><span aria-hidden="true">↶</span><small>Atšaukti</small></button><button class="swipe-action swipe-yes" data-planner="like" aria-label="Pasirinkti receptą"><span aria-hidden="true">♡</span><small>Patinka</small></button></div><p class="swipe-hint" id="swipe-hint">Brauk kortelę arba rinkis mygtukais. Kompiuteryje – ← ir →.</p><button class="swipe-block" data-planner="block" data-id="${html(recipe.id)}">Daugiau nesiūlyti</button>` : `<div class="planner-end"><span class="planner-end-symbol" aria-hidden="true">↻</span><h2>Šį ratą peržiūrėjai.</h2><p>${hasSkipped ? 'Peržiūrėk praleistus receptus dar kartą. Užblokuoti receptai nebus rodomi.' : 'Tinkamų receptų šiuo metu neliko.'}</p>${hasSkipped ? '<button class="primary dark" data-planner="revisit">Vėl rodyti praleistus</button>' : ''}</div>`}
        ${!recipe && (preferences().maxMinutes || preferences().veryLowCarbOnly) ? '<p class="swipe-hint">Pagal pasirinktus filtrus šiuo metu tinkamų receptų nėra. Padidinkite laiko ribą arba išjunkite angliavandenių filtrą nustatymuose.</p><button class="text-button" data-planner="settings">Keisti receptų filtrus</button>' : ''}
      ${!recipe && canUndo ? '<button class="text-button planner-end-undo" data-planner="undo">↶ Atšaukti paskutinį pasirinkimą</button>' : ''}
        ${persistenceError ? '<p class="status error" role="alert">Meniu pakeitimai dar neišsaugoti šiame įrenginyje.</p>' : ''}
      </section>
      <dialog class="planner-detail-dialog" aria-labelledby="planner-detail-title"></dialog>`;
    root.querySelector('.swipe-photo img')?.addEventListener('error',event=>{event.target.hidden=true;});
  }
  async function swipe(kind) {
    if(busy)return;
    const change=replacement;
    const id=change ? change.currentId : plan?.currentId;
    if(!id)return;
    const card = root.querySelector('.swipe-card');
    const owner = profile, token = generation;
    busy = true;
    if (card) {
      card.classList.add(kind==='like' ? 'swipe-out-right' : 'swipe-out-left');
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve=>setTimeout(resolve,180));
    }
    if (!active || token !== generation || owner !== profileKey() || change!==replacement || id!==(change ? change.currentId : plan.currentId)) { busy=false; return; }
    if(change) {
      const target=findMenu(change.menuId);
      if(!target || change.date<todayKey() || target.selected[change.category]?.[change.day]!==change.originalId || !replacementCandidates().some(recipe=>recipe.id===id)) {replacement=null;busy=false;render();return;}
      if(kind==='like') {
        target.selected={...target.selected,[change.category]:target.selected[change.category].map((recipeId,index)=>index===change.day ? id : recipeId)};
        target.history=[];target.cartExported=null;replacement=null;busy=false;
        setCartDirty(true);save();exportMenuIngredients(target);render();showToast('Receptas meniu pakeistas.');onRecipeReplaced?.({menuId:change.menuId,category:change.category,day:change.day});
      }else {change.skipped.push(id);change.currentId=null;busy=false;render();}
    }else {plan=decide(plan,suggestionCatalog(),kind);busy=false;save();render();}
    root.querySelector('.swipe-card')?.focus({preventScroll:true});
  }
  function showDetails(id) {
    if(catalog?.has(id))onOpenRecipe(id);
  }
  root.addEventListener('click',async event=>{
    const button = event.target.closest('[data-planner]'); if (!button || busy) return;
    const action = button.dataset.planner;
    if (action==='retry') { error=''; render(); return; }
    if (action==='settings') { syncSettings(); document.querySelector('#settings-dialog').showModal(); return; }
    if (action==='close-details') { root.querySelector('dialog').close(); return; }
    if (action==='details') { showDetails(button.dataset.id); return; }
    if(action==='replace'){beginReplacement(button);return;}
    if(action==='cancel-replace'){generation++;replacement=null;render();return;}
    if(action==='block'){blockRecipe(button.dataset.id);return;}
    if(action==='start-next'){void startNextMenu();return;}
    if(action==='rebuild-cart'){rebuildShoppingCart();return;}
    if(action==='favorite') {
      const recipe=catalog.get(button.dataset.id);if(!recipe)return;
      const favored=toggleFavorite(recipe);
      button.setAttribute('aria-pressed',String(favored));button.classList.toggle('is-favorite',favored);
      button.textContent=favored ? '♥ Mėgstamas receptas' : '♡ Pridėti prie mėgstamų';return;
    }
    if(action==='retry-cart'){exportMenuIngredients(findMenu(cartErrorMenuId) || plan);render();return;}
    if(action==='continue-next'){plan={...plan,buildingNext:true};save();render();return;}
    if(action==='back-today'){plan={...plan,buildingNext:false};save();render();return;}
    if (action==='like' || action==='skip') { void swipe(action); return; }
    if(replacement && action==='undo'){replacement.currentId=replacement.skipped.pop() || null;render();return;}
    if(replacement && action==='revisit'){replacement.skipped=[];replacement.currentId=null;render();return;}
    if (!plan) return;
    if (action==='undo') plan = undo(plan,catalog);
    else if (action==='revisit') plan = { ...plan, skipped:[], history:[], currentId:null };
    else if (action==='remove') {
      const recipe = catalog.get(button.dataset.id); if (!recipe) return;
      plan = {...plan,selected:{...plan.selected,[recipe.category]:plan.selected[recipe.category].filter(id=>id!==recipe.id)},currentId:null,history:[]};
    } else return;
    save(); render();
  });
  settingsSelect.addEventListener('change',async()=>{
    const days = dayCount(settingsSelect.value), owner = profileKey();
    await loadCatalog();
    if (!catalog) { showToast('Nepavyko įkelti receptų. Pabandykite dar kartą.'); syncSettings(); return; }
    if (owner !== profileKey()) { syncSettings(); return; }
    loadProfile();
    if (days < plan.days && MEALS.some(meal=>plan.selected[meal.id].length > days)) {
      if (!await confirmChange('Sutrumpinti meniu? Bus palikti tik pirmųjų pasirinktų dienų receptai.') || owner!==profileKey()) {syncSettings(); return;}
    }
    if(days!==plan.days && isComplete(plan) && MEALS.some(meal=>plan.selected[meal.id].length>days))setCartDirty(true);
    generation++; busy=false; drag=null; replacement=null;plan=resizePlan(plan,days,catalog); save(); syncSettings(); render();
    showToast(`Meniu laikotarpis: ${days} ${days===1 ? 'diena' : 'dienos'}`);
  });
  document.querySelector('#restart-plan').addEventListener('click',()=>void startNextMenu());
  document.querySelector('#clear-plan').addEventListener('click',async()=>{
    const owner=profileKey();await loadCatalog();
    if(!catalog || owner!==profileKey())return;
    loadProfile();
    if(!await confirmChange('Bus ištrinti dabartinis ir visi būsimi meniu bei nebaigti pasirinkimai. Mėgstami receptai ir pirkinių krepšelis liks. Tada iš naujo pasirinksi laikotarpį ir gamybos pradžią.','Taip, ištrinti','Ištrinti visus pasirinkimus?') || owner!==profileKey())return;
    generation++;busy=false;drag=null;replacement=null;cartError='';
    if(reminder.open)reminder.close();root.querySelector('dialog')?.close();
    plan=restorePlan({configured:false},catalog);save();
    setCartDirty(false);
    savePreferences({...preferences(),reminded:{}});
    document.querySelector('#settings-dialog').close();
    if(location.hash!=='#discover')location.hash='#discover';
    offerOnboarding();render();
  });
  // Refresh the daily view at midnight and when returning to an open app.
  let midnightTimer;
  function scheduleDayChange() {
    clearTimeout(midnightTimer);
    if(!active)return;
    const today=todayKey();
    let low=Date.now(), high=low+27*60*60*1000;
    while(high-low>1000) {
      const middle=Math.floor((low+high)/2);
      if(todayKey(new Date(middle))===today)low=middle;else high=middle;
    }
    midnightTimer=setTimeout(()=>{render();scheduleDayChange();},Math.max(1000,high-Date.now()+1000));
  }
  document.addEventListener('visibilitychange',()=>{if(active && document.visibilityState==='visible'){render();scheduleDayChange();}});
  window.addEventListener('focus',()=>{if(active){render();scheduleDayChange();}});
  root.addEventListener('keydown',event=>{
    if (event.target.closest('button,a,input,select,textarea,dialog') || document.querySelector('dialog[open]')) return;
    if (event.key==='ArrowLeft' || event.key==='ArrowRight') {event.preventDefault(); void swipe(event.key==='ArrowRight' ? 'like':'skip');}
  });
  root.addEventListener('pointerdown',event=>{
    const card = event.target.closest('.swipe-card');
    if (!card || busy || event.isPrimary===false || event.button!==0 || event.target.closest('button,a')) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,card,horizontal:false};
  });
  root.addEventListener('pointermove',event=>{
    if (!drag || event.pointerId!==drag.id) return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if (!drag.horizontal && Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)) {drag=null; return;}
    if (!drag.horizontal && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.2) {drag.horizontal=true; drag.card.setPointerCapture(event.pointerId); drag.card.classList.add('is-dragging');}
    if (!drag.horizontal) return;
    drag.card.style.transform=`translateX(${dx}px) rotate(${dx/24}deg)`;
    drag.card.style.setProperty('--like-opacity',Math.max(0,Math.min(1,dx/90)));
    drag.card.style.setProperty('--skip-opacity',Math.max(0,Math.min(1,-dx/90)));
  });
  function finishDrag(event,cancel=false) {
    if (!drag || event.pointerId!==drag.id) return;
    const {card,x,y,horizontal}=drag; drag=null;
    const dx=event.clientX-x,dy=event.clientY-y;
    card.classList.remove('is-dragging'); card.style.transform=''; card.style.removeProperty('--like-opacity'); card.style.removeProperty('--skip-opacity');
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    if (!cancel && horizontal && Math.abs(dx)>Math.min(80,card.clientWidth*.23) && Math.abs(dx)>Math.abs(dy)*1.2) void swipe(dx>0 ? 'like':'skip');
  }
  root.addEventListener('pointerup',event=>finishDrag(event));
  root.addEventListener('pointercancel',event=>finishDrag(event,true));
  root.addEventListener('lostpointercapture',event=>finishDrag(event,true));
  root.addEventListener('close',()=>render(),true);
  document.querySelector('#settings-dialog').addEventListener('close',()=>{syncSettings();render();});
  syncFloatingCart();
  return {
    portions:()=>{const settings=preferences();return {people:settings.people,increase:settings.increase};},
    portionLabel,
    affectedMeals:async(predicate)=>{
      const owner=profileKey();await loadCatalog();
      if(owner!==profileKey() || !catalog)return [];
      loadProfile();const today=todayKey(),slots=[];
      const menus=[plan.activeMenu,...plan.scheduledMenus,plan].filter(Boolean);let cursor=null;
      for(const menu of menus) {
        if(!isComplete(menu))continue;
        const start=menu.startDate || (menu.requestedStartDate>cursor && menu.requestedStartDate>today ? menu.requestedStartDate : cursor || today);
        for(let day=0;day<menu.days;day++) {
          const date=new Date(Date.parse(start)+day*86400000).toISOString().slice(0,10);
          if(date<today)continue;
          for(const meal of MEALS) {
            const recipe=catalog.get(menu.selected[meal.id]?.[day]);
            if(recipe && predicate(recipe))slots.push({menuId:menu.id,category:meal.id,categoryLabel:meal.label,day,date,id:recipe.id,title:recipe.title});
          }
        }
        cursor=new Date(Date.parse(start)+menu.days*86400000).toISOString().slice(0,10);
      }
      return slots;
    },
    replacePlanned:async(slot)=>{
      const owner=profileKey();await loadCatalog();if(owner!==profileKey() || !catalog)return;
      loadProfile();if(slot.date<todayKey())return;
      beginReplacement({dataset:{menuId:slot.menuId,category:slot.category,day:String(slot.day),date:slot.date,id:slot.id}});
    },
    rebuildCart:async()=>{
      const owner=profileKey();await loadCatalog();
      if(owner!==profileKey())return;
      if(!catalog){showToast('Nepavyko įkelti meniu. Bandykite dar kartą.');return;}
      loadProfile();rebuildShoppingCart();
    },
    render,
    syncSettings,
    setActive(value,{preserveSelection=false}={}) {
      if(value && !active && !returningFromDetails && plan?.activeMenu)plan={...plan,buildingNext:false};
      returningFromDetails=!value && preserveSelection;
      active=value;
      if (!active) {document.body.classList.remove('is-swiping');generation++;busy=false;drag=null;if(!preserveSelection)replacement=null;root.querySelector('dialog')?.close();if(confirmation.open)confirmation.close('cancel');}
      else render();
      scheduleDayChange();
      syncFloatingCart();
    },
    deleteProfile(id) {delete cartDirtyMemory[id];for(const key of [KEY,PREFERENCES_KEY,BLOCKED_KEY,CART_DIRTY_KEY])try{const values=JSON.parse(localStorage.getItem(key) || '{}');delete values[id];localStorage.setItem(key,JSON.stringify(values));}catch{}syncFloatingCart();},
  };
}
