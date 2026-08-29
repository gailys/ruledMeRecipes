const STORAGE = { recipes: 'keto-recipes-v1', cart: 'keto-cart-v1', pantry: 'keto-pantry-v1', dictionary: 'keto-translation-dictionary-v1' };
const APP_URL = 'https://gailys.github.io/ruledMeRecipes/';
const pantrySuggestions = ['garlic powder', 'black pepper', 'salt', 'olive oil', 'onion powder', 'paprika'];

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
  'cocoa powder': 'kakavos milteliai', 'sweetener': 'saldiklis', 'mayonnaise': 'majonezas',
  'water': 'vanduo', 'milk': 'pienas', 'coconut milk': 'kokosų pienas', 'almond milk': 'migdolų pienas',
  'heavy cream': 'riebi grietinėlė', 'sour cream': 'grietinė', 'greek yogurt': 'graikiškas jogurtas',
  'coconut oil': 'kokosų aliejus', 'avocado oil': 'avokadų aliejus', 'vinegar': 'actas',
  'apple cider vinegar': 'obuolių actas', 'lemon juice': 'citrinų sultys', 'lime juice': 'žaliųjų citrinų sultys',
  'chicken broth': 'vištienos sultinys', 'beef broth': 'jautienos sultinys', 'tomato sauce': 'pomidorų padažas',
  'soy sauce': 'sojų padažas', 'mustard': 'garstyčios', 'garlic powder': 'česnakų milteliai',
  'onion powder': 'svogūnų milteliai', 'paprika': 'paprika', 'black pepper': 'juodieji pipirai',
  'pepper': 'pipirai', 'chili powder': 'aitriųjų paprikų milteliai', 'oregano': 'raudonėlis',
  'basil': 'bazilikas', 'parsley': 'petražolės', 'cauliflower': 'žiedinis kopūstas', 'broccoli': 'brokoliai',
  'mushrooms': 'grybai', 'zucchini': 'cukinija', 'tomato': 'pomidoras', 'tomatoes': 'pomidorai',
  'bacon': 'šoninė', 'ground beef': 'malta jautiena', 'chicken thighs': 'vištienos šlaunelės',
  'salmon': 'lašiša', 'shrimp': 'krevetės', 'pecans': 'pekano riešutai', 'walnuts': 'graikiniai riešutai',
  'almonds': 'migdolai', 'chia seeds': 'ispaninio šalavijo sėklos', 'flaxseed': 'linų sėmenys',
  'egg white': 'kiaušinio baltymas', 'allulose': 'aliuliozė', 'gelatin': 'želatina',
  'shredded coconut': 'kokosų drožlės', 'peanut butter powder': 'žemės riešutų sviesto milteliai',
  'hemp seeds': 'kanapių sėklos', 'liquid stevia': 'skysta stevija', 'banana extract': 'bananų ekstraktas',
  'mct oil': 'MCT aliejus', 'blueberries': 'mėlynės', 'flaxseed meal': 'malti linų sėmenys',
  'poppy seeds': 'aguonos', 'lemon zest': 'citrinos žievelė', 'psyllium husk powder': 'gysločių luobelių milteliai',
  'cloves': 'gvazdikėliai', 'nutmeg': 'muskato riešutas', 'allspice': 'kvapieji pipirai',
  'ginger': 'imbieras', 'orange extract': 'apelsinų ekstraktas', 'half-and-half': 'grietinėlės ir pieno mišinys',
  'hot dogs': 'dešrainių dešrelės', 'cilantro': 'kalendra', 'salsa': 'salsa',
  'portobello mushrooms': 'portobelo grybai', 'dijon mustard': 'Dižono garstyčios',
  'romaine lettuce': 'romaninių salotų lapai', 'cherry tomatoes': 'vyšniniai pomidorai', 'cucumber': 'agurkas',
  'cabbage': 'kopūstas', 'rice vinegar': 'ryžių actas', 'bbq sauce': 'BBQ padažas',
  'nori flakes': 'nori dribsniai', 'bonito flakes': 'bonito dribsniai', 'celery': 'salieras',
  'hot sauce': 'aštrus padažas', 'blue cheese': 'mėlynasis sūris', 'green onion': 'svogūnų laiškai',
  'cremini mushrooms': 'rudieji pievagrybiai', 'sun-dried tomatoes': 'saulėje džiovinti pomidorai',
  'italian seasoning': 'itališkų žolelių mišinys', 'pork rinds': 'kiaulienos odelių traškučiai',
  'green beans': 'šparaginės pupelės', 'thyme': 'čiobreliai', 'red bell pepper': 'raudonoji paprika',
  'sesame oil': 'sezamų aliejus', 'red pepper flakes': 'aitriųjų paprikų dribsniai', 'rum': 'romas',
  'ice cubes': 'ledo kubeliai', 'red onion': 'raudonasis svogūnas', 'salt and pepper': 'druska ir pipirai',
  'whole milk': 'nenugriebtas pienas', 'cilantro': 'kalendra', 'green cabbage': 'žaliasis kopūstas'
};

