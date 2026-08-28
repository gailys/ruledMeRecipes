const STORAGE = { recipes: 'keto-recipes-v1', cart: 'keto-cart-v1' };

const translations = {
  'butter': 'sviestas', 'almond flour': 'migdolų miltai', 'erythritol': 'eritritolis',
  'ground cinnamon': 'maltas cinamonas', 'salt': 'druska', 'heavy whipping cream': 'riebi plakamoji grietinėlė',
  'peanut butter': 'žemės riešutų sviestas', 'vanilla extract': 'vanilės ekstraktas',
  'xanthan gum': 'ksantano derva', 'low-carb dark chocolate': 'mažai angliavandenių turintis juodasis šokoladas',
  'dark chocolate': 'juodasis šokoladas', 'olive oil': 'alyvuogių aliejus', 'cream cheese': 'kreminis sūris',
  'coconut flour': 'kokosų miltai', 'eggs': 'kiaušiniai', 'egg': 'kiaušinis', 'garlic': 'česnakas',
  'onion': 'svogūnas', 'chicken breast': 'vištienos krūtinėlė', 'beef': 'jautiena', 'pork': 'kiauliena',
  'avocado': 'avokadas', 'spinach': 'špinatai', 'cheddar cheese': 'čederio sūris',
  'mozzarella cheese': 'mocarelos sūris', 'parmesan cheese': 'parmezano sūris', 'baking powder': 'kepimo milteliai',
  'cocoa powder': 'kakavos milteliai', 'sweetener': 'saldiklis', 'mayonnaise': 'majonezas'
};

