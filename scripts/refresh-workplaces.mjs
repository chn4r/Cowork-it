import fs from 'node:fs/promises';

const ORIGIN={lat:47.9057,lng:-1.7889};
const km=(a,b,c,d)=>{const R=6371,p=Math.PI/180,aa=Math.sin((c-a)*p/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin((d-b)*p/2)**2;return R*2*Math.atan2(Math.sqrt(aa),Math.sqrt(1-aa));};
const today=new Date().toISOString().slice(0,10);

const curated=[
 {id:'cw-steriad',title:'Le Steriad — La Cabine',kind:'private',universe:'computer',city:'Bain-de-Bretagne',lat:47.843,lng:-1.6856,address:'2 allée de l’Ille',price:10,wifi:true,quiet:true,capacity:20,placeType:'coworking',website:'https://entreprendre.bretagneportedeloire.fr/le-steriad-espace-de-coworking-et-bureaux/',amenities:['Coworking','Fibre','Wi‑Fi','Cafétéria','Imprimante','Casier'],desc:'Espace de coworking, bureaux partagés et salles professionnelles.',source:'Bretagne Porte de Loire Communauté'},
 {id:'cw-bcoworker-bruz',title:'B’CoWorker Bruz',kind:'private',universe:'computer',city:'Bruz',lat:48.024,lng:-1.747,price:0,wifi:true,quiet:true,capacity:50,placeType:'coworking',website:'https://www.rennes-congres.fr/magazine/conseils-bureau-des-congres/lieux-coworking/',amenities:['Coworking','Bureaux','Salles de réunion'],desc:'Environ 850 m² d’espaces de coworking, bureaux et salles de réunion.',source:'Bureau des Congrès de Rennes'},
 {id:'cw-alizes-cesson',title:'Alizés Coworking Premium',kind:'private',universe:'computer',city:'Cesson-Sévigné',lat:48.1128,lng:-1.603,price:0,wifi:true,quiet:true,capacity:30,placeType:'coworking',website:'https://www.rennes-congres.fr/magazine/conseils-bureau-des-congres/lieux-cowing/',amenities:['Coworking','Bureaux','Salles de réunion'],desc:'Coworking premium à Cesson-Sévigné.',source:'Bureau des Congrès de Rennes'},
 {id:'cw-avenir-gho',title:'L’Avenir at GHO',kind:'private',universe:'computer',city:'Rennes',lat:48.115,lng:-1.66,price:0,wifi:true,quiet:true,capacity:30,placeType:'coworking',website:'https://www.rennes-congres.fr/magazine/conseils-bureau-des-congres/lieux-coworking/',amenities:['Coworking','Bureaux sécurisés','Réunion','Séminaire'],desc:'Bureaux partagés fermés et sécurisés, réunions et séminaires, quartier Oberthur/Thabor.',source:'Bureau des Congrès de Rennes'},
 {id:'tl-lavoir-rennes',title:'Le Lavoir — Ateliers réunis',kind:'workshop',universe:'artisan',city:'Rennes',lat:48.1058,lng:-1.674,price:0,wifi:true,quiet:true,capacity:30,placeType:'third_place',website:'https://rennes-coworking.com/',amenities:['Coworking','Ateliers d’artistes','Création','Centre-ville'],desc:'Coworking inséré dans un lieu de partage, de vie et de création avec ateliers d’artistes.',source:'Rennes Coworking'},
 {id:'tl-edulab',title:'EduLab — Rennes 2',kind:'workshop',universe:'artisan',city:'Rennes',lat:48.118,lng:-1.702,price:0,wifi:true,quiet:false,capacity:20,placeType:'workshop',website:'https://www.univ-rennes2.fr/campus/tiers-lieux',amenities:['Tiers-lieu','Fablab','Apprentissage','Fabrication numérique'],desc:'Tiers-lieu d’apprentissage et de fabrication numérique de l’Université Rennes 2.',source:'Université Rennes 2'},
 {id:'tl-ess-cargo',title:'ESS Cargo & Cie',kind:'public',universe:'association',city:'Rennes',lat:48.119,lng:-1.704,price:0,wifi:true,quiet:false,capacity:30,placeType:'third_place',website:'https://www.univ-rennes2.fr/campus/tiers-lieux',amenities:['Tiers-lieu','ESS','Projets collectifs','Rencontres'],desc:'Tiers-lieu universitaire dédié aux projets, à l’économie sociale et solidaire et aux coopérations.',source:'Université Rennes 2'},
 {id:'tl-beau-lieu',title:'Le Beau Lieu — Campus Beaulieu',kind:'public',universe:'computer',city:'Rennes',lat:48.1183,lng:-1.639,price:0,wifi:true,quiet:true,capacity:40,placeType:'third_place',website:'https://etudiant.univ-rennes.fr/espaces-de-travail',amenities:['Tiers-lieu','Coworking','Accès libre','Espaces modulables'],desc:'Espace de travail et de collaboration flexible sur le campus de Beaulieu.',source:'Université de Rennes'},
 {id:'tl-pnrb',title:'Pôle Numérique Rennes Beaulieu',kind:'public',universe:'computer',city:'Rennes',lat:48.116,lng:-1.637,price:0,wifi:true,quiet:true,capacity:40,placeType:'coworking',website:'https://etudiant.univ-rennes.fr/espaces-de-travail',amenities:['Coworking','Salles de réunion','Numérique','Innovation'],desc:'Espaces de travail, coworking, salles de réunion et services numériques.',source:'Université de Rennes'},
 {id:'tl-hotel-pasteur',title:'Hôtel Pasteur',kind:'public',universe:'association',city:'Rennes',lat:48.111,lng:-1.674,price:0,wifi:false,quiet:false,capacity:40,placeType:'third_place',website:'https://francetierslieux.fr/evenement/cape/',amenities:['Tiers-lieu','Hôtel à projets','Culture','Innovation sociale'],desc:'Tiers-lieu emblématique rennais, modulable et évolutif, accueillant des projets temporaires.',source:'France Tiers-Lieux'}
];

const query=`[out:json][timeout:60];(
 nwr[office=coworking](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[amenity=coworking](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[amenity=library](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[amenity=community_centre](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[amenity=cafe](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[amenity=arts_centre](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[amenity=makerspace](around:50000,${ORIGIN.lat},${ORIGIN.lng});
 nwr[craft](around:50000,${ORIGIN.lat},${ORIGIN.lng});
);out center tags;`;
let osm=[];
try{
 const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(query)});
 if(!r.ok) throw new Error(String(r.status));
 const j=await r.json();
 osm=(j.elements||[]).filter(e=>e.tags?.name).map(e=>{
   const t=e.tags,lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon;
   if(lat==null||lng==null)return null;
   const cowork=t.office==='coworking'||t.amenity==='coworking';
   const lib=t.amenity==='library';
   const community=t.amenity==='community_centre';
   const cafe=t.amenity==='cafe';
   const workshop=t.amenity==='makerspace'||t.amenity==='arts_centre'||Boolean(t.craft);
   if(!(cowork||lib||community||cafe||workshop))return null;
   const type=cowork?'coworking':lib?'library':workshop?'workshop':community?'third_place':'cafe';
   const kind=workshop?'workshop':cowork?'private':'public';
   const universe=workshop?'artisan':community?'association':'computer';
   const label=type==='coworking'?'Coworking':type==='library'?'Bibliothèque / médiathèque':type==='workshop'?'Atelier / fablab':type==='third_place'?'Tiers-lieu / collectif':'Café';
   return {id:`osm-${e.type}-${e.id}`,title:t.name,kind,universe,city:t['addr:city']||t['addr:town']||t['addr:village']||'Autour de Rennes',lat,lng,distance:+km(ORIGIN.lat,ORIGIN.lng,lat,lng).toFixed(1),rating:0,reviews:0,price:0,capacity:12,quiet:lib||cowork,wifi:t.internet_access==='wlan'||t.wifi==='yes',tools:workshop,live:false,updatedMins:1440,host:'OpenStreetMap',desc:type==='coworking'?'Espace de coworking référencé dans OpenStreetMap.':type==='library'?'Bibliothèque ou médiathèque publique.':type==='workshop'?'Atelier, fablab ou lieu de fabrication à vérifier pour les conditions d’accès.':type==='third_place'?'Lieu collectif ou associatif susceptible d’accueillir du travail nomade.':'Café à vérifier pour le travail sur ordinateur.',rules:'Vérifier horaires, Wi‑Fi, prises et conditions d’accès avant déplacement.',amenities:[label,t.internet_access==='wlan'?'Wi‑Fi':'Wi‑Fi à confirmer'],slots:[t.opening_hours||'Horaires à vérifier'],address:[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' '),phone:t.phone||t['contact:phone']||'',website:t.website||t['contact:website']||'',openingHours:t.opening_hours||'',placeType:type,verifiedAt:today,mapAccuracy:'OpenStreetMap',catalogSource:'auto'};
 }).filter(Boolean);
}catch(e){console.warn('Overpass unavailable:',e.message)}

