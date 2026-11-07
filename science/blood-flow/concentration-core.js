"use strict";

(function (root) {
  const components = [
    { id: "oxygen", label: "酸素", hint: "肺で受け取り、全身の細胞で使われます。肺の前と後を比べよう。" },
    { id: "nutrients", label: "養分", hint: "食後は、小腸で吸収されて門脈に多く入ります。肝臓が量を調節します。" },
    { id: "waste", label: "不要物", hint: "この問題では尿素を表します。肝臓でつくられ、腎臓で血液から取り除かれます。" }
  ];
  const normal = {
    pulmonaryArtery: 2, pulmonaryVein: 2, aorta: 2, venaCava: 2,
    hepaticArtery: 2, hepaticVein: 2, intestinalArtery: 2, portalVein: 2,
    renalArtery: 2, renalVein: 2
  };
  // Levels 0–3 are qualitative shading steps, not measured concentrations.
  const diagrams = [
    {
      id: "pattern-a", answer: "oxygen",
      levels: { pulmonaryArtery: 0, pulmonaryVein: 3, aorta: 3, venaCava: 0, hepaticArtery: 3, hepaticVein: 0, intestinalArtery: 3, portalVein: 0, renalArtery: 3, renalVein: 0 },
      hint: "肺に入る前はうすく、肺を出た後は濃くなっています。全身を通ると、またうすくなるよ。",
      explanation: "酸素の図です。肺で酸素を受け取るので肺静脈と大動脈側が濃くなり、全身の細胞で使われると静脈側がうすくなります。"
    },
    {
      id: "pattern-b", answer: "nutrients",
      levels: { ...normal, portalVein: 3 },
      hint: "小腸から肝臓へ向かう門脈が、いちばん濃くなっています。食後の小腸のはたらきを考えよう。",
      explanation: "養分の図です。食後は小腸で吸収したブドウ糖などが門脈に多く入り、肝臓が一部をたくわえるなどして量を調節します。"
    },
    {
      id: "pattern-c", answer: "waste",
      levels: { ...normal, hepaticVein: 3, renalVein: 0 },
      hint: "腎臓に入る前より、腎臓を出た後の血液がうすくなっています。腎臓が取り除くものは何かな？",
      explanation: "不要物（尿素）の図です。尿素は肝臓でつくられ、腎臓で血液から取り除かれます。そのため腎静脈では少なくなっています。"
    },
    {
      id: "pattern-d", answer: null,
      levels: { pulmonaryArtery: 3, pulmonaryVein: 0, aorta: 0, venaCava: 3, hepaticArtery: 0, hepaticVein: 3, intestinalArtery: 0, portalVein: 3, renalArtery: 0, renalVein: 3 },
      hint: "肺を出た後にうすくなる図です。酸素が肺で増えるか減るかを確かめよう。",
      explanation: "ここは空欄です。酸素とは逆に、肺を出ると薄くなる形です。食後の養分や、腎臓で取り除く尿素の図にも当てはまりません。"
    },
    {
      id: "pattern-e", answer: null,
      levels: { ...normal, renalVein: 3 },
      hint: "腎臓を出た後の血液が、入る前より濃くなっています。尿素は腎臓で取り除かれるよ。",
      explanation: "ここは空欄です。腎臓を出た後に最も濃くなる形は、尿素の変化とは逆です。酸素や食後の養分の図にも当てはまりません。"
    },
    {
      id: "pattern-f", answer: null,
      levels: { ...normal, portalVein: 0 },
      hint: "小腸から肝臓へ向かう門脈が、とてもうすい図です。食後には、小腸から何が吸収されるかな？",
      explanation: "ここは空欄です。食後の門脈には吸収した養分が多く流れるので、養分の図なら濃くなります。酸素や尿素の全身での変化にも当てはまりません。"
    }
  ];

  function shuffleDiagrams(previous = [], random = Math.random) {
    const order = diagrams.map(diagram => diagram.id);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.every((id, index) => id === previous[index])) {
      const j = 1 + Math.floor(random() * (order.length - 1));
      [order[0], order[j]] = [order[j], order[0]];
    }
    return order;
  }

  function assign(answers, targetId, componentId) {
    if (!diagrams.some(diagram => diagram.id === targetId) || !components.some(component => component.id === componentId)) {
      throw new Error("Unknown concentration diagram or component");
    }
    const next = { ...answers };
    const previousTarget = Object.keys(next).find(id => next[id] === componentId);
    const displaced = next[targetId];
    if (previousTarget && previousTarget !== targetId) {
      if (displaced) next[previousTarget] = displaced;
      else delete next[previousTarget];
    }
    next[targetId] = componentId;
    return next;
  }

  function grade(answers) {
    const placed = diagrams.filter(diagram => components.some(component => component.id === answers[diagram.id])).length;
    const correct = diagrams.filter(diagram => diagram.answer && answers[diagram.id] === diagram.answer).length;
    return { placed, correct, wrong: placed - correct, remaining: 3 - placed, solved: placed === 3 && correct === 3 };
  }

  function createPalette(color, contrast = 75, brightness = 100) {
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Invalid blood flow color");
    const rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255);
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    const delta = max - min;
    const lightness = (max + min) / 2;
    const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
    let hue = 0;
    if (delta) {
      if (max === rgb[0]) hue = ((rgb[1] - rgb[2]) / delta) % 6;
      else if (max === rgb[1]) hue = (rgb[2] - rgb[0]) / delta + 2;
      else hue = (rgb[0] - rgb[1]) / delta + 4;
      hue = (hue + 6) % 6;
    }
    const numericContrast = Number(contrast);
    const strength = Math.max(20, Math.min(100, Number.isFinite(numericContrast) ? numericContrast : 75));
    const span = 0.22 + strength / 100 * 0.6;
    const numericBrightness = Number(brightness);
    const brightnessLevel = Math.max(50, Math.min(150, Number.isFinite(numericBrightness) ? numericBrightness : 100));
    return [0, 1, 2, 3].map(level => {
      // A monotonic curve changes brightness without clipping different levels together.
      const tone = (0.54 + span / 2 - span * level / 3) ** (100 / brightnessLevel);
      const chroma = (1 - Math.abs(2 * tone - 1)) * saturation;
      const secondary = chroma * (1 - Math.abs(hue % 2 - 1));
      const offset = tone - chroma / 2;
      const sectors = [[chroma, secondary, 0], [secondary, chroma, 0], [0, chroma, secondary], [0, secondary, chroma], [secondary, 0, chroma], [chroma, 0, secondary]];
      return "#" + sectors[Math.floor(hue)].map(channel => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("");
    });
  }

  const api = { components, diagrams, shuffleDiagrams, assign, grade, createPalette };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ConcentrationCore = api;
})(globalThis);
