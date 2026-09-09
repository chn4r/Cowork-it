(()=>{
'use strict';

const TYPES={
 library:{label:'Médiathèques',icon:'📚',color:'#2563eb'},
 coworking:{label:'Coworkings',icon:'💼',color:'#6d28d9'},
 third_place:{label:'Tiers-lieux',icon:'🌱',color:'#15803d'},
 workshop:{label:'Ateliers / fablabs',icon:'🛠',color:'#c2410c'},
 cafe:{label:'Cafés / bars',icon:'☕',color:'#b45309'},
 private:{label:'Lieux privés',icon:'🏠',color:'#be185d'}
};
const OVERPASS=[
 'https://overpass-api.de/api/interpreter',
 'https://overpass.kumi.systems/api/interpreter',
 'https://overpass.nchc.org.tw/api/interpreter'
];
const CACHE_KEY='coworkit_world_cache_v1';
const CACHE_TTL=30*60*1000;
const MAX_CACHE=18;
let map=null,layer=null,results=[],activeType='all',loading=false,requestToken=0,moveTimer=null,patched=false;

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const hav=(a,b,c,d)=>{const R=6371,p=Math.PI/180,x=Math.sin((c-a)*p/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin((d-b)*p/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
function getCache(){try{return JSON.parse(sessionStorage.getItem(CACHE_KEY)||'{}')}catch{return{}}}
function putCache(k,data){try{const c=getCache();c[k]={ts:Date.now(),data};const keys=Object.keys(c).sort((a,b)=>c[b].ts-c[a].ts);keys.slice(MAX_CACHE).forEach(x=>delete c[x]);sessionStorage.setItem(CACHE_KEY,JSON.stringify(c))}catch{}}
function cacheGet(k){const c=getCache()[k];return c&&Date.now()-c.ts<CACHE_TTL?c.data:null}
function category(t){
 const a=t.amenity||'',office=t.office||'',leisure=t.leisure||'',club=t.club||'',name=norm(t.name);
 if(office==='coworking'||a==='coworking'||t.coworking)return 'coworking';
 if(a==='library')return 'library';
 if(a==='makerspace'||leisure==='hackerspace'||club==='makerspace'||/fablab|fab lab|makerspace|hackerspace/.test(name))return 'workshop';
 if(a==='arts_centre')return 'workshop';
 if(a==='community_centre'||a==='social_centre')return 'third_place';
 if(['cafe','bar','pub','internet_cafe'].includes(a))return 'cafe';
 return null;
}
function address(t){return [t['addr:housenumber'],t['addr:street'],t['addr:postcode'],t['addr:city']||t['addr:town']||t['addr:village']].filter(Boolean).join(' ')}
function amenities(t,type){
 const a=[TYPES[type].label];
 if(t.internet_access==='wlan'||t.wifi==='yes')a.push('Wi‑Fi');
 else if(type==='cafe')a.push('Wi‑Fi à confirmer');
 if(t.wheelchair==='yes')a.push('PMR');
 if(t.fee==='no')a.push('Gratuit');
 if(t.opening_hours)a.push('Horaires renseignés');
 return a;
}
function parseElement(e){
 const t=e.tags||{},lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon,type=category(t);
 if(!type||!t.name||!Number.isFinite(+lat)||!Number.isFinite(+lng))return null;
 return {
  id:`world-${e.type}-${e.id}`,osmType:e.type,osmId:e.id,title:t.name,type,lat:+lat,lng:+lng,
  city:t['addr:city']||t['addr:town']||t['addr:village']||'',address:address(t),
  openingHours:t.opening_hours||'',website:t.website||t['contact:website']||'',phone:t.phone||t['contact:phone']||'',
  wifi:t.internet_access==='wlan'||t.wifi==='yes',wheelchair:t.wheelchair||'',fee:t.fee||'',capacity:t.capacity||'',
  description:t.description||'',amenities:amenities(t,type),source:'OpenStreetMap',
  suitability:type==='coworking'||type==='library'?'forte':type==='third_place'||type==='workshop'?'moyenne':'à vérifier'
 };
}
function bboxKey(b,z,includeCafe){return [z,includeCafe?1:0,b.getSouth().toFixed(2),b.getWest().toFixed(2),b.getNorth().toFixed(2),b.getEast().toFixed(2)].join(':')}
function queryFor(b,includeCafe){
 const bb=`${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
 const q=[
  `nwr[office=coworking](${bb});`,`nwr[amenity=coworking](${bb});`,`nwr[amenity=library](${bb});`,
  `nwr[amenity=community_centre](${bb});`,`nwr[amenity=social_centre](${bb});`,
  `nwr[amenity=makerspace](${bb});`,`nwr[amenity=arts_centre](${bb});`,`nwr[leisure=hackerspace](${bb});`,`nwr[club=makerspace](${bb});`,
  `nwr[name~"fablab|fab lab|makerspace|hackerspace",i](${bb});`
 ];
 if(includeCafe)q.push(`nwr[amenity=cafe](${bb});`,`nwr[amenity=bar](${bb});`,`nwr[amenity=pub](${bb});`,`nwr[amenity=internet_cafe](${bb});`);
 return `[out:json][timeout:28];(${q.join('')});out center tags 500;`;
}
async function overpass(query,signal){
 let last;
 for(const url of OVERPASS){
  try{
   const r=await fetch(url,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query),signal});
   if(!r.ok)throw new Error(`HTTP ${r.status}`);
   return await r.json();
  }catch(e){if(e.name==='AbortError')throw e;last=e;}
 }
 throw last||new Error('Services cartographiques indisponibles');
}
function dedupe(list){
 const local=(()=>{try{return JSON.parse(localStorage.getItem('coworkit3_places')||'[]')}catch{return[]}})();
 const seen=new Set(local.map(p=>`${norm(p.title)}|${(+p.lat).toFixed(3)}|${(+p.lng).toFixed(3)}`));
 const out=[];
 for(const p of list){const k=`${norm(p.title)}|${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`;if(seen.has(k))continue;seen.add(k);out.push(p)}
 return out;
}
function visibleResults(){return activeType==='all'?results:results.filter(p=>p.type===activeType)}
function injectUI(){
 if(document.getElementById('worldMapPanel'))return;
 const mapPage=document.getElementById('page-map');if(!mapPage)return;
 const head=mapPage.querySelector('.section-head');
 const box=document.createElement('div');box.id='worldMapPanel';box.innerHTML=`
  <div class="world-search-row"><div class="search world-search"><span>⌕</span><input id="worldPlaceSearch" type="search" autocomplete="off" placeholder="Ville, pays ou adresse — ex. Tokyo, Montréal…"><button class="primary" id="worldSearchBtn" type="button">Rechercher</button></div></div>
  <div class="world-status" id="worldMapStatus">Déplacez ou zoomez la carte : les lieux de la zone visible se chargent automatiquement.</div>`;
 head.insertAdjacentElement('afterend',box);
 if(!document.getElementById('worldMapStyles')){const s=document.createElement('style');s.id='worldMapStyles';s.textContent=`
  #worldMapPanel{margin:0 0 12px}.world-search-row{display:flex;gap:8px}.world-search{flex:1;display:flex;align-items:center;gap:8px;padding-right:6px}.world-search input{flex:1;min-width:0}.world-search button{padding:9px 13px}.world-status{font-size:12px;color:var(--muted,#746b80);margin-top:7px}
  .world-pin{border:0!important;background:transparent!important}.world-pin span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:2px solid white;box-shadow:0 3px 12px rgba(0,0,0,.25);font-size:15px}.world-cluster{border:0!important;background:transparent!important}.world-cluster span{display:grid;place-items:center;min-width:34px;height:34px;padding:0 7px;border-radius:18px;background:#26154d;color:#fff;border:2px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.25);font:700 12px/1 system-ui}
  .world-list-title{font-size:12px;font-weight:800;color:#675778;margin:10px 0 7px;text-transform:uppercase;letter-spacing:.05em}.world-card{border-bottom:1px solid rgba(38,21,77,.09);padding:10px 8px;cursor:pointer}.world-card:hover{background:#faf7ff}.world-card-title{font-weight:800}.world-card-meta{font-size:12px;color:#746b80;margin-top:3px}.world-card-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.world-tag{font-size:10px;padding:3px 6px;border-radius:999px;background:#f1edf6}.world-source{font-size:10px;color:#8b8194;margin-top:6px}.world-popup h3{margin:0 0 6px;font-size:15px}.world-popup p{margin:5px 0}.world-popup .wp-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.world-popup a{font-weight:700}
  @media(max-width:700px){.world-search{flex-wrap:wrap}.world-search input{flex-basis:calc(100% - 26px)}.world-search button{width:100%}}
 `;document.head.appendChild(s)}
 document.getElementById('worldSearchBtn')?.addEventListener('click',searchPlace);
 document.getElementById('worldPlaceSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchPlace()}});
}
function status(text){const n=document.getElementById('worldMapStatus');if(n)n.textContent=text}
async function searchPlace(){
 const input=document.getElementById('worldPlaceSearch'),q=input?.value.trim();if(!q||!map)return;
 status('Recherche du lieu…');
 try{
  const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=fr&q=${encodeURIComponent(q)}`);
  if(!r.ok)throw new Error(`HTTP ${r.status}`);const a=await r.json();if(!a.length)throw new Error('Lieu introuvable');
  const x=a[0];map.setView([+x.lat,+x.lon],14);status(`Zone affichée : ${x.display_name}`);scheduleLoad(150);
 }catch(e){status(`Recherche impossible : ${e.message}`)}
}
function popupHtml(p){
 const t=TYPES[p.type];const links=[];
 if(p.website)links.push(`<a href="${esc(p.website)}" target="_blank" rel="noopener">Site ↗</a>`);
 links.push(`<a href="https://www.openstreetmap.org/${p.osmType}/${p.osmId}" target="_blank" rel="noopener">OpenStreetMap ↗</a>`);
 return `<div class="world-popup"><h3>${t.icon} ${esc(p.title)}</h3>${p.address?`<p>${esc(p.address)}</p>`:''}${p.openingHours?`<p><b>Horaires :</b> ${esc(p.openingHours)}</p>`:''}<p><b>Wi‑Fi :</b> ${p.wifi?'renseigné':'à confirmer'} · <b>Adapté au travail :</b> confiance ${esc(p.suitability)}</p>${p.phone?`<p><b>Tél. :</b> ${esc(p.phone)}</p>`:''}<div class="wp-actions">${links.join(' · ')}</div><p class="world-source">Données OpenStreetMap — informations à vérifier avant déplacement.</p></div>`;
}
function renderLayer(){
 if(!map||!window.L)return;if(layer)layer.remove();layer=L.layerGroup().addTo(map);
 const list=visibleResults(),z=map.getZoom();
 if(z<13&&list.length>30){
  const step=z<=10?.05:z===11?.025:.012;
  const groups=new Map();
  list.forEach(p=>{const k=`${Math.round(p.lat/step)}:${Math.round(p.lng/step)}`;const g=groups.get(k)||[];g.push(p);groups.set(k,g)});
  groups.forEach(g=>{if(g.length===1){addPin(g[0]);return}const lat=g.reduce((s,p)=>s+p.lat,0)/g.length,lng=g.reduce((s,p)=>s+p.lng,0)/g.length;const icon=L.divIcon({className:'world-cluster',html:`<span>${g.length}</span>`,iconSize:[38,38],iconAnchor:[19,19]});L.marker([lat,lng],{icon}).addTo(layer).on('click',()=>map.setView([lat,lng],Math.min(16,z+2)))})
 }else list.forEach(addPin);
 renderList(list);
}
function addPin(p){const t=TYPES[p.type];const icon=L.divIcon({className:'world-pin',html:`<span style="background:${t.color}">${t.icon}</span>`,iconSize:[30,30],iconAnchor:[15,15]});L.marker([p.lat,p.lng],{icon,title:p.title}).addTo(layer).bindPopup(popupHtml(p),{maxWidth:310})}
function renderList(list){
 const side=document.getElementById('mapList');if(!side)return;
 side.querySelectorAll('[data-world-ui]').forEach(n=>n.remove());
 const center=map.getCenter();const sorted=[...list].map(p=>({...p,_d:hav(center.lat,center.lng,p.lat,p.lng)})).sort((a,b)=>a._d-b._d).slice(0,80);
 const wrap=document.createElement('div');wrap.dataset.worldUi='1';wrap.innerHTML=`<div class="world-list-title">Zone visible · ${list.length} lieu${list.length>1?'x':''}</div>`+sorted.map(p=>{const t=TYPES[p.type];return `<div class="world-card" data-world-id="${p.id}"><div class="world-card-title">${t.icon} ${esc(p.title)}</div><div class="world-card-meta">${esc(p.city||p.address||'')} · ${p._d<1?Math.round(p._d*1000)+' m':p._d.toFixed(1)+' km'}</div><div class="world-card-tags">${p.amenities.slice(0,3).map(a=>`<span class="world-tag">${esc(a)}</span>`).join('')}</div><div class="world-source">OpenStreetMap · données à vérifier</div></div>`}).join('');
 side.prepend(wrap);
 wrap.addEventListener('click',e=>{const c=e.target.closest('[data-world-id]');if(!c)return;const p=results.find(x=>x.id===c.dataset.worldId);if(p){map.setView([p.lat,p.lng],Math.max(15,map.getZoom()));setTimeout(()=>{layer.eachLayer(m=>{const ll=m.getLatLng?.();if(ll&&Math.abs(ll.lat-p.lat)<1e-6&&Math.abs(ll.lng-p.lng)<1e-6)m.openPopup?.()})},200)}})
}
async function loadVisible(){
 if(!map||loading)return;const z=map.getZoom();
 if(z<10){results=[];renderLayer();status('Zoomez davantage ou recherchez une ville pour charger les lieux de travail.');return}
 const b=map.getBounds();
 const span=Math.max(b.getNorth()-b.getSouth(),b.getEast()-b.getWest());
 if(span>2.2){status('Zone trop vaste : zoomez pour afficher les lieux avec précision.');return}
 const includeCafe=z>=13||activeType==='cafe';const key=bboxKey(b,z,includeCafe),cached=cacheGet(key);
 if(cached){results=cached;renderLayer();status(`${results.length} lieux chargés depuis le cache de cette zone.`);return}
 loading=true;const token=++requestToken;status('Recherche des lieux dans la zone visible…');
 try{
  const ctrl=new AbortController();setTimeout(()=>ctrl.abort(),32000);
  const data=await overpass(queryFor(b,includeCafe),ctrl.signal);if(token!==requestToken)return;
  results=dedupe((data.elements||[]).map(parseElement).filter(Boolean)).slice(0,500);putCache(key,results);renderLayer();
  const cafeMsg=!includeCafe?' Zoomez encore pour inclure cafés et bars.':'';status(`${results.length} lieux trouvés dans cette zone.${cafeMsg}`);
 }catch(e){if(e.name!=='AbortError')status(`Recherche cartographique temporairement indisponible : ${e.message}. Déplacez légèrement la carte ou réessayez.`)}finally{loading=false}
}
function scheduleLoad(ms=700){clearTimeout(moveTimer);moveTimer=setTimeout(loadVisible,ms)}
function attach(m){if(map===m)return;map=m;injectUI();layer=L.layerGroup().addTo(map);map.on('moveend zoomend',()=>scheduleLoad());scheduleLoad(250)}
function patchLeaflet(){
 if(patched||!window.L?.map)return false;patched=true;const original=L.map;L.map=function(...args){const m=original.apply(this,args);setTimeout(()=>attach(m),0);return m};return true;
}
const poll=setInterval(()=>{if(patchLeaflet())clearInterval(poll)},25);setTimeout(()=>clearInterval(poll),15000);
document.addEventListener('click',e=>{const b=e.target.closest('[data-cowork-type]');if(!b)return;activeType=b.dataset.coworkType||'all';renderLayer();if(activeType==='cafe'&&map?.getZoom()<13)status('Zoomez au niveau du quartier pour charger les cafés et bars sans surcharger la carte.');else scheduleLoad(200)});
window.CoworkWorldMap={attach,load:loadVisible,setType:t=>{activeType=t;renderLayer();scheduleLoad(100)},getResults:()=>results};
})();
