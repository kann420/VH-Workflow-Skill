// node finalize.js -> final.json (id->vi), report
const fs=require('fs');const {check}=require('./validate.js');
const C=fs.readFileSync('corpus.jsonl','utf8').split('\n').filter(l=>l.trim()).map(JSON.parse);const byId=new Map(C.map(x=>[x.id,x]));
const rd=f=>fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):{};const link=rd('link.json');const dupOf=rd('dupOf.json');
const F={};for(const x of C)F[x.id]=x.vi;
const rep={applied:0,rejected:[],unchanged:0,files:0};
for(const fn of fs.readdirSync('E').filter(f=>f.endsWith('.jsonl')).sort()){rep.files++;
 for(const l of fs.readFileSync('E/'+fn,'utf8').split('\n')){if(!l.trim())continue;let o;try{o=JSON.parse(l)}catch(e){rep.rejected.push([fn,'json']);continue}
  const x=byId.get(o.id);if(!x){rep.rejected.push([fn,o.id,'unknown id']);continue}let v=String(o.vi).replace(/\\n/g,x.en.includes('\r\n')?'\r\n':'\n');
  const errs=check(x.en,v);if(errs.length){rep.rejected.push([fn,o.id,errs.join(',')]);continue}
  if(v===F[o.id])rep.unchanged++;else rep.applied++;F[o.id]=v}}
// propagate barks dupes
for(const [d,src] of Object.entries(dupOf)){const a=byId.get(d),b=byId.get(src);// timing may differ: only copy text if timing identical
 const MARK=/\[\d+(?:\.\d+)?-\d+(?:\.\d+)?\]/g;if((a.en.match(MARK)||[]).join()===(b.en.match(MARK)||[]).join())F[d]=F[src];else{const segs=F[src].split(MARK).filter(s=>s.trim());const marks=a.en.match(MARK)||[];if(marks.length===segs.length&&a.en.startsWith('['))F[d]=marks.map((m,i)=>m+segs[i].trim()).join(' ');}}
// propagate table -> dlg (strip timing)
let prop=0;for(const [d,t] of Object.entries(link)){const v=F[t].replace(/\[\d+(?:\.\d+)?-\d+(?:\.\d+)?\]/g,' ').replace(/[ \t]{2,}/g,' ').trim();const x=byId.get(d);
 // keep trailing/leading whitespace style of EN
 if(check(x.en,v).length===0){if(F[d]!==v)prop++;F[d]=v}}
rep.propagated=prop;
fs.writeFileSync('final.json',JSON.stringify(F));
const rj={};for(const r of rep.rejected){const k=r[r.length-1];rj[k]=(rj[k]||0)+1}console.log({...rep,rejected:rep.rejected.length,rejectedBy:rj});
fs.writeFileSync('rejected.json',JSON.stringify(rep.rejected,null,1));
