import * as store from './store.js';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function init() {
  const toggle = document.getElementById('theme-toggle');

  const current = store.getState().theme;
  applyTheme(current === 'dark' ? 'dark' : 'light');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(current === 'dark'));
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = store.getState().theme === 'dark' ? 'light' : 'dark';
      store.update((s) => {
        s.theme = next;
      });
      applyTheme(next);
      toggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }
}
