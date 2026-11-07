(function (root) {
  'use strict';

  const sources = [
    ['pitch', 'ばねののび方', '0513', 'p.74・ピッチの広がり', 'assets/pitch.webp'],
    ['cut', '半分に切ったばね', '0513', 'p.74・自然長と全長', 'assets/cut.webp'],
    ['strength', 'ばねの強さのグラフ', '0513', 'p.74・ばねAとB', 'assets/strength.webp'],
    ['series', '直列つなぎ', '0514', 'p.75・1本と2本の比較', 'assets/series.webp'],
    ['parallel', '並列つなぎ', '0514', 'p.75・1本と2本の比較', 'assets/parallel.webp'],
    ['mixed', '直列と並列の組み合わせ', '0514', 'p.75・上2本と下1本', 'assets/mixed.webp'],
    ['pulley', '滑車とばねのつり合い', '0514', 'p.75・縦、横、両側の3つの図', 'assets/pulley.webp'],
    ['forces', 'ばねにかかる力', '0514', 'p.75・反対向きの2つの力', 'assets/forces.webp'],
    ['volume', '体積と浮力', '0515', 'p.76・物体A、B、Cの比較', 'assets/volume.webp'],
    ['water', '空気中と水中の重さ', '0515', 'p.76・空気中と水中の2つの図', 'assets/water.webp'],
    ['float', '水面に浮く物体', '0515', 'p.76・浮力と重さのつり合い', 'assets/float.webp'],
    ['scale-before', 'ばねばかりと台ばかり', '0516', 'p.77・水に入れる前', 'assets/scale-before.webp'],
    ['scale-states', 'しずめ方と2つのはかり', '0516', 'p.77・全部、半分、底についた図', 'assets/scale-states.webp'],
    ['pressure', '水圧と浮力', '0518', 'p.79・上下左右からはたらく力', 'assets/pressure.webp'],
    ['table', 'おもりとばねの全長の表', '0519', '要点チェック・問1の表', 'assets/table.webp'],
    ['series-total', '直列につないだ全長', '0519', '要点チェック・図1', 'assets/series-total.webp'],
    ['parallel-check', '棒で支える2本のばね', '0519', '要点チェック・図2', 'assets/parallel-check.webp'],
    ['check-air', '物体Xとばねばかり', '0519', '要点チェック・図3', 'assets/check-air.webp'],
    ['check-half', '半分を水に入れた物体X', '0519', '要点チェック・図4', 'assets/check-half.webp'],
  ].map(([id, title, photo, caption, image]) => ({ id, title, file: `IMG_${photo}.jpg`, caption, image }));

  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function variant(id, random) {
    const pick = values => values[Math.floor(random() * values.length)];
    const n = pick([2, 3, 4]);
    const mass = pick([40, 60, 80, 100, 120]);
    const base = pick([8, 10, 12, 14, 16]);
    const extension = pick([2, 4, 6]);
    const volume = pick([10, 20, 30, 40]);
    const container = pick([150, 200, 250, 300]);
    const weight = volume + pick([40, 60, 80, 100]);
    const common = { mass, base, extension, volume, container, weight };
    const make = (data, prompt, answer, unit, explanation, note = '') => ({
      data: { ...common, ...data }, prompt, answer, unit, explanation, note,
      conditions: '同じ図の中のばねは、すべて同じばねです。',
    });
    switch (id) {
      case 'pitch': {
        const gaps = pick([3, 4, 5, 6]);
        const widening = pick([1, 2, 3]);
        return make({ gaps, widening }, `1つの間隔が${widening} mmずつ広がりました。\nばね全体ののびは何 mm？`, gaps * widening, 'mm',
          `すべての間隔が同じだけ広がります。\n${widening} × ${gaps} ＝ ${gaps * widening} mm`, '図のジグザグ1区間を、1つの間隔として数えます。');
      }
      case 'cut': {
        const natural = base * 2;
        const whole = extension * 2;
        return make({ natural, whole }, `ばねBは、Aと同じばねを半分に切ったもの。\nBの全長は何 cm？`, base + extension, 'cm',
          `半分に切ると、自然長ものびも半分です。\n自然長 ${natural} ÷ 2 ＝ ${base} cm\nのび ${whole} ÷ 2 ＝ ${extension} cm\n全長 ${base} ＋ ${extension} ＝ ${base + extension} cm`);
      }
      case 'strength':
        return make({}, `グラフのばねBに${mass * 2} gのおもりをつるすと、\nのびは何 cm？`, extension * 2, 'cm',
          `Bは${mass} gで${extension} cmのびます。\n重さが2倍なら、のびも2倍。\n${extension} × 2 ＝ ${extension * 2} cm`, 'グラフの横軸はおもりの重さ、縦軸はばねののびです。');
      case 'series':
        return make({ n }, `同じばねを${n}本、直列につなぎました。\n全体ののびは何 cm？`, n * extension, 'cm',
          `直列では、どのばねにも同じ力がかかります。\n1本ずつ${extension} cmのびるので、\n${extension} × ${n} ＝ ${n * extension} cm`);
      case 'parallel': {
        const single = extension * 2;
        return make({ single }, '同じばね2本で、おもりを左右均等に支えます。\n1本あたりののびは何 cm？', extension, 'cm',
          `2本で重さを半分ずつ支えます。\n1本にかかる力が半分なので、のびも半分。\n${single} ÷ 2 ＝ ${extension} cm`);
      }
      case 'mixed':
        return make({}, '上は並列の2本、下は1本のばね。\n全体ののびは何 cm？', extension * 3, 'cm',
          `下のばねは全体の重さを支えるので${extension * 2} cm。\n上の2本は半分ずつ支えるので、それぞれ${extension} cm。\n上の部分ののび ＋ 下ののび\n＝ ${extension} ＋ ${extension * 2} ＝ ${extension * 3} cm`, `このばね1本に${mass} gをつるすと、${extension * 2} cmのびます。`);
      case 'pulley':
        return make({}, '両側を滑車で引いた図C。\nばねののびは何 cm？', extension, 'cm',
          `両側のおもりがそれぞれ${mass} g重で引きます。\nばねを引く力は足し算せず、片側の${mass} g重です。\n図A・B・Cののびは同じ${extension} cmです。`, '滑車は力の向きを変えます。糸の張力の大きさは変わりません。');
      case 'forces':
        return make({}, '横向きのばねを、両側から同じ力で引きます。\nばねののびは何 cm？', extension, 'cm',
          `ばねの両端に、${mass} g重ずつの反対向きの力がはたらいてつり合っています。\n片側を固定して${mass} g重で引いたときと同じ、${extension} cmののびです。`, `${mass} gのおもりを縦につるすと、${extension} cmのびるばねです。`);
      case 'table': {
        const step = pick([10, 20, 30]);
        return make({ step }, '表から、このばねの自然長を求めよう。\nおもりが0 gのとき、全長は何 cm？', base, 'cm',
          `おもりが${step} g増えるごとに、全長は${extension} cm増えます。\n${step} gのときの全長から、のびを引きます。\n${base + extension} − ${extension} ＝ ${base} cm`);
      }
      case 'series-total':
        return make({}, 'このばねを2本、直列につなぎました。\n2本を合わせた全長Xは何 cm？', (base + extension) * 2, 'cm',
          `直列のばねには、それぞれ${mass} g重の力がかかります。\n1本の全長は ${base} ＋ ${extension} ＝ ${base + extension} cm。\n2本では ${base + extension} × 2 ＝ ${(base + extension) * 2} cm。`, `1本の自然長は${base} cm。${mass} gのおもりで${extension} cmのびます。`);
      case 'parallel-check':
        return make({}, '軽い棒の中央におもりをつるしました。\nばね1本ののびは何 cm？', extension, 'cm',
          `中央につるすと、左右のばねは半分ずつの重さを支えます。\n1本あたり ${mass * 2} ÷ 2 ＝ ${mass} g重。\nしたがって、のびは${extension} cmです。`, `ばね1本に${mass} gをつるすと、${extension} cmのびます。棒は水平です。`);
      case 'volume': {
        const v = pick([5, 10, 15]);
        return make({ v }, '体積のちがう物体A・B・Cを、すべて水中へ。\n物体Cのばねばかりは何 g重？', weight - v * 3, 'g重',
          `水1 cm³の重さは1 gなので、Cには${v * 3} g重の浮力がはたらきます。\nばねばかり ＝ 重さ − 浮力\n${weight} − ${v * 3} ＝ ${weight - v * 3} g重`);
      }
      case 'air':
      case 'check-air':
        return make({}, '物体が空気中で静止しています。\nばねが上向きに引く力は何 g重？', weight, 'g重',
          `静止しているので、上下の力がつり合っています。\nばねが引く力 ＝ 物体の重さ\n＝ ${weight} g重`, '空気から受ける浮力は考えません。');
      case 'water':
      case 'check-full':
        return make({}, '物体をすべて水中に入れました。\nばねばかりは何 g重を示す？', weight - volume, 'g重',
          `浮力は、おしのけた水の重さと同じです。\n${volume} cm³の水 → 浮力${volume} g重\n${weight} − ${volume} ＝ ${weight - volume} g重`, '物体は容器の底や側面にはふれていません。');
      case 'float': {
        const floatWeight = pick([20, 30, 40, 50, 60]);
        const floatVolume = floatWeight * 2;
        return make({ floatWeight, floatVolume }, '物体が水面に浮いて静止しています。\n物体にはたらく浮力は何 g重？', floatWeight, 'g重',
          `浮いて静止している物体では、\n浮力 ＝ 物体の重さ。\n体積全体ではなく、水中に入っている部分だけが水をおしのけます。\n答えは${floatWeight} g重です。`);
      }
      case 'scale-before':
        return make({}, '物体はまだ水に入れていません。\n2つのはかりの値を合計すると何 g重？', container + weight, 'g重',
          `ばねばかりは物体、台ばかりは容器と水を支えています。\n${weight} ＋ ${container} ＝ ${container + weight} g重`, '容器と水を合わせた重さが、台ばかりに表示されています。');
      case 'scale-full':
        return make({}, '物体をすべて水中に入れました。\n台ばかりの値は何 g重？', container + volume, 'g重',
          `物体が受ける浮力は${volume} g重。\n物体も水を同じ${volume} g重の力で押すので、台ばかりの値が増えます。\n${container} ＋ ${volume} ＝ ${container + volume} g重`, '物体は糸でつるされ、容器の底にはふれていません。水はこぼれません。');
      case 'scale-half':
        return make({}, '物体の体積の半分だけを水に入れました。\n台ばかりの値は何 g重？', container + volume / 2, 'g重',
          `水中の体積は ${volume} ÷ 2 ＝ ${volume / 2} cm³。\n浮力と同じ${volume / 2} g重だけ、台ばかりの値が増えます。\n${container} ＋ ${volume / 2} ＝ ${container + volume / 2} g重`, '物体は糸でつるされ、容器の底にはふれていません。水はこぼれません。');
      case 'scale-bottom':
        return make({}, '物体が底にのり、糸はゆるんでいます。\n台ばかりは何 g重を示す？', container + weight, 'g重',
          `糸がゆるんで、ばねばかりは0 g重。\n台ばかりが、容器・水・物体の全部を支えます。\n${container} ＋ ${weight} ＝ ${container + weight} g重`, '水はこぼれません。物体をすべて水中に入れても容器に余裕があります。');
      case 'pressure': {
        const down = pick([10, 20, 30, 40]);
        const up = down + volume;
        return make({ down, up }, '水が上面を押す力と、下面を押す力。\nこの物体が受ける浮力は何 g重？', volume, 'g重',
          `左右から押す力は打ち消し合います。\n下面を上に押す力の方が大きいので、その差が浮力です。\n${up} − ${down} ＝ ${volume} g重`, '矢印は水から受ける力だけを表しています。');
      }
      case 'check-half':
        return make({}, '物体Xの体積の半分を水に入れました。\nばねばかりは何 g重を示す？', weight - volume / 2, 'g重',
          `水中の体積は ${volume} ÷ 2 ＝ ${volume / 2} cm³。\n浮力は${volume / 2} g重なので、\n${weight} − ${volume / 2} ＝ ${weight - volume / 2} g重`, '物体は容器の底や側面にはふれていません。');
      case 'release': {
        const density = pick([0.5, 1, 2]);
        const releaseWeight = volume * density;
        const labels = ['水面に浮く', '水中にとどまる', '底にしずむ', '水面から飛び出す'];
        return { ...make({ density, releaseWeight }, '物体Xを水中で静かにはなすと、\n最後にどうなる？', labels[density === 0.5 ? 0 : density === 1 ? 1 : 2], '',
          `全体が水中にあるときの浮力は${volume} g重。\n物体の重さは${releaseWeight} g重です。\n${density < 1 ? '浮力の方が大きいので上がり、水面で一部を出して浮きます。' : density === 1 ? '重さと浮力が同じなので、水中にとどまります。' : '重さの方が大きいので、底にしずみます。'}`, '物体は水にとけず、体積も変わりません。'), labels };
      }
      default: throw new Error(`Unknown question: ${id}`);
    }
  }

  const templates = [
    ['pitch', 'ばねの間隔とのび', 'spring', 'pitch'], ['cut', '半分に切ったばね', 'spring', 'cut'],
    ['strength', 'グラフからのびを読む', 'spring', 'strength'], ['series', '直列つなぎののび', 'spring', 'series'],
    ['parallel', '並列つなぎののび', 'spring', 'parallel'], ['mixed', '直列 × 並列', 'spring', 'mixed'],
    ['pulley', '滑車とばねのつり合い', 'spring', 'pulley'], ['forces', '両側から引く力', 'spring', 'forces'],
    ['table', '表から自然長を読む', 'spring', 'table'], ['series-total', '直列つなぎの全長', 'spring', 'series-total'],
    ['parallel-check', '棒の中央につるすと？', 'spring', 'parallel-check'],
    ['volume', '体積が変わると浮力は？', 'buoyancy', 'volume'], ['air', '空気中のつり合い', 'buoyancy', 'water'],
    ['water', '水中のばねばかり', 'buoyancy', 'water'], ['float', '水面に浮くとき', 'buoyancy', 'float'],
    ['scale-before', '水に入れる前のはかり', 'buoyancy', 'scale-before'],
    ['scale-full', 'すべて水にしずめると？', 'buoyancy', 'scale-states'], ['scale-half', '半分だけしずめると？', 'buoyancy', 'scale-states'],
    ['scale-bottom', '底にのせると？', 'buoyancy', 'scale-states'], ['pressure', '水圧の差が浮力になる', 'buoyancy', 'pressure'],
    ['check-air', '物体X・空気中の力', 'buoyancy', 'check-air'], ['check-full', '物体X・全部を水中へ', 'buoyancy', 'check-air'],
    ['check-half', '物体X・半分を水中へ', 'buoyancy', 'check-half'], ['release', '糸をはずすとどうなる？', 'buoyancy', 'check-half'],
  ].map(([id, title, category, source]) => ({ id, title, category, source }));

  function createQuestion(id, random = Math.random, previousSignature = '') {
    const template = templates.find(item => item.id === id);
    if (!template) throw new Error(`Unknown template: ${id}`);
    let question;
    let signature;
    for (let attempt = 0; attempt < 20; attempt++) {
      question = variant(id, random);
      // Include the visible values, not unused random parameters, in the signature.
      signature = JSON.stringify([question.prompt, question.answer, question.note, question.explanation]);
      if (signature !== previousSignature) break;
    }
    let options;
    if (question.labels) {
      options = shuffle(question.labels, random);
    } else {
      const step = question.unit === 'g重' ? 5 : question.unit === 'mm' ? 1 : 2;
      const candidates = new Set([question.answer]);
      for (const candidate of [question.answer / 2, question.answer * 2, question.answer - step, question.answer + step, question.answer + step * 2, question.answer - step * 2]) {
        if (Number.isInteger(candidate) && candidate >= 0 && candidate !== question.answer) candidates.add(candidate);
      }
      options = shuffle([question.answer, ...shuffle([...candidates].filter(value => value !== question.answer), random).slice(0, 3)], random);
    }
    const result = {
      ...template, ...question, signature, options,
      sourceInfo: sources.find(item => item.id === template.source),
      conditions: template.category === 'spring' ? 'ばね・糸・棒の重さは考えません。' : '水の密度は1 g/cm³です。',
    };
    result.facts = describe(result);
    return result;
  }

  function describe(q) {
    const d = q.data;
    switch (q.id) {
      case 'pitch': return `間隔は${d.gaps}つ。1つの間隔の広がりは${d.widening} mm。`;
      case 'cut': return `Aの自然長は${d.natural} cm、のびは${d.whole} cm。A・Bともに${d.mass} gをつるします。`;
      case 'strength': return `Bは${d.mass} gで${d.extension} cmのびます。Aは同じ重さで${d.extension * 2} cmのびます。`;
      case 'series': return `1本では${d.mass} gで${d.extension} cmのびます。同じおもりを${d.n}本の直列につるします。`;
      case 'parallel': return `1本では${d.mass} gで${d.single} cmのびます。2本でも同じ${d.mass} gをつるします。`;
      case 'mixed': return `1本では${d.mass} gで${d.extension * 2} cmのびます。上2本は同じばね。下のおもりは${d.mass} g。`;
      case 'pulley': return `Aは${d.mass} gで${d.extension} cmのびます。Bは片側、Cは両側にそれぞれ${d.mass} gのおもり。`;
      case 'forces': return `${d.mass} g重で${d.extension} cmのびるばね。両端をそれぞれ${d.mass} g重で引きます。`;
      case 'table': return `${d.step} gで全長${d.base + d.extension} cm、${d.step * 2} gで${d.base + d.extension * 2} cm。`;
      case 'series-total': return `1本の自然長は${d.base} cm、${d.mass} gで${d.extension} cmのびます。直列2本に${d.mass} gをつるします。`;
      case 'parallel-check': return `1本は${d.mass} gで${d.extension} cmのびます。左右同じばねで、中央に${d.mass * 2} gをつるします。`;
      case 'volume': return `A・B・Cはどれも${d.weight} g。体積はAが${d.v}、Bが${d.v * 2}、Cが${d.v * 3} cm³。`;
      case 'float': return `物体の重さは${d.floatWeight} g、全体の体積は${d.floatVolume} cm³。`;
      case 'scale-before': return `物体は${d.weight} g、容器と水は合わせて${d.container} g。`;
      case 'scale-full': case 'scale-half': case 'scale-bottom':
        return `物体は${d.weight} g、体積${d.volume} cm³。容器と水は合わせて${d.container} g。`;
      case 'pressure': return `上面に下向き${d.down} g重、下面に上向き${d.up} g重。左右の力は同じ大きさです。`;
      case 'release': return `物体Xは${d.releaseWeight} g、体積は${d.volume} cm³。`;
      default: return `物体の重さは${d.weight} g、体積は${d.volume} cm³。`;
    }
  }

  function grade(question, selected) {
    return question.options[selected] === question.answer;
  }

  const api = { sources, templates, createQuestion, grade, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SpringQuiz = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
