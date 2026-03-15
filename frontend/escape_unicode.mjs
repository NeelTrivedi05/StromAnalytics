import fs from 'fs';

let c = fs.readFileSync('c:/Users/Dhruvil/Desktop/ag_pro/frontend/src/main.js', 'utf8');
c = c.replace(/₹/g, '\\u20B9');
c = c.replace(/—/g, '\\u2014');
fs.writeFileSync('c:/Users/Dhruvil/Desktop/ag_pro/frontend/src/main.js', c, 'utf8');
console.log('Unicode escaped in main.js');
