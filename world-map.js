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
const CACHE_KEY='coworkit_world_cache_v2';
const CACHE_TTL=30*60*1000;
const MAX_CACHE=18;
const REVIEW_KEY='coworkit_world_reviews_v1';
const VERIFY_KEY='coworkit_world_verifications_v1';
let map=null,layer=null,results=[],activeType='all',loading=false,requestToken=0,moveTimer=null,patched=false;
let userLocation=null,sortMode='distance',openOnly=false,routeCache=new Map();

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const hav=(a,b,c,d)=>{const R=6371,p=Math.PI/180,x=Math.sin((c-a)*p/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin((d-b)*p/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
const readJSON=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch{return fallback}};
const writeJSON=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
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
 if(t.socket==='yes'||t.power_supply==='yes')a.push('Prises');
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
function parseSimpleHours(hours,now=new Date()){
 if(!hours)return {known:false,open:null,label:'Horaires à confirmer'};
 const h=hours.trim();if(/^24\/7$/i.test(h))return {known:true,open:true,label:'Ouvert 24/7'};
 const day=['Su','Mo','Tu','We','Th','Fr','Sa'][now.getDay()],mins=now.getHours()*60+now.getMinutes();
 const dayOrder={Mo:1,Tu:2,We:3,Th:4,Fr:5,Sa:6,Su:7};
 const chunks=h.split(';').map(x=>x.trim()).filter(Boolean);
 let matched=false;
 for(const chunk of chunks){
  const m=chunk.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su))*)\s+(.+)$/);
  if(!m)continue;
  const ds=m[1].split(','),current=dayOrder[day];
  const dayOk=ds.some(d=>{if(d.includes('-')){const [a,b]=d.split('-').map(x=>dayOrder[x]);return a<=b?current>=a&&current<=b:current>=a||current<=b}return dayOrder[d]===current});
  if(!dayOk)continue;matched=true;
  const ranges=m[2].split(',');
  for(const r of ranges){const tm=r.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);if(!tm)continue;const a=+tm[1]*60 + +tm[2],b=+tm[3]*60 + +tm[4];if(mins>=a&&mins<=b)return {known:true,open:true,label:'Ouvert maintenant'}}
 }
 if(matched)return {known:true,open:false,label:'Fermé maintenant'};
 return {known:false,open:null,label:'Horaires complexes — à vérifier'};
}
function reviewData(id){const all=readJSON(REVIEW_KEY,{});return all[id]||[]}
function verifyData(id){const all=readJSON(VERIFY_KEY,{});return all[id]||{accurate:0,outdated:0}}
function reviewSummary(id){const a=reviewData(id);if(!a.length)return {count:0,avg:0};return {count:a.length,avg:a.reduce((s,x)=>s+Number(x.rating||0),0)/a.length}}
function visibleResults(){
 let list=activeType==='all'?results:results.filter(p=>p.type===activeType);
 if(openOnly)list=list.filter(p=>parseSimpleHours(p.openingHours).open===true);
 const center=userLocation||map?.getCenter();
 list=list.map(p=>({...p,_d:center?hav(center.lat,center.lng,p.lat,p.lng):0,_open:parseSimpleHours(p.openingHours)}));
 if(sortMode==='distance')list.sort((a,b)=>a._d-b._d);
 else if(sortMode==='rating')list.sort((a,b)=>reviewSummary(b.id).avg-reviewSummary(a.id).avg||a._d-b._d);
 else if(sortMode==='open')list.sort((a,b)=>(b._open.open===true)-(a._open.open===true)||a._d-b._d);
 return list;
}
function injectUI(){
 if(document.getElementById('worldMapPanel'))return;
 const mapPage=document.getElementById('page-map');if(!mapPage)return;
 const head=mapPage.querySelector('.section-head');
 const box=document.createElement('div');box.id='worldMapPanel';box.innerHTML=`
  <div class="world-search-row"><div class="search world-search"><span>⌕</span><input id="worldPlaceSearch" type="search" autocomplete="off" placeholder="Ville, pays ou adresse — ex. Tokyo, Montréal…"><button class="primary" id="worldSearchBtn" type="button">Rechercher</button></div></div>
  <div class="world-control-row">
   <button class="secondary" id="worldAroundMe" type="button">⌖ Autour de moi</button>
   <label class="world-select">Trier <select id="worldSort"><option value="distance">Distance</option><option value="open">Ouvert maintenant</option><option value="rating">Avis Cowork it</option></select></label>
   <button class="chip" id="worldOpenOnly" type="button" aria-pressed="false">Ouvert maintenant</button>
  </div>
  <div class="world-status" id="worldMapStatus">Déplacez ou zoomez la carte : les lieux de la zone visible se chargent automatiquement.</div>`;
 head.insertAdjacentElement('afterend',box);
 if(!document.getElementById('worldMapStyles')){const s=document.createElement('style');s.id='worldMapStyles';s.textContent=`
  #worldMapPanel{margin:0 0 12px}.world-search-row{display:flex;gap:8px}.world-search{flex:1;display:flex;align-items:center;gap:8px;padding-right:6px}.world-search input{flex:1;min-width:0}.world-search button{padding:9px 13px}.world-status{font-size:12px;color:var(--muted,#746b80);margin-top:7px}.world-control-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}.world-select{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700}.world-select select{border:1px solid rgba(38,21,77,.15);border-radius:10px;padding:8px;background:#fff}
  .world-pin{border:0!important;background:transparent!important}.world-pin span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:2px solid white;box-shadow:0 3px 12px rgba(0,0,0,.25);font-size:15px}.world-cluster{border:0!important;background:transparent!important}.world-cluster span{display:grid;place-items:center;min-width:34px;height:34px;padding:0 7px;border-radius:18px;background:#26154d;color:#fff;border:2px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.25);font:700 12px/1 system-ui}
  .world-list-title{font-size:12px;font-weight:800;color:#675778;margin:10px 0 7px;text-transform:uppercase;letter-spacing:.05em}.world-card{border-bottom:1px solid rgba(38,21,77,.09);padding:10px 8px;cursor:pointer}.world-card:hover{background:#faf7ff}.world-card-title{font-weight:800}.world-card-meta{font-size:12px;color:#746b80;margin-top:3px}.world-card-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.world-tag{font-size:10px;padding:3px 6px;border-radius:999px;background:#f1edf6}.world-tag.open{background:#e7f7ed;color:#126c38}.world-tag.closed{background:#fbeaea;color:#9f2424}.world-source{font-size:10px;color:#8b8194;margin-top:6px}.world-popup h3{margin:0 0 6px;font-size:15px}.world-popup p{margin:5px 0}.world-popup .wp-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.world-popup a,.world-popup button{font-weight:700}.world-rating{font-size:12px;font-weight:800;margin-top:4px}.world-route-box{padding:10px;border-radius:12px;background:#f6f1fb;margin-top:10px}.world-route-modes{display:flex;gap:6px;flex-wrap:wrap}.world-detail-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.world-review-list{display:grid;gap:7px;margin-top:8px}.world-review{padding:8px;border-radius:10px;background:#faf7ff}.world-verify{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.world-detail-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.world-stars{display:flex;gap:4px}.world-stars button{border:0;background:transparent;font-size:22px;cursor:pointer;padding:2px}.world-review-form textarea{width:100%;min-height:70px;margin-top:6px}.world-route-result{font-size:12px;margin-top:7px}
  @media(max-width:700px){.world-search{flex-wrap:wrap}.world-search input{flex-basis:calc(100% - 26px)}.world-search button{width:100%}.world-detail-grid{grid-template-columns:1fr}.world-control-row>*{flex:1}.world-select select{width:100%}}
 `;document.head.appendChild(s)}
 document.getElementById('worldSearchBtn')?.addEventListener('click',searchPlace);
 document.getElementById('worldPlaceSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchPlace()}});
 document.getElementById('worldAroundMe')?.addEventListener('click',aroundMe);
 document.getElementById('worldSort')?.addEventListener('change',e=>{sortMode=e.target.value;renderLayer()});
 document.getElementById('worldOpenOnly')?.addEventListener('click',e=>{openOnly=!openOnly;e.currentTarget.classList.toggle('active',openOnly);e.currentTarget.setAttribute('aria-pressed',String(openOnly));renderLayer()});
}
function status(text){const n=document.getElementById('worldMapStatus');if(n)n.textContent=text}
async function searchPlace(){
 const input=document.getElementById('worldPlaceSearch'),q=input?.value.trim();if(!q||!map)return;
 status('Recherche du lieu…');
 try{
  const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=fr&q=${encodeURIComponent(q)}`,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error(`HTTP ${r.status}`);const a=await r.json();if(!a.length)throw new Error('Lieu introuvable');
  const x=a[0];map.setView([+x.lat,+x.lon],14);status(`Zone affichée : ${x.display_name}`);scheduleLoad(150);
 }catch(e){status(`Recherche impossible : ${e.message}`)}
}
function aroundMe(){
 if(!navigator.geolocation)return status('La géolocalisation n’est pas disponible sur cet appareil.');
 status('Localisation en cours…');
 navigator.geolocation.getCurrentPosition(pos=>{
  userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};
  map.setView([userLocation.lat,userLocation.lng],14);
  L.circleMarker([userLocation.lat,userLocation.lng],{radius:8,color:'#ff4f87',weight:3,fillColor:'#ff4f87',fillOpacity:1}).addTo(map).bindPopup('Vous êtes ici');
  status(`Position trouvée à environ ${Math.round(userLocation.accuracy)} m. Recherche des lieux autour de vous…`);scheduleLoad(100);
 },()=>status('Impossible d’obtenir votre position. Vérifiez l’autorisation de localisation.'),{enableHighAccuracy:true,timeout:10000,maximumAge:120000});
}
function osmDirections(p){if(!userLocation)return '';return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${p.lat}%2C${p.lng}`}
function popupHtml(p){
 const t=TYPES[p.type],r=reviewSummary(p.id),oh=parseSimpleHours(p.openingHours),links=[];
 if(p.website)links.push(`<a href="${esc(p.website)}" target="_blank" rel="noopener">Site ↗</a>`);
 links.push(`<a href="https://www.openstreetmap.org/${p.osmType}/${p.osmId}" target="_blank" rel="noopener">OpenStreetMap ↗</a>`);
 if(userLocation)links.push(`<a href="${osmDirections(p)}" target="_blank" rel="noopener">Itinéraire ↗</a>`);
 return `<div class="world-popup"><h3>${t.icon} ${esc(p.title)}</h3>${p.address?`<p>${esc(p.address)}</p>`:''}${p.openingHours?`<p><b>Horaires :</b> ${esc(p.openingHours)}</p>`:''}<p><b>${esc(oh.label)}</b> · <b>Wi‑Fi :</b> ${p.wifi?'renseigné':'à confirmer'}</p>${r.count?`<div class="world-rating">★ ${r.avg.toFixed(1)} · ${r.count} avis Cowork it</div>`:''}<div class="wp-actions"><button type="button" data-world-detail="${esc(p.id)}">Fiche complète</button>${links.join(' · ')}</div><p class="world-source">Données OpenStreetMap — informations à vérifier avant déplacement.</p></div>`;
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
function addPin(p){const t=TYPES[p.type];const icon=L.divIcon({className:'world-pin',html:`<span style="background:${t.color}">${t.icon}</span>`,iconSize:[30,30],iconAnchor:[15,15]});L.marker([p.lat,p.lng],{icon,title:p.title}).addTo(layer).bindPopup(popupHtml(p),{maxWidth:340})}
function renderList(list){
 const side=document.getElementById('mapList');if(!side)return;
 side.querySelectorAll('[data-world-ui]').forEach(n=>n.remove());
 const sorted=list.slice(0,100);
 const wrap=document.createElement('div');wrap.dataset.worldUi='1';wrap.innerHTML=`<div class="world-list-title">Zone visible · ${list.length} lieu${list.length>1?'x':''}</div>`+sorted.map(p=>{const t=TYPES[p.type],r=reviewSummary(p.id),oh=p._open||parseSimpleHours(p.openingHours);return `<div class="world-card" data-world-id="${p.id}"><div class="world-card-title">${t.icon} ${esc(p.title)}</div><div class="world-card-meta">${esc(p.city||p.address||'')} · ${p._d<1?Math.round(p._d*1000)+' m':p._d.toFixed(1)+' km'}</div><div class="world-card-tags"><span class="world-tag ${oh.open===true?'open':oh.open===false?'closed':''}">${esc(oh.label)}</span>${p.amenities.slice(0,2).map(a=>`<span class="world-tag">${esc(a)}</span>`).join('')}</div>${r.count?`<div class="world-rating">★ ${r.avg.toFixed(1)} · ${r.count} avis</div>`:''}<div class="world-source">OpenStreetMap · données à vérifier</div></div>`}).join('');
 side.prepend(wrap);
 wrap.addEventListener('click',e=>{const c=e.target.closest('[data-world-id]');if(!c)return;const p=results.find(x=>x.id===c.dataset.worldId);if(p)openDetail(p.id)})
}
async function routeTo(p){
 if(!userLocation)throw new Error('Localisez-vous d’abord avec « Autour de moi ».');
 const k=`${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)}>${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
 if(routeCache.has(k))return routeCache.get(k);
 const direct=hav(userLocation.lat,userLocation.lng,p.lat,p.lng);
 let out={distanceKm:direct,driveMin:Math.max(2,Math.round(direct/45*60)),bikeMin:Math.max(2,Math.round(direct/15*60)),walkMin:Math.max(2,Math.round(direct/4.5*60)),estimated:true};
 try{
  const url=`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${p.lng},${p.lat}?overview=false&steps=false`;
  const r=await fetch(url);if(r.ok){const j=await r.json(),rt=j.routes?.[0];if(rt){out.distanceKm=rt.distance/1000;out.driveMin=Math.max(1,Math.round(rt.duration/60));out.bikeMin=Math.max(2,Math.round(out.distanceKm/15*60));out.walkMin=Math.max(2,Math.round(out.distanceKm/4.5*60));out.estimated=false}}
 }catch{}
 routeCache.set(k,out);return out;
}
function starsHtml(id){return `<div class="world-stars" data-stars-for="${id}">${[1,2,3,4,5].map(n=>`<button type="button" data-rate-place="${id}" data-rating="${n}" aria-label="${n} étoile${n>1?'s':''}">☆</button>`).join('')}</div>`}
function openDetail(id){
 const p=results.find(x=>x.id===id);if(!p)return;const t=TYPES[p.type],r=reviewSummary(id),v=verifyData(id),reviews=reviewData(id),oh=parseSimpleHours(p.openingHours);
 const modal=document.getElementById('modal'),back=document.getElementById('modalBackdrop');if(!modal||!back)return;
 modal.innerHTML=`<div class="modal-head"><div><div class="eyebrow" style="color:var(--purple2)">${t.icon} ${esc(t.label)}</div><h2>${esc(p.title)}</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
 <div class="world-detail-grid"><div>
  <div class="info-block"><h3>${esc(p.city||p.address||'Lieu de travail')}</h3>${p.address?`<p>${esc(p.address)}</p>`:''}${p.description?`<p>${esc(p.description)}</p>`:''}<div class="meta">${p.amenities.map(a=>`<span class="pill">${esc(a)}</span>`).join('')}</div><p><b>${esc(oh.label)}</b></p>${p.openingHours?`<p><b>Horaires :</b> ${esc(p.openingHours)}</p>`:''}${p.phone?`<p><b>Téléphone :</b> ${esc(p.phone)}</p>`:''}</div>
  <div class="world-route-box"><b>Trajet depuis votre position</b><div class="world-route-result" id="worldRouteResult">${userLocation?'Calcul en cours…':'Utilisez « Autour de moi » pour calculer le trajet.'}</div><div class="world-detail-actions">${userLocation?`<a class="secondary" href="${osmDirections(p)}" target="_blank" rel="noopener">Itinéraire sur OpenStreetMap ↗</a>`:''}${p.website?`<a class="secondary" href="${esc(p.website)}" target="_blank" rel="noopener">Site du lieu ↗</a>`:''}</div></div>
  <div class="info-block" style="margin-top:12px"><h3>Avis Cowork it</h3><p>${r.count?`★ ${r.avg.toFixed(1)} sur 5 · ${r.count} avis`:'Aucun avis Cowork it pour le moment.'}</p>${starsHtml(id)}<div class="world-review-form"><textarea id="worldReviewText" maxlength="400" placeholder="Calme, Wi‑Fi, prises, accueil, conditions pour travailler…"></textarea><button class="primary" type="button" data-save-review="${id}">Publier mon avis</button></div><div class="world-review-list">${reviews.slice().reverse().slice(0,5).map(x=>`<div class="world-review"><b>★ ${Number(x.rating).toFixed(0)}/5</b>${x.text?`<div>${esc(x.text)}</div>`:''}<div class="world-source">${new Date(x.ts).toLocaleDateString('fr-FR')}</div></div>`).join('')}</div></div>
 </div><aside>
  <div class="info-block"><h3>Fiabilité communautaire</h3><p>Ces votes permettent de signaler si les informations du lieu sont toujours correctes.</p><div class="world-verify"><button class="secondary" type="button" data-verify-place="${id}" data-verify="accurate">✓ Correct · ${v.accurate}</button><button class="secondary" type="button" data-verify-place="${id}" data-verify="outdated">⚠ À actualiser · ${v.outdated}</button></div><p class="world-source">Les votes sont enregistrés sur cet appareil en mode local. Ils pourront être synchronisés quand le compte réseau est actif.</p></div>
  <div class="info-block" style="margin-top:12px"><h3>Source</h3><p>OpenStreetMap</p><a href="https://www.openstreetmap.org/${p.osmType}/${p.osmId}" target="_blank" rel="noopener">Voir / corriger la fiche OSM ↗</a><p class="world-source">Cowork it ne considère pas une donnée OSM comme une garantie d’accès, d’horaires, de Wi‑Fi ou de prises.</p></div>
 </aside></div>`;
 back.classList.add('show');
 if(userLocation)routeTo(p).then(x=>{const n=document.getElementById('worldRouteResult');if(n)n.innerHTML=`🚗 ${x.driveMin} min · 🚲 ≈ ${x.bikeMin} min · 🚶 ≈ ${x.walkMin} min · ${x.distanceKm.toFixed(1)} km${x.estimated?' <span class="muted">(estimé)</span>':''}`}).catch(e=>{const n=document.getElementById('worldRouteResult');if(n)n.textContent=e.message});
}
let selectedRating=0;
document.addEventListener('click',e=>{
 const detail=e.target.closest('[data-world-detail]');if(detail){openDetail(detail.dataset.worldDetail);return}
 const star=e.target.closest('[data-rate-place]');if(star){selectedRating=Number(star.dataset.rating);const root=star.closest('.world-stars');root?.querySelectorAll('button').forEach(b=>b.textContent=Number(b.dataset.rating)<=selectedRating?'★':'☆');return}
 const save=e.target.closest('[data-save-review]');if(save){if(!selectedRating){status('Choisissez une note de 1 à 5 étoiles.');return}const all=readJSON(REVIEW_KEY,{}),id=save.dataset.saveReview,text=document.getElementById('worldReviewText')?.value.trim()||'';all[id]=all[id]||[];all[id].push({rating:selectedRating,text,ts:Date.now()});writeJSON(REVIEW_KEY,all);selectedRating=0;openDetail(id);renderLayer();return}
 const verify=e.target.closest('[data-verify-place]');if(verify){const all=readJSON(VERIFY_KEY,{}),id=verify.dataset.verifyPlace,k=verify.dataset.verify;all[id]=all[id]||{accurate:0,outdated:0};all[id][k]=(all[id][k]||0)+1;writeJSON(VERIFY_KEY,all);openDetail(id);return}
 const typeBtn=e.target.closest('[data-cowork-type]');if(typeBtn){activeType=typeBtn.dataset.coworkType||'all';renderLayer();if(activeType==='cafe'&&map?.getZoom()<13)status('Zoomez au niveau du quartier pour charger les cafés et bars sans surcharger la carte.');else scheduleLoad(200)}
});
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
window.CoworkWorldMap={attach,load:loadVisible,setType:t=>{activeType=t;renderLayer();scheduleLoad(100)},getResults:()=>results,getMap:()=>map,aroundMe,openDetail};
})();
