import test from 'node:test';
import assert from 'node:assert/strict';
import {CodeScreen} from '../src/screens/code-screen.js';

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}

for(const outcome of ['resolve','reject'])for(const replacement of ['empty','reused']){
  test(`clipboard ${outcome} after dispose leaves ${replacement} root untouched`,async t=>{
    const gate=deferred(),descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
    Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:()=>gate.promise}}});
    t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator;});
    let handler,queries=0,disposed=false;
    const replacementField={textContent:'next screen',hidden:true,value:'next screen',focus(){throw Error('stale focus');},select(){throw Error('stale selection');}};
    const root={innerHTML:'',addEventListener(_event,callback){handler=callback;},querySelector(){queries++;return disposed&&replacement==='empty'?null:replacementField;}};
    const screen=new CodeScreen({content:{sources:[]}},{id:'code',title:'코드',intro:'',takeaway:'',kicker:''});
    screen.mount(root);
    const pending=handler({target:{closest:()=>({dataset:{copy:'before'}})}});
    screen.dispose();disposed=true;root.innerHTML=replacement==='empty'?'':'<section>next screen</section>';
    if(outcome==='resolve')gate.resolve();else gate.reject(Error('clipboard denied'));
    await assert.doesNotReject(pending);
    assert.equal(queries,0,'disposed screen must not query a replacement root');
    assert.equal(replacementField.textContent,'next screen');
    assert.equal(replacementField.hidden,true);
    assert.equal(replacementField.value,'next screen');
  });
}