let recipes = load(STORAGE.recipes, []);
let cart = load(STORAGE.cart, []);
let activeRecipeId = null;
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function save() {
  localStorage.setItem(STORAGE.recipes, JSON.stringify(recipes));
  localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
  updateCounts();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function cleanMarkdown(value = '') {
  return value.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>`#]/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeFraction(text = '') {
  const unicode = { '¼':'1/4', '½':'1/2', '¾':'3/4', '⅛':'1/8', '⅜':'3/8', '⅝':'5/8', '⅞':'7/8', '⅓':'1/3', '⅔':'2/3' };
  return text.replace(/[¼½¾⅛⅜⅝⅞⅓⅔]/g, m => unicode[m]);
}

function parseNumber(raw = '') {
  raw = normalizeFraction(raw).trim();
  if (/^\d+\s+\d+\/\d+$/.test(raw)) {
    const [whole, fraction] = raw.split(/\s+/); const [a,b] = fraction.split('/');
    return Number(whole) + Number(a) / Number(b);
  }
  if (/^\d+\/\d+$/.test(raw)) { const [a,b] = raw.split('/'); return Number(a) / Number(b); }
  const value = Number(raw); return Number.isFinite(value) ? value : null;
}

function formatNumber(value) {
  if (value == null) return '';
  const common = [[.125,'⅛'],[.25,'¼'],[.333,'⅓'],[.375,'⅜'],[.5,'½'],[.625,'⅝'],[.667,'⅔'],[.75,'¾'],[.875,'⅞']];
  const whole = Math.floor(value + 1e-7); const decimal = value - whole;
  const match = common.find(([number]) => Math.abs(number - decimal) < .025);
  if (match) return `${whole || ''}${whole ? ' ' : ''}${match[1]}`;
  return Number(value.toFixed(2)).toLocaleString('lt-LT');
}

function translateIngredient(name) {
  const key = name.toLowerCase().replace(/,.*$/, '').replace(/\s+/g, ' ').trim();
  if (translations[key]) return translations[key];
  const partial = Object.keys(translations).sort((a,b) => b.length-a.length).find(item => key.includes(item));
  return partial ? key.replace(partial, translations[partial]) : name;
}

function ingredientKey(name) {
  return name.toLowerCase().replace(/\b(melted|chopped|ground|such as.*|to taste)\b/g, '').replace(/[^a-ząčęėįšųūž ]/gi, '').trim();
}

function parseIngredient(line, group = '') {
  let text = cleanMarkdown(line.replace(/^\s*[-*+]\s*/, ''));
  const match = normalizeFraction(text).match(/^(?:(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s+)?(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|ounce|ounces|oz|pound|pounds|lb|gram|grams|g|ml|clove|cloves|slice|slices|large|medium|small)?\s*(.+)$/i);
  if (!match) return null;
  const [, quantityRaw = '', unitRaw = '', rest = ''] = match;
  const quantity = parseNumber(quantityRaw);
  const name = rest.replace(/^of\s+/i, '').replace(/\s+/g, ' ').trim();
  if (!name || name.length > 130) return null;
  return { id: crypto.randomUUID(), group, quantity, quantityRaw, unit: unitRaw || '', name, translated: translateIngredient(name) };
}

function extractSection(markdown, startPattern, endPattern) {
  const startMatch = markdown.match(startPattern); if (!startMatch || startMatch.index == null) return '';
  const tail = markdown.slice(startMatch.index + startMatch[0].length); const match = tail.match(endPattern);
  return match ? tail.slice(0, match.index) : tail;
}

function parseRecipe(markdown, url) {
  const titleMatch = markdown.match(/^Title:\s*(.+)$/m) || markdown.match(/^#{1,2}\s+(.+)$/m);
  const title = cleanMarkdown(titleMatch?.[1] || new URL(url).pathname.split('/').filter(Boolean).pop().replace(/-/g, ' '));
  const servingsMatch = markdown.match(/(?:Yields?|Servings?)\s+(\d+)/i) || markdown.match(/total of\s+(\d+)\s+servings/i);
  const servings = Number(servingsMatch?.[1] || 1);

  let prep = extractSection(markdown, /(?:^|\n)>?\s*##\s+The Preparation/im, /(?:^|\n)>?\s*##\s+The Execution/im);
  if (!prep) prep = extractSection(markdown, /(?:^|\n)#{3,4}\s+Ingredients/im, /(?:^|\n)#{3,4}\s+Instructions/im);
  const ingredients = [];
  let group = '';
  prep.split('\n').forEach(line => {
    if (/^\s*(?:>\s*)?\*{0,2}[^*\n:]{2,35}:\*{0,2}\s*$/.test(line)) group = cleanMarkdown(line).replace(/:$/, '');
    else if (/^\s*(?:>\s*)?[*+-]\s+/.test(line)) {
      const ingredient = parseIngredient(line.replace(/^\s*>\s*/, ''), group);
      if (ingredient) ingredients.push(ingredient);
    }
  });

  let execution = extractSection(markdown, /(?:^|\n)>?\s*##\s+The Execution/im, /(?:^|\n)>?\s*(?:This makes|##\s+)/im);
  if (!execution) execution = extractSection(markdown, /(?:^|\n)#{3,4}\s+Instructions/im, /(?:^|\n)#{3,4}\s+(?:Video|Nutrition)/im);
  const instructions = [];
  const cleanedExecution = execution.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const numbered = [...cleanedExecution.matchAll(/(?:^|\n)\s*>?\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*>?\s*\d+\.\s+|$)/g)];
  if (numbered.length) numbered.forEach(match => { const step = cleanMarkdown(match[2]); if (step) instructions.push(step); });
  else cleanedExecution.split('\n').filter(line => /^\s*(?:>\s*)?[*+-]\s+/.test(line)).forEach(line => {
    const step = cleanMarkdown(line.replace(/^\s*>?\s*[*+-]\s+/, '')); if (step) instructions.push(step);
  });

  if (ingredients.length < 2) throw new Error('Nepavyko atpažinti ingredientų. Patikrinkite, ar tai Ruled.me recepto nuoroda.');
  return { id: crypto.randomUUID(), title, url, servings, ingredients, instructions, savedAt: new Date().toISOString() };
}

async function fetchRecipe(url) {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol) || !/(^|\.)ruled\.me$/i.test(parsed.hostname)) throw new Error('Šiuo metu palaikomos Ruled.me receptų nuorodos.');
  const endpoint = `https://r.jina.ai/${url}`;
  const response = await fetch(endpoint, { headers: { Accept: 'text/plain' } });
  if (!response.ok) throw new Error(`Recepto puslapis nepasiekiamas (${response.status}).`);
  return parseRecipe(await response.text(), url);
}

function updateCounts() {
  $('#cart-count').textContent = cart.length;
  $('#recipe-count').textContent = recipes.length ? `${recipes.length} ${recipes.length === 1 ? 'receptas' : 'receptai'}` : '';
}

function renderRecipes() {
  const grid = $('#recipe-grid');
  if (!recipes.length) {
    grid.innerHTML = '<div class="empty"><strong>Jūsų receptų lentyna dar tuščia.</strong><br>Įklijuokite pirmąją nuorodą aukščiau.</div>';
  } else {
    grid.innerHTML = recipes.map(recipe => `
      <article class="recipe-card">
        <span class="pill">${recipe.servings} porc.</span>
        <h3>${escapeHtml(recipe.title)}</h3>
        <p>${recipe.ingredients.length} ingredientų · ${recipe.instructions.length} gaminimo žingsnių</p>
        <footer><button class="open-recipe" data-id="${recipe.id}">Atidaryti</button><button class="remove" data-delete="${recipe.id}" aria-label="Ištrinti receptą">×</button></footer>
      </article>`).join('');
  }
  updateCounts();
}

function scaledQuantity(item, servings, originalServings) {
  return item.quantity == null ? item.quantityRaw : formatNumber(item.quantity * servings / originalServings);
}

function renderDetail(id, servingsOverride) {
  const recipe = recipes.find(item => item.id === id); if (!recipe) return location.hash = '#recipes';
  activeRecipeId = id;
  const servings = servingsOverride || recipe.currentServings || recipe.servings;
  recipe.currentServings = servings; save();
  const groups = [...new Set(recipe.ingredients.map(item => item.group).filter(Boolean))];
  const ingredientsHtml = (groups.length ? groups : ['']).map(group => `
    ${group ? `<h3>${escapeHtml(group)}</h3>` : ''}
    <div class="ingredients">${recipe.ingredients.filter(i => groups.length ? i.group === group : true).map(item => `
      <label class="ingredient">
        <input type="checkbox" data-ingredient="${item.id}" checked />
        <span class="ingredient-qty">${escapeHtml(scaledQuantity(item, servings, recipe.servings))} ${escapeHtml(item.unit)}</span>
        <span>${escapeHtml(item.translated)}<small>${escapeHtml(item.name)}</small></span>
      </label>`).join('')}</div>`).join('');
  $('#detail-view').innerHTML = `
    <button class="back" data-back>← Visi receptai</button>
    <header class="detail-header">
      <div><p class="eyebrow">Išsaugotas receptas</p><h1>${escapeHtml(recipe.title)}</h1><a class="source" href="${escapeHtml(recipe.url)}" target="_blank" rel="noopener">Atidaryti originalą ↗</a></div>
      <div class="portion-box"><label>Porcijų skaičius</label><div class="stepper"><button data-step="-1" aria-label="Mažiau porcijų">−</button><strong>${servings}</strong><button data-step="1" aria-label="Daugiau porcijų">+</button></div></div>
    </header>
    <div class="detail-columns">
      <section><div class="ingredient-title"><h2>Ingredientai</h2><button class="text-button" data-toggle>Atžymėti visus</button></div>${ingredientsHtml}<button class="primary dark" data-add-cart>Pridėti pažymėtus į pirkinius</button></section>
      <section><p class="eyebrow">Gaminimas</p><h2>Instrukcija</h2><div class="instructions">${recipe.instructions.length ? recipe.instructions.map(step => `<div class="instruction">${escapeHtml(step)}</div>`).join('') : '<p class="muted">Instrukciją rasite originaliame recepte.</p>'}</div></section>
    </div>`;
}

function addSelectedToCart() {
  const recipe = recipes.find(item => item.id === activeRecipeId); if (!recipe) return;
  const servings = recipe.currentServings || recipe.servings;
  const selected = $$('[data-ingredient]:checked', $('#detail-view')).map(input => recipe.ingredients.find(item => item.id === input.dataset.ingredient)).filter(Boolean);
  selected.forEach(item => {
    const key = ingredientKey(item.name); const scaled = item.quantity == null ? null : item.quantity * servings / recipe.servings;
    const existing = cart.find(entry => entry.key === key && entry.unit.toLowerCase() === item.unit.toLowerCase());
    if (existing && scaled != null && existing.quantity != null) existing.quantity += scaled;
    else if (!existing) cart.push({ id: crypto.randomUUID(), key, quantity: scaled, quantityRaw: item.quantityRaw, unit: item.unit, name: item.name, translated: item.translated, done: false });
  });
  save(); showToast(`${selected.length} produktai pridėti`);
}

function renderShopping() {
  const list = $('#shopping-list');
  if (!cart.length) list.innerHTML = '<div class="empty"><strong>Pirkinių sąrašas tuščias.</strong><br>Atidarykite receptą ir pridėkite reikalingus ingredientus.</div>';
  else list.innerHTML = cart.map(item => `
    <div class="shopping-item ${item.done ? 'done' : ''}">
      <input type="checkbox" data-cart-check="${item.id}" ${item.done ? 'checked' : ''} aria-label="Pažymėti nupirktu" />
      <span class="shop-qty">${escapeHtml(item.quantity == null ? item.quantityRaw : formatNumber(item.quantity))} ${escapeHtml(item.unit)}</span>
      <span class="shop-name">${escapeHtml(item.translated)}<small>${escapeHtml(item.name)}</small></span>
      <button class="remove" data-cart-remove="${item.id}" aria-label="Pašalinti">×</button>
    </div>`).join('');
  updateCounts();
}

function route() {
  const hash = location.hash || '#recipes';
  const detailMatch = hash.match(/^#recipe\/(.+)$/);
  $$('.view').forEach(view => view.hidden = true);
  $$('[data-nav]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
  if (detailMatch) { $('#detail-view').hidden = false; renderDetail(detailMatch[1]); }
  else if (hash === '#shopping') { $('#shopping-view').hidden = false; renderShopping(); }
  else { $('#recipes-view').hidden = false; renderRecipes(); }
  scrollTo({ top: 0, behavior: 'instant' });
}

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

$('#import-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('button[type="submit"]', event.currentTarget); const status = $('#import-status');
  button.disabled = true; button.textContent = 'Skaitoma…'; status.className = 'status'; status.textContent = 'Nuskaitome receptą ir ingredientus.';
  try {
    const recipe = await fetchRecipe($('#recipe-url').value.trim());
    const duplicate = recipes.find(item => item.url.replace(/\/$/,'') === recipe.url.replace(/\/$/,''));
    if (duplicate) { location.hash = `#recipe/${duplicate.id}`; showToast('Šis receptas jau išsaugotas'); }
    else { recipes.unshift(recipe); save(); renderRecipes(); location.hash = `#recipe/${recipe.id}`; showToast('Receptas išsaugotas'); }
    status.textContent = '';
  } catch (error) { status.className = 'status error'; status.textContent = error.message || 'Nepavyko importuoti recepto.'; }
  finally { button.disabled = false; button.textContent = 'Išsaugoti'; }
});

document.addEventListener('click', event => {
  const target = event.target.closest('button'); if (!target) return;
  if (target.matches('.open-recipe')) location.hash = `#recipe/${target.dataset.id}`;
  if (target.matches('[data-back]')) location.hash = '#recipes';
  if (target.matches('[data-delete]')) { if (confirm('Ištrinti šį receptą?')) { recipes = recipes.filter(item => item.id !== target.dataset.delete); save(); renderRecipes(); } }
  if (target.matches('[data-step]')) { const recipe = recipes.find(item => item.id === activeRecipeId); const next = Math.max(1, (recipe.currentServings || recipe.servings) + Number(target.dataset.step)); renderDetail(recipe.id, next); }
  if (target.matches('[data-toggle]')) { const boxes = $$('[data-ingredient]'); const anyChecked = boxes.some(box => box.checked); boxes.forEach(box => box.checked = !anyChecked); target.textContent = anyChecked ? 'Pažymėti visus' : 'Atžymėti visus'; }
  if (target.matches('[data-add-cart]')) addSelectedToCart();
  if (target.matches('[data-cart-remove]')) { cart = cart.filter(item => item.id !== target.dataset.cartRemove); save(); renderShopping(); }
  if (target.matches('#clear-cart') && cart.length && confirm('Išvalyti visą pirkinių sąrašą?')) { cart = []; save(); renderShopping(); }
});

document.addEventListener('change', event => {
  if (event.target.matches('[data-cart-check]')) { const item = cart.find(i => i.id === event.target.dataset.cartCheck); if (item) item.done = event.target.checked; save(); renderShopping(); }
});

window.addEventListener('hashchange', route);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
route();
