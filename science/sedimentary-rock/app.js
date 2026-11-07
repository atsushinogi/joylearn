"use strict";

const rocks = globalThis.SEDIMENTARY_ROCKS;
const core = globalThis.RockQuiz;
const ids = rocks.map(rock => rock.id);
const byId = id => document.getElementById(id);
const rockById = id => rocks.find(rock => rock.id === id);
const kindLabel = kind => kind === "name" ? "名前" : "解説文";
const isMobile = () => window.matchMedia("(max-width: 740px)").matches;
const state = {
  answers: core.emptyAnswers(), mode: "quiz", kind: "name", target: null,
  choice: null, checked: false, revealed: false, hintId: null, order: {}
};
const cards = new Map();
const fields = { name: new Map(), description: new Map() };

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function say(message, kind = "") {
  byId("feedback").textContent = message;
  byId("feedback").className = `feedback ${kind}`;
}

function buildCollection() {
  rocks.forEach((rock, index) => {
    const card = document.createElement("article");
    card.className = "specimen";
    card.id = `specimen-${rock.id}`;
    card.innerHTML = `<div class="specimen-heading"><h3>標本 <span>${String(index + 1).padStart(2, "0")}</span></h3><span class="specimen-status">0 / 2</span></div>
      <div class="photo-wrap"><img src="${rock.image}" alt="標本${index + 1}の岩石写真" width="600" height="420"><button class="zoom-button" aria-label="標本${index + 1}の写真を拡大"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5M8 5v6M5 8h6"/></svg></button></div>
      <div class="specimen-body"><p class="origin-tag" hidden></p></div>`;
    card.querySelector(".zoom-button").addEventListener("click", () => openPhoto(rock.id));
    for (const kind of ["name", "description"]) {
      const button = document.createElement("button");
      button.className = `answer-field ${kind}-field empty`;
      button.dataset.rock = rock.id;
      button.dataset.kind = kind;
      button.innerHTML = `<span class="field-caption">${kindLabel(kind)}</span><span class="field-value">${kindLabel(kind)}を入れる</span><span class="field-mark" aria-hidden="true">＋</span>`;
      button.addEventListener("click", () => chooseField(kind, rock.id));
      button.addEventListener("dragover", event => {
        if (state.mode !== "quiz" || state.revealed) return;
        event.preventDefault();
        button.classList.add("drag-over");
      });
      button.addEventListener("dragleave", () => button.classList.remove("drag-over"));
      button.addEventListener("drop", event => {
        event.preventDefault();
        button.classList.remove("drag-over");
        try {
          const choice = JSON.parse(event.dataTransfer.getData("text/plain"));
          if (choice.kind === kind && ids.includes(choice.id)) place(kind, rock.id, choice.id);
        } catch { /* Ignore content dragged from outside the app. */ }
      });
      card.querySelector(".specimen-body").append(button);
      fields[kind].set(rock.id, button);
    }
    const hintText = document.createElement("p");
    hintText.className = "specimen-hint";
    hintText.hidden = true;
    hintText.textContent = `ヒント：${rock.hint}`;
    card.querySelector(".specimen-body").append(hintText);
    byId("specimens").append(card);
    cards.set(rock.id, card);
  });
}

function renderBank(container) {
  container.replaceChildren();
  container.classList.toggle("description-bank", state.kind === "description");
  container.setAttribute("aria-label", `${kindLabel(state.kind)}の選択肢`);
  for (const id of state.order[state.kind]) {
    const rock = rockById(id);
    const button = document.createElement("button");
    button.className = "choice";
    button.textContent = state.kind === "name" ? rock.name : rock.description;
    button.setAttribute("aria-label", button.textContent);
    const selected = state.choice?.kind === state.kind && state.choice.id === id;
    const used = Object.values(state.answers[state.kind]).includes(id);
    button.classList.toggle("selected", selected);
    button.classList.toggle("used", used);
    button.setAttribute("aria-pressed", String(selected));
    if (used) button.setAttribute("aria-description", "配置済み。別の空欄にも移動できます。");
    button.disabled = state.revealed;
    button.draggable = !state.revealed;
    const kind = state.kind;
    button.addEventListener("click", () => chooseChoice(kind, id));
    button.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", JSON.stringify({ kind, id }));
      event.dataTransfer.effectAllowed = "move";
      // Keep the dragged DOM node in place until drop.
      state.choice = { kind, id };
      state.target = null;
      button.classList.add("selected");
    });
    container.append(button);
  }
}