const ingredientAliases = [
  [/\bheavy whipping cream\b|\bheavy cream\b/i, 'heavy cream'],
  [/\bunsweetened carton coconut milk\b|\bcoconut milk\b/i, 'coconut milk'],
  [/\bstevia\/erythritol blend\b|\berythritol\/stevia blend\b/i, 'sweetener'],
  [/\bunsweetened dark cocoa powder\b|\bcocoa powder\b/i, 'cocoa powder'],
  [/\bpowdered peanut butter\b/i, 'peanut butter powder'],
  [/\bpeanut butter\b/i, 'peanut butter'], [/^(?:salted |unsalted )?butter\b/i, 'butter'],
  [/\bunsweetened shredded coconut\b|\bshredded coconut\b/i, 'shredded coconut'],
  [/\bunflavored gelatin\b/i, 'gelatin'], [/\bclear rum\b/i, 'rum'], [/\bfresh cilantro\b/i, 'cilantro'],
  [/\bwhole milk\b/i, 'whole milk'], [/\bgreen cabbage\b/i, 'green cabbage'],
  [/\bunseasoned rice vinegar\b/i, 'rice vinegar'], [/\blow-carb bbq sauce\b/i, 'bbq sauce'],
  [/\bsalt and pepper\b/i, 'salt and pepper'],
  [/\bdrops? liquid stevia\b|\bliquid stevia\b/i, 'liquid stevia'],
  [/\bflaxseed meal\b/i, 'flaxseed meal'],
  [/\bfresh garlic\b|\bgarlic cloves?\b/i, 'garlic'],
  [/\bboneless,? skinless chicken breast\b|\bchicken breast\b/i, 'chicken breast'],
  [/\bboneless,? skinless chicken thighs\b|\bbone-in,? skin-on chicken thighs\b|\bchicken thighs\b/i, 'chicken thighs'],
  [/\bparmesan cheese\b/i, 'parmesan cheese'], [/\bcheddar cheese\b/i, 'cheddar cheese'],
  [/\bmozzarella cheese\b/i, 'mozzarella cheese'], [/\bcream cheese\b/i, 'cream cheese'],
  [/\bground beef\b/i, 'ground beef'], [/\bportobello mushrooms?\b/i, 'portobello mushrooms'],
  [/\bcremini mushrooms?\b/i, 'cremini mushrooms'], [/\bsun-dried tomatoes?\b/i, 'sun-dried tomatoes'],
  [/\bcherry tomatoes?\b/i, 'cherry tomatoes'], [/\bgreen beans?\b/i, 'green beans'],
  [/\bred bell pepper\b/i, 'red bell pepper'], [/\bcrushed red pepper flakes\b/i, 'red pepper flakes'],
  [/\bpork rinds?\b/i, 'pork rinds'], [/\bbeef hot dogs?\b/i, 'hot dogs'],
  [/\bcooked bacon\b|\bbacon\b/i, 'bacon'], [/\begg whites?\b/i, 'egg white'], [/\bhard-boiled eggs?\b|\beggs?\b/i, 'egg'],
  [/\bground cinnamon\b/i, 'ground cinnamon'], [/\bground allspice\b/i, 'allspice'],
  [/\bground cloves\b/i, 'cloves'], [/\bground nutmeg\b/i, 'nutmeg'], [/\bground ginger\b|\bfresh ginger\b/i, 'ginger'],
  [/\bdried oregano\b/i, 'oregano'], [/\bdried parsley\b|\bfresh parsley\b/i, 'parsley'], [/\bdried thyme\b/i, 'thyme']
];

let recipes = load(STORAGE.recipes, []);
let cart = load(STORAGE.cart, []);
let pantry = load(STORAGE.pantry, []);
let customTranslations = load(STORAGE.dictionary, {});
let dictionaryData = { recipesAudited: 0, entries: [] };
let activeRecipeId = null;
let activeFilter = 'Visi';
let toastTimer;
let deferredInstallPrompt = null;
let pantryHold = null;
let readerQueue = Promise.resolve();
let lastReaderRequest = 0;
let pendingSharedUrl = (() => {
  const value = new URL(location.href).searchParams.get('recipe');
  try { return value && /(^|\.)ruled\.me$/i.test(new URL(value).hostname) ? value : ''; } catch { return ''; }
})();

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function save() {
  localStorage.setItem(STORAGE.recipes, JSON.stringify(recipes));
  localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
  localStorage.setItem(STORAGE.pantry, JSON.stringify(pantry));
  updateCounts();
}

function saveDictionary() {
  localStorage.setItem(STORAGE.dictionary, JSON.stringify(customTranslations));
}

