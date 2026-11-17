import test from 'node:test';
import assert from 'node:assert/strict';
import {VersionService} from '../src/services/version-service.js';
import {ContentService} from '../src/services/content-service.js';
import {LabStorageService,emptyProgress} from '../src/services/storage-service.js';
const baseUrl='https://example.test/decompose-conditional-tutorial/';
const questions=Array.from({length:6},(_,i)=>({id:`q${i}`,prompt:'question',options:[{id:'a',text:'A'},{id:'b',text:'B'}],answer:'a',explanation:'Explanation'}));
const fixture=()=>({schema:1,lessons:['intro','read','split','lab','practice','code'].map(id=>({id,title:'title',intro:'intro',takeaway:'takeaway',kicker:'kicker'})),questions:structuredClone(questions),sources:[{title:'one',url:'https://refactoring.com/catalog/decomposeConditional.html'},{title:'two',url:'https://refactoring.com/catalog/extractFunction.html'}]});
test('version handles rollback and rechecks dirty state after request',async()=>{
  let done,dirty=false;const v=new VersionService({baseUrl,loadedBuild:'dc-b',fetcher:()=>new Promise(r=>{done=r;})});
  const nav=v.navigation('#/lab',()=>({dirty}));dirty=true;done({ok:true,json:async()=>({buildId:'dc-a'})});
  assert.equal((await nav).kind,'protect');assert.equal(v.pendingBuild,'dc-a');
});
test('version timeout leaves the app usable',async()=>{
  const v=new VersionService({baseUrl,loadedBuild:'dc-a',timeoutMs:5,fetcher:()=>new Promise(()=>{})});
  assert.equal((await v.refresh()).status,'unavailable');
});
test('content requests fresh absolute URL and rejects duplicates',async()=>{
  let url;const service=new ContentService({baseUrl,fetcher:async u=>{url=u;return {ok:true,json:async()=>fixture()};}});
  assert.equal((await service.load()).questions.length,6);assert.equal(url.origin,'https://example.test');assert.ok(url.searchParams.has('_fresh'));
  const broken=fixture();broken.questions[0].options[1].id='a';
  const invalid=new ContentService({baseUrl,fetcher:async()=>({ok:true,json:async()=>broken})});await assert.rejects(invalid.load());
});
test('content cancellation works even if fetch ignores its abort signal',async()=>{
  const ctrl=new AbortController();const service=new ContentService({baseUrl,fetcher:()=>new Promise(()=>{}),timeoutMs:1000});
  const p=service.load(ctrl.signal);ctrl.abort();await assert.rejects(p,{name:'AbortError'});
});
test('storage persists clones, known options and rejects unknown answers and malformed input',async()=>{
  let raw;const svc=new LabStorageService({questions,storage:{getItem:()=>raw,setItem:async(_k,v)=>{raw=v;}}});
  const p=emptyProgress();p.answers.q0='a';p.slots.condition='wrong binding';await svc.save(p);p.note='mutated';assert.equal(svc.load().note,'');
  p.answers.q0='unknown';await assert.rejects(svc.save(p));delete p.answers.q0;p.answers.unknown='a';await assert.rejects(svc.save(p));
  raw='{"schema":1,"answers":{"__proto__":"a"}}';assert.deepEqual(svc.load(),emptyProgress());
});
