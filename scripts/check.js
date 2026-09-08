const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');
let failed=false;
function fail(msg){failed=true;console.error('FAIL:',msg)}
function ok(msg){console.log('OK:',msg)}
function read(name){return fs.readFileSync(path.join(root,name),'utf8')}
const required=['index.html','styles.css','app.js','network.js','leaflet-loader.js','manifest.webmanifest','sw.js','offline.html','icons/icon.svg','tests/smoke.spec.js','supabase/migrations/001_initial.sql'];
for(const f of required) fs.existsSync(path.join(root,f))?ok(f+' présent'):fail(f+' manquant');
const html=read('index.html');
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const duplicates=[...new Set(ids.filter((x,i,a)=>a.indexOf(x)!==i))];
duplicates.length?fail('IDs dupliqués: '+duplicates.join(', ')):ok('IDs uniques');
const pages=new Set([...html.matchAll(/data-page="([^"]+)"/g)].map(m=>m[1]));
const navs=[...html.matchAll(/data-nav="([^"]+)"/g)].map(m=>m[1]);
const badNavs=[...new Set(navs.filter(n=>!pages.has(n)))];
badNavs.length?fail('Navigation invalide: '+badNavs.join(', ')):ok('Navigation valide');
const app=read('app.js');
const actions=[...new Set([...html.matchAll(/data-action="([^"]+)"/g),...app.matchAll(/data-action=\\?"([^"\\]+)\\?"/g)].map(m=>m[1]))];
const handled=[...new Set([...app.matchAll(/a==='([^']+)'/g)].map(m=>m[1]))];
const missingActions=actions.filter(a=>!handled.includes(a));
missingActions.length?fail('Actions sans gestionnaire: '+missingActions.join(', ')):ok('Actions UI gérées');
for(const f of ['app.js','network.js','leaflet-loader.js','sw.js','scripts/dev-server.js','scripts/publish-server.js','scripts/publish-cli.js']){
  if(!fs.existsSync(path.join(root,f))){fail(f+' manquant');continue}
  const r=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});r.status===0?ok('Syntaxe '+f):fail('Syntaxe '+f+': '+(r.stderr||r.stdout).trim());
}
try{const m=JSON.parse(read('manifest.webmanifest'));const icon=m.icons?.[0]?.src?.replace(/^\.\//,'');icon&&fs.existsSync(path.join(root,icon))?ok('Icône manifeste valide'):fail('Icône manifeste manquante')}catch(e){fail('Manifest invalide: '+e.message)}
process.exitCode=failed?1:0;
if(!failed)console.log('\nCowork it: contrôle statique approfondi réussi.');
