(function () {
  "use strict";

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Attach each image using the original positions before shuffling either list.
  const questions = QUIZ_DATA.map((item, qi) => ({
    ...item,
    options: item.options.map((option, oi) => ({
      ...option,
      image: CHOICE_IMAGES[qi][oi]
    }))
  }));
  const TOTAL = questions.length;
  let order = shuffle([...Array(TOTAL).keys()]);
  let pos = 0;
  let correctCount = 0;
  let answered = 0;
  let locked = false;

  const qIndexEl = document.getElementById("qIndex");
  const qTextEl = document.getElementById("qText");
  const optionsEl = document.getElementById("options");
  const feedbackMsgEl = document.getElementById("feedbackMsg");
  const explanationEl = document.getElementById("explanation");
  const nextBtn = document.getElementById("nextBtn");
  const progressFill = document.getElementById("progressFill");
  const scoreText = document.getElementById("scoreText");
  const quizView = document.getElementById("quizView");
  const summaryView = document.getElementById("summaryView");
  const summaryScore = document.getElementById("summaryScore");
  const summaryLine = document.getElementById("summaryLine");
  const tabQuiz = document.getElementById("tabQuiz");
  const tabGallery = document.getElementById("tabGallery");
  const quizPane = document.getElementById("quizPane");
  const galleryView = document.getElementById("galleryView");

  function iconMarkup(option, lazy = false) {
    return '<img src="' + option.image + '" alt="" width="148" height="148" decoding="async"' +
      (lazy ? ' loading="lazy"' : '') + '>';
  }

  const CHECK_FLAG =
    '<span class="check-flag"><svg viewBox="0 0 24 24" fill="none">' +
    '<path d="M5 13l4 4 10-10" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg></span>";

  let galleryBuilt = false;

  function buildGallery() {
    if (galleryBuilt) return;
    galleryBuilt = true;
    const frag = document.createDocumentFragment();

    questions.forEach((item, qi) => {
      const article = document.createElement("article");
      article.className = "gitem";

      const optsHtml = item.options
        .map((o) => {
          return (
            '<div class="gopt' + (o.correct ? " correct" : "") + '">' +
            '<span class="gbadge">' +
            iconMarkup(o, true) +
            (o.correct ? CHECK_FLAG : "") +
            "</span>" +
            '<span class="gopt-label">' + o.label + "</span>" +
            (o.furigana ? '<span class="gopt-furi">' + o.furigana + "</span>" : "") +
            "</div>"
          );
        })
        .join("");

      article.innerHTML =
        '<div class="gitem-num">問 ' + (qi + 1) + "</div>" +
        '<p class="gitem-q">' + item.q + "</p>" +
        '<div class="gitem-opts">' + optsHtml + "</div>" +
        '<p class="explanation">' + item.explanation + "</p>";

      frag.appendChild(article);
    });

    galleryView.appendChild(frag);
  }

  function showQuizPane() {
    quizPane.hidden = false;
    galleryView.hidden = true;
    tabQuiz.classList.add("active");
    tabQuiz.setAttribute("aria-selected", "true");
    tabQuiz.tabIndex = 0;
    tabGallery.tabIndex = -1;
    tabGallery.classList.remove("active");
    tabGallery.setAttribute("aria-selected", "false");
  }

  function showGalleryPane() {
    buildGallery();
    quizPane.hidden = true;
    galleryView.hidden = false;
    tabGallery.classList.add("active");
    tabGallery.setAttribute("aria-selected", "true");
    tabGallery.tabIndex = 0;
    tabQuiz.tabIndex = -1;
    tabQuiz.classList.remove("active");
    tabQuiz.setAttribute("aria-selected", "false");
  }

  tabQuiz.addEventListener("click", showQuizPane);
  tabGallery.addEventListener("click", showGalleryPane);
  [tabQuiz, tabGallery].forEach((tab) => {
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === "Home" ? tabQuiz : event.key === "End" ? tabGallery : tab === tabQuiz ? tabGallery : tabQuiz;
      target.click();
      target.focus();
    });
  });

  function updateHud() {
    progressFill.style.width = (answered / TOTAL * 100) + "%";
    scoreText.textContent = correctCount + " / " + answered;
  }

  function renderQuestion() {
    locked = false;
    feedbackMsgEl.textContent = "";
    feedbackMsgEl.className = "msg";
    nextBtn.classList.remove("show");
    nextBtn.hidden = true;
    nextBtn.disabled = true;
    nextBtn.textContent = pos === TOTAL - 1 ? "結果を見る →" : "次の問題 →";
    explanationEl.hidden = true;
    explanationEl.textContent = "";

    const qi = order[pos];
    const item = questions[qi];
    qIndexEl.textContent = "問 " + (pos + 1) + " / " + TOTAL;
    qTextEl.textContent = item.q;

    const opts = shuffle(item.options);
    optionsEl.innerHTML = "";

    opts.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML =
        '<span class="badge">' + iconMarkup(opt) + "</span>" +
        '<span class="opt-label">' + opt.label + "</span>" +
        (opt.furigana ? '<span class="opt-furi">' + opt.furigana + "</span>" : "");
      btn.addEventListener("click", () => handleAnswer(btn, opt, opts));
      optionsEl.appendChild(btn);
    });
  }

  function handleAnswer(btn, opt, opts) {
    if (locked) return;
    locked = true;
    answered++;
    if (opt.correct) correctCount++;

    const buttons = Array.from(optionsEl.children);
    buttons.forEach((b, i) => {
      b.disabled = true;
      const o = opts[i];
      if (o.correct) {
        b.classList.add("correct");
        if (b === btn) b.classList.add("pulse");
      } else if (b === btn) {
        b.classList.add("wrong", "pulse");
      } else {
        b.classList.add("dim");
      }
    });

    if (opt.correct) {
      feedbackMsgEl.textContent = "正解！";
      feedbackMsgEl.className = "msg is-correct";
    } else {
      const correctOpt = opts.find((o) => o.correct);
      feedbackMsgEl.textContent = "不正解… 正解は「" + correctOpt.label + "」";
      feedbackMsgEl.className = "msg is-wrong";
    }

    explanationEl.textContent = questions[order[pos]].explanation;
    explanationEl.hidden = false;
    updateHud();
    nextBtn.hidden = false;
    nextBtn.disabled = false;
    nextBtn.classList.add("show");
    nextBtn.focus();
  }

  function goNext() {
    if (!locked) return;
    pos++;
    if (pos >= TOTAL) {
      showSummary();
      return;
    }
    renderQuestion();
    qTextEl.focus();
  }

  function showSummary() {
    quizView.hidden = true;
    summaryView.hidden = false;
    summaryScore.textContent = correctCount + " / " + TOTAL;
    const rate = correctCount / TOTAL;
    let line = "お疲れさまでした！";
    if (rate === 1) line = "満点！江戸幕府の政治マスターだね！";
    else if (rate >= 0.8) line = "すごい！よく覚えているね！";
    else if (rate >= 0.5) line = "いい調子！もう一度で満点をねらおう。";
    else line = "「問題を全部見る」でおさらいして、もう一度挑戦しよう。";
    summaryLine.textContent = line;
    summaryScore.focus();
  }

  function restart() {
    order = shuffle([...Array(TOTAL).keys()]);
    pos = 0;
    correctCount = 0;
    answered = 0;
    updateHud();
    summaryView.hidden = true;
    quizView.hidden = false;
    renderQuestion();
    qTextEl.focus();
  }

  nextBtn.addEventListener("click", goNext);
  document.getElementById("restartBtn").addEventListener("click", restart);

  updateHud();
  renderQuestion();
})();
