import {BaseScreen,receipt,roleCards} from './base-screen.js';
import {evaluate} from '../domain/conditional.js';
import {escapeHTML as e} from '../shared/dom.js';

export class IntroScreen extends BaseScreen {
  mount(root) {
    this.root=root;
    root.innerHTML=`<section class="intro-screen"><div class="hero"><div class="hero-copy"><p class="eyebrow"><span class="live-dot"></span> A SMALL CAFE. A CLEARER IF.</p><h1>복잡한 if를,<br><span>세 문장으로.</span></h1><p class="hero-description">조건은 이름으로 읽고,<br>계산은 제자리에서 이해하세요.</p><p class="hero-detail">커피 한 잔의 가격을 따라 배우는<br><strong>Decompose Conditional</strong> 인터랙티브 노트.</p><div class="hero-actions"><a class="button" href="#/read" data-route="/read">첫 문장 읽기 <span aria-hidden="true">↗</span></a><span class="hero-meta">6개의 노트 <i>·</i> 직접 바꾸며 배우기</span></div><div class="hero-caption"><span>REFACTORING FIELD NOTES</span><span>VOL. 02 — CONDITIONALS</span></div></div><div class="hero-art"><div class="art-grid" aria-hidden="true"></div><div class="diagram-caption"><span>THE SAME ORDER</span><span>THE SAME RESULT</span></div><div class="branch-source"><span class="diagram-node condition">isSummer(date)</span><span class="diagram-fork" aria-hidden="true"></span><div class="diagram-branches"><span class="diagram-node summer">summerCharge</span><span class="diagram-node regular">regularCharge</span></div></div><div id="hero-receipt">${receipt()}</div><div class="receipt-stamp" aria-hidden="true">CLEAR<br>BY DESIGN</div><div class="hero-switch" role="group" aria-label="영수증 날짜 바꾸기"><button type="button" data-season="summer" aria-pressed="true">여름 주문 <span>7.15</span></button><button type="button" data-season="regular" aria-pressed="false">평소 주문 <span>9.01</span></button></div></div></div><div class="editorial-strip"><span class="tiny-label">LESS CODE TO DECODE</span><p>동작은 그대로.<br class="mobile-only"> 읽는 방식은 더 분명하게.</p><span class="strip-arrow" aria-hidden="true">↓</span></div><section class="intro-roles"><div class="section-label"><span class="tiny-label">THREE INTENTIONS</span><h2>한 덩어리의 조건문에서,<br>세 가지 의도를 꺼냅니다.</h2></div>${roleCards()}</section><aside class="quiet-note"><span class="note-icon" aria-hidden="true">↳</span><p>새 기능을 더하는 시간이 아닙니다. <strong>같은 입력에 같은 결과가 나오는지</strong> 확인하며, 코드가 하려는 일을 이름으로 드러내는 시간입니다.</p></aside><div class="intro-next"><p>읽고, 나누고, 경계에서 확인하세요.</p><a href="#/read" data-route="/read" class="text-link">조건문 펼쳐 보기 ↗</a></div></section>`;
    this.on(root,'click',ev=>{
      const button=ev.target.closest('[data-season]'); if(!button)return;
      const summer=button.dataset.season==='summer',date=summer?'2026-07-15':'2026-09-01',result=evaluate({date,cups:2});
      root.querySelector('#hero-receipt').innerHTML=receipt({date,cups:2,amount:result.before,summer});
      root.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    });
  }
}
