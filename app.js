import {recipeFlagButtons, initializeRecipeFlags, reviewedRecipeKeys} from './recipe-flags.mjs?v=126';
import { scaleByFactor, normalizeMembers, servingShares } from './household-portions.mjs?v=126';
import { createSyncEngine, hasSession, loginWithPassword } from './sync.js?v=126';
import { createMealPlanner } from './meal-planner.js?v=126';
import { scaleRecipeIngredients, portionMultiplier } from './recipe-portions.mjs?v=126';
import { PRODUCT_TRANSLATIONS, INGREDIENT_DETAILS_LT } from './product-translations.mjs?v=126';

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
  "meat": "mėsa",
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
  "ground chicken": "malta vištiena",
  "ground cinnamon": "maltas cinamonas",
  "ground coriander": "maltos kalendrų sėklos",
  "ground lamb": "malta aviena",
  "ground mild italian sausage": "malta švelni itališka dešra",
  "ground pork": "malta kiauliena",
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

const PRODUCT_SEARCH_ALIASES = {
  meat: ['mėsa', 'mesa', 'mėsos gaminiai'],
  'ground beef': ['jautienos faršas', 'jautienos farsas', 'faršas', 'farsas', 'malta mėsa'],
  'ground pork': ['kiaulienos faršas', 'kiaulienos farsas', 'faršas', 'farsas', 'malta mėsa'],
  'ground chicken': ['vištienos faršas', 'vištienos farsas', 'faršas', 'farsas', 'malta mėsa'],
  'ground turkey': ['kalakutienos faršas', 'kalakutienos farsas', 'faršas', 'farsas', 'malta mėsa'],
  'ground lamb': ['avienos faršas', 'avienos farsas', 'faršas', 'farsas', 'malta mėsa'],
  'chicken breast': ['vištienos filė', 'vistienos file', 'krūtinėlės filė'],
  'chicken thighs': ['vištienos šlaunelės', 'vistienos slauneles', 'šlaunelių mėsa'],
  'hot dogs': ['dešrelės', 'desreles', 'dešrainių dešrelės'],
  bacon: ['šoninė', 'sonine', 'bekonas'],
  'heavy cream': ['plakamoji grietinėlė', 'grietinėlė plakimui', 'riebi grietinėlė'],
  'cream cheese': ['tepamas sūris', 'kreminis sūris', 'philadelphia', 'filadelfija'],
  'cheddar cheese': ['čederis', 'cederis', 'čederio sūris'],
  'mozzarella cheese': ['mocarela', 'mozzarella', 'mocarelos sūris'],
  'sour cream': ['grietinė', 'grietine'],
  'green onion': ['svogūnų laiškai', 'svogunu laiskai', 'laiškiniai svogūnai'],
  cilantro: ['kalendra', 'koriandras', 'šviežia kalendra'],
  'cremini mushrooms': ['pievagrybiai', 'rudieji pievagrybiai'],
  'romaine lettuce': ['romaninės salotos', 'salotų lapai'],
  zucchini: ['cukinija', 'cukinijos'], eggplant: ['baklažanas', 'baklazanas'],
  'red bell pepper': ['raudona paprika', 'saldžioji paprika'],
  'green bell pepper': ['žalia paprika', 'saldžioji paprika'],
  'sun-dried tomatoes': ['džiovinti pomidorai', 'dziovinti pomidorai'],
  'flaxseed meal': ['linų sėmenų miltai', 'linu semenu miltai', 'malti sėmenys'],
  'psyllium husk powder': ['gysločio luobelės', 'psyllium', 'skaidulos'],
  erythritol: ['eritritas', 'eritritolis', 'cukraus pakaitalas'],
  sweetener: ['saldiklis', 'cukraus pakaitalas'],
  'pork rinds': ['kiaulienos čipsai', 'kiaulienos odelės', 'spirgučių traškučiai'],
  'red pepper flakes': ['čili dribsniai', 'čili pipirai', 'aitriosios paprikos'],
  'hot sauce': ['čili padažas', 'astrus padazas', 'aštrus padažas'],
  'soy sauce': ['soja', 'sojų padažas', 'sojos padažas'],
};

Object.assign(translations,PRODUCT_TRANSLATIONS);

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
  'baking powder': 192, 'baking soda': 288, 'almond butter': 272, 'tomato paste': 232, pesto: 224,
  'fresh tomatoes': 180, tomatoes: 180, 'red onion': 142, cilantro: 16,
  mushrooms: 70, 'cremini mushrooms': 70, cucumber: 104, zucchini: 124, onion: 160,
  'red bell pepper': 149, 'green bell pepper': 149, 'egg white': 243, 'shredded coconut': 85,
};
const CUP_LIQUIDS = new Set(['water', 'whole milk', 'coconut milk', 'almond milk', 'heavy cream', 'halfandhalf', 'chicken broth', 'beef broth', 'vegetable broth', 'olive oil', 'avocado oil', 'coconut oil', 'soy sauce', 'hot sauce', 'lemon juice', 'lime juice', 'apple cider vinegar', 'rice vinegar']);

let recipes = load(STORAGE.recipes, []);
let cart = load(STORAGE.cart, []);
let pantry = load(STORAGE.pantry, []);
let customTranslations = load(STORAGE.dictionary, {});
const BLOCKED_PRODUCTS_KEY='keto-blocked-products-v1';
let blockedProductStore=load(BLOCKED_PRODUCTS_KEY,{});
const IGNORED_PRODUCTS_KEY='keto-ignored-products-v1';
let ignoredProductStore=load(IGNORED_PRODUCTS_KEY,{});
function ignoredProducts(){return ignoredProductStore[currentUserId || 'local'] || [];}
function isIgnoredProduct(name){const key=shoppingProductKey(name);return ignoredProducts().some(item=>shoppingProductKey(item.name)===key);}
function saveIgnoredProducts(items){const next={...ignoredProductStore,[currentUserId || 'local']:items};localStorage.setItem(IGNORED_PRODUCTS_KEY,JSON.stringify(next));ignoredProductStore=next;}
function renderIgnoredProducts(){
  $('#ignored-products-list').innerHTML=ignoredProducts().length ? ignoredProducts().map(item=>`<div class="blocked-product-row"><span>${escapeHtml(translateIngredient(item.name))}</span><button class="text-button" type="button" data-unignore-product="${escapeHtml(item.key)}">Vėl įtraukti</button></div>`).join('') : '<p class="muted">Ignoruojamų produktų nėra.</p>';
}
let productBlockHold=null;
let blockedMealChoices=[];
let blockedReplacementOwner=null;
async function offerBlockedMealChanges(owner,key,name) {
  const slots=await mealPlanner.affectedMeals(recipe=>(recipe.ingredientsPerServing || []).some(item=>shoppingProductKey(item.name)===shoppingProductKey(name)));
  if(owner!==currentUserId)return;
  blockedMealChoices=slots;
  blockedReplacementOwner=owner;
  if($('#blocked-meals-dialog').open)$('#blocked-meals-dialog').close();
  location.hash='#discover';
  if(slots.length)await mealPlanner.replacePlanned(slots[0]);
  else showToast('Produktas pašalintas. Suplanuotame meniu patiekalų su juo nėra.');
}
function continueBlockedReplacements(slot) {
  if(blockedReplacementOwner!==currentUserId){blockedMealChoices=[];return;}
  const current=blockedMealChoices[0];
  if(!current || current.menuId!==slot.menuId || current.category!==slot.category || current.day!==slot.day)return;
  blockedMealChoices.shift();
  if(blockedMealChoices.length)void mealPlanner.replacePlanned(blockedMealChoices[0]);
}
function isBlockedProduct(name) {const key=shoppingProductKey(name);return blockedProducts().some(item=>shoppingProductKey(item.name || item.key)===key);}
function blockedProducts() {return blockedProductStore[currentUserId || 'local'] || [];}
function recipeHasBlockedProduct(recipe) {
  const keys=new Set(blockedProducts().map(item=>item.key));
  if(!keys.size)return false;
  return (recipe.ingredientsPerServing || recipe.ingredients || []).some(item=>isBlockedProduct(typeof item==='string' ? parseIngredient(item).name : item.name));
}
function renderBlockedProducts() {
  renderIgnoredProducts();
  const items=blockedProducts();
  $('#blocked-products-list').innerHTML=items.length ? items.map(item=>`<div class="blocked-product-row"><span>${escapeHtml(translateIngredient(item.name))}</span><button class="text-button" type="button" data-unblock-product="${escapeHtml(item.key)}">Atblokuoti</button></div>`).join('') : '<p class="muted">Užblokuotų produktų nėra.</p>';
}
function saveBlockedProducts(items) {
  const next={...blockedProductStore,[currentUserId || 'local']:items};
  localStorage.setItem(BLOCKED_PRODUCTS_KEY,JSON.stringify(next));blockedProductStore=next;
}
function cancelProductBlock() {
  if(!productBlockHold)return;
  clearTimeout(productBlockHold.timeout);clearInterval(productBlockHold.interval);
  productBlockHold.button.textContent='B';productBlockHold.button.classList.remove('holding');productBlockHold=null;
}
function startProductBlock(button,event) {
  if(productBlockHold || button.disabled)return;
  const owner=currentUserId,item=cart.find(entry=>entry.id===button.dataset.blockProduct);
  if(!item)return;
  const state={button,owner,item,pointerId:event.pointerId,x:event.clientX,y:event.clientY,started:Date.now()};
  productBlockHold=state;button.classList.add('holding');button.textContent='1';
  if(event.pointerId!==undefined)button.setPointerCapture?.(event.pointerId);
  state.interval=setInterval(()=>{button.textContent=String(Math.max(1,Math.ceil((1000-(Date.now()-state.started))/1000)));},100);
  state.timeout=setTimeout(()=>{
    cancelProductBlock();if(owner!==currentUserId)return;
    try {
      const key=item.key || ingredientKey(item.name);
      if(!blockedProducts().some(product=>product.key===key))saveBlockedProducts([...blockedProducts(),{key,name:item.name}]);
      cart=cart.filter(product=>shoppingProductKey(product.name)!==shoppingProductKey(item.name));
      save();syncEngine?.syncNow();
      renderShopping();showToast('Produktas užblokuotas. Receptų su juo nebesiūlysime.');
      void offerBlockedMealChanges(owner,key,item.name).catch(()=>showToast('Produktas užblokuotas. Patiekalą galite pakeisti meniu skiltyje.'));
    }catch{showToast('Nepavyko išsaugoti blokavimo. Bandykite dar kartą.');}
  },1000);
}
let translationIndex, customTranslationIndex;
const translationCache=new Map();
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
let libraryCatalog, libraryLoading, libraryCategory='Visos kategorijos', libraryAvailability=false, libraryUnreviewed=false, libraryLimit=48;
let libraryProductIndex=[];
let productSuggestionIndex;
const productCollator=new Intl.Collator('lt');
let recipeReturnRoute='#recipes';
let recipeContext=null;
let userChooserDismissed=false;
let profileGateActive=false;

const libraryCategories={breakfast:'Pusryčiai',lunch:'Pietūs',dinner:'Vakarienė',dessert:'Desertai',snacks:'Užkandžiai','side-items':'Garnyrai',condiments:'Padažai ir pagardai'};

