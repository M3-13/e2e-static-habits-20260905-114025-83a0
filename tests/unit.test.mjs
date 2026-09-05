import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import * as dates from '../js/dates.js';
import * as store from '../js/store.js';

function makeFakeStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
}

beforeEach(() => {
  globalThis.localStorage = makeFakeStorage();
});

// ---------- dates.js ----------

test('isoDate formats a Date as YYYY-MM-DD (local time)', () => {
  assert.equal(dates.isoDate(new Date(2024, 0, 5)), '2024-01-05');
  assert.equal(dates.isoDate(new Date(2024, 11, 31)), '2024-12-31');
});

test('todayISO returns today in YYYY-MM-DD', () => {
  assert.equal(dates.todayISO(), dates.isoDate(new Date()));
});

test('lastNDays returns n days, oldest first, today last', () => {
  const n = 5;
  const days = dates.lastNDays(n);
  assert.equal(days.length, n);
  assert.equal(days[n - 1], dates.todayISO());
  assert.ok(days[0] <= days[n - 1]);
  for (const d of days) {
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('weekStartISO returns the Monday of the given date', () => {
  assert.equal(dates.weekStartISO(new Date(2024, 0, 10)), '2024-01-08');
  assert.equal(dates.weekStartISO(new Date(2024, 0, 8)), '2024-01-08');
  assert.equal(dates.weekStartISO(new Date(2024, 0, 14)), '2024-01-08');
});

test('lastNWeeks returns n weeks, oldest first, Monday to Sunday', () => {
  const n = 8;
  const weeks = dates.lastNWeeks(n);
  assert.equal(weeks.length, n);
  assert.ok(weeks[0].start < weeks[n - 1].start);
  for (const w of weeks) {
    const start = new Date(w.start + 'T00:00:00');
    const end = new Date(w.end + 'T00:00:00');
    assert.equal(start.getDay(), 1, `${w.start} should be a Monday`);
    assert.equal(end.getDay(), 0, `${w.end} should be a Sunday`);
  }
});

// ---------- store.js ----------

test('loadState returns the default state when storage is empty', () => {
  assert.deepEqual(store.loadState(), { version: 1, habits: [], theme: 'light' });
});

test('loadState returns the default state on corrupt data', () => {
  globalThis.localStorage.setItem('habitTracker.v1', '{not valid json');
  assert.deepEqual(store.loadState(), { version: 1, habits: [], theme: 'light' });
});

test('update persists and loadState restores (roundtrip)', () => {
  store.loadState();
  store.update((s) => {
    s.habits.push({ id: 'h1', name: 'Lesen', checkmarks: {}, archived: false });
    s.theme = 'dark';
  });
  const restored = store.loadState();
  assert.equal(restored.habits.length, 1);
  assert.equal(restored.habits[0].name, 'Lesen');
  assert.equal(restored.theme, 'dark');
});

test('subscribe notifies subscribers on update', () => {
  store.loadState();
  let calls = 0;
  store.subscribe(() => {
    calls += 1;
  });
  store.update((s) => {
    s.theme = 'light';
  });
  assert.equal(calls, 1);
});
