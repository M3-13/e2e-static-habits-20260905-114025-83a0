import * as store from './store.js';
import * as habits from './habits.js';
import * as grid from './grid.js';
import * as stats from './stats.js';
import * as chart from './chart.js';
import * as theme from './theme.js';
import * as transfer from './transfer.js';

store.loadState();

habits.init();
grid.init();
stats.init();
chart.init();
theme.init();
transfer.init();
