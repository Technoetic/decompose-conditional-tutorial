import test from 'node:test';
import assert from 'node:assert/strict';
import {LabStorageService,emptyProgress} from '../src/services/storage-service.js';
import {parseRoute} from '../src/shared/routes.js';

test('routes expose the conditional tutorial',()=>{
  assert.equal(parseRoute('#/split').id,'split');
  assert.equal(parseRoute('#/reference').known,false);
});
test('storage awaits asynchronous failures and validates inputs',async()=>{
  const service=new LabStorageService({storage:{getItem:()=>null,setItem:async()=>{throw Error('blocked');}}});
  await assert.rejects(service.save(emptyProgress()));
  const p=emptyProgress(); p.input.date='2026-02-30';
  await assert.rejects(service.save(p));
});
