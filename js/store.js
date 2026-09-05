export const STORAGE_KEY = 'habitTracker.v1';

let state = null;
const subscribers = new Set();

function getStorage() {
  return typeof globalThis !== 'undefined' ? globalThis.localStorage ?? null : null;
}

function defaultState() {
  return { version: 1, habits: [], theme: 'light' };
}

function isValidState(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.version === 'number' &&
    Array.isArray(value.habits) &&
    (value.theme === 'light' || value.theme === 'dark')
  );
}

export function loadState() {
  const storage = getStorage();
  let raw = null;
  if (storage) {
    try {
      raw = storage.getItem(STORAGE_KEY);
    } catch {
      raw = null;
    }
  }
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        state = parsed;
        return parsed;
      }
    } catch {
      // fall through to the default state
    }
  }
  state = defaultState();
  return state;
}

export function getState() {
  if (state === null) {
    return loadState();
  }
  return state;
}

function persist() {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable or full — keep the in-memory state
  }
}

export function update(mutator) {
  const current = getState();
  mutator(current);
  persist();
  for (const fn of subscribers) {
    fn();
  }
}

export function subscribe(fn) {
  subscribers.add(fn);
}

export function init() {
  getState();
}
