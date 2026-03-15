import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/engine.js', 'utf8');

// Remove style.css import (App.jsx will import it)
c = c.replace("import './style.css';\r\n", '');
c = c.replace("import './style.css';\n", '');
c = c.replace("import './style.css';", '');

// Replace the DOMContentLoaded listener with an exported initApp function
const domListener = "document.addEventListener('DOMContentLoaded', main);";
if (c.includes(domListener)) {
  c = c.replace(domListener, "export function initApp() { main(); }");
  console.log('Patched DOMContentLoaded -> export initApp (exact match)');
} else {
  // Search and patch by character index
  const idx = c.lastIndexOf('document.addEventListener');
  if (idx >= 0) {
    const end = c.indexOf(';', idx) + 1;
    const found = c.slice(idx, end);
    console.log('Patching by index. Found:', found.substring(0, 80));
    c = c.slice(0, idx) + "export function initApp() { main(); }" + c.slice(end);
  } else {
    console.log('WARNING: could not find DOMContentLoaded listener');
  }
}

writeFileSync('src/engine.js', c, 'utf8');
console.log('Done. engine.js size:', c.length);
console.log('Has export:', c.includes('export function initApp'));
console.log('Has style import:', c.includes("import './style.css'"));
