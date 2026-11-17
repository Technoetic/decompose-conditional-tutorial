import test from 'node:test';
import assert from 'node:assert/strict';
import {LabStorageService,emptyProgress} from '../src/services/storage-service.js';
import {TutorialApp} from '../src/main.js';

const questions=[{id:'current',options:[{id:'yes'},{id:'no'}]}];
const saved=()=>({...emptyProgress(),answers:{old:'yes',current:'retired'},note:'saved note',input:{date:'2026-06-01',cups:3},slots:{condition:'wrong',summer:'',regular:''}});
const memory=initial=>{let raw=initial;return {getItem:()=>raw,setItem:(_key,value)=>{raw=value;}};};

test('cold load preserves valid non-answer state while pruning obsolete questions and choices',async()=>{
  const service=new LabStorageService({questions,storage:memory(JSON.stringify(saved()))});
  const progress=service.load();
  assert.deepEqual(progress.answers,{});assert.equal(progress.note,'saved note');assert.equal(progress.input.cups,3);assert.equal(progress.slots.condition,'wrong');
  await service.save(progress);
});

test('reconciliation retains answers still valid under the refreshed questions',()=>{
  const progress=saved();progress.answers.current='yes';
  const service=new LabStorageService({questions,storage:memory(JSON.stringify(progress))});
  assert.deepEqual(service.load().answers,{current:'yes'});
});

test('warm question refresh prunes current and saved snapshots while preserving drafts and discard',async()=>{
  const storage=new LabStorageService({questions:[{id:'old',options:[{id:'yes'}]},{id:'current',options:[{id:'retired'}]}],storage:memory()});
  const persisted=saved(),progress=structuredClone(persisted);progress.note='unsaved draft';
  const app={storage,progress,persistedProgress:persisted,hydrated:true,unsaved:true,notice(){},showUpdate(){},saving:false};
  TutorialApp.prototype.reconcileContent.call(app,{questions});
  assert.deepEqual(app.progress.answers,{});assert.deepEqual(app.persistedProgress.answers,{});
  assert.equal(app.progress.note,'unsaved draft');assert.equal(app.persistedProgress.note,'saved note');
  const discarded={...app,progress:structuredClone(app.progress),persistedProgress:structuredClone(app.persistedProgress)};
  TutorialApp.prototype.restoreSavedProgress.call(discarded);
  assert.equal(discarded.progress.note,'saved note');assert.deepEqual(discarded.progress.answers,{});
  await TutorialApp.prototype.persist.call(app);
  assert.equal(app.persistedProgress.note,'unsaved draft');
  TutorialApp.prototype.restoreSavedProgress.call(app);assert.deepEqual(app.progress.answers,{});
});

test('malformed or prototype answer data is rejected instead of pruned',()=>{
  for(const answers of ['{"__proto__":"yes"}','{"old":{"bad":true}}','{"old":"__proto__"}']){
    const raw=JSON.stringify(saved()).replace(JSON.stringify(saved().answers),answers);
    const service=new LabStorageService({questions,storage:memory(raw)});
    assert.deepEqual(service.load(),emptyProgress());assert.ok(service.warning);
  }
  const p=saved();p.note='x'.repeat(2001);
  const service=new LabStorageService({questions,storage:memory(JSON.stringify(p))});
  assert.deepEqual(service.load(),emptyProgress());
});

test('save still rejects stale answers until reconciled',async()=>{
  const service=new LabStorageService({questions,storage:memory()});
  await assert.rejects(service.save(saved()));
});
