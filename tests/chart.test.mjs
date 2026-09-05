import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as chart from '../js/chart.js';

test('computeWeeklyRates returns 0 for every week when there are no active habits', () => {
  const weeks = [
    { start: '2024-01-08', end: '2024-01-14' },
    { start: '2024-01-15', end: '2024-01-21' },
  ];
  assert.deepEqual(chart.computeWeeklyRates(weeks, [], '2024-01-21'), [0, 0]);
});

test('computeWeeklyRates ignores archived habits', () => {
  const weeks = [{ start: '2024-01-08', end: '2024-01-14' }];
  const habits = [
    { id: 'a', name: 'A', checkmarks: { '2024-01-08': true }, archived: false },
    {
      id: 'b',
      name: 'B',
      checkmarks: { '2024-01-08': true, '2024-01-09': true },
      archived: true,
    },
  ];
  const [rate] = chart.computeWeeklyRates(weeks, habits, '2024-01-14');
  assert.ok(Math.abs(rate - 1 / 7) < 1e-9);
});

test('computeWeeklyRates counts only days up to today in the current week', () => {
  const weeks = [{ start: '2024-01-08', end: '2024-01-14' }];
  const habits = [
    {
      id: 'a',
      name: 'A',
      checkmarks: { '2024-01-08': true, '2024-01-09': true, '2024-01-10': true },
      archived: false,
    },
  ];
  const [rate] = chart.computeWeeklyRates(weeks, habits, '2024-01-10');
  assert.equal(rate, 1);
});

test('computeWeeklyRates averages checkmarks across active habits', () => {
  const weeks = [{ start: '2024-01-08', end: '2024-01-14' }];
  const habits = [
    { id: 'a', name: 'A', checkmarks: { '2024-01-08': true }, archived: false },
    {
      id: 'b',
      name: 'B',
      checkmarks: { '2024-01-08': true, '2024-01-09': true },
      archived: false,
    },
  ];
  const [rate] = chart.computeWeeklyRates(weeks, habits, '2024-01-14');
  assert.ok(Math.abs(rate - 3 / 14) < 1e-9);
});
