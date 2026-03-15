/**
 * StromAnalytics main.js v3.2
 */
import './style.css';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from 'chartjs-chart-financial';
Chart.register(...registerables, CandlestickController, CandlestickElement, OhlcController, OhlcElement);

const CFG = { OF_TICK: 1200, VIX_TICK: 2000, SENT_TICK: 3500, HEATMAP_TICK: 2500, LOG_TICK: 3800, API_POLL: 8000, CHART_WIN: 90, SEED: 80, LOG_MAX: 40, ANOMALY_CD: 6000, ALERT_MIN: 15000, ALERT_MAX: 30000, GRID: 20 };

const STOCKS = [
  { sym: 'RELIANCE', base: 2850, name: 'Reliance Industries', sector: 'Energy' },
  { sym: 'TCS', base: 3780, name: 'Tata Consultancy Services', sector: 'IT' },
  { sym: 'HDFCBANK', base: 1640, name: 'HDFC Bank', sector: 'Finance' },
  { sym: 'INFY', base: 1510, name: 'Infosys', sector: 'IT' },
  { sym: 'ICICIBANK', base: 1090, name: 'ICICI Bank', sector: 'Finance' },
  { sym: 'HINDUNILVR', base: 2420, name: 'Hindustan Unilever', sector: 'FMCG' },
  { sym: 'SBIN', base: 780, name: 'State Bank of India', sector: 'Finance' },
  { sym: 'BAJFINANCE', base: 7100, name: 'Bajaj Finance', sector: 'Finance' },
  { sym: 'MARUTI', base: 11800, name: 'Maruti Suzuki', sector: 'Auto' },
  { sym: 'WIPRO', base: 480, name: 'Wipro', sector: 'IT' },
  { sym: 'ONGC', base: 270, name: 'Oil & Natural Gas Corp', sector: 'Energy' },
  { sym: 'TITAN', base: 3400, name: 'Titan Company', sector: 'Consumer' },
  { sym: 'AXISBANK', base: 1060, name: 'Axis Bank', sector: 'Finance' },
  { sym: 'KOTAKBANK', base: 1780, name: 'Kotak Mahindra Bank', sector: 'Finance' },
  { sym: 'SUNPHARMA', base: 1680, name: 'Sun Pharmaceutical', sector: 'Pharma' },
];

const SEARCH_INDEX = [...STOCKS,
{ sym: 'NIFTY50', name: 'NIFTY 50 Index', sector: 'Index' }, { sym: 'BANKNIFTY', name: 'BANK NIFTY Index', sector: 'Index' },
{ sym: 'ADANIENT', name: 'Adani Enterprises', sector: 'Conglomerate' }, { sym: 'ADANIPORTS', name: 'Adani Ports & SEZ', sector: 'Infrastructure' },
{ sym: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer' }, { sym: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'Finance' },
{ sym: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom' }, { sym: 'CIPLA', name: 'Cipla', sector: 'Pharma' },
{ sym: 'HCLTECH', name: 'HCL Technologies', sector: 'IT' }, { sym: 'ITC', name: 'ITC Limited', sector: 'FMCG' },
{ sym: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto' }, { sym: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals' },
{ sym: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure' }, { sym: 'NTPC', name: 'NTPC Limited', sector: 'Energy' },
];

const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const snapTo = (v, g) => Math.round(v / g) * g;
const $ = id => document.getElementById(id);
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function fmtINR(v) { if (!v && v !== 0) return '\u2014'; const s = Math.round(v).toString(); if (s.length <= 3) return '\u20B9' + s; const l = s.slice(-3); return '\u20B9' + s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + l; }
function fmtNum(v) { if (!v && v !== 0) return '\u2014'; if (v >= 1e7) return (v / 1e7).toFixed(2) + ' Cr'; if (v >= 1e5) return (v / 1e5).toFixed(2) + ' L'; return v.toLocaleString('en-IN'); }
function fmtTime(d = new Date()) { return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'); }
function fmtDate(d = new Date()) { const D = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']; return `${D[d.getDay()]} ${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`; }
const nowStr = () => fmtTime();

const S = { of: 0, ofH: [], ofConsec: { sign: 0, n: 0 }, vix: 28, vixH: [], prevVix: 28, sent: 0.12, sentH: [], stockPrices: {}, apiData: null, lastAnomaly: 0, anomCount: 0, alertCount: 0, topGainerSym: 'TCS', activePeriod: 'D' };
const CHARTS = {};

const genOF = p => clamp((p || 0) * 0.82 + rand(-28, 28), -100, 100);
const genVIX = p => clamp((p || 28) + rand(-1.8, 1.8), 10, 80);
const genSent = p => clamp((p || 0) + rand(-0.09, 0.09), -1, 1);

function seed(fn, n) { const a = []; let v = fn(undefined); for (let i = 0; i < n; i++) { a.push(v); v = fn(v); } return a; }

function initCharts() {
  // OrderFlow
  {
    const data = seed(genOF, CFG.SEED); S.ofH = [...data]; S.of = data.at(-1);
    const el = $('chartOrderflow'), ctx = el.getContext('2d');
    CHARTS.of = new Chart(ctx, { type: 'bar', data: { labels: data.map((_, i) => i), datasets: [{ data, backgroundColor: data.map(v => v >= 0 ? cssVar('--c-green') + 'cc' : cssVar('--c-red') + 'cc'), borderWidth: 0, barPercentage: 0.85 }] }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { grid: { color: cssVar('--c-s3') + '33', drawBorder: false }, border: { display: false }, ticks: { color: cssVar('--c-l3'), maxTicksLimit: 4 }, suggestedMin: -100, suggestedMax: 100 } } } });
    initCrosshair('chartOrderflow', 'tooltipOrderflow', 'crosshairOrderflow', i => { const v = S.ofH[i] || 0; return { label: 'ORDER FLOW', val: (v >= 0 ? '+' : '') + v.toFixed(1), sub: v >= 0 ? 'Buying Pressure' : 'Selling Pressure', subCls: v >= 0 ? 'pos' : 'neg' }; }, 'of');
  }
  // VIX
  {
    const data = seed(genVIX, CFG.SEED); S.vixH = [...data]; S.vix = data.at(-1); S.prevVix = data.at(-2);
    const el = $('chartVix'), ctx = el.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, el.offsetHeight || 200); g.addColorStop(0, cssVar('--c-red') + '33'); g.addColorStop(1, 'transparent');
    CHARTS.vix = new Chart(ctx, { type: 'line', data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: cssVar('--c-red'), borderWidth: 1.8, backgroundColor: g, fill: true, tension: 0.3, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { position: 'right', border: { display: false }, grid: { color: cssVar('--c-s3') + '55' }, ticks: { color: cssVar('--c-l3'), maxTicksLimit: 4, font: { size: 10 } } } } } });
    initCrosshair('chartVix', 'tooltipVix', 'crosshairVix', i => { const v = S.vixH[i] || 0; const risk = v > 30 ? 'HIGH RISK' : v > 20 ? 'MODERATE' : 'LOW RISK'; return { label: 'INDIA VIX', val: v.toFixed(2), sub: risk, subCls: v > 30 ? 'neg' : v > 20 ? '' : 'pos' }; }, 'vix');
  }
  // Live Candlestick
  initLiveChart();
}

