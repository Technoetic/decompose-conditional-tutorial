import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';

async function controller(){
  try{await access(new URL('../src/main.js',import.meta.url));}
  catch{assert.fail('Tutorial controller has not been implemented');}
  return (await import('../src/main.js')).TutorialApp;
}
const fixture=()=>({progress:{note:'first'},persistedProgress:{note:'previous'},saving:false,unsaved:false,notice(){},showUpdate(){}});

test('pending persistence captures a snapshot and preserves changes made during save',async()=>{
  const App=await controller();const app=fixture();let release,stored;
  app.storage={save:data=>{stored=data;return new Promise(resolve=>{release=resolve;});}};
  const save=App.prototype.persist.call(app);
  await Promise.resolve();
  assert.equal(app.saving,true);
  app.progress.note='new typing';release();await save;
  assert.equal(stored.note,'first');
  assert.equal(app.persistedProgress.note,'first');
  assert.equal(app.progress.note,'new typing');
  assert.equal(app.unsaved,true);assert.equal(app.saving,false);
});

test('failed save retains old persisted snapshot and leaves changes protected',async()=>{
  const App=await controller();const app=fixture();app.storage={save:async()=>{throw Error('blocked');}};
  await assert.rejects(App.prototype.persist.call(app),/blocked/);
  assert.deepEqual(app.persistedProgress,{note:'previous'});
  assert.equal(app.unsaved,true);assert.equal(app.saving,false);
});

test('discard restores confirmed data only when no save is in flight',async()=>{
  const App=await controller();const app=fixture();app.unsaved=true;app.saving=true;
  assert.equal(App.prototype.restoreSavedProgress.call(app),false);
  assert.equal(app.progress.note,'first');
  app.saving=false;assert.equal(App.prototype.restoreSavedProgress.call(app),true);
  assert.deepEqual(app.progress,{note:'previous'});assert.equal(app.unsaved,false);
  app.progress.note='changed again';assert.equal(app.persistedProgress.note,'previous');
});

test('a clean completed save clears unsaved and rejects overlapping writes',async()=>{
  const App=await controller();const app=fixture();let release;
  app.storage={save:()=>new Promise(resolve=>{release=resolve;})};
  const save=App.prototype.persist.call(app);await Promise.resolve();
  await assert.rejects(App.prototype.persist.call(app),/저장 중/);
  release();await save;assert.equal(app.unsaved,false);
});
