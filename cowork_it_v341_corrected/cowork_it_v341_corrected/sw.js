const CACHE='cowork-it-v341-shell-1';
const SHELL=['./','./index.html','./styles.css','./app.js','./network.js','./leaflet-loader.js','./manifest.webmanifest','./offline.html','./icons/icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.pathname.includes('/rest/v1/')||u.pathname.includes('/auth/v1/'))return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./offline.html'))));return;
 }
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok&&u.origin===location.origin)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>hit)));
});
