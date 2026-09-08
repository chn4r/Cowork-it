const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function fail(msg){ console.error('FAIL:', msg); process.exitCode = 1; }
function ok(msg){ console.log('OK:', msg); }

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const duplicates = [...new Set(ids.filter((x,i,a)=>a.indexOf(x)!==i))];
duplicates.length ? fail('IDs dupliqués: '+duplicates.join(', ')) : ok('IDs uniques');

const pages = new Set([...html.matchAll(/data-page="([^"]+)"/g)].map(m=>m[1]));
const navs = [...html.matchAll(/data-nav="([^"]+)"/g)].map(m=>m[1]);
const badNavs = [...new Set(navs.filter(n=>!pages.has(n)))];
badNavs.length ? fail('Navigation invalide: '+badNavs.join(', ')) : ok('Navigation valide');

for (const file of ['manifest.webmanifest','sw.js']) {
  if (fs.existsSync(path.join(root,file))) ok(file+' présent');
}

if (!process.exitCode) console.log('\nCowork it: contrôle statique réussi.');
