// Run with: node quiz/social-studies-2-lesson10/verify.cjs
// Exercises the actual app in a small DOM substitute; no browser dependencies.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const base = __dirname;
const read = (file) => fs.readFileSync(path.join(base, file), "utf8");
const html = read("index.html");
const data = JSON.parse(read("quiz-data.json"));
const source = JSON.parse(read("icon-assets/manifest.source.json"));
assert.deepEqual(data, source.questions, "Original question data must be preserved");
const records = read("icon-assets/manifest.jsonl").trim().split("\n").filter(Boolean).map(JSON.parse);
const dataContext = vm.createContext({});
vm.runInContext(read("quiz-data.js") + read("choice-images.js"), dataContext);
const jsData = JSON.parse(vm.runInContext("JSON.stringify(QUIZ_DATA)", dataContext));
const images = JSON.parse(vm.runInContext("JSON.stringify(CHOICE_IMAGES)", dataContext));
assert.deepEqual(jsData, data);
assert.equal(data.length, 60);
assert.equal(new Set(images.flat()).size, 240);
assert.equal(records.length, 240);
data.forEach((question, index) => {
  assert.equal(question.id, index + 1);
  assert.equal(question.options.length, 4);
  assert.equal(question.options.filter((option) => option.correct).length, 1);
  question.options.forEach((option, oi) => {
    const record = records.find((entry) => entry.question_number === question.id && entry.option_index === oi);
    assert.equal(record.option_label, option.label);
    assert.equal(images[index][oi], "icon-assets/webp-148/" + record.id + ".webp");
    const file = fs.readFileSync(path.join(base, images[index][oi]));
    assert.equal(file.toString("ascii", 0, 4), "RIFF");
    assert.equal(file.toString("ascii", 8, 12), "WEBP");
  });
});

class Node {
  constructor(tag, doc) {
    this.tagName = tag;
    this.doc = doc;
    this.children = [];
    this.events = {};
    this.attrs = {};
    this.style = {};
    this.className = "";
    this.text = "";
    this.hidden = false;
    this.disabled = false;
    this.value = "";
    this.classList = {
      add: (name) => { this.className = [...new Set(this.className.split(/\s+/).concat(name))].join(" "); },
      toggle: (name, force) => {
        const classes = this.className.split(/\s+/).filter(Boolean);
        this.className = classes.filter((item) => item !== name).concat(force ? name : []).join(" ");
      }
    };
  }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return this.text + this.children.map((child) => child.textContent).join(""); }
  append(...nodes) {
    nodes.forEach((node) => {
      if (node.tagName === "#fragment") this.children.push(...node.children);
      else this.children.push(node);
    });
  }
  replaceChildren(...nodes) { this.children = []; this.text = ""; this.append(...nodes); }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name]; }
  addEventListener(name, handler) { (this.events[name] ||= []).push(handler); }
  dispatch(name, extra = {}) {
    const event = { preventDefault() {}, ...extra };
    (this.events[name] || []).forEach((handler) => handler(event));
  }
  click() { if (!this.disabled) this.dispatch("click"); }
  focus() { this.doc.activeElement = this; }
}

function app() {
  const nodes = {};
  const document = {
    activeElement: null,
    createElement: (tag) => new Node(tag, document),
    createDocumentFragment: () => new Node("#fragment", document),
    getElementById: (id) => { assert.ok(nodes[id], "Missing HTML element: " + id); return nodes[id]; },
    querySelector: (selector) => {
      assert.equal(selector, 'input[name="count"]:checked');
      return document.countInput;
    },
    countInput: { value: "10" }
  };
  for (const match of html.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)) {
    assert.ok(!nodes[match[3]], "Duplicate HTML id");
    const node = new Node(match[1], document);
    node.id = match[3];
    node.hidden = /\bhidden\b/.test(match[2]);
    node.disabled = /\bdisabled\b/.test(match[2]);
    nodes[node.id] = node;
  }
  nodes.questionOrder.value = "random";
  const context = vm.createContext({ document });
  vm.runInContext(read("quiz-data.js") + read("choice-images.js") + read("app.js"), context);
  const get = (id) => nodes[id];
  const start = (count, order = "random") => {
    document.countInput.value = String(count);
    get("questionOrder").value = order;
    get("startForm").dispatch("submit");
  };
  const question = () => data[Number(get("sourceNumber").textContent.match(/\d+/)[0]) - 1];
  const choose = (correct = true) => {
    const q = question();
    const buttons = get("options").children;
    assert.equal(buttons.length, 4);
    const opts = buttons.map((button) => {
      const label = button.children.find((node) => node.className === "option-label").textContent;
      const optIndex = q.options.findIndex((opt) => opt.label === label);
      assert.ok(optIndex !== -1);
      assert.equal(button.children.find((node) => node.tagName === "img").src, images[q.id - 1][optIndex]);
      return q.options[optIndex];
    });
    const button = buttons[opts.findIndex((opt) => Boolean(opt.correct) === correct)];
    button.click();
    assert.equal(get("explanation").textContent, q.explanation);
    assert.equal(get("feedback").hidden, false);
    assert.ok(buttons.every((node) => node.disabled));
    assert.equal(buttons.filter((node) => node.className.includes("correct")).length, 1);
    assert.equal(document.activeElement.id, "nextButton");
    const score = get("scoreText").textContent;
    button.dispatch("click"); // Even a forced duplicate event must be ignored.
    assert.equal(get("scoreText").textContent, score);
    return q.id;
  };
  return { get, start, choose, question, document };
}

