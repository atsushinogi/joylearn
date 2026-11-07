"use strict";

(function (root) {
  const rocks = [
    {
      id: "mudstone", name: "デイ岩（泥岩）", shortName: "泥岩", category: "堆積岩", origin: "流水のはたらき", image: "assets/sample-01.webp",
      description: "どろが固まってできた、きめの細かい岩石です。",
      hint: "どろが材料です。粒がとても細かく、表面のきめに注目しよう。"
    },
    {
      id: "sandstone", name: "サ岩（砂岩）", shortName: "砂岩", category: "堆積岩", origin: "流水のはたらき", image: "assets/sample-02.webp",
      description: "砂が固まってできた、灰色やうす茶色の岩石です。",
      hint: "砂が材料です。どろよりも大きな粒が固まっています。"
    },
    {
      id: "conglomerate", name: "レキ岩（礫岩）", shortName: "礫岩", category: "堆積岩", origin: "流水のはたらき", image: "assets/sample-03.webp",
      description: "レキ（小石）が砂やどろといっしょに固まってできた岩石です。レキは角がとれて丸みをおびています。",
      hint: "丸みをおびた小石が見えるよ。水に運ばれて角がとれた石です。"
    },
    {
      id: "limestone", name: "セッカイ岩（石灰岩）", shortName: "石灰岩", category: "堆積岩", origin: "生物の死がいなど", image: "assets/sample-04.webp",
      description: "貝やサンゴ、フズリナの死がいなどが堆積してできた岩石です。白や灰色のものが多く、塩酸にとけて二酸化炭素を出します。",
      hint: "貝やサンゴなどが材料です。塩酸を加えたときに出る気体も手がかり。"
    },
    {
      id: "chert", name: "チャート", shortName: "チャート", category: "堆積岩", origin: "生物の死がいなど", image: "assets/sample-05.webp",
      description: "ホウサンチュウの死がいなどが堆積してできた岩石です。白、緑、赤茶色のものが多く、とてもかたいので、昔は火打ち石として使われていました。",
      hint: "ホウサンチュウが材料です。かたく、昔は火を起こすのに使われました。"
    },
    {
      id: "tuff", name: "ギョウカイ岩（凝灰岩）", shortName: "凝灰岩", category: "堆積岩", origin: "火山活動", image: "assets/sample-06.webp",
      description: "火山灰などが固まってできた岩石で、灰色やうすい緑色のものが多く見られます。やわらかいが熱に強く、へいなどに使われます。",
      hint: "火山がふき出した灰などが材料です。やわらかいけれど熱に強いよ。"
    },
    {
      id: "marble", name: "大理石", shortName: "大理石", category: "変成岩", origin: "熱による変化", image: "assets/sample-07.webp",
      description: "セッカイ岩がマグマの熱を受けてできます。建築材料や彫刻の材料として使われます。",
      hint: "もとは石灰岩です。マグマの熱を受けて変化し、彫刻にも使われます。"
    },
    {
      id: "slate", name: "ネンバン岩（粘板岩）", shortName: "粘板岩", category: "変成岩", origin: "圧力による変化", image: "assets/sample-08.webp",
      description: "デイ岩が高い圧力によってさらにかたくなってできます。すずりの材料として使われます。",
      hint: "もとは泥岩です。高い圧力で変化し、習字で使うすずりの材料になります。"
    }
  ];
  if (typeof module === "object" && module.exports) module.exports = rocks;
  else root.SEDIMENTARY_ROCKS = rocks;
})(globalThis);
