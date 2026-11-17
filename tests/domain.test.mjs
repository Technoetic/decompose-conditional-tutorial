import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

async function domain() {
  const result = await import('../src/domain/conditional.js').catch(() => null);
  assert.ok(result, 'The teaching domain module must exist and load');
  return result;
}

function datesOf2026() {
  return Array.from({ length: 365 }, (_, day) =>
    new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10));
}

test('known prices include both promotion boundaries and one packaging fee per regular order', async () => {
  const { priceBefore, priceAfter, evaluate } = await domain();
  for (const [date, cups, expected, branch] of [
    ['2026-07-15', 2, 8000, 'summer'],
    ['2026-05-31', 2, 9500, 'regular'],
    ['2026-06-01', 2, 8000, 'summer'],
    ['2026-08-31', 2, 8000, 'summer'],
    ['2026-09-01', 2, 9500, 'regular'],
    ['2026-01-01', 1, 5000, 'regular'],
    ['2026-12-31', 12, 54500, 'regular'],
    ['2026-07-15', 12, 48000, 'summer'],
  ]) {
    assert.equal(priceBefore({ date, cups }), expected);
    assert.equal(priceAfter({ date, cups }), expected);
    assert.deepEqual(evaluate({ date, cups }), {
      input: { date, cups }, before: expected, after: expected,
      equal: true, branch, afterBranch: branch,
    });
  }
});

test('all 365 calendar dates and 12 quantities preserve behavior', async () => {
  const { priceBefore, priceAfter } = await domain();
  let comparisons = 0;
  for (const date of datesOf2026()) {
    for (let cups = 1; cups <= 12; cups += 1) {
      assert.equal(priceAfter({ date, cups }), priceBefore({ date, cups }), `${date}, ${cups}`);
      comparisons += 1;
    }
  }
  assert.equal(comparisons, 4380);
});

test('the labeled exclude-start bug changes only June 1 and leaves the baseline intact', async () => {
  const { evaluate } = await domain();
  for (const date of datesOf2026()) {
    const result = evaluate({ date, cups: 2 }, { excludeStart: true });
    if (date === '2026-06-01') {
      assert.equal(result.before, 8000);
      assert.equal(result.after, 9500);
      assert.equal(result.equal, false);
      assert.equal(result.branch, 'summer');
      assert.equal(result.afterBranch, 'regular');
    } else {
      assert.equal(result.equal, true, date);
      assert.equal(result.branch, result.afterBranch);
    }
  }
  assert.equal(evaluate({ date: '2026-06-01', cups: 2 }).equal, true);
});

test('validation returns normalized fresh input and accepts strict integer strings', async () => {
  const { validateInput, DEFAULT_INPUT, evaluate } = await domain();
  const raw = { date: '2026-07-15', cups: '2', extra: 'ignored' };
  assert.deepEqual(validateInput(raw), { date: '2026-07-15', cups: 2 });
  assert.notEqual(validateInput(raw), raw);
  assert.notEqual(validateInput(DEFAULT_INPUT), DEFAULT_INPUT);
  assert.deepEqual(evaluate(raw).input, { date: '2026-07-15', cups: 2 });
  assert.deepEqual(raw, { date: '2026-07-15', cups: '2', extra: 'ignored' });
  assert.equal(validateInput({ date: '2026-02-28', cups: '12' }).cups, 12);
});

test('invalid and normalized calendar dates are rejected with Korean RangeErrors', async () => {
  const { validateInput, priceBefore, priceAfter, evaluate } = await domain();
  for (const date of [
    '2026-02-29', '2026-02-30', '2026-04-31', '2026-06-31',
    '2026-00-01', '2026-13-01', '2026-01-00', '2026-01-32',
    '2025-12-31', '2027-01-01', '2026-6-01', '2026-06-1',
    '2026-06-01T00:00:00Z', ' 2026-06-01', '2026-06-01\n', '2026-06-01\r\n', '', null, 20260601,
  ]) {
    for (const fn of [validateInput, priceBefore, priceAfter, evaluate]) {
      assert.throws(() => fn({ date, cups: 2 }), error =>
        error instanceof RangeError && /[가-힣]/.test(error.message), `${String(date)} via ${fn.name}`);
    }
  }
});

