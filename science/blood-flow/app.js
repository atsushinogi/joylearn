"use strict";

const vessels = [
  { id: "pulmonary-artery", name: "肺動脈", x: 2.5, y: 15.21, note: "二酸化炭素が多く酸素が少ない。", route: "心臓 → 肺", description: "心臓から肺へ、酸素が少なく二酸化炭素が多い血液を運びます。動脈でも、酸素の多い血液が流れるとは限りません。", hint: "心臓から肺へ向かう血管。酸素が少ない血液が流れます。" },
  { id: "pulmonary-vein", name: "肺静脈", x: 75.5, y: 15.21, note: "酸素が多く二酸化炭素が少ない。", route: "肺 → 心臓", description: "肺で酸素を受け取った血液を心臓に戻します。静脈ですが、酸素が多く二酸化炭素が少ない血液が流れます。", hint: "肺で酸素を受け取った血液が、心臓へ戻る道です。" },
  { id: "vena-cava", name: "大静脈", x: 2.5, y: 32.4, route: "全身 → 心臓", description: "全身をめぐった血液を集めて、心臓に戻す太い静脈です。酸素が少なく、二酸化炭素が多い血液が流れます。", hint: "全身から血液を集めて、心臓へ戻す太い血管です。" },
  { id: "aorta", name: "大動脈", x: 75.5, y: 35.21, route: "心臓 → 全身", description: "心臓から全身へ、酸素の多い血液を送り出す太い動脈です。枝分かれして、肝臓や小腸、腎臓などにつながります。", hint: "心臓から全身に血液を送り出す、太い血管です。" },
  { id: "hepatic-vein", name: "肝静脈", x: 2.5, y: 50.31, note: "ほぼ一定の養分がふくまれる。", route: "肝臓 → 大静脈 → 心臓", description: "肝臓から出た血液を大静脈へ運びます。肝臓は養分をたくわえたり放出したりして、血液中の養分の量を調節します。", hint: "肝臓から出て、大静脈につながる血管です。" },
  { id: "portal-vein", name: "門脈", x: 2.5, y: 65.1, note: "食後、養分が最も多い。", route: "小腸 → 肝臓", description: "小腸で吸収されたブドウ糖やアミノ酸などの養分を肝臓へ運びます。食後は、これらの養分を多く含む血液が流れます。", hint: "小腸と肝臓をつなぎます。食後は吸収された養分がたくさん流れます。" },
  { id: "renal-vein", name: "腎静脈", x: 2.5, y: 83.02, note: "不要なものが最も少ない。", route: "腎臓 → 大静脈 → 心臓", description: "腎臓で尿素などの不要なものが取り除かれた後の血液を、大静脈へ運びます。腎動脈と比べて、尿素が少なくなっています。", hint: "腎臓で不要なものが取り除かれた後、心臓へ戻る側の血管です。" },
  { id: "renal-artery", name: "腎動脈", x: 75.5, y: 83.02, note: "不要なものが多い。", route: "大動脈 → 腎臓", description: "大動脈から腎臓へ血液を運びます。腎臓は、この血液から尿素などの不要なものを取り除き、尿をつくります。", hint: "大動脈から腎臓に入る側の血管です。" }
];

// Only these six vessels have a description underneath their name in the photo.
const descriptions = vessels.filter(vessel => vessel.note).map(vessel => ({
  id: `note-${vessel.id}`, vesselId: vessel.id, name: vessel.note, hint: vessel.hint
}));
const byId = id => document.getElementById(id);
const state = { mode: "quiz", exercise: "names", selectedName: null, selectedSlot: null };
const rounds = {};
const slotButtons = new Map();
const descriptionButtons = new Map();
const nameButtons = new Map();
const questions = () => state.exercise === "descriptions" ? descriptions : vessels;
const round = () => rounds[state.exercise];
const isDescriptionQuiz = () => state.mode === "quiz" && state.exercise === "descriptions";
const activeButtons = () => state.exercise === "descriptions" ? descriptionButtons : slotButtons;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function newRound(items) {
  return { answers: {}, checked: false, revealed: false, order: shuffle(items.map(item => item.id)) };
}

