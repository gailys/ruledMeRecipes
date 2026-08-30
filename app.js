import { createSyncEngine, hasSession, loginWithPassword, validateRecipeUrls } from './sync.js?v=40';

const STORAGE = { recipes: 'keto-recipes-v1', cart: 'keto-cart-v1', pantry: 'keto-pantry-v1', dictionary: 'keto-translation-dictionary-v1', users: 'keto-users-v1', currentUser: 'keto-current-user-v1', userRecipes: 'keto-user-recipes-v1', userRecipeRefs: 'keto-user-recipe-refs-v1', userCarts: 'keto-user-carts-v1', userPins: 'keto-user-pins-v1', userPantries: 'keto-user-pantries-v1' };
const APP_URL = 'https://gailys.github.io/ruledMeRecipes/';
const pantrySuggestions = [];

const translations = {
  "5 minute keto raspberry vinaigrette": "5 minučių keto aviečių užpilas",
  "all-purpose seasoning": "universalus prieskonių mišinys",
  "allspice": "kvapieji pipirai",
  "allulose": "aliuliozė",
  "almond butter": "migdolų sviestas",
  "almond extract": "migdolų ekstraktas",
  "almond flour": "migdolų miltai",
  "almonds": "migdolai",
  "ancho chile powder": "ančo aitriųjų paprikų milteliai",
  "apple cider vinegar": "obuolių actas",
  "avocado": "avokadas",
  "avocado meat": "avokado minkštimas",
  "avocado oil": "avokadų aliejus",
  "baby kale": "jauni lapiniai kopūstai",
  "bacon": "šoninė",
  "baking powder": "kepimo milteliai",
  "baking soda": "valgomoji soda",
  "banana extract": "bananų ekstraktas",
  "basil": "bazilikas",
  "bbq sauce": "BBQ padažas",
  "beef broth": "jautienos sultinys",
  "beef stew meat": "troškinti skirta jautiena",
  "black olives": "juodosios alyvuogės",
  "black pepper": "juodieji pipirai",
  "blackberries": "gervuogės",
  "blue cheese": "mėlynasis sūris",
  "blueberries": "mėlynės",
  "blueberry extract": "mėlynių ekstraktas",
  "bok choy": "kiniškas bastutis",
  "bone-in oxtails": "jaučio uodegos su kaulu",
  "bone-in, skin-on pork shoulder": "kiaulienos mentė su kaulu ir oda",
  "boneless pork chops": "kiaulienos kepsneliai be kaulo",
  "bonito flakes": "bonito dribsniai",
  "breakfast sausage": "pusryčių dešrelės",
  "brewed coffee": "paruošta kava",
  "brie cheese": "bri sūris",
  "broccoli": "brokoliai",
  "broccoli slaw": "brokolių salotų mišinys",
  "brussels sprouts": "briuseliniai kopūstai",
  "butter": "sviestas",
  "button mushrooms": "pievagrybiai",
  "cacao nibs": "kakavos pupelių gabalėliai",
  "can hearts of palm": "konservuotos palmių šerdys",
  "canned pink salmon": "konservuota rausvoji lašiša",
  "canned sardines": "konservuotos sardinės",
  "canned sardines )": "konservuotos sardinės",
  "canned tuna": "konservuotas tunas",
  "canned whole tomatoes": "konservuoti sveiki pomidorai",
  "capers": "kaparėliai",
  "cardamom": "kardamonas",
  "carrot": "morka",
  "cauliflower": "žiedinis kopūstas",
  "cauliflower rice": "smulkintas žiedinis kopūstas",
  "cayenne pepper": "Kajeno pipirai",
  "celery": "salieras",
  "cheddar cheese": "čederio sūris",
  "cherry tomatoes": "vyšniniai pomidorai",
  "chia seeds": "ispaninio šalavijo sėklos",
  "chicken breast": "vištienos krūtinėlė",
  "chicken broth": "vištienos sultinys",
  "chicken thighs": "vištienos šlaunelės",
  "chili paste": "aitriųjų paprikų pasta",
  "chili powder": "aitriųjų paprikų milteliai",
  "chili-garlic paste": "aitriųjų paprikų ir česnakų pasta",
  "chipotle seasoning": "čipotlių prieskoniai",
  "cilantro": "kalendra",
  "cloves": "gvazdikėliai",
  "cocoa powder": "kakavos milteliai",
  "coconut aminos": "kokosų aminorūgščių padažas",
  "coconut flour": "kokosų miltai",
  "coconut milk": "kokosų pienas",
  "coconut oil": "kokosų aliejus",
  "cooked chicken": "virta arba kepta vištiena",
  "cooking spray": "kepimo aliejaus purškalas",
  "cottage cheese": "grūdėta varškė",
  "cream cheese": "kreminis sūris",
  "cream of tartar": "vyno akmens milteliai",
  "cremini mushrooms": "rudieji pievagrybiai",
  "cucumber": "agurkas",
  "cumin": "kuminas",
  "curry powder": "kario milteliai",
  "deli sliced turkey": "pjaustyta kalakutiena",
  "deli-sliced black forest ham": "pjaustytas Švarcvaldo kumpis",
  "dijon mustard": "Dižono garstyčios",
  "dill pickle": "marinuotas agurkas",
  "dried basil": "džiovintas bazilikas",
  "dried dill": "džiovinti krapai",
  "dried rosemary": "džiovintas rozmarinas",
  "drop peppermint extract": "lašas pipirmėčių ekstrakto",
  "dry red wine": "sausas raudonasis vynas",
  "egg": "kiaušinis",
  "egg white": "kiaušinio baltymas",
  "eggplant": "baklažanas",
  "erythritol": "eritritolis",
  "extra firm tofu": "labai kietas tofu",
  "feta cheese": "fetos sūris",
  "fish sauce": "žuvies padažas",
  "flaxseed meal": "malti linų sėmenys",
  "fresh basil": "šviežias bazilikas",
  "fresh chives": "šviežūs laiškiniai česnakai",
  "fresh dill": "švieži krapai",
  "fresh mint": "šviežios mėtos",
  "fresh tomatoes": "švieži pomidorai",
  "frozen berries": "šaldytos uogos",
  "frozen broccoli": "šaldyti brokoliai",
  "frozen cauliflower": "šaldytas žiedinis kopūstas",
  "frozen spinach": "šaldyti špinatai",
  "full-fat plain greek yogurt": "natūralus riebus graikiškas jogurtas",
  "garlic": "česnakas",
  "garlic and herb seasoning": "česnakų ir žolelių prieskoniai",
  "garlic powder": "česnakų milteliai",
  "gelatin": "želatina",
  "ginger": "imbieras",
  "goat cheese": "ožkų sūris",
  "green beans": "šparaginės pupelės",
  "green bell pepper": "žalioji paprika",
  "green cabbage": "žaliasis kopūstas",
  "green onion": "svogūnų laiškai",
  "ground beef": "malta jautiena",
  "ground cinnamon": "maltas cinamonas",
  "ground coriander": "maltos kalendrų sėklos",
  "ground lamb": "malta aviena",
  "ground mild italian sausage": "malta švelni itališka dešra",
  "ground turkey": "malta kalakutiena",
  "gruyere cheese": "griujerio sūris",
  "guar gum": "guaro derva",
  "half-and-half": "grietinėlės ir pieno mišinys",
  "ham": "kumpis",
  "heavy cream": "riebi grietinėlė",
  "hemp hearts": "lukštentos kanapių sėklos",
  "hemp seeds": "kanapių sėklos",
  "hoisin sauce": "hoisin padažas",
  "hot dogs": "dešrainių dešrelės",
  "hot sauce": "aštrus padažas",
  "ice cubes": "ledo kubeliai",
  "ice water": "ledinis vanduo",
  "iceberg lettuce": "aisbergo salotos",
  "instant coffee": "tirpi kava",
  "italian dressing": "itališkas salotų padažas",
  "italian dry salami": "itališkas vytintas saliamis",
  "italian seasoning": "itališkų žolelių mišinys",
  "jalapeno pepper": "chalapos paprika",
  "kosher salt": "košerinė druska",
  "lard": "kiaulienos taukai",
  "leafy greens": "lapinės daržovės",
  "leek": "poras",
  "lemon": "citrina",
  "lemon extract": "citrinų ekstraktas",
  "lemon juice": "citrinų sultys",
  "lemon zest": "citrinos žievelė",
  "lime": "žalioji citrina",
  "lime juice": "žaliųjų citrinų sultys",
  "lime zest": "žaliosios citrinos žievelė",
  "liquid smoke": "skysti dūmai",
  "liquid stevia": "skysta stevija",
  "lit'l smokies": "mažos rūkytos dešrelės",
  "low-carb chocolate protein powder": "mažai angliavandenių turintys šokoladiniai baltymų milteliai",
  "low-carb dark chocolate": "mažai angliavandenių turintis juodasis šokoladas",
  "low-carb dark chocolate chips": "mažai angliavandenių turintys juodojo šokolado lašeliai",
  "low-carb ketchup": "mažai angliavandenių turintis kečupas",
  "low-carb maple syrup": "mažai angliavandenių turintis klevų sirupas",
  "low-carb milk chocolate": "mažai angliavandenių turintis pieniškas šokoladas",
  "low-carb protein powder": "mažai angliavandenių turintys baltymų milteliai",
  "low-carb tomato sauce": "mažai angliavandenių turintis pomidorų padažas",
  "macadamia nuts": "makadamijų riešutai",
  "mango extract": "mangų ekstraktas",
  "marinated artichoke hearts": "marinuotos artišokų šerdys",
  "mayonnaise": "majonezas",
  "mct oil": "MCT aliejus",
  "mexican squash": "meksikietiška cukinija",
  "mixed greens": "lapinių daržovių mišinys",
  "monterey jack cheese": "Monterėjaus Džeko sūris",
  "mozzarella cheese": "mocarelos sūris",
  "mushrooms": "grybai",
  "nori flakes": "nori dribsniai",
  "nutmeg": "muskato riešutas",
  "old bay seasoning": "„Old Bay“ prieskonių mišinys",
  "olive oil": "alyvuogių aliejus",
  "onion": "svogūnas",
  "onion powder": "svogūnų milteliai",
  "orange bell pepper": "oranžinė paprika",
  "orange extract": "apelsinų ekstraktas",
  "oregano": "raudonėlis",
  "paprika": "paprikos milteliai",
  "parmesan cheese": "parmezano sūris",
  "parsley": "petražolės",
  "peanut butter": "žemės riešutų sviestas",
  "peanut butter powder": "žemės riešutų sviesto milteliai",
  "peanuts": "žemės riešutai",
  "pecans": "pekano riešutai",
  "pepper jack cheese": "pipirinis Monterėjaus Džeko sūris",
  "pepperoni": "peperonis",
  "pesto": "pesto padažas",
  "pimento peppers": "pimento paprikos",
  "poppy seeds": "aguonos",
  "pork rinds": "kiaulienos odelių traškučiai",
  "pork tenderloin": "kiaulienos išpjova",
  "portobello mushrooms": "portobelo grybai",
  "powdered erythritol": "eritritolio pudra",
  "prosciutto": "vytintas kumpis prosciutto",
  "provolone cheese": "provolonės sūris",
  "psyllium husk powder": "gysločių luobelių milteliai",
  "pumpkin pie spice": "moliūgų pyrago prieskonių mišinys",
  "pumpkin puree": "moliūgų tyrė",
  "pumpkin seeds": "moliūgų sėklos",
  "queso fresco": "šviežias meksikietiškas sūris",
  "radish": "ridikėlis",
  "ranch seasoning": "rančos prieskonių mišinys",
  "raspberries": "avietės",
  "red bell pepper": "raudonoji paprika",
  "red onion": "raudonasis svogūnas",
  "red pepper flakes": "aitriųjų paprikų dribsniai",
  "red wine vinegar": "raudonojo vyno actas",
  "ribeye steak": "antrekoto kepsnys",
  "rice vinegar": "ryžių actas",
  "ricotta cheese": "rikotos sūris",
  "roasted pine nuts": "skrudinti kedrinių pinijų riešutai",
  "roasted red pepper": "kepta raudonoji paprika",
  "romaine lettuce": "romaninių salotų lapai",
  "rotisserie chicken": "ant iešmo kepta vištiena",
  "round cinnamon": "maltas cinamonas",
  "ruled.me bbq sauce": "„Ruled.me“ BBQ padažas",
  "rum": "romas",
  "salmon": "lašiša",
  "salsa": "salsos padažas",
  "salt": "druska",
  "salt and pepper": "druska ir pipirai",
  "sesame oil": "sezamų aliejus",
  "sesame seeds": "sezamų sėklos",
  "shaved parmesan": "plonai pjaustytas parmezanas",
  "shiitake mushrooms": "šitakių grybai",
  "shredded coconut": "kokosų drožlės",
  "shredded mozzarella": "tarkuota mocarela",
  "shrimp": "krevetės",
  "slivered almonds": "migdolų lazdelės",
  "smoked paprika": "rūkytos paprikos milteliai",
  "smoked salmon": "rūkyta lašiša",
  "sour cream": "grietinė",
  "soy sauce": "sojų padažas",
  "spaghetti squash": "spagetinis moliūgas",
  "spinach": "špinatai",
  "sriracha": "sriracha padažas",
  "strawberries": "braškės",
  "sugar-free drink mix": "gėrimo mišinys be cukraus",
  "sugar-free salted caramel syrup": "sūrios karamelės sirupas be cukraus",
  "sugar-free strawberry syrup": "braškių sirupas be cukraus",
  "sun-dried tomato pesto": "saulėje džiovintų pomidorų pesto",
  "sun-dried tomatoes": "saulėje džiovinti pomidorai",
  "sunflower seeds": "saulėgrąžų sėklos",
  "sweetener": "saldiklis",
  "swiss cheese": "šveicariškas sūris",
  "tahini": "sezamų pasta tahini",
  "tequila": "tekila",
  "thyme": "čiobreliai",
  "tomato paste": "pomidorų pasta",
  "toothpicks": "dantų krapštukai",
  "truffle oil": "triufelių aliejus",
  "turmeric powder": "ciberžolės milteliai",
  "tzatziki": "tzatziki padažas",
  "unflavored low-carb protein powder": "beskoniai mažai angliavandenių turintys baltymų milteliai",
  "unsweetened almond milk": "nesaldintas migdolų pienas",
  "vanilla extract": "vanilės ekstraktas",
  "vegan vanilla protein powder": "veganiški vaniliniai baltymų milteliai",
  "walnuts": "graikiniai riešutai",
  "water": "vanduo",
  "white vinegar": "baltasis actas",
  "whole black olives": "sveikos juodosios alyvuogės",
  "whole chicken bouillon cube": "vištienos sultinio kubelis",
  "whole grain mustard": "viso grūdo garstyčios",
  "whole green olive": "sveika žalioji alyvuogė",
  "whole green tea with bags": "žaliosios arbatos pakeliai",
  "whole ice cubes": "ledo kubeliai",
  "whole milk": "nenugriebtas pienas",
  "whole nori sheets": "nesmulkinti nori lapai",
  "worcestershire sauce": "Vusterio padažas",
  "xanthan gum": "ksantano derva",
  "xylitol": "ksilitolis",
  "yellow mustard": "geltonosios garstyčios",
  "yellow onion": "geltonasis svogūnas",
  "zucchini": "cukinija"
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

// Approximate grams in one US recipe cup. Ingredient-specific values avoid the
// inaccurate assumption that every 240 ml cup weighs 240 g.
const CUP_GRAMS = {
  'almond flour': 96, 'coconut flour': 112, 'flaxseed meal': 112, 'psyllium husk powder': 80,
  erythritol: 200, 'erythritol or xylitol': 200, xylitol: 215, sweetener: 200, 'cocoa powder': 85, 'protein powder': 100,
  butter: 227, 'peanut butter': 258, mayonnaise: 230, 'sour cream': 230, 'cream cheese': 232,
  'cheddar cheese': 113, 'mozzarella cheese': 112, 'parmesan cheese': 100, 'blue cheese crumbled': 135,
  almonds: 143, pecans: 109, walnuts: 117, 'macadamia nuts': 134, 'pork rinds': 32,
  blueberries: 148, raspberries: 123, strawberries: 152, 'cherry tomatoes': 149, 'sundried tomatoes': 110,
  broccoli: 91, cauliflower: 107, spinach: 30, kale: 67, 'romaine lettuce': 47, cabbage: 89,
  mushrooms: 70, 'cremini mushrooms': 70, cucumber: 104, zucchini: 124, onion: 160,
  'red bell pepper': 149, 'green bell pepper': 149, 'egg white': 243, 'shredded coconut': 85,
};
const CUP_LIQUIDS = new Set(['water', 'whole milk', 'coconut milk', 'almond milk', 'heavy cream', 'halfandhalf', 'chicken broth', 'beef broth', 'vegetable broth', 'olive oil', 'avocado oil', 'coconut oil', 'soy sauce', 'hot sauce', 'lemon juice', 'lime juice', 'apple cider vinegar', 'rice vinegar']);

let recipes = load(STORAGE.recipes, []);
let cart = load(STORAGE.cart, []);
let pantry = load(STORAGE.pantry, []);
let customTranslations = load(STORAGE.dictionary, {});
let users = load(STORAGE.users, []);
let currentUserId = localStorage.getItem(STORAGE.currentUser) || '';
let userRecipes = load(STORAGE.userRecipes, {});
let userRecipeRefs = load(STORAGE.userRecipeRefs, {});
let userCarts = load(STORAGE.userCarts, {});
let userPins = load(STORAGE.userPins, {});
let userPantries = load(STORAGE.userPantries, {});
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
let applyingRemoteStore = false;
let batchImportInProgress = false;
let syncEngine;

if (currentUserId && !userRecipeRefs[currentUserId] && recipes.length) userRecipeRefs[currentUserId] = recipes.map(recipe => recipe.url);

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function save() {
  persistActiveUserState();
  localStorage.setItem(STORAGE.recipes, JSON.stringify(recipes));
  localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
  localStorage.setItem(STORAGE.pantry, JSON.stringify(pantry));
  localStorage.setItem(STORAGE.users, JSON.stringify(users));
  updateCounts();
  if (!applyingRemoteStore && !batchImportInProgress) syncEngine?.changed();
}

function persistActiveUserState() {
  if (!currentUserId) return;
  userRecipes[currentUserId] = recipes;
  userCarts[currentUserId] = cart;
  userPins[currentUserId] = recipes.filter(recipe => recipe.pinned).map(recipe => recipe.url.replace(/\/$/, '').toLowerCase());
  userPantries[currentUserId] = pantry;
  localStorage.setItem(STORAGE.userRecipes, JSON.stringify(userRecipes));
  localStorage.setItem(STORAGE.userCarts, JSON.stringify(userCarts));
  localStorage.setItem(STORAGE.userPins, JSON.stringify(userPins));
  localStorage.setItem(STORAGE.userPantries, JSON.stringify(userPantries));
}

function loadActiveUserState(id) {
  recipes = userRecipes[id] || [];
  cart = userCarts[id] || [];
  pantry = userPantries[id] || [];
  const pins = new Set(userPins[id] || []);
  recipes.forEach(recipe => { recipe.pinned = pins.has(recipe.url.replace(/\/$/, '').toLowerCase()); });
}

function saveDictionary() {
  localStorage.setItem(STORAGE.dictionary, JSON.stringify(customTranslations));
  if (!applyingRemoteStore) syncEngine?.changed();
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
  const consolidated = consolidateCart(cart);
  if (consolidated.changed) { cart = consolidated.items; changed = true; }
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
  if (/^(cup|cups)$/.test(unit)) {
    const key = item.key || ingredientKey(item.name);
    if (CUP_GRAMS[key]) return `≈ ${roundedMetric(quantity * CUP_GRAMS[key])} g`;
    if (CUP_LIQUIDS.has(key) || /(?:oil|milk|broth|juice|vinegar|sauce)$/.test(key)) return `${roundedMetric(quantity * 240)} ml`;
    return `${formatNumber(quantity)} ${Math.abs(quantity - 1) < .001 ? 'puodelis' : 'puodelio'}`;
  }
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

function ingredientForm(name = '') {
  const value = name.toLowerCase();
  return ['fresh', 'dried', 'ground', 'powdered'].find(form => new RegExp(`\\b${form}\\b`).test(value)) || '';
}

function measurement(unit = '') {
  const key = unitKey(unit);
  const units = {
    cup: ['volume', 240], tablespoon: ['volume', 15], teaspoon: ['volume', 5], 'fluid ounce': ['volume', 29.5735], milliliter: ['volume', 1],
    ounce: ['weight', 28.3495], pound: ['weight', 453.592], gram: ['weight', 1],
  };
  return units[key] ? { key, family: units[key][0], factor: units[key][1] } : { key, family: key, factor: 1 };
}

function consolidateCart(items) {
  const result = []; let changed = false;
  for (const item of items) {
    const current = { ...item, key: item.key || ingredientKey(item.name) };
    const measure = measurement(current.unit);
    const existing = current.quantity == null ? null : result.find(entry => entry.key === current.key && ingredientForm(entry.name) === ingredientForm(current.name) && entry.quantity != null && measurement(entry.unit).family === measure.family);
    if (!existing) { result.push(current); continue; }
    const existingMeasure = measurement(existing.unit);
    let targetKey = existingMeasure.key;
    if (measure.family === 'volume' && (existingMeasure.key === 'cup' || measure.key === 'cup')) targetKey = 'cup';
    else if (measure.family === 'volume' && (existingMeasure.key === 'tablespoon' || measure.key === 'tablespoon')) targetKey = 'tablespoon';
    else if (measure.family === 'weight' && (existingMeasure.key === 'ounce' || measure.key === 'ounce')) targetKey = 'ounce';
    else if (measure.family === 'weight') targetKey = 'gram';
    const target = measurement(targetKey);
    existing.quantity = (existing.quantity * existingMeasure.factor + current.quantity * measure.factor) / target.factor;
    existing.unit = targetKey; existing.quantityRaw = ''; changed = true;
  }
  return { items: result, changed };
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
  const user = users.find(item => item.id === currentUserId);
  $('#current-user').hidden = !user;
  $('#current-user').textContent = user ? `● ${user.name}` : '';
}

function syncStore() {
  persistActiveUserState();
  return {
    users,
    recipes: Object.entries(userRecipeRefs).flatMap(([userId, urls]) => urls.map(recipeUrl => { const url = recipeUrl.replace(/\/$/, '').toLowerCase(); return { id: `${userId}:${url}`, userId, url: recipeUrl }; })),
    cart: Object.entries(userCarts).flatMap(([userId, items]) => items.map(item => ({ id: `${userId}:${item.id}`, userId, item }))),
    pins: Object.entries(userPins).flatMap(([userId, urls]) => urls.map(url => ({ id: `${userId}:${url}`, userId, url }))),
    pantry: Object.entries(userPantries).flatMap(([userId, items]) => items.map(item => ({ id: `${userId}:${item.key}`, userId, item }))),
    translations: Object.entries(customTranslations).map(([id, value]) => ({ id, value })),
  };
}

async function applySyncedStore(store) {
  applyingRemoteStore = true; let cartConsolidated = false;
  users = store.users || [];
  if (currentUserId && !users.some(item => item.id === currentUserId)) { currentUserId = ''; localStorage.removeItem(STORAGE.currentUser); }
  userCarts = {};
  for (const record of store.cart || []) {
    const userId = record.userId || currentUserId; if (!userId) continue;
    (userCarts[userId] ||= []).push(record.item || record);
  }
  for (const userId of Object.keys(userCarts)) {
    const consolidated = consolidateCart(userCarts[userId]); userCarts[userId] = consolidated.items;
    cartConsolidated ||= consolidated.changed;
  }
  userPins = {};
  for (const record of store.pins || []) {
    const userId = record.userId || currentUserId; if (!userId || !record.url) continue;
    (userPins[userId] ||= []).push(record.url);
  }
  userPantries = {};
  for (const record of store.pantry || []) {
    if (!record.userId || !record.item) continue;
    (userPantries[record.userId] ||= []).push(record.item);
  }
  const recipeRefs = {};
  for (const record of store.recipes || []) {
    if (!record.userId || !record.url) continue;
    (recipeRefs[record.userId] ||= []).push(record);
  }
  userRecipeRefs = Object.fromEntries(Object.entries(recipeRefs).map(([userId, refs]) => [userId, refs.map(item => item.url)]));
  localStorage.setItem(STORAGE.userRecipeRefs, JSON.stringify(userRecipeRefs));
  for (const userId of Object.keys(userRecipes)) {
    if (batchImportInProgress && userId === currentUserId) continue;
    const urls = new Set((recipeRefs[userId] || []).map(item => item.url.replace(/\/$/, '').toLowerCase()));
    userRecipes[userId] = (userRecipes[userId] || []).filter(recipe => urls.has(recipe.url.replace(/\/$/, '').toLowerCase()));
  }
  for (const userId of Object.keys(recipeRefs)) userRecipes[userId] ||= [];
  localStorage.setItem(STORAGE.userRecipes, JSON.stringify(userRecipes));
  localStorage.setItem(STORAGE.userCarts, JSON.stringify(userCarts));
  localStorage.setItem(STORAGE.userPins, JSON.stringify(userPins));
  localStorage.setItem(STORAGE.userPantries, JSON.stringify(userPantries));
  customTranslations = Object.fromEntries((store.translations || []).map(item => [item.id, item.value]));
  if (currentUserId) loadActiveUserState(currentUserId);
  else cart = [];
  localStorage.setItem(STORAGE.dictionary, JSON.stringify(customTranslations)); save(); applyingRemoteStore = false;
  for (const reference of batchImportInProgress ? [] : (recipeRefs[currentUserId] || [])) {
    if (recipes.some(recipe => recipe.url.replace(/\/$/, '').toLowerCase() === reference.url.replace(/\/$/, '').toLowerCase())) continue;
    try {
      const recipe = await fetchRecipe(reference.url); applyingRemoteStore = true; recipes.push(recipe); userRecipes[currentUserId] = recipes; save(); applyingRemoteStore = false; renderRecipes();
    } catch { showToast('Vieno recepto nepavyko parsiųsti į šį telefoną'); }
  }
  if (cartConsolidated) syncEngine?.changed();
  route({ preserveScroll: true }); updateCounts();
}

function renderUsers() {
  $('#users-list').innerHTML = users.length ? users.map(user => `<div class="user-row"><button class="user-choice" data-user-choice="${user.id}"><span class="user-choice-avatar">${escapeHtml(user.name.slice(0, 1).toUpperCase())}</span><span>${escapeHtml(user.name)}</span></button><button class="user-delete" data-user-delete="${user.id}" type="button" aria-label="Ištrinti vartotoją ${escapeHtml(user.name)}" title="Ištrinti vartotoją">×</button></div>`).join('') : '<div class="empty">Vartotojų dar nėra. Sukurkite pirmą profilį.</div>';
  $('#users-cancel').hidden = !currentUserId;
}

function showUserChooser() {
  renderUsers(); const dialog = $('#users-dialog'); if (!dialog.open) dialog.showModal();
}

function chooseUser(id) {
  const user = users.find(item => item.id === id); if (!user) return;
  persistActiveUserState(); currentUserId = id; loadActiveUserState(id);
  localStorage.setItem(STORAGE.currentUser, id); save(); $('#users-dialog').close(); route(); updateCounts(); showToast(`Pasirinktas vartotojas: ${user.name}`);
}

function deleteUser(id) {
  const user = users.find(item => item.id === id); if (!user) return;
  if (!confirm(`Ištrinti vartotoją „${user.name}“? Bus pašalinti jo receptai, prisegimai, pirkinių sąrašas ir turimi produktai.`)) return;
  users = users.filter(item => item.id !== id);
  delete userRecipes[id]; delete userRecipeRefs[id]; delete userCarts[id]; delete userPins[id]; delete userPantries[id];
  for (const [key, value] of [[STORAGE.userRecipes, userRecipes], [STORAGE.userRecipeRefs, userRecipeRefs], [STORAGE.userCarts, userCarts], [STORAGE.userPins, userPins], [STORAGE.userPantries, userPantries]]) localStorage.setItem(key, JSON.stringify(value));
  if (currentUserId === id) { currentUserId = ''; recipes = []; cart = []; pantry = []; localStorage.removeItem(STORAGE.currentUser); }
  save(); syncEngine?.syncNow(); renderUsers(); route(); showToast(`Vartotojas „${user.name}“ ištrintas`);
}

function requireLogin() {
  const dialog = $('#login-dialog'); if (!dialog.open) dialog.showModal();
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

function recipeAmount(item, servings, originalServings) {
  const unit = unitKey(item.unit);
  if (item.quantity == null) return [item.quantityRaw, item.unit].filter(Boolean).join(' ');
  const quantity = item.quantity * servings / originalServings;
  if (unit === 'ounce') return `${roundedMetric(quantity * 28.3495)} g`;
  if (unit === 'pound') return `${roundedMetric(quantity * 453.592)} g`;
  if (unit === 'fluid ounce') return `${roundedMetric(quantity * 29.5735)} ml`;
  if (unit === 'gram') return `${roundedMetric(quantity)} g`;
  if (unit === 'milliliter') return `${roundedMetric(quantity)} ml`;
  if (unit === 'cup') return `${formatNumber(quantity)} puod.`;
  if (unit === 'tablespoon') return `${formatNumber(quantity)} valg. š.`;
  if (unit === 'teaspoon') return `${formatNumber(quantity)} arb. š.`;
  const unitLt = { liter: 'l', liters: 'l', large: 'didelis', medium: 'vidutinis', small: 'mažas', clove: 'skilt.', cloves: 'skilt.', slice: 'riek.', slices: 'riek.' }[unit] || item.unit;
  return `${formatNumber(quantity)}${unitLt ? ` ${unitLt}` : ''}`;
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
        <span class="ingredient-qty">${escapeHtml(recipeAmount(item, servings, recipe.servings))}</span>
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
  cart = consolidateCart(cart).items;
  save(); syncEngine?.syncNow(); showToast(`${needed.length} produktai pridėti${selected.length !== needed.length ? ` · ${selected.length - needed.length} turite` : ''}`);
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
  cart = consolidateCart(cart).items;
  save(); syncEngine?.syncNow(); showToast(`${needed.length} produktai pridėti${items.length !== needed.length ? ` · ${items.length - needed.length} turite` : ''}`);
}

const SHOPPING_CATEGORIES = ['Mėsa ir žuvis', 'Pieno produktai ir kiaušiniai', 'Daržovės', 'Vaisiai ir uogos', 'Prieskoniai ir žolelės', 'Padažai ir aliejai', 'Kepimo produktai', 'Riešutai ir sėklos', 'Kita'];

function shoppingCategory(item) {
  const key = item.key || ingredientKey(item.name);
  if (/(?:chicken|beef|pork|bacon|ham|turkey|sausage|hot dogs|salmon|tuna|shrimp|fish|anchov|bonito)/.test(key) && !/broth/.test(key)) return 'Mėsa ir žuvis';
  if (/(?:cheese|butter|cream|milk|yogurt|egg)/.test(key) && !/(?:peanut|coconut milk|almond milk)/.test(key)) return 'Pieno produktai ir kiaušiniai';
  if (/(?:broccoli|cauliflower|cabbage|green beans|onion|garlic|cucumber|zucchini|mushroom|lettuce|spinach|kale|tomato|avocado|bell pepper|celery|asparagus|radish|eggplant)/.test(key)) return 'Daržovės';
  if (/(?:blueberr|raspberr|strawberr|blackberr|cranberr|lemon|lime|orange|apple|coconut)/.test(key) && !/(?:oil|flour|milk)/.test(key)) return 'Vaisiai ir uogos';
  if (/(?:salt|black pepper|red pepper flakes|paprika|allspice|cloves|cinnamon|nutmeg|oregano|thyme|parsley|cilantro|seasoning|garlic powder|onion powder|ginger)/.test(key)) return 'Prieskoniai ir žolelės';
  if (/(?:oil|sauce|vinegar|mustard|mayonnaise|salsa|broth|juice|vinaigrette)/.test(key)) return 'Padažai ir aliejai';
  if (/(?:flour|baking|erythritol|xylitol|sweetener|stevia|extract|cocoa|chocolate|psyllium|protein powder)/.test(key)) return 'Kepimo produktai';
  if (/(?:almond|pecan|walnut|macadamia|peanut|seed|flax|pork rinds|nori)/.test(key)) return 'Riešutai ir sėklos';
  return 'Kita';
}

function hideShoppingQuantity(item) {
  const category = shoppingCategory(item);
  const key = item.key || ingredientKey(item.name);
  return category === 'Prieskoniai ir žolelės' || category === 'Riešutai ir sėklos' || /(?:stevia|extract|food coloring|xanthan gum|yeast|baking powder|baking soda)/.test(key);
}

function shoppingItemHtml(item) {
  const hideQuantity = hideShoppingQuantity(item);
  return `<div class="shopping-item ${item.done ? 'done' : ''} ${hideQuantity ? 'no-quantity' : ''}">
      <input type="checkbox" data-cart-check="${item.id}" ${item.done ? 'checked' : ''} aria-label="Pažymėti nupirktu" />
      ${hideQuantity ? '' : `<span class="shop-qty">${escapeHtml(metricAmount(item))}</span>`}
      <span class="shop-name">${escapeHtml(translateIngredient(item.name))}<small>${escapeHtml(item.name)}</small></span>
      <button class="have-at-home" data-pantry-from="${item.id}">Visada turiu</button>
      <button class="remove" data-cart-remove="${item.id}" aria-label="Pašalinti">×</button>
    </div>`;
}

function manualCartItem(name, amount) {
  const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
  const translatedMatch = [...Object.entries(customTranslations), ...Object.entries(translations)].find(([, lithuanian]) => lithuanian.toLowerCase() === normalized);
  const englishName = translatedMatch?.[0] || name;
  const match = amount.trim().replace(',', '.').match(/^(\d+(?:\.\d+)?)\s*(kg|g|l|ml|vnt\.?)?$/i);
  let quantity = null; let quantityRaw = amount.trim(); let unit = '';
  if (match) {
    quantity = Number(match[1]); unit = (match[2] || '').toLowerCase(); quantityRaw = match[1];
    if (unit === 'kg') { quantity *= 1000; unit = 'grams'; }
    else if (unit === 'g') unit = 'grams';
    else if (unit === 'l') unit = 'liters';
    else if (unit === 'ml') unit = 'milliliters';
    else if (/^vnt/.test(unit)) unit = '';
  }
  return { id: crypto.randomUUID(), key: ingredientKey(englishName), quantity, quantityRaw, unit, name: englishName, translated: translatedMatch ? name : translateIngredient(englishName), done: false, manual: true };
}

function renderShopping() {
  const list = $('#shopping-list');
  if (!cart.length) list.innerHTML = '<div class="empty"><strong>Pirkinių sąrašas tuščias.</strong><br>Atidarykite receptą ir pridėkite reikalingus ingredientus.</div>';
  else {
    const groups = cart.reduce((result, item) => { (result[shoppingCategory(item)] ||= []).push(item); return result; }, {});
    list.innerHTML = SHOPPING_CATEGORIES.filter(category => groups[category]?.length).map(category => `<section class="shopping-group"><h2 class="shopping-group-title">${category}<span>${groups[category].length}</span></h2><div class="shopping-group-items">${groups[category].map(shoppingItemHtml).join('')}</div></section>`).join('');
  }
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

function route(options = {}) {
  const previousScroll = window.scrollY;
  const preserveScroll = options.preserveScroll === true;
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
  if (preserveScroll) requestAnimationFrame(() => scrollTo({ top: previousScroll, behavior: 'instant' }));
  else scrollTo({ top: 0, behavior: 'instant' });
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
  button.classList.add('holding'); button.textContent = 'Laikykite 2 s';
  button.setPointerCapture?.(event.pointerId);
  const state = { button, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
  state.interval = setInterval(() => {
    const remaining = Math.max(1, Math.ceil((2000 - (Date.now() - startedAt)) / 1000));
    if (button.isConnected) button.textContent = `Laikykite ${remaining} s`;
  }, 150);
  state.timeout = setTimeout(() => {
    const item = cart.find(entry => entry.id === button.dataset.pantryFrom);
    clearInterval(state.interval); pantryHold = null;
    if (item && addToPantry(item.name, translateIngredient(item.name))) {
      renderShopping(); showToast('Pridėta prie turimų namuose');
    }
  }, 2000);
  pantryHold = state;
}

$('#import-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('button[type="submit"]', event.currentTarget); const status = $('#import-status');
  const urls = [...new Set(($('#recipe-url').value.match(/https?:\/\/[^\s,]+/gi) || []).map(url => url.replace(/[)\].,;]+$/, '')))];
  if (!urls.length) { status.className = 'status error'; status.textContent = 'Įklijuokite bent vieną pilną Ruled.me nuorodą.'; return; }
  if (urls.length > 30) { status.className = 'status error'; status.textContent = 'Vienu kartu galima importuoti iki 30 receptų.'; return; }
  button.disabled = true; button.textContent = 'Tikrinama…'; status.className = 'status';
  let imported = 0; let skipped = 0; const failed = [];
  batchImportInProgress = true;
  try {
    status.textContent = `Tikrinamos ${urls.length} nuorodos…`;
    const checked = await validateRecipeUrls(urls);
    const valid = checked.filter(item => item.valid).map(item => item.url);
    checked.filter(item => !item.valid).forEach(item => failed.push(`${item.url} — ${item.status === 404 ? '404' : 'nuoroda nepasiekiama'}`));
    const existingRefs = new Set((userRecipeRefs[currentUserId] || []).map(url => url.replace(/\/$/, '').toLowerCase()));
    const newUrls = valid.filter(url => {
      const key = url.replace(/\/$/, '').toLowerCase();
      if (existingRefs.has(key)) return false;
      existingRefs.add(key); return true;
    });
    const localUrls = new Set(recipes.map(recipe => recipe.url.replace(/\/$/, '').toLowerCase()));
    const processUrls = valid.filter(url => !localUrls.has(url.replace(/\/$/, '').toLowerCase()));
    skipped = valid.length - processUrls.length;
    userRecipeRefs[currentUserId] = [...(userRecipeRefs[currentUserId] || []), ...newUrls];
    localStorage.setItem(STORAGE.userRecipeRefs, JSON.stringify(userRecipeRefs));
    status.textContent = `Sinchronizuojamos ${newUrls.length} nuorodos…`;
    await syncEngine.syncNow();
    button.textContent = 'Importuojama…';
    for (let index = 0; index < processUrls.length; index += 1) {
      const url = processUrls[index];
      status.textContent = `Apdorojama ${index + 1} iš ${processUrls.length}: ${new URL(url).pathname.split('/').filter(Boolean).pop() || url}`;
      try { const recipe = await fetchRecipe(url); recipes.unshift(recipe); imported += 1; save(); renderRecipes(); }
      catch (error) { failed.push(`${url} — ${error.message || 'apdorojimo klaida'}`); }
    }
  } catch (error) {
    failed.push(`Nuorodų patikra — ${error.message || 'klaida'}`);
  }
  batchImportInProgress = false;
  syncEngine?.changed();
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

$('#manual-cart-form').addEventListener('submit', event => {
  event.preventDefault();
  const nameInput = $('#manual-product-name'); const amountInput = $('#manual-product-amount');
  const name = nameInput.value.trim(); if (!name) return;
  const item = manualCartItem(name, amountInput.value);
  if (cart.some(existing => existing.key === item.key && existing.quantity == null && item.quantity == null)) { showToast('Šis produktas jau yra sąraše'); return; }
  cart.push(item); cart = consolidateCart(cart).items; save(); syncEngine?.syncNow(); renderShopping();
  nameInput.value = ''; amountInput.value = ''; nameInput.focus(); showToast('Produktas pridėtas');
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
$('#change-user').addEventListener('click', () => { $('#settings-dialog').close(); showUserChooser(); });
$('.dictionary-close').addEventListener('click', () => $('#dictionary-dialog').close());
$('#dictionary-search').addEventListener('input', renderDictionary);
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('button[type="submit"]', event.currentTarget); const status = $('#login-status');
  button.disabled = true; button.textContent = 'Tikrinama…'; status.textContent = '';
  try {
    await loginWithPassword($('#app-password').value); $('#app-password').value = ''; $('#login-dialog').close(); await syncEngine.start();
  } catch (error) { status.className = 'status error'; status.textContent = error.message || 'Prisijungti nepavyko'; }
  finally { button.disabled = false; button.textContent = 'Prisijungti'; }
});
$('#login-dialog').addEventListener('cancel', event => event.preventDefault());
$('#users-dialog').addEventListener('cancel', event => { if (!currentUserId) event.preventDefault(); });
$('#users-cancel').addEventListener('click', () => { if (currentUserId) $('#users-dialog').close(); });
$('#user-form').addEventListener('submit', event => {
  event.preventDefault(); const input = $('#user-name'); const name = input.value.trim(); if (!name) return;
  if (users.some(user => user.name.toLocaleLowerCase('lt') === name.toLocaleLowerCase('lt'))) { showToast('Toks vartotojas jau yra'); return; }
  const user = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() }; users.push(user); input.value = ''; save(); chooseUser(user.id);
});
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
  if (target.matches('[data-user-choice]')) chooseUser(target.dataset.userChoice);
  if (target.matches('[data-user-delete]')) deleteUser(target.dataset.userDelete);
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
    if (recipe) { recipe.pinned = !recipe.pinned; save(); syncEngine?.syncNow(); renderRecipes(); showToast(recipe.pinned ? 'Receptas prisegtas viršuje' : 'Receptas atsegtas'); }
  }
  if (target.matches('[data-quick-cart]')) { const recipe = recipes.find(item => item.id === target.dataset.quickCart); if (recipe) addRecipeToCart(recipe); }
  if (target.matches('[data-back]')) location.hash = '#recipes';
  if (target.matches('[data-delete]')) { if (confirm('Ištrinti šį receptą?')) { const removed = recipes.find(item => item.id === target.dataset.delete); recipes = recipes.filter(item => item.id !== target.dataset.delete); if (removed && currentUserId) userRecipeRefs[currentUserId] = (userRecipeRefs[currentUserId] || []).filter(url => url.replace(/\/$/, '').toLowerCase() !== removed.url.replace(/\/$/, '').toLowerCase()); localStorage.setItem(STORAGE.userRecipeRefs, JSON.stringify(userRecipeRefs)); save(); renderRecipes(); } }
  if (target.matches('[data-step]')) { const recipe = recipes.find(item => item.id === activeRecipeId); const next = Math.max(1, (recipe.currentServings || recipe.servings) + Number(target.dataset.step)); renderDetail(recipe.id, next); }
  if (target.matches('[data-toggle]')) { const boxes = $$('[data-ingredient]'); const anyChecked = boxes.some(box => box.checked); boxes.forEach(box => box.checked = !anyChecked); target.textContent = anyChecked ? 'Pažymėti visus' : 'Atžymėti visus'; }
  if (target.matches('[data-add-cart]')) addSelectedToCart();
  if (target.matches('[data-cart-remove]')) { cart = cart.filter(item => item.id !== target.dataset.cartRemove); save(); syncEngine?.syncNow(); renderShopping(); }
  if (target.matches('#clear-cart') && cart.length && confirm('Išvalyti visą pirkinių sąrašą?')) { cart = []; save(); syncEngine?.syncNow(); renderShopping(); }
});

document.addEventListener('change', event => {
  if (event.target.matches('[data-cart-check]')) { const item = cart.find(i => i.id === event.target.dataset.cartCheck); if (item) item.done = event.target.checked; save(); syncEngine?.syncNow(); renderShopping(); }
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
    const registration = await navigator.serviceWorker.register('./sw.js?v=40', { updateViaCache: 'none' });
    registration.update();
  });
}
syncEngine = createSyncEngine({
  getStore: syncStore,
  applyStore: applySyncedStore,
  onAuthRequired: requireLogin,
  onStatus: status => { const user = $('#current-user'); user.dataset.sync = status; user.title = status === 'synced' ? 'Duomenys sinchronizuoti' : status === 'saving' ? 'Sinchronizuojama…' : 'Veikia neprisijungus'; },
  onFirstSync: conflicts => {
    if (conflicts.length) showToast('Kai kuriuos pakeitimus pirmiau atliko kitas įrenginys');
    if (!currentUserId || !users.some(item => item.id === currentUserId)) showUserChooser();
  },
});
migrateLegacyIngredientNames();
if (pendingSharedUrl && location.hash !== '#add') location.hash = '#add';
route();
hydrateMissingImages();
if (hasSession()) syncEngine.start(); else requireLogin();
