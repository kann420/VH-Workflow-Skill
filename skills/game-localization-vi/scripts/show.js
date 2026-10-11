// node show.js <batch> [maxLines] [filePattern] -> show changed lines EN / OLD / NEW for review
const fs=require('fs');const [name,maxA,pat]=process.argv.slice(2);const max=+maxA||40;
const C=new Map(fs.readFileSync('corpus.jsonl','utf8').split('\n').filter(l=>l.trim()).map(l=>{const x=JSON.parse(l);return [x.id,x]}));
let n=0;for(const f of fs.readdirSync('E').filter(f=>f.startsWith(name+'.')&&(!pat||f.includes(pat))).sort())for(const l of fs.readFileSync('E/'+f,'utf8').split('\n')){if(!l.trim())continue;let o;try{o=JSON.parse(l)}catch(e){console.log('PARSE ERR in',f);continue}
 const x=C.get(o.id);if(!x)continue;const old=x.vi.replace(/\r?\n/g,'\n');if(o.vi===old)continue;if(n++>=max)continue;
 console.log('['+f+'] '+o.id+(x.speaker?' | '+x.speaker:'')+'\n  EN : '+x.en.slice(0,300)+'\n  OLD: '+old.slice(0,300)+'\n  NEW: '+o.vi.slice(0,300))}
console.log('changed lines total',n);
