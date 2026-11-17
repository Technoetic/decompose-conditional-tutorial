import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createStaticServer,PREFIX,bind,listen} from '../scripts/server.mjs';
test('server binds loopback only and serves real 404s with immutable assets',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'dc-server-'));await mkdir(path.join(dir,'assets'));await writeFile(path.join(dir,'index.html'),'hello');await writeFile(path.join(dir,'assets','main.dc-abc.js'),'x');
  const server=createStaticServer({root:dir});
  assert.throws(()=>bind(server,0,'0.0.0.0'),/Loopback/);
  await assert.rejects(listen(server,0,'0.0.0.0'),/Loopback/);
  await bind(server,0);const base=`http://127.0.0.1:${server.address().port}`;
  try{
    assert.equal((await fetch(base+PREFIX)).status,200);
    const asset=await fetch(base+PREFIX+'assets/main.dc-abc.js');assert.match(asset.headers.get('cache-control'),/immutable/);
    assert.equal((await fetch(base+PREFIX+'assets/main.dc-abc.js',{headers:{'if-none-match':asset.headers.get('etag')}})).status,304);
    for(const path of ['assets/missing.js','data/missing.json','missing'])assert.equal((await fetch(base+PREFIX+path)).status,404);
    assert.equal((await fetch(base+PREFIX,{method:'POST'})).status,405);
  }finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});
