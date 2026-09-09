(()=>{
'use strict';
const places=[
{title:'Café Cortado',city:'Rennes',kind:'cafe',group:'work',desc:'Café · Bon Wi‑Fi · Prises',distance:'1,2 km',open:'Ouvert jusqu’à 19h',rating:'4,3'},
{title:'Le 360',city:'Rennes',kind:'cowork',group:'work',desc:'Coworking · Fibre · Salles',distance:'2,6 km',open:'10 €/jour',rating:'4,8'},
{title:'Médiathèque',city:'Guichen',kind:'library',group:'work',desc:'Lieu public · Silence · Wi‑Fi · Prises',distance:'7 min',open:'Ouvert jusqu’à 18h',rating:'4,7'},
{title:'Espace proposé Cowork it',city:'Saint-Senoux',kind:'cowork',group:'work',desc:'Espace proposé · Bureau · Wi‑Fi',distance:'12 km',open:'Sur réservation',rating:'4,8'},
{title:'Bar / café connecté',city:'Rennes',kind:'cafe',group:'work',desc:'Bar · Café · Wi‑Fi · Tables',distance:'2,1 km',open:'Ouvert',rating:'4,4'},
{title:'Makerspace Rennes',city:'Rennes',kind:'maker',group:'make',desc:'Atelier · Outils · Entraide',distance:'3,1 km',open:'Ouvert',rating:'4,6'},
{title:'Atelier partagé des Forges',city:'Bruz',kind:'maker',group:'make',desc:'Atelier partagé · Machines · Établis',distance:'8 km',open:'Sur réservation',rating:'4,8'},
{title:'Tiers-lieu créatif',city:'Rennes',kind:'maker',group:'make',desc:'Tiers-lieu · Création · Prototypage',distance:'4,2 km',open:'Ouvert',rating:'4,7'},
{title:'Atelier en entreprise',city:'Cesson-Sévigné',kind:'maker',group:'make',desc:'Entreprise · Atelier · Matériel partagé',distance:'7,4 km',open:'Créneaux disponibles',rating:'4,5'}];
let exploreMode='all';
function go(page){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.dataset.page===page));document.querySelectorAll('.nav [data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go===page));if(page==='map')setTimeout(()=>window.dispatchEvent(new Event('cowork-map-open')),60);window.scrollTo(0,0)}
function renderPlaces(){const box=document.getElementById('places');if(!box)return;const list=exploreMode==='all'?places:places.filter(p=>p.group===exploreMode);box.innerHTML=list.map(p=>`<article class="place"><div class="thumb ${p.kind}"></div><div><button class="logoFav"><img src="./icons/icon.svg"></button><h3>${p.title}</h3><div class="desc">${p.desc}</div><div class="row"><span>${p.distance} · <span class="open">${p.open}</span></span><span class="star">★ ${p.rating}</span></div></div></article>`).join('')}
function openExplore(mode){exploreMode=mode;go('explore');renderPlaces();const input=document.getElementById('exploreSearch');if(input)input.placeholder=mode==='work'?'Ordinateur, coworking, lieu public, café, bar…':mode==='make'?'Atelier, entreprise, tiers-lieu de création…':'Lieu, besoin, activité ou personne'}
function boot(){setTimeout(()=>document.getElementById('splash')?.classList.add('hide'),1450);renderPlaces();document.addEventListener('click',e=>{const action=e.target.closest('.action.work,.action.make');if(action){openExplore(action.classList.contains('work')?'work':'make');return}const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});const hs=document.getElementById('homeSearch');hs?.addEventListener('keydown',e=>{if(e.key==='Enter'){exploreMode='all';go('explore');renderPlaces()}});}
window.CoworkV5={go,openExplore};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();