import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/main.js', 'utf8');

// Fix getCandleData - it uses CRLF line endings
const oldLines = [
  "function getCandleData(sym, period) {",
  "  const stock = STOCKS.find(s => s.sym === sym) || STOCKS[0];",
  "  const base = S.stockPrices[sym]?.price || stock.base;",
  "  const days = period === 'M' ? 30 : period === 'W' ? 7 : 1;",
  "  const pts = period === 'M' ? 30 : period === 'W' ? 14 : 24;",
  "  return genOHLC(base, pts);",
  "}"
];

const newLines = [
  "function getCandleData(sym, period) {",
  "  const stock = STOCKS.find(s => s.sym === sym) || STOCKS[0];",
  "  const base = S.stockPrices[sym]?.price || stock.base;",
  "  // Support both old codes ('D','W','M') and new HTML codes ('1D','1W','1M','1Y')",
  "  const p = period ? period.replace(/^1/, '') : 'D';",
  "  const pts = p === 'Y' ? 12 : p === 'M' ? 30 : p === 'W' ? 14 : 24;",
  "  return genOHLC(base, pts);",
  "}"
];

// Try to find and replace using substr search
const oldStr = oldLines.join('\r\n');
const newStr = newLines.join('\r\n');
if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr);
  console.log('Fixed getCandleData (CRLF)');
} else {
  // Try LF only
  const oldStrLF = oldLines.join('\n');
  const newStrLF = newLines.join('\n');
  if (c.includes(oldStrLF)) {
    c = c.replace(oldStrLF, newStrLF);
    console.log('Fixed getCandleData (LF)');
  } else {
    // Patch manually by finding the function and replacing lines 120-121
    const fnStart = c.indexOf('function getCandleData(sym, period) {');
    if (fnStart >= 0) {
      const fnEnd = c.indexOf('\r\n}\r\n', fnStart) + 4;
      const oldFn = c.slice(fnStart, fnEnd);
      console.log('Old fn:', JSON.stringify(oldFn));
      
      const newFn = `function getCandleData(sym, period) {\r\n  const stock = STOCKS.find(s => s.sym === sym) || STOCKS[0];\r\n  const base = S.stockPrices[sym]?.price || stock.base;\r\n  const p = period ? period.replace(/^1/, '') : 'D';\r\n  const pts = p === 'Y' ? 12 : p === 'M' ? 30 : p === 'W' ? 14 : 24;\r\n  return genOHLC(base, pts);\r\n}\r\n`;
      c = c.slice(0, fnStart) + newFn + c.slice(fnEnd);
      console.log('Fixed getCandleData (manual slice)');
    }
  }
}

// Also fix initLiveChart label logic
const oldLabelsLF = "      if (S.activePeriod === 'D') return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');\n      if (S.activePeriod === 'W') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];\n      return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];";
const oldLabelsCRLF = "      if (S.activePeriod === 'D') return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');\r\n      if (S.activePeriod === 'W') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];\r\n      return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];";

const newLabels = `      const np = S.activePeriod ? S.activePeriod.replace(/^1/, '') : 'D';
      if (np === 'D') return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
      if (np === 'W') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      if (np === 'Y') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
      return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];`;

if (c.includes(oldLabelsCRLF)) {
  c = c.replace(oldLabelsCRLF, newLabels.replace(/\n/g, '\r\n'));
  console.log('Fixed label normalization (CRLF)');
} else if (c.includes(oldLabelsLF)) {
  c = c.replace(oldLabelsLF, newLabels);
  console.log('Fixed label normalization (LF)');
} else {
  console.log('WARNING: label target not found - skipping');
}

writeFileSync('src/main.js', c, 'utf8');
console.log('Done. File size:', c.length);
