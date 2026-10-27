(function(root){
'use strict';
function parseFile(text,source='問題ファイル'){
  const questions=[],errors=[];
  String(text).replace(/^\uFEFF/,'').split(/\r\n?|\n/).forEach((raw,index)=>{
    const line=raw.trim();if(!line||line.startsWith('#'))return;
    const fields=line.split('\t'),body=fields[0].trim(),hints=fields.slice(1).map(s=>s.trim());
    const parts=[],answers=[];let pos=0;const re=/\(([^()（）]*)\)|（([^()（）]*)）/g;let m;
    while((m=re.exec(body))){parts.push({text:body.slice(pos,m.index)});const a=(m[1]??m[2]).trim();answers.push(a);parts.push({blank:answers.length-1});pos=re.lastIndex;}
    parts.push({text:body.slice(pos)});
    if(!answers.length||answers.some(a=>!a||!/^[\p{Script=Han}々〆〇]+$/u.test(a))||parts.some(p=>p.text&&/[()（）]/.test(p.text))||hints.length>answers.length){errors.push(`${source} ${index+1}行目：漢字を（ ）または ( ) で囲んでください。読みは空欄ごとにタブで区切ります。`);return;}
    questions.push({id:`${source}:${index+1}`,source,line:index+1,body,parts,answers,hints});
  });
  return {questions,errors};
}
function identity(q){return q.body.normalize('NFKC').replace(/\s+/g,'');}
function unique(questions){const seen=new Set();return questions.filter(q=>{const key=identity(q);if(seen.has(key))return false;seen.add(key);return true;});}
function sample(questions,count,rng=Math.random){
  const pool=unique(questions);if(!Number.isSafeInteger(count)||count<1||count>pool.length)throw new Error(`問題数は1〜${pool.length}問で指定してください。`);
  for(let i=0;i<count;i++){const j=i+Math.floor(rng()*(pool.length-i));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,count);
}
function normalize(s){return String(s??'').normalize('NFKC').replace(/\s+/gu,'');}
function grade(questions,responses){const results=questions.map((q,i)=>{const values=q.answers.map((_,j)=>String(responses[i]?.[j]??''));const blanks=q.answers.map((a,j)=>normalize(a)===normalize(values[j]));return {question:q,values,blanks,correct:blanks.every(Boolean)};});const correct=results.filter(r=>r.correct).length;return {results,correct,total:questions.length,score:questions.length?Math.round(correct/questions.length*100):0};}
const api={parseFile,unique,sample,normalize,grade};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KanjiTestCore=api;
})(globalThis);
