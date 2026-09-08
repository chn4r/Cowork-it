(() => {
'use strict';
const KEY='coworkit3_network_config', QUEUE='coworkit3_sync_queue';
let config=JSON.parse(localStorage.getItem(KEY)||'{"mode":"local"}');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function setConfig(c){config={...config,...c};localStorage.setItem(KEY,JSON.stringify(config))}
function getQueue(){try{return JSON.parse(localStorage.getItem(QUEUE)||'[]')}catch{return []}}
function setQueue(q){localStorage.setItem(QUEUE,JSON.stringify(q.slice(-50)))}
async function fetchTimeout(url,opts={},ms=8000){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),ms);try{return await fetch(url,{...opts,signal:ctl.signal})}finally{clearTimeout(timer)}}
function accessToken(){try{return sessionStorage.getItem('coworkit3_access_token')||''}catch{return ''}}
function supabaseHeaders(token,extra={}){const bearer=accessToken()||token;return {'apikey':token,'Authorization':'Bearer '+bearer,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal',...extra}}
async function test({mode,url,token}){
 url=url.replace(/\/$/,'');
 if(mode==='supabase'){
   if(!token)throw new Error('Clé anon manquante');
   const r=await fetchTimeout(url+'/rest/v1/places?select=id&limit=1',{headers:supabaseHeaders(token,{'Accept':'application/json'})});
   if(!r.ok)throw new Error('HTTP '+r.status);return 'Supabase REST OK';
 }
 const r=await fetchTimeout(url+'/health',{headers:{'Accept':'application/json',...(token?{'Authorization':'Bearer '+token}:{})}});
 if(!r.ok)throw new Error('HTTP '+r.status);return 'API /health OK';
}
async function queueSnapshot(snapshot){
 if((config.mode||'local')==='local')return {queued:false};
 const q=getQueue();q.push({id:Date.now()+'-'+Math.random().toString(36).slice(2),type:'snapshot',payload:snapshot,createdAt:new Date().toISOString()});setQueue(q);
 if(navigator.onLine)flush().catch(()=>{});return {queued:true};
}
async function flush(){
 if((config.mode||'local')==='local')return {sent:0};
 let q=getQueue(), sent=0, remain=[];
 for(const item of q){
   try{await send(item);sent++}catch(e){remain.push(item); if(e.name==='AbortError'||/Failed to fetch|NetworkError/i.test(e.message)){remain.push(...q.slice(q.indexOf(item)+1));break}}
 }
 setQueue(remain);return {sent,pending:remain.length};
}
async function send(item){
 if(config.mode==='supabase')return sendSupabase(item);
 if(config.mode==='api')return sendApi(item);
}
async function sendApi(item){
 const url=(config.apiUrl||'').replace(/\/$/,'');if(!url)throw new Error('URL API manquante');
 const r=await fetchTimeout(url+'/sync',{method:'POST',headers:{'Content-Type':'application/json',...(config.token?{'Authorization':'Bearer '+config.token}:{})},body:JSON.stringify(item)});
 if(!r.ok)throw new Error('HTTP '+r.status);return true;
}
function placeRow(p){return {id:String(p.id),title:p.title,kind:p.kind,universe:p.universe,city:p.city,latitude:p.lat,longitude:p.lng,distance_km:p.distance,rating:p.rating,reviews:p.reviews,price_per_day:p.price,capacity:p.capacity,quiet:p.quiet,wifi:p.wifi,tools:p.tools,live:p.live,availability_updated_at:new Date(Date.now()-(p.updatedMins||0)*60000).toISOString(),host_name:p.host,description:p.desc,rules:p.rules,amenities:p.amenities,slots:p.slots,payload:p}}
async function upsert(url,token,table,rows,onConflict='id'){
 if(!rows?.length)return;const r=await fetchTimeout(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`,{method:'POST',headers:supabaseHeaders(token),body:JSON.stringify(rows)});if(!r.ok){const t=await r.text().catch(()=>String(r.status));throw new Error(`Supabase ${table}: ${r.status} ${t.slice(0,160)}`)}
}
async function sendSupabase(item){
 const url=(config.supabaseUrl||'').replace(/\/$/,'');const token=config.anonKey||'';if(!url||!token)throw new Error('Configuration Supabase incomplète');
 if(item.type==='snapshot'){
   await upsert(url,token,'places',item.payload.places.map(placeRow));
   const favoriteRows=(item.payload.favorites||[]).map(id=>({device_id:getDeviceId(),place_id:String(id)}));
   if(favoriteRows.length)await upsert(url,token,'device_favorites',favoriteRows,'device_id,place_id');
   const threadRows=(item.payload.threads||[]).map(t=>({id:String(t.id),device_id:getDeviceId(),person_name:t.person,initials:t.initials||'',context:t.context||{},payload:t}));
   if(threadRows.length)await upsert(url,token,'device_threads',threadRows);
 }
 return true;
}
function getDeviceId(){let id=localStorage.getItem('coworkit3_device_id');if(!id){id=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem('coworkit3_device_id',id)}return id}

async function signUp(email,password){
 const url=(config.supabaseUrl||'').replace(/\/$/,'');const key=config.anonKey||'';if(!url||!key)throw new Error('Configurez Supabase avant de créer un compte');
 const r=await fetchTimeout(url+'/auth/v1/signup',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.msg||data.error_description||('HTTP '+r.status));
 if(data.access_token){try{sessionStorage.setItem('coworkit3_access_token',data.access_token);sessionStorage.setItem('coworkit3_user',JSON.stringify(data.user||{}))}catch{}}
 return data;
}
async function signIn(email,password){
 const url=(config.supabaseUrl||'').replace(/\/$/,'');const key=config.anonKey||'';if(!url||!key)throw new Error('Configurez Supabase avant de vous connecter');
 const r=await fetchTimeout(url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.msg||data.error_description||('HTTP '+r.status));
 try{sessionStorage.setItem('coworkit3_access_token',data.access_token||'');sessionStorage.setItem('coworkit3_user',JSON.stringify(data.user||{}))}catch{}
 return data;
}
function signOut(){try{sessionStorage.removeItem('coworkit3_access_token');sessionStorage.removeItem('coworkit3_user')}catch{}}
function currentUser(){try{return JSON.parse(sessionStorage.getItem('coworkit3_user')||'null')}catch{return null}}
window.CoworkNetwork={setConfig,test,queueSnapshot,flush,getQueue,getDeviceId,signUp,signIn,signOut,currentUser};
})();
