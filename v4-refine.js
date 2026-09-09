(()=>{
'use strict';
const LOGO='./icons/icon.svg';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function injectStyle(){
 if(document.getElementById('cowork-v4-refine-style'))return;
 const s=document.createElement('style');s.id='cowork-v4-refine-style';s.textContent=`
 .ci-splash{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#120d24;color:#fff;transition:opacity .55s ease,visibility .55s ease}.ci-splash.hide{opacity:0;visibility:hidden}.ci-splash-inner{display:grid;place-items:center;gap:18px}.ci-splash-logo{width:104px;height:104px;filter:drop-shadow(0 20px 46px rgba(0,0,0,.28));animation:ciSplashLogo 1.35s cubic-bezier(.2,.8,.2,1) both}.ci-splash-word{font-size:24px;font-weight:900;letter-spacing:-.04em;opacity:0;animation:ciSplashWord .8s .38s ease forwards}.ci-splash-line{width:38px;height:4px;border-radius:99px;background:#ffd62e;transform-origin:left;animation:ciSplashLine .9s .48s ease both}@keyframes ciSplashLogo{0%{opacity:0;transform:scale(.72) rotate(-8deg)}55%{opacity:1;transform:scale(1.08) rotate(2deg)}100%{transform:scale(1) rotate(0)}}@keyframes ciSplashWord{to{opacity:1}}@keyframes ciSplashLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}
 .brand .logo{background:transparent!important;padding:0!important;overflow:hidden}.brand .logo img{width:100%;height:100%;display:block}.ci-home-min{min-height:calc(100vh - 150px);display:grid;align-content:center;max-width:900px;margin:0 auto;padding:26px 0 80px}.ci-home-min .ci-home-kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:900;color:#6f54a2;margin-bottom:12px}.ci-home-min h1{font-size:clamp(38px,7vw,72px);line-height:.95;letter-spacing:-.065em;margin:0 0 28px;max-width:760px}.ci-home-search{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid rgba(45,24,91,.18);border-radius:24px;padding:10px 10px 10px 18px;box-shadow:0 18px 44px rgba(45,24,91,.1)}.ci-home-search .search-icon{font-size:24px}.ci-home-search input{flex:1;border:0;outline:0;background:transparent;font-size:16px;min-width:0;padding:10px 0}.ci-home-search button{border:0;background:#ffd62e;color:#2d185b;border-radius:16px;padding:13px 18px;font-weight:900}.ci-home-intents{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px}.ci-home-intent{min-height:154px;border:1px solid rgba(45,24,91,.16);border-radius:24px;padding:18px;text-align:left;background:#fff;color:#2d185b;position:relative;overflow:hidden;transition:transform .18s ease,box-shadow .18s ease}.ci-home-intent:before{content:'';position:absolute;inset:auto -28px -42px auto;width:110px;height:110px;border-radius:50%;background:var(--wash,rgba(111,84,162,.12))}.ci-home-intent:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(45,24,91,.1)}.ci-home-intent .icon{font-size:28px}.ci-home-intent b{display:block;font-size:18px;margin-top:26px}.ci-home-intent small{display:block;color:#706780;margin-top:4px}.ci-home-intent.work{--wash:rgba(109,40,217,.16)}.ci-home-intent.make{--wash:rgba(232,54,125,.16)}.ci-home-intent.meet{--wash:rgba(255,214,46,.3)}.ci-home-intent.offer{--wash:rgba(25,128,61,.14)}
 #page-explore .v4-context,#page-explore .chip,#page-explore .secondary,#page-explore .ghost{border-color:rgba(45,24,91,.30)!important;background:#fff!important;color:#281449!important;box-shadow:0 2px 0 rgba(45,24,91,.04)}#page-explore .v4-context:hover,#page-explore .chip:hover,#page-explore .secondary:hover{background:#f0e7ff!important;border-color:#6d28d9!important}#page-explore .chip.active{background:#34145f!important;color:#fff!important;border-color:#34145f!important}#page-explore .v4-explore-search{border-color:rgba(45,24,91,.26)!important;box-shadow:0 8px 22px rgba(45,24,91,.08)}
 #page-people .person{position:relative;border:1px solid rgba(45,24,91,.16);overflow:hidden}#page-people .person .ci-match-logo{position:absolute;right:14px;top:14px;width:34px;height:34px;border-radius:10px;padding:5px;background:#fff;border:1px solid rgba(45,24,91,.12);box-shadow:0 5px 16px rgba(45,24,91,.08)}#page-people .person .person-top{padding-right:50px}#page-people .person .muted{font-weight:850;color:#2d185b!important}#page-people .ci-prof{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}#page-people .ci-prof-item{border-radius:14px;padding:10px 11px;background:#f5efff;border:1px solid rgba(109,40,217,.15)}#page-people .ci-prof-item small{display:block;color:#7b6e8c;font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:850;margin-bottom:4px}#page-people .ci-prof-item b{font-size:13px;color:#2d185b}#page-people .person [data-action="contact-person"]{background:#ffd62e!important;color:#2d185b!important;border-color:#ffd62e!important}#page-people .person .availability{font-weight:800}
 @media(max-width:760px){.ci-home-min{min-height:calc(100vh - 126px);padding:8px 0 90px}.ci-home-min h1{font-size:43px;margin-bottom:22px}.ci-home-intents{grid-template-columns:1fr 1fr}.ci-home-intent{min-height:135px;padding:16px}.ci-home-intent b{margin-top:18px}.ci-home-search{border-radius:20px}.ci-home-search button{padding:12px 14px}.ci-splash-logo{width:86px;height:86px}#page-people .ci-prof{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}
function splash(){
 if(document.querySelector('.ci-splash'))return;
 const el=document.createElement('div');el.className='ci-splash';el.innerHTML=`<div class="ci-splash-inner"><img class="ci-splash-logo" src="${LOGO}" alt="Cowork it"><div class="ci-splash-word">Cowork it</div><div class="ci-splash-line"></div></div>`;document.body.appendChild(el);setTimeout(()=>el.classList.add('hide'),1550);setTimeout(()=>el.remove(),2200);
}
function brand(){document.querySelectorAll('.brand .logo').forEach(el=>{if(!el.querySelector('img'))el.innerHTML=`<img src="${LOGO}" alt="Cowork it">`})}
function home(){
 const page=document.getElementById('page-home');if(!page||page.dataset.refined==='1')return;
 page.dataset.refined='1';page.innerHTML=`<div class="ci-home-min"><div class="ci-home-kicker">Cowork it · une envie, une situation de travail</div><h1>Qu’est-ce qu’on fait aujourd’hui ?</h1><div class="ci-home-search"><span class="search-icon">⌕</span><input id="ciHomeSearch" placeholder="Décris ton envie… ex. calme, Wi‑Fi, atelier, rencontres"><button type="button" data-ci-home-search>Explorer</button></div><div class="ci-home-intents"><button class="ci-home-intent work" data-ci-query="calme wifi"><span class="icon">⌘</span><b>Travailler</b><small>Un lieu adapté</small></button><button class="ci-home-intent make" data-ci-query="atelier fablab"><span class="icon">✦</span><b>Fabriquer</b><small>Atelier, matériel</small></button><button class="ci-home-intent meet" data-nav="people"><span class="icon">◎</span><b>Rencontrer</b><small>Profils et activités</small></button><button class="ci-home-intent offer" data-nav="publish"><span class="icon">＋</span><b>Proposer</b><small>Lieu, aide, compétence</small></button></div></div>`;
}
function categoryFor(placeName){
 let ps=[];try{ps=JSON.parse(localStorage.getItem('coworkit3_places')||'[]')}catch{}
 const p=ps.find(x=>x.title===placeName);if(!p)return 'Lieu à préciser';
 if(p.placeType==='library'||/médiath|biblioth/i.test(p.title||''))return 'Médiathèque / bibliothèque';
 if(p.placeType==='coworking'||/cowork/i.test(p.title||''))return 'Coworking';
 if(p.placeType==='workshop'||p.kind==='workshop')return 'Atelier / fablab';
 if(p.placeType==='cafe'||/café|cafe|bar/i.test(p.title||''))return 'Café / bar';
 if(p.kind==='private')return 'Lieu privé';
 return 'Tiers-lieu / collectif';
}
const peopleMeta=[
 {name:'Lina',role:'Designer UX',place:'Médiathèque — espace travail'},
 {name:'Yann',role:'Menuisier / maker',place:'Atelier partagé des Forges'},
 {name:'Sarah',role:'Chargée de projet associatif',place:'Café des Ateliers'},
 {name:'Noé',role:'Développeur web',place:'La Verrière'},
 {name:'Camille',role:'Illustratrice',place:'Jardin de coworking'}
];
function encounters(){
 const cards=[...document.querySelectorAll('#page-people .person')];
 cards.forEach(card=>{
   const name=card.querySelector('h3')?.textContent?.trim();const meta=peopleMeta.find(p=>p.name===name);if(!meta)return;
   card.querySelectorAll('button,.favorite').forEach(x=>{if(/[♡♥❤]/.test(x.textContent||''))x.innerHTML=`<img src="${LOGO}" alt="Cowork it" style="width:22px;height:22px">`});
   if(!card.querySelector('.ci-match-logo'))card.insertAdjacentHTML('afterbegin',`<img class="ci-match-logo" src="${LOGO}" alt="Cowork it">`);
   if(!card.querySelector('.ci-prof')){
     const availability=card.querySelector('.availability');
     availability?.insertAdjacentHTML('beforebegin',`<div class="ci-prof"><div class="ci-prof-item"><small>Activité professionnelle</small><b>${esc(meta.role)}</b></div><div class="ci-prof-item"><small>Lieu recherché</small><b>${esc(categoryFor(meta.place))}</b></div></div>`);
   }
 });
}
function wire(){
 document.addEventListener('click',e=>{
   const q=e.target.closest('[data-ci-query]');if(q){const g=document.getElementById('globalSearch');if(g){g.value=q.dataset.ciQuery;g.dispatchEvent(new Event('input',{bubbles:true}))}window.CoworkIt?.navigate?.('explore');return}
   const s=e.target.closest('[data-ci-home-search]');if(s){const v=document.getElementById('ciHomeSearch')?.value?.trim()||'';const g=document.getElementById('globalSearch');if(g){g.value=v;g.dispatchEvent(new Event('input',{bubbles:true}))}window.CoworkIt?.navigate?.('explore');}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='ciHomeSearch')document.querySelector('[data-ci-home-search]')?.click()});
}
function apply(){brand();home();encounters()}
function boot(){injectStyle();splash();wire();let tries=0;const t=setInterval(()=>{apply();if(++tries>40)clearInterval(t)},150);const obs=new MutationObserver(()=>requestAnimationFrame(apply));obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>apply(),0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
