import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateImport } from '../js/transfer.js';

function validHabit(overrides = {}) {
  return {
    id: 'h1',
    name: 'Lesen',
    checkmarks: { '2024-01-05': true, '2024-01-06': true },
    archived: false,
    ...overrides,
  };
}

function validState(overrides = {}) {
  return {
    version: 1,
    habits: [validHabit()],
    theme: 'light',
    ...overrides,
  };
}

test('validateImport accepts the valid object form', () => {
  assert.equal(validateImport(validState()), true);
});

test('validateImport accepts an empty habits list and empty checkmarks', () => {
  assert.equal(validateImport(validState({ habits: [] })), true);
  assert.equal(
    validateImport(validState({ habits: [validHabit({ checkmarks: {} })] })),
    true,
  );
});

test('validateImport accepts the dark theme', () => {
  assert.equal(validateImport(validState({ theme: 'dark' })), true);
});

test('validateImport rejects checkmarks as an array', () => {
  const data = validState({
    habits: [validHabit({ checkmarks: ['2024-01-05', '2024-01-06'] })],
  });
  assert.equal(validateImport(data), false);
});

test('validateImport rejects checkmarks with keys that are not ISO dates', () => {
  const data = validState({
    habits: [validHabit({ checkmarks: { 'not-a-date': true } })],
  });
  assert.equal(validateImport(data), false);
});

test('validateImport rejects malformed or impossible date keys', () => {
  const badKeys = ['2024-1-5', '2024-13-01', '2024-02-31', '24-01-05', ''];
  for (const key of badKeys) {
    const data = validState({
      habits: [validHabit({ checkmarks: { [key]: true } })],
    });
    assert.equal(validateImport(data), false, `key "${key}" should be rejected`);
  }
});

test('validateImport rejects checkmarks values that are not strictly true', () => {
  const badValues = [false, 1, 0, 'true', null, undefined, {}, []];
  for (const value of badValues) {
    const data = validState({
      habits: [validHabit({ checkmarks: { '2024-01-05': value } })],
    });
    assert.equal(
      validateImport(data),
      false,
      `value ${String(value)} should be rejected`,
    );
  }
});

test('validateImport rejects a habit with missing fields', () => {
  const cases = [
    { id: undefined },
    { name: undefined },
    { checkmarks: undefined },
    { archived: undefined },
  ];
  for (const missing of cases) {
    const data = validState({ habits: [validHabit(missing)] });
    assert.equal(validateImport(data), false);
  }
});

test('validateImport rejects a habit with wrongly typed fields', () => {
  const cases = [
    { id: 42 },
    { name: 42 },
    { name: '' },
    { name: '   ' },
    { archived: 0 },
    { archived: 'false' },
    { checkmarks: null },
    { checkmarks: 'nope' },
  ];
  for (const wrong of cases) {
    const data = validState({ habits: [validHabit(wrong)] });
    assert.equal(validateImport(data), false);
  }
});

test('validateImport rejects a theme with any other value', () => {
  for (const theme of ['blue', 'DARK', '', null, 1, undefined]) {
    const data = validState({ theme });
    assert.equal(validateImport(data), false, `theme ${String(theme)} rejected`);
  }
});

test('validateImport rejects missing or wrongly typed top-level fields', () => {
  assert.equal(validateImport(validState({ version: undefined })), false);
  assert.equal(validateImport(validState({ version: '1' })), false);
  assert.equal(validateImport(validState({ habits: undefined })), false);
  assert.equal(validateImport(validState({ habits: 'nope' })), false);
  assert.equal(validateImport(validState({ theme: undefined })), false);
});

test('validateImport rejects non-object input without throwing', () => {
  assert.equal(validateImport(null), false);
  assert.equal(validateImport(undefined), false);
  assert.equal(validateImport([]), false);
  assert.equal(validateImport('x'), false);
  assert.equal(validateImport(42), false);
});
