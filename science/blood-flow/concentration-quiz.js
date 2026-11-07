"use strict";

(function (root) {
  const core = root.ConcentrationCore;
  const byId = id => document.getElementById(id);
  const palette = ["#d8eee1", "#a3cbb4", "#5e9e7c", "#245f42"];
  const toneNames = ["とてもうすい", "うすい", "やや濃い", "濃い"];
  const state = { started: false, order: [], answers: {}, selected: null, target: null, checked: false, revealed: false, hints: {} };
  const cards = new Map();
  const component = id => core.components.find(item => item.id === id);
  const diagram = id => core.diagrams.find(item => item.id === id);
  const visibleAnswers = () => state.revealed ? Object.fromEntries(core.diagrams.filter(item => item.answer).map(item => [item.id, item.answer])) : state.answers;

  function drawDiagram(item, number) {
    const paths = [
      ["pulmonaryArtery", "M155 132V103Q155 92 144 92H117Q107 92 107 82V55Q107 45 117 45H148"],
      ["pulmonaryVein", "M192 45H222Q232 45 232 55V92Q232 104 220 104H186V131"],
      ["aorta", "M182 145H250Q260 145 260 155V387Q260 397 250 397H192"],
      ["venaCava", "M148 397H90Q80 397 80 387V127Q80 115 92 115H144V132"],
      ["hepaticArtery", "M260 210H192"], ["hepaticVein", "M148 210H80"],
      ["intestinalArtery", "M260 277H192"], ["portalVein", "M148 277H132Q122 277 122 267V237Q122 225 134 225H170V220"],
      ["renalArtery", "M260 344H192"], ["renalVein", "M148 344H80"]
    ];
    const capillaries = [
      ["lung", 45, "pulmonaryArtery", "pulmonaryVein", false],
      ["liver", 210, "portalVein", "hepaticVein", true],
      ["bowel", 277, "intestinalArtery", "portalVein", true],
      ["kidney", 344, "renalArtery", "renalVein", true],
      ["body", 397, "aorta", "venaCava", true]
    ];
    const names = { pulmonaryArtery: "肺動脈", pulmonaryVein: "肺静脈", aorta: "大動脈", venaCava: "大静脈", hepaticVein: "肝静脈", portalVein: "門脈", renalArtery: "腎動脈", renalVein: "腎静脈" };
    const alt = Object.entries(names).map(([key, name]) => `${name}は${toneNames[item.levels[key]]}`).join("、");
    const gradients = capillaries.map(([key, , before, after, reverse]) => `<linearGradient id="${item.id}-${key}" x1="${reverse ? "100%" : "0%"}" x2="${reverse ? "0%" : "100%"}"><stop offset="0" stop-color="${palette[key === "liver" ? Math.max(item.levels[before], item.levels.hepaticArtery) : item.levels[before]]}"/><stop offset="1" stop-color="${palette[item.levels[after]]}"/></linearGradient>`).join("");
    return `<svg class="concentration-map" viewBox="0 0 340 430" role="img" aria-labelledby="${item.id}-title ${item.id}-desc">
      <title id="${item.id}-title">図${number}の血液の濃淡</title><desc id="${item.id}-desc">${alt}。矢印は血液が流れる向きです。</desc>
      <defs>${gradients}</defs>
      <rect x="92" y="12" width="158" height="88" rx="14" fill="#f1f6f0"/><rect x="90" y="184" width="162" height="236" rx="14" fill="#f8f5ed"/>
      <g fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">${paths.map(([key, path]) => `<path data-vessel="${key}" data-level="${item.levels[key]}" stroke="${palette[item.levels[key]]}" d="${path}"/>`).join("")}</g>
      <g stroke-width="1.2">
        <path d="M164 27C151 16 139 38 140 64L164 57ZM176 27C189 16 201 38 200 64L176 57Z" fill="#efddd1" stroke="#dbbdae"/>
        <path d="M170 132C151 108 131 132 170 163C209 132 189 108 170 132Z" fill="#b8c7be" stroke="#f8fcf8"/>
        <path d="M140 200Q155 185 193 192Q215 195 203 211L165 218L141 233Z" fill="#dfd4e4" stroke="#cbbbd1"/>
        <path d="M155 265C172 254 192 265 176 276C155 286 189 287 179 296" fill="none" stroke="#d8c59a" stroke-width="13" stroke-linecap="round"/>
        <path d="M154 333C134 317 127 342 137 355C146 367 158 355 153 350Q145 344 154 333ZM186 333C206 317 213 342 203 355C194 367 182 355 187 350Q195 344 186 333Z" fill="#decfbd" stroke="#c8b59d"/>
      </g>
      ${capillaries.map(([key, y]) => `<ellipse cx="170" cy="${y}" rx="22" ry="10" fill="url(#${item.id}-${key})" stroke="#a2b7a8" stroke-width=".7"/>`).join("")}
      <g class="concentration-organ-names" text-anchor="middle"><text x="170" y="82">肺</text><text x="170" y="180">心臓</text><text x="194" y="242">肝臓</text><text x="171" y="311">小腸</text><text x="170" y="377">腎臓</text><text x="170" y="424">全身</text></g>
      <g class="concentration-vessel-names"><text x="5" y="49">肺動脈</text><text x="279" y="49">肺静脈</text><text x="5" y="137">大静脈</text><text x="279" y="158">大動脈</text><text x="5" y="214">肝静脈</text><text x="5" y="270">門脈</text><text x="5" y="348">腎静脈</text><text x="279" y="348">腎動脈</text></g>
      <g fill="none" stroke="#acb8ae" stroke-width=".8"><path d="M48 45H102M239 45H275M48 133H75M265 154H275M48 210H75M34 266H75L117 244M48 344H75M265 344H275"/></g>
      <g fill="none" stroke="#7a9181" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M96 73V60M92 65L96 60L100 65M244 60V73M240 68L244 73L248 68M65 184V171M61 176L65 171L69 176M275 171V184M271 179L275 184L279 179M110 257V244M106 249L110 244L114 249"/></g>
    </svg>`;
  }

  function buildCards() {
    byId("concentration-cards").replaceChildren();
    cards.clear();
    state.order.forEach((id, index) => {
      const item = diagram(id);
      const card = document.createElement("article");
      card.className = "concentration-card";
      card.dataset.diagram = id;
      card.innerHTML = `<div class="concentration-card-heading"><h3>図 <span>${index + 1}</span></h3><span class="concentration-card-status"></span><button class="concentration-zoom" aria-label="図${index + 1}を大きく見る">拡大</button></div>${drawDiagram(item, index + 1)}<div class="concentration-answer-row"><button class="concentration-slot" data-diagram="${id}"><span class="concentration-slot-label">ここに成分を入れる</span><span class="concentration-slot-mark" aria-hidden="true">＋</span></button><button class="concentration-remove" aria-label="図${index + 1}の回答を外す" hidden>外す</button></div><p class="concentration-card-hint" hidden></p><p class="concentration-explanation" hidden></p>`;
      card.querySelector(".concentration-zoom").addEventListener("click", () => {
        byId("concentration-zoom-title").textContent = `図${index + 1}を大きく見る`;
        byId("concentration-zoom-map").innerHTML = drawDiagram(item, index + 1).replaceAll(`${item.id}-`, `zoom-${item.id}-`);
        byId("concentration-zoom-dialog").showModal();
      });
      const slot = card.querySelector(".concentration-slot");
      slot.addEventListener("click", () => chooseSlot(id));
      slot.addEventListener("dragover", event => { if (!state.revealed) { event.preventDefault(); slot.classList.add("drag-over"); } });
      slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
      slot.addEventListener("drop", event => {
        event.preventDefault();
        slot.classList.remove("drag-over");
        const value = event.dataTransfer.getData("text/plain");
        if (component(value)) place(id, value);
      });
      card.querySelector(".concentration-remove").addEventListener("click", () => {
        delete state.answers[id];
        state.checked = false;
        state.selected = null;
        state.target = null;
        say("回答を外しました。もう一度、図の濃淡を比べよう。");
        render();
      });
      byId("concentration-cards").append(card);
      cards.set(id, card);
    });
  }

  function buildBank(container) {
    container.replaceChildren();
    const answers = visibleAnswers();
    core.components.forEach(item => {
      const button = document.createElement("button");
      const used = Object.values(answers).includes(item.id);
      button.className = `concentration-chip${state.selected === item.id ? " selected" : ""}${used ? " used" : ""}`;
      button.innerHTML = `<span>${item.label}</span><small>${used ? "配置済み" : "1枚に置く"}</small>`;
      button.setAttribute("aria-label", item.label);
      button.setAttribute("aria-pressed", String(state.selected === item.id));
      button.disabled = state.revealed;
      button.draggable = !state.revealed;
      button.addEventListener("click", () => chooseComponent(item.id));
      button.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", item.id);
        event.dataTransfer.effectAllowed = "move";
        state.selected = item.id;
        state.target = null;
        button.classList.add("selected");
      });
      container.append(button);
    });
  }

  function say(message, kind = "") {
    byId("concentration-feedback").textContent = message;
    byId("concentration-feedback").className = `feedback ${kind}`;
  }

  function render() {
    const result = core.grade(state.answers);
    const answers = visibleAnswers();
    state.order.forEach((id, index) => {
      const item = diagram(id);
      const card = cards.get(id);
      const answer = component(answers[id]);
      const marked = state.checked && Boolean(answer);
      const blankCorrect = !item.answer && (state.revealed || (state.checked && result.solved));
      const correct = Boolean(answer && answer.id === item.answer);
      card.className = "concentration-card";
      if ((marked && correct) || (state.revealed && item.answer) || blankCorrect) card.classList.add("correct");
      if (marked && !correct && !state.revealed) card.classList.add("wrong");
      const slot = card.querySelector(".concentration-slot");
      slot.className = `concentration-slot${answer ? " filled" : ""}${state.target === id ? " target" : ""}`;
      slot.disabled = state.revealed;
      slot.querySelector(".concentration-slot-label").textContent = answer ? answer.label : blankCorrect ? "空欄で正解" : "ここに成分を入れる";
      slot.querySelector(".concentration-slot-mark").textContent = marked || state.revealed || blankCorrect ? ((correct || blankCorrect) ? "✓" : "×") : answer ? "" : "＋";
      slot.setAttribute("aria-label", `図${index + 1}、${answer ? answer.label : blankCorrect ? "空欄で正解" : "未回答"}`);
      slot.setAttribute("aria-pressed", String(state.target === id));
      card.querySelector(".concentration-remove").hidden = !answer || state.revealed;
      card.querySelector(".concentration-card-status").textContent = state.revealed || marked || blankCorrect ? (blankCorrect ? "置かなくてOK" : correct ? "正解" : "もう一度") : "";
      const explanation = card.querySelector(".concentration-explanation");
      explanation.hidden = !(state.revealed || marked || blankCorrect);
      explanation.textContent = item.explanation;
      const hint = card.querySelector(".concentration-card-hint");
      hint.hidden = !state.hints[id] || state.revealed;
      hint.textContent = state.hints[id] ? `ヒント：${item.hint}` : "";
    });
    const count = state.revealed ? 3 : result.placed;
    byId("concentration-count").innerHTML = `${count} <span>/ 3</span>`;
    byId("concentration-fill").style.width = `${count / 3 * 100}%`;
    byId("concentration-progress").setAttribute("aria-valuenow", count);
    byId("concentration-selection").textContent = state.target ? `図${state.order.indexOf(state.target) + 1}に置く成分を選んでね。` : state.selected ? `「${component(state.selected).label}」を置く図をタップしよう。` : "各成分は1回ずつ使います。";
    byId("concentration-mobile-feedback").textContent = state.revealed ? "解答表示中" : state.checked ? `正解 ${result.correct} / 3` : `配置 ${result.placed} / 3`;
    for (const id of ["concentration-check", "concentration-mobile-check", "concentration-hint", "concentration-reveal"]) byId(id).disabled = state.revealed;
    buildBank(byId("concentration-bank"));
    buildBank(byId("concentration-mobile-bank"));
  }

  function chooseComponent(id) {
    if (state.revealed) return;
    if (state.target) { place(state.target, id); return; }
    state.selected = state.selected === id ? null : id;
    say(state.selected ? `「${component(id).label}」に当てはまる図を1枚選んでね。` : "図の空欄か、成分を選んでね。");
    render();
  }

  function chooseSlot(id) {
    if (state.revealed) return;
    if (state.selected) { place(id, state.selected); return; }
    state.target = state.target === id ? null : id;
    render();
  }

  function place(id, value) {
    if (state.revealed) return;
    state.answers = core.assign(state.answers, id, value);
    state.target = null;
    state.selected = null;
    state.checked = false;
    const result = core.grade(state.answers);
    say(result.placed === 3 ? "3つ置けたね！ 残り3枚は空欄のまま、答え合わせをしよう。" : "当てはめました。図をよく見て、残りの成分も選ぼう。");
    render();
  }

  function check() {
    if (state.revealed) return;
    state.checked = true;
    state.target = null;
    state.selected = null;
    const result = core.grade(state.answers);
    say(result.solved ? "3つとも正解！ 残り3枚を空欄にしたのも正解です。" : `${result.correct} / 3 正解。${result.remaining ? `あと${result.remaining}つ当てはめよう。` : "濃淡の変化を比べて、×のついた成分を動かしてみよう。"}`, result.solved ? "success" : "notice");
    render();
  }

  function start() {
    const wasStarted = state.started;
    state.order = core.shuffleDiagrams(state.order);
    state.answers = {};
    state.selected = null;
    state.target = null;
    state.checked = false;
    state.revealed = false;
    state.hints = {};
    state.started = true;
    buildCards();
    say("肺・小腸・肝臓・腎臓の前後に注目しよう。");
    render();
    if (wasStarted && document.body.classList.contains("concentration-mode")) byId("concentration-title").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  byId("concentration-next").addEventListener("click", start);
  byId("concentration-mobile-next").addEventListener("click", start);
  byId("concentration-check").addEventListener("click", check);
  byId("concentration-mobile-check").addEventListener("click", check);
  byId("concentration-zoom-close").addEventListener("click", () => byId("concentration-zoom-dialog").close());
  byId("concentration-reveal").addEventListener("click", () => {
    state.revealed = true;
    state.target = null;
    state.selected = null;
    say("正しい3枚と、空欄にする3枚を表示しています。解説で濃淡の理由を確かめよう。", "success");
    render();
  });
  byId("concentration-hint").addEventListener("click", () => {
    if (state.target) {
      state.hints[state.target] = true;
      render();
      cards.get(state.target).scrollIntoView({ behavior: "smooth", block: "center" });
    } else say(state.selected ? component(state.selected).hint : "肺の前後、門脈、腎静脈の3か所を比べてみよう。図の空欄を選んでからヒントを押すと、その図のヒントが見られます。", "notice");
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && state.started && document.body.classList.contains("concentration-mode")) {
      state.selected = null;
      state.target = null;
      render();
    }
  });
  root.ConcentrationQuiz = { ensureStarted() { if (!state.started) start(); } };
})(globalThis);