function migrateLegacyIngredientNames() {
  let changed = false;
  const fix = item => {
    if (/^(cup|tablespoon|teaspoon|ounce|pound|gram|clove|slice)$/i.test(item.unit || '') && /^s\s+/i.test(item.name || '')) {
      item.name = item.name.replace(/^s\s+/i, '');
      item.unit = `${item.unit}s`;
      item.translated = translateIngredient(item.name);
      changed = true;
    }
  };
  recipes.forEach(recipe => recipe.ingredients.forEach(item => {
    fix(item);
    const translated = translateIngredient(item.name);
    if (item.translated !== translated) { item.translated = translated; changed = true; }
  }));
  cart.forEach(item => {
    fix(item);
    const key = ingredientKey(item.name); const translated = translateIngredient(item.name);
    if (item.key !== key || item.translated !== translated) { item.key = key; item.translated = translated; changed = true; }
  });
  const consolidated = [];
  cart.forEach(item => {
    const existing = consolidated.find(entry => entry.key === item.key && unitKey(entry.unit) === unitKey(item.unit) && entry.quantity != null && item.quantity != null);
    if (existing) { existing.quantity += item.quantity; changed = true; }
    else consolidated.push(item);
  });
  if (consolidated.length !== cart.length) cart = consolidated;
  const neededCart = cart.filter(item => !isInPantry(item.name));
  if (neededCart.length !== cart.length) { cart = neededCart; changed = true; }
  if (changed) save();
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

function roundedMetric(value) {
  if (value < 10) return Number(value.toFixed(1)).toLocaleString('lt-LT');
  return Math.round(value).toLocaleString('lt-LT');
}

function metricAmount(item) {
  if (item.quantity == null) return [item.quantityRaw, ''].filter(Boolean).join(' ');
  const unit = item.unit.toLowerCase().replace(/\.$/, '');
  const quantity = item.quantity;
  if (/^(ounce|ounces|oz)$/.test(unit)) return `${roundedMetric(quantity * 28.3495)} g`;
  if (/^(pound|pounds|lb|lbs)$/.test(unit)) return `${roundedMetric(quantity * 453.592)} g`;
  if (/^(gram|grams|g)$/.test(unit)) return `${roundedMetric(quantity)} g`;
  if (/^(milliliter|milliliters|ml)$/.test(unit)) return `${roundedMetric(quantity)} ml`;
  if (/^(liter|liters|l)$/.test(unit)) return `${roundedMetric(quantity * 1000)} ml`;
  if (/^(fluid ounce|fluid ounces|fl oz)$/.test(unit)) return `${roundedMetric(quantity * 29.5735)} ml`;
  if (/^(cup|cups)$/.test(unit)) return `${formatNumber(quantity)} ${Math.abs(quantity - 1) < .001 ? 'puodelis' : 'puodelio'}`;
  if (/^(tablespoon|tablespoons|tbsp)$/.test(unit)) return `${roundedMetric(quantity * 15)} ml`;
  if (/^(teaspoon|teaspoons|tsp)$/.test(unit)) return `${roundedMetric(quantity * 5)} ml`;
  const unitLt = { large: 'didelis', medium: 'vidutinis', small: 'mažas', clove: 'skiltelė', cloves: 'skiltelės', slice: 'riekelė', slices: 'riekelės' }[unit] || item.unit;
  return `${formatNumber(quantity)}${unitLt ? ` ${unitLt}` : ''}`;
}

function unitKey(unit = '') {
  const value = unit.toLowerCase().replace(/\.$/, '').trim();
  if (/^(cup|cups)$/.test(value)) return 'cup';
  if (/^(tablespoon|tablespoons|tbsp)$/.test(value)) return 'tablespoon';
  if (/^(teaspoon|teaspoons|tsp)$/.test(value)) return 'teaspoon';
  if (/^(ounce|ounces|oz)$/.test(value)) return 'ounce';
  if (/^(fluid ounce|fluid ounces|fl oz)$/.test(value)) return 'fluid ounce';
  if (/^(pound|pounds|lb|lbs)$/.test(value)) return 'pound';
  if (/^(gram|grams|g)$/.test(value)) return 'gram';
  if (/^(milliliter|milliliters|ml)$/.test(value)) return 'milliliter';
  return value;
}

function translateIngredient(name) {
  const key = canonicalIngredientName(name);
  if (customTranslations[key]) return customTranslations[key];
  if (translations[key]) return translations[key];
  const partial = Object.keys(translations).sort((a,b) => b.length-a.length).find(item => key.includes(item));
  return partial ? key.replace(partial, translations[partial]) : name;
}

function canonicalIngredientName(name) {
  const value = name.toLowerCase().replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const alias = ingredientAliases.find(([pattern]) => pattern.test(value));
  if (alias) return alias[1];
  return value.replace(/,\s*(?:chopped|diced|sliced|grated|shredded|melted|softened|divided|powdered|peeled|minced|washed|trimmed|to taste).*$/i, '').trim();
}

function inferCategory(title, markdown = '') {
  const text = `${title} ${markdown.slice(0, 1800)}`.toLowerCase();
  if (/dessert|cake|cookie|brownie|fudge|sweet|chocolate|ice cream|pudding|cheesecake|cupcake|pie\b/.test(text)) return 'Desertai';
  if (/breakfast|pancake|waffle|omelet|omelette|morning|cereal/.test(text)) return 'Pusryčiai';
  if (/snack|bite|chips|cracker|dip\b|fat bomb/.test(text)) return 'Užkandžiai';
  if (/lunch|salad|wrap|sandwich|soup/.test(text)) return 'Pietūs';
  if (/dinner|chicken|beef|pork|salmon|casserole|steak|pizza|pasta|lasagna/.test(text)) return 'Vakarienė';
  return 'Kita';
}

function ingredientKey(name) {
  return canonicalIngredientName(name).replace(/[^a-ząčęėįšųūž ]/gi, '').trim();
}

function pantryKeyFromInput(value) {
  const normalized = value.toLowerCase().replace(/\s+/g, ' ').trim();
  const translatedMatch = [...Object.entries(customTranslations), ...Object.entries(translations)].find(([, lithuanian]) => lithuanian.toLowerCase() === normalized);
  return ingredientKey(translatedMatch ? translatedMatch[0] : value);
}

function isInPantry(name) {
  return pantry.some(item => item.key === ingredientKey(name));
}

function addToPantry(name, label = '') {
  const key = pantryKeyFromInput(name);
  if (!key || pantry.some(item => item.key === key)) return false;
  const englishName = Object.keys(translations).find(item => ingredientKey(item) === key) || name;
  pantry.push({ key, name: label || translateIngredient(englishName) || name });
  cart = cart.filter(item => item.key !== key && ingredientKey(item.name) !== key);
  save();
  return true;
}

function parseIngredient(line, group = '') {
  let text = cleanMarkdown(line.replace(/^\s*[-*+]\s*/, ''));
  const match = normalizeFraction(text).match(/^(?:(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s+)?(fluid ounces|fluid ounce|fl oz|cups|cup|tablespoons|tablespoon|tbsp|teaspoons|teaspoon|tsp|ounces|ounce|oz|pounds|pound|lbs|lb|milliliters|milliliter|ml|liters|liter|grams|gram|g|cloves|clove|slices|slice|large|medium|small)?\s*(.+)$/i);
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
  const numbered = [...cleanedExecution.matchAll(/(?:^|\n)\s*>?\s*(?:\*\*)?(\d+)\.(?:\*\*)?\s*([\s\S]*?)(?=\n\s*>?\s*(?:\*\*)?\d+\.(?:\*\*)?\s*|$)/g)];
  if (numbered.length) numbered.forEach(match => { const step = cleanMarkdown(match[2]); if (step) instructions.push(step); });
  else cleanedExecution.split('\n').filter(line => /^\s*(?:>\s*)?[*+-]\s+/.test(line)).forEach(line => {
    const step = cleanMarkdown(line.replace(/^\s*>?\s*[*+-]\s+/, '')); if (step) instructions.push(step);
  });

  if (ingredients.length < 2) throw new Error('Nepavyko atpažinti ingredientų. Patikrinkite, ar tai Ruled.me recepto nuoroda.');
  return { id: crypto.randomUUID(), title, url, servings, category: inferCategory(title, markdown), ingredients, instructions, savedAt: new Date().toISOString() };
}

async function fetchRecipe(url) {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol) || !/(^|\.)ruled\.me$/i.test(parsed.hostname)) throw new Error('Šiuo metu palaikomos Ruled.me receptų nuorodos.');
  const endpoint = `https://r.jina.ai/${url}`;
  const response = await readerFetch(endpoint);
  if (!response.ok) throw new Error(`Recepto puslapis nepasiekiamas (${response.status}).`);
  const recipe = parseRecipe(await response.text(), url);
  recipe.image = await fetchFeaturedImage(url).catch(() => '');
  return recipe;
}