/* ── Crosshair + Tooltip for line/bar charts ─────────────── */
function initCrosshair(canvasId, tipId, crossId, dataFn, type) {
  const canvas = $(canvasId), tip = $(tipId), cross = $(crossId);
  if (!canvas || !tip || !cross) return;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const arr = type === 'of' ? S.ofH : S.vixH;
    const idx = Math.max(0, Math.min(arr.length - 1, Math.round(xPct * (arr.length - 1))));
    const info = dataFn(idx);
    tip.innerHTML = `<div class="ct-label">${info.label}</div><div class="ct-val">${info.val}</div><div class="ct-delta ${info.subCls}">${info.sub}</div>`;
    let tx = e.clientX - rect.left + 14;
    if (tx + 140 > rect.width) tx = e.clientX - rect.left - 154;
    tip.style.left = tx + 'px'; tip.style.top = (e.clientY - rect.top - 40) + 'px';
    tip.classList.add('visible');
    cross.style.left = (e.clientX - rect.left) + 'px'; cross.classList.add('visible');
  });
  canvas.addEventListener('mouseleave', () => { tip.classList.remove('visible'); cross.classList.remove('visible'); });
}

/* ── Candlestick Chart ───────────────────────────────────── */
function genOHLC(base, days) {
  const data = []; const MS_DAY = 86400000; const now = Date.now();
  let price = base;
  for (let i = days; i >= 0; i--) {
    const t = now - i * MS_DAY;
    const open = price;
    const change = rand(-0.025, 0.025);
    const close = Math.max(base * 0.5, open * (1 + change));
    const high = Math.max(open, close) * (1 + rand(0, 0.01));
    const low = Math.min(open, close) * (1 - rand(0, 0.01));
    data.push({ x: t, o: +open.toFixed(2), h: +high.toFixed(2), l: +low.toFixed(2), c: +close.toFixed(2) });
    price = close;
  }
  return data;
}

function getCandleData(sym, period) {
  const stock = STOCKS.find(s => s.sym === sym) || STOCKS[0];
  const base = S.stockPrices[sym]?.price || stock.base;
  // Support both old codes ('D','W','M') and new HTML codes ('1D','1W','1M','1Y')
  const p = period ? period.replace(/^1/, '') : 'D';
  const pts = p === 'Y' ? 12 : p === 'M' ? 30 : p === 'W' ? 14 : 24;
  return genOHLC(base, pts);
}

function initLiveChart() {
  const canvas = $('chartLive'); if (!canvas) return;
  try {
    if (CHARTS.live) { CHARTS.live.destroy(); delete CHARTS.live; }
    const ctx = canvas.getContext('2d');
    const sym = S.topGainerSym || 'TCS';
    const raw = getCandleData(sym, S.activePeriod);
    $('liveChartSym').textContent = sym;
    // Convert timestamp x to label string so no time adapter needed
    const labels = raw.map(pt => {
      const d = new Date(pt.x);
      const np = S.activePeriod ? S.activePeriod.replace(/^1/, '') : 'D';
      if (np === 'D') return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
      if (np === 'W') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      if (np === 'Y') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
      return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    });
    const candleData = raw.map((pt, i) => ({ x: i, o: pt.o, h: pt.h, l: pt.l, c: pt.c }));
    CHARTS.live = new Chart(ctx, {
      type: 'candlestick',
      data: { labels, datasets: [{ data: candleData, color: { up: cssVar('--c-green') || '#30d158', down: cssVar('--c-red') || '#ff453a', unchanged: '#888' }, borderColor: { up: cssVar('--c-green') || '#30d158', down: cssVar('--c-red') || '#ff453a', unchanged: '#888' } }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { type: 'category', grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 9 }, maxTicksLimit: 8 } },
          y: { position: 'right', grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 9 }, callback: v => fmtINR(v), maxTicksLimit: 6 }, border: { display: false } }
        }
      }
    });
    // Store raw data for crosshair
    CHARTS.live._rawData = raw;
    CHARTS.live._labels = labels;
    initCandleCrosshair();
  } catch (err) { console.warn('Candlestick chart error:', err); }
}

function initCandleCrosshair() {
  const canvas = $('chartLive'), tip = $('candleTooltip'), cross = $('crosshairLive');
  if (!canvas || !tip || !cross) return;

  let hlCanvas = $('candleHlCanvas');
  if (!hlCanvas) {
    hlCanvas = document.createElement('canvas');
    hlCanvas.id = 'candleHlCanvas';
    hlCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:10;';
    canvas.parentElement.appendChild(hlCanvas);
  }

  canvas.onmousemove = null; canvas.onmouseleave = null;

  canvas.addEventListener('mousemove', function(e) {
    var ch = CHARTS.live; if (!ch) return;
    var rect = canvas.getBoundingClientRect();
    var mouseCssX = e.clientX - rect.left;
    var mouseCssY = e.clientY - rect.top;
    var ds = ch.data.datasets[0] && ch.data.datasets[0].data;
    var raw = ch._rawData;
    var labels = ch._labels;
    if (!ds || !ds.length || !raw) return;

    // Match overlay size to CSS display area (always CSS pixels, not device pixels)
    var cssW = Math.round(rect.width), cssH = Math.round(rect.height);
    if (hlCanvas.width !== cssW) hlCanvas.width = cssW;
    if (hlCanvas.height !== cssH) hlCanvas.height = cssH;

    var xScale = ch.scales.x;
    var yScale = ch.scales.y;
    // Chart.js getPixelForValue returns internal canvas coords (DPR-scaled).
    // Divide by DPR to get CSS pixel coords matching mouse events.
    var dpr = (ch.currentDevicePixelRatio || window.devicePixelRatio || 1);

    var best = -1, bestDist = Infinity;
    for (var j = 0; j < ds.length; j++) {
      try {
        var xCssCand = xScale.getPixelForValue(ds[j].x) / dpr;
        var d = Math.abs(xCssCand - mouseCssX);
        if (d < bestDist) { bestDist = d; best = j; }
      } catch(ee) {}
    }

    var hCtx = hlCanvas.getContext('2d');
    hCtx.clearRect(0, 0, hlCanvas.width, hlCanvas.height);

    if (best < 0 || bestDist > 44) {
      tip.classList.remove('visible'); cross.classList.remove('visible');
      return;
    }

    var pt = raw[best];
    var lbl = labels ? labels[best] : '\u2014';
    var isUp = pt.c >= pt.o;
    var color = isUp ? '#30d158' : '#ff453a';

    var xCss  = xScale.getPixelForValue(ds[best].x) / dpr;
    var yHCss = yScale.getPixelForValue(pt.h) / dpr;
    var yLCss = yScale.getPixelForValue(pt.l) / dpr;
    var yOCss = yScale.getPixelForValue(pt.o) / dpr;
    var yCCss = yScale.getPixelForValue(pt.c) / dpr;
    var bodyTop = Math.min(yOCss, yCCss);
    var bodyBot = Math.max(yOCss, yCCss);
    var bodyH = Math.max(bodyBot - bodyTop, 2);
    var halfW = Math.max(3, Math.min(14, (xScale.width / dpr / ds.length) * 0.40));

    // Wick
    hCtx.beginPath();
    hCtx.strokeStyle = color;
    hCtx.lineWidth = 1.5;
    hCtx.moveTo(xCss, yHCss);
    hCtx.lineTo(xCss, yLCss);
    hCtx.stroke();

    // Body
    hCtx.fillStyle = isUp ? 'rgba(48,209,88,0.28)' : 'rgba(255,69,58,0.28)';
    hCtx.fillRect(xCss - halfW, bodyTop, halfW * 2, bodyH);
    hCtx.strokeStyle = color;
    hCtx.lineWidth = 1.5;
    hCtx.strokeRect(xCss - halfW, bodyTop, halfW * 2, bodyH);

    // Tooltip
    var pct = pt.o ? ((pt.c - pt.o) / pt.o * 100) : 0;
    var pctStr = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
    tip.innerHTML = '<div class="ct-ohlc-date">' + lbl + ' <span class="ct-ohlc-val ' + (isUp ? 'up' : 'dn') + '">' + pctStr + '</span></div>'
      + '<div class="ct-ohlc-grid">'
      + '<span class="ct-ohlc-lbl">Open</span><span class="ct-ohlc-val">' + fmtINR(pt.o) + '</span>'
      + '<span class="ct-ohlc-lbl">High</span><span class="ct-ohlc-val">' + fmtINR(pt.h) + '</span>'
      + '<span class="ct-ohlc-lbl">Low</span><span class="ct-ohlc-val">' + fmtINR(pt.l) + '</span>'
      + '<span class="ct-ohlc-lbl">Close</span><span class="ct-ohlc-val ' + (isUp ? 'up' : 'dn') + '">' + fmtINR(pt.c) + '</span>'
      + '</div>';

    // Position: right of candle if space, else left
    var tx = xCss + halfW + 12;
    if (tx + 180 > rect.width) tx = xCss - halfW - 192;
    tx = Math.max(4, tx);
    var ty = Math.max(6, Math.min(mouseCssY - 60, rect.height - 145));
    tip.style.left = tx + 'px';
    tip.style.top  = ty + 'px';
    tip.classList.add('visible');

    cross.style.left = xCss + 'px';
    cross.classList.add('visible');
  });

  canvas.addEventListener('mouseleave', function() {
    tip.classList.remove('visible'); cross.classList.remove('visible');
    var hCtx = hlCanvas.getContext('2d');
    hCtx.clearRect(0, 0, hlCanvas.width, hlCanvas.height);
  });
}

