(()=>{
'use strict';
const places=[
{title:'Café Cortado',city:'Rennes',kind:'cafe',desc:'Café · Bon Wi‑Fi · Prises',distance:'1,2 km',open:'Ouvert jusqu’à 19h',rating:'4,3'},
{title:'Le 360',city:'Rennes',kind:'cowork',desc:'Coworking · Fibre · Salles',distance:'2,6 km',open:'10 €/jour',rating:'4,8'},
{title:'Makerspace Rennes',city:'Rennes',kind:'maker',desc:'Atelier · Outils · Entraide',distance:'3,1 km',open:'Ouvert',rating:'4,6'},
{title:'Médiathèque',city:'Guichen',kind:'library',desc:'Silence · Wi‑Fi · Prises',distance:'7 min',open:'Ouvert jusqu’à 18h',rating:'4,7'}];
function go(page){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.dataset.page===page));document.querySelectorAll('.nav [data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go===page));if(page==='map')setTimeout(()=>window.dispatchEvent(new Event('cowork-map-open')),60);window.scrollTo(0,0)}
function renderPlaces(){const box=document.getElementById('places');if(!box)return;box.innerHTML=places.map(p=>`<article class="place"><div class="thumb ${p.kind}"></div><div><button class="logoFav"><img src="./icons/icon.svg"></button><h3>${p.title}</h3><div class="desc">${p.desc}</div><div class="row"><span>${p.distance} · <span class="open">${p.open}</span></span><span class="star">★ ${p.rating}</span></div></div></article>`).join('')}
function boot(){setTimeout(()=>document.getElementById('splash')?.classList.add('hide'),1450);renderPlaces();document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});const hs=document.getElementById('homeSearch');hs?.addEventListener('keydown',e=>{if(e.key==='Enter')go('explore')});}
window.CoworkV5={go};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();