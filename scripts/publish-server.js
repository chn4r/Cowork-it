const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {spawnSync,spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),HOST='127.0.0.1',PORT=Number(process.env.PUBLISH_PORT||4317),TOKEN=crypto.randomBytes(24).toString('hex');
const SECRET_PATTERNS=[/^\.env($|\.)/i,/service[_-]?role/i,/secret/i,/credentials?/i,/private[_-]?key/i,/\.pem$/i,/\.p12$/i,/\.key$/i];
function git(args){return spawnSync('git',args,{cwd:ROOT,encoding:'utf8'})}
function status(){
 const inside=git(['rev-parse','--is-inside-work-tree']);if(inside.status!==0)return {ready:false,summary:'Ce dossier doit être un dépôt Git.'};
 const branch=git(['branch','--show-current']).stdout.trim();if(branch!=='main')return {ready:false,summary:`Branche active “${branch||'inconnue'}”. Basculez sur main.`};
 const remote=git(['remote','get-url','origin']);if(remote.status!==0)return {ready:false,summary:'Aucun dépôt distant origin configuré.'};
 const dirty=git(['status','--porcelain']).stdout.trim().split('\n').filter(Boolean);
 const suspicious=dirty.map(x=>x.slice(3)).filter(f=>SECRET_PATTERNS.some(r=>r.test(f)));
 if(suspicious.length)return {ready:false,summary:'Fichier potentiellement sensible détecté : '+suspicious.join(', ')};
 return {ready:true,summary:`Git OK · main · origin : ${remote.stdout.trim()}`};
}
function json(res,obj,code=200){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function validRequest(req){const host=req.headers.host||'';const origin=req.headers.origin||'';return host===`${HOST}:${PORT}`&&(!origin||origin===`http://${HOST}:${PORT}`)&&req.headers['x-cowork-token']===TOKEN}
function streamCommand(res,command,args,label){return new Promise(resolve=>{res.write(`\n▶ ${label}\n`);const p=spawn(command,args,{cwd:ROOT,env:process.env});p.stdout.on('data',d=>res.write(d));p.stderr.on('data',d=>res.write(d));p.on('close',code=>{res.write(`\n${code===0?'✓':'✗'} ${label} — code ${code}\n`);resolve(code)})})}
const server=http.createServer(async(req,res)=>{
 if(req.method==='GET'&&req.url==='/'){res.writeHead(302,{Location:'/publish.html'});return res.end()}
 if(req.method==='GET'&&req.url==='/publish.html'){let html=fs.readFileSync(path.join(ROOT,'publish.html'),'utf8').replace('</head>',`<meta name="cowork-publish-token" content="${TOKEN}"></head>`);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY'});return res.end(html)}
 if(req.method==='GET'&&req.url==='/api/status')return json(res,status());
 if(req.method==='POST'&&req.url==='/api/publish'){
   if(!validRequest(req))return json(res,{error:'Requête refusée'},403);
   let body='';req.on('data',d=>{body+=d;if(body.length>8192)req.destroy()});
   req.on('end',async()=>{let data={};try{data=JSON.parse(body||'{}')}catch{return json(res,{error:'JSON invalide'},400)}
     const message=String(data.message||'Mise à jour Cowork it').replace(/[\r\n]+/g,' ').slice(0,120),dryRun=Boolean(data.dryRun),st=status();
     res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Transfer-Encoding':'chunked','X-Content-Type-Options':'nosniff'});
     if(!st.ready){res.write('Configuration incomplète : '+st.summary+'\n');return res.end()}
     let code=await streamCommand(res,'npm',['run','check'],'Tests automatiques');if(code!==0){res.write('\nPublication arrêtée : les tests ont échoué.\n');return res.end()}
     code=await streamCommand(res,'git',['fetch','origin','main'],'Vérification GitHub');if(code!==0)return res.end();
     const behind=git(['rev-list','--count','HEAD..origin/main']);if(Number((behind.stdout||'0').trim())>0){res.write('\nPublication arrêtée : la branche locale est en retard sur GitHub. Faites un git pull --ff-only.\n');return res.end()}
     if(dryRun){res.write('\n✓ Tous les contrôles sont passés. Aucun fichier envoyé.\n');return res.end()}
     code=await streamCommand(res,'git',['add','-A'],'Préparation des changements');if(code!==0)return res.end();
     if(git(['diff','--cached','--quiet']).status!==0){code=await streamCommand(res,'git',['commit','-m',message],'Création du commit');if(code!==0)return res.end()}
     code=await streamCommand(res,'git',['push','origin','main'],'Envoi vers GitHub');res.write(code===0?'\n✅ PUBLICATION ENVOYÉE.\n':'\nPush impossible. Vérifiez l’authentification GitHub.\n');res.end();
   });return;
 }
 res.writeHead(404);res.end('Not found');
});
server.listen(PORT,HOST,()=>console.log(`Cowork it — publication sécurisée : http://${HOST}:${PORT}/publish.html`));
