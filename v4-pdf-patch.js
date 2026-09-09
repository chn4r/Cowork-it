(()=>{
'use strict';
const LOGO='./icons/icon.svg';
const css=`
/* Accueil : conserver uniquement identité, recherche et 4 envies */
#page-home .ci-home-min{max-width:760px!important;align-content:center!important;gap:0!important}
#page-home .ci-home-kicker{display:none!important}
#page-home .ci-home-brand{display:grid;place-items:center;margin:0 0 22px}
#page-home .ci-home-brand img{width:148px;max-height:142px;object-fit:contain}
#page-home .ci-home-min h1{font-size:clamp(25px,5vw,38px)!important;line-height:1.05!important;text-align:center!important;letter-spacing:-.045em!important;margin:0 0 20px!important}
#page-home .ci-home-search{margin:0 auto;width:100%;max-width:650px}
#page-home .ci-home-intents{width:100%;max-width:650px;margin:14px auto 0!important}
/* Explorer : contraste des contrôles renforcé d'environ 20 % */
#page-explore .v4-context,#page-explore .chip,#page-explore .secondary,#page-explore .ghost{border-color:rgba(45,24,91,.42)!important;color:#1e0d3e!important;font-weight:850!important;box-shadow:0 2px 0 rgba(45,24,91,.08)!important}
#page-explore .v4-context:hover,#page-explore .chip:hover,#page-explore .secondary:hover{background:#e9dcff!important;border-color:#5520b4!important}
#page-explore .chip.active{background:#2b0d55!important;color:#fff!important;border-color:#2b0d55!important}
/* Rencontres : aucune métaphore coeur ; activité et lieu recherchés prioritaires */
#page-people .ci-prof{margin:10px 0 12px!important}
#page-people .ci-prof-item{background:#eee5ff!important;border-color:rgba(77,30,145,.28)!important;padding:12px!important}
#page-people .ci-prof-item small{color:#655477!important;font-weight:900!important}
#page-people .ci-prof-item b{font-size:14px!important;font-weight:900!important}
#page-people [data-action="contact-person"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important}
#page-people [data-action="contact-person"] img{width:24px;height:24px;object-fit:contain}
@media(max-width:760px){#page-home .ci-home-brand img{width:124px;max-height:118px}#page-home .ci-home-min h1{font-size:28px!important}.ci-home-intents{grid-template-columns:1fr 1fr!important}}
`;
function style(){if(document.getElementById('pdf-ui-patch'))return;const s=document.createElement('style');s.id='pdf-ui-patch';s.textContent=css;document.head.appendChild(s)}
function home(){const p=document.getElementById('page-home');const box=p?.querySelector('.ci-home-min');if(!box)return;if(!box.querySelector('.ci-home-brand'))box.insertAdjacentHTML('afterbegin',`<div class="ci-home-brand"><img src="${LOGO}" alt="Cowork it — Shared Spaces"></div>`)}
function people(){document.querySelectorAll('#page-people .person').forEach(card=>{
 card.querySelectorAll('button,.favorite').forEach(el=>{if(/[♡♥❤]/.test(el.textContent||''))el.innerHTML=`<img src="${LOGO}" alt="Cowork it">`});
 const items=card.querySelectorAll('.ci-prof-item small');if(items[0])items[0].textContent='Activité professionnelle';if(items[1])items[1].textContent='Catégorie de lieu recherchée';
 const contact=card.querySelector('[data-action="contact-person"]');if(contact&&!contact.querySelector('img'))contact.innerHTML=`<img src="${LOGO}" alt="">Se connecter`;
});}
function apply(){style();home();people()}
function boot(){apply();let n=0;const t=setInterval(()=>{apply();if(++n>35)clearInterval(t)},160);new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