function readerFetch(url) {
  const request = readerQueue.then(async () => {
    const wait = Math.max(0, 3100 - (Date.now() - lastReaderRequest));
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    lastReaderRequest = Date.now();
    let response = await fetch(url, { headers: { Accept: 'text/plain' } });
    if (response.status === 429) {
      const retryAfter = Math.max(5, Number(response.headers.get('retry-after')) || 60);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      lastReaderRequest = Date.now();
      response = await fetch(url, { headers: { Accept: 'text/plain' } });
    }
    return response;
  });
  readerQueue = request.catch(() => {});
  return request;
}

async function fetchFeaturedImage(url) {
  const slug = new URL(url).pathname.split('/').filter(Boolean).pop();
  const api = `https://www.ruled.me/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`;
  const response = await readerFetch(`https://r.jina.ai/${api}`);
  if (!response.ok) return '';
  const text = await response.text();
  const sources = [...text.matchAll(/"source_url"\s*:\s*"([^"]+)"/g)].map(match => match[1].replace(/\\\//g, '/'));
  return sources.find(source => !/-\d+x\d+\.[a-z]+(?:\?|$)/i.test(source)) || sources.at(-1) || '';
}

async function hydrateMissingImages() {
  const missing = recipes.filter(recipe => !recipe.image);
  for (const recipe of missing) {
    recipe.image = await fetchFeaturedImage(recipe.url).catch(() => '');
    recipe.category ||= inferCategory(recipe.title);
    save(); renderRecipes();
  }
}

