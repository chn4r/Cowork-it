const { spawnSync } = require('child_process');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const dry=process.argv.includes('--dry-run');
function run(cmd,args){
 console.log(`\n> ${cmd} ${args.join(' ')}`);
 const r=spawnSync(cmd,args,{cwd:ROOT,stdio:'inherit'});
 if(r.status!==0)process.exit(r.status||1);
}
run('npm',['run','check']);
if(dry){console.log('\n✓ Test terminé, aucun push.');process.exit(0)}
run('git',['add','.']);
const q=spawnSync('git',['diff','--cached','--quiet'],{cwd:ROOT});
if(q.status!==0)run('git',['commit','-m',`Cowork it release ${new Date().toISOString()}`]);
run('git',['push']);
console.log('\n✅ Version envoyée.');
