const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PUBLISH_PORT || 4317);

function git(args){
  return spawnSync('git', args, {cwd:ROOT, encoding:'utf8'});
}
function status(){
  const inside = git(['rev-parse','--is-inside-work-tree']);
  if(inside.status !== 0) return {ready:false, summary:'Ce dossier doit d’abord être initialisé comme dépôt Git.'};
  const branch = git(['branch','--show-current']).stdout.trim() || 'inconnue';
  const remote = git(['remote','get-url','origin']);
  if(remote.status !== 0) return {ready:false, summary:`Git OK · branche ${branch} · aucun dépôt distant “origin” configuré.`};
  return {ready:true, summary:`Git OK · branche ${branch} · origin : ${remote.stdout.trim()}`};
}
function json(res,obj,code=200){
  res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(obj));
}
function streamCommand(res, command, args, label){
  return new Promise(resolve=>{
    res.write(`\n▶ ${label}\n`);
    const p=spawn(command,args,{cwd:ROOT,env:process.env});
    p.stdout.on('data',d=>res.write(d));
    p.stderr.on('data',d=>res.write(d));
    p.on('close',code=>{res.write(`\n${code===0?'✓':'✗'} ${label} — code ${code}\n`);resolve(code)});
  });
}
const server=http.createServer(async(req,res)=>{
  if(req.method==='GET' && req.url==='/'){
    res.writeHead(302,{Location:'/publish.html'});return res.end();
  }
  if(req.method==='GET' && req.url==='/publish.html'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    return fs.createReadStream(path.join(ROOT,'publish.html')).pipe(res);
  }
  if(req.method==='GET' && req.url==='/api/status') return json(res,status());
  if(req.method==='POST' && req.url==='/api/publish'){
    let body=''; req.on('data',d=>body+=d);
    req.on('end',async()=>{
      let data={}; try{data=JSON.parse(body||'{}')}catch{}
      const message=String(data.message||'Mise à jour Cowork it').replace(/[\r\n]+/g,' ').slice(0,120);
      const dryRun=Boolean(data.dryRun);
      const st=status();
      res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Transfer-Encoding':'chunked'});
      if(!st.ready){res.write('Configuration incomplète : '+st.summary+'\n');return res.end();}
      res.write(`Cowork it — ${dryRun?'TEST':'PUBLICATION'}\n`);
      res.write('--------------------------------\n');
      let code=await streamCommand(res,'npm',['run','check'],'Tests automatiques');
      if(code!==0){res.write('\nPublication arrêtée : les tests ont échoué.\n');return res.end();}
      if(dryRun){res.write('\n✓ Tous les contrôles sont passés. Aucun fichier envoyé.\n');return res.end();}
      code=await streamCommand(res,'git',['add','.'],'Préparation des changements');
      if(code!==0)return res.end();
      const diff=git(['diff','--cached','--quiet']);
      if(diff.status===0){
        res.write('\nAucun changement à publier. La branche est déjà à jour localement.\n');
      } else {
        code=await streamCommand(res,'git',['commit','-m',message],'Création du commit');
        if(code!==0){res.write('\nCommit impossible. Vérifiez git user.name et user.email.\n');return res.end();}
      }
      code=await streamCommand(res,'git',['push'],'Envoi vers GitHub');
      if(code===0) res.write('\n✅ PUBLICATION ENVOYÉE.\nGitHub a reçu la version. Si Vercel/Netlify est relié au dépôt, le déploiement démarre automatiquement.\n');
      else res.write('\nPush impossible. Vérifiez l’authentification GitHub et la branche distante.\n');
      res.end();
    });return;
  }
  res.writeHead(404);res.end('Not found');
});
server.listen(PORT,HOST,()=>{
  console.log(`\nCowork it — bouton Publier`);
  console.log(`Ouvrir : http://${HOST}:${PORT}/publish.html`);
  console.log('Ctrl+C pour arrêter.\n');
});
