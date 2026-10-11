const fs=require('fs');const man=JSON.parse(fs.readFileSync('B/manifest.json','utf8'));const files=fs.readdirSync('E');const out={done:[],partial:[],none:[]};
for(const b of man){const fs2=files.filter(f=>f.startsWith(b.name+'.'));if(!fs2.length){out.none.push(b.name.slice(0,4));continue}const got=new Set();for(const f of fs2)for(const l of fs.readFileSync('E/'+f,'utf8').split('\n')){try{got.add(JSON.parse(l).id)}catch(e){}}
if(b.ids.every(i=>got.has(i)))out.done.push(b.name.slice(0,4));else out.partial.push(b.name.slice(0,4))}
console.log('done',out.done.length,'| partial',out.partial.join(' '),'| not started',out.none.length,':',out.none.join(' '));