/* ── WindowManager ───────────────────────────────────────── */
class WindowManager {
  constructor() { this.wins = new Map(); this.topZ = 100; this.focused = null; }
  register(id) {
    const el = document.getElementById('win-' + id); if (!el) return;
    const r = el.getBoundingClientRect();
    const entry = { el, id, state: 'normal', savedRect: { l: r.left, t: r.top, w: r.width, h: r.height }, z: this.topZ++ };
    this.wins.set(id, entry); el.style.zIndex = entry.z;
    el.addEventListener('mousedown', () => this.focus(id), { capture: true });
    el.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); const a = btn.dataset.action; if (a === 'close') this.close(id); if (a === 'minimize') this.minimize(id); if (a === 'maximize') this.maximize(id); }));
  }
  focus(id) { if (this.focused === id) return; this.focused = id; this.topZ++; this.wins.forEach((w, wid) => { w.z = wid === id ? this.topZ : w.z; w.el.style.zIndex = w.z; w.el.classList.toggle('window--focused', wid === id); }); updateWindowsMenuUI(); }
  minimize(id) { const w = this.wins.get(id); if (!w) return; if (w.state === 'minimized') { this.restore(id); return; } this._saveRect(w); w.state = 'minimized'; w.el.classList.add('window--minimized'); w.el.classList.remove('window--maximized'); updateWindowsMenuUI(); }
  maximize(id) { const w = this.wins.get(id); if (!w) return; if (w.state === 'maximized') { this.restore(id); return; } this._saveRect(w); w.state = 'maximized'; w.el.classList.add('window--maximized'); w.el.classList.remove('window--minimized'); this.focus(id); setTimeout(() => resizeAllCharts(), 320); updateWindowsMenuUI(); }
  restore(id) { const w = this.wins.get(id); if (!w) return; w.state = 'normal'; w.el.classList.remove('window--minimized', 'window--maximized'); w.el.style.cssText = `left:${w.savedRect.l}px;top:${w.savedRect.t}px;width:${w.savedRect.w}px;height:${w.savedRect.h}px;z-index:${w.z};`; setTimeout(() => resizeAllCharts(), 320); updateWindowsMenuUI(); }
  close(id) { const w = this.wins.get(id); if (!w) return; w.state = 'closed'; w.el.classList.add('window--closing'); setTimeout(() => { w.el.style.display = 'none'; w.el.classList.remove('window--closing'); }, 260); updateWindowsMenuUI(); }
  open(id) { const w = this.wins.get(id); if (!w) return; w.el.style.display = ''; w.state = 'normal'; w.el.classList.add('window--opening'); setTimeout(() => w.el.classList.remove('window--opening'), 320); this.focus(id); resizeAllCharts(); updateWindowsMenuUI(); }
  _saveRect(w) { const r = w.el.getBoundingClientRect(); const desk = document.getElementById('desktop').getBoundingClientRect(); w.savedRect = { l: r.left - desk.left, t: r.top - desk.top, w: r.width, h: r.height }; }
  pulseWin(id, sev = 'warn') { const w = this.wins.get(id); if (!w) return; const cls = sev === 'crit' ? 'window--pulse-red' : 'window--pulse-amber'; w.el.classList.remove('window--pulse-red', 'window--pulse-amber'); void w.el.offsetWidth; w.el.classList.add(cls); setTimeout(() => w.el.classList.remove(cls), 3100); }
}
const WM = new WindowManager();

/* ── Default Layout (from image) ────────────────────────── */
let _layoutRetries = 0;
function applyDefaultLayout() {
  const desk = document.getElementById('desktop');
  const W = desk.clientWidth, H = desk.clientHeight, G = 7;
  // Guard: if the desktop hasn't laid out yet, retry
  if (H < 50 || W < 50) {
    if (_layoutRetries < 20) { _layoutRetries++; requestAnimationFrame(() => setTimeout(applyDefaultLayout, 50)); }
    return;
  }
  _layoutRetries = 0;
  // ROW heights: top~35%, mid~28%, bot~37%
  const R1H = Math.round(H * 0.35), R2H = Math.round(H * 0.28), R3H = H - R1H - R2H - G * 4;
  // COL widths: c1~22%, c2~22%, c3~22%, c4=rest (Instrumental spans R1+R2)
  const C1 = Math.round(W * 0.22), C2 = Math.round(W * 0.22), C3 = Math.round(W * 0.22), C4 = W - C1 - C2 - C3 - G * 4;
  const x1 = G, x2 = x1 + C1 + G, x3 = x2 + C2 + G, x4 = x3 + C3 + G;
  const y1 = G, y2 = y1 + R1H + G, y3 = y2 + R2H + G;
  const layouts = {
    'orderflow': { l: x1, t: y1, w: C1, h: R1H },
    'sentimental': { l: x2, t: y1, w: C2, h: R1H },
    'vix': { l: x3, t: y1, w: C3, h: R1H },
    'instrumental': { l: x4, t: y1, w: C4, h: R1H + R2H + G },
    'index': { l: x1, t: y2, w: C1, h: R2H },
    'livechart': { l: x2, t: y2, w: C2 + C3 + G, h: R2H },
    'signallog': { l: x1, t: y3, w: C1 + C2 + G, h: R3H },
    'anomalylog': { l: x3, t: y3, w: C3, h: R3H },
    'heatmap': { l: x4, t: y3, w: C4, h: R3H },
  };
  Object.entries(layouts).forEach(([id, p]) => {
    const el = document.getElementById('win-' + id); if (!el) return;
    el.style.cssText = `left:${Math.round(p.l)}px;top:${Math.round(p.t)}px;width:${Math.round(p.w)}px;height:${Math.round(p.h)}px;`;
    el.classList.remove('window--minimized', 'window--maximized'); el.style.display = '';
    const e = WM.wins.get(id); if (e) { e.state = 'normal'; e.savedRect = { l: Math.round(p.l), t: Math.round(p.t), w: Math.round(p.w), h: Math.round(p.h) }; }
  });
  setTimeout(resizeAllCharts, 80); updateWindowsMenuUI();
}

