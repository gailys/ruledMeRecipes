import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const project=await fs.realpath(fileURLToPath(new URL('../',import.meta.url)));
const dataRoot=await fs.realpath(path.join(project,'data'));
const archiveRoot=path.resolve(project,'nenaudojama');
const categories=['breakfast','lunch','dinner','dessert','snacks','side-items','condiments'];
const relative=file=>path.relative(project,file).split(path.sep).join('/');
function inside(parent,file) {
  const value=path.relative(parent,path.resolve(file));
  if(!value || value==='..' || value.startsWith(`..${path.sep}`) || path.isAbsolute(value))throw new Error(`Path outside intended directory: ${file}`);
  return path.resolve(file);
}
inside(project,dataRoot);inside(project,archiveRoot);
await fs.mkdir(archiveRoot,{recursive:true});
inside(project,await fs.realpath(archiveRoot));
const manifestFile=path.join(archiveRoot,'nuotraukos.json');
let previous={images:[]};
try {
  previous=JSON.parse(await fs.readFile(manifestFile,'utf8'));
  if(previous.schemaVersion!==1 || !Array.isArray(previous.images))throw new Error('Unrecognized archive manifest');
}catch(error){if(error.code!=='ENOENT')throw error;}
const entries=new Map(previous.images.map(image=>[image.originalPath,image]));
const originalByArchive=new Map(previous.images.map(image=>[image.archivedPath,image.originalPath]));
const catalog=JSON.parse(await fs.readFile(path.join(dataRoot,'planner','recipes.json'),'utf8'));
const used=new Set(catalog.recipes.map(recipe=>relative(inside(project,path.resolve(project,recipe.image)))));
const archives=new Map(),references=new Map();
for(const category of categories) {
  const directory=path.join(dataRoot,category);
  const archive=JSON.parse(await fs.readFile(path.join(directory,'recipes.json'),'utf8'));
  archives.set(category,archive);
  for(const recipe of archive.recipes)for(const image of recipe.images || []) {
    if(!image.path)continue;
    const current=relative(inside(project,path.resolve(directory,image.path)));
    const original=originalByArchive.get(current) || current;
    const group=references.get(original) || new Map();
    const key=`${category}:${recipe.id}`;
    const reference=group.get(key) || {id:recipe.id,slug:recipe.slug,title:recipe.title,category,url:recipe.url,sourceImageUrls:[]};
    if(image.sourceUrl && !reference.sourceImageUrls.includes(image.sourceUrl))reference.sourceImageUrls.push(image.sourceUrl);
    group.set(key,reference);references.set(original,group);
  }
  const imageDirectory=await fs.realpath(path.join(directory,'images'));
  inside(dataRoot,imageDirectory);
  for(const item of await fs.readdir(imageDirectory,{withFileTypes:true})) {
    if(!item.isFile())throw new Error(`Unexpected directory or link in image folder: ${item.name}`);
    if(!/\.(avif|webp|png|jpe?g|gif|svg)$/i.test(item.name))continue;
    const source=inside(dataRoot,path.join(imageDirectory,item.name)),originalPath=relative(source);
    if(used.has(originalPath))continue;
    const target=inside(archiveRoot,path.join(archiveRoot,category,'images',item.name));
    if(!entries.has(originalPath))entries.set(originalPath,{originalPath,archivedPath:relative(target),bytes:(await fs.stat(source)).size,status:'pending'});
  }
}
for(const entry of entries.values()) {
  inside(dataRoot,path.resolve(project,entry.originalPath));
  inside(archiveRoot,path.resolve(project,entry.archivedPath));
  entry.recipes=[...(references.get(entry.originalPath)?.values() || entry.recipes || [])];
  entry.sourceUrls=[...new Set(entry.recipes.flatMap(recipe=>recipe.sourceImageUrls))];
}
const manifest={schemaVersion:1,generatedAt:new Date().toISOString(),pathBase:'project-root',criterion:'Images not referenced by data/planner/recipes.json; app covers and icons stay in place.',activeImageCount:used.size,summary:{},images:[...entries.values()].sort((a,b)=>a.originalPath.localeCompare(b.originalPath))};
const writeManifest=async()=>fs.writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
await writeManifest();
console.log(`Keeping ${used.size} app covers; archiving ${manifest.images.length} unused recipe images.`);
let done=0;
try {
  for(const entry of manifest.images) {
    const source=inside(dataRoot,path.resolve(project,entry.originalPath));
    const target=inside(archiveRoot,path.resolve(project,entry.archivedPath));
    await fs.mkdir(path.dirname(target),{recursive:true});
    inside(archiveRoot,await fs.realpath(path.dirname(target)));
    let sourceExists=true,targetExists=true;
    try{await fs.access(source);}catch(error){if(error.code!=='ENOENT')throw error;sourceExists=false;}
    try{await fs.access(target);}catch(error){if(error.code!=='ENOENT')throw error;targetExists=false;}
    if(sourceExists && targetExists)throw new Error(`Destination already exists; refusing to overwrite: ${target}`);
    if(!sourceExists && !targetExists)throw new Error(`Neither original nor archived image exists: ${entry.originalPath}`);
    const bytes=await fs.readFile(sourceExists ? source : target);
    entry.sha256=createHash('sha256').update(bytes).digest('hex');entry.bytes=bytes.length;
    if(sourceExists)await fs.rename(source,target);
    entry.status='moved';done++;
    if(done%1000===0)console.log(`Archived ${done}/${manifest.images.length}`);
  }
}catch(error){manifest.error=error.message;await writeManifest();throw error;}
manifest.summary={archivedFiles:done,archivedBytes:manifest.images.reduce((sum,image)=>sum+image.bytes,0),imagesWithoutRecipe:manifest.images.filter(image=>!image.recipes.length).length};
manifest.metadataStatus='updating';await writeManifest();
const relocated=new Map(manifest.images.map(image=>[image.originalPath,image.archivedPath]));
for(const [category,archive] of archives) {
  const directory=path.join(dataRoot,category);
  const relocate=value=>{
    if(!value)return value;
    const moved=relocated.get(relative(path.resolve(directory,value)));
    return moved ? path.relative(directory,path.resolve(project,moved)).split(path.sep).join('/') : value;
  };
  for(const recipe of archive.recipes) {
    const before=JSON.stringify(recipe);
    recipe.featuredImage=relocate(recipe.featuredImage);
    recipe.images=recipe.images.map(image=>{
      const moved=relocate(image.path);
      return moved!==image.path ? {...image,path:moved,archived:true,originalPath:image.originalPath || image.path} : image;
    });
    if(JSON.stringify(recipe)!==before)await fs.writeFile(path.join(directory,'recipes',`${recipe.slug}.json`),JSON.stringify(recipe,null,2)+'\n');
  }
  await fs.writeFile(path.join(directory,'recipes.json'),JSON.stringify(archive,null,2)+'\n');
}
const combinedFile=path.join(dataRoot,'recipes.json');
const combined=JSON.parse(await fs.readFile(combinedFile,'utf8'));
const combinedPath=(category,value)=>value ? path.relative(dataRoot,path.resolve(dataRoot,category,value)).split(path.sep).join('/') : value;
combined.recipes=[...archives].flatMap(([category,archive])=>archive.recipes.map(recipe=>({...recipe,images:recipe.images.map(image=>({...image,path:combinedPath(category,image.path)})),featuredImage:combinedPath(category,recipe.featuredImage),sourceHtml:combinedPath(category,recipe.sourceHtml)})));
await fs.writeFile(combinedFile,JSON.stringify(combined,null,2)+'\n');
manifest.metadataStatus='updated';delete manifest.error;await writeManifest();
console.log(JSON.stringify({activeImages:used.size,...manifest.summary,manifest:relative(manifestFile)},null,2));
