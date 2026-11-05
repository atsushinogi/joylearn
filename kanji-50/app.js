(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = globalThis.KanjiStoryCore;
  const courses = globalThis.KANJI_STORY_BANK?.courses || [];
  if (!core || courses.length !== 2 || courses.some(c => c.questions.length !== 53)) {
    $('app-error').hidden = false;
    $('app-error').textContent = '教材を読み込めませんでした。ページを再読み込みしてください。';
    $('start').disabled = true;
    return;
  }
  const storageKey = 'joylearn:kanji-story-53:v1';
  let selectedId = courses[0].id, course = courses[0], session = null;
  let screen = 'setup', activeBlank = 0, inputRefs = [], report = null, sessions = {};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (courses.some(c => c.id === saved.selectedId)) {
      selectedId = saved.selectedId;
      course = courses.find(c => c.id === selectedId);
    }
    for (const c of courses) {
      const value = core.restoreSession(c, saved.sessions?.[c.id]);
      if (value) sessions[c.id] = value;
    }
  } catch { /* An unavailable or malformed save must not prevent learning. */ }

  const getCourse = id => courses.find(c => c.id === id);
  const currentQuestion = () => course.questions.find(q => q.id === session.ids[session.current]);
  const questionAt = i => course.questions.find(q => q.id === session.ids[i]);
  const complete = (values, q) => values.every((value, i) => core.normalize(value).length >= q.answers[i].length);
  const answeredCount = value => {
    const c = getCourse(value.courseId);
    return value.responses.filter((r, i) => complete(r, c.questions.find(q => q.id === value.ids[i]))).length;
  };

  function save() {
    if (session) sessions[session.courseId] = session;
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, selectedId, sessions })); }
    catch { $('storage-status').textContent = 'この環境では自動保存できません。学習中はこの画面を閉じずに進めてください。'; }
  }

  function show(name) {
    screen = name;
    for (const id of ['setup', 'test', 'results']) $(id).hidden = id !== name;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function paintSetup() {
    course = getCourse(selectedId);
    document.body.dataset.theme = course.theme;
    for (const option of document.querySelectorAll('.course-option')) {
      const input = option.querySelector('input');
      input.checked = input.value === selectedId;
      option.classList.toggle('selected', input.checked);
    }
    for (const c of courses) {
      const value = sessions[c.id];
      $(`progress-${c.id}`).textContent = !value ? '' : value.status === 'completed'
        ? `前回 ${core.grade(c, value).score}点${value.mode === 'review' ? '（復習）' : ''}`
        : `${value.mode === 'review' ? '復習 ' : ''}${answeredCount(value)} / ${value.ids.length}問 回答済み`;
    }
    const previous = sessions[course.id];
    $('start').textContent = previous
      ? previous.status === 'completed' ? `${course.shortTitle}の前回の結果を見る →` : `${course.shortTitle}のつづきから →`
      : `${course.shortTitle}の53問をはじめる →`;
    $('start-fresh').hidden = !previous;
    $('resume-note').textContent = previous?.status === 'active'
      ? `保存した第${previous.current + 1}問から再開します。ならび方も引き継ぎます。`
      : '全53問を出題します。最後にまとめて採点。';
  }

  for (const input of document.querySelectorAll('input[name="course"]')) {
    input.addEventListener('change', () => { selectedId = input.value; paintSetup(); save(); });
  }
  function chosenOrder() { return document.querySelector('input[name="order"]:checked').value; }
  function begin(value) {
    session = value;
    course = getCourse(session.courseId);
    selectedId = course.id;
    document.body.dataset.theme = course.theme;
    save();
    if (session.status === 'completed') { report = core.grade(course, session); renderResults(); return; }
    report = null;
    show('test');
    ink.setEnabled(true);
    renderQuestion();
  }
  function fresh() { begin(core.makeSession(getCourse(selectedId), chosenOrder())); }
  $('settings').addEventListener('submit', event => {
    event.preventDefault();
    begin(sessions[selectedId] || core.makeSession(getCourse(selectedId), chosenOrder()));
  });
  $('start-fresh').onclick = () => {
    const previous = sessions[selectedId];
    if (previous?.status === 'active' && previous.responses.some(r => r.some(v => core.normalize(v)))) $('restart-dialog').showModal();
    else fresh();
  };
  $('cancel-restart').onclick = () => $('restart-dialog').close();
  $('confirm-restart').onclick = () => { $('restart-dialog').close(); fresh(); };

  function sentence(container, q, mode = 'blank') {
    container.replaceChildren();
    for (const part of q.parts) {
      if (part.text !== undefined) { container.append(document.createTextNode(part.text)); continue; }
      const j = part.blank, span = document.createElement('span');
      span.className = mode === 'answer' ? 'correct-answer' : 'blank';
      span.textContent = mode === 'answer' ? q.answers[j] : '□'.repeat(Array.from(q.answers[j]).length);
      if (mode === 'blank') {
        span.setAttribute('aria-label', `「${q.hints[j]}」の漢字`);
        const ruby = document.createElement('ruby'), rt = document.createElement('rt');
        rt.textContent = q.hints[j];
        ruby.append(span, rt); container.append(ruby);
      } else container.append(span);
    }
  }

  function selectBlank(index, reset = true) {
    activeBlank = index;
    inputRefs.forEach((input, i) => input.classList.toggle('active', i === index));
    $('active-hint').textContent = `「${currentQuestion().hints[index]}」の漢字を書いて、候補を選ぼう。`;
    if (reset) ink.reset();
  }

  function progress() {
    const n = answeredCount(session);
    $('answered-count').textContent = `回答済み ${n} / ${session.ids.length}`;
    $('progress').max = session.ids.length;
    $('progress').value = n;
    for (const [i, button] of Array.from($('question-map').children).entries()) {
      const done = complete(session.responses[i], questionAt(i));
      button.classList.toggle('done', done);
      button.setAttribute('aria-label', `第${i + 1}問${done ? '・回答済み' : '・未回答または入力途中'}`);
    }
    $('word-preview').textContent = core.word(currentQuestion(), session.responses[session.current]);
    save();
  }

  function renderQuestion() {
    const q = currentQuestion();
    ink.reset(); activeBlank = 0; inputRefs = [];
    $('session-label').textContent = `${course.title} · ${session.mode === 'review' ? 'まちがえた問題の復習' : '漢字53問の書き取り'}`;
    $('position').textContent = `第${session.current + 1}問 / ${session.ids.length}問`;
    $('source-label').textContent = `教材の問${q.number}`;
    $('scene-image').alt = `教材の問${q.number}に対応する場面イラスト`;
    $('scene-image').hidden = false;
    $('scene-image').onerror = () => { $('scene-image').hidden = true; };
    $('scene-image').src = q.image;
    sentence($('question'), q);
    $('answer-fields').replaceChildren();
    q.answers.forEach((answer, j) => {
      const label = document.createElement('label'), caption = document.createElement('span'), input = document.createElement('input');
      label.className = 'answer-label'; caption.textContent = `「${q.hints[j]}」の漢字（${Array.from(answer).length}文字）`;
      input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
      input.setAttribute('autocapitalize', 'off'); input.setAttribute('aria-label', caption.textContent);
      input.maxLength = 32; input.value = session.responses[session.current][j]; input.placeholder = '漢字だけ入力';
      input.onfocus = () => selectBlank(j);
      input.addEventListener('input', () => { session.responses[session.current][j] = input.value; progress(); });
      label.append(caption, input); $('answer-fields').append(label); inputRefs.push(input);
    });
    selectBlank(0, false);
    $('previous').disabled = session.current === 0;
    $('next').textContent = session.current === session.ids.length - 1 ? '採点へ進む →' : '次の問題 →';
    $('question-map').replaceChildren();
    session.ids.forEach((id, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = String(i + 1);
      button.classList.toggle('current', i === session.current);
      if (i === session.current) button.setAttribute('aria-current', 'step');
      button.onclick = () => navigate(i);
      $('question-map').append(button);
    });
    progress();
  }

  function pick(character) {
    if (screen !== 'test') return;
    const q = currentQuestion(), input = inputRefs[activeBlank];
    const start = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? input.value.length;
    if (start === end && core.normalize(input.value).length >= q.answers[activeBlank].length) {
      $('ink-status').textContent = '直したい文字を回答欄で選択するか、「1文字消す」を押してね。';
      return;
    }
    input.setRangeText(character, start, end, 'end');
    session.responses[session.current][activeBlank] = input.value;
    progress();
    if (core.normalize(input.value).length >= q.answers[activeBlank].length && activeBlank + 1 < inputRefs.length) selectBlank(activeBlank + 1, false);
  }
  const ink = createInkPad({ canvas: $('ink'), candidates: $('ink-candidates'), status: $('ink-status'), undo: $('ink-undo'), clear: $('ink-clear'), recognize: $('ink-recognize'), onPick: pick });
  $('answer-delete').onclick = () => {
    if (!inputRefs[activeBlank].value && activeBlank > 0) selectBlank(activeBlank - 1);
    const input = inputRefs[activeBlank], chars = Array.from(input.value); chars.pop(); input.value = chars.join('');
    session.responses[session.current][activeBlank] = input.value; input.setSelectionRange(input.value.length, input.value.length); progress();
  };
  $('answer-clear').onclick = () => {
    session.responses[session.current] = currentQuestion().answers.map(() => '');
    inputRefs.forEach(input => { input.value = ''; }); selectBlank(0); progress();
  };
  function navigate(index) {
    if (index < 0 || index >= session.ids.length) return;
    session.current = index; renderQuestion(); window.scrollTo({ top: 0, behavior: 'auto' });
  }
  $('previous').onclick = () => navigate(session.current - 1);
  $('next').onclick = () => session.current < session.ids.length - 1 ? navigate(session.current + 1) : requestGrade();
  function requestGrade() {
    const missing = session.ids.length - answeredCount(session);
    $('grade-message').textContent = missing ? `未回答・入力途中の問題が${missing}問あります。空欄がある問題は不正解として採点します。` : `全${session.ids.length}問に回答しました。結果を見てみよう。`;
    $('grade-dialog').showModal();
  }
  $('finish').onclick = requestGrade;
  $('cancel-grade').onclick = () => $('grade-dialog').close();
  $('confirm-grade').onclick = () => {
    $('grade-dialog').close(); if (screen !== 'test') return;
    session.status = 'completed'; save(); report = core.grade(course, session); ink.setEnabled(false); renderResults();
  };

  function renderResults() {
    show('results');
    $('result-course').textContent = `${course.title} · ${session.mode === 'review' ? '復習の結果' : '53問の結果'}`;
    $('result-title').textContent = report.correct === report.total ? '全問正解、おめでとう！' : '今日の「書けた！」を、たしかめよう。';
    $('score').textContent = String(report.score);
    $('score-summary').textContent = `${report.total}問中 ${report.correct}問正解 · ${report.total - report.correct}問を復習`;
    $('retry-wrong').disabled = report.correct === report.total;
    $('wrong-only').checked = false;
    renderResultList();
  }
  function renderResultList() {
    const list = $('result-list'); list.replaceChildren();
    report.results.forEach((result, index) => {
      if ($('wrong-only').checked && result.correct) return;
      const item = document.createElement('article'), meta = document.createElement('div'), badge = document.createElement('span'), label = document.createElement('span'), text = document.createElement('p'), comparison = document.createElement('div'), user = document.createElement('span'), answer = document.createElement('span');
      item.className = 'result-item'; meta.className = 'result-meta'; badge.className = 'result-badge' + (result.correct ? '' : ' wrong');
      badge.textContent = result.correct ? '○ 正解' : '× 復習しよう';
      label.textContent = `第${index + 1}問 · 教材の問${result.question.number}`;
      meta.append(badge, label); text.className = 'result-sentence'; sentence(text, result.question, 'answer');
      comparison.className = 'answer-comparison'; user.classList.toggle('wrong', !result.correct);
      user.textContent = `あなたの回答：${result.values.some(core.normalize) ? result.userWord : '（未回答）'}`;
      answer.textContent = `正解：${result.question.answer}（${result.question.reading}）`;
      comparison.append(user, answer); item.append(meta, text, comparison); list.append(item);
    });
    if (!list.children.length) { const note = document.createElement('p'); note.className = 'no-results'; note.textContent = '復習する問題はありません。よくできました！'; list.append(note); }
  }
  $('wrong-only').addEventListener('change', renderResultList);
  $('retry-wrong').onclick = () => {
    const ids = report.results.filter(r => !r.correct).map(r => r.question.id);
    if (ids.length) begin(core.makeSession(course, 'ordered', ids));
  };
  $('retry-all').onclick = () => begin(core.makeSession(course, session.order));
  function backToSetup() { save(); ink.setEnabled(false); show('setup'); paintSetup(); }
  $('back-setup').onclick = backToSetup;
  $('pause').onclick = backToSetup;
  window.addEventListener('pagehide', save);
  paintSetup();
})();