/* ── Drag & Resize ──────────────────────────────────────── */
function initDrag() {
  document.querySelectorAll('.window-chrome').forEach(c => c.addEventListener('mousedown', onDragStart));
  document.querySelectorAll('.win-resize-handle').forEach(r => r.addEventListener('mousedown', onResizeStart));
}
let drag = null, rsz = null;
function makeOverlay(cur) { const o = document.createElement('div'); o.className = 'drag-overlay'; o.style.cursor = cur; document.body.appendChild(o); return o; }
function onDragStart(e) {
  if (e.target.closest('[data-action]')) return; e.preventDefault();
  const win = e.currentTarget.closest('.window'), id = win.dataset.window; WM.focus(id);
  const r = win.getBoundingClientRect(), dr = document.getElementById('desktop').getBoundingClientRect();
  win.classList.add('window--dragging'); const ovl = makeOverlay('grabbing');
  drag = { win, ovl, sx: e.clientX, sy: e.clientY, ol: r.left - dr.left, ot: r.top - dr.top };
  ovl.addEventListener('mousemove', onDragMove); ovl.addEventListener('mouseup', onDragEnd); window.addEventListener('mouseup', onDragEnd);
}
function onDragMove(e) { if (!drag) return; drag.win.style.left = snapTo(drag.ol + e.clientX - drag.sx, CFG.GRID) + 'px'; drag.win.style.top = snapTo(drag.ot + e.clientY - drag.sy, CFG.GRID) + 'px'; }
function onDragEnd() { if (!drag) return; drag.win.classList.remove('window--dragging'); drag.ovl.removeEventListener('mousemove', onDragMove); drag.ovl.removeEventListener('mouseup', onDragEnd); window.removeEventListener('mouseup', onDragEnd); drag.ovl.remove(); drag = null; setTimeout(resizeAllCharts, 80); }
function onResizeStart(e) { e.preventDefault(); e.stopPropagation(); const win = document.getElementById(e.currentTarget.dataset.win); if (!win) return; const id = win.dataset.window; WM.focus(id); const r = win.getBoundingClientRect(); const ovl = makeOverlay('se-resize'); rsz = { win, ovl, sx: e.clientX, sy: e.clientY, ow: r.width, oh: r.height }; ovl.addEventListener('mousemove', onResizeMove); ovl.addEventListener('mouseup', onResizeEnd); window.addEventListener('mouseup', onResizeEnd); }
function onResizeMove(e) { if (!rsz) return; rsz.win.style.width = Math.max(200, rsz.ow + e.clientX - rsz.sx) + 'px'; rsz.win.style.height = Math.max(140, rsz.oh + e.clientY - rsz.sy) + 'px'; }
function onResizeEnd() { if (!rsz) return; rsz.ovl.removeEventListener('mousemove', onResizeMove); rsz.ovl.removeEventListener('mouseup', onResizeEnd); window.removeEventListener('mouseup', onResizeEnd); rsz.ovl.remove(); rsz = null; setTimeout(resizeAllCharts, 80); }
function resizeAllCharts() { Object.values(CHARTS).forEach(c => c && c.resize && c.resize()); }

/* ── Windows Menu ───────────────────────────────────────── */
const WIN_LABELS = { orderflow: 'Order Flow Delta', sentimental: 'Sentimental Signal', vix: 'Volatility Signal', instrumental: 'Instrumental Signal', index: 'Index', livechart: 'Live Chart', signallog: 'Signal Log', anomalylog: 'Anomaly Log', heatmap: 'Heat Map' };
function updateWindowsMenuUI() {
  const body = $('windowsMenuBody'); if (!body) return; body.innerHTML = '';
  WM.wins.forEach((w, id) => {
    const div = document.createElement('div'); div.className = 'win-item';
    const s = w.state === 'closed' ? 'Closed' : w.state === 'minimized' ? 'Minimized' : w.state === 'maximized' ? 'Maximized' : 'Open';
    const b = w.state === 'closed' ? 'Open' : w.state === 'minimized' ? 'Restore' : 'Focus';
    div.innerHTML = `<span class="win-item-name">${WIN_LABELS[id] || id}</span><span class="win-item-state">${s}</span><button class="win-item-btn" data-wid="${id}">${b}</button>`;
    body.appendChild(div);
  });
  body.querySelectorAll('.win-item-btn').forEach(b => b.addEventListener('click', e => { const id = e.target.dataset.wid; const w = WM.wins.get(id); if (!w) return; if (w.state === 'closed') WM.open(id); else if (w.state === 'minimized') WM.restore(id); else WM.focus(id); closeAllPanels(); }));
}

/* ── Data Engine ─────────────────────────────────────────── */
STOCKS.forEach(s => { S.stockPrices[s.sym] = { price: s.base, pct: rand(-2, 2), name: s.name, sector: s.sector }; });

async function fetchAPIData() {
  try {
    const r = await fetch('/api/quotes'); if (!r.ok) return;
    const d = await r.json(); if (!d?.quotes) return;
    S.apiData = d.quotes;
    Object.entries(d.quotes).forEach(([sym, q]) => { if (S.stockPrices[sym]) { S.stockPrices[sym].price = q.price || S.stockPrices[sym].price; S.stockPrices[sym].pct = q.changePercent || S.stockPrices[sym].pct; } });
    $('dataSourceInfo') && ($('dataSourceInfo').textContent = d.quotes.NIFTY50?.source === 'yahoo' ? 'Yahoo Finance ↑' : 'Simulated');
    updateInstrumental(); rebuildTicker();
  } catch (_) { }
}

/* ── Ticks ───────────────────────────────────────────────── */
function tickOf() {
  const next = genOF(S.of); S.of = next;
  S.ofH.push(next); if (S.ofH.length > CFG.CHART_WIN) S.ofH.shift();
  const ds = CHARTS.of.data.datasets[0]; ds.data = [...S.ofH]; ds.backgroundColor = S.ofH.map(v => v >= 0 ? cssVar('--c-green') + 'cc' : cssVar('--c-red') + 'cc');
  CHARTS.of.data.labels = S.ofH.map((_, i) => i); CHARTS.of.update('none');
  const el = $('orderflowLive'); if (el) { el.textContent = (next >= 0 ? '+' : '') + next.toFixed(1); el.style.color = next >= 0 ? cssVar('--c-green') : cssVar('--c-red'); }
  const sign = Math.sign(next);
  if (Math.abs(next) > 30) { if (S.ofConsec.sign === sign) { S.ofConsec.n++; if (S.ofConsec.n >= 3) checkOFAnom(next); } else S.ofConsec = { sign, n: 1 }; } else S.ofConsec = { sign: 0, n: 0 };
}
function tickVix() {
  const prev = S.vix; S.prevVix = prev; const next = genVIX(prev); S.vix = next;
  S.vixH.push(next); if (S.vixH.length > CFG.CHART_WIN) S.vixH.shift();
  CHARTS.vix.data.datasets[0].data = [...S.vixH]; CHARTS.vix.data.labels = S.vixH.map((_, i) => i); CHARTS.vix.update('none');
  if ($('vixLive')) $('vixLive').textContent = next.toFixed(1);
  checkVixAnom(next, prev);
}
function tickSent() {
  const next = genSent(S.sent); S.sent = next;
  S.sentH.push(next); if (S.sentH.length > CFG.CHART_WIN) S.sentH.shift();
  updateSentUI(next);
}

