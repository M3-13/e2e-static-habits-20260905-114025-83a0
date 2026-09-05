function pad2(n) {
  return String(n).padStart(2, '0');
}

function mondayOf(d) {
  const copy = new Date(d);
  const diff = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

export function isoDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO() {
  return isoDate(new Date());
}

export function lastNDays(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(isoDate(d));
  }
  return out;
}

export function weekStartISO(d) {
  return isoDate(mondayOf(d));
}

export function lastNWeeks(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 7);
    const monday = mondayOf(d);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    out.push({ start: isoDate(monday), end: isoDate(sunday) });
  }
  return out;
}

export function init() {}
