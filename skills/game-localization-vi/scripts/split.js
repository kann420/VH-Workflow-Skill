// node split.js <batch> <n>  -> splits B/<batch>.txt into n chunk files B/<batch>__c1.txt.. at scene/group boundaries (only ids still missing in E/)
const fs=require('fs');const [name,nArg]=process.argv.slice(2);const n=+nArg||2;
const got=new Set();for(const f of fs.readdirSync('E').filter(f=>f.startsWith(name+'.')))for(const l of fs.readFileSync('E/'+f,'utf8').split('\n')){try{got.add(JSON.parse(l).id)}catch(e){}}
const txt=fs.readFileSync('B/'+name+'.txt','utf8');const blocks=txt.split(/\n(?=## |@)/);// keep headers
const units=[];let hdr='';for(const b of blocks){if(b.startsWith('## ')){hdr=b.trim();units.push({hdr});continue}const m=b.match(/^@(.+?)(?: \| .*)?$/m);if(!m)continue;units.push({id:m[1],text:b.trim(),size:b.length})}
const todo=units.filter(u=>u.hdr||!got.has(u.id));const total=todo.reduce((a,u)=>a+(u.size||0),0);const target=total/n;
const chunks=[[]];let acc=0;for(const u of todo){if(chunks.length<n&&((u.hdr&&acc>=target)||(!u.hdr&&acc>=target*1.15&&!name.includes('dialogue')))){chunks.push([]);acc=0}chunks[chunks.length-1].push(u);acc+=u.size||0}
chunks.forEach((c,i)=>{const f='B/'+name+'__c'+(i+1)+'.txt';const ids=c.filter(u=>u.id).length;fs.writeFileSync(f,c.map(u=>u.hdr?'\n'+u.hdr+'\n':u.text+'\n').join('\n'));console.log(f,'lines',ids,'-> output E/'+name+'.c'+(i+1)+'.jsonl')});
