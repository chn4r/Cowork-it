(()=>{
'use strict';
const KEY='coworkit3_places';
const TYPES={
 all:{label:'Tous',icon:'◎'},
 library:{label:'Médiathèques',icon:'📚'},
 coworking:{label:'Coworkings',icon:'💼'},
 third_place:{label:'Tiers-lieux',icon:'🌱'},
 workshop:{label:'Ateliers / fablabs',icon:'🛠'},
 cafe:{label:'Cafés / bars',icon:'☕'},
 private:{label:'Lieux privés',icon:'🏠'}
};
let active='all';
const places=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const placeType=p=>{
 if(p.placeType&&TYPES[p.placeType])return p.placeType;
 if(p.kind==='workshop')return 'workshop';
 if(p.kind==='private')return 'private';
 const text=[p.title,p.desc,p.host,...(p.amenities||[])].join(' ').toLowerCase();
 if(/médiath|biblioth/.test(text))return 'library';
 if(/cowork/.test(text))return 'coworking';
 if(/tiers[- ]?lieu|community|collectif|associatif/.test(text))return 'third_place';
 if(/café|cafe|bar/.test(text))return 'cafe';
 return 'third_place';
};
const byId=()=>new Map(places().map(p=>[p.id,p]));
function injectStyle(){
 if(document.getElementById('cowork-map-ui-style'))return;
 const s=document.createElement('style');s.id='cowork-map-ui-style';s.textContent=`
 .cowork-type-filters{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}
 .cowork-type-filters .chip{white-space:nowrap}
 .cowork-place-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:5px 8px;border-radius:999px;background:rgba(38,21,77,.08);margin:0 0 8px}
 .cowork-map-legend{position:absolute;left:12px;bottom:14px;z-index:500;background:rgba(255,255,255,.96);border-radius:14px;padding:8px 10px;box-shadow:0 8px 24px rgba(0,0,0,.12);font-size:11px;display:flex;gap:9px;flex-wrap:wrap;max-width:calc(100% - 24px)}
 .cowork-map-legend span{white-space:nowrap}
 .cowork-empty-type{padding:20px;border-radius:16px;background:#fff7e8;color:#4d3d66;text-align:center}
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
 const map=byId();let visibleExplore=0,visibleMap=0;
 document.querySelectorAll('[data-place-card]').forEach(card=>{
  const p=map.get(card.dataset.placeCard);if(!p)return;
  const t=placeType(p),meta=TYPES[t]||TYPES.third_place,show=matches(p);
  card.style.display=show?'':'none';
  if(show){if(card.closest('#placesGrid'))visibleExplore++;if(card.closest('#mapList'))visibleMap++;}
  let b=card.querySelector('.cowork-place-badge');
  if(!b){const body=card.querySelector('.place-body');if(body){b=document.createElement('div');b.className='cowork-place-badge';body.insertBefore(b,body.firstChild)}}
  if(b)b.textContent=`${meta.icon} ${meta.label}`;
 });
 const label=TYPES[active]?.label||'cette catégorie';
 const grid=document.getElementById('placesGrid');
 let empty=document.getElementById('coworkExploreEmpty');
 if(grid){if(active!=='all'&&visibleExplore===0){if(!empty){empty=document.createElement('div');empty.id='coworkExploreEmpty';empty.className='cowork-empty-type';grid.insertAdjacentElement('beforebegin',empty)}empty.textContent=`Aucun lieu « ${label} » chargé pour le moment.`}else empty?.remove()}
 const mapList=document.getElementById('mapList');
 let mapEmpty=document.getElementById('coworkMapEmpty');
 if(mapList){if(active!=='all'&&visibleMap===0){if(!mapEmpty){mapEmpty=document.createElement('div');mapEmpty.id='coworkMapEmpty';mapEmpty.className='cowork-empty-type';mapList.appendChild(mapEmpty)}mapEmpty.textContent=`Aucun lieu « ${label} » chargé sur cette zone.`}else mapEmpty?.remove()}
}
function decorateMarkers(){
 const ps=places().filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
 const paths=[...document.querySelectorAll('#map .leaflet-overlay-pane path.leaflet-interactive')];
 paths.forEach((el,i)=>{
  const p=ps[i];if(!p)return;
  const t=placeType(p),show=matches(p);
  el.style.display=show?'':'none';
  const palette={library:'#2563eb',coworking:'#6d28d9',third_place:'#15803d',workshop:'#c2410c',cafe:'#b45309',private:'#be185d'};
  const c=palette[t]||'#2d185b';el.setAttribute('stroke',c);el.setAttribute('fill',show?c:'#fff7e8');el.setAttribute('fill-opacity',show?'0.82':'0');
 });
 const wrap=document.querySelector('.map-wrap');
 if(wrap&&!wrap.querySelector('.cowork-map-legend')){const l=document.createElement('div');l.className='cowork-map-legend';l.innerHTML=['library','coworking','third_place','workshop','cafe','private'].map(k=>`<span>${TYPES[k].icon} ${TYPES[k].label}</span>`).join('');wrap.appendChild(l)}
}
function syncButtons(){document.querySelectorAll('[data-cowork-type]').forEach(b=>b.classList.toggle('active',b.dataset.coworkType===active))}
function apply(){ensureFilters();syncButtons();decorateCards();decorateMarkers();document.title='Cowork it 3.7 — Carte mondiale';}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cowork-type]');if(!b)return;active=b.dataset.coworkType;syncButtons();requestAnimationFrame(apply)});
window.addEventListener('load',()=>{
 injectStyle();apply();
 const obs=new MutationObserver(()=>requestAnimationFrame(apply));
 ['placesGrid','mapList','map'].forEach(id=>{const n=document.getElementById(id);if(n)obs.observe(n,{childList:true,subtree:true})});
 setInterval(apply,1500);
 if(!document.querySelector('script[data-world-map-engine]')){const s=document.createElement('script');s.src='./world-map.js';s.defer=true;s.dataset.worldMapEngine='1';document.body.appendChild(s)}
});
window.CoworkMapUI={apply,get active(){return active}};
})();
