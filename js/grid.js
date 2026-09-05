import { lastNDays } from './dates.js';
import { getState, update, subscribe } from './store.js';

const GRID_STYLE_ID = 'habit-grid-styles';

function ensureStyles() {
  if (document.getElementById(GRID_STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = GRID_STYLE_ID;
  style.textContent = `
.habit-grid__cell {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  flex: none;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--transition), background-color var(--transition);
}
@media (min-width: 640px) {
  .habit-grid__cell {
    width: 40px;
    height: 40px;
  }
}
.habit-grid__cell:hover {
  border-color: var(--color-accent);
}
.habit-grid__cell:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.habit-grid__cell.is-today {
  border: 2px solid var(--color-accent);
  background: var(--color-accent_soft);
}
.habit-grid__cell.is-checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}
.habit-grid__cell.is-checked::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 12px;
  border: solid var(--color-on_accent);
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}
.habit-grid__cell:disabled {
  opacity: 0.6;
  cursor: default;
}
.habit-grid__cell:disabled:hover {
  border-color: var(--color-border);
}
`;
  document.head.appendChild(style);
}

function findHabit(id) {
  return getState().habits.find((h) => h.id === id) || null;
}

function createCell(day, habit, today) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'habit-grid__cell';
  cell.dataset.date = day;
  cell.title = day;
  cell.setAttribute('aria-label', day);
  const checked = habit ? habit.checkmarks && habit.checkmarks[day] === true : false;
  cell.setAttribute('aria-pressed', checked ? 'true' : 'false');
  if (checked) {
    cell.classList.add('is-checked');
  }
  if (day === today) {
    cell.classList.add('is-today');
  }
  if (habit && habit.archived) {
    cell.setAttribute('disabled', '');
  }
  return cell;
}

function syncGrid(grid) {
  const habit = findHabit(grid.dataset.id);
  const days = lastNDays(30);
  const today = days[days.length - 1];
  const existing = Array.from(grid.children).filter((el) =>
    el.classList.contains('habit-grid__cell')
  );

  const lastDate = existing.length > 0 ? existing[existing.length - 1].dataset.date : null;
  if (existing.length !== days.length || lastDate !== today) {
    grid.textContent = '';
    for (const day of days) {
      grid.appendChild(createCell(day, habit, today));
    }
    return;
  }

  for (const cell of existing) {
    const day = cell.dataset.date;
    const checked = habit ? habit.checkmarks && habit.checkmarks[day] === true : false;
    cell.classList.toggle('is-checked', checked);
    cell.classList.toggle('is-today', day === today);
    cell.setAttribute('aria-pressed', checked ? 'true' : 'false');
    if (habit && habit.archived) {
      cell.setAttribute('disabled', '');
    } else {
      cell.removeAttribute('disabled');
    }
  }
}

function syncAllGrids() {
  document.querySelectorAll('.habit-grid[data-id]').forEach(syncGrid);
}

export function init() {
  ensureStyles();
  syncAllGrids();
  subscribe(syncAllGrids);
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    const cell = target.closest('.habit-grid__cell');
    if (!cell) {
      return;
    }
    const grid = cell.closest('.habit-grid[data-id]');
    if (!grid) {
      return;
    }
    const habit = findHabit(grid.dataset.id);
    if (!habit || habit.archived) {
      return;
    }
    const habitId = habit.id;
    const date = cell.dataset.date;
    update((state) => {
      const h = state.habits.find((hh) => hh.id === habitId);
      if (!h) {
        return;
      }
      if (!h.checkmarks) {
        h.checkmarks = {};
      }
      if (h.checkmarks[date]) {
        delete h.checkmarks[date];
      } else {
        h.checkmarks[date] = true;
      }
    });
  });
}
