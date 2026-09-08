
(() => {
'use strict';
const STORAGE = {
  places:'coworkit3_places', favorites:'coworkit3_favorites', threads:'coworkit3_threads',
  settings:'coworkit3_settings', profile:'coworkit3_profile'
};
const seedPlaces = [
 {id:'p1',title:'La Verrière',kind:'private',universe:'computer',city:'Rennes',lat:48.1115,lng:-1.6804,distance:18.4,rating:4.9,reviews:42,price:18,capacity:4,quiet:true,wifi:true,tools:false,live:true,updatedMins:18,host:'Maëlle',desc:'Bureau calme et lumineux, fibre, écran 27 pouces et café. Accès sur réservation.',rules:'Calme demandé. Appels dans la petite salle.',amenities:['Fibre','Prises','Écran','Café'],slots:['Aujourd’hui 14–18 h','Mercredi 9–17 h']},
 {id:'p2',title:'Médiathèque — espace travail',kind:'public',universe:'computer',city:'Guichen',lat:47.9678,lng:-1.7959,distance:7.2,rating:4.6,reviews:31,price:0,capacity:16,quiet:true,wifi:true,tools:false,live:true,updatedMins:52,host:'Communauté',desc:'Tables, prises, Wi-Fi et zone silencieuse. Accès libre aux horaires d’ouverture.',rules:'Lieu public : vérifier les horaires avant déplacement.',amenities:['Wi-Fi','Prises','PMR','Gratuit'],slots:['Aujourd’hui jusqu’à 18 h','Samedi 10–17 h']},
 {id:'p3',title:'Atelier partagé des Forges',kind:'workshop',universe:'artisan',city:'Bruz',lat:48.0255,lng:-1.7464,distance:12.8,rating:4.8,reviews:67,price:12,capacity:8,quiet:false,wifi:true,tools:true,live:true,updatedMins:9,host:'Collectif Les Forges',desc:'Établis, outillage bois et métal, zone montage et espace collectif.',rules:'EPI obligatoires. Certains outils nécessitent une habilitation.',amenities:['Établis','Outillage','Ventilation','Parking'],slots:['Aujourd’hui 13–19 h','Jeudi 9–19 h']},
 {id:'p4',title:'Café des Ateliers',kind:'public',universe:'association',city:'Rennes',lat:48.1072,lng:-1.6752,distance:19.1,rating:4.7,reviews:128,price:0,capacity:10,quiet:false,wifi:true,tools:false,live:false,updatedMins:1560,host:'Communauté',desc:'Café associatif accueillant les sessions de travail et petites réunions.',rules:'Consommation appréciée. Bruit variable selon les événements.',amenities:['Wi-Fi','Boissons','Réunion','Centre-ville'],slots:['À confirmer']},
 {id:'p5',title:'Jardin de coworking',kind:'private',universe:'private',city:'Saint-Senoux',lat:47.9057,lng:-1.7889,distance:2.1,rating:4.9,reviews:16,price:8,capacity:3,quiet:true,wifi:true,tools:false,live:true,updatedMins:27,host:'Nicolas',desc:'Terrasse abritée, petit bureau intérieur et fibre. Idéal pour une demi-journée calme.',rules:'Pas de réunion de plus de 3 personnes.',amenities:['Extérieur','Fibre','Parking','Café'],slots:['Aujourd’hui 15–19 h','Demain 9–12 h']},
 {id:'p6',title:'Salle projet — La Fabrique',kind:'public',universe:'association',city:'Bain-de-Bretagne',lat:47.8430,lng:-1.6856,distance:22.7,rating:4.5,reviews:22,price:5,capacity:12,quiet:true,wifi:true,tools:false,live:true,updatedMins:34,host:'La Fabrique',desc:'Salle réservable pour associations, collectifs et équipes projet.',rules:'Réservation recommandée au-delà de 4 personnes.',amenities:['Vidéoprojecteur','Wi-Fi','PMR','Cuisine'],slots:['Mercredi 14–18 h','Vendredi 9–17 h']}
];
const people = [
 {id:'u1',name:'Lina',initials:'LI',role:'Designer UX',universe:'computer',distance:6.4,now:true,intent:'Cherche quelqu’un pour tester un prototype',skills:['Figma','UX','Ateliers'],place:'Médiathèque — espace travail'},
 {id:'u2',name:'Yann',initials:'YA',role:'Menuisier / maker',universe:'artisan',distance:12.1,now:true,intent:'Disponible pour entraide fabrication',skills:['Bois','CNC','Plans'],place:'Atelier partagé des Forges'},
 {id:'u3',name:'Sarah',initials:'SA',role:'Chargée de projet associatif',universe:'association',distance:18.2,now:false,intent:'Cherche partenaires pour événement local',skills:['Production','Réseau','Budget'],place:'Café des Ateliers'},
 {id:'u4',name:'Noé',initials:'NO',role:'Développeur web',universe:'computer',distance:9.8,now:true,intent:'Session de travail silencieuse cet après-midi',skills:['JS','API','PWA'],place:'La Verrière'},
 {id:'u5',name:'Camille',initials:'CA',role:'Illustratrice',universe:'private',distance:4.7,now:false,intent:'Cherche une table calme deux matinées par semaine',skills:['Illustration','Print','DA'],place:'Jardin de coworking'}
];
const seedThreads = [
 {id:'t1',person:'Lina',initials:'LI',context:{placeId:'p2',slot:'Aujourd’hui 14–17 h'},messages:[
  {me:false,text:'Salut ! Je vais travailler à la médiathèque cet après-midi. Tu veux tester ton app avec moi ?'},
  {me:true,text:'Oui, 14 h 30 me va très bien.'}
 ]},
 {id:'t2',person:'Yann',initials:'YA',context:{placeId:'p3',slot:'Jeudi 15–17 h'},messages:[
  {me:false,text:'Je peux te montrer la CNC jeudi si tu veux.'}
 ]}
];

const state = {
 page:'explore', universe:'all', quickFilter:null, mapFilter:'all', peopleFilter:'all',
 favorites:new Set(JSON.parse(localStorage.getItem(STORAGE.favorites)||'[]')),
 places:JSON.parse(localStorage.getItem(STORAGE.places)||'null') || seedPlaces,
 threads:JSON.parse(localStorage.getItem(STORAGE.threads)||'null') || seedThreads,
 activeThread:null, favoriteOnly:false, publishType:'private-place',
 settings:JSON.parse(localStorage.getItem(STORAGE.settings)||'{"mode":"local","apiUrl":"","token":"","supabaseUrl":"","anonKey":""}'),
 map:null, markers:[], mapReady:false
};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDistance = n => n < 1 ? Math.round(n*1000)+' m' : n.toFixed(1).replace('.',',')+' km';
const freshness = p => p.updatedMins < 90 ? `Mis à jour il y a ${p.updatedMins} min` : (p.updatedMins < 1440 ? `Mis à jour il y a ${Math.round(p.updatedMins/60)} h` : 'Disponibilité à confirmer');
const persist = () => {
 localStorage.setItem(STORAGE.places,JSON.stringify(state.places));
 localStorage.setItem(STORAGE.favorites,JSON.stringify([...state.favorites]));
 localStorage.setItem(STORAGE.threads,JSON.stringify(state.threads));
 localStorage.setItem(STORAGE.settings,JSON.stringify(state.settings));
 if(window.CoworkNetwork){ window.CoworkNetwork.queueSnapshot({places:state.places,threads:state.threads,favorites:[...state.favorites]}).catch(()=>{}); }
};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2400)}
function modal(html){$('#modal').innerHTML=html;$('#modalBackdrop').classList.add('show')}
function closeModal(){ $('#modalBackdrop').classList.remove('show'); $('#modal').innerHTML=''; }
function navigate(page){
 if(!document.querySelector(`[data-page="${page}"]`)) return toast('Page indisponible');
 state.page=page;
 $$('.page').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 $$('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===page));
 if(page==='map') setTimeout(initMap,80);
 if(page==='messages') renderThreads();
 history.replaceState(null,'',`#${page}`);
 window.scrollTo({top:0,behavior:'instant'});
}
function visiblePlaces(){
 const q=$('#globalSearch').value.trim().toLowerCase();
 return state.places.filter(p=>{
  const universeOk = state.universe==='all' || p.universe===state.universe;
  const favOk = !state.favoriteOnly || state.favorites.has(p.id);
  const quickOk = !state.quickFilter ||
    (state.quickFilter==='now' && p.live) ||
    (state.quickFilter==='free' && p.price===0) ||
    (state.quickFilter==='quiet' && p.quiet) ||
    (state.quickFilter==='workshop' && p.kind==='workshop');
  const text = [p.title,p.city,p.desc,p.host,...p.amenities].join(' ').toLowerCase();
  return universeOk && favOk && quickOk && (!q || text.includes(q));
 });
}
function placeCard(p, compact=false){
 const fav=state.favorites.has(p.id);
 return `<article class="card place-card" data-place-card="${p.id}">
   <div class="place-cover ${esc(p.kind)}">
    <span class="place-type">${p.kind==='private'?'Lieu privé':p.kind==='public'?'Lieu public':'Atelier'}</span>
    <button class="favorite ${fav?'on':''}" data-action="favorite" data-id="${p.id}" aria-label="Favori">${fav?'♥':'♡'}</button>
   </div>
   <div class="place-body">
    <div class="title-line"><div><div class="place-title">${esc(p.title)}</div><div class="muted" style="margin-top:4px">${esc(p.city)} · ${fmtDistance(p.distance)}</div></div><div class="rating">★ ${p.rating}</div></div>
    <div class="meta">
      <span class="pill ${p.live?'live':'stale'}">${esc(freshness(p))}</span>
      <span class="pill">${p.price===0?'Gratuit':p.price+' €/j'}</span>
      <span class="pill">${p.capacity} place${p.capacity>1?'s':''}</span>
    </div>
    ${compact?'':`<div class="card-actions"><button class="secondary" data-action="open-place" data-id="${p.id}">Voir la fiche</button><button class="primary" data-action="contact-place" data-id="${p.id}">Contacter</button></div>`}
   </div>
 </article>`;
}
function renderPlaces(){
 const list=visiblePlaces();
 $('#placesGrid').innerHTML=list.length?list.map(p=>placeCard(p)).join(''):`<div class="empty" style="grid-column:1/-1">Aucun résultat avec ces filtres. <button class="ghost" data-action="clear-filters">Réinitialiser</button></div>`;
 $('#nearCount').textContent=state.places.filter(p=>p.distance<=20).length;
 $('#liveCount').textContent=state.places.filter(p=>p.live).length;
 renderMapList();
 refreshMarkers();
}
function renderMapList(){
 const list=state.places.filter(p=>{
   if(state.mapFilter==='all') return true;
   if(state.mapFilter==='public') return p.kind==='public' || p.kind==='workshop';
   if(state.mapFilter==='private') return p.kind==='private';
   if(state.mapFilter==='live') return p.live;
 }).sort((a,b)=>a.distance-b.distance);
 $('#mapList').innerHTML=list.map(p=>placeCard(p,true)).join('');
}
function renderPeople(){
 let list=people.filter(p=>{
  if(state.peopleFilter==='all') return true;
  if(state.peopleFilter==='now') return p.now;
  return p.universe===state.peopleFilter;
 });
 const card=p=>`<article class="card person">
   <div class="person-top"><span class="avatar">${esc(p.initials)}</span><div><h3>${esc(p.name)}</h3><div class="muted">${esc(p.role)} · ${fmtDistance(p.distance)}</div></div></div>
   <div class="availability">${p.now?'● Disponible maintenant':'Disponible plus tard'}</div>
   <p>${esc(p.intent)}</p><div class="skill-list">${p.skills.map(s=>`<span class="pill">${esc(s)}</span>`).join('')}</div>
   <div class="card-actions"><button class="secondary" data-action="open-person" data-id="${p.id}">Profil</button><button class="primary" data-action="contact-person" data-id="${p.id}">Proposer</button></div>
  </article>`;
 $('#peopleGrid').innerHTML=list.map(card).join('');
 $('#peoplePreview').innerHTML=people.filter(p=>p.now).slice(0,3).map(card).join('');
}
function openPlace(id){
 const p=state.places.find(x=>x.id===id); if(!p)return;
 modal(`<div class="modal-head"><div><div class="eyebrow" style="color:var(--purple2)">${p.kind==='private'?'Lieu privé':p.kind==='public'?'Lieu public':'Atelier'}</div><h2>${esc(p.title)}</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
 <div class="detail-hero"></div>
 <div class="detail-grid">
   <div>
    <div class="info-block"><h3>${esc(p.city)} · ${fmtDistance(p.distance)}</h3><p>${esc(p.desc)}</p><div class="meta">${p.amenities.map(a=>`<span class="pill">${esc(a)}</span>`).join('')}</div></div>
    <div class="info-block" style="margin-top:12px"><h3>Règles et confiance</h3><p>${esc(p.rules)}</p><p><b>Disponibilité :</b> ${esc(freshness(p))}</p><p><b>Publié par :</b> ${esc(p.host)}</p></div>
   </div>
   <aside>
    <div class="info-block"><h3>Disponibilités</h3><div class="avail-table">${p.slots.map(s=>`<div class="avail-row"><span>${esc(s)}</span><b>${p.live?'✓':'?'}</b></div>`).join('')}</div><button class="primary" style="width:100%;margin-top:12px" data-action="contact-place" data-id="${p.id}">Contacter</button></div>
   </aside>
 </div>`);
}
function openPerson(id){
 const p=people.find(x=>x.id===id); if(!p)return;
 modal(`<div class="modal-head"><div class="person-top"><span class="avatar">${esc(p.initials)}</span><div><h2>${esc(p.name)}</h2><div class="muted">${esc(p.role)}</div></div></div><button class="icon-btn" data-action="close-modal">×</button></div>
 <div class="info-block"><div class="availability">${p.now?'● Disponible maintenant':'Disponible plus tard'}</div><h3>Ce que ${esc(p.name)} cherche</h3><p>${esc(p.intent)}</p><div class="skill-list">${p.skills.map(s=>`<span class="pill">${esc(s)}</span>`).join('')}</div><p><b>Lieu envisagé :</b> ${esc(p.place)}</p><button class="primary" data-action="contact-person" data-id="${p.id}">Proposer de travailler ensemble</button></div>`);
}
function ensureThreadForPerson(person, context={}){
 let t=state.threads.find(x=>x.person===person.name);
 if(!t){t={id:'t'+Date.now(),person:person.name,initials:person.initials,context,messages:[]};state.threads.unshift(t)}
 state.activeThread=t.id;persist();return t;
}
function contactPerson(id){
 const p=people.find(x=>x.id===id); if(!p)return;
 const place=state.places.find(x=>x.title===p.place);
 const t=ensureThreadForPerson(p,{placeId:place?.id||null,slot:'À préciser'});
 closeModal();navigate('messages');renderThreads();
 toast(`Conversation avec ${p.name} ouverte`);
}
function contactPlace(id){
 const p=state.places.find(x=>x.id===id); if(!p)return;
 let t=state.threads.find(x=>x.context?.placeId===id);
 if(!t){t={id:'t'+Date.now(),person:p.host,initials:p.host.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),context:{placeId:id,slot:p.slots[0]},messages:[]};state.threads.unshift(t)}
 state.activeThread=t.id;persist();closeModal();navigate('messages');renderThreads();
 toast('Le lieu et le créneau ont été joints au message');
}
function renderThreads(){
 const list=$('#threadList');
 list.innerHTML=state.threads.length?state.threads.map(t=>`<button class="thread ${t.id===state.activeThread?'active':''}" data-action="open-thread" data-id="${t.id}" style="width:100%;border:0;background:${t.id===state.activeThread?'#f4eff8':'transparent'};text-align:left">
  <span class="avatar">${esc(t.initials||t.person.slice(0,2).toUpperCase())}</span><span><b>${esc(t.person)}</b><span class="muted" style="display:block;font-size:12px">${esc(t.messages.at(-1)?.text||'Nouvelle conversation')}</span></span>
 </button>`).join(''):`<div class="empty">Aucun message.</div>`;
 renderChat();
}
function renderChat(){
 const t=state.threads.find(x=>x.id===state.activeThread);
 const panel=$('#messagesPanel');
 if(!t){$('#chatHead').textContent='Sélectionnez une conversation';$('#chatBody').innerHTML='<div class="empty">Choisissez un échange.</div>';panel.classList.remove('open-chat');return}
 panel.classList.add('open-chat');
 $('#chatHead').textContent=t.person;
 const p=state.places.find(x=>x.id===t.context?.placeId);
 const ctx=p?`<div class="context-card"><b>${esc(p.title)}</b><div class="muted">${esc(t.context.slot||'Créneau à préciser')} · ${esc(p.city)}</div><button class="ghost" data-action="open-place" data-id="${p.id}">Voir le lieu →</button></div>`:'';
 $('#chatBody').innerHTML=ctx+t.messages.map(m=>`<div class="bubble ${m.me?'me':''}">${esc(m.text)}</div>`).join('');
 $('#chatBody').scrollTop=$('#chatBody').scrollHeight;
}
function initMap(){
 const fallback=$('#mapFallback');
 if(state.mapReady && state.map){ setTimeout(()=>state.map.invalidateSize(),50); return; }
 if(!window.L){fallback.classList.add('show');return}
 try{
  state.map=L.map('map',{zoomControl:false}).setView([47.97,-1.75],10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(state.map);
  L.control.zoom({position:'bottomright'}).addTo(state.map);
  state.mapReady=true;fallback.classList.remove('show');refreshMarkers();
 }catch(e){console.error(e);fallback.classList.add('show')}
}
function refreshMarkers(){
 if(!state.mapReady||!state.map)return;
 state.markers.forEach(m=>m.remove());state.markers=[];
 const list=state.places.filter(p=>{
  if(state.mapFilter==='all') return true;if(state.mapFilter==='private')return p.kind==='private';if(state.mapFilter==='public')return p.kind!=='private';if(state.mapFilter==='live')return p.live;
 });
 list.forEach(p=>{
  const m=L.circleMarker([p.lat,p.lng],{radius:10,color:'#2d185b',weight:3,fillColor:p.live?'#ffd62e':'#fff7e8',fillOpacity:1})
   .addTo(state.map).bindPopup(`<b>${esc(p.title)}</b><br>${esc(p.city)} · ${p.live?'Disponible':'À confirmer'}<br><button onclick="window.CoworkIt.openPlace('${p.id}')" style="margin-top:7px">Voir la fiche</button>`);
  state.markers.push(m);
 });
}
function locateMe(){
 if(!navigator.geolocation) return toast('Géolocalisation non disponible');
 navigator.geolocation.getCurrentPosition(pos=>{
  if(state.mapReady){state.map.setView([pos.coords.latitude,pos.coords.longitude],13);L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:8,color:'#ff4f87',fillColor:'#ff4f87',fillOpacity:1}).addTo(state.map).bindPopup('Vous êtes ici').openPopup()}
  toast('Position mise à jour');
 },()=>toast('Autorisation de localisation refusée ou indisponible'),{timeout:8000});
}
function renderSettings(){
 const s=state.settings;
 modal(`<div class="modal-head"><div><div class="eyebrow" style="color:var(--purple2)">Préparation mise en réseau</div><h2>Paramètres réseau</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
 <div class="info-block"><p>Le mode local garde tout sur cet appareil. Le mode Supabase synchronise les lieux, conversations et favoris avec PostgreSQL via HTTPS.</p>
 <div class="field"><label>Mode</label><select id="netMode"><option value="local" ${s.mode==='local'?'selected':''}>Local / démonstration</option><option value="supabase" ${s.mode==='supabase'?'selected':''}>Supabase / réseau</option><option value="api" ${s.mode==='api'?'selected':''}>API REST générique</option></select></div>
 <div class="field" style="margin-top:10px"><label>URL du service</label><input id="netUrl" value="${esc(s.supabaseUrl||s.apiUrl||'')}" placeholder="https://xxxx.supabase.co"></div>
 <div class="field" style="margin-top:10px"><label>Clé publique anon / jeton de test</label><input id="netToken" type="password" value="${esc(s.anonKey||s.token||'')}" placeholder="Clé publique uniquement"></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="primary" data-action="save-network">Enregistrer</button><button class="secondary" data-action="test-network">Tester la connexion</button><button class="secondary" data-action="sync-now">Synchroniser</button><button class="secondary" data-action="export-data">Exporter mes données</button></div>
 <div id="networkTestResult" class="network-panel-note">La clé service_role ne doit jamais être saisie ici. En production, l’authentification utilisateur remplace le mode anonyme.</div></div>`);
}
async function testNetwork(){
 const mode=$('#netMode')?.value||'local', url=$('#netUrl')?.value.trim(), token=$('#netToken')?.value.trim();
 if(mode==='local') return toast('Mode local : aucune connexion distante requise');
 if(!url)return toast('Renseignez une URL de service');
 toast('Test de connexion…');
 try{
   let result;
   if(window.CoworkNetwork){ result=await window.CoworkNetwork.test({mode,url,token}); }
   else throw new Error('Couche réseau indisponible');
   const n=$('#networkTestResult'); if(n)n.textContent='Connexion réussie : '+result;
   toast('Service joignable ✓');
 }catch(e){const n=$('#networkTestResult');if(n)n.textContent='Échec : '+e.message;toast('Connexion impossible : '+e.message)}
}
function saveNetwork(){
 const mode=$('#netMode').value, url=$('#netUrl').value.trim().replace(/\/$/,''), token=$('#netToken').value.trim();
 state.settings={...state.settings,mode,apiUrl:mode==='api'?url:'',token:mode==='api'?token:'',supabaseUrl:mode==='supabase'?url:'',anonKey:mode==='supabase'?token:''};
 persist(); if(window.CoworkNetwork)window.CoworkNetwork.setConfig(state.settings);updateNetworkBadge();closeModal();toast('Paramètres réseau enregistrés');
}
function updateNetworkBadge(){
 const b=$('#networkBadge');if(!b)return;
 if(state.settings.mode==='supabase'){b.innerHTML='<span class="sync-dot ok"></span>Supabase configuré';b.classList.add('online')}else if(state.settings.mode==='api'){b.innerHTML='<span class="sync-dot ok"></span>API configurée';b.classList.add('online')}else{b.innerHTML='<span class="sync-dot"></span>Mode démo local';b.classList.remove('online')}
}
function exportData(){
 const blob=new Blob([JSON.stringify({version:3,places:state.places,threads:state.threads,favorites:[...state.favorites]},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cowork-it-export.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Export créé');
}
function openProfile(){
 const user=window.CoworkNetwork?.currentUser?.();
 modal(`<div class="modal-head"><h2>Mon profil</h2><button class="icon-btn" data-action="close-modal">×</button></div><div class="info-block"><div class="person-top"><span class="avatar">TC</span><div><h3 style="margin:0">${user?.email?esc(user.email):'Profil Cowork it'}</h3><div class="muted">${user?'Compte réseau connecté':'Mode local / non connecté'}</div></div></div><p>Vos informations publiques, compétences et disponibilité pourront être contrôlées indépendamment de votre localisation précise.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="secondary" data-action="toggle-availability">Changer ma disponibilité</button>${state.settings.mode==='supabase'?(user?'<button class="secondary" data-action="sign-out">Se déconnecter</button>':'<button class="primary" data-action="open-auth">Se connecter / créer un compte</button>'):''}</div></div>`);
}
function openAuth(){
 modal(`<div class="modal-head"><div><div class="eyebrow" style="color:var(--purple2)">Compte réseau</div><h2>Connexion</h2></div><button class="icon-btn" data-action="close-modal">×</button></div><div class="info-block"><div class="field"><label>Email</label><input id="authEmail" type="email" autocomplete="email" placeholder="vous@exemple.fr"></div><div class="field" style="margin-top:10px"><label>Mot de passe</label><input id="authPassword" type="password" autocomplete="current-password" minlength="8"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="primary" data-action="sign-in">Se connecter</button><button class="secondary" data-action="sign-up">Créer le compte</button></div><p id="authStatus" class="network-panel-note">Le mot de passe est envoyé directement au service d’authentification Supabase en HTTPS et n’est pas enregistré par Cowork it.</p></div>`);
}
async function authAction(kind){const email=$('#authEmail')?.value.trim(),pass=$('#authPassword')?.value||'';if(!email||pass.length<8)return toast('Email valide et mot de passe de 8 caractères minimum');const st=$('#authStatus');try{const data=kind==='signup'?await window.CoworkNetwork.signUp(email,pass):await window.CoworkNetwork.signIn(email,pass);if(st)st.textContent=data.access_token?'Compte connecté ✓':'Compte créé. Vérifiez votre email si la confirmation est activée.';toast(kind==='signup'?'Compte créé':'Connexion réussie');if(data.access_token)setTimeout(openProfile,500)}catch(e){if(st)st.textContent='Erreur : '+e.message;toast('Authentification impossible')}}

function handlePublish(e){
 e.preventDefault();const f=e.currentTarget;
 if(!f.reportValidity())return;
 const now=Date.now(), city=$('#pubCity').value.trim();
 const p={id:'p'+now,title:$('#pubTitle').value.trim(),kind:state.publishType==='public-place'?'public':state.publishType==='private-place'?'private':'public',universe:$('#pubUniverse').value,city,lat:47.97+(Math.random()-.5)*.12,lng:-1.75+(Math.random()-.5)*.16,distance:+(3+Math.random()*20).toFixed(1),rating:5,reviews:0,price:Number($('#pubPrice').value||0),capacity:Number($('#pubCapacity').value||1),quiet:false,wifi:true,tools:$('#pubUniverse').value==='artisan',live:true,updatedMins:0,host:'Vous',desc:$('#pubDesc').value.trim(),rules:'Informations publiées par vous. À compléter dans une future édition.',amenities:['Nouveau'],slots:[$('#pubDate').value?'À partir du '+$('#pubDate').value:'Disponible à confirmer']};
 state.places.unshift(p);persist();f.reset();state.publishType='private-place';$('#publishType').value=state.publishType;renderPlaces();navigate('explore');toast('Publication ajoutée au réseau local');
}
function submitChat(e){
 e.preventDefault();const inp=$('#chatInput'),text=inp.value.trim();if(!text||!state.activeThread)return;
 const t=state.threads.find(x=>x.id===state.activeThread);t.messages.push({me:true,text,ts:Date.now()});inp.value='';persist();renderThreads();
}
function clearFilters(){state.universe='all';state.quickFilter=null;state.favoriteOnly=false;$('#globalSearch').value='';$$('[data-universe]').forEach(x=>x.classList.toggle('active',x.dataset.universe==='all'));renderPlaces()}
function runAction(el){
 const a=el.dataset.action;
 if(a==='favorite'){const id=el.dataset.id;state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);persist();renderPlaces();toast(state.favorites.has(id)?'Ajouté aux favoris':'Retiré des favoris')}
 else if(a==='open-place')openPlace(el.dataset.id);
 else if(a==='contact-place')contactPlace(el.dataset.id);
 else if(a==='open-person')openPerson(el.dataset.id);
 else if(a==='contact-person')contactPerson(el.dataset.id);
 else if(a==='close-modal')closeModal();
 else if(a==='open-settings')renderSettings();
 else if(a==='open-profile')openProfile();
 else if(a==='open-auth')openAuth();
 else if(a==='sign-in')authAction('signin');
 else if(a==='sign-up')authAction('signup');
 else if(a==='sign-out'){window.CoworkNetwork?.signOut?.();closeModal();toast('Déconnecté');}
 else if(a==='toggle-favorites'){state.favoriteOnly=!state.favoriteOnly;el.textContent=state.favoriteOnly?'♥':'♡';renderPlaces();toast(state.favoriteOnly?'Favoris uniquement':'Tous les lieux')}
 else if(a==='set-quick-filter'){state.quickFilter=state.quickFilter===el.dataset.filter?null:el.dataset.filter;renderPlaces();toast(state.quickFilter?'Filtre appliqué':'Filtre retiré')}
 else if(a==='clear-filters')clearFilters();
 else if(a==='locate-me')locateMe();
 else if(a==='retry-map'){state.mapReady=false;initMap()}
 else if(a==='open-thread'){state.activeThread=el.dataset.id;renderThreads()}
 else if(a==='back-threads'){$('#messagesPanel').classList.remove('open-chat');state.activeThread=null;renderThreads()}
 else if(a==='toggle-availability'){toast('Votre disponibilité est maintenant visible pendant 4 h');closeModal()}
 else if(a==='save-network')saveNetwork();
 else if(a==='test-network')testNetwork();
 else if(a==='export-data')exportData();
 else if(a==='sync-now'){ if(window.CoworkNetwork)window.CoworkNetwork.flush().then(r=>toast('Synchronisation terminée')).catch(e=>toast('Synchronisation impossible : '+e.message)); }
}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-nav]');if(nav){navigate(nav.dataset.nav);return}
 const act=e.target.closest('[data-action]');if(act){runAction(act);return}
 const u=e.target.closest('[data-universe]');if(u){state.universe=u.dataset.universe;$$('[data-universe]').forEach(x=>x.classList.toggle('active',x===u));renderPlaces();return}
 const mf=e.target.closest('[data-map-filter]');if(mf){state.mapFilter=mf.dataset.mapFilter;$$('[data-map-filter]').forEach(x=>x.classList.toggle('active',x===mf));renderMapList();refreshMarkers();return}
 const pf=e.target.closest('[data-people-filter]');if(pf){state.peopleFilter=pf.dataset.peopleFilter;$$('[data-people-filter]').forEach(x=>x.classList.toggle('active',x===pf));renderPeople();return}
 const pt=e.target.closest('[data-publish-type]');if(pt){state.publishType=pt.dataset.publishType;$('#publishType').value=state.publishType;$$('[data-publish-type]').forEach(x=>x.classList.toggle('active',x===pt));return}
 if(e.target===$('#modalBackdrop'))closeModal();
});
$('#globalSearch').addEventListener('input',renderPlaces);
$('#publishForm').addEventListener('submit',handlePublish);
$('#chatForm').addEventListener('submit',submitChat);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
window.addEventListener('online',()=>toast('Connexion internet rétablie'));
window.addEventListener('offline',()=>toast('Mode hors ligne : vos données locales restent accessibles'));
window.CoworkIt={openPlace,navigate,version:'3.1.0'};
if(window.CoworkNetwork){
 window.CoworkNetwork.setConfig(state.settings);
 window.addEventListener('online',()=>window.CoworkNetwork.flush().catch(()=>{}));
}
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW',err)));
}
let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;const b=document.getElementById('installBanner');if(b)b.classList.add('show')});
window.addEventListener('appinstalled',()=>{const b=document.getElementById('installBanner');if(b)b.classList.remove('show');toast('Cowork it est installé ✓')});


const hash=location.hash.replace('#','');if(['explore','map','publish','people','messages'].includes(hash))state.page=hash;
renderPlaces();renderPeople();updateNetworkBadge();navigate(state.page);
})();

document.addEventListener('click',async e=>{
 if(e.target?.id==='installAppBtn'){ if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;document.getElementById('installBanner')?.classList.remove('show')} }
 if(e.target?.id==='dismissInstallBtn')document.getElementById('installBanner')?.classList.remove('show');
});
