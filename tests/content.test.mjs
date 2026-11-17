import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function content() {
  const source = await readFile(new URL('../data/lessons.json', import.meta.url), 'utf8').catch(() => null);
  assert.ok(source, 'The Korean lesson content must exist');
  return JSON.parse(source);
}

test('all six routes receive complete Korean lesson content', async () => {
  const data = await content();
  assert.equal(data.schema, 1);
  assert.deepEqual(data.lessons.map(lesson => lesson.id), ['intro', 'read', 'split', 'lab', 'practice', 'code']);
  for (const lesson of data.lessons) {
    for (const key of ['title', 'intro', 'takeaway', 'kicker']) {
      assert.equal(typeof lesson[key], 'string');
      assert.ok(lesson[key].trim().length > 0, `${lesson.id}.${key}`);
    }
    assert.match(lesson.intro, /[가-힣]/);
  }
});

test('six questions have safe unique IDs, distinct choices, one answer and Korean explanations', async () => {
  const { questions } = await content();
  assert.equal(questions.length, 6);
  assert.equal(new Set(questions.map(question => question.id)).size, 6);
  assert.equal(new Set(questions.map(question => question.prompt)).size, 6);
  for (const question of questions) {
    assert.match(question.id, /^[a-z][a-z0-9-]{0,39}$/);
    assert.match(question.prompt, /[가-힣]/);
    assert.ok(question.options.length >= 2);
    assert.equal(new Set(question.options.map(option => option.id)).size, question.options.length);
    assert.equal(new Set(question.options.map(option => option.text)).size, question.options.length);
    for (const option of question.options) {
      assert.match(option.id, /^[a-z][a-z0-9-]{0,39}$/);
      assert.ok(option.text.trim().length > 0);
    }
    assert.equal(question.options.filter(option => option.id === question.answer).length, 1);
    assert.match(question.explanation, /[가-힣]/);
    assert.ok(question.explanation.length >= 35);
  }
});

test('sources point only to the two official refactoring catalogs', async () => {
  const { sources } = await content();
  assert.equal(sources.length, 2);
  assert.deepEqual(sources.map(source => source.url).sort(), [
    'https://refactoring.com/catalog/decomposeConditional.html',
    'https://refactoring.com/catalog/extractFunction.html',
  ]);
  for (const source of sources) assert.ok(source.title.trim().length > 0);
});
