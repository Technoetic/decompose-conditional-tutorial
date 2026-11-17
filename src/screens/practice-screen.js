import {BaseScreen} from './base-screen.js';
import {escapeHTML as e} from '../shared/dom.js';

export class PracticeScreen extends BaseScreen {
  mount(root){
    this.root=root;this.draftNote=this.app.progress.note;this.lastSavedNote=this.app.persistedProgress?.note??this.app.progress.note;this.lastSavedAnswers={...(this.app.persistedProgress?.answers??this.app.progress.answers)};this.failed=false;this.pendingSave=null;
    root.innerHTML=`<section class="lesson">${this.head()}<div class="practice-progress"><div><span class="tiny-label">A LITTLE SELF CHECK</span><h2>설명할 수 있다면,<br>내 것이 된 개념.</h2></div><div class="score"><strong id="practice-score">0<span> / 6</span></strong><p id="practice-count" aria-live="polite"></p><div class="progress-track"><i id="practice-track"></i></div></div></div><div class="question-grid">${this.app.content.questions.map((q,i)=>`<article class="question-card" data-card="${e(q.id)}"><span class="tiny-label">CHECK ${String(i+1).padStart(2,'0')}</span><h2>${e(q.prompt)}</h2><div class="answer-options">${q.options.map(o=>`<button class="answer-option" type="button" data-question="${e(q.id)}" data-answer="${e(o.id)}" aria-pressed="false"><span class="option-dot" aria-hidden="true"></span><span>${e(o.text)}</span></button>`).join('')}</div><div class="answer-feedback" data-feedback="${e(q.id)}" aria-live="polite"></div></article>`).join('')}</div><form id="note-form" class="note-card"><div class="note-heading"><div><span class="tiny-label">MY TAKEAWAY</span><h2><label for="learner-note">내 말로 남기는 한 문장</label></h2></div><span aria-hidden="true">✳</span></div><p>조건과 계산을 나누면 무엇이 좋아지나요? 오늘 발견한 점을 적어 보세요.</p><textarea id="learner-note" maxlength="2000" rows="6" placeholder="다음에 긴 조건문을 만나면, 먼저…">${e(this.draftNote)}</textarea><div class="note-actions"><div><p>답과 메모는 이 브라우저에 저장됩니다.</p><span id="note-status" role="status"></span></div><span id="note-count">${this.draftNote.length} / 2000</span><button class="button secondary" type="submit" id="save-note">메모 저장하기 ↗</button></div><p class="error" id="note-error" role="alert"></p></form>${this.foot()}</section>`;
    this.paintAnswers();
    this.on(root,'click',ev=>{const b=ev.target.closest('[data-answer]');if(b)this.chooseAnswer(b).catch(()=>{});});
    this.on(root,'input',ev=>{if(ev.target.id!=='learner-note')return;this.draftNote=ev.target.value;this.syncDirty();this.paintNoteStatus();});
    this.on(root,'submit',ev=>{if(ev.target.id==='note-form'){ev.preventDefault();this.saveDraft().catch(()=>{});}});
  }
  syncDirty(){const saved=this.app.persistedProgress;this.dirty=this.failed||this.draftNote!==(saved?.note??this.lastSavedNote)||JSON.stringify(this.app.progress.answers)!==JSON.stringify(saved?.answers??this.lastSavedAnswers);this.app.editState?.();}
  paintNoteStatus(){this.root.querySelector('#note-count').textContent=`${this.draftNote.length} / 2000`;this.root.querySelector('#note-status').textContent=this.pendingSave?'저장 중…':this.dirty?'아직 저장하지 않은 변경이 있습니다.':'저장된 메모와 같습니다.';}
  paintAnswers(){
    const {questions}=this.app.content,answers=this.app.progress.answers;
    for(const q of questions){const selected=answers[q.id],right=selected===q.answer;const card=[...this.root.querySelectorAll('[data-card]')].find(el=>el.dataset.card===q.id);if(!card)continue;card.querySelectorAll('[data-answer]').forEach(b=>{const chosen=b.dataset.answer===selected;b.setAttribute('aria-pressed',String(chosen));b.classList.toggle('chosen',chosen);});const feedback=card.querySelector('[data-feedback]');feedback.className=`answer-feedback ${selected?(right?'correct':'retry'):''}`;feedback.innerHTML=selected?`<b>${right?'✓ 정확해요.':'다시 생각해 볼까요?'}</b><p>${e(q.explanation)}</p>`:'';}
    const correct=questions.filter(q=>answers[q.id]===q.answer).length,answered=questions.filter(q=>answers[q.id]).length;
    this.root.querySelector('#practice-score').innerHTML=`${correct}<span> / 6</span>`;this.root.querySelector('#practice-count').textContent=`${answered}문항 선택 · ${correct}문항 이해 완료`;this.root.querySelector('#practice-track').style.setProperty('--progress',`${correct/6*100}%`);
  }
  async chooseAnswer(button){
    if(this.pendingSave||this.app.saving){this.app.notice?.('저장이 끝나면 다음 답을 골라 주세요.');return;}
    const question=this.app.content.questions.find(q=>q.id===button.dataset.question);
    if(!question?.options.some(o=>o.id===button.dataset.answer))return;
    this.app.progress.answers[question.id]=button.dataset.answer;this.syncDirty();this.paintAnswers();
    const submitted={...this.app.progress.answers};
    try{await this.app.persist();this.lastSavedAnswers={...submitted};this.failed=false;this.root.querySelector('#note-error').textContent='';}catch(error){this.failed=true;this.root.querySelector('#note-error').textContent=error.message;}finally{this.syncDirty();this.paintNoteStatus();}
  }
  async saveDraft(){
    if(this.pendingSave)return this.pendingSave;
    const submitted=this.root.querySelector('#learner-note').value;
    this.draftNote=submitted;this.app.progress.note=submitted;
    const answers={...this.app.progress.answers};
    this.pendingSave=(async()=>{
      try{await this.app.persist();this.lastSavedNote=submitted;this.lastSavedAnswers={...answers};this.failed=false;this.root.querySelector('#note-error').textContent='';this.app.notice?.('메모를 저장했습니다.');}
      catch(error){this.failed=true;this.root.querySelector('#note-error').textContent=error.message;throw error;}
      finally{this.draftNote=this.root.querySelector('#learner-note')?.value??this.draftNote;this.pendingSave=null;this.syncDirty();this.paintNoteStatus();}
    })();
    this.paintNoteStatus();return this.pendingSave;
  }
  discard(){
    const saved=this.app.persistedProgress;this.draftNote=saved?.note??this.lastSavedNote;this.app.progress.note=this.draftNote;this.app.progress.answers={...(saved?.answers??this.lastSavedAnswers)};this.root.querySelector('#learner-note').value=this.draftNote;this.failed=false;this.paintAnswers();super.discard();this.paintNoteStatus();
  }
}