function say(message, kind = "") {
  byId("feedback").textContent = message;
  byId("feedback").className = `feedback ${kind}`;
}

function allowDrop(button) {
  button.addEventListener("dragover", event => {
    if (state.mode === "quiz" && !round().revealed) {
      event.preventDefault();
      button.classList.add("drag-over");
    }
  });
  button.addEventListener("dragleave", () => button.classList.remove("drag-over"));
  button.addEventListener("drop", event => {
    event.preventDefault();
    button.classList.remove("drag-over");
    const id = event.dataTransfer.getData("text/plain");
    if (!questions().some(item => item.id === id)) return;
    const slot = button.dataset.question;
    if (questions().some(item => item.id === slot)) placeName(slot, id);
  });
}

function buildSlots() {
  vessels.forEach((vessel, index) => {
    const button = document.createElement("button");
    button.className = "slot empty";
    button.style.left = `${vessel.x}%`;
    button.style.top = `${vessel.y}%`;
    button.innerHTML = `<span class="slot-number">${index + 1}</span><span class="slot-label">空欄</span>`;
    button.addEventListener("click", () => {
      if (state.mode === "learn" || round().revealed) showDetail(vessel.id);
      else chooseSlot(isDescriptionQuiz() ? `note-${vessel.id}` : vessel.id);
    });
    allowDrop(button);
    byId("slots").append(button);
    slotButtons.set(vessel.id, button);
  });
  descriptions.forEach((question, index) => {
    const vessel = vessels.find(item => item.id === question.vesselId);
    const entry = document.createElement("div");
    entry.className = "description-entry";
    entry.style.left = `${vessel.x}%`;
    entry.style.top = `${vessel.y + 3.4}%`;
    const label = document.createElement("span");
    label.className = "description-vessel-name";
    label.textContent = vessel.name;
    const button = document.createElement("button");
    button.className = "description-slot empty";
    button.dataset.question = question.id;
    button.innerHTML = `<span class="description-number">${index + 1}</span><span class="slot-label">解説を入れる</span><span class="answer-mark" aria-hidden="true"></span>`;
    button.addEventListener("click", () => chooseSlot(question.id));
    allowDrop(button);
    entry.append(label, button);
    byId("description-slots").append(entry);
    descriptionButtons.set(question.id, button);
  });
}

function buildBank() {
  byId("name-bank").replaceChildren();
  nameButtons.clear();
  const items = state.mode === "learn" ? vessels : questions();
  const order = state.mode === "learn" ? vessels.map(item => item.id) : round().order;
  order.forEach(id => {
    const question = items.find(item => item.id === id);
    const button = document.createElement("button");
    button.className = "name-chip";
    button.textContent = question.name;
    button.setAttribute("aria-label", question.name);
    button.addEventListener("click", () => chooseName(id));
    button.addEventListener("dragstart", event => {
      if (state.mode !== "quiz" || round().revealed) { event.preventDefault(); return; }
      event.dataTransfer.setData("text/plain", id);
      event.dataTransfer.effectAllowed = "move";
      state.selectedName = id;
      render();
    });
    byId("name-bank").append(button);
    nameButtons.set(id, button);
  });
}

function chooseName(id) {
  if (state.mode === "learn") { showDetail(id); return; }
  if (round().revealed) return;
  if (state.selectedSlot) { placeName(state.selectedSlot, id); return; }
  state.selectedName = state.selectedName === id ? null : id;
  const question = questions().find(item => item.id === id);
  say(state.selectedName ? (isDescriptionQuiz() ? "この解説が当てはまる血管の空欄をタップしよう。" : `「${question.name}」を入れる空欄をタップしよう。`) : "選択肢か、図の空欄を選んでね。");
  render();
  if (state.selectedName && window.matchMedia("(max-width: 740px)").matches) {
    byId(isDescriptionQuiz() ? "description-slots" : "diagram-wrap").scrollIntoView({ behavior: "smooth", block: isDescriptionQuiz() ? "start" : "center" });
  }
}