function libraryRecipe(source) {
  const ingredients=(source.ingredientsPerServing || []).map((item,index)=>({...item,id:`${source.id}-${index}`,group:'',translated:translateIngredient(item.name)}));
  const products=[...new Map(ingredients.map(item=>[ingredientKey(item.name),{key:ingredientKey(item.name),label:translateIngredient(canonicalIngredientName(item.name))}])).values()];
  return {...source,mealCategory:source.category,servings:source.servings || 1,category:libraryCategories[source.category] || source.category,ingredients,products,pinned:false};
}
function getRecipe(id) {
  const saved=recipes.find(item=>item.id===id);
  if(saved){
    const source=libraryCatalog?.find(item=>item.url.replace(/\/$/,'').toLowerCase()===saved.url.replace(/\/$/,'').toLowerCase());
    if(source)Object.defineProperty(saved,'translations',{value:source.translations,writable:true,configurable:true,enumerable:false});
    return saved;
  }
  const source=libraryCatalog?.find(item=>item.id===id);
  if(source)source.pinned=isRecipeFavorite(source);
  return source;
}
function allLibraryRecipes() {
  const saved=new Map(recipes.map(recipe=>[recipe.url.replace(/\/$/,'').toLowerCase(),recipe]));
  const result=libraryCatalog.map(source=>{
    const recipe=saved.get(source.url.replace(/\/$/,'').toLowerCase());
    return {...source,pinned:isRecipeFavorite(source)};
  });
  const urls=new Set(result.map(recipe=>recipe.url.replace(/\/$/,'').toLowerCase()));
  for(const recipe of recipes)if(!urls.has(recipe.url.replace(/\/$/,'').toLowerCase()))result.push({...recipe,products:[...new Map(recipe.ingredients.map(item=>[ingredientKey(item.name),{key:ingredientKey(item.name),label:translateIngredient(canonicalIngredientName(item.name))}])).values()]});
  return result.filter(recipe=>!recipeHasBlockedProduct(recipe));
}
async function loadLibraryCatalog() {
  if(libraryLoading)return;
  libraryLoading=true;
  try {
    const response=await fetch('./data/library/recipes.json');
    if(!response.ok)throw new Error('catalog');
    const data=await response.json();
    if(!Array.isArray(data.recipes))throw new Error('catalog');
    libraryCatalog=data.recipes.map(libraryRecipe);
    if(pendingSharedUrl) {
      const shared=libraryCatalog.find(recipe=>recipe.url.replace(/\/$/,'').toLowerCase()===pendingSharedUrl.replace(/\/$/,'').toLowerCase());
      clearSharedRecipeQuery();
      if(shared){recipeContext=null;recipeReturnRoute='#recipes';location.hash=`#recipe/${shared.id}`;}
      else showToast('Šio recepto kataloge nėra.');
    }
    if(location.hash.startsWith('#recipe/'))renderDetail(location.hash.slice(8));
    else if(!$('#recipes-view').hidden)renderRecipes();
    else if(location.hash==='#shopping')renderShopping();
  } catch {
    $('#recipe-grid').innerHTML='<div class="empty">Nepavyko įkelti receptų. <button class="text-button" data-library-retry>Bandyti dar kartą</button></div>';
    if(location.hash.startsWith('#recipe/'))$('#detail-view').innerHTML='<div class="empty">Nepavyko įkelti recepto. <button class="text-button" data-library-retry>Bandyti dar kartą</button></div>';
  } finally {libraryLoading=false;}
}
function renderLibraryProducts({updateOwned=true}={}) {
  const query=searchableText($('#library-product-search').value);
  const owned=new Set(pantry.map(item=>item.key));
  const checkbox=(item,checked)=>`<label><input type="checkbox" data-library-product="${escapeHtml(item.key)}" data-product-label="${escapeHtml(item.label)}" ${checked ? 'checked' : ''}>${escapeHtml(item.label)}</label>`;
  if(updateOwned) {
  $('#library-product-count').textContent=`(${pantry.length})`;
  $('#library-owned-count').textContent=`(${pantry.length})`;
  $('#library-owned-empty').hidden=pantry.length>0;
  $('#library-clear-products').disabled=pantry.length===0;
  $('#library-selected-products').innerHTML=pantry.map(item=>checkbox({key:item.key,label:translateIngredient(item.key)===item.key ? translateIngredient(item.name) : translateIngredient(item.key)},true)).join('');
  }
  const words=query.split(' ').filter(Boolean);
  const matching=libraryProductIndex.filter(item=>!owned.has(item.key) && words.every(word=>item.search.includes(word)));
  $('#library-product-options').innerHTML=matching.slice(0,60).map(item=>checkbox(item,false)).join('');
  $('#library-product-note').textContent=matching.length>60 ? 'Rodoma 60 produktų. Naudokite paiešką, kad rastumėte kitus.' : matching.length ? '' : 'Daugiau produktų pagal šią paiešką nėra.';
}
function refreshLibraryProductIndex(all) {
  const unique=new Map();
  for(const recipe of all)for(const product of recipe.products)if(!unique.has(product.key))unique.set(product.key,product);
  libraryProductIndex=[...unique.values()].map(item=>{
    const translated=translateIngredient(item.key);
    const label=translated===item.key ? item.label : translated;
    return {...item,label,search:productSearchText(item.key,label)};
  }).sort((a,b)=>productCollator.compare(a.label,b.label));
}
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
const mealPlanner = createMealPlanner({ root: $('#discover-view'), settingsSelect: $('#plan-days'), getProfileId: () => hasSession() && users.some(user=>user.id===currentUserId) ? currentUserId : '', showToast, onMenuComplete: addMenuIngredientsToCart, onRecipeReplaced: continueBlockedReplacements, onRebuildCart: rebuildMenuCart, formatIngredients: plannedIngredientLabels, onPortionsChange: applyPortionSettings, isFavorite: isRecipeFavorite, toggleFavorite: toggleCatalogFavorite, isRecipeBlocked: recipeHasBlockedProduct, getProfileName:()=>users.find(user=>user.id===currentUserId)?.name || 'Asmuo', getHouseholdMembers:()=>users.find(user=>user.id===currentUserId)?.householdMembers, onProfileNameChange:name=>{const user=users.find(user=>user.id===currentUserId);if(users.some(other=>other.id!==currentUserId && other.name.toLocaleLowerCase('lt')===name.toLocaleLowerCase('lt'))){showToast('Toks šeimos vardas jau yra.');return false;}if(user){user.name=name;save();}return true;}, onHouseholdChange:members=>{const user=users.find(user=>user.id===currentUserId);if(user){user.householdMembers=members;save();}}, onOpenRecipe: (id,context)=>{recipeContext=context;recipeReturnRoute='#discover';location.hash=`#recipe/${id}`;} });

function applyPortionSettings() {
  recipes.forEach(recipe=>{delete recipe.currentServings;});save();
  if(location.hash.startsWith('#recipe/'))renderDetail(location.hash.slice(8));
  else if(location.hash==='#recipes')renderRecipes();
}
function plannedIngredientLabels(recipe,people,increase) {
  return scaleRecipeIngredients(recipe,people,increase).map(item=>[recipeAmount(item,1,1),translateIngredient(item.name)].filter(Boolean).join(' '));
}
function recipePortionInfo(recipe){
  const source=libraryCatalog?.find(item=>item.url.replace(/\/$/,'').toLowerCase()===recipe.url.replace(/\/$/,'').toLowerCase()) || recipe;
  const category=source.mealCategory || ({'Pusryčiai':'breakfast','Pietūs':'lunch','Vakarienė':'dinner','Desertai':'dessert'})[source.category] || source.category;
  return mealPlanner.portionDetails({...source,category},recipeContext);
}
function recipeTargetServings(recipe) {return recipePortionInfo(recipe).factor;}

function rebuildMenuCart(batches,{profileId,people=1,increase=0}) {
  if(profileId!==(currentUserId || 'local'))throw new Error('Pasikeitė vartotojo profilis');
  const key='keto-menu-cart-imports-v1',oldReceipt=localStorage.getItem(key),before=cart;
  const imports=load(key,{}),owner=imports[profileId] ||= {};
  const next=cartForMenuRecipes(batches.flatMap(batch=>batch.recipes.map(recipe=>({...recipe,cartMenuId:batch.menuId}))),[],people,increase);
  for(const batch of batches)owner[batch.menuId]=batch.recipeIds;
  try {
    localStorage.setItem(key,JSON.stringify(imports));cart=next;save();
  }catch(error) {
    cart=before;
    try{if(oldReceipt==null)localStorage.removeItem(key);else localStorage.setItem(key,oldReceipt);save();}catch{}
    throw error;
  }
  syncEngine?.syncNow();
  showToast('Krepšelis atnaujintas pagal šiandienos ir būsimų dienų meniu');
  if(location.hash==='#shopping')renderShopping();
}

function cartForMenuRecipes(menuRecipes,initial=[],people=1,increase=0) {
  const next=initial.map(item=>({...item}));
  for(const recipe of menuRecipes)for(const item of (Number.isFinite(recipe.householdFactor) ? scaleByFactor(recipe,recipe.householdFactor) : scaleRecipeIngredients(recipe,people,increase))) {
    if(isInPantry(item.name) || isBlockedProduct(item.name) || isIgnoredProduct(item.name))continue;
    const productKey=ingredientKey(item.name);
    if(item.quantity==null && !item.quantityRaw) {
      const same=next.find(entry=>entry.key===productKey && ingredientForm(entry.name)===ingredientForm(item.name) && entry.quantity==null && unitKey(entry.unit)===unitKey(item.unit));
      if(same){same.done=false;same.sources=mergeCartSources(same.sources,[cartRecipeSource(recipe,'menu')]);continue;}
    }
    next.push({id:crypto.randomUUID(),key:productKey,quantity:item.quantity,quantityMin:item.quantityMin,quantityMax:item.quantityMax,quantityRaw:item.quantity==null ? [item.quantityRaw,item.unit].filter(Boolean).join(' ') : '',unit:item.unit,name:item.name,translated:translateIngredient(item.name),done:false,sources:[cartRecipeSource(recipe,'menu')]});
  }
  return consolidateCart(next).items;
}

function findSavedRecipe(source) {
  const key=source.url.replace(/\/$/,'').toLowerCase();
  return recipes.find(recipe=>recipe.url.replace(/\/$/,'').toLowerCase()===key);
}

function isRecipeFavorite(source) {
  const saved=findSavedRecipe(source);
  return saved ? Boolean(saved.pinned) : (userPins[currentUserId] || []).includes(source.url.replace(/\/$/,'').toLowerCase());
}
function toggleCatalogFavorite(source) {
  let recipe=findSavedRecipe(source);
  if(!recipe) {
    const categories={breakfast:'Pusryčiai',lunch:'Pietūs',dinner:'Vakarienė',dessert:'Desertai'};
    recipe={id:crypto.randomUUID(),title:source.title,url:source.url,servings:source.servings || 1,category:categories[source.category] || source.category || 'Kita',image:source.image,originalServings:source.originalServings,ingredients:scaleRecipeIngredients(source,1,0).map(item=>({...item,id:crypto.randomUUID(),group:'',translated:translateIngredient(item.name)})),instructions:source.instructions.map(step=>typeof step==='string' ? step : step.text),pinned:isRecipeFavorite(source),savedAt:new Date().toISOString()};
    recipes.unshift(recipe);
  }
  recipe.pinned=!recipe.pinned;
  if(currentUserId) {
    const references=userRecipeRefs[currentUserId] ||= [];
    if(!references.some(url=>url.replace(/\/$/,'').toLowerCase()===recipe.url.replace(/\/$/,'').toLowerCase()))references.push(recipe.url);
    localStorage.setItem(STORAGE.userRecipeRefs,JSON.stringify(userRecipeRefs));
  }
  save();syncEngine?.syncNow();
  showToast(recipe.pinned ? 'Pridėta prie mėgstamų' : 'Pašalinta iš mėgstamų');
  return recipe.pinned;
}

