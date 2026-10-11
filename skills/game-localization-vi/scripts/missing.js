// node missing.js <batch> -> prints ids not yet present in E/<batch>.*.jsonl
const fs=require('fs');const name=process.argv[2];const man=JSON.parse(fs.readFileSync('B/manifest.json','utf8'));const b=man.find(x=>x.name===name);
const got=new Set();for(const f of fs.readdirSync('E').filter(f=>f.startsWith(name+'.')))for(const l of fs.readFileSync('E/'+f,'utf8').split('\n')){try{got.add(JSON.parse(l).id)}catch(e){}}
const miss=b.ids.filter(i=>!got.has(i));console.log('missing',miss.length,'of',b.ids.length,'; existing files:',fs.readdirSync('E').filter(f=>f.startsWith(name+'.')).join(', '));console.log(miss.join('\n'));
