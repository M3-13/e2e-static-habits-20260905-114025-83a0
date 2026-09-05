import * as store from './store.js';

const FILTER_ACTIVE = 'active';
const FILTER_ARCHIVED = 'archived';

let listEl = null;
let inputEl = null;
let addButton = null;
let filterToggle = null;
let emptyState = null;

let filter = FILTER_ACTIVE;
let lastSignature = null;

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // not available in this context — fall through to the timestamp fallback
    }
  }
  return 'h-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function structuralSignature(habits) {
  return habits
    .map((habit) => `${habit.id}\u0000${habit.name}\u0000${habit.archived ? '1' : '0'}`)
    .join('\u0001');
}

function findHabit(id) {
  return store.getState().habits.find((habit) => habit.id === id);
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  return button;
}

function createCard(habit) {
  const card = document.createElement('article');
  card.className = 'habit-card';
  card.dataset.id = habit.id;
  card.dataset.archived = habit.archived ? 'true' : 'false';

  const header = document.createElement('div');
  header.className = 'habit-card__header';

  const name = document.createElement('h3');
  name.className = 'habit-name';
  name.textContent = habit.name;

  const actions = document.createElement('div');
  actions.className = 'habit-card__actions';

  const renameButton = createButton('btn btn--secondary btn-rename', 'Umbenennen');
  renameButton.setAttribute('aria-label', `„${habit.name}“ umbenennen`);

  const archiveButton = createButton(
    'btn btn--secondary btn-archive',
    habit.archived ? 'Wiederherstellen' : 'Archivieren',
  );
  archiveButton.setAttribute(
    'aria-label',
    habit.archived ? `„${habit.name}“ wiederherstellen` : `„${habit.name}“ archivieren`,
  );

  const deleteButton = createButton('btn btn--danger btn-delete', 'Löschen');
  deleteButton.setAttribute('aria-label', `„${habit.name}“ löschen`);

  actions.appendChild(renameButton);
  actions.appendChild(archiveButton);
  actions.appendChild(deleteButton);

  header.appendChild(name);
  header.appendChild(actions);

  const stats = document.createElement('div');
  stats.className = 'habit-stats';
  stats.dataset.id = habit.id;

  const grid = document.createElement('div');
  grid.className = 'habit-grid';
  grid.dataset.id = habit.id;

  card.appendChild(header);
  card.appendChild(stats);
  card.appendChild(grid);

  return card;
}

function filteredHabits() {
  const habits = store.getState().habits;
  if (filter === FILTER_ARCHIVED) {
    return habits.filter((habit) => habit.archived);
  }
  return habits.filter((habit) => !habit.archived);
}

function render() {
  const habits = filteredHabits();
  listEl.replaceChildren();
  for (const habit of habits) {
    listEl.appendChild(createCard(habit));
  }
  emptyState.style.display = habits.length > 0 ? 'none' : '';
}

function setFilter(nextFilter) {
  filter = nextFilter;
  const tabs = Array.from(filterToggle.querySelectorAll('.filter-tab'));
  tabs.forEach((tab, index) => {
    const tabFilter = index === 1 ? FILTER_ARCHIVED : FILTER_ACTIVE;
    const active = tabFilter === nextFilter;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  render();
}

function addHabit() {
  const name = inputEl.value.trim();
  if (!name) {
    return;
  }
  store.update((state) => {
    state.habits.push({ id: makeId(), name, checkmarks: {}, archived: false });
  });
  inputEl.value = '';
  if (filter !== FILTER_ACTIVE) {
    setFilter(FILTER_ACTIVE);
  }
}

function deleteHabit(id) {
  const habit = findHabit(id);
  if (!habit) {
    return;
  }
  const confirmed = window.confirm(
    `„${habit.name}“ wirklich löschen? Die Gewohnheit und ihre gesamte Historie werden dauerhaft entfernt.`,
  );
  if (!confirmed) {
    return;
  }
  store.update((state) => {
    state.habits = state.habits.filter((habit) => habit.id !== id);
  });
}

function toggleArchive(id) {
  store.update((state) => {
    const habit = state.habits.find((item) => item.id === id);
    if (habit) {
      habit.archived = !habit.archived;
    }
  });
}

function renameInline(card) {
  const id = card.dataset.id;
  const habit = findHabit(id);
  if (!habit) {
    return;
  }

  const nameEl = card.querySelector('.habit-name');
  if (!nameEl) {
    return;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'habit-name-input';
  input.value = habit.name;
  input.setAttribute('aria-label', 'Name der Gewohnheit bearbeiten');
  nameEl.replaceWith(input);
  input.focus();
  input.select();

  let finished = false;

  function restoreName() {
    const current = card.querySelector('.habit-name-input');
    if (!current) {
      return;
    }
    const restored = document.createElement('h3');
    restored.className = 'habit-name';
    restored.textContent = habit.name;
    current.replaceWith(restored);
  }

  function commit() {
    if (finished) {
      return;
    }
    finished = true;
    const newName = input.value.trim();
    if (newName && newName !== habit.name) {
      store.update((state) => {
        const item = state.habits.find((habit) => habit.id === id);
        if (item) {
          item.name = newName;
        }
      });
    } else {
      restoreName();
    }
  }

  function cancel() {
    if (finished) {
      return;
    }
    finished = true;
    restoreName();
  }

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  });
  input.addEventListener('blur', commit);
}

function onListClick(event) {
  const card = event.target.closest('.habit-card');
  if (!card) {
    return;
  }
  const id = card.dataset.id;

  if (event.target.closest('.btn-rename')) {
    renameInline(card);
  } else if (event.target.closest('.btn-delete')) {
    deleteHabit(id);
  } else if (event.target.closest('.btn-archive')) {
    toggleArchive(id);
  }
}

function onFilterClick(event) {
  const tab = event.target.closest('.filter-tab');
  if (!tab) {
    return;
  }
  const tabs = Array.from(filterToggle.querySelectorAll('.filter-tab'));
  const index = tabs.indexOf(tab);
  setFilter(index === 1 ? FILTER_ARCHIVED : FILTER_ACTIVE);
}

function subscribeRender() {
  const signature = structuralSignature(store.getState().habits);
  if (signature !== lastSignature) {
    lastSignature = signature;
    render();
  }
}

export function init() {
  listEl = document.getElementById('habit-list');
  inputEl = document.getElementById('habit-input');
  addButton = document.getElementById('add-habit');
  filterToggle = document.getElementById('filter-toggle');
  emptyState = document.getElementById('empty-state');

  if (!listEl || !inputEl || !addButton || !filterToggle || !emptyState) {
    return;
  }

  addButton.addEventListener('click', addHabit);
  inputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addHabit();
    }
  });

  filterToggle.addEventListener('click', onFilterClick);

  listEl.addEventListener('click', onListClick);

  const emptyStateCta = emptyState.querySelector('.empty-state__cta');
  if (emptyStateCta) {
    emptyStateCta.addEventListener('click', () => {
      inputEl.focus();
    });
  }

  lastSignature = structuralSignature(store.getState().habits);
  store.subscribe(subscribeRender);

  render();
}