function addMenuIngredientsToCart(menuRecipes,{menuId,profileId,people=1,increase=0}) {
  if(profileId!==(currentUserId || 'local'))throw new Error('Pasikeitė vartotojo profilis');
  const key='keto-menu-cart-imports-v1';
  const imports=load(key,{}), owner=imports[profileId] ||= {};
  const imported=new Set(owner[menuId] || []);
  const pending=menuRecipes.filter(recipe=>!imported.has(recipe.id));
  if(!pending.length)return;
  const before=cart;
  cart=cartForMenuRecipes(pending.map(recipe=>({...recipe,cartMenuId:menuId})),cart,people,increase);
  try {
    // Save the receipt first; roll it back if saving the cart fails.
    const oldReceipt=owner[menuId];
    owner[menuId]=[...imported,...pending.map(recipe=>recipe.id)];
    localStorage.setItem(key,JSON.stringify(imports));
    try{save();}catch(error){if(oldReceipt)owner[menuId]=oldReceipt;else delete owner[menuId];localStorage.setItem(key,JSON.stringify(imports));throw error;}
  }catch(error){cart=before;try{save();}catch{}throw error;}
  syncEngine?.syncNow();
  showToast('Meniu ingredientai pridėti į pirkinių krepšelį');
}

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
  const pins=new Set(userPins[currentUserId] || []);
  for(const recipe of recipes){const url=recipe.url.replace(/\/$/,'').toLowerCase();if(recipe.pinned)pins.add(url);else pins.delete(url);}
  userPins[currentUserId]=[...pins];
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
  invalidateProductTranslations();
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
  const neededCart = cart.filter(item => !isInPantry(item.name) && !isBlockedProduct(item.name) && !isIgnoredProduct(item.name));
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
  return value==null ? '' : Number(value.toFixed(2)).toLocaleString('lt-LT');
}

function roundedMetric(value) {
  if (value < 10) return Number(value.toFixed(1)).toLocaleString('lt-LT');
  return Math.round(value).toLocaleString('lt-LT');
}

// USDA: cooked diced chicken 140 g/cup; other densities use CUP_GRAMS.
// https://www.ars.usda.gov/ARSUserFiles/80400530/pdf/8586/csfii85_4days_codebook.pdf
function isLiquidIngredient(item) {
  const key=item.key || ingredientKey(item.name);
  return CUP_LIQUIDS.has(key) || /(?:oil|milk|cream|broth|stock|juice|vinegar|sauce|extract|syrup)$/.test(key) && !/cream cheese|sour cream|powder|dried/.test(key) || /liquid stevia|water/.test(key);
}
function roundedKitchenAmount(value) {
  const whole=Math.floor(Math.max(0,value));
  const fraction=value-whole;
  return formatNumber(whole+(fraction>=0.7-1e-9 ? 1 : fraction>=0.3-1e-9 ? 0.5 : 0));
}
function kitchenVolume(ml) {
  if(ml<15)return roundedKitchenAmount(ml/5)+' a. š.';
  if(ml<120)return roundedKitchenAmount(ml/15)+' v. š.';
  return roundedKitchenAmount(ml/240)+' puodelio';
}
function cupWeight(item) {
  const key=item.key || ingredientKey(item.name);
  if(CUP_LIQUIDS.has(key) || /(?:oil|milk|broth|stock|juice|vinegar)$/.test(key))return null;
  if(CUP_GRAMS[key])return CUP_GRAMS[key];
  const name=canonicalIngredientName(item.name || key);
  if(!/dried|powder|paste|sauce|juice|soup|pickled/.test(name)){
    if(/\b(?:fresh )?tomatoes?\b/.test(name))return /cherry/.test(name) ? 149 : 180;
    if(/\b(?:red|yellow|white|sweet)? ?onions?\b/.test(name) && !/green|spring/.test(name))return 142;
    if(/\bcilantro\b/.test(name))return 16;
  }
  if(/chicken/.test(key) && !/bouillon|broth|stock|whole/.test(key))return 140;
  return null;
}
function isCountedIngredient(item) {
  const unit=unitKey(item.unit || '');
  return /^(large|medium|small|whole|piece|pieces|vnt|clove|cloves|slice|slices|can|cans|package|packages)$/.test(unit) || (!unit && /^(eggs?|egg white|avocado|lemons?|limes?|onion|red onion|yellow onion|white onion|tomatoes?|fresh tomatoes|cherry tomatoes|cucumber|zucchini|eggplant|apple|pear|jalapeno pepper|red bell pepper|green bell pepper|yellow bell pepper)$/.test(item.key || ingredientKey(item.name)));
}
function roundedPieceCount(quantity) {
  const whole=Math.floor(Math.max(0,quantity));
  return whole+(quantity-whole>=0.3-1e-9 ? 1 : 0);
}
function pieceAmount(item,quantity) {
  const unit=unitKey(item.unit || '');
  const label=/^cloves?$/.test(unit) ? 'skilt.' : /^slices?$/.test(unit) ? 'riek.' : /^cans?$/.test(unit) ? 'skard.' : /^packages?$/.test(unit) ? 'pak.' : 'vnt.';
  return roundedPieceCount(quantity)+' '+label;
}
function metricAmount(item) {
  if (item.quantity == null) return [item.quantityRaw, ''].filter(Boolean).join(' ');
  const unit = unitKey(item.unit || '');
  const quantity = item.quantity;
  if(isCountedIngredient(item))return pieceAmount(item,quantity);
  const volume=measurement(unit);
  const density=volume.family==='volume' ? cupWeight(item) : null;
  if(density)return '≈ '+roundedMetric(quantity*volume.factor*density/240)+' g';
  if(volume.family==='volume' && !isLiquidIngredient(item))return kitchenVolume(quantity*volume.factor);
  if (/^(ounce|ounces|oz)$/.test(unit)) return `${roundedMetric(quantity * 28.3495)} g`;
  if (/^(pound|pounds|lb|lbs)$/.test(unit)) return `${roundedMetric(quantity * 453.592)} g`;
  if (/^(gram|grams|g)$/.test(unit)) return `${item.approximate ? '≈ ' : ''}${roundedMetric(quantity)} g`;
  if (/^(milliliter|milliliters|ml)$/.test(unit)) return `${roundedMetric(quantity)} ml`;
  if (/^(liter|liters|l)$/.test(unit)) return `${roundedMetric(quantity * 1000)} ml`;
  if (/^(fluid ounce|fluid ounces|fl oz)$/.test(unit)) return `${roundedMetric(quantity * 29.5735)} ml`;
  if (/^(cup|cups)$/.test(unit)) {
    const key = item.key || ingredientKey(item.name);
    if (CUP_GRAMS[key]) return `≈ ${roundedMetric(quantity * CUP_GRAMS[key])} g`;
    if (CUP_LIQUIDS.has(key) || /(?:oil|milk|broth|juice|vinegar|sauce)$/.test(key)) return `${roundedMetric(quantity * 240)} ml`;
    return `${roundedMetric(quantity*240)} ml`;
  }
  if (/^(tablespoon|tablespoons|tbsp)$/.test(unit)) return `${roundedMetric(quantity * 15)} ml`;
  if (/^(teaspoon|teaspoons|tsp)$/.test(unit)) return `${roundedMetric(quantity * 5)} ml`;
  const unitLt = { large: 'didelis', medium: 'vidutinis', small: 'mažas', clove: 'skiltelė', cloves: 'skiltelės', slice: 'riek.', slices: 'riek.', whole:'vnt.', piece:'vnt.', pieces:'vnt.', can:'skard.', cans:'skard.', package:'pak.', packages:'pak.' }[unit] || item.unit;
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

function cartRecipeSource(recipe,origin='recipe') {
  return {id:recipe.id,title:recipe.title,url:recipe.url,origin,...(recipe.cartMenuId ? {menuId:recipe.cartMenuId} : {})};
}
function mergeCartSources(first=[],second=[]) {
  return [...new Map([...first,...second].map(source=>[`${source.url || source.id}:${source.origin}:${source.menuId || ''}`,source])).values()];
}
function consolidateCart(items) {
  const result = []; let changed = false;
  for (const item of items) {
    const current = { ...item, key: item.key || ingredientKey(item.name) };
    const volumeMeasure=measurement(current.unit);
    const volumeFactor=volumeMeasure.family==='volume' ? volumeMeasure.factor/240 : null;
    const density=volumeFactor ? cupWeight(current) : null;
    if(volumeFactor && current.quantity!=null && (density || isLiquidIngredient(current))) {
      current.quantity*=density ? volumeFactor*density : volumeFactor*240;
      current.unit=density ? 'gram' : 'milliliter';
      if(density)current.approximate=true;
      changed=true;
    }
    const measure = measurement(current.unit);
    const existing = current.quantity == null ? null : result.find(entry => entry.key === current.key && translateIngredient(entry.name) === translateIngredient(current.name) && ingredientForm(entry.name) === ingredientForm(current.name) && entry.quantity != null && measurement(entry.unit).family === measure.family);
    if (!existing) { result.push(current); continue; }
    const existingMeasure = measurement(existing.unit);
    let targetKey = existingMeasure.key;
    if (measure.family === 'volume' && (existingMeasure.key === 'cup' || measure.key === 'cup')) targetKey = 'cup';
    else if (measure.family === 'volume' && (existingMeasure.key === 'tablespoon' || measure.key === 'tablespoon')) targetKey = 'tablespoon';
    else if (measure.family === 'weight' && (existingMeasure.key === 'ounce' || measure.key === 'ounce')) targetKey = 'ounce';
    else if (measure.family === 'weight') targetKey = 'gram';
    const target = measurement(targetKey);
    existing.quantity = (existing.quantity * existingMeasure.factor + current.quantity * measure.factor) / target.factor;
    existing.sources=mergeCartSources(existing.sources,current.sources);
    existing.approximate=Boolean(existing.approximate || current.approximate);
    if(current.manual)existing.manual=true;
    existing.done = Boolean(existing.done && current.done);
    existing.unit = targetKey; existing.quantityRaw = ''; changed = true;
  }
  return { items: result, changed };
}

function translateIngredient(name) {
  if(translationCache.has(name))return translationCache.get(name);
  const key = canonicalIngredientName(name);
  if(!translationIndex) {
    translationIndex=new Map();customTranslationIndex=new Map();
    for(const [english,value] of Object.entries(translations))if(!translationIndex.has(ingredientKey(english)))translationIndex.set(ingredientKey(english),value);
    for(const [english,value] of Object.entries(customTranslations))if(!customTranslationIndex.has(ingredientKey(english)))customTranslationIndex.set(ingredientKey(english),value);
  }
  const fullBase=String(name).toLowerCase().replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
  let base=customTranslations[fullBase] || translations[fullBase] || customTranslations[key] || translations[key] || customTranslationIndex.get(ingredientKey(name)) || translationIndex.get(ingredientKey(name)) || fullBase;
  const details=[...String(name).matchAll(/\(([^)]*)\)/g)].map(match=>match[1].trim()).filter(Boolean);
  const qualifiers=[
    [/\bboneless\b|\bde-boned\b/,/be kaul/,'be kaulų'],
    [/\bbone-in\b/,/su kaul/,'su kaulu'],
    [/\bskinless\b/,/be od/,'be odos'],
    [/\bskin-on\b|\bwith skin\b/,/su od/,'su oda'],
    [/\braw\b/,/žali|žalias/,'žalias produktas'],
    [/\bcooked\b/,/virt|kept|paruošt/,'termiškai paruoštas produktas'],
    [/\bsmoked\b/,/rūkyt/,'rūkytas produktas'],
    [/\bfrozen\b/,/šaldyt/,'šaldytas produktas'],
    [/\bcanned\b/,/konservuot/,'konservuotas produktas'],
    [/\bunsweetened\b/,/be cukraus|nesald/,'be pridėtinio cukraus'],
    [/\bunsalted\b/,/nesūd|be drusk/,'be druskos'],
    [/\bfull-fat\b/,/riebumo/,'įprasto riebumo'],
    [/\bdeli[- ]slic/,/pjaust|riekel/,'plonos sumuštiniams skirtos riekelės'],
    [/\bshredded\b|\bgrated\b/,/tarkuot/,'tarkuotas produktas'],
    [/\bground\b/,/farš|malt|miltel/,'maltas produktas'],
  ];
  const extra=qualifiers.filter(([source,translated])=>source.test(fullBase) && !translated.test(base)).map(([, ,label])=>label);
  if(key==='ham' && details.some(detail=>/deli slic/i.test(detail)))base='virtas kumpis';
  const descriptions=[...extra,...details.map(detail=>INGREDIENT_DETAILS_LT[detail] || detail)];
  const result=base+(descriptions.length ? ' ('+descriptions.join('; ')+')' : '');
  translationCache.set(name,result);
  return result;
}
function invalidateProductTranslations() {
  translationIndex=null;customTranslationIndex=null;translationCache.clear();
  productSuggestionIndex=null;
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
  const normalized = searchableText(value);
  const translatedMatch = [...Object.entries(customTranslations), ...Object.entries(translations)].find(([, lithuanian]) => searchableText(lithuanian) === normalized);
  return ingredientKey(translatedMatch ? translatedMatch[0] : value);
}