function updateCounts() {
  $('#cart-count').textContent = cart.length;
  $('#pantry-count').textContent = pantry.length;
  $('#recipe-count').textContent = recipes.length ? `${recipes.length} ${recipes.length === 1 ? 'receptas' : 'receptai'}` : '';
}

function renderRecipes() {
  const grid = $('#recipe-grid');
  const categories = ['Visi', ...new Set(recipes.map(recipe => recipe.category || 'Kita'))];
  $('#category-filters').innerHTML = categories.map(category => `<button class="filter-chip ${category === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  if (!categories.includes(activeFilter)) activeFilter = 'Visi';
  const filtered = activeFilter === 'Visi' ? recipes : recipes.filter(recipe => (recipe.category || 'Kita') === activeFilter);
  const visible = [...filtered].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
  if (!recipes.length) {
    grid.innerHTML = '<div class="empty"><strong>Jūsų receptų lentyna dar tuščia.</strong><br>Pasirinkite „Pridėti“ ir įklijuokite pirmąją Ruled.me nuorodą.</div>';
  } else if (!visible.length) {
    grid.innerHTML = '<div class="empty">Šioje kategorijoje receptų dar nėra.</div>';
  } else {
    grid.innerHTML = visible.map(recipe => `
      <article class="recipe-card ${recipe.pinned ? 'pinned' : ''}">
        <button class="card-pin ${recipe.pinned ? 'active' : ''}" data-pin-recipe="${recipe.id}" aria-label="${recipe.pinned ? 'Atsegti receptą' : 'Prisegti receptą viršuje'}" title="${recipe.pinned ? 'Atsegti' : 'Prisegti viršuje'}">★</button>
        <button class="recipe-image-button" data-open-recipe="${recipe.id}" aria-label="Atidaryti ${escapeHtml(recipe.title)}">
          ${recipe.image ? `<img class="recipe-image" src="${escapeHtml(recipe.image)}" alt="" loading="lazy" />` : '<span class="recipe-image-fallback">K</span>'}
        </button>
        <div class="recipe-body">
          <div class="recipe-meta"><span class="pill">${escapeHtml(recipe.category || 'Kita')}</span><span class="muted">${recipe.servings} porc.</span></div>
          <button class="recipe-title-button" data-open-recipe="${recipe.id}"><h3>${escapeHtml(recipe.title)}</h3></button>
          <p>${recipe.ingredients.length} ingredientų · ${recipe.instructions.length} žingsnių</p>
          <div class="recipe-link-row"><a href="${escapeHtml(recipe.url)}" target="_blank" rel="noopener">Atidaryti</a><button data-copy-url="${escapeHtml(recipe.url)}">Kopijuoti</button><button data-share-recipe="${recipe.id}">Bendrinti</button></div>
          <footer><button class="card-cart" data-quick-cart="${recipe.id}">＋ Į pirkinius</button><button class="remove" data-delete="${recipe.id}" aria-label="Ištrinti receptą">×</button></footer>
        </div>
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
        <span>${escapeHtml(translateIngredient(item.name))}<small>${escapeHtml(item.name)}</small></span>
      </label>`).join('')}</div>`).join('');
  $('#detail-view').innerHTML = `
    <button class="back" data-back>← Visi receptai</button>
    <header class="detail-header">
      <div><p class="eyebrow">Išsaugotas receptas</p><h1>${escapeHtml(recipe.title)}</h1><div class="detail-actions"><a class="detail-action" href="${escapeHtml(recipe.url)}" target="_blank" rel="noopener">Atidaryti originalą ↗</a><button class="detail-action" data-copy-url="${escapeHtml(recipe.url)}">Kopijuoti nuorodą</button><button class="detail-action" data-share-recipe="${recipe.id}">Bendrinti</button></div></div>
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
  const needed = selected.filter(item => !isInPantry(item.name));
  needed.forEach(item => {
    const key = ingredientKey(item.name); const scaled = item.quantity == null ? null : item.quantity * servings / recipe.servings;
    const existing = cart.find(entry => entry.key === key && unitKey(entry.unit) === unitKey(item.unit));
    if (existing && scaled != null && existing.quantity != null) existing.quantity += scaled;
    else if (!existing) cart.push({ id: crypto.randomUUID(), key, quantity: scaled, quantityRaw: item.quantityRaw, unit: item.unit, name: item.name, translated: item.translated, done: false });
  });
  save(); showToast(`${needed.length} produktai pridėti${selected.length !== needed.length ? ` · ${selected.length - needed.length} turite` : ''}`);
}

function addRecipeToCart(recipe, items = recipe.ingredients) {
  const servings = recipe.currentServings || recipe.servings;
  const needed = items.filter(item => !isInPantry(item.name));
  needed.forEach(item => {
    const key = ingredientKey(item.name); const scaled = item.quantity == null ? null : item.quantity * servings / recipe.servings;
    const existing = cart.find(entry => entry.key === key && unitKey(entry.unit) === unitKey(item.unit));
    if (existing && scaled != null && existing.quantity != null) existing.quantity += scaled;
    else if (!existing) cart.push({ id: crypto.randomUUID(), key, quantity: scaled, quantityRaw: item.quantityRaw, unit: item.unit, name: item.name, translated: item.translated, done: false });
  });
  save(); showToast(`${needed.length} produktai pridėti${items.length !== needed.length ? ` · ${items.length - needed.length} turite` : ''}`);
}

function renderShopping() {
  const list = $('#shopping-list');
  if (!cart.length) list.innerHTML = '<div class="empty"><strong>Pirkinių sąrašas tuščias.</strong><br>Atidarykite receptą ir pridėkite reikalingus ingredientus.</div>';
  else list.innerHTML = cart.map(item => `
    <div class="shopping-item ${item.done ? 'done' : ''}">
      <input type="checkbox" data-cart-check="${item.id}" ${item.done ? 'checked' : ''} aria-label="Pažymėti nupirktu" />
      <span class="shop-qty">${escapeHtml(metricAmount(item))}</span>
      <span class="shop-name">${escapeHtml(translateIngredient(item.name))}<small>${escapeHtml(item.name)}</small></span>
      <button class="have-at-home" data-pantry-from="${item.id}">Visada turiu</button>
      <button class="remove" data-cart-remove="${item.id}" aria-label="Pašalinti">×</button>
    </div>`).join('');
  updateCounts();
}

function renderPantry() {
  $('#pantry-suggestions').innerHTML = pantrySuggestions.filter(name => !isInPantry(name)).map(name => `<button class="pantry-suggestion" data-pantry-suggestion="${escapeHtml(name)}">＋ ${escapeHtml(translateIngredient(name))}</button>`).join('');
  $('#pantry-list').innerHTML = pantry.length ? pantry.map(item => `<span class="pantry-chip">${escapeHtml(item.name)}<button data-pantry-remove="${escapeHtml(item.key)}" aria-label="Pašalinti">×</button></span>`).join('') : '<span class="muted">Sąrašas kol kas tuščias.</span>';
  updateCounts();
}

function dictionaryValue(entry) {
  return customTranslations[entry.key] ?? entry.defaultLt ?? translations[entry.key] ?? '';
}

function renderDictionary() {
  const query = ($('#dictionary-search').value || '').toLowerCase().trim();
  const entries = dictionaryData.entries.filter(entry => {
    const text = [entry.english, dictionaryValue(entry), ...(entry.variants || [])].join(' ').toLowerCase();
    return !query || text.includes(query);
  });
  $('#dictionary-summary').textContent = `${dictionaryData.recipesAudited} patikrintų receptų · ${dictionaryData.entries.length} ingredientų${query ? ` · rasta ${entries.length}` : ''}`;
  $('#dictionary-list').innerHTML = entries.length ? entries.map(entry => `
    <label class="dictionary-row">
      <span><strong>${escapeHtml(entry.english)}</strong><small>${entry.count} receptuose${entry.variants?.length ? ` · ${escapeHtml(entry.variants.slice(0, 2).join(' / '))}` : ''}</small></span>
      <input data-dictionary-input="${escapeHtml(entry.key)}" value="${escapeHtml(dictionaryValue(entry))}" placeholder="Įrašykite lietuvišką vertimą" />
      <button type="button" class="dictionary-reset" data-dictionary-reset="${escapeHtml(entry.key)}" aria-label="Atstatyti vertimą">↺</button>
    </label>`).join('') : '<div class="empty">Nieko nerasta.</div>';
}

async function loadDictionary() {
  try {
    const response = await fetch('./ingredient-dictionary.json');
    if (!response.ok) throw new Error('dictionary');
    dictionaryData = await response.json();
  } catch {
    dictionaryData = { recipesAudited: 0, entries: Object.keys(translations).map(key => ({ key, english: key, defaultLt: translations[key], count: 0, variants: [] })) };
  }
}

function route() {
  const hash = location.hash || '#recipes';
  const detailMatch = hash.match(/^#recipe\/(.+)$/);
  const dialog = $('#add-dialog');
  if (hash !== '#add' && dialog.open) dialog.close();
  $$('.view').forEach(view => view.hidden = true);
  $$('[data-nav]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
  if (detailMatch) { $('#detail-view').hidden = false; renderDetail(detailMatch[1]); }
  else if (hash === '#shopping') { $('#shopping-view').hidden = false; renderShopping(); }
  else if (hash === '#add') {
    $('#recipes-view').hidden = false;
    renderRecipes();
    if (!dialog.open) {
      $('#recipe-url').value = pendingSharedUrl || '';
      $('#import-status').textContent = pendingSharedUrl ? 'Gautas bendrinamas receptas. Paspauskite „Išsaugoti“, kad pridėtumėte.' : '';
      dialog.showModal();
    }
    requestAnimationFrame(() => $('#recipe-url').focus());
  }
  else { $('#recipes-view').hidden = false; renderRecipes(); }
  scrollTo({ top: 0, behavior: 'instant' });
}

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function clearSharedRecipeQuery() {
  pendingSharedUrl = '';
  const current = new URL(location.href); current.searchParams.delete('recipe');
  history.replaceState(null, '', `${current.pathname}${current.search}${current.hash}`);
}

async function shareRecipe(recipe) {
  const deepLink = `${APP_URL}?recipe=${encodeURIComponent(recipe.url)}#add`;
  const data = { title: recipe.title, text: `Keto receptas: ${recipe.title}`, url: deepLink };
  try {
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(deepLink); showToast('Bendrinimo nuoroda nukopijuota'); }
  } catch (error) {
    if (error.name !== 'AbortError') showToast('Nepavyko bendrinti recepto');
  }
}

