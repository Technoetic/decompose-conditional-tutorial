import test from 'node:test';
import assert from 'node:assert/strict';
import {PracticeScreen} from '../src/screens/practice-screen.js';
import {ReadScreen} from '../src/screens/read-screen.js';
import {LabScreen} from '../src/screens/lab-screen.js';

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function fakeRoot(note=''){const nodes=new Map();return {querySelectorAll(){return [];},querySelector(id){if(!nodes.has(id))nodes.set(id,{value:id==='#learner-note'?note:'',textContent:'',innerHTML:'',classList:{toggle(){}}});return nodes.get(id);}};}
function practice({note='기존 메모',persist}={}){
  const progress={note,answers:{}};
  const app={progress,persistedProgress:structuredClone(progress),editState(){},notice(){},persist};
  const screen=new PracticeScreen(app,{id:'practice'});
  Object.assign(screen,{root:fakeRoot(note),draftNote:note,lastSavedNote:note,lastSavedAnswers:{},failed:false,pendingSave:null});
  screen.paintAnswers=()=>{};
  return {screen,app};
}

test('typing while a note save is pending remains in textarea and dirty after success',async()=>{
  const gate=deferred();
  const {screen,app}=practice();
  app.persist=async()=>{const submitted=structuredClone(app.progress);await gate.promise;app.persistedProgress=submitted;};
  screen.root.querySelector('#learner-note').value='저장할 메모';
  const saving=screen.saveDraft();
  screen.root.querySelector('#learner-note').value='저장 중 추가한 생각';
  screen.draftNote='저장 중 추가한 생각';screen.syncDirty();
  gate.resolve();await saving;
  assert.equal(app.persistedProgress.note,'저장할 메모');
  assert.equal(screen.root.querySelector('#learner-note').value,'저장 중 추가한 생각');
  assert.equal(screen.dirty,true);
});

test('failed save protects draft even though progress already has submitted note; discard returns actual saved note',async()=>{
  const {screen,app}=practice();
  app.persist=async()=>{throw new Error('저장 공간에 접근할 수 없습니다.');};
  screen.root.querySelector('#learner-note').value='아직 저장되지 않은 메모';
  await assert.rejects(screen.saveDraft(),/저장 공간/);
  assert.equal(app.progress.note,'아직 저장되지 않은 메모');
  assert.equal(screen.dirty,true);
  assert.equal(screen.root.querySelector('#learner-note').value,'아직 저장되지 않은 메모');
  screen.discard();
  assert.equal(screen.root.querySelector('#learner-note').value,'기존 메모');
  assert.equal(app.progress.note,'기존 메모');
  assert.equal(screen.dirty,false);
});

test('answer selection persists without replacing or reverting the note textarea',async()=>{
  const {screen,app}=practice();
  app.content={questions:[{id:'boundary',options:[{id:'inclusive'}]}]};
  app.persist=async()=>{app.persistedProgress=structuredClone(app.progress);};
  screen.root.querySelector('#learner-note').value='선택 중에도 유지되는 초안';
  screen.draftNote='선택 중에도 유지되는 초안';
  const field=screen.root.querySelector('#learner-note');
  await screen.chooseAnswer({dataset:{question:'boundary',answer:'inclusive'}});
  assert.equal(screen.root.querySelector('#learner-note'),field);
  assert.equal(field.value,'선택 중에도 유지되는 초안');
  assert.equal(app.progress.answers.boundary,'inclusive');
  assert.equal(screen.dirty,true);
});

for(const Screen of [ReadScreen,LabScreen])test(`${Screen.name} refuses an empty date and retains dirty draft`,async()=>{
  let saves=0;
  const app={progress:{input:{date:'2026-07-15',cups:2},excludeStart:false},persist:async()=>{saves++;},editState(){}};
  const screen=new Screen(app,{id:'read'});screen.root=fakeRoot();screen.input={date:'',cups:'2'};screen.excludeStart=false;screen.dirty=true;
  await assert.rejects(screen.saveDraft(),RangeError);
  assert.equal(saves,0);assert.equal(screen.dirty,true);assert.equal(app.progress.input.date,'2026-07-15');
  assert.match(screen.root.querySelector(Screen===ReadScreen?'#read-receipt':'#lab-output').innerHTML,/empty-state/);
});