function isInPantry(name) {
  return pantry.some(item => item.key === ingredientKey(name));
}

function addToPantry(name, label = '') {
  const key = pantryKeyFromInput(name);
  if (!key || pantry.some(item => item.key === key)) return false;
  const englishName = Object.keys(translations).find(item => ingredientKey(item) === key) || name;
  pantry.push({ key, name: translateIngredient(englishName) || label || name });
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
  const hasActiveProfile=hasSession() && users.some(user=>user.id===currentUserId);
  document.querySelector('.topbar nav').hidden=!hasActiveProfile;
  $('#cart-count').textContent = new Set(cart.map(item=>shoppingProductKey(item.name))).size;
  $('#pantry-count').textContent = pantry.length;
  $('#recipe-count').textContent = libraryCatalog ? `${allLibraryRecipes().length} receptų` : '';
  const user = users.find(item => item.id === currentUserId);
  $('#current-user').hidden = false;
  $('#current-user').textContent = user ? [...user.name.trim()][0]?.toLocaleUpperCase('lt') || '?' : '?';
  $('#current-user').setAttribute('aria-label',user ? `Keisti vartotoją. Dabartinis profilis: ${user.name}` : 'Keisti vartotoją');
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
  applyingRemoteStore = true;
  try {
  let cartConsolidated = false;
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
  invalidateProductTranslations();
  if (currentUserId) loadActiveUserState(currentUserId);
  else cart = [];
  localStorage.setItem(STORAGE.dictionary, JSON.stringify(customTranslations)); save(); applyingRemoteStore = false;
  // The app already contains the recipe text. Do not hold sync open for external imports.
  if(!libraryCatalog)void loadLibraryCatalog();
  if (cartConsolidated) syncEngine?.changed();
  route({ preserveScroll: true }); updateCounts();
  } finally {
    applyingRemoteStore=false;
  }
}

function renderUsers() {
  $('#users-list').innerHTML = users.length ? users.map(user => `<div class="user-row"><button class="user-choice" data-user-choice="${user.id}"><span class="user-choice-avatar">${escapeHtml(user.name.slice(0, 1).toUpperCase())}</span><span>${escapeHtml(user.name)}</span></button><button class="settings-button profile-gear" data-profile-settings="${escapeHtml(user.id)}" type="button" aria-label="Profilio ${escapeHtml(user.name)} nustatymai" title="Profilio nustatymai"><span aria-hidden="true">⚙</span></button><button class="user-delete ui-button" data-user-delete="${user.id}" type="button" aria-label="Ištrinti vartotoją ${escapeHtml(user.name)}" title="Ištrinti vartotoją">×</button></div>`).join('') : '<div class="empty">Vartotojų dar nėra. Sukurkite pirmą profilį.</div>';
  $('#users-cancel').hidden=!users.some(user=>user.id===currentUserId);
}

function showUserChooser() {
  if(!hasSession()){requireLogin();return;}
  if($('#create-household-dialog').open)return;
  userChooserDismissed=false;renderUsers(); const dialog = $('#users-dialog'); if (!dialog.open) dialog.showModal();
}

function chooseUser(id) {
  if(!hasSession()){requireLogin();return;}
  const user = users.find(item => item.id === id); if (!user) return;
  persistActiveUserState(); currentUserId = id; loadActiveUserState(id);
  localStorage.setItem(STORAGE.currentUser, id); save(); $('#users-dialog').close(); route(); updateCounts(); showToast(`Pasirinktas vartotojas: ${user.name}`);
}

function deleteUser(id) {
  const user = users.find(item => item.id === id); if (!user) return;
  if (!confirm(`Ištrinti vartotoją „${user.name}“? Bus pašalinti jo receptai, prisegimai, pirkinių sąrašas ir turimi produktai.`)) return;
  users = users.filter(item => item.id !== id);
  delete userRecipes[id]; delete userRecipeRefs[id]; delete userCarts[id]; delete userPins[id]; delete userPantries[id];
  mealPlanner.deleteProfile(id);
  for (const [key, value] of [[STORAGE.userRecipes, userRecipes], [STORAGE.userRecipeRefs, userRecipeRefs], [STORAGE.userCarts, userCarts], [STORAGE.userPins, userPins], [STORAGE.userPantries, userPantries]]) localStorage.setItem(key, JSON.stringify(value));
  if (currentUserId === id) { currentUserId = ''; recipes = []; cart = []; pantry = []; localStorage.removeItem(STORAGE.currentUser); }
  save(); syncEngine?.syncNow(); renderUsers(); route(); showToast(`Vartotojas „${user.name}“ ištrintas`);
}

function requireLogin() {
  const dialog = $('#login-dialog'); if (!dialog.open) dialog.showModal();
}

function renderRecipes() {
  if(!libraryCatalog) {
    $('#recipe-grid').innerHTML='<div class="empty">Kraunami visi receptai…</div>';
    loadLibraryCatalog();return;
  }
  const all=allLibraryRecipes();
  refreshLibraryProductIndex(all);
  $('#library-tabs').innerHTML=['Visi','Mėgstami'].map(value=>`<button class="filter-chip ${activeFilter===value ? 'active' : ''}" data-filter="${value}" aria-pressed="${activeFilter===value}">${value==='Visi' ? 'Visi receptai' : value}</button>`).join('');
  const categories=['Visos kategorijos',...new Set(all.map(recipe=>recipe.category))];
  $('#category-filters').innerHTML=categories.map(value=>`<button class="filter-chip ${libraryCategory===value ? 'active' : ''}" data-library-category="${escapeHtml(value)}" aria-pressed="${libraryCategory===value}">${escapeHtml(value)}</button>`).join('');
  $('#library-availability').checked=libraryAvailability;
  $('#library-unreviewed').checked=libraryUnreviewed;
  const reviewed=libraryUnreviewed ? reviewedRecipeKeys() : null;
  renderLibraryProducts();
  let matching=all.filter(recipe=>(!reviewed || !reviewed.has((recipe.url||recipe.id).replace(/\/$/,''))) && (activeFilter!=='Mėgstami' || recipe.pinned) && (libraryCategory==='Visos kategorijos' || recipe.category===libraryCategory));
  let fallback=false;
  if(libraryAvailability) {
    const owned=new Set(pantry.map(item=>item.key));
    matching=matching.map(recipe=>({...recipe,missing:recipe.products.filter(item=>!owned.has(item.key))}));
    const ready=matching.filter(recipe=>!recipe.missing.length);
    fallback=!ready.length;
    matching=ready.length ? ready : matching.filter(recipe=>recipe.missing.length<=2).sort((a,b)=>a.missing.length-b.missing.length);
  }
  $('#library-results').textContent=libraryAvailability ? (matching.length ? (fallback ? 'Iš turimų produktų pilno recepto nėra. Šiems patiekalams trūksta tik 1–2 ingredientų.' : 'Galite pagaminti iš pažymėtų produktų: '+matching.length) : 'Receptų, kuriems trūktų daugiausia 2 ingredientų, nėra. Pažymėkite daugiau turimų produktų arba pakeiskite filtrus.') : 'Rasta receptų: '+matching.length;
  const visible=matching.slice(0,libraryLimit);
  $('#recipe-grid').innerHTML=visible.length ? visible.map(recipe => `
      <article class="recipe-card ${recipe.pinned ? 'pinned' : ''} ${recipe.missing?.length ? 'is-missing' : ''}">
        <button class="card-pin ${recipe.pinned ? 'active' : ''}" data-pin-recipe="${recipe.id}" aria-label="${recipe.pinned ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų'}" title="${recipe.pinned ? 'Mėgstamas receptas' : 'Pridėti prie mėgstamų'}">★</button>
        <button class="recipe-image-button" data-open-recipe="${recipe.id}" aria-label="Atidaryti ${escapeHtml(recipe.title)}">
          ${recipe.image ? `<img class="recipe-image" src="${escapeHtml(recipe.image)}" alt="" loading="lazy" />` : '<span class="recipe-image-fallback"><img src="./icons/cupcake.svg" alt="" width="64" height="64"></span>'}
        </button>
        <div class="recipe-body">
          <div class="recipe-meta"><span class="pill">${escapeHtml(recipe.category || 'Kita')}</span><span class="muted">${escapeHtml(mealPlanner.portionLabel(recipe))}</span></div>
          <button class="recipe-title-button" data-open-recipe="${recipe.id}"><h3>${escapeHtml(recipe.title)}</h3></button>
          <p>${recipe.ingredients.length} ingredientų · ${recipe.instructions.length} žingsnių</p>${recipe.missing?.length ? `<div class="missing-products"><strong>Iki šio recepto trūksta:</strong><ul>${recipe.missing.map(item=>{const label=translateIngredient(item.key)===item.key ? item.label : translateIngredient(item.key);return `<li><label><input type="checkbox" data-library-product="${escapeHtml(item.key)}" data-product-label="${escapeHtml(label)}" aria-label="Turiu namuose: ${escapeHtml(label)}"><span>${escapeHtml(label)}</span></label></li>`;}).join('')}</ul></div>` : ''}
          <div class="recipe-link-row"><a href="${escapeHtml(recipe.url)}" target="_blank" rel="noopener">Atidaryti</a><button data-copy-url="${escapeHtml(recipe.url)}">Kopijuoti</button><button data-share-recipe="${recipe.id}">Bendrinti</button></div>
          <footer><button class="card-cart" data-quick-cart="${recipe.id}">＋ Į pirkinius</button></footer>
        </div>
      </article>`).join('') : '<div class="empty">Pagal pasirinktus filtrus receptų nėra.</div>';
  $('#library-more').hidden=matching.length<=libraryLimit;
  updateCounts();
}

function recipeAmount(item, servings, originalServings) {
  const factor=servings/originalServings;
  return metricAmount({...item,quantity:item.quantity==null ? null : item.quantity*factor,quantityMin:Number.isFinite(item.quantityMin) ? item.quantityMin*factor : undefined,quantityMax:Number.isFinite(item.quantityMax) ? item.quantityMax*factor : undefined});
}

