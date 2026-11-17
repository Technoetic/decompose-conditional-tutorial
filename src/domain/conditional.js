export const PLAN = Object.freeze({
  start: '2026-06-01',
  end: '2026-08-31',
  summerRate: 4000,
  regularRate: 4500,
  serviceCharge: 500,
});

export const DEFAULT_INPUT = Object.freeze({ date: '2026-07-15', cups: 2 });

// Calendar dates are compared as ISO date strings, without a local time zone.
export function validateInput(raw) {
  const date = raw?.date;
  if (typeof date !== 'string' || !/^2026-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError('날짜는 2026년의 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
    throw new RangeError('2026년에 실제로 존재하는 날짜를 입력해 주세요.');
  }
  const value = raw?.cups;
  const cups = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof cups !== 'number' || !Number.isInteger(cups) || cups < 1 || cups > 12) {
    throw new RangeError('잔 수는 1부터 12까지의 정수로 입력해 주세요.');
  }
  return { date, cups };
}

export function isSummer(date, plan = PLAN) {
  return date >= plan.start && date <= plan.end;
}

export function summerCharge(cups, plan = PLAN) {
  return cups * plan.summerRate;
}

export function regularCharge(cups, plan = PLAN) {
  return cups * plan.regularRate + plan.serviceCharge;
}

// Independent baseline: the condition and both calculations remain inline.
export function priceBefore(input, plan = PLAN) {
  const { date, cups } = validateInput(input);
  if (date >= plan.start && date <= plan.end) {
    return cups * plan.summerRate;
  } else {
    return cups * plan.regularRate + plan.serviceCharge;
  }
}

export function priceAfter(input, plan = PLAN, { excludeStart = false } = {}) {
  const { date, cups } = validateInput(input);
  // Lab-only mutation: deliberately exclude the first day of the promotion.
  const summer = excludeStart
    ? date > plan.start && date <= plan.end
    : isSummer(date, plan);
  if (summer) {
    return summerCharge(cups, plan);
  } else {
    return regularCharge(cups, plan);
  }
}

export function evaluate(raw, { excludeStart = false } = {}) {
  const input = validateInput(raw);
  const before = priceBefore(input);
  const after = priceAfter(input, PLAN, { excludeStart });
  const branch = isSummer(input.date) ? 'summer' : 'regular';
  const afterSummer = excludeStart
    ? input.date > PLAN.start && input.date <= PLAN.end
    : isSummer(input.date);
  return {
    input,
    before,
    after,
    equal: before === after,
    branch,
    afterBranch: afterSummer ? 'summer' : 'regular',
  };
}

export function checkAssignments(slots) {
  const perSlot = {
    condition: slots?.condition === 'isSummer',
    summer: slots?.summer === 'summerCharge',
    regular: slots?.regular === 'regularCharge',
  };
  const matched = Object.values(perSlot).filter(Boolean).length;
  return { correct: matched === 3, matched, perSlot };
}

// Both panels are complete programs. They share validation but neither price
// function calls the other. The intentional lab mutation is omitted here.
const snippetPlan = `const PLAN = {
  start: '2026-06-01', end: '2026-08-31',
  summerRate: 4000, regularRate: 4500, serviceCharge: 500,
};`;
const snippetValidation = validateInput.toString();
export const SNIPPETS = Object.freeze({
  before: `${snippetPlan}\n\n${snippetValidation}\n\n${priceBefore.toString()}`,
  after: `${snippetPlan}\n\n${snippetValidation}\n\n${isSummer.toString()}\n\n${summerCharge.toString()}\n\n${regularCharge.toString()}\n\nfunction priceAfter(input, plan = PLAN) {
  const { date, cups } = validateInput(input);
  if (isSummer(date, plan)) {
    return summerCharge(cups, plan);
  } else {
    return regularCharge(cups, plan);
  }
}`,
});
