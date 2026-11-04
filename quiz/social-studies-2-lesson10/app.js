(function () {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const questions = QUIZ_DATA.map((question, index) => ({
    ...question,
    // Bind images to their original choices before either list is shuffled.
    options: question.options.map((option, optionIndex) => ({
      ...option,
      image: CHOICE_IMAGES[index][optionIndex]
    }))
  }));
  const views = [byId("startView"), byId("playView"), byId("resultView")];
  const tabs = [byId("tabQuiz"), byId("tabGallery")];
  const panes = [byId("quizPane"), byId("galleryPane")];
  let session = [];
  let position = 0;
  let correctCount = 0;
  let missed = [];
  let locked = false;
  let reviewing = false;
  let lastConfig = { count: 10, order: "random" };
  let galleryItems = null;

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function optionContents(option, lazy) {
    const contents = document.createDocumentFragment();
    const img = document.createElement("img");
    img.src = option.image;
    img.alt = "";
    img.width = 148;
    img.height = 148;
    img.decoding = "async";
    if (lazy) img.loading = "lazy";
    contents.append(img, element("span", "option-label", option.label));
    if (option.furigana) contents.append(element("span", "option-reading", option.furigana));
    return contents;
  }

  function showView(id) {
    views.forEach((view) => { view.hidden = view.id !== id; });
  }

  function selectTab(index) {
    if (index === 1 && !galleryItems) buildGallery();
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panes[i].hidden = i !== index;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(index));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
      selectTab(target);
      tabs[target].focus();
    });
  });

  function updateProgress() {
    const answered = position + (locked ? 1 : 0);
    byId("progressFill").style.width = (answered / session.length * 100) + "%";
    byId("progress").setAttribute("aria-valuemax", String(session.length));
    byId("progress").setAttribute("aria-valuenow", String(answered));
    byId("progress").setAttribute("aria-valuetext", session.length + "問中" + answered + "問回答");
    byId("scoreText").textContent = "正解 " + correctCount + " / " + answered + " 問";
  }

  function renderQuestion() {
    locked = false;
    const question = session[position];
    byId("questionIndex").textContent = "第 " + (position + 1) + " 問 / " + session.length + " 問";
    byId("sourceNumber").textContent = "教材の問 " + question.id;
    byId("questionText").textContent = question.q;
    byId("feedback").hidden = true;
    byId("feedback").className = "feedback";
    byId("feedbackMessage").textContent = "";
    byId("correctAnswer").textContent = "";
    byId("explanation").textContent = "";
    const next = byId("nextButton");
    next.hidden = true;
    next.disabled = true;
    next.textContent = position === session.length - 1 ? "結果を見る →" : "次の問題へ →";
    byId("options").replaceChildren();
    const options = shuffle(question.options);
    options.forEach((option, index) => {
      const button = element("button", "option");
      button.type = "button";
      const number = element("span", "option-number", String(index + 1).padStart(2, "0"));
      number.setAttribute("aria-hidden", "true");
      button.append(number, optionContents(option, false));
      button.addEventListener("click", () => answer(question, option, options, button));
      byId("options").append(button);
    });
    updateProgress();
    byId("questionText").focus();
  }

  function answer(question, selected, options, selectedButton) {
    if (locked || byId("playView").hidden || session[position] !== question) return;
    locked = true;
    if (selected.correct) correctCount++;
    else missed.push(question);

    Array.from(byId("options").children).forEach((button, index) => {
      button.disabled = true;
      if (options[index].correct) {
        button.classList.add("correct");
        button.append(element("span", "answer-mark", "○ 正解"));
      } else if (button === selectedButton) {
        button.classList.add("wrong");
        button.append(element("span", "answer-mark", "× 選んだ答え"));
      }
    });

    byId("feedback").hidden = false;
    byId("feedback").classList.toggle("is-wrong", !selected.correct);
    byId("feedbackMessage").textContent = selected.correct ? "○ 正解！" : "× おしい！ 解説を見てみよう。";
    byId("correctAnswer").textContent = "正解は「" + options.find((option) => option.correct).label + "」";
    byId("explanation").textContent = question.explanation;
    updateProgress();
    byId("nextButton").hidden = false;
    byId("nextButton").disabled = false;
    byId("nextButton").focus();
  }

  function begin(items, isReview) {
    session = items;
    position = 0;
    correctCount = 0;
    missed = [];
    reviewing = isReview;
    byId("roundLabel").textContent = reviewing ? "間違えた問題を復習中" : "歴史めぐりに挑戦中";
    selectTab(0);
    showView("playView");
    renderQuestion();
  }

  function startConfiguredQuiz() {
    const ordered = lastConfig.order === "random" ? shuffle(questions) : questions.slice();
    begin(ordered.slice(0, lastConfig.count), false);
  }

  byId("startForm").addEventListener("submit", (event) => {
    event.preventDefault();
    lastConfig = {
      count: Number(document.querySelector('input[name="count"]:checked').value),
      order: byId("questionOrder").value
    };
    startConfiguredQuiz();
  });

  byId("nextButton").addEventListener("click", () => {
    if (!locked || byId("playView").hidden) return;
    if (position + 1 === session.length) showResult();
    else {
      position++;
      renderQuestion();
    }
  });

  function showResult() {
    showView("resultView");
    byId("resultKind").textContent = reviewing ? "復習の成績" : "今回の成績";
    byId("resultCorrect").textContent = String(correctCount);
    byId("resultTotal").textContent = " / " + session.length + " 問正解";
    const rate = correctCount / session.length;
    byId("resultTitle").textContent = rate === 1 ? "全問正解、おみごと！" : "おつかれさま！";
    byId("resultMessage").textContent = rate === 1
      ? (reviewing ? "間違えた問題も、しっかり覚えられたね！" : "歴史のつながりが見えてきたね。次の挑戦も楽しもう！")
      : rate >= 0.8 ? "よく覚えているね！ あと少し、復習して満点を目指そう。"
      : "一問ずつ覚えていこう。間違えた問題を、もう一度！";
    byId("reviewButton").hidden = missed.length === 0;
    byId("reviewButton").textContent = "間違えた " + missed.length + " 問を復習 →";
    byId("resultTitle").focus();
  }

  byId("reviewButton").addEventListener("click", () => {
    if (missed.length) begin(shuffle(missed), true);
  });
  byId("retryButton").addEventListener("click", startConfiguredQuiz);
  byId("settingsButton").addEventListener("click", () => {
    showView("startView");
    byId("startTitle").focus();
  });

  function normalize(text) {
    return text.normalize("NFKC").toLocaleLowerCase("ja");
  }

  function buildGallery() {
    const fragment = document.createDocumentFragment();
    galleryItems = questions.map((question) => {
      const article = element("article", "paper gallery-item");
      article.append(element("span", "section-label", "問 " + question.id));
      article.append(element("h3", "", question.q));
      const details = document.createElement("details");
      details.append(element("summary", "", "答えと解説を見る"));
      const options = element("div", "gallery-options");
      question.options.forEach((option) => {
        const choice = element("div", "gallery-option" + (option.correct ? " correct" : ""));
        choice.append(optionContents(option, true));
        if (option.correct) choice.append(element("span", "gallery-correct", "○ 正解"));
        options.append(choice);
      });
      details.append(options, element("p", "explanation", question.explanation));
      article.append(details);
      fragment.append(article);
      return {
        article,
        text: normalize([question.id, question.q, question.explanation,
          ...question.options.flatMap((option) => [option.label, option.furigana || ""])].join(" "))
      };
    });
    byId("galleryList").append(fragment);
    filterGallery();
  }

  function filterGallery() {
    if (!galleryItems) return;
    const terms = normalize(byId("searchInput").value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    galleryItems.forEach(({ article, text }) => {
      const matches = terms.every((term) => text.includes(term));
      article.hidden = !matches;
      if (matches) count++;
    });
    byId("searchCount").textContent = count + " / " + questions.length + " 問を表示";
    byId("emptyMessage").hidden = count !== 0;
  }
  byId("searchInput").addEventListener("input", filterGallery);
})();
