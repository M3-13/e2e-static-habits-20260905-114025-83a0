import * as store from './store.js';
import * as dates from './dates.js';

const WEEK_COUNT = 8;
const BAR_GAP = 12;
const BAR_MAX_WIDTH = 32;
const CORNER_RADIUS = 6;
const MIN_BAR_HEIGHT = 2;
const PAD_TOP = 8;
const PAD_BOTTOM = 26;
const PAD_SIDE = 8;
const LABEL_SIZE = 12;

function daysInRange(startISO, endISO) {
  const out = [];
  const cursor = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  while (cursor <= end) {
    out.push(dates.isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function computeWeeklyRates(weeks, habits, todayISO = dates.todayISO()) {
  const active = (habits || []).filter((h) => h && h.archived !== true);
  return weeks.map((week) => {
    const days = daysInRange(week.start, week.end);
    const elapsed = days.filter((d) => d <= todayISO);
    const possible = active.length * elapsed.length;
    if (possible === 0) {
      return 0;
    }
    let done = 0;
    for (const habit of active) {
      const marks = habit.checkmarks || {};
      for (const d of elapsed) {
        if (marks[d] === true) {
          done += 1;
        }
      }
    }
    return done / possible;
  });
}

function weekLabel(startISO) {
  const d = new Date(`${startISO}T00:00:00`);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function roundedTopRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

export function init() {
  const canvas = document.getElementById('chart');
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  function themeColors() {
    const styles = getComputedStyle(document.documentElement);
    const read = (name, fallback) => {
      const value = styles.getPropertyValue(name).trim();
      return value || fallback;
    };
    return {
      accent: read('--color-accent', '#4F46E5'),
      muted: read('--color-muted', '#6E7480'),
      border: read('--color-border', '#E3E5E8'),
      fontFamily: read('--font-family', 'system-ui, sans-serif'),
    };
  }

  function draw() {
    const colors = themeColors();
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    if (cssWidth <= 0 || cssHeight <= 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const innerWidth = cssWidth - PAD_SIDE * 2;
    const innerHeight = cssHeight - PAD_TOP - PAD_BOTTOM;
    if (innerWidth <= 0 || innerHeight <= 0) {
      return;
    }

    const weeks = dates.lastNWeeks(WEEK_COUNT);
    const rates = computeWeeklyRates(weeks, store.getState().habits);

    let barWidth = BAR_MAX_WIDTH;
    const fullWidth = WEEK_COUNT * barWidth + (WEEK_COUNT - 1) * BAR_GAP;
    if (fullWidth > innerWidth) {
      barWidth = Math.max(4, (innerWidth - (WEEK_COUNT - 1) * BAR_GAP) / WEEK_COUNT);
    }
    const barsWidth = WEEK_COUNT * barWidth + (WEEK_COUNT - 1) * BAR_GAP;
    const startX = PAD_SIDE + (innerWidth - barsWidth) / 2;

    ctx.strokeStyle = colors.border;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i += 1) {
      const y = PAD_TOP + innerHeight - (innerHeight * i) / 4;
      ctx.moveTo(PAD_SIDE, y);
      ctx.lineTo(cssWidth - PAD_SIDE, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = `${LABEL_SIZE}px ${colors.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < WEEK_COUNT; i += 1) {
      const x = startX + i * (barWidth + BAR_GAP);
      const rate = rates[i] || 0;
      const filled = rate > 0;
      const barHeight = filled ? Math.max(rate * innerHeight, MIN_BAR_HEIGHT) : MIN_BAR_HEIGHT;
      const y = PAD_TOP + innerHeight - barHeight;

      ctx.fillStyle = filled ? colors.accent : colors.muted;
      roundedTopRect(ctx, x, y, barWidth, barHeight, CORNER_RADIUS);
      ctx.fill();

      ctx.fillStyle = colors.muted;
      ctx.fillText(weekLabel(weeks[i].start), x + barWidth / 2, PAD_TOP + innerHeight + 6);
    }
  }

  store.subscribe(draw);
  draw();

  window.addEventListener('resize', draw);
}
