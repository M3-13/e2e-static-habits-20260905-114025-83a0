import { test } from 'node:test';
import assert from 'node:assert/strict';

import { currentStreak, longestStreak, weekCompletion } from '../js/stats.js';

function habit(checkmarks) {
  return { id: 'h1', name: 'Lesen', checkmarks, archived: false };
}

function closeTo(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} should be ~${expected}`);
}

// ---------- currentStreak ----------

test('currentStreak is 0 when there are no checkmarks', () => {
  assert.equal(currentStreak(habit({}), '2024-01-07'), 0);
});

test('currentStreak counts consecutive days ending today when today is done', () => {
  const h = habit({
    '2024-01-05': true,
    '2024-01-06': true,
    '2024-01-07': true,
  });
  assert.equal(currentStreak(h, '2024-01-07'), 3);
});

test('currentStreak is 1 for a single done day today', () => {
  assert.equal(currentStreak(habit({ '2024-01-07': true }), '2024-01-07'), 1);
});

test('currentStreak ends yesterday when today is not yet done', () => {
  const h = habit({
    '2024-01-05': true,
    '2024-01-06': true,
  });
  assert.equal(currentStreak(h, '2024-01-07'), 2);
});

test('currentStreak is 0 when neither today nor yesterday is done', () => {
  const h = habit({ '2024-01-05': true });
  assert.equal(currentStreak(h, '2024-01-07'), 0);
});

test('currentStreak does not bridge a gap', () => {
  const h = habit({
    '2024-01-04': true,
    '2024-01-05': true,
    '2024-01-07': true,
  });
  assert.equal(currentStreak(h, '2024-01-07'), 1);
});

test('currentStreak works without a checkmarks property', () => {
  assert.equal(currentStreak({ id: 'h1', name: 'x', archived: false }, '2024-01-07'), 0);
});

// ---------- longestStreak ----------

test('longestStreak is 0 when there are no checkmarks', () => {
  assert.equal(longestStreak(habit({})), 0);
});

test('longestStreak is 1 for a single done day', () => {
  assert.equal(longestStreak(habit({ '2024-01-07': true })), 1);
});

test('longestStreak returns the longest run of consecutive days', () => {
  const h = habit({
    '2024-01-01': true,
    '2024-01-02': true,
    '2024-01-03': true,
    '2024-01-10': true,
    '2024-01-11': true,
  });
  assert.equal(longestStreak(h), 3);
});

test('longestStreak is 1 when all days are non-consecutive', () => {
  const h = habit({
    '2024-01-01': true,
    '2024-01-03': true,
    '2024-01-05': true,
  });
  assert.equal(longestStreak(h), 1);
});

test('longestStreak works without a checkmarks property', () => {
  assert.equal(longestStreak({ id: 'h1', name: 'x', archived: false }), 0);
});

// ---------- weekCompletion ----------

test('weekCompletion is 0 when nothing is done in the week', () => {
  assert.equal(weekCompletion(habit({}), '2024-01-08', '2024-01-14'), 0);
});

test('weekCompletion is 1 for a fully completed week', () => {
  const h = habit({
    '2024-01-08': true,
    '2024-01-09': true,
    '2024-01-10': true,
    '2024-01-11': true,
    '2024-01-12': true,
    '2024-01-13': true,
    '2024-01-14': true,
  });
  assert.equal(weekCompletion(h, '2024-01-08', '2024-01-14'), 1);
});

test('weekCompletion only counts days up to today', () => {
  const h = habit({
    '2024-01-08': true,
    '2024-01-09': true,
  });
  closeTo(weekCompletion(h, '2024-01-08', '2024-01-10'), 2 / 3);
});

test('weekCompletion ignores checkmarks after today', () => {
  const h = habit({
    '2024-01-08': true,
    '2024-01-10': true,
  });
  closeTo(weekCompletion(h, '2024-01-08', '2024-01-09'), 1 / 2);
});

test('weekCompletion counts future days in the week as not done', () => {
  const h = habit({
    '2024-01-08': true,
    '2024-01-10': true,
  });
  closeTo(weekCompletion(h, '2024-01-08', '2024-01-11'), 2 / 4);
});

test('weekCompletion is 0 when today is before the week start', () => {
  assert.equal(weekCompletion(habit({ '2024-01-08': true }), '2024-01-08', '2024-01-07'), 0);
});

test('weekCompletion works without a checkmarks property', () => {
  assert.equal(weekCompletion({ id: 'h1', name: 'x', archived: false }, '2024-01-08', '2024-01-14'), 0);
});
