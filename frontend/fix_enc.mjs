import fs from 'fs';

function fix(file) {
  try {
    let c = fs.readFileSync(file, 'utf8');
    let o = c;
    
    // Windows-1252 encoding of UTF-8 Rupee E2 82 B9
    // E2 = â (\u00E2)
    // 82 = ‚ (\u201a)
    // B9 = ¹ (\u00b9)
    c = c.replace(/\u00E2\u201A\u00B9/g, '₹');
    // Windows-1252 encoding of UTF-8 em-dash E2 80 94
    // E2 = â (\u00E2)
    // 80 = € (\u20AC)
    // 94 = ” (\u201D)
    c = c.replace(/\u00E2\u20AC\u201D/g, '—');
    
    if (c !== o) {
      fs.writeFileSync(file, c, 'utf8');
      console.log('Fixed encoding in', file);
    } else {
      console.log('No fix needed in', file);
    }
  } catch (e) {
    console.error('Error processing ' + file, e);
  }
}

fix('c:/Users/Dhruvil/Desktop/ag_pro/frontend/src/main.js');
