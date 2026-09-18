import http from 'node:http';
import {readFile,realpath,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const DEFAULT_ROOT=fileURLToPath(new URL('../../../artifacts/demo/',import.meta.url));
const MIME={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export function createDemoServer(root=DEFAULT_ROOT) {
 return http.createServer(async(req,res)=>{
  const headers={'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
  const end=(status,body='',type='text/plain; charset=utf-8')=>{res.writeHead(status,{...headers,'Content-Type':type});res.end(req.method==='HEAD'?'':body);};
  if(!['GET','HEAD'].includes(req.method)) return end(405,'Method not allowed');
  try {
   const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
   const segments=pathname.split('/').filter(Boolean);
   if(!pathname.startsWith('/')||pathname.includes('\\')||pathname.includes('\0')||segments.some(s=>s.startsWith('.')||s==='private-evidence'))return end(403,'Forbidden');
   const base=await realpath(root); const relative=segments.length?segments:['report.html']; let target=base;
   for(const segment of relative){target=path.join(target,segment);if((await lstat(target)).isSymbolicLink())return end(403,'Forbidden');}
   const canonical=await realpath(target);
   if(!canonical.startsWith(base+path.sep)||(await lstat(canonical)).isDirectory()) return end(403,'Forbidden');
   const type=MIME[path.extname(canonical)]; if(!type)return end(403,'Forbidden');
   return end(200,await readFile(canonical),type);
  }catch(error){return end(error instanceof URIError?400:404,'Unavailable');}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const server=createDemoServer(); server.on('error',error=>{console.error(`Demo server unavailable: ${error.code||'ERROR'}`);process.exitCode=1;}); server.listen(8765,'127.0.0.1',()=>console.log('Demo report: http://127.0.0.1:8765/report.html'));
}
