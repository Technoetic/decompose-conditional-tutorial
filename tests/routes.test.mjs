import test from 'node:test';
import assert from 'node:assert/strict';
import {ROUTES,normalizePath,parseRoute,routeUrl} from '../src/shared/routes.js';

test('six navigable routes normalize hashes and detect unknown paths',()=>{
  assert.equal(ROUTES.length,6);
  assert.deepEqual(ROUTES.map(route=>route.label),['시작','조건 읽기','분해하기','경계 실험실','여섯 문제','코드와 정리']);
  assert.equal(normalizePath(''),'/');
  assert.equal(normalizePath('#/read/'),'/read');
  assert.deepEqual(parseRoute('#/lab'),{path:'/lab',id:'lab',known:true});
  assert.deepEqual(parseRoute('#/missing-step'),{path:'/missing-step',id:null,known:false});
  const u=routeUrl('/practice','https://example.test/decompose-conditional-tutorial/');
  assert.equal(u.href,'https://example.test/decompose-conditional-tutorial/#/practice');
});