function cancelPantryHold() {
  if (!pantryHold) return;
  clearTimeout(pantryHold.timeout); clearInterval(pantryHold.interval);
  if (pantryHold.button.isConnected) {
    pantryHold.button.classList.remove('holding');
    pantryHold.button.textContent = 'Visada turiu';
  }
  pantryHold = null;
}

function startPantryHold(button, event) {
  cancelPantryHold();
  const startedAt = Date.now();
  button.classList.add('holding'); button.textContent = 'Laikykite 5 s';
  button.setPointerCapture?.(event.pointerId);
  const state = { button, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
  state.interval = setInterval(() => {
    const remaining = Math.max(1, Math.ceil((5000 - (Date.now() - startedAt)) / 1000));
    if (button.isConnected) button.textContent = `Laikykite ${remaining} s`;
  }, 150);
  state.timeout = setTimeout(() => {
    const item = cart.find(entry => entry.id === button.dataset.pantryFrom);
    clearInterval(state.interval); pantryHold = null;
    if (item && addToPantry(item.name, translateIngredient(item.name))) {
      renderShopping(); showToast('Pridėta prie turimų namuose');
    }
  }, 5000);
  pantryHold = state;
}

$('#import-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('button[type="submit"]', event.currentTarget); const status = $('#import-status');
  const urls = [...new Set(($('#recipe-url').value.match(/https?:\/\/[^\s,]+/gi) || []).map(url => url.replace(/[)\].,;]+$/, '')))];
  if (!urls.length) { status.className = 'status error'; status.textContent = 'Įklijuokite bent vieną pilną Ruled.me nuorodą.'; return; }
  if (urls.length > 30) { status.className = 'status error'; status.textContent = 'Vienu kartu galima importuoti iki 30 receptų.'; return; }
  button.disabled = true; button.textContent = 'Importuojama…'; status.className = 'status';
  let imported = 0; let skipped = 0; const failed = [];
  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    status.textContent = `Importuojama ${index + 1} iš ${urls.length}: ${new URL(url).pathname.split('/').filter(Boolean).pop() || url}`;
    const duplicate = recipes.find(item => item.url.replace(/\/$/,'') === url.replace(/\/$/,''));
    if (duplicate) { skipped += 1; continue; }
    try {
      const recipe = await fetchRecipe(url);
      recipes.unshift(recipe); imported += 1; save(); renderRecipes();
    } catch (error) { failed.push(`${url} — ${error.message || 'klaida'}`); }
  }
  if (failed.length) {
    status.className = 'status error';
    status.textContent = `Importuota: ${imported}, praleista: ${skipped}, nepavyko: ${failed.length}. ${failed.map(item => item.split(' — ')[0]).join(', ')}`;
  } else {
    $('#recipe-url').value = '';
    status.textContent = '';
    clearSharedRecipeQuery();
    location.hash = '#recipes';
    showToast(`Importuota: ${imported}${skipped ? ` · jau buvo: ${skipped}` : ''}`);
  }
  button.disabled = false; button.textContent = 'Išsaugoti';
});