function renderDetail(id, servingsOverride) {
  const recipe = getRecipe(id); if (!recipe) {if(!libraryCatalog){$('#detail-view').innerHTML='<div class="empty">Kraunamas receptas…</div>';void loadLibraryCatalog();return;}location.hash='#recipes';return;}
  if(!recipe.translations?.lt && !libraryCatalog){$('#detail-view').innerHTML='<div class="empty">Kraunamas lietuviškas receptas…</div>';void loadLibraryCatalog();return;}
  const localized=recipe.translations?.lt;
  const title=localized?.title || 'Išsaugotas receptas';
  const image=libraryCatalog?.find(item=>item.url.replace(/\/$/,'').toLowerCase()===recipe.url.replace(/\/$/,'').toLowerCase())?.image || recipe.image;
  const steps=localized?.instructions || [];
  activeRecipeId = id;
  const portionInfo=recipePortionInfo(recipe);
  const shares=servingShares(portionInfo.people);
  const dishCalories=shares.every(person=>!person.factor || person.calories!=null) ? shares.reduce((sum,person)=>sum+(person.calories || 0),0) : null;
  const servings=portionInfo.factor;

  const groups = [...new Set(recipe.ingredients.map(item => item.group).filter(Boolean))];
  const ingredientsHtml = (groups.length ? groups : ['']).map(group => `
    ${group ? `<h3>${escapeHtml(({filling:'Įdaras',dough:'Tešla',topping:'Priedai',sauce:'Padažas',crust:'Pagrindas',frosting:'Kremas',salad:'Salotos',dressing:'Padažas'})[group.toLowerCase()] || 'Ingredientai')}</h3>` : ''}
    <div class="ingredients">${recipe.ingredients.filter(i => groups.length ? i.group === group : true).map(item => `
      <label class="ingredient">
        <input type="checkbox" data-ingredient="${item.id}" checked />
        <span class="ingredient-qty">${escapeHtml(recipeAmount(item, servings, recipe.servings))}</span>
        <span>${escapeHtml(translateIngredient(item.name))}</span>
      </label>`).join('')}</div>`).join('');
  $('#detail-view').innerHTML = `
    <button class="back" data-back>${recipeReturnRoute==='#discover' ? '← Grįžti į meniu' : recipeReturnRoute==='#shopping' ? '← Grįžti į pirkinius' : '← Visi receptai'}</button>
    ${recipeHasBlockedProduct(recipe) ? '<p class="status error">Šiame recepte yra užblokuotų produktų. Jo nebesiūlysime; meniu patiekalą galite pakeisti.</p>' : ''}
    <header class="detail-header">
      <div><p class="eyebrow">Receptas</p><h1 lang="lt">${escapeHtml(title)}</h1><div class="detail-actions"><a class="detail-action" href="${escapeHtml(recipe.url)}" target="_blank" rel="noopener">Atidaryti originalą ↗</a><button class="detail-action" data-copy-url="${escapeHtml(recipe.url)}">Kopijuoti nuorodą</button><button class="detail-action" data-share-recipe="${recipe.id}">Bendrinti</button><button class="detail-action" data-toggle-favorite="${recipe.id}" aria-pressed="${Boolean(recipe.pinned)}">${recipe.pinned ? '♥ Mėgstamas receptas' : '♡ Pridėti prie mėgstamų'}</button></div></div>
      <div class="portion-box serving-distribution"><label>Kaip padalinti pagamintą patiekalą</label><strong>${dishCalories==null ? 'Bendras kalorijų kiekis nežinomas' : 'Iš viso: '+Math.round(dishCalories).toLocaleString('lt')+' kcal'}</strong><p class="portion-note">${portionInfo.planned ? 'Dalys apskaičiuotos pagal suplanuotos dienos kalorijų tikslus.' : 'Orientacinės dalys pagal šeimos tikslus. Sudarytame meniu jos gali pasikeisti.'} Procentai nurodo viso pagaminto patiekalo dalį.</p><div class="serving-share-bar" aria-hidden="true">${shares.filter(person=>person.factor>0).map((person,index)=>`<span class="serving-color-${index%6}" style="flex-grow:${person.percent}"></span>`).join('')}</div>${shares.map((person,index)=>`<div class="person-recipe-portion"><strong>${escapeHtml(person.name)}</strong><span>${person.factor ? person.percent+' % viso patiekalo · '+(person.calories==null ? 'kcal nežinomos' : Math.round(person.calories)+' kcal') : 'Šio valgymo nevalgo'}</span></div>`).join('')}</div>
    </header>
    ${image ? `<img class="recipe-detail-photo" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" decoding="async" fetchpriority="high">` : ''}
    <div class="detail-columns">
      <section><div class="ingredient-title"><h2>Ingredientai</h2><button class="text-button" data-toggle>Atžymėti visus</button></div>${ingredientsHtml}<button class="primary dark" data-add-cart>Pridėti pažymėtus į pirkinius</button></section>
      <section><p class="eyebrow">Gaminimas</p><h2>Instrukcija</h2><p class="portion-note">Naudokite ingredientų sąraše visiems šį patiekalą valgantiems šeimos nariams perskaičiuotus kiekius. Instrukcijoje paminėti kiekiai yra iš originalaus recepto.</p><div class="instructions" lang="lt">${steps.length ? steps.map(step => `<div class="instruction">${escapeHtml(step)}</div>`).join('') : '<p class="muted">Instrukciją rasite originaliame recepte.</p>'}</div></section>
    </div>
    ${recipeFlagButtons(recipe)}
    <footer class="recipe-original-footer"><a class="detail-action" href="${escapeHtml(recipe.url)}" target="_blank" rel="noopener noreferrer">Originalus receptas ↗</a></footer>`;
}

function addSelectedToCart() {
  const recipe = getRecipe(activeRecipeId); if (!recipe) return;
  const servings = recipeTargetServings(recipe);
  if(servings<=0){showToast('Šio valgymo nevalgo nė vienas šeimos narys.');return;}
  const selected = $$('[data-ingredient]:checked', $('#detail-view')).map(input => recipe.ingredients.find(item => item.id === input.dataset.ingredient)).filter(Boolean);
  const needed = selected.filter(item => !isInPantry(item.name) && !isBlockedProduct(item.name) && !isIgnoredProduct(item.name));
  needed.forEach(item => {
    const key = ingredientKey(item.name); const scaled = item.quantity == null ? null : item.quantity * servings / recipe.servings;
    const existing = cart.find(entry => entry.key === key && unitKey(entry.unit) === unitKey(item.unit));
    if(existing)existing.sources=mergeCartSources(existing.sources,[cartRecipeSource(recipe)]);
    if (existing && scaled != null && existing.quantity != null) existing.quantity += scaled;
    else if (!existing) cart.push({ id: crypto.randomUUID(), key, quantity: scaled, quantityMin:Number.isFinite(item.quantityMin) ? item.quantityMin*servings/recipe.servings : undefined,quantityMax:Number.isFinite(item.quantityMax) ? item.quantityMax*servings/recipe.servings : undefined, quantityRaw: item.quantity==null && Number.isFinite(item.quantityMin) ? recipeAmount(item,servings,recipe.servings) : item.quantityRaw, unit: item.unit, name: item.name, translated: item.translated, done: false, sources:[cartRecipeSource(recipe)] });
  });
  cart = consolidateCart(cart).items;
  save(); syncEngine?.syncNow(); showToast(`${needed.length} produktai pridėti${selected.length !== needed.length ? ` · ${selected.length - needed.length} turite` : ''}`);
}

function addRecipeToCart(recipe, items = recipe.ingredients) {
  const servings = recipeTargetServings(recipe);
  if(servings<=0){showToast('Šio valgymo nevalgo nė vienas šeimos narys.');return;}
  const needed = items.filter(item => !isInPantry(item.name) && !isBlockedProduct(item.name) && !isIgnoredProduct(item.name));
  needed.forEach(item => {
    const key = ingredientKey(item.name); const scaled = item.quantity == null ? null : item.quantity * servings / recipe.servings;
    const existing = cart.find(entry => entry.key === key && unitKey(entry.unit) === unitKey(item.unit));
    if(existing)existing.sources=mergeCartSources(existing.sources,[cartRecipeSource(recipe)]);
    if (existing && scaled != null && existing.quantity != null) existing.quantity += scaled;
    else if (!existing) cart.push({ id: crypto.randomUUID(), key, quantity: scaled, quantityMin:Number.isFinite(item.quantityMin) ? item.quantityMin*servings/recipe.servings : undefined,quantityMax:Number.isFinite(item.quantityMax) ? item.quantityMax*servings/recipe.servings : undefined, quantityRaw: item.quantity==null && Number.isFinite(item.quantityMin) ? recipeAmount(item,servings,recipe.servings) : item.quantityRaw, unit: item.unit, name: item.name, translated: item.translated, done: false, sources:[cartRecipeSource(recipe)] });
  });
  cart = consolidateCart(cart).items;
  save(); syncEngine?.syncNow(); showToast(`${needed.length} produktai pridėti${items.length !== needed.length ? ` · ${items.length - needed.length} turite` : ''}`);
}

const SHOPPING_CATEGORIES = ['Mėsa ir žuvis', 'Pieno produktai ir kiaušiniai', 'Daržovės', 'Vaisiai ir uogos', 'Prieskoniai ir žolelės', 'Padažai ir aliejai', 'Kepimo produktai', 'Riešutai ir sėklos', 'Kita'];

function shoppingCategory(item) {
  const key = item.key || ingredientKey(item.name);
  // Classify preparations before their ingredients: fish sauce is a sauce,
  // almond butter is a nut product, and eggplant is never an egg.
  if (/\b(?:oil|sauce|vinegar|mustard|mayonnaise|salsa|broth|stock|bouillon|juice|vinaigrette|dressing|syrup|ketchup|pesto|sriracha|harissa|tzatziki|worcestershire|aminos|guacamole|miso|relish|jam|preserves|brine|cooking spray|lard|duck fat|bacon fat)\b/.test(key) && !/\bmustard seeds\b/.test(key)) return 'Padažai ir aliejai';
  if (/\b(?:flour|baking|erythritol|xylitol|allulose|sweetener|stevia|sucralose|extract|cocoa|cacao|chocolate|psyllium|protein|gelatin|yeast|xanthan|guar gum|glucomannan|food coloring|cream of tartar|sugar replacement|sprinkles|vital wheat gluten)\b/.test(key)) return 'Kepimo produktai';
  if (/\b(?:salt|peppercorns?|black pepper|white pepper|red pepper flakes|paprika|allspice|cloves|cinnamon|nutmeg|oregano|thyme|parsley|cilantro|seasoning|garlic powder|onion powder|ginger|basil|chives|dill|rosemary|sage|tarragon|marjoram|mint|bay leaf|bay leafs|cumin|coriander|turmeric|cardamom|cayenne|chili powder|chile powder|chili paste|chili garlic paste|chili-garlic paste|curry|five spice|five-spice|seven-spice|star anise|zaatar|fenugreek|herbes|furikake|spice blend|pumpkin pie spice|kashmiri mirch|lemongrass)\b/.test(key)) return 'Prieskoniai ir žolelės';
  if (/\b(?:almond|coconut|oat|soy) milk\b|\bcoconut cream\b/.test(key)) return 'Padažai ir aliejai';
  if (/\b(?:almonds?|pecans?|walnuts?|macadamia|peanuts?|cashews?|hazelnuts?|pistachio|pine nuts|seeds?|flax|hemp hearts|nori|tahini|almond butter|coconut butter|cocoa butter|sunflower seed butter)\b/.test(key)) return 'Riešutai ir sėklos';
  if (/\b(?:meat|chicken|beef|pork|bacon|ham|turkey|sausage|hot dogs|salmon|tuna|shrimp|fish|anchovy|bonito|crab|clams?|sardines?|mackerel|hake|cod|tilapia|grouper|mahi mahi|sea bass|duck|lamb|oxtails?|ribs|steak|salami|chorizo|kielbasa|bratwurst|pancetta|prosciutto|pastrami|pepperoni|liver pate|litl smokies|ground chuck|fillet mignon|london broil)\b/.test(key) && !/\b(?:avocado|coconut) meat\b/.test(key)) return 'Mėsa ir žuvis';
  if (/\b(?:cheese|butter|cream|milk|yogurt|eggs?|egg white|egg yolks?|buttermilk|ghee|halfandhalf|half-and-half|parmesan|mozzarella|pecorino|paneer|queso blanco|queso fresco|whey|brie)\b/.test(key) && !/\bbutter lettuce\b/.test(key)) return 'Pieno produktai ir kiaušiniai';
  if (/\b(?:broccoli|broccolini|cauliflower|cabbage|green beans|onion|garlic|cucumber|zucchini|mushrooms?|lettuce|spinach|kale|tomatoes?|avocado|pepper|peppers|celery|asparagus|radish|eggplant|arugula|bok choy|brussels sprouts|artichoke|carrot|celeriac|collard|fennel|green peas|leafy greens|leek|mixed greens|olives?|capers|pumpkin|squash|radicchio|rutabaga|sauerkraut|shallot|spring mix|snap peas|swiss chard|watercress|jalapeno|hearts of palm|bean sprouts|coleslaw|green chile|green chilies|red chile|green chiles|bird's eye chile|bird's eye chili|pickle|pickles|pepperoncinis)\b/.test(key)) return 'Daržovės';
  if (/\b(?:blueberries|raspberries|strawberries|blackberries|cranberries|berries|lemon|lime|orange|apple|pear|pineapple|coconut|rhubarb)\b/.test(key)) return 'Vaisiai ir uogos';
  return 'Kita';
}

function hideShoppingQuantity(item) {
  const category = shoppingCategory(item);
  const key = item.key || ingredientKey(item.name);
  return category === 'Prieskoniai ir žolelės' || category === 'Riešutai ir sėklos' || /(?:stevia|extract|food coloring|xanthan gum|yeast|baking powder|baking soda)/.test(key);
}

function shoppingAmount(item) {
  const quantity=item.quantity ?? item.quantityMax;
  return isCountedIngredient(item) && Number.isFinite(quantity) ? pieceAmount(item,quantity) : metricAmount(item);
}
function shoppingSourcesHtml(item) {
  const sources=mergeCartSources(item.sources);
  if(!sources.length)return `<span class="shop-source-note">${item.manual ? 'Pridėta ranka' : 'Pridėta anksčiau – recepto nuoroda neišsaugota'}</span>`;
  return `<details class="shop-sources"><summary>Receptai (${sources.length})</summary><ul>${sources.map(source=>`<li><a href="#recipe/${encodeURIComponent(source.id)}" data-cart-source="${escapeHtml(source.id)}" data-source-menu="${escapeHtml(source.menuId || '')}" data-source-url="${escapeHtml(source.url || '')}">${escapeHtml(libraryCatalog?.find(recipe=>recipe.url.replace(/\/$/,'').toLowerCase()===(source.url || '').replace(/\/$/,'').toLowerCase())?.title || 'Receptas')}</a><span>${source.origin==='menu' ? 'Iš suplanuoto meniu' : 'Pridėta iš recepto'}</span></li>`).join('')}${item.manual ? '<li class="shop-source-note">Taip pat pridėta ranka</li>' : ''}</ul></details>`;
}
function shoppingItemHtml(item) {
  const hideQuantity = hideShoppingQuantity(item);
  return `<div class="shopping-item ${item.done ? 'done' : ''} ${hideQuantity ? 'no-quantity' : ''}">
      <input type="checkbox" data-cart-check="${item.id}" ${item.done ? 'checked' : ''} aria-label="Pažymėti nupirktu" />
      ${hideQuantity ? '' : `<span class="shop-qty" title="Vienetų kiekiai suapvalinti: nuo 0,3 – aukštyn">${escapeHtml(item.groupAmount ?? shoppingAmount(item))}</span>`}
      <div class="shop-name"><span>${escapeHtml(item.groupName || translateIngredient(item.name))}</span>${item.variants?.length>1 ? `<span class="shop-variants">${item.variants.map(escapeHtml).join(' · ')}</span>` : ''}${shoppingSourcesHtml(item)}</div>
      <div class="shop-actions"><button class="have-at-home" data-pantry-from="${item.id}" title="Palaikykite 1 sekundę, kad pridėtumėte prie turimų namuose">Visada turiu</button>
      <button class="block-product" data-block-product="${item.id}" type="button" title="Palaikykite 1 sekundę, kad užblokuotumėte produktą" aria-label="Užblokuoti produktą: ${escapeHtml(translateIngredient(item.name))}. Palaikykite 1 sekundę" ${isBlockedProduct(item.name) ? 'disabled' : ''}>B</button><button class="block-product ignore-product" data-ignore-product="${item.id}" type="button" title="Palaikykite 1 sekundę: nebeįtraukti į pirkinius, bet palikti receptus" aria-label="Ignoruoti produktą. Palaikykite 1 sekundę">I</button><button class="remove" data-cart-remove="${item.id}" title="Palaikykite 1 sekundę, kad pašalintumėte" aria-label="Pašalinti produktą. Palaikykite 1 sekundę">×</button></div>
    </div>`;
}

function manualCartItem(name, amount) {
  const normalized = searchableText(name);
  const translatedMatch = [...Object.entries(customTranslations), ...Object.entries(translations)].find(([, lithuanian]) => searchableText(lithuanian) === normalized);
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

function searchableText(value = '') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function productSearchText(english,label) {
  const canonical=canonicalIngredientName(english);
  const aliases=PRODUCT_SEARCH_ALIASES[canonical] || [];
  const related= /cabbage|kale|sauerkraut|collard/.test(english) ? 'kopūstas kopūstai cabbage' : '';
  return searchableText([english,canonical,label,translateIngredient(english),...aliases,related].join(' '));
}
function productMatchesSearch(english,label,query) {
  if(!query)return true;
  const haystack=productSearchText(english,label);
  return searchableText(query).split(' ').every(word=>haystack.includes(word));
}

function renderProductSuggestions() {
  const input = $('#manual-product-name'); const panel = $('#product-suggestions'); const query = searchableText(input.value);
  if (query.length < 2) { panel.hidden = true; panel.innerHTML = ''; return; }
  const indexedProduct=(english,lithuanian)=>({english,lithuanian,ltSearch:searchableText(lithuanian),search:productSearchText(english,lithuanian)});
  if(!productSuggestionIndex)productSuggestionIndex=[...new Set([...Object.keys(translations),...Object.keys(customTranslations)])].map(english=>indexedProduct(english,translateIngredient(english)));
  const source=[...productSuggestionIndex,...cart.map(item=>indexedProduct(item.name,translateIngredient(item.name)))];
  const words=query.split(' ');
  const seen = new Set();
  const matches = source.filter(item => words.every(word=>item.search.includes(word)) && !seen.has(item.ltSearch) && seen.add(item.ltSearch))
    .sort((a, b) => Number(b.ltSearch.startsWith(query)) - Number(a.ltSearch.startsWith(query)) || productCollator.compare(a.lithuanian,b.lithuanian)).slice(0, 8);
  panel.innerHTML = matches.map(item => `<button class="product-suggestion" type="button" role="option" data-product-suggestion="${escapeHtml(item.lithuanian)}"><strong>${escapeHtml(item.lithuanian)}</strong></button>`).join('');
  panel.hidden = !matches.length;
}

function shoppingProductKey(name) {
  const key=ingredientKey(name);
  if(/\bavocado\b/.test(key) && !/\boil\b/.test(key))return 'group:avocado';
  if(/\bcauliflower\b/.test(key) || /ziedin.*kopust/.test(searchableText(name)))return 'group:cauliflower';
  return searchableText(translateIngredient(name));
}
function cartGroupItems(id) {
  const item=cart.find(entry=>entry.id===id);if(!item)return [];
  const key=shoppingProductKey(item.name);
  return cart.filter(entry=>shoppingProductKey(entry.name)===key);
}
function groupedShoppingItems() {
  const groups=new Map();
  for(const item of cart){const key=shoppingProductKey(item.name);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
  return [...groups].map(([key,items])=>{
    const buckets=new Map(),other=[];
    for(const item of items) {
      if(!Number.isFinite(item.quantity)){const amount=shoppingAmount(item);if(amount)other.push(amount);continue;}
      const measure=measurement(item.unit);
      const bucket=buckets.get(measure.family) || {...item,quantity:0,unit:measure.family==='weight' ? 'gram' : measure.family==='volume' ? 'milliliter' : item.unit};
      bucket.quantity+=item.quantity*measure.factor;bucket.approximate ||= item.approximate;
      buckets.set(measure.family,bucket);
    }
    return {...items[0],groupName:key==='group:avocado' ? 'Avokadas' : key==='group:cauliflower' ? 'Žiedinis kopūstas' : translateIngredient(items[0].name),groupAmount:key==='group:avocado' && buckets.size ? Math.ceil([...buckets.values()].reduce((total,item)=>total+item.quantity,0)-1e-9)+' vnt.' : [...[...buckets.values()].map(shoppingAmount),...[...new Set(other)]].filter(Boolean).join(' + '),variants:key==='group:avocado' ? [] : [...new Set(items.map(item=>translateIngredient(item.name)))],sources:items.reduce((all,item)=>mergeCartSources(all,item.sources),[]),done:items.every(item=>item.done),manual:items.some(item=>item.manual)};
  });
}
function renderShopping() {
  const list = $('#shopping-list');
  if (!cart.length) list.innerHTML = '<div class="empty"><strong>Pirkinių sąrašas tuščias.</strong><br>Atidarykite receptą ir pridėkite reikalingus ingredientus.</div>';
  else {
    const groups = groupedShoppingItems().reduce((result, item) => { (result[shoppingCategory(item)] ||= []).push(item); return result; }, {});
    list.innerHTML = SHOPPING_CATEGORIES.filter(category => groups[category]?.length).map(category => `<section class="shopping-group"><h2 class="shopping-group-title">${category}<span>${groups[category].length}</span></h2><div class="shopping-group-items">${groups[category].map(shoppingItemHtml).join('')}</div></section>`).join('');
  }
  updateCounts();
}

function renderPantry() {
  $('#pantry-suggestions').innerHTML = pantrySuggestions.filter(name => !isInPantry(name)).map(name => `<button class="pantry-suggestion" data-pantry-suggestion="${escapeHtml(name)}">＋ ${escapeHtml(translateIngredient(name))}</button>`).join('');
  $('#pantry-list').innerHTML = pantry.length ? pantry.map(item => `<span class="pantry-chip">${escapeHtml(translateIngredient(item.key)===item.key ? translateIngredient(item.name) : translateIngredient(item.key))}<button data-pantry-remove="${escapeHtml(item.key)}" aria-label="Pašalinti">×</button></span>`).join('') : '<span class="muted">Sąrašas kol kas tuščias.</span>';
  updateCounts();
}

function dictionaryValue(entry) {
  return customTranslations[entry.key] ?? entry.defaultLt ?? translations[entry.key] ?? '';
}

function renderDictionary() {
  const query = searchableText($('#dictionary-search').value || '');
  const entries = dictionaryData.entries.filter(entry => {
    const text = searchableText([entry.english, dictionaryValue(entry), ...(entry.variants || [])].join(' '));
    return !query || text.includes(query);
  });
  $('#dictionary-summary').textContent = `${dictionaryData.recipesAudited} patikrintų receptų · ${dictionaryData.entries.length} ingredientų${query ? ` · rasta ${entries.length}` : ''}`;
  $('#dictionary-list').innerHTML = entries.length ? entries.map(entry => `
    <label class="dictionary-row">
      <span><strong>${escapeHtml(dictionaryValue(entry) || translateIngredient(entry.english))}</strong><small>${entry.count} receptuose</small></span>
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
  const validProfile=Boolean(currentUserId && users.some(user=>user.id===currentUserId));
  if(!hasSession() || !validProfile){
    profileGateActive=true;mealPlanner.setActive(false);
    document.body.classList.remove('is-planning','is-swiping');
    $$('.view').forEach(view=>view.hidden=true);
    $$('[data-nav]').forEach(link=>link.classList.remove('active'));updateCounts();
    if(!hasSession())requireLogin();
    else if(!document.querySelector('dialog[open]'))showUserChooser();
    return;
  }
  profileGateActive=false;
  document.querySelector('.topbar nav').hidden=false;
  const previousScroll = window.scrollY;
  const preserveScroll = options.preserveScroll === true;
  const hash = location.hash || '#discover';
  if(!preserveScroll)$('#library-owned').open=false;
  document.body.classList.toggle('is-planning',hash === '#discover');
  const detailMatch = hash.match(/^#recipe\/(.+)$/);
  $$('.view').forEach(view => view.hidden = true);
  $$('[data-nav]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
  mealPlanner.setActive(hash === '#discover',{preserveSelection:Boolean(detailMatch)});
  if (hash === '#discover') { $('#discover-view').hidden = false; }
  else if (detailMatch) { $('#detail-view').hidden = false; renderDetail(detailMatch[1]); }
  else if (hash === '#shopping') { $('#shopping-view').hidden = false; renderShopping();if(!libraryCatalog)void loadLibraryCatalog(); }
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
  const deepLink = `${APP_URL}?recipe=${encodeURIComponent(recipe.url)}#recipes`;
  const title=recipe.translations?.lt?.title || libraryCatalog?.find(item=>item.url===recipe.url)?.title || 'Keto receptas';
  const data = { title, text: `Keto receptas: ${title}`, url: deepLink };
  try {
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(deepLink); showToast('Bendrinimo nuoroda nukopijuota'); }
  } catch (error) {
    if (error.name !== 'AbortError') showToast('Nepavyko bendrinti recepto');
  }
}

function cancelPantryHold() {
  if(!pantryHold)return;
  clearTimeout(pantryHold.timeout);clearInterval(pantryHold.interval);
  pantryHold.button.classList.remove('holding');pantryHold.button.textContent=pantryHold.label;pantryHold=null;
}
function startPantryHold(button,event) {
  if(pantryHold || button.disabled)return;
  cancelProductBlock();
  const remove=button.hasAttribute('data-cart-remove'),ignore=button.hasAttribute('data-ignore-product'),label=remove ? '×' : ignore ? 'I' : 'Visada turiu';
  const state={button,label,remove,owner:currentUserId,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,started:Date.now()};
  pantryHold=state;button.classList.add('holding');button.textContent=remove || ignore ? '1' : 'Laikykite 1 s';
  if(event.pointerId!==undefined)button.setPointerCapture?.(event.pointerId);
  state.interval=setInterval(()=>{
    const remaining=Math.max(1,Math.ceil((1000-(Date.now()-state.started))/1000));
    button.textContent=remove || ignore ? String(remaining) : 'Laikykite '+remaining+' s';
  },100);
  state.timeout=setTimeout(()=>{
    const item=cart.find(entry=>entry.id===(remove ? button.dataset.cartRemove : ignore ? button.dataset.ignoreProduct : button.dataset.pantryFrom));
    cancelPantryHold();if(state.owner!==currentUserId || !item)return;
    const members=cartGroupItems(item.id),ids=new Set(members.map(entry=>entry.id));
    if(ignore){
      try{if(!isIgnoredProduct(item.name))saveIgnoredProducts([...ignoredProducts(),{key:item.key || ingredientKey(item.name),name:item.name}]);}
      catch{showToast('Nepavyko išsaugoti ignoravimo.');return;}
    }else if(!remove)for(const entry of members)addToPantry(entry.name,translateIngredient(entry.name));
    cart=cart.filter(entry=>!ids.has(entry.id));save();syncEngine?.syncNow();renderShopping();
    showToast(ignore ? 'Produktas ignoruojamas. Receptai su juo liks siūlomi.' : remove ? 'Produktas pašalintas iš krepšelio' : 'Pridėta prie turimų namuose');
  },1000);
}

$('#manual-cart-form').addEventListener('submit', event => {
  event.preventDefault();
  const nameInput = $('#manual-product-name'); const amountInput = $('#manual-product-amount');
  const name = nameInput.value.trim(); if (!name) return;
  if(isIgnoredProduct(name)){showToast('Šis produktas ignoruojamas. Tai galite pakeisti nustatymuose.');return;}
  const item = manualCartItem(name, amountInput.value);
  if (cart.some(existing => existing.key === item.key && existing.quantity == null && item.quantity == null)) { showToast('Šis produktas jau yra sąraše'); return; }
  cart.push(item); cart = consolidateCart(cart).items; save(); syncEngine?.syncNow(); renderShopping();
  nameInput.value = ''; amountInput.value = ''; $('#product-suggestions').hidden = true; nameInput.focus(); showToast('Produktas pridėtas');
});
$('#manual-product-name').addEventListener('input', renderProductSuggestions);
$('#library-product-search').addEventListener('input',()=>renderLibraryProducts({updateOwned:false}));
$('#shopping-rebuild-menu').addEventListener('click',()=>mealPlanner.rebuildCart());
document.addEventListener('click',async event=>{
  const link=event.target.closest('[data-cart-source]');if(!link)return;
  event.preventDefault();
  recipeContext={menuId:link.dataset.sourceMenu || undefined};recipeReturnRoute='#shopping';
  if(!libraryCatalog)await loadLibraryCatalog();
  const recipe=getRecipe(link.dataset.cartSource) || [...(libraryCatalog || []),...recipes].find(item=>item.url.replace(/\/$/,'').toLowerCase()===link.dataset.sourceUrl.replace(/\/$/,'').toLowerCase());
  if(recipe)location.hash=`#recipe/${recipe.id}`;
  else showToast('Receptas nepasiekiamas. Pabandykite įkelti receptų katalogą dar kartą.');
});
$('#manual-product-name').addEventListener('focus', renderProductSuggestions);
$('#manual-product-name').addEventListener('blur', () => setTimeout(() => { $('#product-suggestions').hidden = true; }, 120));
$('#product-suggestions').addEventListener('pointerdown', event => {
  const option = event.target.closest('[data-product-suggestion]'); if (!option) return;
  event.preventDefault(); $('#manual-product-name').value = option.dataset.productSuggestion; $('#product-suggestions').hidden = true; $('#manual-product-amount').focus();
});

$('#manage-pantry').addEventListener('click', () => { renderPantry(); $('#pantry-dialog').showModal(); });
$('.pantry-close').addEventListener('click', () => $('#pantry-dialog').close());
$('#manage-dictionary').addEventListener('click',()=>$('#settings-dialog').showModal());
$('.profile-settings-close').addEventListener('click',()=>$('#profile-settings-dialog').close());
$('.settings-close').addEventListener('click', () => $('#settings-dialog').close());
$('#open-dictionary').addEventListener('click', async () => {
  $('#settings-dialog').close();
  if (!dictionaryData.entries.length) await loadDictionary();
  renderDictionary(); $('#dictionary-dialog').showModal();
});
$('#change-user').addEventListener('click',()=>{$('#profile-settings-dialog').close();showUserChooser();});
$('#current-user').addEventListener('click',showUserChooser);

$('.dictionary-close').addEventListener('click', () => $('#dictionary-dialog').close());
$('#dictionary-search').addEventListener('input', renderDictionary);
$('#toggle-password').addEventListener('click',()=>{const input=$('#app-password'),show=input.type==='password';input.type=show ? 'text' : 'password';const label=show ? 'Slėpti slaptažodį' : 'Rodyti slaptažodį';$('#toggle-password').setAttribute('aria-label',label);$('#toggle-password').title=label;$('#toggle-password').setAttribute('aria-pressed',String(show));});
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('button[type="submit"]', event.currentTarget); const status = $('#login-status');
  button.disabled = true; button.textContent = 'Tikrinama…'; status.textContent = '';
  try {
    await loginWithPassword($('#app-password').value); $('#app-password').value = ''; $('#login-dialog').close(); await syncEngine.start();
  } catch (error) { status.className = 'status error'; status.textContent = error.message || 'Prisijungti nepavyko'; }
  finally { button.disabled = false; button.textContent = 'Prisijungti'; }
});
$('#login-dialog').addEventListener('cancel', event => event.preventDefault());
$('#users-dialog').addEventListener('cancel',event=>{if(!users.some(user=>user.id===currentUserId)){event.preventDefault();return;}userChooserDismissed=true;});
$('#users-cancel').addEventListener('click',()=>{if(!users.some(user=>user.id===currentUserId))return;userChooserDismissed=true;$('#users-dialog').close();});
function readNewMembers(){return [...$('#new-household-members').querySelectorAll('[data-new-member]')].map(row=>({id:row.dataset.newMember,name:row.querySelector('[data-new-name]').value.trim(),calories:Number(row.querySelector('[data-new-calories]').value),meals:[...row.querySelectorAll('[data-new-meal]:checked')].map(input=>input.value)}));}
function drawNewMembers(members){
  $('#new-household-members').innerHTML=members.map((member,index)=>`<fieldset data-new-member="${escapeHtml(member.id)}"><legend>Asmuo ${index+1}</legend><label>Vardas<input data-new-name type="text" required maxlength="60" value="${escapeHtml(member.name)}"></label><label>Dienos kalorijų tikslas<span class="calorie-control"><input data-new-calories type="number" required min="100" max="10000" step="1" value="${member.calories}"><span class="calorie-arrows"><button type="button" data-calorie-step="100" aria-label="Padidinti 100 kcal">▲</button><button type="button" data-calorie-step="-100" aria-label="Sumažinti 100 kcal">▼</button></span></span></label><div class="household-meals">${Object.entries({breakfast:'Pusryčiai',lunch:'Pietūs',dinner:'Vakarienė',dessert:'Desertas'}).map(([id,label])=>`<label><input data-new-meal type="checkbox" value="${id}" ${member.meals.includes(id) ? 'checked' : ''}>${label}</label>`).join('')}</div></fieldset>`).join('');
}
$('#users-create').addEventListener('click',()=>{
  $('#users-dialog').close();$('#user-form').reset();$('#new-household-status').textContent='';
  drawNewMembers([{id:crypto.randomUUID(),name:'',calories:2000,meals:['breakfast','lunch','dinner','dessert']}]);
  $('#create-household-dialog').showModal();$('#user-name').focus();
});
$('#new-household-count').addEventListener('change',event=>{
  if(!event.target.reportValidity())return;const count=Number(event.target.value),members=readNewMembers();
  drawNewMembers(Array.from({length:count},(_,index)=>members[index] || {id:crypto.randomUUID(),name:'',calories:2000,meals:['breakfast','lunch','dinner','dessert']}));
});
$('#create-household-cancel').addEventListener('click',()=>{$('#create-household-dialog').close();showUserChooser();});
$('#create-household-dialog').addEventListener('cancel',()=>{setTimeout(showUserChooser,0);});
$('#user-form').addEventListener('submit',event=>{
  event.preventDefault();if(!event.currentTarget.reportValidity())return;
  const name=$('#user-name').value.trim(),members=readNewMembers();
  if(!name || members.some(member=>!member.name || !member.meals.length)){$('#new-household-status').textContent='Įveskite šeimos bei narių vardus ir kiekvienam pažymėkite bent vieną valgymą.';return;}
  if(users.some(user=>user.name.toLocaleLowerCase('lt')===name.toLocaleLowerCase('lt'))){$('#new-household-status').textContent='Toks profilis jau yra.';return;}
  const user={id:crypto.randomUUID(),name,householdMembers:normalizeMembers(members),createdAt:new Date().toISOString()};
  users.push(user);save();$('#create-household-dialog').close();history.replaceState(null,'',location.pathname+location.search+'#discover');chooseUser(user.id);mealPlanner.configureHousehold(members.length,name,members);
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
  if(target.matches('[data-profile-settings]')){
    const user=users.find(item=>item.id===target.dataset.profileSettings);if(!user)return;
    persistActiveUserState();currentUserId=user.id;loadActiveUserState(user.id);localStorage.setItem(STORAGE.currentUser,user.id);save();
    $('#users-dialog').close();mealPlanner.syncSettings();renderBlockedProducts();$('#profile-settings-dialog').showModal();route();
  }
  if(target.matches('#blocked-meals-close,#blocked-meals-later'))$('#blocked-meals-dialog').close();
  if(target.matches('[data-replace-blocked-meal]')) {
    const slot=blockedMealChoices[Number(target.dataset.replaceBlockedMeal)];if(!slot)return;
    $('#blocked-meals-dialog').close();location.hash='#discover';
    void mealPlanner.replacePlanned(slot);
  }
  if(target.matches('[data-block-product]'))event.preventDefault();
  if(target.matches('[data-unignore-product]')) {
    try{saveIgnoredProducts(ignoredProducts().filter(item=>item.key!==target.dataset.unignoreProduct));renderIgnoredProducts();showToast('Produktas vėl bus pridedamas į pirkinius');}catch{showToast('Nepavyko išsaugoti pakeitimo.');}
  }
  if(target.matches('[data-unblock-product]')) {
    try{saveBlockedProducts(blockedProducts().filter(item=>item.key!==target.dataset.unblockProduct));renderBlockedProducts();mealPlanner.render();if(!$('#recipes-view').hidden)renderRecipes();showToast('Produktas atblokuotas');}
    catch{showToast('Nepavyko išsaugoti pakeitimo.');}
  }

  if(target.matches('#library-clear-products')) {
    pantry=[];libraryAvailability=false;libraryLimit=48;
    $('#library-owned').open=false;
    save();syncEngine?.syncNow();renderRecipes();showToast('Turimų produktų sąrašas išvalytas');
  }
  if(target.matches('[data-library-retry]'))void loadLibraryCatalog();
  if(target.matches('[data-library-category]')) {libraryCategory=target.dataset.libraryCategory;libraryLimit=48;renderRecipes();}
  if(target.matches('#library-more')) {libraryLimit+=48;renderRecipes();}
  if (target.matches('[data-copy-url]')) {
    navigator.clipboard.writeText(target.dataset.copyUrl).then(() => showToast('Nuoroda nukopijuota')).catch(() => showToast('Nepavyko nukopijuoti'));
  }
  if (target.matches('[data-share-recipe]')) {
    const recipe = getRecipe(target.dataset.shareRecipe);
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
  if (target.matches('[data-open-recipe]')) {recipeContext=null;recipeReturnRoute='#recipes';location.hash = `#recipe/${target.dataset.openRecipe}`;}
  if (target.matches('[data-filter]')) { activeFilter = target.dataset.filter; libraryLimit=48;renderRecipes(); }
  if (target.matches('[data-pin-recipe]')) {
    const recipe = getRecipe(target.dataset.pinRecipe);
    if (recipe) { toggleCatalogFavorite(recipe); renderRecipes(); }
  }
  if (target.matches('[data-toggle-favorite]')) { const recipe=getRecipe(target.dataset.toggleFavorite);if(recipe){toggleCatalogFavorite(recipe);renderDetail(recipe.id,recipe.currentServings);}}
  if (target.matches('[data-quick-cart]')) { const recipe = getRecipe(target.dataset.quickCart); if (recipe) addRecipeToCart(recipe); }
  if (target.matches('[data-back]')) location.hash = recipeReturnRoute;
  if (target.matches('[data-delete]')) { if (confirm('Ištrinti šį receptą?')) { const removed = recipes.find(item => item.id === target.dataset.delete); recipes = recipes.filter(item => item.id !== target.dataset.delete); if (removed && currentUserId) userRecipeRefs[currentUserId] = (userRecipeRefs[currentUserId] || []).filter(url => url.replace(/\/$/, '').toLowerCase() !== removed.url.replace(/\/$/, '').toLowerCase()); localStorage.setItem(STORAGE.userRecipeRefs, JSON.stringify(userRecipeRefs)); save(); renderRecipes(); } }
  if (target.matches('[data-step]')) { const recipe = getRecipe(activeRecipeId); const next = Math.min(99,Math.max(1, (recipe.currentServings || mealPlanner.portions().people) + Number(target.dataset.step))); renderDetail(recipe.id, next); }
  if (target.matches('[data-toggle]')) { const boxes = $$('[data-ingredient]'); const anyChecked = boxes.some(box => box.checked); boxes.forEach(box => box.checked = !anyChecked); target.textContent = anyChecked ? 'Pažymėti visus' : 'Atžymėti visus'; }
  if (target.matches('[data-add-cart]')) addSelectedToCart();
  if(target.matches('[data-cart-remove],[data-pantry-from],[data-ignore-product]'))event.preventDefault();
  if (target.matches('#clear-cart') && cart.length && confirm('Išvalyti visą pirkinių sąrašą?')) { cart = []; save(); syncEngine?.syncNow(); renderShopping(); }
});

document.addEventListener('change', event => {
  if(event.target.matches('[data-recipe-servings]')) {
    const input=event.target;
    if(!input.reportValidity())return;
    renderDetail(activeRecipeId,peopleCount(input.value));
  }
  if(event.target.matches('#library-unreviewed')) {libraryUnreviewed=event.target.checked;libraryLimit=48;renderRecipes();}
  if(event.target.matches('#library-availability')) {libraryAvailability=event.target.checked;libraryLimit=48;renderRecipes();}
  if(event.target.matches('[data-library-product]')) {
    const input=event.target;
    if(input.checked) {
      if(!pantry.some(item=>item.key===input.dataset.libraryProduct))pantry.push({key:input.dataset.libraryProduct,name:input.dataset.productLabel});
      libraryAvailability=true;
    } else pantry=pantry.filter(item=>item.key!==input.dataset.libraryProduct);
    save();syncEngine?.syncNow();libraryLimit=48;renderRecipes();
  }
  if (event.target.matches('[data-cart-check]')) { const item = cart.find(i => i.id === event.target.dataset.cartCheck); if(item)for(const member of cartGroupItems(item.id))member.done=event.target.checked; save(); syncEngine?.syncNow(); renderShopping(); }
  if (event.target.matches('[data-dictionary-input]')) {
    const key = event.target.dataset.dictionaryInput; const value = event.target.value.trim();
    if (value) customTranslations[key] = value; else delete customTranslations[key];
    saveDictionary(); renderShopping(); showToast(value ? 'Vertimas išsaugotas' : 'Grąžintas pradinis vertimas');
  }
});

document.addEventListener('pointerdown', event => {
  const blockButton=event.target.closest('[data-block-product]');
  if(blockButton && event.button===0){event.preventDefault();cancelPantryHold();startProductBlock(blockButton,event);return;}
  const button = event.target.closest('[data-pantry-from],[data-cart-remove],[data-ignore-product]');
  if (!button || event.button!==0) return;
  event.preventDefault(); startPantryHold(button, event);
});
document.addEventListener('pointermove', event => {
  if (!pantryHold || event.pointerId !== pantryHold.pointerId) return;
  if (Math.hypot(event.clientX - pantryHold.startX, event.clientY - pantryHold.startY) > 35) cancelPantryHold();
});
document.addEventListener('pointerup', event => { if (productBlockHold?.pointerId===event.pointerId)cancelProductBlock();if (pantryHold?.pointerId === event.pointerId) cancelPantryHold(); });
document.addEventListener('pointercancel', event => {if(productBlockHold?.pointerId===event.pointerId)cancelProductBlock(); if (pantryHold?.pointerId === event.pointerId) cancelPantryHold(); });
document.addEventListener('contextmenu', event => { if (event.target.closest('[data-pantry-from],[data-cart-remove],[data-ignore-product],[data-block-product]')) event.preventDefault(); });
document.addEventListener('pointermove',event=>{const state=productBlockHold;if(state?.pointerId===event.pointerId && Math.hypot(event.clientX-state.x,event.clientY-state.y)>25)cancelProductBlock();});
document.addEventListener('keydown',event=>{const button=event.target.closest('[data-block-product]');if(button && [' ','Enter'].includes(event.key)){event.preventDefault();if(!event.repeat)startProductBlock(button,event);}});
document.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key) && productBlockHold?.pointerId===undefined)cancelProductBlock();});
document.addEventListener('focusout',event=>{if(event.target===productBlockHold?.button)cancelProductBlock();});
window.addEventListener('blur',cancelProductBlock);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelProductBlock();});

