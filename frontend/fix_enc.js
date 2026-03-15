const fs = require('fs');

function fix(file) {
  try {
    let c = fs.readFileSync(file, 'utf8');
    let o = c;
    // Common UTF-8 misinterpretations resulting from reading UTF-8 as ISO-8859-1 and re-saving as UTF-8
    c = c.replace(/â,¹/g, '₹');
    c = c.replace(/â€“/g, '—');
    c = c.replace(/â€[œ”]/g, '"');
    c = c.replace(/â€™/g, "'");
    c = c.replace(/âˆ’/g, '−');
    // Also strip BOM if present
    if (c.charCodeAt(0) === 0xFEFF) {
      c = c.slice(1);
    }
    if (c !== o) {
      fs.writeFileSync(file, c, 'utf8');
      console.log('Fixed encoding in', file);
    } else {
      console.log('No fix needed in', file);
    }
  } catch (e) {
    console.error(e);
  }
}

fix('c:/Users/Dhruvil/Desktop/ag_pro/frontend/src/main.js');
fix('c:/Users/Dhruvil/Desktop/ag_pro/frontend/index.html');