$('.dialog-close').addEventListener('click', () => { clearSharedRecipeQuery(); location.hash = '#recipes'; });
$('#add-dialog').addEventListener('close', () => { if (location.hash === '#add') { clearSharedRecipeQuery(); location.hash = '#recipes'; } });
$('#manage-pantry').addEventListener('click', () => { renderPantry(); $('#pantry-dialog').showModal(); });
$('.pantry-close').addEventListener('click', () => $('#pantry-dialog').close());
$('#manage-dictionary').addEventListener('click', () => $('#settings-dialog').showModal());
$('.settings-close').addEventListener('click', () => $('#settings-dialog').close());
$('#open-dictionary').addEventListener('click', async () => {
  $('#settings-dialog').close();
  if (!dictionaryData.entries.length) await loadDictionary();
  renderDictionary(); $('#dictionary-dialog').showModal();
});
$('.dictionary-close').addEventListener('click', () => $('#dictionary-dialog').close());
$('#dictionary-search').addEventListener('input', renderDictionary);
$('#pantry-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#pantry-input');
  if (addToPantry(input.value.trim(), input.value.trim())) { input.value = ''; renderPantry(); renderShopping(); }
  else showToast('Šis produktas jau įtrauktas');
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!sessionStorage.getItem('install-dismissed')) $('#install-banner').hidden = false;
});

