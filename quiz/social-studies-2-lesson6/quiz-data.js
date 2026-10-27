/* 社会 第6回 鎌倉時代 ～一行問題 4択クイズ データ～
 * 元データ: ../一行問題.txt（全45問）を4択形式に変換。
 * 各問題は options を4つ持ち、そのうち1つだけ correct:true。
 * icon は icons/ フォルダの画像ファイル名（拡張子なし）に対応する。
 * furigana は任意（漢字語のみ付与）。
 */
const QUIZ_DATA = [
  {
    q: "鎌倉時代に肥料として用いられるようになったものはどれですか。",
    options: [
      { label: "草や木の灰", furigana: "くさやきのはい", icon: "ash_fertilizer", correct: true },
      { label: "干鰯", furigana: "ほしか", icon: "ash_fertilizer" },
      { label: "化学肥料", furigana: "かがくひりょう", icon: "ash_fertilizer" },
      { label: "わたあめ", icon: "joke_sweet" }
    ]
  },
  {
    q: "武士が命懸けで守る領地を「何の地」といいましたか。「一生懸命」ということばはここから生まれました。",
    options: [
      { label: "一所懸命", furigana: "いっしょけんめい", icon: "land_deed", correct: true },
      { label: "一騎当千", furigana: "いっきとうせん", icon: "samurai" },
      { label: "一族郎党", furigana: "いちぞくろうとう", icon: "hojo_regent" },
      { label: "一発逆転", furigana: "いっぱつぎゃくてん", icon: "joke_sparkle" }
    ]
  },
  {
    q: "「南無阿弥陀仏」ととなえれば極楽に生まれることができると説いた、法然の宗派はどれですか。",
    options: [
      { label: "浄土宗", furigana: "じょうどしゅう", icon: "nembutsu_monk", correct: true },
      { label: "日蓮宗", furigana: "にちれんしゅう", icon: "nichiren_monk" },
      { label: "曹洞宗", furigana: "そうとうしゅう", icon: "zen_monk" },
      { label: "カレー宗", icon: "joke_sweet" }
    ]
  },
  {
    q: "阿弥陀仏を信じさえすれば往生できるとし、悪人にこそ救われる道があると説いた親鸞の宗派はどれですか。",
    options: [
      { label: "浄土真宗", furigana: "じょうどしんしゅう", icon: "nembutsu_monk", correct: true },
      { label: "時宗", furigana: "じしゅう", icon: "nembutsu_monk" },
      { label: "日蓮宗", furigana: "にちれんしゅう", icon: "nichiren_monk" },
      { label: "ラーメン宗", icon: "joke_sweet" }
    ]
  },
  {
    q: "北条氏が執権として幕府の政治を動かした政治を何といいますか。",
    options: [
      { label: "執権政治", furigana: "しっけんせいじ", icon: "hojo_regent", correct: true },
      { label: "摂関政治", furigana: "せっかんせいじ", icon: "court_noble" },
      { label: "院政", furigana: "いんせい", icon: "retired_emperor" },
      { label: "おやつ政治", icon: "joke_sweet" }
    ]
  },
  {
    q: "御家人が「いざ鎌倉」とかけつけ、命がけで将軍のために戦うことを何といいますか。",
    options: [
      { label: "奉公", furigana: "ほうこう", icon: "mounted_archer", correct: true },
      { label: "御恩", furigana: "ごおん", icon: "land_deed" },
      { label: "寄進", furigana: "きしん", icon: "land_deed" },
      { label: "かくれんぼ", icon: "joke_sparkle" }
    ]
  },
  {
    q: "道元が開いた、座禅によって悟りを得ることを重んじた禅宗はどれですか。",
    options: [
      { label: "曹洞宗", furigana: "そうとうしゅう", icon: "zen_monk", correct: true },
      { label: "臨済宗", furigana: "りんざいしゅう", icon: "zen_hall" },
      { label: "浄土宗", furigana: "じょうどしゅう", icon: "nembutsu_monk" },
      { label: "お昼寝宗", icon: "joke_sparkle" }
    ]
  },
  {
    q: "承久の乱の後、朝廷の監視や西国の御家人の取りしまりのために京都に置かれた機関はどれですか。",
    options: [
      { label: "六波羅探題", furigana: "ろくはらたんだい", icon: "great_gate", correct: true },
      { label: "問注所", furigana: "もんちゅうじょ", icon: "judge" },
      { label: "大宰府", furigana: "だざいふ", icon: "court_noble" },
      { label: "ひみつ基地", icon: "joke_landmark" }
    ]
  },
  {
    q: "御家人が鎌倉と自分の領地を行き来するために整備され、後に何とよばれるようになった道はどれですか。",
    options: [
      { label: "鎌倉街道", furigana: "かまくらかいどう", icon: "kamakura_road", correct: true },
      { label: "東海道", furigana: "とうかいどう", icon: "kamakura_road" },
      { label: "シルクロード", icon: "kamakura_road" },
      { label: "虹の橋", icon: "joke_fairytale" }
    ]
  },
  {
    q: "鎌倉幕府のしくみのうち、裁判を担当した機関はどれですか。",
    options: [
      { label: "問注所", furigana: "もんちゅうじょ", icon: "judge", correct: true },
      { label: "政所", furigana: "まんどころ", icon: "judge" },
      { label: "侍所", furigana: "さむらいどころ", icon: "samurai" },
      { label: "交番", icon: "joke_landmark" }
    ]
  },
  {
    q: "荘園などに置かれ、土地の管理や年貢の取り立てを行った役職はどれですか。",
    options: [
      { label: "地頭", furigana: "じとう", icon: "samurai", correct: true },
      { label: "守護", furigana: "しゅご", icon: "samurai" },
      { label: "国司", furigana: "こくし", icon: "court_noble" },
      { label: "サンタクロース", icon: "joke_hero" }
    ]
  },
  {
    q: "1274年、高麗の兵を従えた約3万の元軍が博多湾沿岸に攻めてきた戦いを何といいますか。",
    options: [
      { label: "文永の役", furigana: "ぶんえいのえき", icon: "mongol_ship", correct: true },
      { label: "弘安の役", furigana: "こうあんのえき", icon: "mongol_ship" },
      { label: "承久の乱", furigana: "じょうきゅうのらん", icon: "genpei_flags" },
      { label: "怪獣大決戦", icon: "joke_dragon" }
    ]
  },
  {
    q: "領地（土地）をなかだちとした主人と家来の関係を何といいますか。",
    options: [
      { label: "封建制度", furigana: "ほうけんせいど", icon: "land_deed", correct: true },
      { label: "氏姓制度", furigana: "しせいせいど", icon: "court_noble" },
      { label: "律令制度", furigana: "りつりょうせいど", icon: "law_scroll" },
      { label: "ポイントカード制度", icon: "joke_sparkle" }
    ]
  },
  {
    q: "琵琶法師によって語り伝えられ、文字を読めない多くの人に喜ばれた軍記物はどれですか。",
    options: [
      { label: "平家物語", furigana: "へいけものがたり", icon: "biwa_hoshi", correct: true },
      { label: "方丈記", furigana: "ほうじょうき", icon: "poem_book" },
      { label: "徒然草", furigana: "つれづれぐさ", icon: "poem_book" },
      { label: "桃太郎", furigana: "ももたろう", icon: "joke_fairytale" }
    ]
  },
  {
    q: "西日本で広まった、稲をかりとった後に麦を裏作としてつくる農業を何といいますか。",
    options: [
      { label: "二毛作", furigana: "にもうさく", icon: "two_crops", correct: true },
      { label: "二期作", furigana: "にきさく", icon: "two_crops" },
      { label: "焼畑", furigana: "やきはた", icon: "ash_fertilizer" },
      { label: "宇宙農業", icon: "joke_sparkle" }
    ]
  },
  {
    q: "将軍が御家人の領地を認めて保護したり、手柄に応じて新しい領地をあたえたりすることを何といいますか。",
    options: [
      { label: "御恩", furigana: "ごおん", icon: "land_deed", correct: true },
      { label: "奉公", furigana: "ほうこう", icon: "mounted_archer" },
      { label: "年貢", furigana: "ねんぐ", icon: "song_coins" },
      { label: "お年玉", furigana: "おとしだま", icon: "joke_sweet" }
    ]
  },
  {
    q: "元に従うよう、日本にたびたび使いを送ってきた元の皇帝はだれですか。",
    options: [
      { label: "フビライ＝ハン", icon: "kublai", correct: true },
      { label: "チンギス＝ハン", icon: "kublai" },
      { label: "マルコ＝ポーロ", icon: "transport_boat" },
      { label: "ウルトラマン", icon: "joke_hero" }
    ]
  },
  {
    q: "栄西が宋から伝え、鎌倉幕府の保護を受けた禅宗はどれですか。",
    options: [
      { label: "臨済宗", furigana: "りんざいしゅう", icon: "zen_hall", correct: true },
      { label: "曹洞宗", furigana: "そうとうしゅう", icon: "zen_monk" },
      { label: "時宗", furigana: "じしゅう", icon: "nembutsu_monk" },
      { label: "抹茶パフェ宗", icon: "joke_sweet" }
    ]
  },
  {
    q: "鎌倉幕府のしくみのうち、御家人の取りしまりや軍事を担当した機関はどれですか。",
    options: [
      { label: "侍所", furigana: "さむらいどころ", icon: "samurai", correct: true },
      { label: "政所", furigana: "まんどころ", icon: "judge" },
      { label: "問注所", furigana: "もんちゅうじょ", icon: "judge" },
      { label: "忍者屋敷", furigana: "にんじゃやしき", icon: "joke_landmark" }
    ]
  },
  {
    q: "1232年に定められた、武士による最初の法律（武家法）はどれですか。",
    options: [
      { label: "御成敗式目", furigana: "ごせいばいしきもく", icon: "law_scroll", correct: true },
      { label: "十七条の憲法", furigana: "じゅうしちじょうのけんぽう", icon: "law_scroll" },
      { label: "大宝律令", furigana: "たいほうりつりょう", icon: "law_scroll" },
      { label: "おやつは300円まで法", icon: "joke_sweet" }
    ]
  },
  {
    q: "北条氏が代々ついた、将軍をたすける役職はどれですか。",
    options: [
      { label: "執権", furigana: "しっけん", icon: "hojo_regent", correct: true },
      { label: "関白", furigana: "かんぱく", icon: "court_noble" },
      { label: "摂政", furigana: "せっしょう", icon: "court_noble" },
      { label: "学級委員", furigana: "がっきゅういいん", icon: "joke_hero" }
    ]
  },
  {
    q: "1281年、約14万の元の大軍が再び九州北部に攻めてきた戦いを何といいますか。",
    options: [
      { label: "弘安の役", furigana: "こうあんのえき", icon: "mongol_ship", correct: true },
      { label: "文永の役", furigana: "ぶんえいのえき", icon: "mongol_ship" },
      { label: "白村江の戦い", furigana: "はくすきのえのたたかい", icon: "mongol_ship" },
      { label: "宇宙人の大侵略", furigana: "うちゅうじんのだいしんりゃく", icon: "joke_dragon" }
    ]
  },
  {
    q: "国ごとに置かれ、国内の御家人の統率や軍事・警察にあたった役職はどれですか。",
    options: [
      { label: "守護", furigana: "しゅご", icon: "samurai", correct: true },
      { label: "地頭", furigana: "じとう", icon: "samurai" },
      { label: "郡司", furigana: "ぐんじ", icon: "court_noble" },
      { label: "勇者", furigana: "ゆうしゃ", icon: "joke_hero" }
    ]
  },
  {
    q: "1221年に、全国の武士に北条義時を討てと命令した上皇はだれですか。",
    options: [
      { label: "後鳥羽上皇", furigana: "ごとばじょうこう", icon: "retired_emperor", correct: true },
      { label: "白河上皇", furigana: "しらかわじょうこう", icon: "retired_emperor" },
      { label: "後白河上皇", furigana: "ごしらかわじょうこう", icon: "retired_emperor" },
      { label: "ゴジラ", icon: "joke_dragon" }
    ]
  },
  {
    q: "マルコ＝ポーロが『世界の記述（東方見聞録）』で、ヨーロッパに紹介した日本の呼び名はどれですか。",
    options: [
      { label: "ジパング", icon: "golden_island", correct: true },
      { label: "倭", furigana: "わ", icon: "golden_island" },
      { label: "大和", furigana: "やまと", icon: "golden_island" },
      { label: "ネバーランド", icon: "joke_fairytale" }
    ]
  },
  {
    q: "借金の取り消しを命じる法令で、1297年に出されたものが最初だったものを何といいますか。",
    options: [
      { label: "徳政令", furigana: "とくせいれい", icon: "law_scroll", correct: true },
      { label: "御成敗式目", furigana: "ごせいばいしきもく", icon: "law_scroll" },
      { label: "墾田永年私財法", furigana: "こんでんえいねんしざいのほう", icon: "law_scroll" },
      { label: "宿題ゼロ令", furigana: "しゅくだいぜろれい", icon: "joke_sparkle" }
    ]
  },
  {
    q: "鎌倉のまわりに、山をけずってつくられた7つの道を何といいますか。",
    options: [
      { label: "切通し", furigana: "きりどおし", icon: "kiridoshi", correct: true },
      { label: "関所", furigana: "せきしょ", icon: "kamakura_road" },
      { label: "石塁", furigana: "せきるい", icon: "stone_wall" },
      { label: "ウォータースライダー", icon: "joke_landmark" }
    ]
  },
  {
    q: "元の求めに応じず、元軍の襲来のときに執権をつとめていた人物はだれですか。",
    options: [
      { label: "北条時宗", furigana: "ほうじょうときむね", icon: "hojo_regent", correct: true },
      { label: "北条泰時", furigana: "ほうじょうやすとき", icon: "hojo_regent" },
      { label: "北条義時", furigana: "ほうじょうよしとき", icon: "hojo_regent" },
      { label: "ドラえもん", icon: "joke_hero" }
    ]
  },
  {
    q: "交通の便のよいところなどで、月3回定期的にたつようになった市を何といいますか。",
    options: [
      { label: "定期市", furigana: "ていきいち", icon: "market", correct: true },
      { label: "楽市", furigana: "らくいち", icon: "market" },
      { label: "朝市", furigana: "あさいち", icon: "market" },
      { label: "フリーマーケット・オン・ザ・ムーン", icon: "joke_sparkle" }
    ]
  },
  {
    q: "12世紀末に鎌倉にたてられた武士の政府を何といいますか。",
    options: [
      { label: "鎌倉幕府", furigana: "かまくらばくふ", icon: "shogun", correct: true },
      { label: "室町幕府", furigana: "むろまちばくふ", icon: "shogun" },
      { label: "江戸幕府", furigana: "えどばくふ", icon: "shogun" },
      { label: "お菓子の家", furigana: "おかしのいえ", icon: "joke_sweet" }
    ]
  },
  {
    q: "1232年に、武家社会のしきたりをもとに御成敗式目を定めた執権はだれですか。",
    options: [
      { label: "北条泰時", furigana: "ほうじょうやすとき", icon: "hojo_regent", correct: true },
      { label: "北条時政", furigana: "ほうじょうときまさ", icon: "hojo_regent" },
      { label: "北条義時", furigana: "ほうじょうよしとき", icon: "hojo_regent" },
      { label: "スーパーマリオ", icon: "joke_hero" }
    ]
  },
  {
    q: "運慶・快慶らによってつくられた、東大寺南大門にある力強い彫刻はどれですか。",
    options: [
      { label: "金剛力士像", furigana: "こんごうりきしぞう", icon: "nio_statue", correct: true },
      { label: "阿弥陀如来像", furigana: "あみだにょらいぞう", icon: "nembutsu_monk" },
      { label: "大仏", furigana: "だいぶつ", icon: "great_gate" },
      { label: "自由の女神像", furigana: "じゆうのめがみぞう", icon: "joke_landmark" }
    ]
  },
  {
    q: "源氏の将軍が3代で絶えた後、幕府の政治を動かした一族はどれですか。",
    options: [
      { label: "北条氏", furigana: "ほうじょうし", icon: "hojo_regent", correct: true },
      { label: "平氏", furigana: "へいし", icon: "genpei_flags" },
      { label: "藤原氏", furigana: "ふじわらし", icon: "court_noble" },
      { label: "ちびまる子一家", icon: "joke_hero" }
    ]
  },
  {
    q: "1185年に源氏が平氏を滅ぼした戦いを何といいますか。",
    options: [
      { label: "壇ノ浦の戦い", furigana: "だんのうらのたたかい", icon: "genpei_flags", correct: true },
      { label: "一ノ谷の戦い", furigana: "いちのたにのたたかい", icon: "genpei_flags" },
      { label: "屋島の戦い", furigana: "やしまのたたかい", icon: "genpei_flags" },
      { label: "雪合戦大会", furigana: "ゆきがっせんたいかい", icon: "joke_sparkle" }
    ]
  },
  {
    q: "1221年、朝廷の勢力を回復しようとした上皇が北条義時を討てと命じて起こした戦いを何といいますか。",
    options: [
      { label: "承久の乱", furigana: "じょうきゅうのらん", icon: "genpei_flags", correct: true },
      { label: "平治の乱", furigana: "へいじのらん", icon: "genpei_flags" },
      { label: "壬申の乱", furigana: "じんしんのらん", icon: "genpei_flags" },
      { label: "枕投げの乱", furigana: "まくらなげのらん", icon: "joke_sparkle" }
    ]
  },
  {
    q: "政権をにぎった武士を武家とよぶのに対して、朝廷の貴族を何とよびますか。",
    options: [
      { label: "公家", furigana: "くげ", icon: "court_noble", correct: true },
      { label: "御家人", furigana: "ごけにん", icon: "samurai" },
      { label: "豪族", furigana: "ごうぞく", icon: "hojo_regent" },
      { label: "王子様", furigana: "おうじさま", icon: "joke_fairytale" }
    ]
  },
  {
    q: "文永の役の後、元の襲来に備えて博多湾沿岸に築かれた石の防壁を何といいますか。",
    options: [
      { label: "石塁", furigana: "せきるい", icon: "stone_wall", correct: true },
      { label: "切通し", furigana: "きりどおし", icon: "kiridoshi" },
      { label: "水城", furigana: "みずき", icon: "stone_wall" },
      { label: "万里の長城", furigana: "ばんりのちょうじょう", icon: "joke_landmark" }
    ]
  },
  {
    q: "鎌倉時代に、営業を独占しようと商工業者がつくった同業者の組合を何といいますか。",
    options: [
      { label: "座", furigana: "ざ", icon: "market", correct: true },
      { label: "惣", furigana: "そう", icon: "farmers_protest" },
      { label: "株仲間", furigana: "かぶなかま", icon: "market" },
      { label: "ポケモンセンター", icon: "joke_landmark" }
    ]
  },
  {
    q: "将軍と主従関係を結んだ家来の武士を何といいますか。",
    options: [
      { label: "御家人", furigana: "ごけにん", icon: "samurai", correct: true },
      { label: "公家", furigana: "くげ", icon: "court_noble" },
      { label: "国司", furigana: "こくし", icon: "court_noble" },
      { label: "忍者ハットリくん", icon: "joke_hero" }
    ]
  },
  {
    q: "源頼朝が、妻北条政子の一族の力をかりて1180年に兵をあげた場所はどこですか。",
    options: [
      { label: "伊豆", furigana: "いず", icon: "genpei_flags", correct: true },
      { label: "平泉", furigana: "ひらいずみ", icon: "golden_island" },
      { label: "京都", furigana: "きょうと", icon: "great_gate" },
      { label: "ハワイ", icon: "joke_landmark" }
    ]
  },
  {
    q: "頼朝の弟で、各地で平氏を破ったものの、のちに兄と対立して平泉で亡くなった人物はだれですか。",
    options: [
      { label: "源義経", furigana: "みなもとのよしつね", icon: "mounted_archer", correct: true },
      { label: "源義仲", furigana: "みなもとのよしなか", icon: "samurai" },
      { label: "源実朝", furigana: "みなもとのさねとも", icon: "shogun" },
      { label: "金太郎", furigana: "きんたろう", icon: "joke_fairytale" }
    ]
  },
  {
    q: "源頼朝の死後、幕府の実権をにぎった妻の政子は何とよばれましたか。",
    options: [
      { label: "尼将軍", furigana: "あましょうぐん", icon: "nun_shogun", correct: true },
      { label: "女王", furigana: "じょおう", icon: "retired_emperor" },
      { label: "執権", furigana: "しっけん", icon: "hojo_regent" },
      { label: "シンデレラ", icon: "joke_fairytale" }
    ]
  },
  {
    q: "元軍が使った、火薬を使った兵器を何といいますか。",
    options: [
      { label: "てつはう", icon: "tetsuhau", correct: true },
      { label: "鉄砲", furigana: "てっぽう", icon: "tetsuhau" },
      { label: "石弓", furigana: "いしゆみ", icon: "stone_wall" },
      { label: "水鉄砲", furigana: "みずでっぽう", icon: "joke_sparkle" }
    ]
  },
  {
    q: "1192年、源頼朝が朝廷から任命された役職は何ですか。",
    options: [
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "shogun", correct: true },
      { label: "関白", furigana: "かんぱく", icon: "court_noble" },
      { label: "摂政", furigana: "せっしょう", icon: "court_noble" },
      { label: "ドラゴンクエストの勇者", icon: "joke_hero" }
    ]
  },
  {
    q: "年貢を保管したり運んだりした運送業者を何といいますか。",
    options: [
      { label: "問（問丸）", furigana: "とい（といまる）", icon: "transport_boat", correct: true },
      { label: "座", furigana: "ざ", icon: "market" },
      { label: "馬借", furigana: "ばしゃく", icon: "ox_plow" },
      { label: "宅配ピザ", furigana: "たくはいぴざ", icon: "joke_sweet" }
    ]
  }
];
