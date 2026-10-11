// Technical validation of edited lines.
// Usage (cwd = workspace): node validate.js <batch> [<batch>...]
// Checks every id of the batch (B/manifest.json) against E/<batch>.*.jsonl (later files override earlier ones).
// Rules (configurable in an optional validate.config.json in the workspace):
//   timing      : subtitle timing marks like [0.26-5.79] — same sequence; if EN starts with one, VI must too
//   tags        : markup tags — same multiset (with attributes). Stage directions like <sighs> are NOT tags (they get translated)
//   placeholders: {VAR}, %s, %d, real newlines — same multiset
//   empty       : VI may not be empty when EN is not
// validate.config.json example:
//   { "tags": ["br","b","i","color","size","sprite"], "placeholder": "\\{[A-Za-z0-9_#]+\\}|%[sd]|\\$\\w+\\$", "timing": "\\[\\d+(?:\\.\\d+)?-\\d+(?:\\.\\d+)?\\]" }
const fs=require('fs');
const cfg=fs.existsSync('validate.config.json')?JSON.parse(fs.readFileSync('validate.config.json','utf8')):{};
const TAGS=cfg.tags||['br','strong','b','i','u','s','em','p','li','ul','ol','h1','h2','h3','h4','h5','h6','span','font','a','img','color','size','sprite','link','style','no-wrap','svg-icon','action-key','map-marker'];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const TAG=new RegExp('<\\/?(?:'+TAGS.map(esc).join('|')+')(?:[\\s=][^>]*)?\\/?>','gi');
const PH=new RegExp((cfg.placeholder||'\\{[A-Za-z0-9_#]+\\}|%[sd]')+'|\\n','g');
const MARK=new RegExp(cfg.timing||'\\[\\d+(?:\\.\\d+)?-\\d+(?:\\.\\d+)?\\]','g');
const ms=(s,re)=>(s.match(re)||[]).map(x=>x.toLowerCase()).sort().join('|');
function check(en,vi){const errs=[];en=en||'';if(!vi||!vi.trim()){if(en.trim())errs.push('empty');return errs}
 if((en.match(MARK)||[]).join('')!==(vi.match(MARK)||[]).join(''))errs.push('timing');
 MARK.lastIndex=0;const startEn=new RegExp('^'+MARK.source).test(en),startVi=new RegExp('^'+MARK.source).test(vi);if(startEn&&!startVi)errs.push('timing-start');
 if(ms(en,TAG)!==ms(vi,TAG))errs.push('tags');
 if(ms(en,PH)!==ms(vi,PH))errs.push('placeholder');
 return errs}
module.exports={check};
if(require.main===module){const man=JSON.parse(fs.readFileSync('B/manifest.json','utf8'));const C=new Map(fs.readFileSync('corpus.jsonl','utf8').split('\n').filter(l=>l.trim()).map(l=>{const x=JSON.parse(l);return [x.id,x]}));
 for(const name of process.argv.slice(2)){const m=man.find(b=>b.name===name);if(!m){console.log(name,'NOT IN MANIFEST');continue}
  const files=fs.existsSync('E')?fs.readdirSync('E').filter(f=>f.startsWith(name+'.')&&f.endsWith('.jsonl')).sort():[];if(!files.length){console.log(name,'NO OUTPUT');continue}
  const got=new Map();let parseErr=0;for(const l of files.map(f=>fs.readFileSync('E/'+f,'utf8')).join('\n').split('\n')){if(!l.trim())continue;try{const o=JSON.parse(l);got.set(o.id,o.vi)}catch(e){parseErr++}}
  const ids=new Set(m.ids);const missing=m.ids.filter(i=>!got.has(i));const extra=[...got.keys()].filter(i=>!ids.has(i));const errs={};let changed=0;
  for(const id of ids){if(!got.has(id))continue;const x=C.get(id);const v=String(got.get(id)).replace(/\\n/g,(x.en||'').includes('\r\n')?'\r\n':'\n');const e=check(x.en,v);if(got.get(id)!==x.vi)changed++;for(const k of e)(errs[k]??=[]).push(id)}
  console.log(name,'lines',ids.size,'got',got.size,'missing',missing.length,'extra',extra.length,'parseErr',parseErr,'changed',changed,Object.fromEntries(Object.entries(errs).map(([k,v])=>[k,v.length+' e.g. '+v.slice(0,3).join(',')])));}}
