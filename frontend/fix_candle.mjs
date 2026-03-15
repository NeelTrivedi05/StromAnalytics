import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/main.js', 'utf8');

// Find the start of initCandleCrosshair
const startMarker = 'function initCandleCrosshair() {';
const startIdx = c.indexOf(startMarker);
if (startIdx < 0) { console.error('NOT FOUND: initCandleCrosshair'); process.exit(1); }

// Find the closing brace — count braces
let depth = 0, i = startIdx;
for (; i < c.length; i++) {
  if (c[i] === '{') depth++;
  else if (c[i] === '}') { depth--; if (depth === 0) { i++; break; } }
}
const endIdx = i;
console.log('Replacing chars', startIdx, '-', endIdx, '=', endIdx - startIdx, 'chars');

const newFn = `function initCandleCrosshair() {
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
    var lbl = labels ? labels[best] : '\\u2014';
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
}`;

c = c.slice(0, startIdx) + newFn + c.slice(endIdx);
writeFileSync('src/main.js', c, 'utf8');
console.log('Done. New file size:', c.length);