/* ── Sentiment UI ────────────────────────────────────────── */
function sentLabel(v) { if (v >= 0.5) return 'STRONG GREED'; if (v >= 0.2) return 'GREED'; if (v > -0.2) return 'NEUTRAL'; if (v > -0.5) return 'FEAR'; return 'EXTREME FEAR'; }
function updateSentUI(v) {
  const sc = $('sentBigScore'), sc2 = $('sentScore');
  if (sc) sc.textContent = (v >= 0 ? '+' : '') + v.toFixed(2);
  if (sc2) sc2.textContent = (v >= 0 ? '+' : '') + v.toFixed(2);
  if (sc) sc.style.color = v >= 0.2 ? cssVar('--c-green') : v <= -0.2 ? cssVar('--c-red') : cssVar('--c-orange');
  $('sentimentRegime') && ($('sentimentRegime').textContent = sentLabel(v));
  $('sentimentBarPos') && ($('sentimentBarPos').style.width = v >= 0 ? (v * 100) + '%' : '0%');
  $('sentimentBarNeg') && ($('sentimentBarNeg').style.width = v < 0 ? (Math.abs(v) * 100) + '%' : '0%');
}

/* ── Top Gainer / Index Window ───────────────────────────── */
function updateIndexWindow() {
  const sorted = [...STOCKS].map(s => ({ ...s, ...S.stockPrices[s.sym] })).sort((a, b) => b.pct - a.pct);
  const gainer = sorted[0]; if (!gainer) return;
  S.topGainerSym = gainer.sym;
  $('indexSym').textContent = gainer.sym;
  $('indexName').textContent = gainer.name;
  $('indexPrice').textContent = fmtINR(gainer.price);
  const delta = $('indexDelta'); delta.textContent = (gainer.pct >= 0 ? '+' : '') + gainer.pct.toFixed(2) + '%'; delta.className = 'index-delta ' + (gainer.pct >= 0 ? 'pos' : 'neg');
  const chgVal = gainer.price * gainer.pct / 100;
  $('indexChange').textContent = (chgVal >= 0 ? '+' : '') + fmtINR(Math.abs(chgVal));
  $('indexHigh').textContent = fmtINR(gainer.price * 1.012);
  $('indexLow').textContent = fmtINR(gainer.price * 0.988);
  const badge = $('indexBadge'); badge.textContent = 'TOP GAINER'; badge.className = 'index-badge';
  // Update live chart sym
  $('liveChartSym').textContent = gainer.sym;
}

/* ── Instrumental Signal (15 stocks sorted) ──────────────── */
function updateInstrumental() {
  const container = $('instrStocksList'); if (!container) return;
  // Sort by pct descending
  const sorted = [...STOCKS].map(s => ({ ...s, ...S.stockPrices[s.sym] })).sort((a, b) => b.pct - a.pct);
  // NIFTY header
  const niftyData = S.apiData?.NIFTY50 || { price: 22850, changePercent: 0.0 };
  const niftyPrice = $('instrNiftyPrice'), niftyDelta = $('instrNiftyDelta');
  if (niftyPrice) niftyPrice.textContent = fmtINR(niftyData.price || 22850);
  if (niftyDelta) { const pct = niftyData.changePercent || 0; niftyDelta.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%'; niftyDelta.className = 'instr-nifty-delta ' + (pct >= 0 ? 'pos' : 'neg'); }
  const maxAbs = Math.max(...sorted.map(s => Math.abs(s.pct)), 0.01);
  container.innerHTML = '<div class="instr-section-hdr">TOP GAINERS</div>' +
    sorted.slice(0, 7).map((s, i) => `<div class="instr-row" data-sym="${s.sym}"><span class="instr-rank">${i + 1}</span><span class="instr-sym">${s.sym}</span><span class="instr-name">${s.name}</span><span class="instr-price">${fmtINR(s.price)}</span><span class="instr-pct pos">+${s.pct.toFixed(2)}%</span><div class="instr-bar pos" style="width:${Math.round(Math.abs(s.pct) / maxAbs * 48)}px"></div></div>`).join('') +
    '<div class="instr-section-hdr" style="margin-top:4px">TOP LOSERS</div>' +
    [...sorted].reverse().slice(0, 7).map((s, i) => `<div class="instr-row" data-sym="${s.sym}"><span class="instr-rank">${i + 1}</span><span class="instr-sym">${s.sym}</span><span class="instr-name">${s.name}</span><span class="instr-price">${fmtINR(s.price)}</span><span class="instr-pct neg">${s.pct.toFixed(2)}%</span><div class="instr-bar neg" style="width:${Math.round(Math.abs(s.pct) / maxAbs * 48)}px"></div></div>`).join('');
  container.querySelectorAll('.instr-row').forEach(row => row.addEventListener('click', () => openStockDetail(row.dataset.sym)));
}

/* ── Heatmap ─────────────────────────────────────────────── */
const CELL_W = 88, CELL_H = 62;
function initHeatmap() {
  const grid = $('heatmapGrid'); if (!grid) return; grid.innerHTML = '';
  STOCKS.forEach(s => {
    const pct = S.stockPrices[s.sym]?.pct || rand(-2, 2);
    const cell = document.createElement('div'); cell.className = 'heat-cell'; cell.id = 'hc-' + s.sym;
    cell.style.cssText = `width:${CELL_W}px;height:${CELL_H}px;`;
    cell.innerHTML = `<span class="heat-sym">${s.sym}</span><span class="heat-name">${s.name.split(' ').slice(0, 2).join(' ')}</span><span class="heat-pct" id="hp-${s.sym}">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>`;
    applyHeatColor(cell, pct); cell.addEventListener('click', () => openStockDetail(s.sym)); grid.appendChild(cell);
  });
  
  const winBody = grid.closest('.window-body') || grid.parentElement;
  if(winBody && window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      const cols = Math.max(1, Math.floor((winBody.clientWidth - 4) / CELL_W));
      const rows = Math.max(1, Math.floor((winBody.clientHeight - 4) / CELL_H));
      const visible = cols * rows;
      grid.style.gridTemplateColumns = `repeat(${cols}, ${CELL_W}px)`;
      [...grid.children].forEach((c, i) => c.style.display = i < visible ? '' : 'none');
    });
    ro.observe(winBody);
  }
}
function applyHeatColor(cell, pct) {
  const a = Math.min(Math.abs(pct) / 2.5, 1), isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  cell.style.background = pct > 0 ? (isDark ? `rgba(0,${Math.round(80 + a * 140)},40,${0.3 + a * 0.55})` : `rgba(0,${Math.round(100 + a * 110)},60,${0.2 + a * 0.45})`) : (isDark ? `rgba(${Math.round(100 + a * 140)},20,20,${0.3 + a * 0.55})` : `rgba(${Math.round(160 + a * 80)},30,30,${0.2 + a * 0.45})`);
}
function updateHeatmap() {
  STOCKS.forEach(s => {
    const cur = S.stockPrices[s.sym]; let np;
    if (S.apiData?.[s.sym]) np = S.apiData[s.sym].changePercent || cur.pct;
    else np = clamp(cur.pct + rand(-0.7, 0.7), -5, 5);
    S.stockPrices[s.sym] = { ...cur, pct: np, price: s.base * (1 + np / 100) };
    const cell = $('hc-' + s.sym), pctEl = $('hp-' + s.sym);
    if (cell && pctEl) { pctEl.textContent = (np >= 0 ? '+' : '') + np.toFixed(2) + '%'; applyHeatColor(cell, np); }
  });
  updateIndexWindow(); updateInstrumental(); rebuildTicker();
}

