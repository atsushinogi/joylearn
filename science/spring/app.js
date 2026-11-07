(function () {
  'use strict';
  const { templates, sources, createQuestion, grade } = window.SpringQuiz;
  const { renderDiagram } = window.SpringDiagrams;
  const $ = id => document.getElementById(id);
  const lastSignatures = new Map();
  let course = 'all';
  let queue = [];
  let currentIndex = 0;
  let currentQuestion;
  let answered = false;
  let history = [];

  function updateScore() {
    $('score').textContent = history.filter(item => item.correct).length;
    $('score-denominator').textContent = `/ ${history.length} 問`;
    $('progress-bar').style.width = `${history.length / queue.length * 100}%`;
  }

  function startSession(selectedCourse, ids) {
    course = selectedCourse;
    queue = ids || templates.filter(item => course === 'all' || item.category === course).map(item => item.id);
    currentIndex = 0;
    history = [];
    $('quiz').hidden = false;
    $('results').hidden = true;
    document.querySelectorAll('[data-course]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.course === course)));
    renderQuestion();
  }

  function renderQuestion() {
    const id = queue[currentIndex];
    currentQuestion = createQuestion(id, Math.random, lastSignatures.get(id));
    lastSignatures.set(id, currentQuestion.signature);
    answered = false;
    const q = currentQuestion;
    $('topic').textContent = q.title;
    $('category-tag').textContent = q.category === 'spring' ? 'ばね' : '浮力';
    $('category-tag').classList.toggle('water', q.category === 'buoyancy');
    $('figure-number').textContent = `FIG. ${String(templates.findIndex(item => item.id === id) + 1).padStart(2, '0')}`;
    $('diagram').innerHTML = renderDiagram(q);
    $('diagram-note').textContent = q.note || (q.category === 'spring' ? '図は模式図です。数値を使って考えよう。' : '図の「?」に入る答えを考えよう。');
    $('question-text').textContent = q.prompt;
    $('conditions').textContent = `${q.facts}\n${q.conditions}`;
    $('question-count').textContent = `QUESTION ${String(currentIndex + 1).padStart(2, '0')} / ${queue.length}`;
    $('coverage').textContent = queue.length === 24 ? 'すべての図をひとめぐり' : queue.length === 11 ? 'ばねの図をひとめぐり' : queue.length === 13 ? '浮力の図をひとめぐり' : '選んだ図を練習中';
    $('feedback').hidden = true;
    $('feedback').replaceChildren();
    $('next').hidden = true;
    $('answer-prompt').hidden = false;
    $('choices').replaceChildren();
    q.options.forEach((value, index) => {
      const button = document.createElement('button');
      button.className = 'choice';
      const letter = document.createElement('span');
      letter.className = 'choice-letter';
      letter.textContent = 'ABCD'[index];
      const label = document.createElement('span');
      label.textContent = `${value}${q.unit ? ` ${q.unit}` : ''}`;
      button.append(letter, label);
      button.addEventListener('click', () => answer(index));
      $('choices').append(button);
    });
    updateScore();
  }

  function answer(index) {
    if (answered) return;
    answered = true;
    const q = currentQuestion;
    const correct = grade(q, index);
    history.push({ question: q, selected: index, correct });
    [...$('choices').children].forEach((button, optionIndex) => {
      button.disabled = true;
      if (q.options[optionIndex] === q.answer) {
        button.classList.add('correct');
        button.querySelector('.choice-letter').textContent = '○';
      } else if (optionIndex === index) {
        button.classList.add('wrong');
        button.querySelector('.choice-letter').textContent = '×';
      }
    });
    const heading = document.createElement('strong');
    heading.textContent = correct ? '正解！ その調子。' : `おしい！ 正解は ${q.answer}${q.unit ? ` ${q.unit}` : ''}`;
    const explanation = document.createElement('p');
    explanation.textContent = q.explanation;
    $('feedback').append(heading, explanation);
    $('feedback').classList.toggle('incorrect', !correct);
    $('feedback').hidden = false;
    $('answer-prompt').hidden = true;
    $('next').innerHTML = currentIndex === queue.length - 1 ? '結果を見る <span aria-hidden="true">→</span>' : '次の問題へ <span aria-hidden="true">→</span>';
    $('next').hidden = false;
    updateScore();
  }

  function showResults() {
    $('quiz').hidden = true;
    $('results').hidden = false;
    const correct = history.filter(item => item.correct).length;
    $('result-score').innerHTML = `${correct} <small>/ ${history.length} 問正解</small>`;
    const figureCount = new Set(history.map(item => item.question.source)).size;
    $('result-message').textContent = `${figureCount}組の図を使って練習しました。${correct === history.length ? '全問正解！ 新しい数字にも挑戦してみよう。' : 'まちがえたところは、解説を読んでもう一度。'}`;
    $('review-list').replaceChildren();
    history.filter(item => !item.correct).forEach(item => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = item.question.title;
      const explanation = document.createElement('p');
      explanation.textContent = `${item.question.prompt}\n\nあなたの答え：${item.question.options[item.selected]} ${item.question.unit}\n正解：${item.question.answer} ${item.question.unit}\n\n${item.question.explanation}`;
      details.append(summary, explanation);
      $('review-list').append(details);
    });
    $('retry-wrong').hidden = correct === history.length;
    $('results').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function showReference() {
    const source = currentQuestion.sourceInfo;
    $('reference-title').textContent = source.title;
    $('reference-image').src = source.image;
    $('reference-image').alt = `${source.caption}・${source.title}`;
    $('reference-caption').textContent = `${source.file} ／ ${source.caption}`;
    $('reference-dialog').showModal();
  }

  $('next').addEventListener('click', () => {
    if (!answered) return;
    if (currentIndex === queue.length - 1) return showResults();
    currentIndex++;
    renderQuestion();
    $('question-text').focus({ preventScroll: true });
    $('quiz').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  $('restart').addEventListener('click', () => startSession(course));
  $('play-again').addEventListener('click', () => startSession(course));
  $('retry-wrong').addEventListener('click', () => {
    const wrongIds = history.filter(item => !item.correct).map(item => item.question.id);
    startSession(course, wrongIds);
  });
  document.querySelectorAll('[data-course]').forEach(button => button.addEventListener('click', () => startSession(button.dataset.course)));
  $('open-reference').addEventListener('click', showReference);
  $('open-library').addEventListener('click', () => $('library-dialog').showModal());
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  });
  sources.forEach(source => {
    const card = document.createElement('button');
    card.className = 'library-card';
    const image = document.createElement('img');
    image.src = source.image;
    image.alt = source.title;
    image.loading = 'lazy';
    const title = document.createElement('strong');
    title.textContent = source.title;
    const caption = document.createElement('span');
    caption.textContent = `${source.caption} → 練習する`;
    card.append(image, title, caption);
    card.addEventListener('click', () => {
      const related = templates.filter(template => template.source === source.id);
      $('library-dialog').close();
      startSession(related[0].category, related.map(template => template.id));
      $('quiz').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    $('library-grid').append(card);
  });
  startSession('all');
})();