window.addEventListener('hashchange', route);
if ('serviceWorker' in navigator) {
  let reloadingForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadingForUpdate) return; reloadingForUpdate = true; location.reload();
  });
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('./sw.js?v=126', { updateViaCache: 'none' });
    registration.update();
  });
}
syncEngine = createSyncEngine({
  getStore: syncStore,
  applyStore: applySyncedStore,
  onAuthRequired: requireLogin,
  onStatus: status => { const user = $('#current-user'); user.dataset.sync = status; user.title = 'Keisti vartotoją · ' + (status === 'synced' ? 'Duomenys sinchronizuoti' : status === 'saving' ? 'Sinchronizuojama…' : 'Veikia neprisijungus'); },
  onFirstSync: conflicts => {
    if (conflicts.length) showToast('Kai kuriuos pakeitimus pirmiau atliko kitas įrenginys');
    if(profileGateActive || !currentUserId || !users.some(item=>item.id===currentUserId))route({preserveScroll:true});
  },
});
migrateLegacyIngredientNames();
if(location.hash==='#add')history.replaceState(null,'',location.pathname+location.search+'#recipes');
route();
hydrateMissingImages();
if (hasSession()) syncEngine.start(); else requireLogin();

document.addEventListener('keydown',event=>{const button=event.target.closest('[data-pantry-from],[data-cart-remove],[data-ignore-product]');if(button && [' ','Enter'].includes(event.key)){event.preventDefault();if(!event.repeat)startPantryHold(button,event);}});
document.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key) && pantryHold?.pointerId===undefined)cancelPantryHold();});
document.addEventListener('focusout',event=>{if(event.target===pantryHold?.button)cancelPantryHold();});
window.addEventListener('blur',cancelPantryHold);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelPantryHold();});

function adjustCalories(input, delta) {
  const current = input.valueAsNumber;
  input.value = Math.min(Number(input.max), Math.max(Number(input.min), (Number.isFinite(current) ? current : 2000) + delta));
  input.dispatchEvent(new Event('input', {bubbles:true}));
  input.dispatchEvent(new Event('change', {bubbles:true}));
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-calorie-step]');
  if (button) adjustCalories(button.closest('.calorie-control').querySelector('input'), Number(button.dataset.calorieStep));
});
document.addEventListener('keydown', event => {
  if (event.target.matches('[data-new-calories], [data-member-calories]') && ['ArrowUp','ArrowDown'].includes(event.key)) {
    event.preventDefault();
    adjustCalories(event.target, event.key === 'ArrowUp' ? 100 : -100);
  }
});

initializeRecipeFlags(showToast);

document.addEventListener('recipe-flags-changed',()=>{if(location.hash==='#recipes' && libraryUnreviewed)renderRecipes();});
