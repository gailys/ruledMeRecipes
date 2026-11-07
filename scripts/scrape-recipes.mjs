import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
const category = process.argv[2] || 'breakfast';
const categories = ['breakfast','lunch','dinner','dessert','snacks','side-items','condiments'];
if (!categories.includes(category)) throw new Error(`Unknown category: ${category}`);
const root = new URL(`../data/${category}/`, import.meta.url);
await fs.mkdir(root, { recursive: true });
const projectRoot=new URL('../',import.meta.url);
const archivedImages=new Map();
try {
  const archive=JSON.parse(await fs.readFile(new URL('nenaudojama/nuotraukos.json',projectRoot),'utf8'));
  for(const image of archive.images || [])for(const source of image.sourceUrls || [])archivedImages.set(source,image);
}catch(error){if(error.code!=='ENOENT')throw error;}
async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(90000), headers: { 'User-Agent': 'RecipeArchive/1.0 (personal recipe collection)' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return response;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
}
const index = await (await get('https://www.ruled.me/wp-content/uploads/rrh/recipe-index.json')).json();
await fs.writeFile(new URL('source-index.json', root), JSON.stringify(index, null, 2));
const entries = index.recipes.filter(item => item.c === category);
await fs.mkdir(new URL('pages/', root), { recursive: true });
console.log(`Found ${entries.length} ${category} recipes`);
await fs.mkdir(new URL('images/', root), { recursive: true });
await fs.mkdir(new URL('recipes/', root), { recursive: true });
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, key) => key[0] === '#' ? String.fromCodePoint(key[1].toLowerCase() === 'x' ? parseInt(key.slice(2),16) : Number(key.slice(1))) : ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '})[key.toLowerCase()]).replace(/\s+/g,' ').trim();
function nodes(value) {
  if (!value || typeof value !== 'object') return [];
  return [value, ...Object.values(value).flatMap(v => typeof v === 'object' ? nodes(v) : [])];
}
const recipes = [], failures = [], imageFailures = [];
const imageJobs = new Map();
function imageFormat(bytes) {
  const signature = bytes.subarray(0,12).toString('hex');
  return bytes.toString('ascii',4,8)==='ftyp' && /avif|avis/.test(bytes.toString('ascii',8,32)) ? 'avif' : bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP' ? 'webp' : signature.startsWith('89504e470d0a1a0a') ? 'png' : signature.startsWith('47494638') ? 'gif' : signature.startsWith('ffd8ff') ? 'jpg' : null;
}
async function image(url) {
  if (!url || !/^https?:/.test(url)) return null;
  if (!imageJobs.has(url)) imageJobs.set(url, (async () => {
    let path = `images/${createHash('sha256').update(url).digest('hex').slice(0,24)}${new URL(url).pathname.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || '.jpg'}`;
    try {
      const archived=archivedImages.get(url);
      if(archived) {
        try {
          const file=new URL(archived.archivedPath,projectRoot);
          const cached=await fs.readFile(file);
          if(imageFormat(cached))return {sourceUrl:url,path:nodePath.relative(fileURLToPath(root),fileURLToPath(file)).split(nodePath.sep).join('/'),archived:true,originalPath:nodePath.relative(fileURLToPath(root),fileURLToPath(new URL(archived.originalPath,projectRoot))).split(nodePath.sep).join('/')};
        }catch(error){if(error.code!=='ENOENT')throw error;}
      }
      let bytes;
      for (const candidate of [path,...['avif','webp','png','jpg','gif'].map(ext=>path.replace(/\.[^.]+$/,`.${ext}`))]) {
        try {
          const cached = await fs.readFile(new URL(candidate,root));
          if (imageFormat(cached)) { bytes = cached; path = candidate; break; }
        } catch {}
      }
      if (!bytes) {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const requestUrl = new URL(url);
            if (attempt) requestUrl.searchParams.set('archive',String(attempt));
            const response = await get(requestUrl.href);
            if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error('Non-image response');
            bytes = Buffer.from(await response.arrayBuffer());
            if (!imageFormat(bytes)) throw new Error('Empty or unrecognized image response');
            break;
          } catch (error) { if (attempt === 2) throw error; }
        }
        await fs.writeFile(new URL(path,root), bytes);
      }
      const ext = imageFormat(bytes);
      if (!ext) throw new Error('Unrecognized image format');
      if (!(ext === 'jpg' && /\.jpe?g$/i.test(path)) && !path.endsWith(`.${ext}`)) {
        const corrected = path.replace(/\.[^.]+$/,`.${ext}`);
        await fs.rename(new URL(path,root),new URL(corrected,root)); path = corrected;
      }
      return { sourceUrl: url, path };
    } catch (error) { imageFailures.push({url,error:error.message}); return {sourceUrl:url,path:null}; }
  })());
  return imageJobs.get(url);
}
async function scrape(entry) {
  const url = new URL(entry.u, 'https://www.ruled.me').href;
  const slug = entry.u.split('/').filter(Boolean).pop();
  try {
    const page = new URL(`pages/${slug}.html`,root);
    let html;
    try { html = await fs.readFile(page,'utf8'); } catch { html = await (await get(url)).text(); await fs.writeFile(page,html); }
    const schemas = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => JSON.parse(m[1]));
    const raw = schemas.flatMap(nodes).find(n => [].concat(n['@type'] || []).includes('Recipe'));
    if (!raw) throw new Error('No Recipe structured data');
    const steps = (items,group='') => [].concat(items || []).flatMap(item => typeof item === 'string' ? [{text:clean(item),group}] : item.itemListElement ? steps(item.itemListElement,clean(item.name)) : [{text:clean(item.text || item.name),group,sourceUrl:item.url || null,imageSource:typeof item.image === 'string' ? item.image : item.image?.url || null}]);
    const instructions = steps(raw.recipeInstructions);
    if (!raw.recipeIngredient?.length || !instructions.length) throw new Error('Missing ingredients or instructions');
    const content = html.split(/<div[^>]*class="entry-content"[^>]*>/i)[1]?.split(/class="(?:related-posts|entry-footer|comment)/i)[0] || '';
    const sources = new Set([entry.img,...[].concat(raw.image || []).slice(0,1).map(i => typeof i === 'string' ? i : i.url),...instructions.map(i=>i.imageSource)] .filter(Boolean));
    for (const tag of content.matchAll(/<img\b[^>]*>/gi)) {
      const source = tag[0].match(/\bdata-lazy-src="([^"]+)"/i)?.[1] || tag[0].match(/\bsrc="([^"]+)"/i)?.[1];
      if (source?.includes('/uploads/') && !/RecipeBottomAd|banner|logo|avatar|Profile|app-featured/i.test(source)) sources.add(source.replace(/&amp;/g,'&'));
    }
    const images = [];
    for (const source of sources) images.push(await image(source));
    const recipe = { id:`ruled-${entry.id}`,slug,title:clean(raw.name),url,source:'Ruled.me',category,language:'en',description:clean(raw.description),servings:entry.sv,yield:raw.recipeYield,prepTime:raw.prepTime || null,cookTime:raw.cookTime || null,totalTime:raw.totalTime || null,totalMinutes:entry.tm,nutrition:raw.nutrition || null,nutritionPerServing:{calories:entry.cal,netCarbsGrams:entry.nc,proteinGrams:entry.pr,fatGrams:entry.fa},ingredients:raw.recipeIngredient.map(clean),instructions,keywords:entry.kw,filters:entry.fk,images,featuredImage:images.find(i=>i.sourceUrl === [].concat(raw.image || [])[0])?.path || images[0]?.path,rawRecipe:raw,sourceIndex:entry,sourceHtml:`pages/${slug}.html`,scrapedAt:new Date().toISOString() };
    await fs.writeFile(new URL(`recipes/${slug}.json`,root),JSON.stringify(recipe,null,2)+'\n');
    recipes.push(recipe);
    console.log(`${recipes.length}/${entries.length}: ${recipe.title} (${images.length} images)`);
  } catch(error) { failures.push({url,error:error.message}); console.error(`FAILED ${url}: ${error.message}`); }
}
let cursor = 0;
await Promise.all(Array.from({length:3},async()=>{while(cursor < entries.length) await scrape(entries[cursor++]);}));
recipes.sort((a,b)=>a.slug.localeCompare(b.slug));
const report = {sourceUrl:`https://www.ruled.me/keto-recipes/${category}/`,scrapedAt:new Date().toISOString(),indexBuiltAt:index.built,expected:entries.length,saved:recipes.length,imageCount:imageJobs.size,failures,imageFailures};
await fs.writeFile(new URL('recipes.json',root),JSON.stringify({schemaVersion:1,...report,recipes},null,2)+'\n');
await fs.writeFile(new URL('scrape-report.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if (failures.length || imageFailures.length) process.exitCode = 1;

