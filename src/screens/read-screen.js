import {BaseScreen,receipt,inputFields} from './base-screen.js';
import {evaluate,validateInput} from '../domain/conditional.js';
import {escapeHTML as e} from '../shared/dom.js';

const details={condition:['언제 여름 요금을 쓸까요?','6월 1일부터 8월 31일까지, 양쪽 경계를 모두 포함합니다. 이 질문 전체가 isSummer라는 이름이 됩니다.'],summer:['여름에는 어떻게 계산할까요?','커피 한 잔에 4,000원. 포장비가 포함되어 있으므로 수량만 곱합니다. summerCharge가 맡을 계산입니다.'],regular:['그 밖의 날에는요?','한 잔에 4,500원을 곱하고, 주문 전체에 포장비 500원을 한 번 더합니다. regularCharge가 맡습니다.']};
export class ReadScreen extends BaseScreen {
  mount(root) {
    this.root=root;this.input={...this.app.progress.input};this.savedInput={...this.input};
    root.innerHTML=`<section class="lesson">${this.head()}<div class="reading-layout"><div><div class="panel-top"><span class="tiny-label">BEFORE / 이름을 붙이기 전</span><span class="file-label">cafe.js</span></div><div class="code-paper"><pre aria-label="분해하기 전 조건문"><code>function charge(date, cups) {
  if (<button class="code-fragment condition" data-role="condition" aria-pressed="true">date &gt;= '2026-06-01' &amp;&amp;
      date &lt;= '2026-08-31'</button>) {
    return <button class="code-fragment summer" data-role="summer" aria-pressed="false">cups * 4000</button>;
  } else {
    return <button class="code-fragment regular" data-role="regular" aria-pressed="false">cups * 4500 + 500</button>;
  }
}</code></pre></div><p class="code-hint">색이 있는 코드를 눌러 역할을 읽어 보세요.</p><div class="role-tabs" role="group" aria-label="조건문의 세 역할"><button type="button" class="condition" data-role="condition" aria-pressed="true">01 조건</button><button type="button" class="summer" data-role="summer" aria-pressed="false">02 참일 때</button><button type="button" class="regular" data-role="regular" aria-pressed="false">03 거짓일 때</button></div><div id="role-detail" class="role-detail condition" aria-live="polite"><span class="tiny-label">WHEN / 조건</span><h2>${details.condition[0]}</h2><p>${details.condition[1]}</p></div></div><aside class="order-panel"><span class="tiny-label">TRY AN ORDER</span><h2>코드가 만든 영수증</h2><form id="read-form" novalidate>${inputFields(this.input,'read')}<button class="button secondary full" type="submit">금액 확인하기 ↗</button><p id="read-error" class="error" role="alert"></p></form><div id="read-receipt" aria-live="polite"></div></aside></div><div class="teaching-note"><b>숫자를 읽는 일과, 의도를 읽는 일.</b><p>코드가 짧아도 ‘언제’, ‘참이면’, ‘거짓이면’의 세 가지 생각은 들어 있습니다. 다음 노트에서는 각 생각에 이름을 붙입니다.</p></div>${this.foot()}</section>`;
    this.renderPrice();
    this.on(root,'click',ev=>{const b=ev.target.closest('[data-role]');if(!b)return;const role=b.dataset.role;root.querySelectorAll('[data-role]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.role===role)));const [title,text]=details[role];root.querySelector('#role-detail').className=`role-detail ${role}`;root.querySelector('#role-detail').innerHTML=`<span class="tiny-label">${e(role.toUpperCase())}</span><h2>${e(title)}</h2><p>${e(text)}</p>`;});
    this.on(root,'input',ev=>{if(ev.target.name==='date'||ev.target.name==='cups'){this.input[ev.target.name]=ev.target.value;this.changed();}});
    this.on(root,'submit',ev=>{if(ev.target.id!=='read-form')return;ev.preventDefault();this.saveDraft().catch(()=>{});});
  }
  renderPrice(){try{const result=evaluate(this.input);this.root.querySelector('#read-error').textContent='';this.root.querySelector('#read-receipt').innerHTML=receipt({date:result.input.date,cups:result.input.cups,amount:result.before,summer:result.branch==='summer'});}catch(error){this.root.querySelector('#read-error').textContent=error.message;this.root.querySelector('#read-receipt').innerHTML='<p class="empty-state">날짜와 수량을 확인하면 영수증이 나타납니다.</p>';}}
  async saveDraft(){try{const submitted=validateInput(this.input);this.app.progress.input={...submitted};this.renderPrice();await this.app.persist();this.savedInput={...submitted};this.dirty=JSON.stringify(this.input)!==JSON.stringify(submitted)&&!(this.input.date===submitted.date&&Number(this.input.cups)===submitted.cups);this.app.editState?.();}catch(error){this.dirty=true;this.renderPrice();this.root.querySelector('#read-error').textContent=error.message;this.app.editState?.();throw error;}}
  discard(){this.input={...this.savedInput};this.app.progress.input={...this.savedInput};this.root.querySelector('#read-date').value=this.input.date;this.root.querySelector('#read-cups').value=this.input.cups;this.renderPrice();super.discard();}
}
