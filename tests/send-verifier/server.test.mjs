import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,symlink,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createDemoServer} from '../../skills/mermail-send-verifier/scripts/serve-demo.mjs';
test('server serves only local safe demo files and rejects unsafe paths and methods',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'mermail-server-')); const root=path.join(dir,'demo'); await mkdir(root); await writeFile(path.join(root,'report.html'),'<h1>Demo</h1>'); await writeFile(path.join(dir,'secret.txt'),'private'); await writeFile(path.join(root,'.hidden'),'private'); await symlink(path.join(dir,'secret.txt'),path.join(root,'leak.txt')); await mkdir(path.join(root,'private-evidence')); await writeFile(path.join(root,'private-evidence','secret.txt'),'private');
 const server=createDemoServer(root); await new Promise(r=>server.listen(0,'127.0.0.1',r)); const port=server.address().port;
 const request=(url,method='GET')=>new Promise((resolve,reject)=>{const req=http.request({host:'127.0.0.1',port,path:url,method},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}));});req.on('error',reject);req.end();});
 try {
 const ok=await request('/report.html'); assert.equal(ok.status,200); assert.equal(ok.body,'<h1>Demo</h1>'); assert.match(ok.headers['content-security-policy'],/default-src 'none'/); assert.equal(ok.headers['x-content-type-options'],'nosniff');
 assert.equal((await request('/report.html','HEAD')).body,'');
 for(const url of ['/../secret.txt','/%2e%2e/secret.txt','/.hidden','/leak.txt','/private-evidence/secret.txt','/%00','/%ZZ','/README.md']) assert.notEqual((await request(url)).status,200,url);
 assert.equal((await request('/report.html','POST')).status,405);
 } finally {await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});
