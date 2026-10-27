/* 社会 第4回 平安時代 ～一行問題 4択クイズ データ～
 * 元データ: ../一行問題.txt（全45問）を4択形式に変換。
 * 各問題は options を4つ持ち、そのうち1つだけ correct:true。
 * icon は icons.js の ICONS オブジェクトのキーに対応する。
 * furigana は任意（漢字語のみ付与）。
 */
const QUIZ_DATA = [
  {
    q: "唐の文化を土台にして、日本の風土や生活にあった文化を何文化といいますか。",
    options: [
      { label: "国風", furigana: "こくふう", icon: "fan", correct: true },
      { label: "唐風", furigana: "とうふう", icon: "fan" },
      { label: "天平", furigana: "てんぴょう", icon: "book" },
      { label: "ラーメン", icon: "joke_sweet" }
    ]
  },
  {
    q: "794年、都を平安京に移した天皇はだれですか。",
    options: [
      { label: "桓武天皇", furigana: "かんむてんのう", icon: "emperor", correct: true },
      { label: "聖武天皇", furigana: "しょうむてんのう", icon: "emperor" },
      { label: "白河天皇", furigana: "しらかわてんのう", icon: "retired_emperor" },
      { label: "マリオ", icon: "joke_hero" }
    ]
  },
  {
    q: "かぐや姫の伝説をもとにした物語はどれですか。",
    options: [
      { label: "竹取物語", furigana: "たけとりものがたり", icon: "book", correct: true },
      { label: "源氏物語", furigana: "げんじものがたり", icon: "writer_woman" },
      { label: "枕草子", furigana: "まくらのそうし", icon: "writer_woman" },
      { label: "ドラゴンボール", icon: "joke_dragon" }
    ]
  },
  {
    q: "桓武天皇が蝦夷を討つために坂上田村麻呂を任命した役職を何といいますか。",
    options: [
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "shogun", correct: true },
      { label: "太政大臣", furigana: "だいじょうだいじん", icon: "daijodaijin" },
      { label: "関白", furigana: "かんぱく", icon: "court_official" },
      { label: "ウルトラマン", icon: "joke_hero" }
    ]
  },
  {
    q: "天皇が幼いときに天皇をたすけて政治を行う役職を何といいますか。",
    options: [
      { label: "摂政", furigana: "せっしょう", icon: "court_official", correct: true },
      { label: "関白", furigana: "かんぱく", icon: "court_official" },
      { label: "太政大臣", furigana: "だいじょうだいじん", icon: "daijodaijin" },
      { label: "忍者", icon: "joke_hero" }
    ]
  },
  {
    q: "平清盛が1167年についた、武士として初めての役職はどれですか。",
    options: [
      { label: "太政大臣", furigana: "だいじょうだいじん", icon: "daijodaijin", correct: true },
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "shogun" },
      { label: "関白", furigana: "かんぱく", icon: "court_official" },
      { label: "パティシエ", icon: "joke_sweet" }
    ]
  },
  {
    q: "天皇が成人した後に天皇をたすけて政治を行う役職を何といいますか。",
    options: [
      { label: "関白", furigana: "かんぱく", icon: "court_official", correct: true },
      { label: "摂政", furigana: "せっしょう", icon: "court_official" },
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "shogun" },
      { label: "魔法使い", icon: "joke_sparkle" }
    ]
  },
  {
    q: "藤原氏が摂政・関白の地位を独占して行った政治を何政治といいますか。",
    options: [
      { label: "摂関", furigana: "せっかん", icon: "court_official", correct: true },
      { label: "院政", furigana: "いんせい", icon: "retired_emperor" },
      { label: "律令", furigana: "りつりょう", icon: "book" },
      { label: "ゲーム実況", icon: "joke_sparkle" }
    ]
  },
  {
    q: "「この世をば わが世とぞ思ふ 望月の 欠けたることもなしと思へば」とよんだ人物はだれですか。",
    options: [
      { label: "藤原道長", furigana: "ふじわらのみちなが", icon: "noble", correct: true },
      { label: "藤原頼通", furigana: "ふじわらのよりみち", icon: "noble" },
      { label: "菅原道真", furigana: "すがわらのみちざね", icon: "scholar" },
      { label: "サンタクロース", icon: "joke_fairytale" }
    ]
  },
  {
    q: "藤原頼通が1052年に京都府宇治市に建てた阿弥陀堂はどれですか。",
    options: [
      { label: "中尊寺金色堂", furigana: "ちゅうそんじこんじきどう", icon: "temple_gold" },
      { label: "延暦寺", furigana: "えんりゃくじ", icon: "temple_mountain" },
      { label: "平等院鳳凰堂", furigana: "びょうどういんほうおうどう", icon: "temple_phoenix", correct: true },
      { label: "東京スカイツリー", icon: "joke_landmark" }
    ]
  },
  {
    q: "藤原道長の子で、摂関政治の全盛期を築いた人物はだれですか。",
    options: [
      { label: "藤原頼通", furigana: "ふじわらのよりみち", icon: "noble", correct: true },
      { label: "藤原道長", furigana: "ふじわらのみちなが", icon: "noble" },
      { label: "藤原純友", furigana: "ふじわらのすみとも", icon: "pirate_ship" },
      { label: "スパイダーマン", icon: "joke_hero" }
    ]
  },
  {
    q: "894年、遣唐使の停止を朝廷に提案した人物はだれですか。",
    options: [
      { label: "菅原道真", furigana: "すがわらのみちざね", icon: "scholar", correct: true },
      { label: "藤原道長", furigana: "ふじわらのみちなが", icon: "noble" },
      { label: "最澄", furigana: "さいちょう", icon: "monk_a" },
      { label: "ドラえもん", icon: "joke_hero" }
    ]
  },
  {
    q: "菅原道真が藤原氏によって左遷された、九州の地を何といいますか。",
    options: [
      { label: "大宰府", furigana: "だざいふ", icon: "gate_building", correct: true },
      { label: "平泉", furigana: "ひらいずみ", icon: "gate_building" },
      { label: "京都", furigana: "きょうと", icon: "mansion" },
      { label: "ハワイ", icon: "joke_landmark" }
    ]
  },
  {
    q: "空海が和歌山県の高野山に建てた、真言宗の寺院はどれですか。",
    options: [
      { label: "延暦寺", furigana: "えんりゃくじ", icon: "temple_mountain" },
      { label: "金剛峯寺", furigana: "こんごうぶじ", icon: "temple_mountain", correct: true },
      { label: "中尊寺金色堂", furigana: "ちゅうそんじこんじきどう", icon: "temple_gold" },
      { label: "東京タワー", icon: "joke_landmark" }
    ]
  },
  {
    q: "菅原道真をまつり、「学問の神様」として信仰されている神を何といいますか。",
    options: [
      { label: "天神", furigana: "てんじん", icon: "shrine", correct: true },
      { label: "八幡神", furigana: "はちまんしん", icon: "shrine" },
      { label: "氏神", furigana: "うじがみ", icon: "shrine" },
      { label: "ゼウス", icon: "joke_sparkle" }
    ]
  },
  {
    q: "地方の豪族や貴族が、荘園の権利を守るために中央の有力者にささげることを何といいますか。",
    options: [
      { label: "寄進", furigana: "きしん", icon: "offering", correct: true },
      { label: "貢納", furigana: "こうのう", icon: "offering" },
      { label: "年貢", furigana: "ねんぐ", icon: "coin" },
      { label: "プレゼント交換", icon: "joke_sparkle" }
    ]
  },
  {
    q: "最澄が天台宗を伝え、滋賀県に建てた寺院はどれですか。",
    options: [
      { label: "金剛峯寺", furigana: "こんごうぶじ", icon: "temple_mountain" },
      { label: "延暦寺", furigana: "えんりゃくじ", icon: "temple_mountain", correct: true },
      { label: "平等院鳳凰堂", furigana: "びょうどういんほうおうどう", icon: "temple_phoenix" },
      { label: "ディズニーランド", icon: "joke_landmark" }
    ]
  },
  {
    q: "尾張国の人々が悪政31か条を朝廷に訴えた国司の名はだれですか。",
    options: [
      { label: "藤原元命", furigana: "ふじわらのもとなが", icon: "corrupt_official", correct: true },
      { label: "藤原純友", furigana: "ふじわらのすみとも", icon: "pirate_ship" },
      { label: "平将門", furigana: "たいらのまさかど", icon: "warrior" },
      { label: "ジャイアン", icon: "joke_hero" }
    ]
  },
  {
    q: "939年、関東地方で新皇と名のって反乱を起こした人物はだれですか。",
    options: [
      { label: "平将門", furigana: "たいらのまさかど", icon: "warrior", correct: true },
      { label: "藤原純友", furigana: "ふじわらのすみとも", icon: "pirate_ship" },
      { label: "平清盛", furigana: "たいらのきよもり", icon: "warrior" },
      { label: "ガンダム", icon: "joke_hero" }
    ]
  },
  {
    q: "かな文字で書かれた最初の日記とされる『土佐日記』の作者はだれですか。",
    options: [
      { label: "紫式部", furigana: "むらさきしきぶ", icon: "writer_woman" },
      { label: "清少納言", furigana: "せいしょうなごん", icon: "writer_woman" },
      { label: "紀貫之", furigana: "きのつらゆき", icon: "writer_man", correct: true },
      { label: "浦島太郎", icon: "joke_fairytale" }
    ]
  },
  {
    q: "939年、瀬戸内海の海賊を率いて反乱を起こした伊予国の元役人はだれですか。",
    options: [
      { label: "藤原純友", furigana: "ふじわらのすみとも", icon: "pirate_ship", correct: true },
      { label: "平将門", furigana: "たいらのまさかど", icon: "warrior" },
      { label: "平清盛", furigana: "たいらのきよもり", icon: "warrior" },
      { label: "ルフィ", icon: "joke_hero" }
    ]
  },
  {
    q: "荘園が税を納めなくてよい権利を何の権といいますか。",
    options: [
      { label: "不輸", furigana: "ふゆ", icon: "coin", correct: true },
      { label: "不入", furigana: "ふにゅう", icon: "blocked_gate" },
      { label: "免除", furigana: "めんじょ", icon: "coin" },
      { label: "ノーベル賞", icon: "joke_sparkle" }
    ]
  },
  {
    q: "国司の役人が荘園への立ち入りを断ることができる権利を何の権といいますか。",
    options: [
      { label: "不入", furigana: "ふにゅう", icon: "blocked_gate", correct: true },
      { label: "不輸", furigana: "ふゆ", icon: "coin" },
      { label: "検地", furigana: "けんち", icon: "blocked_gate" },
      { label: "ゾンビランド", icon: "joke_landmark" }
    ]
  },
  {
    q: "平将門が反乱を起こしたのはどこの地方ですか。",
    options: [
      { label: "関東地方", furigana: "かんとうちほう", icon: "clan_crest", correct: true },
      { label: "近畿地方", furigana: "きんきちほう", icon: "clan_crest" },
      { label: "九州地方", furigana: "きゅうしゅうちほう", icon: "clan_crest" },
      { label: "おとぎの国", icon: "joke_fairytale" }
    ]
  },
  {
    q: "11世紀末ごろから、岩手県平泉を中心に3代にわたって栄えた一族を何氏といいますか。",
    options: [
      { label: "奥州藤原", furigana: "おうしゅうふじわら", icon: "clan_crest", correct: true },
      { label: "桓武平", furigana: "かんむへい", icon: "clan_crest" },
      { label: "清和源", furigana: "せいわげん", icon: "clan_crest" },
      { label: "ドラゴン", icon: "joke_dragon" }
    ]
  },
  {
    q: "奥州藤原氏が平泉に建てた、金箔でかざられたお堂を何といいますか。",
    options: [
      { label: "中尊寺金色堂", furigana: "ちゅうそんじこんじきどう", icon: "temple_gold", correct: true },
      { label: "平等院鳳凰堂", furigana: "びょうどういんほうおうどう", icon: "temple_phoenix" },
      { label: "金閣寺", furigana: "きんかくじ", icon: "temple_gold" },
      { label: "ピラミッド", icon: "joke_landmark" }
    ]
  },
  {
    q: "瀬戸内海の海賊を率いて反乱を起こしたのはだれですか。",
    options: [
      { label: "平将門", furigana: "たいらのまさかど", icon: "warrior" },
      { label: "藤原純友", furigana: "ふじわらのすみとも", icon: "pirate_ship", correct: true },
      { label: "平清盛", furigana: "たいらのきよもり", icon: "warrior" },
      { label: "桃太郎", icon: "joke_fairytale" }
    ]
  },
  {
    q: "1086年、位を子にゆずり、上皇となった後も政治を行った天皇はだれですか。",
    options: [
      { label: "白河天皇", furigana: "しらかわてんのう", icon: "retired_emperor", correct: true },
      { label: "堀河天皇", furigana: "ほりかわてんのう", icon: "emperor" },
      { label: "桓武天皇", furigana: "かんむてんのう", icon: "emperor" },
      { label: "ネプチューン", icon: "joke_sparkle" }
    ]
  },
  {
    q: "上皇（院）が行う政治を何といいますか。",
    options: [
      { label: "院政", furigana: "いんせい", icon: "retired_emperor", correct: true },
      { label: "摂関政治", furigana: "せっかんせいじ", icon: "court_official" },
      { label: "律令政治", furigana: "りつりょうせいじ", icon: "book" },
      { label: "ゲーム実況", icon: "joke_sparkle" }
    ]
  },
  {
    q: "保元の乱・平治の乱に勝利し、武士として初めて太政大臣となったのはだれですか。",
    options: [
      { label: "源義朝", furigana: "みなもとのよしとも", icon: "warrior" },
      { label: "平清盛", furigana: "たいらのきよもり", icon: "warrior", correct: true },
      { label: "平将門", furigana: "たいらのまさかど", icon: "warrior" },
      { label: "仮面ライダー", icon: "joke_hero" }
    ]
  },
  {
    q: "天皇家や貴族に仕える者という意味で、武士のことを何ともよびますか。",
    options: [
      { label: "侍", furigana: "さむらい", icon: "warrior", correct: true },
      { label: "武者", furigana: "むしゃ", icon: "warrior" },
      { label: "豪族", furigana: "ごうぞく", icon: "clan_crest" },
      { label: "ロボット", icon: "joke_hero" }
    ]
  },
  {
    q: "1156年、天皇方と上皇方が争った戦いを何の乱といいますか。",
    options: [
      { label: "保元", furigana: "ほうげん", icon: "battle_flags", correct: true },
      { label: "平治", furigana: "へいじ", icon: "battle_flags" },
      { label: "壬申", furigana: "じんしん", icon: "battle_flags" },
      { label: "雪合戦", icon: "joke_sparkle" }
    ]
  },
  {
    q: "1159年、平清盛と源義朝が争った戦いを何の乱といいますか。",
    options: [
      { label: "平治", furigana: "へいじ", icon: "battle_flags", correct: true },
      { label: "保元", furigana: "ほうげん", icon: "battle_flags" },
      { label: "承久", furigana: "じょうきゅう", icon: "battle_flags" },
      { label: "枕投げ合戦", icon: "joke_sparkle" }
    ]
  },
  {
    q: "桓武天皇が都を平安京に移したのは何年ですか。",
    options: [
      { label: "710年", icon: "calendar" },
      { label: "794年", icon: "calendar", correct: true },
      { label: "1086年", icon: "calendar" },
      { label: "西暦2000年", icon: "joke_sparkle" }
    ]
  },
  {
    q: "平治の乱に勝利し、1167年に太政大臣となった人物はだれですか。",
    options: [
      { label: "平清盛", furigana: "たいらのきよもり", icon: "warrior", correct: true },
      { label: "源義朝", furigana: "みなもとのよしとも", icon: "warrior" },
      { label: "藤原純友", furigana: "ふじわらのすみとも", icon: "pirate_ship" },
      { label: "アンパンマン", icon: "joke_hero" }
    ]
  },
  {
    q: "平清盛が瀬戸内海の航路を整えて宋との間で行った貿易を何貿易といいますか。",
    options: [
      { label: "日宋", furigana: "にっそう", icon: "trade_ship", correct: true },
      { label: "日明", furigana: "にちみん", icon: "trade_ship" },
      { label: "日唐", furigana: "にっとう", icon: "trade_ship" },
      { label: "ポケモン", icon: "joke_hero" }
    ]
  },
  {
    q: "9世紀初め、唐にわたって天台宗を伝え、延暦寺を建てた人物はだれですか。",
    options: [
      { label: "最澄", furigana: "さいちょう", icon: "monk_a", correct: true },
      { label: "空海", furigana: "くうかい", icon: "monk_b" },
      { label: "鑑真", furigana: "がんじん", icon: "monk_a" },
      { label: "ヨーダ", icon: "joke_hero" }
    ]
  },
  {
    q: "9世紀初め、唐にわたって真言宗を伝え、金剛峯寺を建てた人物はだれですか。",
    options: [
      { label: "空海", furigana: "くうかい", icon: "monk_b", correct: true },
      { label: "最澄", furigana: "さいちょう", icon: "monk_a" },
      { label: "鑑真", furigana: "がんじん", icon: "monk_a" },
      { label: "ハリーポッター", icon: "joke_hero" }
    ]
  },
  {
    q: "漢字をくずした形からつくられたかな文字を何といいますか。",
    options: [
      { label: "ひらがな", icon: "hiragana", correct: true },
      { label: "カタカナ", icon: "katakana" },
      { label: "万葉仮名", furigana: "まんようがな", icon: "book" },
      { label: "絵文字", icon: "joke_sparkle" }
    ]
  },
  {
    q: "漢字のへんやつくりなどからつくられたかな文字を何といいますか。",
    options: [
      { label: "カタカナ", icon: "katakana", correct: true },
      { label: "ひらがな", icon: "hiragana" },
      { label: "万葉仮名", furigana: "まんようがな", icon: "book" },
      { label: "QRコード", icon: "joke_sparkle" }
    ]
  },
  {
    q: "紀貫之らが編集した和歌集を何といいますか。",
    options: [
      { label: "古今和歌集", furigana: "こきんわかしゅう", icon: "book", correct: true },
      { label: "万葉集", furigana: "まんようしゅう", icon: "book" },
      { label: "源氏物語", furigana: "げんじものがたり", icon: "writer_woman" },
      { label: "少年ジャンプ", icon: "joke_sparkle" }
    ]
  },
  {
    q: "貴族の生活や感情をたくみにえがいた物語『源氏物語』の作者はだれですか。",
    options: [
      { label: "紫式部", furigana: "むらさきしきぶ", icon: "writer_woman", correct: true },
      { label: "清少納言", furigana: "せいしょうなごん", icon: "writer_woman" },
      { label: "紀貫之", furigana: "きのつらゆき", icon: "writer_man" },
      { label: "シンデレラ", icon: "joke_fairytale" }
    ]
  },
  {
    q: "自然の変化などを鋭い感覚でえがいた随筆『枕草子』の作者はだれですか。",
    options: [
      { label: "清少納言", furigana: "せいしょうなごん", icon: "writer_woman", correct: true },
      { label: "紫式部", furigana: "むらさきしきぶ", icon: "writer_woman" },
      { label: "紀貫之", furigana: "きのつらゆき", icon: "writer_man" },
      { label: "白雪姫", icon: "joke_fairytale" }
    ]
  },
  {
    q: "貴族の住まいのつくりを何造といいますか。",
    options: [
      { label: "寝殿", furigana: "しんでん", icon: "mansion", correct: true },
      { label: "書院", furigana: "しょいん", icon: "mansion" },
      { label: "数寄屋", furigana: "すきや", icon: "mansion" },
      { label: "ログハウス", icon: "joke_landmark" }
    ]
  },
  {
    q: "念仏を唱えれば阿弥陀仏に救われるとする信仰を何教といいますか。",
    options: [
      { label: "浄土", furigana: "じょうど", icon: "lotus", correct: true },
      { label: "天台", furigana: "てんだい", icon: "lotus" },
      { label: "真言", furigana: "しんごん", icon: "lotus" },
      { label: "ジェダイ", icon: "joke_sparkle" }
    ]
  }
];
