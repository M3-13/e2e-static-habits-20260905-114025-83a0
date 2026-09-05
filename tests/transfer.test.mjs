import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateImport } from '../js/transfer.js';

function makeHabit(overrides = {}) {
  return {
    id: 'h1',
    name: 'Lesen',
    checkmarks: { '2024-01-05': true },
    archived: false,
    ...overrides,
  };
}

function makeState(overrides = {}) {
  return {
    version: 1,
    habits: [makeHabit()],
    theme: 'light',
    ...overrides,
  };
}

// ---------- valid cases ----------

test('accepts an empty state (no habits)', () => {
  assert.equal(validateImport({ version: 1, habits: [], theme: 'light' }), true);
  assert.equal(validateImport({ version: 1, habits: [], theme: 'dark' }), true);
});

test('accepts a state with one habit and checkmarks', () => {
  assert.equal(validateImport(makeState()), true);
});

test('accepts a habit with no checkmarks yet', () => {
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: {} })] })),
    true,
  );
});

test('accepts multiple checkmarks with valid date keys', () => {
  const habit = makeHabit({
    checkmarks: { '2024-01-01': true, '2024-02-29': true, '2024-12-31': true },
  });
  assert.equal(validateImport(makeState({ habits: [habit] })), true);
});

test('accepts an archived habit', () => {
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ archived: true })] })),
    true,
  );
});

// ---------- invalid top-level structure ----------

test('rejects null, primitives and arrays as the root object', () => {
  assert.equal(validateImport(null), false);
  assert.equal(validateImport(undefined), false);
  assert.equal(validateImport('text'), false);
  assert.equal(validateImport(42), false);
  assert.equal(validateImport([]), false);
});

test('rejects a state without a habits array', () => {
  assert.equal(validateImport({ theme: 'light' }), false);
  assert.equal(validateImport({ version: 1, habits: 'not-an-array', theme: 'light' }), false);
});

test('rejects a state with an invalid theme', () => {
  assert.equal(validateImport({ version: 1, habits: [], theme: 'blue' }), false);
  assert.equal(validateImport({ version: 1, habits: [] }), false);
});

// ---------- invalid habit fields ----------

test('rejects a habit that is not an object', () => {
  assert.equal(validateImport(makeState({ habits: ['nope'] })), false);
  assert.equal(validateImport(makeState({ habits: [null] })), false);
});

test('rejects a habit without a valid id', () => {
  assert.equal(validateImport(makeState({ habits: [makeHabit({ id: '' })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ id: 5 })] })), false);
});

test('rejects a habit whose name is missing, empty or non-string', () => {
  assert.equal(validateImport(makeState({ habits: [makeHabit({ name: '' })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ name: '   ' })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ name: 7 })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ name: undefined })] })), false);
});

test('rejects a habit whose archived flag is not a boolean', () => {
  assert.equal(validateImport(makeState({ habits: [makeHabit({ archived: 'true' })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ archived: 1 })] })), false);
});

// ---------- invalid checkmarks ----------

test('rejects checkmarks that are not an object', () => {
  assert.equal(validateImport(makeState({ habits: [makeHabit({ checkmarks: [] })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ checkmarks: null })] })), false);
  assert.equal(validateImport(makeState({ habits: [makeHabit({ checkmarks: 'yes' })] })), false);
});

test('rejects checkmark values that are not exactly true', () => {
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { '2024-01-05': false } })] })),
    false,
  );
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { '2024-01-05': 'true' } })] })),
    false,
  );
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { '2024-01-05': 1 } })] })),
    false,
  );
});

test('rejects checkmark keys that are not valid ISO dates', () => {
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { 'today': true } })] })),
    false,
  );
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { '01/05/2024': true } })] })),
    false,
  );
});

test('rejects checkmark keys that are not real calendar dates', () => {
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { '2024-13-40': true } })] })),
    false,
  );
  assert.equal(
    validateImport(makeState({ habits: [makeHabit({ checkmarks: { '2024-02-31': true } })] })),
    false,
  );
});

// ---------- roundtrip ----------

test('accepts a state produced by the app itself (export shape)', () => {
  const exported = {
    version: 1,
    habits: [
      {
        id: 'abc123',
        name: 'Meditieren',
        checkmarks: { '2024-06-01': true, '2024-06-02': true },
        archived: false,
      },
      {
        id: 'def456',
        name: 'Laufen',
        checkmarks: {},
        archived: true,
      },
    ],
    theme: 'dark',
  };
  assert.equal(validateImport(exported), true);
});