$('#install-app').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $('#install-banner').hidden = true;
  if (choice.outcome === 'accepted') showToast('Programėlė diegiama');
});

$('#dismiss-install').addEventListener('click', () => {
  $('#install-banner').hidden = true;
  sessionStorage.setItem('install-dismissed', '1');
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  $('#install-banner').hidden = true;
  showToast('„Mano keto“ įdiegta');
});

document.addEventListener('click', event => {
  const target = event.target.closest('button'); if (!target) return;
  if (target.matches('[data-copy-url]')) {
    navigator.clipboard.writeText(target.dataset.copyUrl).then(() => showToast('Nuoroda nukopijuota')).catch(() => showToast('Nepavyko nukopijuoti'));
  }
  if (target.matches('[data-share-recipe]')) {
    const recipe = recipes.find(item => item.id === target.dataset.shareRecipe);
    if (recipe) shareRecipe(recipe);
  }
  if (target.matches('[data-pantry-suggestion]')) {
    if (addToPantry(target.dataset.pantrySuggestion, translateIngredient(target.dataset.pantrySuggestion))) { renderPantry(); renderShopping(); }
  }
  if (target.matches('[data-pantry-remove]')) {
    pantry = pantry.filter(item => item.key !== target.dataset.pantryRemove); save(); renderPantry();
  }
  if (target.matches('[data-dictionary-reset]')) {
    delete customTranslations[target.dataset.dictionaryReset]; saveDictionary(); renderDictionary(); renderShopping();
    showToast('Grąžintas pradinis vertimas');
  }
  if (target.matches('[data-open-recipe]')) location.hash = `#recipe/${target.dataset.openRecipe}`;
  if (target.matches('[data-filter]')) { activeFilter = target.dataset.filter; renderRecipes(); }
  if (target.matches('[data-pin-recipe]')) {
    const recipe = recipes.find(item => item.id === target.dataset.pinRecipe);
    if (recipe) { recipe.pinned = !recipe.pinned; save(); renderRecipes(); showToast(recipe.pinned ? 'Receptas prisegtas viršuje' : 'Receptas atsegtas'); }
  }
  if (target.matches('[data-quick-cart]')) { const recipe = recipes.find(item => item.id === target.dataset.quickCart); if (recipe) addRecipeToCart(recipe); }
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
  if (event.target.matches('[data-dictionary-input]')) {
    const key = event.target.dataset.dictionaryInput; const value = event.target.value.trim();
    if (value) customTranslations[key] = value; else delete customTranslations[key];
    saveDictionary(); renderShopping(); showToast(value ? 'Vertimas išsaugotas' : 'Grąžintas pradinis vertimas');
  }
});

document.addEventListener('pointerdown', event => {
  const button = event.target.closest('[data-pantry-from]');
  if (!button) return;
  event.preventDefault(); startPantryHold(button, event);
});
document.addEventListener('pointermove', event => {
  if (!pantryHold || event.pointerId !== pantryHold.pointerId) return;
  if (Math.hypot(event.clientX - pantryHold.startX, event.clientY - pantryHold.startY) > 35) cancelPantryHold();
});
document.addEventListener('pointerup', event => { if (pantryHold?.pointerId === event.pointerId) cancelPantryHold(); });
document.addEventListener('pointercancel', event => { if (pantryHold?.pointerId === event.pointerId) cancelPantryHold(); });
document.addEventListener('contextmenu', event => { if (event.target.closest('[data-pantry-from]')) event.preventDefault(); });

window.addEventListener('hashchange', route);
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('./sw.js?v=22', { updateViaCache: 'none' });
    registration.update();
  });
}
migrateLegacyIngredientNames();
if (pendingSharedUrl && location.hash !== '#add') location.hash = '#add';
route();
hydrateMissingImages();