/* ── Ticker ──────────────────────────────────────────────── */
function rebuildTicker() {
  const track = $('tickerTrack'); if (!track) return;
  const html = STOCKS.map(s => { const d = S.stockPrices[s.sym]; const cls = d.pct >= 0 ? 'pos' : 'neg'; const sign = d.pct >= 0 ? '+' : ''; return `<span class="t-item"><span class="t-sym">${s.sym}</span><span class="t-price">${fmtINR(d.price)}</span><span class="t-pct ${cls}">${sign}${d.pct.toFixed(2)}%</span></span>`; }).join('');
  track.innerHTML = html + html;
}

/* ── Signal Log ──────────────────────────────────────────── */
const SIGNAL_TMPL = [
  (s, p, h, l) => ({ type: p > 0 ? 'bullish' : 'bearish', msg: p > 0 ? `breakout above \u20B9${h.toFixed(0)} on ${(2 + rand(0, 3)).toFixed(1)}× avg vol` : `rejected at \u20B9${h.toFixed(0)} resistance` }),
  (s, p, h, l) => ({ type: p > 0 ? 'bullish' : 'caution', msg: p > 0 ? 'golden cross confirmed \u2014 20D MA above 50D MA' : 'death cross forming' }),
  (s, p, h, l) => ({ type: 'caution', msg: `volume divergence: price ${p > 0 ? 'up' : 'down'}, pressure ${p > 0 ? 'slowing' : 'accelerating'}` }),
  (s, p, h, l) => ({ type: p > 0 ? 'bullish' : 'bearish', msg: p > 0 ? `RSI ${(68 + rand(-4, 10)).toFixed(0)} \u2014 momentum ${rand(0, 1) > 0.5 ? 'strong' : 'overbought'}` : `support \u20B9${l.toFixed(0)} under pressure` }),
];
function pushSignalEntry() {
  const log = $('signalLog'), cnt = $('signalCount'); if (!log) return;
  const s = STOCKS[Math.floor(rand(0, STOCKS.length))]; const pct = rand(-3.5, 3.5);
  const h = s.base * (1 + Math.abs(pct) / 100 + rand(0.002, 0.009)), l = s.base * (1 - Math.abs(pct) / 100 - rand(0.002, 0.008));
  const info = SIGNAL_TMPL[Math.floor(rand(0, SIGNAL_TMPL.length))](s.sym, pct, h, l);
  const cls = pct >= 0 ? 'pos' : 'neg', sign = pct >= 0 ? '+' : '';
  const entry = document.createElement('div'); entry.className = `sig-entry ${info.type}`;
  entry.innerHTML = `<div class="sig-top"><span class="sig-sym">${s.sym}</span><span class="sig-pct ${cls}">${sign}${pct.toFixed(2)}%</span><span class="sig-time">${nowStr()}</span></div><div class="sig-msg">${info.msg}</div><div class="sig-hl"><span>H: \u20B9${h.toFixed(2)}</span><span>L: \u20B9${l.toFixed(2)}</span></div>`;
  log.insertBefore(entry, log.firstChild);
  while (log.children.length > CFG.LOG_MAX) log.removeChild(log.lastChild);
  if (cnt) { const n = log.children.length; cnt.textContent = `${n} entr${n === 1 ? 'y' : 'ies'}`; }
}

/* ── Anomaly ─────────────────────────────────────────────── */
function canFire() { const now = Date.now(); if (now - S.lastAnomaly > CFG.ANOMALY_CD) { S.lastAnomaly = now; return true; } return false; }
function fireAnomaly({ winId, sev, stream, whisper, detail, conf }) {
  if (!canFire()) return; WM.pulseWin(winId, sev);
  addAlertEntry({ sev, stream, whisper, detail, conf });
  addAnomalyRow({ sev, stream, whisper });
}
function addAnomalyRow({ sev, stream, whisper }) {
  const log = $('anomalyLog'); if (!log) return;
  const empty = log.querySelector('.fp-empty'); if (empty) empty.remove();
  const row = document.createElement('div'); row.className = `anom-row ${sev}`;
  row.innerHTML = `<div class="anom-row-hd"><span class="anom-stream ${sev[0]}">${stream}</span><span class="anom-time">${nowStr()}</span></div><div class="anom-msg">${whisper}</div>`;
  log.insertBefore(row, log.firstChild);
  while (log.children.length > 20) log.removeChild(log.lastChild);
  const cnt = $('anomalyCount'); if (cnt) cnt.textContent = log.children.length;
}
function addAlertEntry({ sev, stream, whisper, detail, conf }) {
  S.anomCount++; const badge = $('alertCount'); if (badge) { badge.textContent = S.anomCount + S.alertCount; badge.className = 'alert-count'; }
  const body = $('alertsPanelBody'); if (!body) return;
  const empty = body.querySelector('.fp-empty'); if (empty) empty.remove();
  const c = Math.round(rand(conf[0], conf[1]));
  const entry = document.createElement('div'); entry.className = `anom-entry ${sev}`;
  entry.innerHTML = `<div class="anom-e-hd"><span class="anom-e-stream ${sev[0]}">${stream}</span><span class="anom-e-time">${nowStr()}</span></div><div class="anom-e-msg">"${whisper}"</div><div class="anom-e-meta">Confidence: ${c}%</div>${detail ? `<div style="font-size:9px;color:var(--c-l4);margin-top:2px">${detail}</div>` : ''}`;
  body.insertBefore(entry, body.firstChild);
}
function checkOFAnom(val) { fireAnomaly({ winId: 'orderflow', sev: 'warn', stream: 'ORDER FLOW', whisper: 'Order flow divergence \u2014 watch the tape', detail: `Sustained ${val > 0 ? 'buying' : 'selling'} pressure >30`, conf: [68, 83] }); S.ofConsec = { sign: 0, n: 0 }; }
function checkVixAnom(cur, prev) { if (cur > 65 && prev < 50) fireAnomaly({ winId: 'vix', sev: 'crit', stream: 'VOL. SPIKE', whisper: 'Vol spike. Something moved.', detail: `VIX ${cur.toFixed(1)}`, conf: [80, 91] }); }

