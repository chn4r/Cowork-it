(()=>{
'use strict';
const KEY='coworkit3_places';
const TYPES={
 all:{label:'Tous',icon:'◎'},library:{label:'Médiathèques',icon:'📚'},coworking:{label:'Coworkings',icon:'💼'},third_place:{label:'Tiers-lieux',icon:'🌱'},workshop:{label:'Ateliers / fablabs',icon:'🛠'},cafe:{label:'Cafés / bars',icon:'☕'},private:{label:'Lieux privés',icon:'🏠'}
};
let active='all';
const places=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const placeType=p=>p.placeType || (p.kind==='workshop'?'workshop':p.kind==='private'?'private':'library');
const byId=()=>new Map(places().map(p=>[p.id,p]));
function injectStyle(){
 if(document.getElementById('cowork-map-ui-style'))return;
 const s=document.createElement('style');s.id='cowork-map-ui-style';s.textContent=`
 .cowork-type-filters{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}
 .cowork-type-filters .chip{white-space:nowrap}
 .cowork-place-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:5px 8px;border-radius:999px;background:rgba(38,21,77,.08);margin:0 0 8px}
 .leaflet-marker-icon.cowork-marker-library{filter:hue-rotate(190deg) saturate(1.2)}
 .leaflet-marker-icon.cowork-marker-coworking{filter:hue-rotate(265deg) saturate(1.25)}
 .leaflet-marker-icon.cowork-marker-third_place{filter:hue-rotate(70deg) saturate(1.15)}
 .leaflet-marker-icon.cowork-marker-workshop{filter:hue-rotate(15deg) saturate(1.25)}
 .leaflet-marker-icon.cowork-marker-cafe{filter:hue-rotate(330deg) saturate(1.1)}
 .leaflet-marker-icon.cowork-marker-private{filter:hue-rotate(300deg) saturate(.85)}
 .cowork-map-legend{position:absolute;left:12px;bottom:14px;z-index:500;background:rgba(255,255,255,.96);border-radius:14px;padding:8px 10px;box-shadow:0 8px 24px rgba(0,0,0,.12);font-size:11px;display:flex;gap:9px;flex-wrap:wrap;max-width:calc(100% - 24px)}
 .cowork-map-legend span{white-space:nowrap}
 `;document.head.appendChild(s);
}
function filtersHtml(){return Object.entries(TYPES).map(([k,v])=>`<button class="chip ${k===active?'active':''}" type="button" data-cowork-type="${k}">${v.icon} ${v.label}</button>`).join('')}
function ensureFilters(){
 const mapTools=document.querySelector('#page-map .map-tools');
 if(mapTools&&!document.getElementById('coworkTypeFiltersMap')){const box=document.createElement('div');box.id='coworkTypeFiltersMap';box.className='cowork-type-filters';box.innerHTML=filtersHtml();mapTools.insertAdjacentElement('afterend',box)}
 const grid=document.getElementById('placesGrid');
 if(grid&&!document.getElementById('coworkTypeFiltersExplore')){const box=document.createElement('div');box.id='coworkTypeFiltersExplore';box.className='cowork-type-filters';box.innerHTML=filtersHtml();grid.insertAdjacentElement('beforebegin',box)}
}
function matches(p){return active==='all'||placeType(p)===active}
function decorateCards(){
 const map=byId();
 document.querySelectorAll('[data-place-card]').forEach(card=>{const p=map.get(card.dataset.placeCard);if(!p)return;const t=placeType(p),meta=TYPES[t]||TYPES.private;card.style.display=matches(p)?'':'';if(!card.querySelector('.cowork-place-badge')){const body=card.querySelector('.place-body');if(body){const b=document.createElement('div');b.className='cowork-place-badge';b.textContent=`${meta.icon} ${meta.label}`;body.insertBefore(b,body.firstChild)}}});
}
function decorateMarkers(){
 const ps=places().filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
 const icons=[...document.querySelectorAll('#map .leaflet-marker-icon')];
 icons.forEach((el,i)=>{const p=ps[i];if(!p)return;const t=placeType(p);el.classList.remove(...[...el.classList].filter(c=>c.startsWith('cowork-marker-')));el.classList.add(`cowork-marker-${t}`);el.style.display=matches(p)?'':'none'});
 const wrap=document.querySelector('.map-wrap');
 if(wrap&&!wrap.querySelector('.cowork-map-legend')){const l=document.createElement('div');l.className='cowork-map-legend';l.innerHTML=['library','coworking','third_place','workshop','cafe','private'].map(k=>`<span>${TYPES[k].icon} ${TYPES[k].label}</span>`).join('');wrap.appendChild(l)}
}
function syncButtons(){document.querySelectorAll('[data-cowork-type]').forEach(b=>b.classList.toggle('active',b.dataset.coworkType===active))}
function apply(){ensureFilters();syncButtons();decorateCards();decorateMarkers();document.title='Cowork it 3.6 — Carte & réseau';}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cowork-type]');if(!b)return;active=b.dataset.coworkType;syncButtons();apply()});
window.addEventListener('load',()=>{injectStyle();apply();const obs=new MutationObserver(()=>apply());['placesGrid','mapList','map'].forEach(id=>{const n=document.getElementById(id);if(n)obs.observe(n,{childList:true,subtree:true})});setInterval(apply,2500)});
})();
