// Local-only preview. /__planner-preview isolates UI QA from the production sync service.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.argv[2] || 4173);
if(!Number.isInteger(port) || port<1024 || port>65535)throw new Error('Invalid preview port');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer(async(request,response)=>{
  try {
    const url=new URL(request.url,'http://127.0.0.1');
    let pathname=decodeURIComponent(url.pathname);
    if(pathname==='/__planner-preview') {
      const page=(await fs.readFile(path.join(root,'index.html'),'utf8')).replace(/\.\/app\.js\?v=\d+/,'./__qa/app.js?v=65');
      response.writeHead(200,{'content-type':mime['.html'],'cache-control':'no-store'});response.end(page);return;
    }
    if(pathname==='/__qa/sync.js') {
      response.writeHead(200,{'content-type':mime['.js'],'cache-control':'no-store'});
      response.end('export const hasSession=()=>true;export const loginWithPassword=async()=>{};export const validateRecipeUrls=async()=>[];export const createSyncEngine=({onFirstSync})=>({start:async()=>onFirstSync([]),changed(){},syncNow:async()=>{}});');return;
    }
    pathname=pathname.replace(/^\/__qa\//,'/');
    if(pathname.endsWith('/'))pathname+='index.html';
    const file=path.resolve(root,`.${pathname}`);
    if(!file.startsWith(root) || pathname.split('/').some(part=>part.startsWith('.'))) {response.writeHead(403);response.end();return;}
    let bytes=await fs.readFile(file);
    if(url.pathname==='/__qa/app.js') bytes=Buffer.from(bytes.toString().replace("if ('serviceWorker' in navigator)","if (false)"));
    response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});response.end(bytes);
  }catch{response.writeHead(404);response.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}\nIsolated UI preview: http://127.0.0.1:${port}/__planner-preview#discover`));
