import {escapeHTML as e, won} from '../shared/dom.js';
import {ROUTES} from '../shared/routes.js';

export class BaseScreen {
  constructor(app, lesson) { this.app=app; this.lesson=lesson; this.abort=new AbortController(); this.dirty=false; this.disposed=false; }
  on(target,event,handler) { target.addEventListener(event,handler,{signal:this.abort.signal}); }
  head() {
    const i=ROUTES.findIndex(r=>r.id===this.lesson.id);
    return `<header class="lesson-heading"><p class="eyebrow">FIELD NOTE ${String(i+1).padStart(2,'0')} <span>${e(this.lesson.kicker)}</span></p><h1>${e(this.lesson.title)}</h1><p class="lede">${e(this.lesson.intro)}</p></header>`;
  }
  foot() {
    const i=ROUTES.findIndex(r=>r.id===this.lesson.id),next=ROUTES[i+1];
    return `<footer class="lesson-bottom"><div><span class="tiny-label">TAKE THIS WITH YOU</span><p>${e(this.lesson.takeaway)}</p></div>${next?`<a class="button" href="#${next.path}" data-route="${next.path}">${e(next.label)} <span aria-hidden="true">↗</span></a>`:'<a class="button secondary" href="#/lab" data-route="/lab">실험실로 돌아가기 ↗</a>'}</footer>`;
  }
  changed() { this.dirty=true; this.app.editState?.(); }
  async saveDraft() { this.dirty=false; this.app.editState?.(); }
  discard() { this.dirty=false; this.app.editState?.(); }
  dispose() { this.disposed=true; this.abort.abort(); }
}

export function receipt({date='2026-07-15',cups=2,amount=8000,summer=true}={}) {
  return `<div class="receipt"><div class="receipt-top"><span>IF / CLEAR</span><span>CAFE LAB · 2026</span></div><div class="receipt-title">오늘의 한 잔,<br>명료한 한 문장.</div><div class="receipt-rule"></div><div class="receipt-line"><span>ORDER DATE</span><b>${e(date)}</b></div><div class="receipt-line"><span>TAKEAWAY COFFEE</span><b>× ${e(cups)}</b></div><div class="receipt-line"><span>${summer?'여름 프로모션 · 포장 포함':'일반 요금 · 주문당 포장비 500원'}</span></div><div class="receipt-rule"></div><div class="receipt-total"><span>TOTAL</span><strong>${won(amount)}</strong></div><div class="receipt-barcode" aria-hidden="true"></div><p class="receipt-sign">same coffee. clearer code.</p></div>`;
}
export function roleCards() { return `<div class="role-cards"><article class="role-card condition"><span class="role-number">01 / WHEN</span><h3>언제인가?</h3><code>isSummer(date)</code><p>조건에 의도를 담습니다.</p></article><article class="role-card summer"><span class="role-number">02 / THEN</span><h3>참이면 무엇을?</h3><code>summerCharge(cups)</code><p>여름의 계산을 분리합니다.</p></article><article class="role-card regular"><span class="role-number">03 / ELSE</span><h3>거짓이면 무엇을?</h3><code>regularCharge(cups)</code><p>평소의 계산을 분리합니다.</p></article></div>`; }
export function inputFields(input,prefix='price') { return `<div class="input-pair"><div class="field"><label for="${prefix}-date">주문 날짜 <span>2026년</span></label><input id="${prefix}-date" name="date" type="date" min="2026-01-01" max="2026-12-31" value="${e(input.date)}" required></div><div class="field"><label for="${prefix}-cups">커피 수량 <span>1–12잔</span></label><input id="${prefix}-cups" name="cups" type="number" min="1" max="12" step="1" value="${e(input.cups)}" required inputmode="numeric"></div></div>`; }
