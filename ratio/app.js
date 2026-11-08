(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const ratioText = ratio => ratio.join(' : ');
  let level = 'basic';
  let questions = [];
  let questionIndex = 0;
  let answers = [];
  let answered = false;
  let sessionFinished = false;
  const previousKeys = { basic: [], advanced: [] };

  function currentQuestion() { return questions[questionIndex]; }

  function startSession(nextLevel) {
    level = nextLevel;
    questions = RatioQuiz.createSession(level, Math.random, previousKeys[level]);
    previousKeys[level] = questions.map(question => question.key);
    questionIndex = 0;
    answers = [];
    sessionFinished = false;
    for (const name of ['basic', 'advanced']) {
      $(name).classList.toggle('selected', name === level);
      $(name).setAttribute('aria-pressed', String(name === level));
    }
    $('level-note').textContent = level === 'basic'
      ? '共通する比の数が同じ。暗算で考えてみよう。'
      : '共通する比の数を、最小公倍数にそろえてみよう。';
    $('quiz').hidden = false;
    $('results').hidden = true;
    renderQuestion();
  }

  function renderQuestion() {
    const question = currentQuestion();
    answered = false;
    $('question-number').textContent = String(questionIndex + 1).padStart(2, '0');
    $('score').textContent = `正解 ${answers.filter(answer => answer.correct).length} / ${answers.length}`;
    $('progress').innerHTML = questions.map((_, index) => {
      const state = index < answers.length ? (answers[index].correct ? 'correct' : 'incorrect') : index === questionIndex ? 'current' : '';
      return `<span class="${state}" aria-label="第${index + 1}問 ${index < answers.length ? (answers[index].correct ? '正解' : '不正解') : index === questionIndex ? '挑戦中' : '未回答'}"></span>`;
    }).join('');
    $('known-ratios').innerHTML = `<span>BD : DC = ${ratioText(question.first)}</span><span>CE : EA = ${ratioText(question.second)}</span>`;
    $('feedback').hidden = true;
    $('feedback').innerHTML = '';
    $('hint').hidden = true;
    $('hint-toggle').setAttribute('aria-expanded', 'false');
    $('hint-toggle').innerHTML = 'ヒントを見る <span aria-hidden="true">＋</span>';
    const [u, v] = question.first;
    const [s, t] = question.second;
    $('hint').innerHTML = `面積の比は、△PAB : △PAC = <b>${u} : ${v}</b>、△PBC : △PAB = <b>${s} : ${t}</b>。<br>共通する△PABの「${u}」と「${t}」${level === 'basic' ? 'は同じ数。そのまま比べられるよ。' : `を、最小公倍数の<b>${question.common}</b>にそろえよう。`}`;
    renderDiagram();
    $('choices').replaceChildren();
    question.choices.forEach((ratio, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.setAttribute('aria-label', `選択肢${index + 1}、${ratio[0]}対${ratio[1]}`);
      button.innerHTML = `<span class="choice-key" aria-hidden="true">${index + 1}</span><span class="choice-ratio">${ratioText(ratio)}</span><span class="choice-status" aria-hidden="true"></span>`;
      function preview() { if (!answered) renderPreview(ratio); }
      function clearPreview() {
        if (answered) return;
        const focused = document.activeElement;
        const focusIndex = [...$('choices').children].indexOf(focused);
        renderPreview(focusIndex >= 0 ? question.choices[focusIndex] : null);
      }
      button.addEventListener('pointerenter', preview);
      button.addEventListener('pointerdown', preview);
      button.addEventListener('focus', preview);
      button.addEventListener('pointerleave', clearPreview);
      button.addEventListener('blur', () => {
        if (!answered) renderPreview(null);
      });
      button.addEventListener('click', () => submitAnswer(index));
      $('choices').append(button);
    });
  }

  function renderDiagram() {
    const question = currentQuestion();
    const { a, b, c } = question.weights;
    const A = { x: 270, y: 48 }, B = { x: 100, y: 342 }, C = { x: 460, y: 342 };
    function weighted(first, w1, second, w2) {
      return { x: (first.x * w1 + second.x * w2) / (w1 + w2), y: (first.y * w1 + second.y * w2) / (w1 + w2) };
    }
    const D = weighted(B, b, C, c), E = weighted(C, c, A, a), F = weighted(A, a, B, b);
    const P = { x: (a * A.x + b * B.x + c * C.x) / (a + b + c), y: (a * A.y + b * B.y + c * C.y) / (a + b + c) };
    const coords = point => `${point.x},${point.y}`;
    const line = (first, second, color, width = 1.8, extra = '') => `<line x1="${first.x}" y1="${first.y}" x2="${second.x}" y2="${second.y}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
    const label = (point, name, dx, dy) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="#244f41"/><text x="${point.x + dx}" y="${point.y + dy}" fill="#244f41" font-size="17" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="#f4f7ef" stroke-width="5" stroke-linejoin="round">${name}</text>`;
    $('diagram').innerHTML = `<title id="diagram-title">三角形ABCの分割比</title>
      <desc id="diagram-desc">Dは辺BC上、Eは辺CA上、Fは辺AB上。AD、BE、CFは点Pで交わります。BD対DCは${ratioText(question.first)}、CE対EAは${ratioText(question.second)}。AF対FBを求めます。</desc>
      <polygon points="${coords(A)} ${coords(B)} ${coords(P)}" fill="#e4eee0"/>
      <polygon points="${coords(A)} ${coords(C)} ${coords(P)}" fill="#e8efec"/>
      <polygon points="${coords(B)} ${coords(C)} ${coords(P)}" fill="#edf0df"/>
      ${line(A, D, '#819b7a')}${line(B, E, '#819b7a')}${line(C, F, '#819b7a')}
      <polygon points="${coords(A)} ${coords(B)} ${coords(C)}" fill="none" stroke="#295646" stroke-width="2.5" stroke-linejoin="round"/>
      ${line(A, B, '#c8814e', 4, 'stroke-linecap="round"')}
      ${label(A, 'A', 0, -15)}${label(B, 'B', -15, 22)}${label(C, 'C', 17, 22)}
      ${label(D, 'D', 0, 24)}${label(E, 'E', 18, 0)}${label(F, 'F', -18, 0)}
      <circle cx="${P.x}" cy="${P.y}" r="5.5" fill="#246c55" stroke="white" stroke-width="2"/>
      <text x="${P.x + 13}" y="${P.y + 17}" fill="#246c55" font-size="15" font-weight="800" paint-order="stroke" stroke="#f4f7ef" stroke-width="4">P</text>
      <g transform="translate(5 133)"><rect id="unknown-box" width="139" height="68" rx="12" fill="#fff8ed" stroke="#d7ae7e" stroke-dasharray="4 3"/><text x="69.5" y="24" fill="#94603c" text-anchor="middle" font-size="12" font-weight="600">AF : FB</text><text id="diagram-answer" x="69.5" y="53" fill="#ab6036" text-anchor="middle" font-size="23" font-weight="800">? : ?</text></g>
      <g transform="translate(414 143)"><rect width="140" height="63" rx="11" fill="#ffffff" stroke="#dce4db"/><text x="70" y="23" fill="#6c7e76" text-anchor="middle" font-size="12">CE : EA</text><text x="70" y="49" fill="#244f41" text-anchor="middle" font-size="22" font-weight="700">${ratioText(question.second)}</text></g>
      <g transform="translate(210 380)"><rect width="140" height="48" rx="10" fill="#ffffff" stroke="#dce4db"/><text x="70" y="19" fill="#6c7e76" text-anchor="middle" font-size="11">BD : DC</text><text x="70" y="39" fill="#244f41" text-anchor="middle" font-size="19" font-weight="700">${ratioText(question.first)}</text></g>`;
    renderPreview(null);
  }

  function renderPreview(ratio, correct = false) {
    $('diagram-answer').textContent = ratio ? ratioText(ratio) : '? : ?';
    $('diagram-answer').setAttribute('fill', correct ? '#246c55' : ratio ? '#386dc5' : '#ab6036');
    $('unknown-box').setAttribute('fill', correct ? '#edf7ef' : ratio ? '#edf3fe' : '#fff8ed');
    $('unknown-box').setAttribute('stroke', correct ? '#58926c' : ratio ? '#7a9cd5' : '#d7ae7e');
    $('unknown-box').setAttribute('stroke-dasharray', ratio ? 'none' : '4 3');
    $('preview-caption').textContent = correct ? `正しい比は AF : FB = ${ratioText(ratio)}` : ratio
      ? `AF : FB = ${ratioText(ratio)} を仮表示中。クリックで回答します`
      : '選択肢にカーソルを置くと、図に比が表示されます';
  }

  function submitAnswer(index) {
    if (answered) return;
    answered = true;
    const question = currentQuestion();
    const selected = question.choices[index];
    const correct = selected[0] === question.answer[0] && selected[1] === question.answer[1];
    answers.push({ correct, selected, question });
    [...$('choices').children].forEach((button, choiceIndex) => {
      button.setAttribute('aria-disabled', 'true');
      const ratio = question.choices[choiceIndex];
      if (ratio[0] === question.answer[0] && ratio[1] === question.answer[1]) {
        button.classList.add('is-correct');
        button.querySelector('.choice-status').textContent = '○';
      } else if (choiceIndex === index) {
        button.classList.add('is-wrong');
        button.querySelector('.choice-status').textContent = '×';
      }
    });
    renderPreview(question.answer, true);
    $('score').textContent = `正解 ${answers.filter(answer => answer.correct).length} / ${answers.length}`;
    const progressItem = $('progress').children[questionIndex];
    progressItem.className = correct ? 'correct' : 'incorrect';
    progressItem.setAttribute('aria-label', `第${questionIndex + 1}問 ${correct ? '正解' : '不正解'}`);
    showFeedback(correct);
  }

  function showFeedback(correct) {
    const question = currentQuestion();
    const [u, v] = question.first, [s, t] = question.second;
    const { a, b, c } = question.weights;
    const firstMultiplier = question.common / u, secondMultiplier = question.common / t;
    const simplifyNote = RatioQuiz.gcd(a, b) > 1 ? `。${RatioQuiz.gcd(a, b)}で割って簡単にすると <b>${ratioText(question.answer)}</b>` : '';
    $('feedback').className = `feedback${correct ? '' : ' wrong'}`;
    $('feedback').innerHTML = `<div class="feedback-header"><span class="feedback-symbol" aria-hidden="true">${correct ? '○' : '↗'}</span><div><h3>${correct ? '正解！その調子。' : 'おしい！比をそろえて確かめよう。'}</h3><p>正しい答えは AF : FB = ${ratioText(question.answer)}</p></div></div>
      <div class="explanation"><div class="explanation-step"><span class="step-label">01 / 面積の比にする</span><p>△PAB : △PAC = <b>${u} : ${v}</b><br>△PBC : △PAB = <b>${s} : ${t}</b><br>同じ高さの三角形は、底辺の比と面積の比が同じ。</p></div>
      <div class="explanation-step"><span class="step-label">02 / 共通する数をそろえる</span><p>${level === 'basic' ? `△PABはどちらも<b>${c}</b>。<br>そのまま比をつなげられる！` : `${u}と${t}の最小公倍数は<b>${c}</b>。<br>1つ目を${firstMultiplier}倍 → <b>${c} : ${b}</b><br>2つ目を${secondMultiplier}倍 → <b>${a} : ${c}</b>`}<br>△PAB : △PAC : △PBC<br>= <b>${c} : ${b} : ${a}</b></p></div>
      <div class="explanation-step"><span class="step-label">03 / 残りの比を読む</span><p>AF : FB = △PAC : △PBC<br>= <b>${b} : ${a}</b>${simplifyNote}<br>答えは <b>${ratioText(question.answer)}</b>。</p></div></div>
      <div class="feedback-bottom"><p>コツ：共通する三角形の面積を、同じ数にそろえる。</p><button id="next-question" class="primary-button" type="button">${questionIndex === 4 ? '5問の結果を見る' : '次の問題へ'} <span aria-hidden="true">→</span></button></div>`;
    $('feedback').hidden = false;
    $('next-question').addEventListener('click', () => {
      if (questionIndex === 4) showResults();
      else {
        questionIndex++;
        renderQuestion();
        $('question-title').setAttribute('tabindex', '-1');
        $('question-title').focus({ preventScroll: true });
        $('quiz').scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    });
    $('feedback').scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }

  function showResults() {
    sessionFinished = true;
    const score = answers.filter(answer => answer.correct).length;
    $('quiz').hidden = true;
    $('results').hidden = false;
    $('results').innerHTML = `<p class="eyebrow">CHALLENGE COMPLETE / ${level === 'basic' ? '基本' : '応用'}</p><p class="result-emblem" aria-hidden="true">△</p><h2 id="result-title" tabindex="-1">${score === 5 ? '全問正解、おみごと！' : '5問チャレンジ、おつかれさま！'}</h2><div class="result-score">${score}<span> / 5 問正解</span></div><p class="result-message">${score === 5 ? '比をそろえる考え方が、しっかり身についているね。' : '共通する数をそろえるのがコツ。もう一度やってみよう。'}</p>
      <div class="review-list">${answers.map((answer, index) => `<div class="review-row"><span class="review-status${answer.correct ? '' : ' incorrect'}">${answer.correct ? '○' : '×'} ${String(index + 1).padStart(2, '0')}</span><div>BD : DC = ${ratioText(answer.question.first)} ／ CE : EA = ${ratioText(answer.question.second)}<div class="review-detail">あなたの答え ${ratioText(answer.selected)}${answer.correct ? '' : ` → 正しくは ${ratioText(answer.question.answer)}`}</div></div><b>${ratioText(answer.question.answer)}</b></div>`).join('')}</div>
      <div class="result-actions"><button id="retry" type="button" class="primary-button">新しい5問に挑戦する ↗</button><button id="other-level" type="button" class="secondary-button">${level === 'basic' ? '応用' : '基本'}に挑戦する</button></div>`;
    $('retry').addEventListener('click', () => startSession(level));
    $('other-level').addEventListener('click', () => startSession(level === 'basic' ? 'advanced' : 'basic'));
    $('result-title').focus({ preventScroll: true });
    $('results').scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  for (const name of ['basic', 'advanced']) {
    $(name).addEventListener('click', () => {
      if (name !== level || sessionFinished) startSession(name);
    });
  }
  $('hint-toggle').addEventListener('click', () => {
    const opening = $('hint').hidden;
    $('hint').hidden = !opening;
    $('hint-toggle').setAttribute('aria-expanded', String(opening));
    $('hint-toggle').innerHTML = opening ? 'ヒントを閉じる <span aria-hidden="true">−</span>' : 'ヒントを見る <span aria-hidden="true">＋</span>';
  });
  startSession('basic');
})();