const seen=new Set();
const all=[...curated,...osm].filter(p=>{
 p.distance=p.distance??+km(ORIGIN.lat,ORIGIN.lng,p.lat,p.lng).toFixed(1);
 p.rating=p.rating??0;p.reviews=p.reviews??0;p.capacity=p.capacity??12;p.live=false;p.updatedMins=1440;
 p.host=p.source||p.host||'Source vérifiée';p.rules=p.rules||'Vérifier les conditions avant déplacement.';p.slots=p.slots||['Horaires à vérifier'];p.verifiedAt=p.verifiedAt||today;p.catalogSource=p.catalogSource||'curated';
 const k=(p.title+'|'+p.city).toLowerCase();if(seen.has(k))return false;seen.add(k);return p.distance<=55;
});

await fs.mkdir('data',{recursive:true});
await fs.writeFile('data/workplaces-auto.json',JSON.stringify({generatedAt:new Date().toISOString(),origin:ORIGIN,count:all.length,places:all},null,2));
const js=`(()=>{try{const add=${JSON.stringify(all)};const key='coworkit3_places';const cur=JSON.parse(localStorage.getItem(key)||'[]');const user=cur.filter(p=>p.localOwned===true||p.host==='Vous'||(!p.catalogSource&&!String(p.id||'').startsWith('osm-')&&!String(p.id||'').startsWith('cw-')&&!String(p.id||'').startsWith('tl-')));const by=new Map(add.map(p=>[p.id,p]));for(const p of user)by.set(p.id,p);localStorage.setItem(key,JSON.stringify([...by.values()]));}catch(e){console.warn('Cowork catalog',e)}})();\n`;
await fs.writeFile('tiers-coworking.js',js);
let html=await fs.readFile('index.html','utf8');
if(!html.includes('tiers-coworking.js')) html=html.replace('<script src="./network.js"></script>','<script src="./tiers-coworking.js"></script><script src="./network.js"></script>');
await fs.writeFile('index.html',html);
console.log(`Generated ${all.length} workplaces`);
