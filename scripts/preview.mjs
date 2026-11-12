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
    if(['/api/login','/api/sync','/api/validate'].includes(pathname)) {
      // Same-origin local gateway: keep browser storage on 127.0.0.1 and avoid CORS.
      // The upstream host and endpoints are fixed; authentication is still checked there.
      if(!['POST','OPTIONS'].includes(request.method)){response.writeHead(405);response.end();return;}
      if(request.method==='OPTIONS'){response.writeHead(204,{'allow':'POST, OPTIONS'});response.end();return;}
      const chunks=[];let bytes=0;
      for await(const chunk of request){bytes+=chunk.length;if(bytes>5*1024*1024){response.writeHead(413);response.end();return;}chunks.push(chunk);}
      try {
        const upstream=await fetch(`https://mano-keto-sync.gailius-besusparis.chatgpt.site${pathname}`,{method:'POST',headers:{'content-type':'application/json',...(request.headers.authorization ? {authorization:request.headers.authorization} : {})},body:Buffer.concat(chunks),signal:AbortSignal.timeout(30000),redirect:'error'});
        response.writeHead(upstream.status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
        response.end(Buffer.from(await upstream.arrayBuffer()));
      }catch{response.writeHead(502,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});response.end(JSON.stringify({error:'Nepavyko pasiekti sinchronizacijos serverio. Pabandykite dar kartą.'}));}
      return;
    }
    if(pathname==='/__planner-preview') {
      const page=(await fs.readFile(path.join(root,'index.html'),'utf8')).replace(/\.\/app\.js\?v=\d+/,'./__qa/app.js?v=122');
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
