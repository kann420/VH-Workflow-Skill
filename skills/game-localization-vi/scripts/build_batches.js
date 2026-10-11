// Generic batch builder.
// Usage (cwd = project workspace):  LIMIT=15000 node build_batches.js   (scripts copied into the workspace)
// Input : corpus.jsonl  — one JSON per line:
//   { id, kind: "dlg"|"choice"|"text", en, vi, speaker?, scene?, order?, group?, key?, dupOf? }
//   - dlg   : spoken line. `scene` groups lines of one conversation, `order` sorts inside it.
//   - choice: player dialogue choice (short, usually no context).
//   - text  : UI, documents, quest log, item text... grouped by `group` (or key prefix).
//   - dupOf : id of another entry with identical text that will be copied at finalize time
//             (barks repeated per soldier, the same line stored in two files...). Not batched.
// Output: B/<name>.txt (human/LLM readable) + B/manifest.json  {name,type,lines,chars,ids}
const fs=require('fs');
const LIMIT=+process.env.LIMIT||15000;
const C=fs.readFileSync('corpus.jsonl','utf8').split('\n').filter(l=>l.trim()).map(JSON.parse);
fs.mkdirSync('B',{recursive:true});
const batches=[];let cur=null;
const nb=type=>{cur={type,units:[],chars:0};batches.push(cur)};
const add=(u,len)=>{cur.units.push(u);cur.chars+=len};
const todo=C.filter(x=>!x.dupOf&&x.en&&x.en.trim());

// 1. dialogue scenes, in order of first appearance
const scenes=new Map();for(const x of todo.filter(x=>x.kind==='dlg')){const s=x.scene??'(no scene)';if(!scenes.has(s))scenes.set(s,[]);scenes.get(s).push(x)}
for(const [s,arr] of scenes){arr.sort((a,b)=>(a.order??0)-(b.order??0));
 if(!cur||cur.type!=='dialogue'||cur.chars>LIMIT)nb('dialogue');add({scene:'CẢNH '+s},0);
 for(const x of arr){if(cur.chars>LIMIT*1.5){nb('dialogue');add({scene:'(TIẾP) CẢNH '+s},0)}add({id:x.id,spk:x.speaker||'',en:x.en,vi:x.vi||''},x.en.length)}}
// 2. choices
cur=null;for(const x of todo.filter(x=>x.kind==='choice')){if(!cur||cur.chars>LIMIT)nb('choices');add({id:x.id,spk:'(lựa chọn hội thoại của nhân vật chính)',en:x.en,vi:x.vi||''},x.en.length)}
// 3. text by group
cur=null;let last=null;const T=todo.filter(x=>x.kind!=='dlg'&&x.kind!=='choice');
const grp=x=>x.group||(x.key||x.id).replace(/^t:/,'').split(/[_\/]/)[0];
T.sort((a,b)=>grp(a).localeCompare(grp(b))||String(a.key||a.id).localeCompare(String(b.key||b.id)));
for(const x of T){const g=grp(x);if(!cur||(cur.chars>LIMIT&&g!==last)||cur.chars>LIMIT*1.4)nb('text');if(g!==last)add({scene:'NHÓM '+g},0);last=g;add({id:x.id,key:x.key,spk:x.speaker||'',en:x.en,vi:x.vi||''},x.en.length)}

const esc=s=>String(s).replace(/\r?\n/g,'\\n');
const man=batches.map((b,i)=>{const name='b'+String(i+1).padStart(3,'0')+'_'+b.type;let s='';
 for(const u of b.units){if(u.scene){s+='\n## '+u.scene+'\n\n';continue}s+='@'+u.id+(u.spk?' | '+u.spk:'')+'\nEN: '+esc(u.en)+'\nVI: '+esc(u.vi)+'\n\n'}
 fs.writeFileSync('B/'+name+'.txt',s);return {name,type:b.type,lines:b.units.filter(u=>u.id).length,chars:b.chars,ids:b.units.filter(u=>u.id).map(u=>u.id)}});
fs.writeFileSync('B/manifest.json',JSON.stringify(man));
const tot={};for(const m of man){const o=tot[m.type]??={batches:0,lines:0,chars:0};o.batches++;o.lines+=m.lines;o.chars+=m.chars}
console.log(tot,'skipped dupOf:',C.filter(x=>x.dupOf).length);
// write dupOf map for finalize.js
const dup={};for(const x of C)if(x.dupOf)dup[x.id]=x.dupOf;if(Object.keys(dup).length)fs.writeFileSync('dupOf.json',JSON.stringify(dup));
