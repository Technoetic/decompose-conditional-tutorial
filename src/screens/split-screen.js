import {BaseScreen} from './base-screen.js';
import {checkAssignments} from '../domain/conditional.js';
import {escapeHTML as e} from '../shared/dom.js';

const names=['isSummer','summerCharge','regularCharge'];
const roles={condition:['01 / WHEN','조건','언제 여름 요금인가?','isSummer'],summer:['02 / THEN','참일 때','여름 금액을 계산한다.','summerCharge'],regular:['03 / ELSE','거짓일 때','평소 금액을 계산한다.','regularCharge']};
export class SplitScreen extends BaseScreen {
  mount(root){
    this.root=root;this.slots={...this.app.progress.slots};this.savedSlots={...this.slots};this.selected='isSummer';
    root.innerHTML=`<section class="lesson">${this.head()}<div class="studio-banner"><div><span class="tiny-label">YOUR NAMING WORKBENCH</span><h2>이름을 고르고,<br>맞는 자리에 놓으세요.</h2></div><p>① 아래 함수 이름을 선택한 뒤<br>② 그 이름이 맡을 역할을 누르세요.<br><span>키보드의 Tab과 Enter로도 할 수 있어요.</span></p></div><div class="name-palette" role="group" aria-label="놓을 함수 이름">${names.map(name=>`<button type="button" data-name="${name}" class="name-chip" aria-pressed="${name===this.selected}"><span aria-hidden="true">↗</span><code>${name}</code></button>`).join('')}</div><p id="selection-status" class="selection-status" aria-live="polite">isSummer 선택됨. 아래에서 역할을 골라 주세요.</p><div class="assignment-grid">${Object.entries(roles).map(([key,[number,label,description]])=>`<article class="assignment-card ${key}"><span class="role-number">${number}</span><h2>${label}</h2><p>${description}</p><button type="button" class="assignment-slot" data-slot="${key}" aria-label="${label} 자리에 선택한 함수 놓기"></button><div class="slot-feedback" data-feedback="${key}"></div></article>`).join('')}</div><div class="studio-actions"><p id="split-status" aria-live="polite"></p><button class="button" id="check-assignments" type="button">역할 확인하기 ↗</button><button class="text-button" id="reset-assignments" type="button">비우고 다시 하기</button></div><p id="split-error" class="error" role="alert"></p><div class="teaching-note"><b>좋은 이름은 자리까지 설명합니다.</b><p><code>isSummer</code>는 예/아니오를 답합니다. <code>summerCharge</code>와 <code>regularCharge</code>는 금액을 답합니다. 질문과 계산을 구별해 보세요.</p></div>${this.foot()}</section>`;
    this.paintSlots();
    this.on(root,'click',ev=>{
      const name=ev.target.closest('[data-name]'),slot=ev.target.closest('[data-slot]');
      if(name){this.selected=name.dataset.name;root.querySelectorAll('[data-name]').forEach(b=>b.setAttribute('aria-pressed',String(b===name)));root.querySelector('#selection-status').textContent=`${this.selected} 선택됨. 아래에서 역할을 골라 주세요.`;}
      if(slot){this.slots[slot.dataset.slot]=this.selected;this.changed();this.paintSlots();}
      if(ev.target.closest('#check-assignments')){this.showCheck();this.saveDraft().catch(()=>{});}
      if(ev.target.closest('#reset-assignments')){this.slots={condition:'',summer:'',regular:''};this.changed();this.paintSlots();root.querySelector('#split-status').textContent='세 자리를 비웠습니다.';}
    });
  }
  paintSlots(){for(const [role,name] of Object.entries(this.slots)){const button=this.root.querySelector(`[data-slot="${role}"]`);button.innerHTML=name?`<code>${e(name)}</code><span>다른 이름으로 바꾸기 ↗</span>`:'<span class="slot-plus" aria-hidden="true">＋</span><span>선택한 이름 놓기</span>';button.classList.toggle('filled',Boolean(name));this.root.querySelector(`[data-feedback="${role}"]`).textContent='';}this.root.querySelector('#split-status').textContent='';}
  showCheck(){const check=checkAssignments(this.slots);for(const [role,[,,,expected]] of Object.entries(roles)){const feedback=this.root.querySelector(`[data-feedback="${role}"]`);feedback.textContent=check.perSlot[role]?'✓ 이 역할에 맞는 이름입니다.':!this.slots[role]?'이 자리에 이름을 놓아 주세요.':role==='condition'?'조건은 참/거짓을 답하는 isSummer가 맡습니다.':`${role==='summer'?'여름':'평소'}의 금액 계산은 ${expected}가 맡습니다.`;feedback.className=`slot-feedback ${check.perSlot[role]?'correct':'retry'}`;}this.root.querySelector('#split-status').textContent=check.correct?'세 가지 의도가 제자리를 찾았습니다.':`${check.matched} / 3개가 맞습니다. 이름이 답하는 질문을 생각해 보세요.`;}
  async saveDraft(){const submitted={...this.slots};this.app.progress.slots={...submitted};try{await this.app.persist();this.savedSlots={...submitted};this.dirty=JSON.stringify(this.slots)!==JSON.stringify(submitted);this.root.querySelector('#split-error').textContent='';this.app.editState?.();}catch(error){this.dirty=true;this.root.querySelector('#split-error').textContent=error.message;this.app.editState?.();throw error;}}
  discard(){this.slots={...this.savedSlots};this.app.progress.slots={...this.savedSlots};this.paintSlots();super.discard();}
}
