import * as store from './store.js';
import * as dates from './dates.js';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function parseISO(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDaysISO(iso, delta) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function currentStreak(habit, todayIso) {
  const marks = habit.checkmarks || {};
  let anchor = todayIso;
  if (!marks[anchor]) {
    anchor = addDaysISO(todayIso, -1);
  }
  let streak = 0;
  let day = anchor;
  while (marks[day]) {
    streak += 1;
    day = addDaysISO(day, -1);
  }
  return streak;
}

export function longestStreak(habit) {
  const marks = habit.checkmarks || {};
  const days = Object.keys(marks).sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const day of days) {
    if (prev !== null && addDaysISO(prev, 1) === day) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) {
      longest = run;
    }
    prev = day;
  }
  return longest;
}

export function weekCompletion(habit, weekStartIso, todayIso) {
  const marks = habit.checkmarks || {};
  let total = 0;
  let done = 0;
  let day = weekStartIso;
  while (day <= todayIso) {
    total += 1;
    if (marks[day]) {
      done += 1;
    }
    day = addDaysISO(day, 1);
  }
  return total === 0 ? 0 : done / total;
}

export function init() {
  function badge(text) {
    const span = document.createElement('span');
    span.className = 'stat-badge';
    span.style.padding = '4px 10px';
    span.style.borderRadius = 'var(--radius-pill)';
    span.style.fontSize = 'var(--size-sm)';
    span.style.fontWeight = '600';
    span.style.backgroundColor = 'var(--color-surface_2)';
    span.style.color = 'var(--color-muted)';
    span.textContent = text;
    return span;
  }

  function render() {
    const state = store.getState();
    const todayIso = dates.todayISO();
    const weekStartIso = dates.weekStartISO(new Date());
    const containers = document.querySelectorAll('.habit-stats[data-id]');
    for (const container of containers) {
      const id = container.getAttribute('data-id');
      const habit = state.habits.find((h) => h.id === id);
      if (!habit) {
        continue;
      }
      const current = currentStreak(habit, todayIso);
      const longest = longestStreak(habit);
      const percent = Math.round(weekCompletion(habit, weekStartIso, todayIso) * 100);
      container.textContent = '';
      container.appendChild(badge(`Serie: ${current}`));
      container.appendChild(badge(`Rekord: ${longest}`));
      container.appendChild(badge(`Woche: ${percent}%`));
    }
  }

  store.subscribe(render);
  render();
}
