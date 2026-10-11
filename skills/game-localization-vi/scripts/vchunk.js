// node vchunk.js <batch> <k> -> validate only ids of chunk B/<batch>__c<k>.txt against E/<batch>.c<k>*.jsonl
const fs=require('fs');const {check}=require('./validate.js');const [name,k]=process.argv.slice(2);
const ids=[...fs.readFileSync('B/'+name+'__c'+k+'.txt','utf8').matchAll(/^@(.+?)(?: \| .*)?$/gm)].map(m=>m[1].trim());
const C=new Map(fs.readFileSync('corpus.jsonl','utf8').split('\n').filter(l=>l.trim()).map(l=>{const x=JSON.parse(l);return [x.id,x]}));
const got=new Map();let pe=0;for(const f of fs.readdirSync('E').filter(f=>f.startsWith(name+'.c'+k)&&f.endsWith('.jsonl')).sort())for(const l of fs.readFileSync('E/'+f,'utf8').split('\n')){if(!l.trim())continue;try{const o=JSON.parse(l);got.set(o.id,o.vi)}catch(e){pe++}}
const miss=ids.filter(i=>!got.has(i));const errs=[];for(const i of ids){if(!got.has(i))continue;const x=C.get(i);const e=check(x.en,got.get(i).replace(/\n/g,x.en.includes('\r\n')?'\r\n':'\n'));if(e.length)errs.push(i+':'+e.join(','))}
console.log('chunk',k,'ids',ids.length,'got',ids.filter(i=>got.has(i)).length,'missing',miss.length,'parseErr',pe,'errors',errs.length);if(miss.length)console.log('MISSING:',miss.slice(0,20).join(' '));if(errs.length)console.log('ERRORS:',errs.slice(0,20).join(' '));