function chooseSlot(id) {
  const question = descriptions.find(item => item.id === id);
  if (state.mode === "learn" || round().revealed) { showDetail(question?.vesselId || id); return; }
  if (!questions().some(item => item.id === id)) return;
  if (state.selectedName) { placeName(id, state.selectedName); return; }
  state.selectedSlot = state.selectedSlot === id ? null : id;
  const target = isDescriptionQuiz() ? `${vessels.find(item => item.id === question.vesselId).name}の解説欄` : `空欄${questions().findIndex(item => item.id === id) + 1}`;
  say(state.selectedSlot ? `${target}に入れる${isDescriptionQuiz() ? "解説文" : "名前"}を選んでね。` : "選択肢か、図の空欄を選んでね。");
  render();
  if (state.selectedSlot && window.matchMedia("(max-width: 740px)").matches) {
    byId("task-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function placeName(slot, name) {
  if (state.mode !== "quiz" || round().revealed) return;
  const answers = round().answers;
  const previousSlot = Object.keys(answers).find(id => answers[id] === name);
  const displacedName = answers[slot];
  if (previousSlot && previousSlot !== slot) {
    if (displacedName) answers[previousSlot] = displacedName;
    else delete answers[previousSlot];
  }
  answers[slot] = name;
  state.selectedName = null;
  state.selectedSlot = null;
  round().checked = false;
  const count = Object.keys(answers).length;
  say(count === questions().length ? `${count}つ入ったね！「答え合わせ」で確かめよう。` : "いい調子！ 入れた回答は、あとから変更できます。");
  render();
}

function render() {
  const learn = state.mode === "learn";
  const concentrations = state.mode === "concentration";
  const notes = isDescriptionQuiz();
  const current = round();
  document.body.classList.toggle("concentration-mode", concentrations);
  document.querySelector(".workspace").hidden = concentrations;
  byId("concentration-quiz").hidden = !concentrations;
  document.body.classList.toggle("learn", learn);
  document.body.classList.toggle("description-quiz", notes);
  document.body.classList.toggle("show-descriptions", notes || learn);
  byId("description-slots").hidden = !(notes || learn);
  vessels.forEach((vessel, index) => {
    const button = slotButtons.get(vessel.id);
    const fixed = learn || notes || current.revealed;
    const answer = fixed ? vessel.id : current.answers[vessel.id];
    const name = vessels.find(item => item.id === answer)?.name;
    const questionId = notes ? `note-${vessel.id}` : vessel.id;
    button.dataset.question = questionId;
    button.disabled = notes && !vessel.note && !current.revealed;
    button.className = `slot ${name ? "filled" : "empty"}`;
    if (state.selectedSlot === questionId) button.classList.add(fixed ? "learn-selected" : "target");
    if (current.checked && answer && !fixed) button.classList.add(answer === vessel.id ? "correct" : "wrong");
    button.querySelector(".slot-label").textContent = name || "空欄";
    const result = current.checked && answer && !fixed ? (answer === vessel.id ? "、正解" : "、もう一度") : "";
    button.setAttribute("aria-label", fixed ? `${vessel.name}、${notes && vessel.note ? "解説を選ぶ" : "図の血管"}` : `空欄${index + 1}、${name || "未回答"}${result}`);
    button.setAttribute("aria-pressed", String(state.selectedSlot === questionId));
  });
  descriptions.forEach(question => {
    const button = descriptionButtons.get(question.id);
    const vessel = vessels.find(item => item.id === question.vesselId);
    const answer = learn || current.revealed ? question.id : (notes ? current.answers[question.id] : null);
    const text = descriptions.find(item => item.id === answer)?.name;
    const marked = notes && current.checked && answer && !current.revealed;
    button.className = `description-slot ${text ? "filled" : "empty"}`;
    if (state.selectedSlot === question.id || (learn && state.selectedSlot === vessel.id)) button.classList.add("target");
    if (marked) button.classList.add(answer === question.id ? "correct" : "wrong");
    button.querySelector(".slot-label").textContent = text || "解説を入れる";
    button.querySelector(".answer-mark").textContent = marked ? (answer === question.id ? "✓" : "×") : "";
    button.setAttribute("aria-label", `${vessel.name}の解説、${text || "未回答"}${marked ? (answer === question.id ? "、正解" : "、もう一度") : ""}`);
    button.setAttribute("aria-pressed", String(state.selectedSlot === question.id));
  });
  for (const [id, button] of nameButtons) {
    button.className = "name-chip";
    if (state.selectedName === id || (learn && state.selectedSlot === id)) button.classList.add("selected");
    if (!learn && Object.values(current.answers).includes(id)) button.classList.add("used");
    button.setAttribute("aria-pressed", String(state.selectedName === id || (learn && state.selectedSlot === id)));
    button.disabled = current.revealed && !learn;
    button.draggable = !learn && !current.revealed;
  }
  const total = questions().length;
  const count = current.revealed ? total : Object.keys(current.answers).length;
  byId("progress-count").innerHTML = `${count} <span>/ ${total}</span>`;
  byId("progress-fill").style.width = `${count / total * 100}%`;
  byId("progress-label").textContent = current.revealed ? "答えを表示中" : `配置した${notes ? "解説文" : "名前"}`;
  const progress = document.querySelector(".workspace .progress-track");
  progress.setAttribute("aria-valuenow", count);
  progress.setAttribute("aria-valuemax", total);
  progress.setAttribute("aria-label", `配置した${notes ? "解説文" : "名前"}`);
  byId("check").disabled = current.revealed;
  byId("hint").disabled = current.revealed;
  byId("show-answers").hidden = current.revealed;
  byId("name-bank").setAttribute("aria-label", notes ? "解説文の選択肢" : "名前の選択肢");
}

function showDetail(id) {
  const vessel = vessels.find(item => item.id === id);
  state.selectedSlot = state.mode === "learn" || !isDescriptionQuiz() ? id : `note-${id}`;
  byId("detail-card").hidden = false;
  byId("detail-number").textContent = `BLOOD VESSEL / ${String(vessels.indexOf(vessel) + 1).padStart(2, "0")}`;
  byId("detail-name").textContent = vessel.name;
  byId("detail-route").textContent = vessel.route;
  byId("detail-description").textContent = vessel.description;
  say(`「${vessel.name}」の流れる向きと役割を確かめよう。`);
  render();
}

function setMode(mode, exercise = state.exercise) {
  state.mode = mode;
  state.exercise = exercise;
  state.selectedName = null;
  state.selectedSlot = null;
  for (const [id, active] of [["quiz-mode", mode === "quiz" && exercise === "names"], ["description-mode", isDescriptionQuiz()], ["concentration-mode", mode === "concentration"], ["learn-mode", mode === "learn"]]) {
    byId(id).classList.toggle("active", active);
    byId(id).setAttribute("aria-pressed", String(active));
  }
  const learn = mode === "learn";
  const notes = isDescriptionQuiz();
  byId("step-label").textContent = learn ? "LET'S LEARN" : notes ? "LET'S TRY / 解説 6問" : "LET'S TRY / 名前 8問";
  byId("task-heading").textContent = learn ? "血液が流れる道をたどろう" : notes ? "解説文を選んで、当てはめよう" : "名前を選んで、図に入れよう";
  byId("task-instruction").innerHTML = learn ? "図の名前や下のボタンをタップすると、<br>血管の役割と流れる向きがわかるよ。" : notes ? "① 解説文を選ぶ → ② 血管の解説欄をタップ<br>参考画像の、名前の下にある6つの文です。" : "① 名前を選ぶ → ② 図の空欄をタップ<br>空欄を先に選んでもOK！";
  byId("detail-card").hidden = true;
  byId("memo-heading").textContent = notes ? "血液の中の成分に注目しよう" : "動脈と静脈の見分け方";
  byId("memo-heading").nextElementSibling.innerHTML = notes ? "酸素と二酸化炭素、養分、不要なものに注目しよう。参考画像で、名前の下に解説がある6つの血管が問題です。" : "心臓から<strong>出ていく</strong>のが動脈、<br>心臓に<strong>戻ってくる</strong>のが静脈。<br>肺動脈は、酸素の少ない血液が流れるよ。";
  say(learn ? "気になる血管を選んでみよう。" : round().revealed ? "答えを表示しています。「やり直す」でまた挑戦しよう。" : notes ? "血液に何が多く、何が少ないか考えてみよう。" : "まずは、知っている名前から。");
  buildBank();
  render();
  if (mode === "concentration") globalThis.ConcentrationQuiz.ensureStarted();
}

byId("check").addEventListener("click", () => {
  state.selectedName = null;
  state.selectedSlot = null;
  round().checked = true;
  const total = questions().length;
  const count = questions().filter(question => round().answers[question.id] === question.id).length;
  const empty = total - Object.keys(round().answers).length;
  if (count === total) say(`全問正解！ ${isDescriptionQuiz() ? "血管を流れる血液の特徴もわかったね！" : "血液の通り道をマスターしたね！"}`, "success");
  else say(`${count} / ${total} 問正解。${empty ? `あと${empty}か所が空欄です。` : "×のついた回答を入れ替えてみよう。"}`, "notice");
  render();
});

byId("hint").addEventListener("click", () => {
  const question = questions().find(item => item.id === state.selectedSlot) || questions().find(item => round().answers[item.id] !== item.id);
  if (!question) { say("すべて正しく入っています！「答え合わせ」で確かめよう。", "success"); return; }
  state.selectedName = null;
  state.selectedSlot = question.id;
  const target = isDescriptionQuiz() ? `${vessels.find(item => item.id === question.vesselId).name}の解説` : `空欄${questions().indexOf(question) + 1}`;
  say(`${target}のヒント：${question.hint}`, "notice");
  render();
  const button = activeButtons().get(question.id);
  button.classList.remove("hint-pulse");
  void button.offsetWidth;
  button.classList.add("hint-pulse");
});

byId("show-answers").addEventListener("click", () => {
  round().revealed = true;
  state.selectedName = null;
  state.selectedSlot = null;
  say("答えを表示しています。図の名前や解説をタップして役割も確かめよう。", "success");
  render();
});

byId("reset").addEventListener("click", () => {
  byId("reset-dialog").querySelector("p").textContent = `この${isDescriptionQuiz() ? "解説6問" : "名前8問"}の回答を消して、選択肢を並べ替えます。もう一方の問題の回答は残ります。`;
  if (Object.keys(round().answers).length || round().revealed) byId("reset-dialog").showModal();
  else resetQuiz();
});
function resetQuiz() {
  rounds[state.exercise] = newRound(questions());
  setMode("quiz");
}
byId("reset-cancel").addEventListener("click", () => byId("reset-dialog").close());
byId("reset-confirm").addEventListener("click", () => { byId("reset-dialog").close(); resetQuiz(); });
byId("quiz-mode").addEventListener("click", () => setMode("quiz", "names"));
byId("description-mode").addEventListener("click", () => setMode("quiz", "descriptions"));
byId("concentration-mode").addEventListener("click", () => setMode("concentration"));
byId("learn-mode").addEventListener("click", () => setMode("learn"));
byId("reference-open").addEventListener("click", () => byId("reference-dialog").showModal());
byId("reference-close").addEventListener("click", () => byId("reference-dialog").close());
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    state.selectedName = null;
    state.selectedSlot = null;
    render();
  }
});
rounds.names = newRound(vessels);
rounds.descriptions = newRound(descriptions);
buildSlots();
setMode("quiz", "names");