/* ── Alert Generator ─────────────────────────────────────── */
const ALERT_TMPL = [
  () => { const s = STOCKS[Math.floor(rand(0, 15))]; return { stream: 'PRICE ALERT', sev: 'warn', whisper: `${s.sym} surged ${rand(1.5, 4).toFixed(1)}% in last 5 min`, detail: `\u20B9${s.base.toFixed(0)} | Vol: ${rand(2, 5).toFixed(1)}× normal`, conf: [70, 88] }; },
  () => { const s = STOCKS[Math.floor(rand(0, 15))]; return { stream: 'VOLUME SPIKE', sev: 'crit', whisper: `Unusual volume in ${s.sym}`, detail: `${rand(3, 8).toFixed(1)}× avg volume`, conf: [75, 92] }; },
  () => { const s = STOCKS[Math.floor(rand(0, 15))]; return { stream: 'RSI SIGNAL', sev: 'warn', whisper: `${s.sym} entering overbought`, detail: `RSI ${rand(70, 85).toFixed(0)}`, conf: [65, 82] }; },
  () => ({ stream: 'MACD', sev: 'crit', whisper: 'MACD bullish crossover on NIFTY 50', detail: 'Signal line crossed', conf: [72, 87] }),
];
function scheduleNextAlert() { setTimeout(() => { const t = ALERT_TMPL[Math.floor(rand(0, ALERT_TMPL.length))](); const wids = ['orderflow', 'vix']; WM.pulseWin(wids[Math.floor(rand(0, wids.length))], t.sev); addAlertEntry(t); addAnomalyRow(t); S.alertCount++; const b = $('alertCount'); if (b) { b.textContent = S.anomCount + S.alertCount; b.className = 'alert-count'; } scheduleNextAlert(); }, rand(CFG.ALERT_MIN, CFG.ALERT_MAX)); }

/* ── Stock Detail Modal ──────────────────────────────────── */
async function openStockDetail(sym) {
  const overlay = $('stockModalOverlay'); if (!overlay) return;
  $('modalSym').textContent = sym; $('modalName').textContent = '...'; $('modalSector').textContent = '...';
  $('modalPrice').textContent = '\u20B9---'; $('modalDelta').textContent = '---%'; $('modalDelta').className = 'stock-modal-delta';
  $('modalChange').textContent = '---'; $('modalHigh').textContent = '---'; $('modalLow').textContent = '---'; $('modalVolume').textContent = '---'; $('modalSource').textContent = '---'; $('modalUpdated').textContent = 'Fetching...';
  overlay.classList.add('open');
  try {
    const r = await fetch(`/api/stock/${sym}`); const { quote: q } = await r.json(); if (!q) throw new Error();
    $('modalSym').textContent = q.symbol; $('modalName').textContent = q.name || sym; $('modalSector').textContent = q.sector || 'N/A';
    $('modalPrice').textContent = fmtINR(q.price);
    const pct = q.changePercent ?? 0, chg = q.change ?? 0, isPos = pct >= 0;
    $('modalDelta').textContent = (isPos ? '+' : '') + pct.toFixed(2) + '%'; $('modalDelta').className = 'stock-modal-delta ' + (isPos ? 'pos' : 'neg');
    $('modalChange').textContent = (isPos ? '+' : '') + fmtINR(Math.abs(chg)); $('modalChange').className = 'stock-modal-change ' + (isPos ? 'pos' : 'neg');
    $('modalHigh').textContent = q.high ? fmtINR(q.high) : '---'; $('modalLow').textContent = q.low ? fmtINR(q.low) : '---';
    $('modalVolume').textContent = q.volume ? fmtNum(q.volume) : '---'; $('modalSource').textContent = q.source === 'yahoo' ? 'Yahoo Finance' : 'Simulated';
    $('modalUpdated').textContent = `Last updated: ${fmtTime()}`;
  } catch (_) { $('modalUpdated').textContent = 'Error fetching data'; }
}
function closeStockModal() { $('stockModalOverlay')?.classList.remove('open'); }

/* ── Search ──────────────────────────────────────────────── */
function searchStocks(query) { const q = query.trim().toUpperCase(); if (!q) return []; return SEARCH_INDEX.map(s => { let sc = 0; if (s.sym === q) sc = 100; else if (s.sym.startsWith(q)) sc = 80; else if (s.name.toUpperCase().startsWith(q)) sc = 60; else if (s.sym.includes(q)) sc = 40; else if (s.name.toUpperCase().includes(q)) sc = 20; return sc > 0 ? { ...s, sc } : null; }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 8); }
let searchDebounce = null;
function initSearch() {
  const input = $('searchInput'), dd = $('searchDropdown'); if (!input || !dd) return;
  input.addEventListener('input', () => { clearTimeout(searchDebounce); searchDebounce = setTimeout(() => { const q = input.value; if (!q.trim()) { dd.classList.remove('open'); return; } renderSearchResults(searchStocks(q), dd); }, 150); });
  input.addEventListener('focus', () => { if (input.value.trim()) dd.classList.add('open'); });
  document.addEventListener('click', e => { if (!$('searchWrap')?.contains(e.target)) dd.classList.remove('open'); });
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); input.focus(); input.select(); } if (e.key === 'Escape') { dd.classList.remove('open'); input.blur(); closeStockModal(); } });
}
function renderSearchResults(results, dd) {
  if (!results.length) { dd.innerHTML = `<div class="sr-empty">No results for "${$('searchInput').value}"</div>`; dd.classList.add('open'); return; }
  dd.innerHTML = results.map(s => { const ld = S.stockPrices[s.sym] || S.apiData?.[s.sym]; const price = ld?.price ? fmtINR(ld.price) : '--'; const pct = ld?.pct ?? ld?.changePercent; const pctStr = pct != null ? (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%' : '--'; const cls = pct != null ? pct >= 0 ? 'pos' : 'neg' : ''; return `<div class="sr-item" data-sym="${s.sym}"><span class="sr-sym">${s.sym}</span><span class="sr-name">${s.name}</span><span class="sr-price">${price}</span><span class="sr-pct ${cls}">${pctStr}</span></div>`; }).join('');
  dd.classList.add('open');
  dd.querySelectorAll('.sr-item').forEach(item => item.addEventListener('click', () => { $('searchInput').value = item.dataset.sym; dd.classList.remove('open'); openStockWindow(item.dataset.sym); }));
}

/* ── Stock Window ────────────────────────────────────────── */
function openStockWindow(sym) {
  const ld = S.stockPrices[sym] || S.apiData?.[sym]; if (!ld) return;
  const winId = 'stock_' + sym;
  let win = $('win-' + winId);
  if (!win) {
    win = document.createElement('div');
    win.className = 'window';
    win.id = 'win-' + winId;
    win.dataset.window = winId;
    win.style.cssText = `left:${100 + Math.random()*100}px;top:${100 + Math.random()*100}px;width:600px;height:400px;`;
    win.innerHTML = `
      <div class="window-chrome">
        <div class="traffic-lights">
          <button class="tl tl-close" data-action="close"></button>
          <button class="tl tl-min" data-action="minimize"></button>
          <button class="tl tl-max" data-action="maximize"></button>
        </div>
        <div class="window-title"><span class="wt-dot" style="background:${cssVar('--c-blue')}"></span>${sym} \u2014 ${ld.name || 'Details'}</div>
      </div>
      <div class="window-body" style="padding:16px;overflow-y:auto;text-transform:none;">
        <div style="font-size:24px;font-weight:600;margin-bottom:8px;">${sym} <span style="color:${ld.pct>=0?'var(--c-green)':'var(--c-red)'};font-variant-numeric:tabular-nums;">${fmtINR(ld.price||0)} (${ld.pct>0?'+':''}${ld.pct||0}%)</span></div>
        <div style="color:rgba(255,255,255,0.5);margin-bottom:16px;font-size:12px;">Sector: ${ld.sector || 'Unknown'}</div>
        <div style="height:250px;position:relative;" id="chartWrap-${winId}"><canvas id="chart-${winId}"></canvas></div>
      </div>
      <div class="win-resize-handle" data-win="win-${winId}"></div>
    `;
    $('desktop').appendChild(win);
    WM.register(winId);
    win.querySelector('.window-chrome').addEventListener('mousedown', typeof onDragStart !== 'undefined' ? onDragStart : ()=>{});
    win.querySelector('.win-resize-handle').addEventListener('mousedown', typeof onResizeStart !== 'undefined' ? onResizeStart : ()=>{});
    
    setTimeout(() => {
      const ctx = $('chart-'+winId).getContext('2d');
      const data = seed(() => (ld.price||100) * (1 + rand(-0.05, 0.05)), 40);
      new Chart(ctx, {
        type: 'line',
        data: { labels: Array(40).fill(''), datasets: [{ data, borderColor: ld.pct>=0?cssVar('--c-green'):cssVar('--c-red'), borderWidth: 2, pointRadius: 0, tension: 0.2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: true, position: 'right', grid: { color: 'rgba(255,255,255,0.05)', tickColor: 'transparent' }, ticks: { color: 'rgba(255,255,255,0.5)' } } } }
      });
    }, 50);
  }
  WM.open(winId);
  WM.focus(winId);
}

/* ── Period Tabs ─────────────────────────────────────────── */
function setPeriod(p) {
  S.activePeriod = p;
  document.querySelectorAll('.period-tab').forEach(b => b.classList.toggle('active', b.dataset.period === p));
  let pts = 90;
  if(p==='1W') pts = 60;
  if(p==='1M') pts = 30;
  if(p==='1Y') pts = 12;
  CFG.CHART_WIN = pts; CFG.SEED = Math.max(20, pts - 10);
  
  S.ofH = seed(genOF, CFG.SEED);
  S.vixH = seed(genVIX, CFG.SEED);
  S.sentH = seed(genSent, CFG.SEED);
  
  initLiveChart(); initOFChart(); initSentChart(); initVixChart();
}

function initPeriodTabs() {
  document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => setPeriod(btn.dataset.period));
  });
}