// Full runs cover every question, scoring extremes, mapping after both shuffles,
// unanswered next events, duplicate answers, and progress at completion.
for (const allCorrect of [true, false]) {
  const a = app();
  assert.equal(a.get("startView").hidden, false);
  a.start(60);
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    const before = a.get("questionIndex").textContent;
    a.get("nextButton").dispatch("click");
    assert.equal(a.get("questionIndex").textContent, before);
    seen.add(a.choose(allCorrect));
    a.get("nextButton").click();
  }
  assert.equal(seen.size, 60);
  assert.equal(a.get("resultView").hidden, false);
  assert.equal(a.get("resultCorrect").textContent, allCorrect ? "60" : "0");
  assert.equal(a.get("progress").getAttribute("aria-valuenow"), "60");
  assert.equal(a.get("progressFill").style.width, "100%");
  assert.equal(a.get("reviewButton").hidden, allCorrect);
}

// Original order, shorter runs, and repeated review must include only mistakes.
const a = app();
a.start(10, "original");
for (let i = 1; i <= 10; i++) {
  assert.equal(a.question().id, i);
  a.choose(i > 3);
  a.get("nextButton").click();
}
assert.equal(a.get("resultCorrect").textContent, "7");
a.get("reviewButton").click();
const reviewed = new Set();
for (let i = 0; i < 3; i++) {
  reviewed.add(a.choose(i !== 0));
  a.get("nextButton").click();
}
assert.deepEqual([...reviewed].sort(), [1, 2, 3]);
assert.equal(a.get("resultCorrect").textContent, "2");
a.get("reviewButton").click();
assert.equal(a.get("progress").getAttribute("aria-valuemax"), "1");
a.choose(true);
a.get("nextButton").click();
assert.equal(a.get("reviewButton").hidden, true);
a.get("retryButton").click();
assert.equal(a.get("progress").getAttribute("aria-valuemax"), "10");
assert.equal(a.question().id, 1);
assert.equal(a.get("scoreText").textContent, "正解 0 / 0 問");

// Gallery must retain quiz state, render correct answers with their own images,
// support keyboard tabs and search, and avoid duplicate builds.
const current = a.get("questionText").textContent;
a.get("tabQuiz").dispatch("keydown", { key: "ArrowRight" });
assert.equal(a.get("galleryPane").hidden, false);
assert.equal(a.document.activeElement.id, "tabGallery");
assert.equal(a.get("tabGallery").getAttribute("aria-selected"), "true");
const gallery = a.get("galleryList").children;
assert.equal(gallery.length, 60);
gallery.forEach((article, index) => {
  const details = article.children.find((node) => node.tagName === "details");
  assert.equal(details.children[2].textContent, data[index].explanation);
  const options = details.children[1].children;
  assert.equal(options.filter((node) => node.className.includes("correct")).length, 1);
  options.forEach((option, oi) => {
    assert.equal(option.children[0].src, images[index][oi]);
    assert.equal(option.children[0].loading, "lazy");
    assert.equal(option.children[1].textContent, data[index].options[oi].label);
  });
});
a.get("searchInput").value = "茶道";
a.get("searchInput").dispatch("input");
assert.equal(gallery.filter((node) => !node.hidden).length, 2);
a.get("searchInput").value = "存在しない検索語";
a.get("searchInput").dispatch("input");
assert.equal(a.get("emptyMessage").hidden, false);
a.get("searchInput").value = "";
a.get("searchInput").dispatch("input");
assert.equal(gallery.filter((node) => !node.hidden).length, 60);
a.get("tabGallery").dispatch("keydown", { key: "Home" });
assert.equal(a.get("quizPane").hidden, false);
assert.equal(a.get("questionText").textContent, current);
a.get("tabGallery").click();
assert.equal(a.get("galleryList").children.length, 60);
a.get("tabQuiz").click();

// Settings return and 20-question selection.
for (let i = 0; i < 10; i++) { a.choose(true); a.get("nextButton").click(); }
a.get("settingsButton").click();
assert.equal(a.get("startView").hidden, false);
a.start(20, "original");
for (let i = 1; i <= 20; i++) {
  assert.equal(a.question().id, i);
  a.choose(true);
  a.get("nextButton").click();
}
assert.equal(a.get("resultCorrect").textContent, "20");
console.log("PASS: 60 questions / 240 image mappings, shuffled perfect and zero scores, 10/20/60 modes, original order, answer guards, repeated mistake review, restart, keyboard tabs, gallery and search.");
