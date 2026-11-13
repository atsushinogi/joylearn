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
      { label: "草や木の灰", furigana: "くさやきのはい", icon: "q01_a", correct: true },
      { label: "干鰯", furigana: "ほしか", icon: "q01_b" },
      { label: "化学肥料", furigana: "かがくひりょう", icon: "q01_c" },
      { label: "わたあめ", icon: "q01_d" }
    ]
  },
  {
    q: "武士が命懸けで守る領地を「何の地」といいましたか。「一生懸命」ということばはここから生まれました。",
    options: [
      { label: "一所懸命", furigana: "いっしょけんめい", icon: "q02_a", correct: true },
      { label: "一騎当千", furigana: "いっきとうせん", icon: "q02_b" },
      { label: "一族郎党", furigana: "いちぞくろうとう", icon: "q02_c" },
      { label: "一発逆転", furigana: "いっぱつぎゃくてん", icon: "q02_d" }
    ]
  },
  {
    q: "「南無阿弥陀仏」ととなえれば極楽に生まれることができると説いた、法然の宗派はどれですか。",
    options: [
      { label: "浄土宗", furigana: "じょうどしゅう", icon: "q03_a", correct: true },
      { label: "日蓮宗", furigana: "にちれんしゅう", icon: "q03_b" },
      { label: "曹洞宗", furigana: "そうとうしゅう", icon: "q03_c" },
      { label: "カレー宗", icon: "q03_d" }
    ]
  },
  {
    q: "阿弥陀仏を信じさえすれば往生できるとし、悪人にこそ救われる道があると説いた親鸞の宗派はどれですか。",
    options: [
      { label: "浄土真宗", furigana: "じょうどしんしゅう", icon: "q04_a", correct: true },
      { label: "時宗", furigana: "じしゅう", icon: "q04_b" },
      { label: "日蓮宗", furigana: "にちれんしゅう", icon: "q04_c" },
      { label: "ラーメン宗", icon: "q04_d" }
    ]
  },
  {
    q: "北条氏が執権として幕府の政治を動かした政治を何といいますか。",
    options: [
      { label: "執権政治", furigana: "しっけんせいじ", icon: "q05_a", correct: true },
      { label: "摂関政治", furigana: "せっかんせいじ", icon: "q05_b" },
      { label: "院政", furigana: "いんせい", icon: "q05_c" },
      { label: "おやつ政治", icon: "q05_d" }
    ]
  },
  {
    q: "御家人が「いざ鎌倉」とかけつけ、命がけで将軍のために戦うことを何といいますか。",
    options: [
      { label: "奉公", furigana: "ほうこう", icon: "q06_a", correct: true },
      { label: "御恩", furigana: "ごおん", icon: "q06_b" },
      { label: "寄進", furigana: "きしん", icon: "q06_c" },
      { label: "かくれんぼ", icon: "q06_d" }
    ]
  },
  {
    q: "道元が開いた、座禅によって悟りを得ることを重んじた禅宗はどれですか。",
    options: [
      { label: "曹洞宗", furigana: "そうとうしゅう", icon: "q07_a", correct: true },
      { label: "臨済宗", furigana: "りんざいしゅう", icon: "q07_b" },
      { label: "浄土宗", furigana: "じょうどしゅう", icon: "q07_c" },
      { label: "お昼寝宗", icon: "q07_d" }
    ]
  },
  {
    q: "承久の乱の後、朝廷の監視や西国の御家人の取りしまりのために京都に置かれた機関はどれですか。",
    options: [
      { label: "六波羅探題", furigana: "ろくはらたんだい", icon: "q08_a", correct: true },
      { label: "問注所", furigana: "もんちゅうじょ", icon: "q08_b" },
      { label: "大宰府", furigana: "だざいふ", icon: "q08_c" },
      { label: "ひみつ基地", icon: "q08_d" }
    ]
  },
  {
    q: "御家人が鎌倉と自分の領地を行き来するために整備され、後に何とよばれるようになった道はどれですか。",
    options: [
      { label: "鎌倉街道", furigana: "かまくらかいどう", icon: "q09_a", correct: true },
      { label: "東海道", furigana: "とうかいどう", icon: "q09_b" },
      { label: "シルクロード", icon: "q09_c" },
      { label: "虹の橋", icon: "q09_d" }
    ]
  },
  {
    q: "鎌倉幕府のしくみのうち、裁判を担当した機関はどれですか。",
    options: [
      { label: "問注所", furigana: "もんちゅうじょ", icon: "q10_a", correct: true },
      { label: "政所", furigana: "まんどころ", icon: "q10_b" },
      { label: "侍所", furigana: "さむらいどころ", icon: "q10_c" },
      { label: "交番", icon: "q10_d" }
    ]
  },
  {
    q: "荘園などに置かれ、土地の管理や年貢の取り立てを行った役職はどれですか。",
    options: [
      { label: "地頭", furigana: "じとう", icon: "q11_a", correct: true },
      { label: "守護", furigana: "しゅご", icon: "q11_b" },
      { label: "国司", furigana: "こくし", icon: "q11_c" },
      { label: "サンタクロース", icon: "q11_d" }
    ]
  },
  {
    q: "1274年、高麗の兵を従えた約3万の元軍が博多湾沿岸に攻めてきた戦いを何といいますか。",
    options: [
      { label: "文永の役", furigana: "ぶんえいのえき", icon: "q12_a", correct: true },
      { label: "弘安の役", furigana: "こうあんのえき", icon: "q12_b" },
      { label: "承久の乱", furigana: "じょうきゅうのらん", icon: "q12_c" },
      { label: "怪獣大決戦", icon: "q12_d" }
    ]
  },
  {
    q: "領地（土地）をなかだちとした主人と家来の関係を何といいますか。",
    options: [
      { label: "封建制度", furigana: "ほうけんせいど", icon: "q13_a", correct: true },
      { label: "氏姓制度", furigana: "しせいせいど", icon: "q13_b" },
      { label: "律令制度", furigana: "りつりょうせいど", icon: "q13_c" },
      { label: "ポイントカード制度", icon: "q13_d" }
    ]
  },
  {
    q: "琵琶法師によって語り伝えられ、文字を読めない多くの人に喜ばれた軍記物はどれですか。",
    options: [
      { label: "平家物語", furigana: "へいけものがたり", icon: "q14_a", correct: true },
      { label: "方丈記", furigana: "ほうじょうき", icon: "q14_b" },
      { label: "徒然草", furigana: "つれづれぐさ", icon: "q14_c" },
      { label: "桃太郎", furigana: "ももたろう", icon: "q14_d" }
    ]
  },
  {
    q: "西日本で広まった、稲をかりとった後に麦を裏作としてつくる農業を何といいますか。",
    options: [
      { label: "二毛作", furigana: "にもうさく", icon: "q15_a", correct: true },
      { label: "二期作", furigana: "にきさく", icon: "q15_b" },
      { label: "焼畑", furigana: "やきはた", icon: "q15_c" },
      { label: "宇宙農業", icon: "q15_d" }
    ]
  },
  {
    q: "将軍が御家人の領地を認めて保護したり、手柄に応じて新しい領地をあたえたりすることを何といいますか。",
    options: [
      { label: "御恩", furigana: "ごおん", icon: "q16_a", correct: true },
      { label: "奉公", furigana: "ほうこう", icon: "q16_b" },
      { label: "年貢", furigana: "ねんぐ", icon: "q16_c" },
      { label: "お年玉", furigana: "おとしだま", icon: "q16_d" }
    ]
  },
  {
    q: "元に従うよう、日本にたびたび使いを送ってきた元の皇帝はだれですか。",
    options: [
      { label: "フビライ＝ハン", icon: "q17_a", correct: true },
      { label: "チンギス＝ハン", icon: "q17_b" },
      { label: "マルコ＝ポーロ", icon: "q17_c" },
      { label: "ウルトラマン", icon: "q17_d" }
    ]
  },
  {
    q: "栄西が宋から伝え、鎌倉幕府の保護を受けた禅宗はどれですか。",
    options: [
      { label: "臨済宗", furigana: "りんざいしゅう", icon: "q18_a", correct: true },
      { label: "曹洞宗", furigana: "そうとうしゅう", icon: "q18_b" },
      { label: "時宗", furigana: "じしゅう", icon: "q18_c" },
      { label: "抹茶パフェ宗", icon: "q18_d" }
    ]
  },
  {
    q: "鎌倉幕府のしくみのうち、御家人の取りしまりや軍事を担当した機関はどれですか。",
    options: [
      { label: "侍所", furigana: "さむらいどころ", icon: "q19_a", correct: true },
      { label: "政所", furigana: "まんどころ", icon: "q19_b" },
      { label: "問注所", furigana: "もんちゅうじょ", icon: "q19_c" },
      { label: "忍者屋敷", furigana: "にんじゃやしき", icon: "q19_d" }
    ]
  },
  {
    q: "1232年に定められた、武士による最初の法律（武家法）はどれですか。",
    options: [
      { label: "御成敗式目", furigana: "ごせいばいしきもく", icon: "q20_a", correct: true },
      { label: "十七条の憲法", furigana: "じゅうしちじょうのけんぽう", icon: "q20_b" },
      { label: "大宝律令", furigana: "たいほうりつりょう", icon: "q20_c" },
      { label: "おやつは300円まで法", icon: "q20_d" }
    ]
  },
  {
    q: "北条氏が代々ついた、将軍をたすける役職はどれですか。",
    options: [
      { label: "執権", furigana: "しっけん", icon: "q21_a", correct: true },
      { label: "関白", furigana: "かんぱく", icon: "q21_b" },
      { label: "摂政", furigana: "せっしょう", icon: "q21_c" },
      { label: "学級委員", furigana: "がっきゅういいん", icon: "q21_d" }
    ]
  },
  {
    q: "1281年、約14万の元の大軍が再び九州北部に攻めてきた戦いを何といいますか。",
    options: [
      { label: "弘安の役", furigana: "こうあんのえき", icon: "q22_a", correct: true },
      { label: "文永の役", furigana: "ぶんえいのえき", icon: "q22_b" },
      { label: "白村江の戦い", furigana: "はくすきのえのたたかい", icon: "q22_c" },
      { label: "宇宙人の大侵略", furigana: "うちゅうじんのだいしんりゃく", icon: "q22_d" }
    ]
  },
  {
    q: "国ごとに置かれ、国内の御家人の統率や軍事・警察にあたった役職はどれですか。",
    options: [
      { label: "守護", furigana: "しゅご", icon: "q23_a", correct: true },
      { label: "地頭", furigana: "じとう", icon: "q23_b" },
      { label: "郡司", furigana: "ぐんじ", icon: "q23_c" },
      { label: "勇者", furigana: "ゆうしゃ", icon: "q23_d" }
    ]
  },
  {
    q: "1221年に、全国の武士に北条義時を討てと命令した上皇はだれですか。",
    options: [
      { label: "後鳥羽上皇", furigana: "ごとばじょうこう", icon: "q24_a", correct: true },
      { label: "白河上皇", furigana: "しらかわじょうこう", icon: "q24_b" },
      { label: "後白河上皇", furigana: "ごしらかわじょうこう", icon: "q24_c" },
      { label: "巨大ロボット", furigana: "きょだいろぼっと", icon: "q24_d" }
    ]
  },
  {
    q: "マルコ＝ポーロが『世界の記述（東方見聞録）』で、ヨーロッパに紹介した日本の呼び名はどれですか。",
    options: [
      { label: "ジパング", icon: "q25_a", correct: true },
      { label: "倭", furigana: "わ", icon: "q25_b" },
      { label: "大和", furigana: "やまと", icon: "q25_c" },
      { label: "ネバーランド", icon: "q25_d" }
    ]
  },
  {
    q: "借金の取り消しを命じる法令で、1297年に出されたものが最初だったものを何といいますか。",
    options: [
      { label: "徳政令", furigana: "とくせいれい", icon: "q26_a", correct: true },
      { label: "御成敗式目", furigana: "ごせいばいしきもく", icon: "q26_b" },
      { label: "墾田永年私財法", furigana: "こんでんえいねんしざいのほう", icon: "q26_c" },
      { label: "宿題ゼロ令", furigana: "しゅくだいぜろれい", icon: "q26_d" }
    ]
  },
  {
    q: "鎌倉のまわりに、山をけずってつくられた7つの道を何といいますか。",
    options: [
      { label: "切通し", furigana: "きりどおし", icon: "q27_a", correct: true },
      { label: "関所", furigana: "せきしょ", icon: "q27_b" },
      { label: "石塁", furigana: "せきるい", icon: "q27_c" },
      { label: "ウォータースライダー", icon: "q27_d" }
    ]
  },
  {
    q: "元の求めに応じず、元軍の襲来のときに執権をつとめていた人物はだれですか。",
    options: [
      { label: "北条時宗", furigana: "ほうじょうときむね", icon: "q28_a", correct: true },
      { label: "北条泰時", furigana: "ほうじょうやすとき", icon: "q28_b" },
      { label: "北条義時", furigana: "ほうじょうよしとき", icon: "q28_c" },
      { label: "ドラえもん", icon: "q28_d" }
    ]
  },
  {
    q: "交通の便のよいところなどで、月3回定期的にたつようになった市を何といいますか。",
    options: [
      { label: "定期市", furigana: "ていきいち", icon: "q29_a", correct: true },
      { label: "楽市", furigana: "らくいち", icon: "q29_b" },
      { label: "朝市", furigana: "あさいち", icon: "q29_c" },
      { label: "フリーマーケット・オン・ザ・ムーン", icon: "q29_d" }
    ]
  },
  {
    q: "12世紀末に鎌倉にたてられた武士の政府を何といいますか。",
    options: [
      { label: "鎌倉幕府", furigana: "かまくらばくふ", icon: "q30_a", correct: true },
      { label: "室町幕府", furigana: "むろまちばくふ", icon: "q30_b" },
      { label: "江戸幕府", furigana: "えどばくふ", icon: "q30_c" },
      { label: "お菓子の家", furigana: "おかしのいえ", icon: "q30_d" }
    ]
  },
  {
    q: "1232年に、武家社会のしきたりをもとに御成敗式目を定めた執権はだれですか。",
    options: [
      { label: "北条泰時", furigana: "ほうじょうやすとき", icon: "q31_a", correct: true },
      { label: "北条時政", furigana: "ほうじょうときまさ", icon: "q31_b" },
      { label: "北条義時", furigana: "ほうじょうよしとき", icon: "q31_c" },
      { label: "消防士", furigana: "しょうぼうし", icon: "q31_d" }
    ]
  },
  {
    q: "運慶・快慶らによってつくられた、東大寺南大門にある力強い彫刻はどれですか。",
    options: [
      { label: "金剛力士像", furigana: "こんごうりきしぞう", icon: "q32_a", correct: true },
      { label: "阿弥陀如来像", furigana: "あみだにょらいぞう", icon: "q32_b" },
      { label: "大仏", furigana: "だいぶつ", icon: "q32_c" },
      { label: "自由の女神像", furigana: "じゆうのめがみぞう", icon: "q32_d" }
    ]
  },
  {
    q: "源氏の将軍が3代で絶えた後、幕府の政治を動かした一族はどれですか。",
    options: [
      { label: "北条氏", furigana: "ほうじょうし", icon: "q33_a", correct: true },
      { label: "平氏", furigana: "へいし", icon: "q33_b" },
      { label: "藤原氏", furigana: "ふじわらし", icon: "q33_c" },
      { label: "ちびまる子一家", icon: "q33_d" }
    ]
  },
  {
    q: "1185年に源氏が平氏を滅ぼした戦いを何といいますか。",
    options: [
      { label: "壇ノ浦の戦い", furigana: "だんのうらのたたかい", icon: "q34_a", correct: true },
      { label: "一ノ谷の戦い", furigana: "いちのたにのたたかい", icon: "q34_b" },
      { label: "屋島の戦い", furigana: "やしまのたたかい", icon: "q34_c" },
      { label: "雪合戦大会", furigana: "ゆきがっせんたいかい", icon: "q34_d" }
    ]
  },
  {
    q: "1221年、朝廷の勢力を回復しようとした上皇が北条義時を討てと命じて起こした戦いを何といいますか。",
    options: [
      { label: "承久の乱", furigana: "じょうきゅうのらん", icon: "q35_a", correct: true },
      { label: "平治の乱", furigana: "へいじのらん", icon: "q35_b" },
      { label: "壬申の乱", furigana: "じんしんのらん", icon: "q35_c" },
      { label: "枕投げの乱", furigana: "まくらなげのらん", icon: "q35_d" }
    ]
  },
  {
    q: "政権をにぎった武士を武家とよぶのに対して、朝廷の貴族を何とよびますか。",
    options: [
      { label: "公家", furigana: "くげ", icon: "q36_a", correct: true },
      { label: "御家人", furigana: "ごけにん", icon: "q36_b" },
      { label: "豪族", furigana: "ごうぞく", icon: "q36_c" },
      { label: "王子様", furigana: "おうじさま", icon: "q36_d" }
    ]
  },
  {
    q: "文永の役の後、元の襲来に備えて博多湾沿岸に築かれた石の防壁を何といいますか。",
    options: [
      { label: "石塁", furigana: "せきるい", icon: "q37_a", correct: true },
      { label: "切通し", furigana: "きりどおし", icon: "q37_b" },
      { label: "水城", furigana: "みずき", icon: "q37_c" },
      { label: "万里の長城", furigana: "ばんりのちょうじょう", icon: "q37_d" }
    ]
  },
  {
    q: "鎌倉時代に、営業を独占しようと商工業者がつくった同業者の組合を何といいますか。",
    options: [
      { label: "座", furigana: "ざ", icon: "q38_a", correct: true },
      { label: "惣", furigana: "そう", icon: "q38_b" },
      { label: "株仲間", furigana: "かぶなかま", icon: "q38_c" },
      { label: "ポケモンセンター", icon: "q38_d" }
    ]
  },
  {
    q: "将軍と主従関係を結んだ家来の武士を何といいますか。",
    options: [
      { label: "御家人", furigana: "ごけにん", icon: "q39_a", correct: true },
      { label: "公家", furigana: "くげ", icon: "q39_b" },
      { label: "国司", furigana: "こくし", icon: "q39_c" },
      { label: "忍者ハットリくん", icon: "q39_d" }
    ]
  },
  {
    q: "源頼朝が、妻北条政子の一族の力をかりて1180年に兵をあげた場所はどこですか。",
    options: [
      { label: "伊豆", furigana: "いず", icon: "q40_a", correct: true },
      { label: "平泉", furigana: "ひらいずみ", icon: "q40_b" },
      { label: "京都", furigana: "きょうと", icon: "q40_c" },
      { label: "ハワイ", icon: "q40_d" }
    ]
  },
  {
    q: "頼朝の弟で、各地で平氏を破ったものの、のちに兄と対立して平泉で亡くなった人物はだれですか。",
    options: [
      { label: "源義経", furigana: "みなもとのよしつね", icon: "q41_a", correct: true },
      { label: "源義仲", furigana: "みなもとのよしなか", icon: "q41_b" },
      { label: "源実朝", furigana: "みなもとのさねとも", icon: "q41_c" },
      { label: "金太郎", furigana: "きんたろう", icon: "q41_d" }
    ]
  },
  {
    q: "源頼朝の死後、幕府の実権をにぎった妻の政子は何とよばれましたか。",
    options: [
      { label: "尼将軍", furigana: "あましょうぐん", icon: "q42_a", correct: true },
      { label: "女王", furigana: "じょおう", icon: "q42_b" },
      { label: "執権", furigana: "しっけん", icon: "q42_c" },
      { label: "パン職人", furigana: "ぱんしょくにん", icon: "q42_d" }
    ]
  },
  {
    q: "元軍が使った、火薬を使った兵器を何といいますか。",
    options: [
      { label: "てつはう", icon: "q43_a", correct: true },
      { label: "鉄砲", furigana: "てっぽう", icon: "q43_b" },
      { label: "石弓", furigana: "いしゆみ", icon: "q43_c" },
      { label: "水鉄砲", furigana: "みずでっぽう", icon: "q43_d" }
    ]
  },
  {
    q: "1192年、源頼朝が朝廷から任命された役職は何ですか。",
    options: [
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "q44_a", correct: true },
      { label: "関白", furigana: "かんぱく", icon: "q44_b" },
      { label: "摂政", furigana: "せっしょう", icon: "q44_c" },
      { label: "ドラゴンクエストの勇者", icon: "q44_d" }
    ]
  },
  {
    q: "年貢を保管したり運んだりした運送業者を何といいますか。",
    options: [
      { label: "問（問丸）", furigana: "とい（といまる）", icon: "q45_a", correct: true },
      { label: "座", furigana: "ざ", icon: "q45_b" },
      { label: "馬借", furigana: "ばしゃく", icon: "q45_c" },
      { label: "宅配ピザ", furigana: "たくはいぴざ", icon: "q45_d" }
    ]
  }
];
