(function (root) {
  'use strict';
  const ink = '#416b69';
  const teal = '#25867b';
  const orange = '#df7549';
  const line = (x1, y1, x2, y2, color = ink, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${extra}/>`;
  const text = (x, y, value, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${value}</text>`;
  const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const support = (x, y, w) => rect(x, y, w, 7, '#a7baaa', 'rx="2"');
  const dot = (x, y, r = 13) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${orange}" stroke="#bf623b" stroke-width="1.5"/>`;
  const arrow = (x1, y1, x2, y2, color = teal) => line(x1, y1, x2, y2, color, `marker-end="url(#${color === orange ? 'arrow-orange' : 'arrow-teal'})"`);
  function spring(x, y, length, horizontal = false, coils = 7) {
    let path = `M ${x} ${y} l 0 7`;
    const usable = length - 14;
    for (let i = 0; i < coils; i++) {
      const start = y + 7 + i * usable / coils;
      path += ` C ${x - 27} ${start + usable / coils * .25}, ${x + 27} ${start + usable / coils * .75}, ${x} ${start + usable / coils}`;
    }
    path += ' l 0 7';
    const transform = horizontal ? ` transform="rotate(-90 ${x} ${y})"` : '';
    return `<path d="${path}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"${transform}/>`;
  }
  const bracket = (x, y1, y2, label) => line(x, y1, x, y2, '#8aa49b') + line(x - 4, y1, x + 4, y1, '#8aa49b') + line(x - 4, y2, x + 4, y2, '#8aa49b') + text(x - 9, (y1 + y2) / 2 + 5, label, label.includes('?') ? 'unknown' : 'small', 'end');
  const pill = (x, y, value, width = 160) => rect(x - width / 2, y - 18, width, 29, '#ffffffc9', 'rx="7"') + text(x, y + 1, value, 'small');
  function balance(x, y, value) {
    let result = `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${ink}" stroke-width="2"/>`;
    result += rect(x - 13, y + 6, 26, 64, '#dce9e5', `rx="4" stroke="${ink}" stroke-width="2"`);
    for (let i = 0; i < 6; i++) result += line(x - 5, y + 16 + i * 8, x + 7, y + 16 + i * 8, '#7a9e90');
    result += rect(x - 9, y + 39, 18, 3, orange) + line(x, y + 70, x, y + 80);
    if (value !== null) result += text(x + 21, y + 44, value, value.includes('?') ? 'unknown' : 'number', 'start');
    return result;
  }
  const water = (x, y, w, h) => rect(x, y, w, h, '#d1e7e9', 'rx="3"') + `<path d="M${x},${y - 14} v${h + 14} h${w} v-${h + 14}" fill="none" stroke="#87afb2" stroke-width="2"/>` + line(x, y, x + w, y, '#78b0b4') + text(x + w - 15, y + h - 10, '水', 'small');
  function scale(x, y, value) {
    return rect(x - 65, y, 130, 7, '#94b8a2', 'rx="3"') + `<path d="M${x - 18} ${y + 7} L${x - 43} ${y + 70} H${x + 43} L${x + 18} ${y + 7} Z" fill="#8fac90"/>` + `<circle cx="${x}" cy="${y + 37}" r="26" fill="#f9faf3" stroke="${ink}" stroke-width="2"/>` + line(x, y + 37, x + 16, y + 27, orange) + text(x, y + 98, value, value.includes('?') ? 'unknown' : 'number');
  }
  function hanging(x, y, length, mass, label = '') {
    return support(x - 27, y - 7, 54) + spring(x, y, length) + dot(x, y + length + 13) + text(x, y + length + 48, `${mass} g`, 'small') + (label ? text(x, y - 20, label) : '');
  }

  function content(q) {
    const d = q.data;
    switch (q.id) {
      case 'pitch': {
        const start = 75;
        const zig = (x, step) => {
          let path = `M${x} ${start}`;
          for (let i = 0; i < d.gaps; i++) path += ` l-20 ${step / 4} l40 ${step / 2} l-20 ${step / 4}`;
          return `<path d="${path}" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`;
        };
        return text(124, 38, '力を加える前', 'small') + text(302, 38, '力を加えた後', 'small') + support(95, 58, 60) + support(275, 58, 60) + zig(125, 19) + zig(305, 29) + text(120, 285, `間隔は全部で${d.gaps}つ`, 'small') + text(310, 285, `1つずつ ＋${d.widening} mm`, 'small') + arrow(204, 147, 243, 147) + bracket(415, 75 + d.gaps * 19, 75 + d.gaps * 29, '? mm');
      }
      case 'cut':
        return hanging(140, 58, 155, d.mass, 'ばねA') + hanging(325, 58, 78, d.mass, 'ばねB') + bracket(93, 58, 213, `${d.natural + d.whole} cm`) + bracket(280, 58, 136, '? cm') + pill(140, 287, `自然長 ${d.natural} cm`, 145) + pill(325, 222, 'Aを半分に切る', 145) + text(220, 266, `Aののび ${d.whole} cm`, 'small');
      case 'strength': {
        let result = '';
        for (let i = 0; i <= 4; i++) {
          const x = 65 + i * 78;
          const y = 242 - i * 46;
          result += line(x, 58, x, 242, '#cbd8cd') + line(65, y, 377, y, '#cbd8cd');
          result += text(x, 263, `${i * d.mass}`, 'small') + text(50, y + 4, `${i * d.extension}`, 'small');
        }
        result += line(65, 242, 389, 242) + line(65, 242, 65, 44);
        result += line(65, 242, 221, 58, orange) + line(65, 242, 377, 58, teal);
        return result + text(222, 45, 'A', 'number') + text(382, 45, 'B', 'number') + text(220, 295, 'おもりの重さ（g）', 'small') + text(66, 27, 'のび（cm）', 'small');
      }
      case 'series': {
        let result = hanging(115, 65, 100, d.mass, '1本') + pill(115, 260, `のび ${d.extension} cm`, 130) + support(260, 58, 65) + text(292, 42, `直列 ${d.n}本`);
        const length = 165 / d.n;
        for (let i = 0; i < d.n; i++) result += spring(292, 65 + i * length, length, false, 5);
        return result + line(255, 113, 370, 113, '#9bb1a6', 'stroke-dasharray="4 4"') + text(322, 99, 'おもりなしの下端', 'small') + dot(292, 244) + text(292, 280, `${d.mass} g`, 'small') + bracket(395, 113, 230, 'のび ? cm');
      }
      case 'parallel':
        return hanging(105, 70, 150, d.mass, '1本') + pill(105, 287, `のび ${d.single} cm`, 130) + text(303, 40, '2本で支える') + support(235, 63, 130) + spring(260, 70, 110) + spring(340, 70, 110) + support(253, 180, 94) + line(300, 187, 300, 211) + dot(300, 224) + text(300, 260, `${d.mass} g`, 'small') + line(75, 140, 395, 140, '#9bb1a6', 'stroke-dasharray="4 4"') + text(215, 124, 'おもりなしの下端', 'small') + bracket(415, 140, 180, '? cm');
      case 'mixed':
        return support(133, 29, 174) + spring(165, 36, 92) + spring(275, 36, 92) + support(156, 128, 128) + spring(220, 135, 99) + dot(220, 248) + text(220, 285, `${d.mass} g`, 'number') + text(315, 88, '並列2本', 'small', 'start') + text(263, 191, '直列1本', 'small', 'start') + pill(95, 285, '全体ののび ? cm', 180);
      case 'pulley': {
        let result = hanging(55, 75, 95, d.mass, 'A') + text(55, 264, `のび ${d.extension} cm`, 'small');
        result += text(192, 42, 'B') + support(127, 128, 9) + spring(136, 132, 69, true, 5) + line(205, 132, 228, 132) + `<circle cx="228" cy="140" r="8" fill="#cfb77c" stroke="${ink}"/>` + line(236, 140, 236, 187) + dot(236, 200, 10) + text(208, 239, `${d.mass} g`, 'small');
        result += text(355, 42, 'C') + spring(318, 132, 70, true, 5) + line(305, 132, 318, 132) + line(388, 132, 403, 132);
        for (const x of [299, 410]) result += `<circle cx="${x}" cy="140" r="8" fill="#cfb77c" stroke="${ink}"/>` + line(x + (x < 350 ? -8 : 8), 140, x + (x < 350 ? -8 : 8), 190) + dot(x + (x < 350 ? -8 : 8), 202, 9) + text(x + (x < 350 ? -8 : 8), 234, `${d.mass} g`, 'small');
        return result + pill(355, 279, 'Cののび ? cm', 145);
      }
      case 'forces':
        return text(100, 38, '縦につるしたとき', 'small') + support(73, 74, 54) + spring(100, 81, 111) + dot(100, 207) + text(100, 246, `${d.mass} g`, 'small') + pill(100, 285, `のび ${d.extension} cm`, 140) + spring(265, 155, 100, true) + arrow(265, 155, 220, 155, orange) + arrow(365, 155, 410, 155, orange) + text(238, 126, `${d.mass} g重`, 'small') + text(390, 126, `${d.mass} g重`, 'small') + text(317, 225, '反対向きに引く', 'small') + pill(317, 285, 'のび ? cm', 150);
      case 'table': {
        let result = rect(20, 80, 400, 140, '#ffffffbf', 'rx="7"');
        const cellW = 58;
        for (let i = 0; i <= 5; i++) result += line(130 + cellW * i, 80, 130 + cellW * i, 220, '#b4c6ba');
        result += line(20, 150, 420, 150, '#b4c6ba') + text(74, 121, '重さ（g）', 'small') + text(74, 190, '全長（cm）', 'small');
        for (let i = 0; i < 5; i++) {
          result += text(159 + cellW * i, 122, `${d.step * i}`, 'number');
          result += text(159 + cellW * i, 191, i ? `${d.base + d.extension * i}` : '?', i ? 'number' : 'unknown');
        }
        return result + text(220, 268, 'おもりがないときの長さ ＝ 自然長', 'small');
      }
      case 'series-total':
        return support(140, 35, 150) + spring(220, 42, 87) + spring(220, 129, 87) + dot(220, 230) + text(220, 271, `${d.mass} g`, 'number') + bracket(135, 42, 216, 'X ? cm') + text(298, 99, 'ばね1', 'small') + text(298, 186, 'ばね2', 'small');
      case 'parallel-check':
        return support(95, 40, 250) + spring(130, 47, 123) + spring(310, 47, 123) + support(122, 170, 196) + line(220, 177, 220, 223) + dot(220, 236) + text(220, 280, `${d.mass * 2} g`, 'number') + text(220, 207, '中央', 'small') + bracket(362, 100, 170, '? cm') + line(130, 160, 130, 188) + line(310, 160, 310, 188);
      case 'volume': {
        let result = water(20, 201, 400, 63);
        ['A', 'B', 'C'].forEach((label, index) => {
          const x = 80 + index * 135;
          const size = 17 + index * 7;
          result += text(x, 29, label, 'number') + text(x, 51, `空気中 ${d.weight} g重`, 'small') + balance(x, 71, index === 2 ? '? g重' : `${d.weight - d.v * (index + 1)} g重`) + line(x, 151, x, 225 - size / 2) + rect(x - size / 2, 225 - size / 2, size, size, orange) + text(x, 292, `${d.v * (index + 1)} cm³`, 'small');
        });
        return result;
      }
      case 'air':
      case 'check-air':
        return balance(210, 37, '? g重') + line(210, 117, 210, 175) + dot(210, 195, 20) + arrow(250, 185, 250, 133) + arrow(250, 203, 250, 257, orange) + text(283, 150, 'ばねの力 ?', 'small', 'start') + text(280, 248, `${d.weight} g重`, 'number', 'start') + pill(145, 285, `体積 ${d.volume} cm³`, 150);
      case 'water':
      case 'check-full':
      case 'check-half': {
        const half = q.id === 'check-half';
        let result = balance(94, 38, `${d.weight} g重`) + line(94, 118, 94, 193) + dot(94, 212, 19) + text(94, 276, '空気中', 'small') + arrow(185, 151, 217, 151);
        result += water(245, half ? 211 : 174, 150, half ? 44 : 81) + balance(313, 38, '? g重') + line(313, 118, 313, 193) + dot(313, 212, 19) + text(320, 282, half ? '体積の半分が水中' : 'すべて水中', 'small') + pill(220, 17, `物体の体積 ${d.volume} cm³`, 180);
        return result;
      }
      case 'float':
        return water(40, 160, 360, 112) + rect(165, 105, 90, 110, orange, 'rx="7"') + line(40, 160, 400, 160, '#78b0b4') + arrow(284, 155, 284, 83) + arrow(284, 167, 284, 240, orange) + text(306, 96, '浮力 ?', 'unknown', 'start') + text(307, 242, `${d.floatWeight} g重`, 'number', 'start') + text(190, 49, `物体の体積 ${d.floatVolume} cm³`, 'small') + text(190, 75, `物体の重さ ${d.floatWeight} g`, 'small');
      case 'scale-before':
        return balance(110, 35, `${d.weight} g重`) + line(110, 115, 110, 162) + dot(110, 178, 16) + text(112, 231, `物体 ${d.volume} cm³`, 'small') + water(260, 95, 130, 80) + scale(325, 180, `${d.container} g重`) + text(325, 62, '容器 ＋ 水', 'small') + pill(143, 285, '2つの値の合計 ?', 180);
      case 'scale-full':
      case 'scale-half':
      case 'scale-bottom': {
        const half = q.id === 'scale-half';
        const bottom = q.id === 'scale-bottom';
        const level = half ? 146 : 117;
        const ballY = bottom ? 182 : 146;
        let result = water(154, level, 150, 200 - level) + balance(222, 16, bottom ? '0 g重' : `${d.weight - (half ? d.volume / 2 : d.volume)} g重`);
        result += line(222, 96, 222, ballY - 17, ink, bottom ? 'stroke-dasharray="4 5"' : '') + dot(222, ballY, 17) + scale(229, 204, '? g重');
        result += pill(80, 52, `物体 ${d.weight} g`, 140) + pill(80, 84, `${d.volume} cm³`, 125) + text(35, 250, '容器＋水', 'small', 'start') + text(35, 274, `${d.container} g`, 'number', 'start');
        if (bottom) result += text(93, 159, '糸はゆるむ', 'small');
        return result;
      }
      case 'pressure': {
        let result = water(35, 35, 370, 242) + rect(165, 118, 110, 90, '#c1d2a4', `rx="5" stroke="${ink}" stroke-width="2"`);
        result += arrow(220, 58, 220, 113, orange) + arrow(220, 262, 220, 212) + text(282, 75, `上から ${d.down} g重`, 'number') + text(303, 258, `下から ${d.up} g重`, 'number');
        for (let i = 0; i < 3; i++) result += arrow(112, 140 + i * 24, 158, 140 + i * 24) + arrow(328, 140 + i * 24, 282, 140 + i * 24);
        return result + text(220, 300, '左右の力は同じ大きさ', 'small');
      }
      case 'release':
        return water(50, 85, 340, 185) + rect(180, 155, 80, 60, orange, 'rx="6"') + text(220, 183, 'X', 'number') + text(220, 41, `物体の重さ ${d.releaseWeight} g`, 'number') + text(220, 67, `体積 ${d.volume} cm³`, 'small') + text(220, 300, '全体を水中に入れて、静かにはなす', 'small');
      default: throw new Error(`Missing diagram: ${q.id}`);
    }
  }

  function renderDiagram(question) {
    return `<svg viewBox="0 0 440 320" role="img" aria-label="${question.title}。${question.facts}"><defs><marker id="arrow-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${teal}"/></marker><marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${orange}"/></marker></defs>${content(question)}</svg>`;
  }
  root.SpringDiagrams = { renderDiagram };
  if (typeof module !== 'undefined' && module.exports) module.exports = { renderDiagram };
})(typeof globalThis !== 'undefined' ? globalThis : this);