function render() {
  const learning = state.mode === "learn";
  const showAnswers = learning || state.revealed;
  const grade = core.gradeAnswers(state.answers, ids);
  document.body.classList.toggle("learning", learning);
  document.body.classList.toggle("revealed", state.revealed);
  rocks.forEach((rock, index) => {
    const card = cards.get(rock.id);
    const count = ["name", "description"].filter(kind => state.answers[kind][rock.id]).length;
    card.querySelector(".specimen-status").textContent = showAnswers ? rock.category : `${count} / 2`;
    const origin = card.querySelector(".origin-tag");
    origin.hidden = !showAnswers;
    origin.textContent = rock.origin;
    card.querySelector(".specimen-hint").hidden = state.hintId !== rock.id || showAnswers;
    card.querySelector("img").alt = showAnswers ? rock.name : `標本${index + 1}の岩石写真`;
    for (const kind of ["name", "description"]) {
      const answerId = showAnswers ? rock.id : state.answers[kind][rock.id];
      const answer = rockById(answerId);
      const text = answer ? (kind === "name" ? answer.name : answer.description) : `${kindLabel(kind)}を入れる`;
      const button = fields[kind].get(rock.id);
      const selected = state.target?.kind === kind && state.target.id === rock.id;
      const marked = state.checked && answer && !showAnswers;
      button.className = `answer-field ${kind}-field ${answer ? "filled" : "empty"}`;
      if (selected) button.classList.add("target");
      if (marked) button.classList.add(answerId === rock.id ? "correct" : "wrong");
      button.disabled = showAnswers;
      button.querySelector(".field-value").textContent = text;
      button.querySelector(".field-mark").textContent = showAnswers ? "" : marked ? (answerId === rock.id ? "✓" : "×") : answer ? "" : "＋";
      button.setAttribute("aria-label", `標本${index + 1}の${kindLabel(kind)}、${answer ? text : "未回答"}${marked ? (answerId === rock.id ? "、正解" : "、もう一度") : ""}`);
      button.setAttribute("aria-pressed", String(selected));
    }
  });
  const count = state.revealed ? 16 : grade.filled;
  byId("progress-count").innerHTML = `${count} <small>/ 16</small>`;
  byId("mobile-progress").innerHTML = `${count} <small>/ 16</small>`;
  byId("progress-fill").style.width = `${count / 16 * 100}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", count);
  byId("progress-label").textContent = state.revealed ? "答えを表示中" : "配置した回答";
  byId("quiz-controls").hidden = learning;
  byId("learning-guide").hidden = !learning;
  byId("instruction").textContent = learning ? "写真と解説を見比べて、岩の材料やできかたを観察しよう。" : "岩の空欄をタップして、名前や解説文を選ぼう。選択肢を先に選んでもOK！";
  byId("task-title").textContent = learning ? "できかたを比べよう" : "選んで、当てはめよう";
  document.querySelector(".task-card .eyebrow").textContent = learning ? "LET'S LEARN" : "LET'S TRY";
  for (const [id, active] of [["quiz-mode", !learning], ["learn-mode", learning]]) {
    byId(id).classList.toggle("active", active);
    byId(id).setAttribute("aria-pressed", String(active));
  }
  document.querySelectorAll("[data-bank-kind]").forEach(button => {
    const active = button.dataset.bankKind === state.kind;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    button.disabled = state.revealed;
  });
  const targetIndex = state.target ? ids.indexOf(state.target.id) + 1 : null;
  const heading = state.target ? `標本${String(targetIndex).padStart(2, "0")}の${kindLabel(state.kind)}を選ぼう` : `${kindLabel(state.kind)}を選んで、写真の下の空欄へ`;
  byId("selection-heading").textContent = heading;
  byId("mobile-choice-title").textContent = `${kindLabel(state.kind)}を選ぼう`;
  byId("mobile-target").textContent = state.target ? `標本 ${String(targetIndex).padStart(2, "0")}` : "選んだあと、空欄をタップ";
  byId("mobile-choice-help").textContent = state.target ? "選ぶと、この標本の空欄に入ります。" : "選んだあと、当てはめたい空欄をタップしよう。";
  const canClear = Boolean(state.target && state.answers[state.target.kind][state.target.id] && !showAnswers);
  byId("clear-answer").hidden = !canClear;
  byId("mobile-clear").hidden = !canClear;
  byId("check").disabled = state.revealed;
  byId("hint").disabled = state.revealed;
  byId("reveal").hidden = state.revealed;
  byId("review").hidden = !state.checked || grade.correct === 16 || state.revealed;
  renderBank(byId("choice-bank"));
  renderBank(byId("mobile-bank"));
}

function chooseField(kind, id) {
  if (state.mode !== "quiz" || state.revealed) return;
  if (state.choice?.kind === kind) { place(kind, id, state.choice.id); return; }
  state.kind = kind;
  state.choice = null;
  state.target = { kind, id };
  say(`標本${ids.indexOf(id) + 1}に入れる${kindLabel(kind)}を選んでね。`);
  render();
  if (isMobile()) openChoices();
}

function chooseChoice(kind, id) {
  if (state.revealed || state.mode !== "quiz") return;
  if (state.target?.kind === kind) { place(kind, state.target.id, id); return; }
  const same = state.choice?.kind === kind && state.choice.id === id;
  state.choice = same ? null : { kind, id };
  state.target = null;
  say(same ? "空欄か、選択肢を選んでね。" : `選んだ${kindLabel(kind)}を入れる空欄をタップしよう。`);
  if (byId("choice-dialog").open) byId("choice-dialog").close();
  render();
}

function place(kind, targetId, choiceId) {
  if (state.mode !== "quiz" || state.revealed) return;
  state.answers = core.placeAnswer(state.answers, kind, targetId, choiceId, ids);
  state.target = null;
  state.choice = null;
  state.checked = false;
  state.hintId = null;
  if (byId("choice-dialog").open) byId("choice-dialog").close();
  const grade = core.gradeAnswers(state.answers, ids);
  say(grade.filled === 16 ? "16の空欄がうまったね！ 答え合わせをしてみよう。" : "入れられたね！ 名前と解説、両方の空欄をうめていこう。");
  render();
}

function setKind(kind) {
  if (state.revealed) return;
  state.kind = kind;
  state.choice = null;
  if (state.target?.kind !== kind) state.target = null;
  render();
}

function setMode(mode) {
  state.mode = mode;
  state.target = null;
  state.choice = null;
  say(mode === "learn" ? "写真と解説を見比べてみよう。" : state.revealed ? "答えを表示しています。「やり直す」でまた挑戦しよう。" : "回答は残っています。続きから挑戦しよう。");
  render();
}

function check() {
  if (state.mode !== "quiz" || state.revealed) return;
  state.checked = true;
  state.target = null;
  state.choice = null;
  const grade = core.gradeAnswers(state.answers, ids);
  say(grade.correct === 16 ? "16問すべて正解！ 岩の名前とできかたをマスターしたね！" : `${grade.correct} / 16 問正解。${grade.empty ? `あと${grade.empty}か所が空欄です。` : "×のついた回答を入れ替えてみよう。"}`, grade.correct === 16 ? "success" : "notice");
  render();
  if (isMobile()) byId("feedback").scrollIntoView({ behavior: "smooth", block: "center" });
}

function focusField(field, openDialog = false) {
  state.kind = field.kind;
  state.target = { kind: field.kind, id: field.id };
  state.choice = null;
  render();
  const button = fields[field.kind].get(field.id);
  button.scrollIntoView({ behavior: "smooth", block: "center" });
  button.focus({ preventScroll: true });
  if (openDialog && isMobile()) openChoices();
}

function hint() {
  const grade = core.gradeAnswers(state.answers, ids);
  const target = state.target || grade.fields.find(field => field.result !== "correct");
  if (!target) { say("すべて正しく入っています！ 答え合わせで確かめよう。", "success"); return; }
  state.hintId = target.id;
  focusField(target);
  say(`標本${ids.indexOf(target.id) + 1}のヒント：${rockById(target.id).hint}`, "notice");
}

function clearSelected() {
  if (!state.target || state.revealed) return;
  state.answers = core.clearAnswer(state.answers, state.target.kind, state.target.id);
  state.checked = false;
  if (byId("choice-dialog").open) byId("choice-dialog").close();
  say("選んだ欄を空にしました。もう一度選んでみよう。");
  render();
}

function openChoices() {
  if (state.mode !== "quiz" || state.revealed) return;
  render();
  if (!byId("choice-dialog").open) byId("choice-dialog").showModal();
}

function openPhoto(id) {
  const rock = rockById(id);
  const label = state.mode === "learn" || state.revealed ? rock.name : `標本 ${String(ids.indexOf(id) + 1).padStart(2, "0")}`;
  byId("photo-title").textContent = label;
  byId("large-photo").src = rock.image;
  byId("large-photo").alt = `${label}の岩石写真`;
  byId("photo-dialog").showModal();
}

function reset() {
  state.answers = core.emptyAnswers();
  state.mode = "quiz";
  state.kind = "name";
  state.target = null;
  state.choice = null;
  state.checked = false;
  state.revealed = false;
  state.hintId = null;
  state.order = { name: shuffled(ids), description: shuffled(ids) };
  say("まずは、見たことのある岩から。");
  render();
}

document.querySelectorAll("[data-bank-kind]").forEach(button => button.addEventListener("click", () => setKind(button.dataset.bankKind)));
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => byId(button.dataset.close).close()));
byId("quiz-mode").addEventListener("click", () => setMode("quiz"));
byId("learn-mode").addEventListener("click", () => setMode("learn"));
byId("return-to-quiz").addEventListener("click", () => setMode("quiz"));
byId("check").addEventListener("click", check);
byId("mobile-check").addEventListener("click", check);
byId("hint").addEventListener("click", hint);
byId("clear-answer").addEventListener("click", clearSelected);
byId("mobile-clear").addEventListener("click", clearSelected);
byId("mobile-pick").addEventListener("click", openChoices);
byId("mobile-choices-open").addEventListener("click", openChoices);
byId("review").addEventListener("click", () => {
  const field = core.gradeAnswers(state.answers, ids).fields.find(item => item.result !== "correct");
  if (field) focusField(field, true);
});
byId("reference-open").addEventListener("click", () => byId("reference-dialog").showModal());
byId("reveal").addEventListener("click", () => {
  state.revealed = true;
  state.target = null;
  state.choice = null;
  say("答えを表示しています。「やり直す」で、また挑戦できます。", "success");
  render();
});
byId("reset").addEventListener("click", () => {
  if (core.gradeAnswers(state.answers, ids).filled || state.revealed) byId("reset-dialog").showModal();
  else reset();
});
byId("reset-confirm").addEventListener("click", () => { byId("reset-dialog").close(); reset(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) {
    state.choice = null;
    state.target = null;
    render();
  }
});
window.matchMedia("(max-width: 740px)").addEventListener("change", event => {
  if (!event.matches && byId("choice-dialog").open) byId("choice-dialog").close();
});
buildCollection();
reset();
