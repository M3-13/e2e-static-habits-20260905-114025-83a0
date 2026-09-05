import * as store from './store.js';
import { todayISO } from './dates.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isISODateKey(key) {
  if (typeof key !== 'string' || !DATE_KEY_RE.test(key)) {
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

function isValidCheckmarks(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (!isISODateKey(key)) {
      return false;
    }
    if (value[key] !== true) {
      return false;
    }
  }
  return true;
}

function isValidHabit(habit) {
  return (
    habit !== null &&
    typeof habit === 'object' &&
    typeof habit.id === 'string' &&
    typeof habit.name === 'string' &&
    habit.name.trim().length > 0 &&
    isValidCheckmarks(habit.checkmarks) &&
    typeof habit.archived === 'boolean'
  );
}

export function validateImport(data) {
  if (data === null || typeof data !== 'object') {
    return false;
  }
  if (typeof data.version !== 'number') {
    return false;
  }
  if (!Array.isArray(data.habits)) {
    return false;
  }
  if (data.theme !== 'light' && data.theme !== 'dark') {
    return false;
  }
  for (const habit of data.habits) {
    if (!isValidHabit(habit)) {
      return false;
    }
  }
  return true;
}

let exportButton = null;
let importButton = null;
let importFile = null;
let messageBox = null;
let messageTimer = null;

function ensureMessageBox() {
  if (messageBox) {
    return messageBox;
  }
  messageBox = document.createElement('div');
  messageBox.id = 'transfer-message';
  messageBox.className = 'transfer-message';
  messageBox.setAttribute('role', 'status');
  messageBox.setAttribute('aria-live', 'polite');
  messageBox.hidden = true;
  messageBox.style.padding = '12px 16px';
  messageBox.style.borderRadius = 'var(--radius-md)';
  messageBox.style.fontSize = 'var(--size-base)';
  messageBox.style.border = '1px solid transparent';

  const main = document.querySelector('main.container');
  if (main) {
    main.insertBefore(messageBox, main.firstChild);
  }
  return messageBox;
}

function showMessage(message, kind) {
  const box = ensureMessageBox();
  if (!box) {
    return;
  }
  if (messageTimer) {
    clearTimeout(messageTimer);
  }
  box.textContent = message;
  box.hidden = false;
  if (kind === 'error') {
    box.setAttribute('role', 'alert');
    box.style.color = 'var(--color-danger)';
    box.style.backgroundColor = 'rgba(220, 38, 38, 0.08)';
    box.style.borderColor = 'rgba(220, 38, 38, 0.4)';
  } else {
    box.setAttribute('role', 'status');
    box.style.color = 'var(--color-success)';
    box.style.backgroundColor = 'rgba(22, 163, 74, 0.08)';
    box.style.borderColor = 'rgba(22, 163, 74, 0.4)';
  }
  messageTimer = setTimeout(() => {
    box.hidden = true;
  }, 5000);
}

function exportState() {
  const state = store.getState();
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `habits-${todayISO()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function importState(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(String(reader.result));
    } catch {
      showMessage(
        'Import fehlgeschlagen: Die Datei enthält kein gültiges JSON.',
        'error',
      );
      return;
    }
    if (!validateImport(data)) {
      showMessage(
        'Import fehlgeschlagen: Die Datei hat ein ungültiges Format. Deine vorhandenen Daten wurden nicht verändert.',
        'error',
      );
      return;
    }
    store.update((state) => {
      state.version = data.version;
      state.habits = data.habits;
      state.theme = data.theme;
    });
    document.documentElement.setAttribute('data-theme', data.theme);
    showMessage('Import erfolgreich: Deine Daten wurden übernommen.', 'success');
    if (importFile) {
      importFile.value = '';
    }
  };
  reader.onerror = () => {
    showMessage(
      'Import fehlgeschlagen: Die Datei konnte nicht gelesen werden.',
      'error',
    );
  };
  reader.readAsText(file);
}

export function init() {
  exportButton = document.getElementById('export-btn');
  importButton = document.getElementById('import-btn');
  importFile = document.getElementById('import-file');

  if (exportButton) {
    exportButton.addEventListener('click', exportState);
  }
  if (importButton && importFile) {
    importButton.addEventListener('click', () => {
      importFile.click();
    });
  }
  if (importFile) {
    importFile.addEventListener('change', () => {
      const file = importFile.files && importFile.files[0];
      if (!file) {
        return;
      }
      importState(file);
    });
  }
}
