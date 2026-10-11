// Consistency pass applied on final.json after finalize.js.
// Usage (cwd = workspace): node <skill>/scripts/core/postfix.js [rulesFile=postfix.rules.js] [--report]
// rules file (CommonJS) exports:
//   rules:     [[RegExp, replacement], ...]                 // applied to every VI line
//   enRules:   [[RegExp_on_EN, [[RegExp, replacement],...]]] // applied only when the English source matches
//   overrides: { "<id or id-prefix>": "exact VI" }
//   report:    { "label": RegExp }                           // --report: list VI lines matching but EN not matching
// Every changed line is re-validated (tags/timing/placeholders); invalid changes are skipped.
const fs=require('fs'),path=require('path');const {check}=require('./validate.js');
const args=process.argv.slice(2);const report=args.includes('--report');const rf=path.resolve(args.find(a=>!a.startsWith('--'))||'postfix.rules.js');
const R=fs.existsSync(rf)?require(rf):{};const F=JSON.parse(fs.readFileSync('final.json','utf8'));
const C=new Map(fs.readFileSync('corpus.jsonl','utf8').split('\n').filter(l=>l.trim()).map(l=>{const x=JSON.parse(l);return [x.id,x]}));
if(report){for(const [n,re] of Object.entries(R.report||{})){const hits=Object.entries(F).filter(([id,v])=>re.test(v)&&!re.test(C.get(id).en));console.log(n.padEnd(24),hits.length,hits.slice(0,4).map(h=>h[0]).join(' '))}process.exit(0)}
let n=0,bad=0;
for(const [p,v] of Object.entries(R.overrides||{})){const k=Object.keys(F).find(x=>x===p||x.startsWith(p));if(k&&check(C.get(k).en,v).length===0){F[k]=v;n++}else bad++}
for(const [id,v] of Object.entries(F)){let w=v;for(const [re,r] of R.rules||[])w=w.replace(re,r);const en=C.get(id).en||'';
 for(const [cond,rs] of R.enRules||[])if(cond.test(en))for(const [re,r] of rs)w=w.replace(re,r);
 if(w!==v){if(check(en,w).length){bad++;continue}F[id]=w;n++}}
fs.writeFileSync('final.json',JSON.stringify(F));console.log('postfix changed',n,'skipped (would break tags/timing)',bad);
