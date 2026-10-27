'use strict';
const $ = id => document.getElementById(id);
const canvas = $('pad'), ctx = canvas.getContext('2d');
let strokes = [], active = null, pointer = null, timer, revision = 0;
const patterns = window.KanjiCanvas?.refPatterns || [];
const families = {hiragana:c => /^[\u3041-\u3096]$/.test(c),katakana:c => /^[\u30a1-\u30faー]$/.test(c),kanji:c => /^[\u3400-\u9fff]$/.test(c)};
function draw(){
  ctx.clearRect(0,0,768,768);ctx.strokeStyle='#283d39';ctx.fillStyle='#283d39';ctx.lineWidth=11;ctx.lineCap='round';ctx.lineJoin='round';
  for(const line of [...strokes,...(active?[active]:[])]){
    if(line.length===1){ctx.beginPath();ctx.arc(line[0][0]*3,line[0][1]*3,5.5,0,Math.PI*2);ctx.fill();continue;}
    ctx.beginPath();ctx.moveTo(line[0][0]*3,line[0][1]*3);for(const p of line.slice(1))ctx.lineTo(p[0]*3,p[1]*3);ctx.stroke();
  }
  $('hint').hidden=!!(strokes.length||active);$('strokes').textContent=`${strokes.length} 画`;
  $('undo').disabled=!strokes.length;$('clear').disabled=!(strokes.length||active);$('recognize').disabled=!strokes.length||!patterns.length;
}
function point(e){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(256,(e.clientX-r.left)/r.width*256)),Math.max(0,Math.min(256,(e.clientY-r.top)/r.height*256))];}
function invalidate(){revision++;clearTimeout(timer);$('candidates').replaceChildren();}
canvas.addEventListener('pointerdown',e=>{if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();invalidate();pointer=e.pointerId;canvas.setPointerCapture(pointer);active=[point(e)];draw();});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;for(const event of (e.getCoalescedEvents?.()||[e])){const p=point(event),prev=active.at(-1);if(Math.hypot(p[0]-prev[0],p[1]-prev[1])>=.6)active.push(p);}draw();});
function finish(e,cancel=false){if(e.pointerId!==pointer)return;if(!cancel){const p=point(e);if(Math.hypot(p[0]-active.at(-1)[0],p[1]-active.at(-1)[1])>.1)active.push(p);strokes.push(active);}active=null;pointer=null;draw();schedule();}
canvas.addEventListener('pointerup',e=>finish(e));canvas.addEventListener('pointercancel',e=>finish(e,true));canvas.addEventListener('lostpointercapture',e=>{if(pointer===e.pointerId)finish(e,true);});
function schedule(){clearTimeout(timer);if(strokes.length){$('status').textContent='書き終えたら、候補を探します…';timer=setTimeout(recognize,500);}else $('status').textContent='書き終えると、ここに候補が出ます。';}
function reset(){invalidate();strokes=[];active=null;pointer=null;draw();$('status').textContent='次の一文字を書いてみよう。';}
$('undo').onclick=()=>{invalidate();strokes.pop();draw();schedule();};$('clear').onclick=reset;$('kind').onchange=()=>{invalidate();schedule();};$('recognize').onclick=recognize;
canvas.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();$('undo').click();}if(e.key==='Escape')reset();});canvas.tabIndex=0;
function recognize(){
  clearTimeout(timer);if(active||!strokes.length||!patterns.length)return;
  const token=revision;$('status').textContent='候補を探しています…';
  setTimeout(()=>{if(token!==revision||active)return;try{
    const k=KanjiCanvas, filter=families[$('kind').value];k.refPatterns=filter?patterns.filter(p=>filter(p[0])):patterns;
    // The recognizer consumes points on its original 256 × 256 coordinate system.
    k.recordedPattern_pad=strokes.map(s=>s.length===1?[s[0],[s[0][0]+.01,s[0][1]+.01]]:s.map(p=>p.slice()));
    const normalized=k.momentNormalize('pad');
    const features=k.extractFeatures(normalized,20);
    const coarse=k.coarseClassification(features);
    const result=k.fineClassification(features,coarse).trim().split(/\s+/).filter(Boolean);
    const small={'あ':'ぁ','い':'ぃ','う':'ぅ','え':'ぇ','お':'ぉ','つ':'っ','や':'ゃ','ゆ':'ゅ','よ':'ょ','わ':'ゎ','か':'ゕ','け':'ゖ','ア':'ァ','イ':'ィ','ウ':'ゥ','エ':'ェ','オ':'ォ','ツ':'ッ','ヤ':'ャ','ユ':'ュ','ヨ':'ョ','ワ':'ヮ','カ':'ヵ','ケ':'ヶ'};
    const chars=[...new Set(result.flatMap(c=>small[c]?[c,small[c]]:[c]))];$('candidates').replaceChildren();
    for(const c of chars){const b=document.createElement('button');b.className='candidate';b.textContent=c;b.setAttribute('aria-label',`${c} を追加`);b.onclick=()=>{const t=$('text');const start=t.selectionStart,end=t.selectionEnd;t.setRangeText(c,start,end,'end');updateCount();reset();$('message').textContent=`「${c}」を追加しました。`;};$('candidates').append(b);}
    $('status').textContent=chars.length?'文字を選ぶと、下のテキストに追加されます。':'候補が見つかりませんでした。文字の種類を変えるか、書き直してください。';
  }catch(error){console.error(error);$('status').textContent='認識できませんでした。少し大きく書き直してください。';}finally{KanjiCanvas.refPatterns=patterns;}},20);
}
function updateCount(){$('count').textContent=`${Array.from($('text').value).length} 文字`;$('copy').disabled=!$('text').value;$('delete').disabled=!$('text').value;}
$('text').addEventListener('input',updateCount);
$('delete').onclick=()=>{const chars=Array.from($('text').value);chars.pop();$('text').value=chars.join('');updateCount();};
$('copy').onclick=async()=>{try{if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');await navigator.clipboard.writeText($('text').value);$('message').textContent='コピーしました。';}catch{$('text').focus();$('text').select();$('message').textContent='テキストを選択しました。端末のコピー操作でコピーしてください。';}};
draw();updateCount();if(!patterns.length)$('status').textContent='認識データを読み込めませんでした。ページを再読み込みしてください。';
