import * as store from './store.js';
import { todayISO } from './dates.js';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MESSAGE_ID = 'transfer-message';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateKey(key) {
  if (typeof key !== 'string' || !DATE_KEY_PATTERN.test(key)) {
    return false;
  }
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function validateHabit(habit) {
  if (habit === null || typeof habit !== 'object' || Array.isArray(habit)) {
    return 'eine Gewohnheit hat ein ungültiges Format';
  }
  if (typeof habit.id !== 'string' || habit.id.length === 0) {
    return 'eine Gewohnheit hat keine gültige ID';
  }
  if (!isNonEmptyString(habit.name)) {
    return 'eine Gewohnheit hat keinen gültigen Namen';
  }
  if (typeof habit.archived !== 'boolean') {
    return 'der Archivstatus ist ungültig';
  }
  if (
    habit.checkmarks === null ||
    typeof habit.checkmarks !== 'object' ||
    Array.isArray(habit.checkmarks)
  ) {
    return 'die Erledigungen haben ein ungültiges Format';
  }
  for (const [key, value] of Object.entries(habit.checkmarks)) {
    if (!isValidDateKey(key)) {
      return 'die Erledigungen enthalten ein ungültiges Datum';
    }
    if (value !== true) {
      return 'die Erledigungen enthalten einen ungültigen Wert';
    }
  }
  return null;
}

function getValidationError(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return 'die Datei enthält keine gültigen Daten';
  }
  if (!Array.isArray(data.habits)) {
    return 'die Datei enthält keine Gewohnheitsliste';
  }
  for (const habit of data.habits) {
    const error = validateHabit(habit);
    if (error) {
      return error;
    }
  }
  if (data.theme !== 'light' && data.theme !== 'dark') {
    return 'das Design (theme) ist ungültig';
  }
  return null;
}

export function validateImport(data) {
  return getValidationError(data) === null;
}

function ensureMessageElement() {
  const container = document.querySelector('.container');
  if (!container) {
    return null;
  }
  let el = document.getElementById(MESSAGE_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = MESSAGE_ID;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.hidden = true;
    el.style.display = 'none';
    el.style.marginTop = '8px';
    el.style.padding = '12px 16px';
    el.style.borderRadius = 'var(--radius-md)';
    el.style.border = '1px solid var(--color-border)';
    el.style.fontSize = 'var(--size-base)';
    container.insertBefore(el, container.firstChild);
  }
  return el;
}

function showMessage(text, kind) {
  const el = ensureMessageElement();
  if (!el) {
    return;
  }
  el.textContent = text;
  el.hidden = false;
  el.style.display = 'block';
  if (kind === 'error') {
    el.style.color = 'var(--color-danger)';
    el.style.borderColor = 'var(--color-danger)';
    el.style.backgroundColor = 'var(--color-surface)';
  } else {
    el.style.color = 'var(--color-success)';
    el.style.borderColor = 'var(--color-border)';
    el.style.backgroundColor = 'var(--color-surface)';
  }
}

function exportData() {
  const state = store.getState();
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `gewohnheiten-${todayISO()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importData(file) {
  file
    .text()
    .then((text) => {
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        showMessage(
          'Die Datei konnte nicht gelesen werden: sie enthält kein gültiges JSON. Deine vorhandenen Daten wurden nicht verändert.',
          'error',
        );
        return;
      }
      const error = getValidationError(data);
      if (error) {
        showMessage(
          `Import fehlgeschlagen: ${error}. Deine vorhandenen Daten wurden nicht verändert.`,
          'error',
        );
        return;
      }
      store.update((s) => {
        s.version = 1;
        s.habits = data.habits;
        s.theme = data.theme;
      });
      showMessage('Daten erfolgreich importiert.', 'success');
    })
    .catch(() => {
      showMessage(
        'Die Datei konnte nicht gelesen werden. Deine vorhandenen Daten wurden nicht verändert.',
        'error',
      );
    });
}

export function init() {
  const exportBtn = document.querySelector('#export-btn');
  const importBtn = document.querySelector('#import-btn');
  const importFile = document.querySelector('#import-file');

  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }

  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', () => {
      const file = importFile.files && importFile.files[0];
      if (!file) {
        return;
      }
      importData(file);
      importFile.value = '';
    });
  }
}