/* ── Theme / Panels ──────────────────────────────────────── */
function setTheme(t) { document.documentElement.setAttribute('data-theme', t); document.body.setAttribute('data-theme', t); $('themeDark')?.classList.toggle('active', t === 'dark'); $('themeLight')?.classList.toggle('active', t === 'light'); updateHeatmap(); }
function closeAllPanels() { ['settingsPanel', 'alertsPanel', 'windowsMenu'].forEach(id => $(id)?.classList.remove('open')); }
function togglePanel(id) { const el = $(id); if (!el) return; const o = el.classList.contains('open'); closeAllPanels(); if (!o) el.classList.add('open'); }

/* ── Clock ───────────────────────────────────────────────── */
function updateClock() { const now = new Date(); const c = $('tbClock'), d = $('tbDate'); if (c) c.textContent = fmtTime(now); if (d) d.textContent = fmtDate(now); }

/* ── Boot ────────────────────────────────────────────────── */
const BOOT_MSGS = ['STROMANALYTICS TERMINAL v3.1 \u2014 INIT', 'Loading MDI engine...', 'Seeding chart history...', 'Connecting to Yahoo Finance...', 'Starting anomaly detection...', 'Alert generator \u2014 armed...', 'All systems nominal.'];
function runBoot() { const screen = $('bootScreen'), bar = $('bootBar'), log = $('bootLog'); let i = 0; function step() { if (i >= BOOT_MSGS.length) { bar.style.width = '100%'; setTimeout(() => { screen.classList.add('done'); setTimeout(() => screen.remove(), 600); }, 350); return; } bar.style.width = Math.round(i / BOOT_MSGS.length * 100) + '%'; const d = document.createElement('div'); d.textContent = BOOT_MSGS[i]; log.appendChild(d); log.scrollTop = log.scrollHeight; i++; setTimeout(step, 160 + rand(0, 100)); } step(); }

/* ── Wire Events ─────────────────────────────────────────── */
function wireEvents() {
  $('windowsMenuBtn')?.addEventListener('click', () => { updateWindowsMenuUI(); togglePanel('windowsMenu'); });
  $('windowsMenuClose')?.addEventListener('click', closeAllPanels);
  $('settingsBtn')?.addEventListener('click', () => togglePanel('settingsPanel'));
  $('settingsPanelClose')?.addEventListener('click', closeAllPanels);
  $('alertBtn')?.addEventListener('click', () => togglePanel('alertsPanel'));
  $('alertsPanelClose')?.addEventListener('click', closeAllPanels);
  $('resetLayoutBtn')?.addEventListener('click', () => { applyDefaultLayout(); closeAllPanels(); });
  $('themeDark')?.addEventListener('click', () => setTheme('dark'));
  $('themeLight')?.addEventListener('click', () => setTheme('light'));
  $('stockModalClose')?.addEventListener('click', closeStockModal);
  $('stockModalOverlay')?.addEventListener('click', e => { if (e.target === $('stockModalOverlay')) closeStockModal(); });
  document.addEventListener('click', e => { ['settingsPanel', 'alertsPanel', 'windowsMenu'].forEach(id => { const el = $(id); if (el?.classList.contains('open') && !el.contains(e.target) && e.target.id !== ({ settingsPanel: 'settingsBtn', alertsPanel: 'alertBtn', windowsMenu: 'windowsMenuBtn' }[id])) el.classList.remove('open'); }); }, { capture: false });
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey) { if (e.key === 'r') { e.preventDefault(); applyDefaultLayout(); } if (e.key === 'a') { e.preventDefault(); togglePanel('alertsPanel'); } } });
}

/* ── Main ────────────────────────────────────────────────── */
function main() {
  try {
    updateClock(); setInterval(updateClock, 1000);
    ['orderflow', 'sentimental', 'vix', 'instrumental', 'index', 'livechart', 'signallog', 'anomalylog', 'heatmap'].forEach(id => WM.register(id));
    // Defer layout to ensure the desktop has been fully laid out by the browser
    requestAnimationFrame(() => {
      applyDefaultLayout();
      // Re-init charts after layout is applied so canvases have proper dimensions
      try { initCharts(); } catch (e) { console.warn('Charts init error:', e); }
    });
    initHeatmap(); rebuildTicker();
    for (let i = 0; i < 8; i++)pushSignalEntry();
    initDrag(); initSearch(); initPeriodTabs(); wireEvents();
    updateIndexWindow(); updateInstrumental(); updateSentUI(S.sent);
    setInterval(tickOf, CFG.OF_TICK);
    setInterval(tickVix, CFG.VIX_TICK);
    setInterval(tickSent, CFG.SENT_TICK);
    setInterval(updateHeatmap, CFG.HEATMAP_TICK);
    setInterval(pushSignalEntry, CFG.LOG_TICK);
    setInterval(fetchAPIData, CFG.API_POLL);
    fetchAPIData();
    scheduleNextAlert();
    // Recompute layout on window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { applyDefaultLayout(); }, 150); });
  } catch (e) { console.error('Fatal main error:', e); }
  // Boot always runs \u2014 even if something above failed silently
  runBoot();
}
document.addEventListener('DOMContentLoaded', main);