test('quantities reject coercion, fractional values and values outside 1–12', async () => {
  const { validateInput, priceBefore, priceAfter } = await domain();
  for (const cups of [0, 13, -1, 1.5, Infinity, NaN, '', ' ', ' 2', '2 ', '2\n', '2\r\n', '+2', '-2', '2.0', '2e0', '0x2', '2cups', null, undefined, true, [], {}, 2n]) {
    for (const fn of [validateInput, priceBefore, priceAfter]) {
      assert.throws(() => fn({ date: '2026-07-15', cups }), error =>
        error instanceof RangeError && /[가-힣]/.test(error.message));
    }
  }
  for (const input of [undefined, null, [], '2026-07-15', {}]) {
    assert.throws(() => validateInput(input), RangeError);
  }
});

test('named intention functions and configurable plan agree with independent fixtures', async () => {
  const { PLAN, DEFAULT_INPUT, isSummer, summerCharge, regularCharge, priceBefore, priceAfter } = await domain();
  assert.deepEqual(PLAN, { start: '2026-06-01', end: '2026-08-31', summerRate: 4000, regularRate: 4500, serviceCharge: 500 });
  assert.deepEqual(DEFAULT_INPUT, { date: '2026-07-15', cups: 2 });
  assert.equal(isSummer('2026-06-01'), true);
  assert.equal(isSummer('2026-08-31'), true);
  assert.equal(isSummer('2026-05-31'), false);
  assert.equal(isSummer('2026-09-01'), false);
  assert.equal(summerCharge(2), 8000);
  assert.equal(regularCharge(2), 9500);
  const custom = { start: '2026-07-01', end: '2026-07-31', summerRate: 1000, regularRate: 2000, serviceCharge: 300 };
  for (const [date, expected] of [['2026-06-01', 4300], ['2026-07-01', 2000], ['2026-07-31', 2000], ['2026-08-01', 4300]]) {
    assert.equal(priceBefore({ date, cups: 2 }, custom), expected);
    assert.equal(priceAfter({ date, cups: 2 }, custom), expected);
  }
});

test('assignments compare all three roles without executing input', async () => {
  const { checkAssignments } = await domain();
  const correct = { condition: 'isSummer', summer: 'summerCharge', regular: 'regularCharge' };
  assert.deepEqual(checkAssignments(correct), {
    correct: true, matched: 3, perSlot: { condition: true, summer: true, regular: true },
  });
  assert.deepEqual(checkAssignments({ condition: 'isSummer', summer: 'regularCharge', regular: '' }), {
    correct: false, matched: 1, perSlot: { condition: true, summer: false, regular: false },
  });
  for (const input of [undefined, null, {}, { condition: 'globalThis.throwMe()' }, { condition: 'constructor' }]) {
    assert.deepEqual(checkAssignments(input), {
      correct: false, matched: 0, perSlot: { condition: false, summer: false, regular: false },
    });
  }
  assert.deepEqual(correct, { condition: 'isSummer', summer: 'summerCharge', regular: 'regularCharge' });
});

test('complete displayed snippets run independently and match all valid input prices', async () => {
  const { SNIPPETS, priceBefore, priceAfter } = await domain();
  for (const name of ['before', 'after']) {
    const context = vm.createContext({});
    vm.runInContext(SNIPPETS[name], context, { timeout: 1000 });
    const fn = context[name === 'before' ? 'priceBefore' : 'priceAfter'];
    assert.equal(typeof fn, 'function', `${name} snippet exposes its price function`);
    for (const date of datesOf2026()) {
      for (let cups = 1; cups <= 12; cups += 1) {
        const input = { date, cups };
        assert.equal(fn(input), name === 'before' ? priceBefore(input) : priceAfter(input), `${name}: ${date}, ${cups}`);
      }
    }
    assert.equal(fn({ date: '2026-06-01', cups: '2' }), 8000);
    for (const input of [{ date: '2026-02-30', cups: 2 }, { date: '2026-07-15', cups: '2.0' }, { date: '2026-07-15', cups: 0 }]) {
      assert.throws(() => fn(input), error => error.name === 'RangeError');
    }
  }
});
