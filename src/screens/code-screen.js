import {BaseScreen,roleCards} from './base-screen.js';
import {SNIPPETS} from '../domain/conditional.js';
import {escapeHTML as e} from '../shared/dom.js';

export class CodeScreen extends BaseScreen {
  mount(root){
    this.root=root;
    root.innerHTML=`<section class="lesson">${this.head()}<div class="code-intro"><span class="tiny-label">SAME BEHAVIOR / CLEARER INTENT</span><h2>바뀐 것은 구조.<br>남아야 하는 것은 동작.</h2><p>아래 코드는 각자 독립적으로 읽을 수 있는 전체 예제입니다.<br>실험실의 의도적인 경계 버그는 포함하지 않았습니다.</p></div><div class="full-code-grid">${[['before','BEFORE','분해하기 전'],['after','AFTER','세 가지 이름을 붙인 뒤']].map(([key,label,title])=>`<article class="full-code"><div class="full-code-head"><div><span class="tiny-label">${label}</span><h2>${title}</h2></div><button type="button" class="copy-button" data-copy="${key}" aria-label="${title} 코드 복사">복사 ↗</button></div><pre tabindex="0" aria-label="${title} JavaScript"><code>${e(SNIPPETS[key])}</code></pre></article>`).join('')}</div><p id="copy-status" class="copy-status" role="status"></p><div id="copy-fallback" hidden><label for="copy-text">자동 복사를 사용할 수 없습니다. 아래 코드를 선택해 직접 복사하세요.</label><textarea id="copy-text" readonly rows="8"></textarea></div><section class="code-roles"><span class="tiny-label">READ IT AS THREE SENTENCES</span>${roleCards()}</section><section class="guardrail-section"><div><span class="tiny-label">BEFORE YOU REFACTOR</span><h2>꺼내기 전에,<br>지킬 것부터.</h2></div><div class="guardrail-list"><article><span>01</span><div><h3>조건의 경계를 유지하세요.</h3><p><code>&gt;=</code>를 <code>&gt;</code>로 바꾸는 순간, 6월 1일의 의미가 달라집니다. 시작일·종료일과 바로 앞뒤 날짜를 확인하세요.</p></div></article><article><span>02</span><div><h3>계산과 실행 순서를 유지하세요.</h3><p>값뿐 아니라 부수 효과와 평가 순서도 동작의 일부입니다. 이 예제의 포장비는 주문당 한 번입니다.</p></div></article><article><span>03</span><div><h3>이름이 이해를 도울 때 사용하세요.</h3><p>모든 if를 분해할 필요는 없습니다. 짧고 분명한 조건은 그대로여도 좋습니다. 이 기법이 실행 속도 향상을 보장하지도 않습니다.</p></div></article></div></section><section class="source-section"><div><span class="tiny-label">FURTHER READING</span><h2>원문에서 더 읽기</h2><p>예제와 설명은 이 노트를 위해 새로 구성했습니다.</p></div><div class="source-links">${this.app.content.sources.map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer"><span>${e(s.title)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>${this.foot()}</section>`;
    this.on(root,'click',async ev=>{
      const button=ev.target.closest('[data-copy]');
      if(!button||this.disposed)return;
      const text=SNIPPETS[button.dataset.copy];
      try{
        if(!navigator.clipboard?.writeText)throw new Error('unavailable');
        await navigator.clipboard.writeText(text);
        if(this.disposed)return;
        root.querySelector('#copy-status').textContent='코드를 복사했습니다.';
        root.querySelector('#copy-fallback').hidden=true;
      }catch{
        if(this.disposed)return;
        root.querySelector('#copy-fallback').hidden=false;
        const field=root.querySelector('#copy-text');
        field.value=text;field.focus();field.select();
        root.querySelector('#copy-status').textContent='선택한 코드를 직접 복사할 수 있습니다.';
      }
    });
  }
}
