/* 社会 第7回 安土・桃山時代 ～一行問題 4択クイズ データ～
 * 元データ: ../一行問題.txt（全45問）を4択形式に変換し、
 * ../文字起こし.md から5問（46〜50）を追加して全50問。
 * 各問題は options を4つ持ち、そのうち1つだけ correct:true。
 * 4つのうち1つは遊び心のある選択肢（icon が joke_ で始まる）。
 * icon は icons.js の ICONS オブジェクトのキーに対応する。
 * furigana は任意（漢字語のみ付与）。
 */
const QUIZ_DATA = [
  {
    q: "1575年、織田信長と徳川家康の連合軍が、鉄砲を効果的に使って武田勝頼の軍を破った戦いはどれですか。",
    options: [
      { label: "桶狭間の戦い", furigana: "おけはざまのたたかい", icon: "battle_b" },
      { label: "長篠の戦い", furigana: "ながしののたたかい", icon: "battle_a", correct: true },
      { label: "山崎の戦い", furigana: "やまざきのたたかい", icon: "battle_c" },
      { label: "雪だるま決戦", icon: "joke_snowman" }
    ]
  },
  {
    q: "1585年に豊臣秀吉がついた役職はどれですか。",
    options: [
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "shogun" },
      { label: "関白", furigana: "かんぱく", icon: "noble", correct: true },
      { label: "執権", furigana: "しっけん", icon: "noble_green" },
      { label: "ゲームの魔王", icon: "joke_demon" }
    ]
  },
  {
    q: "キリスト教の信者は、17世紀初めには約30万人にもなりました。この信者を何といいますか。",
    options: [
      { label: "キリシタン", icon: "cross", correct: true },
      { label: "宣教師", furigana: "せんきょうし", icon: "missionary" },
      { label: "南蛮人", furigana: "なんばんじん", icon: "globe_a" },
      { label: "キラキラ星人", icon: "joke_ufo" }
    ]
  },
  {
    q: "1582年、九州のキリシタン大名によってローマ教皇のもとに派遣された4人の少年の使節を何といいますか。",
    options: [
      { label: "天正遣欧使節", furigana: "てんしょうけんおうしせつ", icon: "envoy", correct: true },
      { label: "遣唐使", furigana: "けんとうし", icon: "old_ship_a" },
      { label: "朝鮮通信使", furigana: "ちょうせんつうしんし", icon: "envoy_scroll" },
      { label: "少年探偵団", icon: "joke_detective" }
    ]
  },
  {
    q: "日明貿易で栄え、戦国時代には大商人たちが自ら町を運営する自治都市となった大阪府の港町はどこですか。",
    options: [
      { label: "堺", furigana: "さかい", icon: "port_a", correct: true },
      { label: "博多", furigana: "はかた", icon: "port_b" },
      { label: "長崎", furigana: "ながさき", icon: "port_c" },
      { label: "たこ焼き王国", icon: "joke_takoyaki" }
    ]
  },
  {
    q: "朝鮮から連れてこられた陶工の技術をもとにつくられ、17世紀半ばにはヨーロッパに大量に輸出された焼き物を何といいますか。",
    options: [
      { label: "有田焼", furigana: "ありたやき", icon: "pottery_a", correct: true },
      { label: "瀬戸焼", furigana: "せとやき", icon: "pottery_b" },
      { label: "信楽焼", furigana: "しがらきやき", icon: "pottery_c" },
      { label: "目玉焼き", icon: "joke_egg" }
    ]
  },
  {
    q: "狩野永徳らが、金や銀を下地にしたあざやかな色彩で描いたふすま絵・びょうぶ絵を何といいますか。",
    options: [
      { label: "障壁画", furigana: "しょうへきが", icon: "screen_a", correct: true },
      { label: "水墨画", furigana: "すいぼくが", icon: "ink_painting" },
      { label: "浮世絵", furigana: "うきよえ", icon: "ukiyoe" },
      { label: "らくがき帳", icon: "joke_doodle" }
    ]
  },
  {
    q: "ポルトガル人やスペイン人を南蛮人とよび、彼らとの貿易を何貿易といいましたか。",
    options: [
      { label: "南蛮貿易", furigana: "なんばんぼうえき", icon: "nanban_ship", correct: true },
      { label: "日明貿易", furigana: "にちみんぼうえき", icon: "old_ship_a" },
      { label: "日宋貿易", furigana: "にっそうぼうえき", icon: "old_ship_b" },
      { label: "ナンバーワン貿易", icon: "joke_trophy" }
    ]
  },
  {
    q: "織田信長が、市場の税を免除し、座の特権を廃止して商工業を自由にできるようにした政策を何といいますか。",
    options: [
      { label: "楽市・楽座", furigana: "らくいち・らくざ", icon: "market", correct: true },
      { label: "太閤検地", furigana: "たいこうけんち", icon: "masu" },
      { label: "刀狩", furigana: "かたながり", icon: "katana" },
      { label: "大安売りセール", icon: "joke_sale" }
    ]
  },
  {
    q: "船の上を鉄板でおおった亀甲船を用いた朝鮮の水軍を率い、日本軍にはげしく抵抗した人物はだれですか。",
    options: [
      { label: "李舜臣", furigana: "りしゅんしん", icon: "admiral", correct: true },
      { label: "明智光秀", furigana: "あけちみつひで", icon: "daimyo_b" },
      { label: "今川義元", furigana: "いまがわよしもと", icon: "daimyo_c" },
      { label: "カメさん船長", icon: "joke_turtle" }
    ]
  },
  {
    q: "太閤検地によって公家や寺社はそれまでの土地の権利を失い、何が完全になくなりましたか。",
    options: [
      { label: "荘園", furigana: "しょうえん", icon: "rice_field", correct: true },
      { label: "関所", furigana: "せきしょ", icon: "checkpoint" },
      { label: "座", furigana: "ざ", icon: "market" },
      { label: "公園の砂場", icon: "joke_sandbox" }
    ]
  },
  {
    q: "刀狩によって、武士と百姓の身分がはっきり区別されたことを何といいますか。",
    options: [
      { label: "兵農分離", furigana: "へいのうぶんり", icon: "farmer", correct: true },
      { label: "下剋上", furigana: "げこくじょう", icon: "gekokujo" },
      { label: "楽市・楽座", furigana: "らくいち・らくざ", icon: "market" },
      { label: "おにぎり分離", icon: "joke_onigiri" }
    ]
  },
  {
    q: "各地の一向一揆を指導した一向宗の総本山で、織田信長に攻められた寺を何といいますか。",
    options: [
      { label: "石山本願寺", furigana: "いしやまほんがんじ", icon: "temple_a", correct: true },
      { label: "延暦寺", furigana: "えんりゃくじ", icon: "temple_b" },
      { label: "東大寺", furigana: "とうだいじ", icon: "temple_c" },
      { label: "石焼きいも本舗", icon: "joke_imo" }
    ]
  },
  {
    q: "武田氏がつくった分国法はどれですか。",
    options: [
      { label: "今川仮名目録", furigana: "いまがわかなもくろく", icon: "ledger_a" },
      { label: "甲州法度之次第", furigana: "こうしゅうはっとのしだい", icon: "ledger_b", correct: true },
      { label: "御成敗式目", furigana: "ごせいばいしきもく", icon: "law_scroll" },
      { label: "ポケモン図鑑", icon: "joke_monster_book" }
    ]
  },
  {
    q: "応仁の乱の後、守護大名に代わって各地を実力で支配した大名を何といいますか。",
    options: [
      { label: "戦国大名", furigana: "せんごくだいみょう", icon: "daimyo_a", correct: true },
      { label: "守護大名", furigana: "しゅごだいみょう", icon: "daimyo_b" },
      { label: "公家", furigana: "くげ", icon: "noble" },
      { label: "おやつ大名", icon: "joke_pudding" }
    ]
  },
  {
    q: "織田信長のころに始まり、豊臣秀吉のときに栄えた、大名や大商人による豪華で雄大な文化を何文化といいますか。",
    options: [
      { label: "桃山文化", furigana: "ももやまぶんか", icon: "peach", correct: true },
      { label: "北山文化", furigana: "きたやまぶんか", icon: "temple_gold" },
      { label: "国風文化", furigana: "こくふうぶんか", icon: "noble_red" },
      { label: "桃太郎文化", icon: "joke_momotaro" }
    ]
  },
  {
    q: "1560年、尾張国の小さな戦国大名であった織田信長が、駿河国の今川義元を破った戦いを何といいますか。",
    options: [
      { label: "桶狭間の戦い", furigana: "おけはざまのたたかい", icon: "battle_b", correct: true },
      { label: "長篠の戦い", furigana: "ながしののたたかい", icon: "battle_a" },
      { label: "関ヶ原の戦い", furigana: "せきがはらのたたかい", icon: "battle_c" },
      { label: "おけ風呂の戦い", icon: "joke_bath" }
    ]
  },
  {
    q: "1549年に鹿児島に来て、初めてキリスト教を日本に伝えた人物はだれですか。",
    options: [
      { label: "フランシスコ＝ザビエル", icon: "missionary", correct: true },
      { label: "ルイス＝フロイス", icon: "missionary_b" },
      { label: "コロンブス", icon: "globe_b" },
      { label: "サンタクロース", icon: "joke_santa" }
    ]
  },
  {
    q: "太閤検地で、田畑の面積や耕している百姓の名・石高などを記録した帳簿を何といいますか。",
    options: [
      { label: "検地帳", furigana: "けんちちょう", icon: "ledger_a", correct: true },
      { label: "分国法", furigana: "ぶんこくほう", icon: "law_scroll" },
      { label: "戸籍", furigana: "こせき", icon: "ledger_c" },
      { label: "連絡帳", icon: "joke_notebook" }
    ]
  },
  {
    q: "1576年、織田信長が琵琶湖の南東岸に建設を始め、天下統一の本拠地とした城を何といいますか。",
    options: [
      { label: "安土城", furigana: "あづちじょう", icon: "castle_a", correct: true },
      { label: "大阪城", furigana: "おおさかじょう", icon: "castle_b" },
      { label: "姫路城", furigana: "ひめじじょう", icon: "castle_white" },
      { label: "砂のお城", icon: "joke_sandcastle" }
    ]
  },
  {
    q: "織田信長が焼き討ちした寺はどれですか。",
    options: [
      { label: "延暦寺", furigana: "えんりゃくじ", icon: "temple_b", correct: true },
      { label: "東大寺", furigana: "とうだいじ", icon: "temple_c" },
      { label: "法隆寺", furigana: "ほうりゅうじ", icon: "temple_a" },
      { label: "回転ずし店", icon: "joke_sushi" }
    ]
  },
  {
    q: "土地の生産力を、そこからとれる米の量で示したものを何といいますか。",
    options: [
      { label: "石高", furigana: "こくだか", icon: "masu", correct: true },
      { label: "年貢", furigana: "ねんぐ", icon: "rice_bag" },
      { label: "検地帳", furigana: "けんちちょう", icon: "ledger_a" },
      { label: "ごはん大盛り", icon: "joke_rice_bowl" }
    ]
  },
  {
    q: "16～17世紀に世界の銀の3分の1を占めたといわれる日本産の銀の多くは、何銀山で産出されましたか。",
    options: [
      { label: "石見銀山", furigana: "いわみぎんざん", icon: "silver_a", correct: true },
      { label: "生野銀山", furigana: "いくのぎんざん", icon: "silver_c" },
      { label: "佐渡金山", furigana: "さどきんざん", icon: "silver_b" },
      { label: "銀河ロケット", icon: "joke_rocket" }
    ]
  },
  {
    q: "下の身分の者が、実力によって上の身分の者を倒す風潮を何といいますか。",
    options: [
      { label: "下剋上", furigana: "げこくじょう", icon: "gekokujo", correct: true },
      { label: "兵農分離", furigana: "へいのうぶんり", icon: "farmer" },
      { label: "院政", furigana: "いんせい", icon: "noble_red" },
      { label: "すべり台", icon: "joke_slide" }
    ]
  },
  {
    q: "信長の死を知った豊臣秀吉は、ただちに何の戦いで明智光秀を破りましたか。",
    options: [
      { label: "山崎の戦い", furigana: "やまざきのたたかい", icon: "battle_c", correct: true },
      { label: "桶狭間の戦い", furigana: "おけはざまのたたかい", icon: "battle_b" },
      { label: "長篠の戦い", furigana: "ながしののたたかい", icon: "battle_a" },
      { label: "山盛りカレーの戦い", icon: "joke_curry" }
    ]
  },
  {
    q: "南蛮貿易で日本からおもに輸出されたものはどれですか。",
    options: [
      { label: "鉄砲", furigana: "てっぽう", icon: "matchlock" },
      { label: "生糸", furigana: "きいと", icon: "silk" },
      { label: "銀", furigana: "ぎん", icon: "silver_a", correct: true },
      { label: "ポテトチップス", icon: "joke_chips" }
    ]
  },
  {
    q: "秀吉に仕えた堺の大商人で、茶道（茶の湯）を大成した人物はだれですか。",
    options: [
      { label: "千利休", furigana: "せんのりきゅう", icon: "tea", correct: true },
      { label: "狩野永徳", furigana: "かのうえいとく", icon: "artist" },
      { label: "出雲の阿国", furigana: "いずものおくに", icon: "kabuki" },
      { label: "抹茶アイス屋さん", icon: "joke_icecream" }
    ]
  },
  {
    q: "戦国大名が自分の国を支配するためにつくった法律を何（家法）といいますか。",
    options: [
      { label: "分国法", furigana: "ぶんこくほう", icon: "law_scroll", correct: true },
      { label: "御成敗式目", furigana: "ごせいばいしきもく", icon: "ledger_b" },
      { label: "武家諸法度", furigana: "ぶけしょはっと", icon: "ledger_c" },
      { label: "おやつのルール", icon: "joke_pudding" }
    ]
  },
  {
    q: "1588年、豊臣秀吉が一揆を防ぐために、百姓から刀や鉄砲などの武器を取りあげた命令を何といいますか。",
    options: [
      { label: "刀狩令", furigana: "かたながりれい", icon: "katana", correct: true },
      { label: "太閤検地", furigana: "たいこうけんち", icon: "masu" },
      { label: "徳政令", furigana: "とくせいれい", icon: "ledger_c" },
      { label: "まつたけ狩り令", icon: "joke_mushroom" }
    ]
  },
  {
    q: "豊臣秀吉が石山本願寺のあと地に築き、全国統一の本拠地とした城を何といいますか。",
    options: [
      { label: "大阪城", furigana: "おおさかじょう", icon: "castle_b", correct: true },
      { label: "安土城", furigana: "あづちじょう", icon: "castle_a" },
      { label: "伏見城", furigana: "ふしみじょう", icon: "castle_c" },
      { label: "お菓子の城", icon: "joke_candy_castle" }
    ]
  },
  {
    q: "1590年、豊臣秀吉は何氏の本拠地である小田原城を攻め落として、全国統一をなしとげましたか。",
    options: [
      { label: "北条氏", furigana: "ほうじょうし", icon: "daimyo_a", correct: true },
      { label: "今川氏", furigana: "いまがわし", icon: "daimyo_b" },
      { label: "武田氏", furigana: "たけだし", icon: "daimyo_c" },
      { label: "北極グマ氏", icon: "joke_polar_bear" }
    ]
  },
  {
    q: "出雲の阿国という女性によって始められ、後に歌舞伎に発展したにぎやかな踊りはどれですか。",
    options: [
      { label: "能", furigana: "のう", icon: "noh" },
      { label: "浄瑠璃", furigana: "じょうるり", icon: "shamisen" },
      { label: "阿国歌舞伎", furigana: "おくにかぶき", icon: "kabuki", correct: true },
      { label: "ラジオ体操", icon: "joke_radio" }
    ]
  },
  {
    q: "応仁の乱からの約100年間を何時代といいますか。",
    options: [
      { label: "戦国時代", furigana: "せんごくじだい", icon: "era_a", correct: true },
      { label: "室町時代", furigana: "むろまちじだい", icon: "era_b" },
      { label: "鎌倉時代", furigana: "かまくらじだい", icon: "era_c" },
      { label: "恐竜時代", icon: "joke_dinosaur" }
    ]
  },
  {
    q: "ザビエルが宣教師として属していたキリスト教の団体はどれですか。",
    options: [
      { label: "イエズス会", furigana: "いえずすかい", icon: "cross", correct: true },
      { label: "一向宗", furigana: "いっこうしゅう", icon: "monk" },
      { label: "臨済宗", furigana: "りんざいしゅう", icon: "monk_b" },
      { label: "忍者学校", icon: "joke_ninja" }
    ]
  },
  {
    q: "豊臣秀吉は、関白になった翌年には何になりましたか。",
    options: [
      { label: "太政大臣", furigana: "だいじょうだいじん", icon: "noble_red", correct: true },
      { label: "征夷大将軍", furigana: "せいいたいしょうぐん", icon: "shogun" },
      { label: "摂政", furigana: "せっしょう", icon: "noble" },
      { label: "ゲーム大臣", icon: "joke_game" }
    ]
  },
  {
    q: "豊臣秀吉の朝鮮侵略のうち、1592年に始まった戦いはどれですか。",
    options: [
      { label: "文永の役", furigana: "ぶんえいのえき", icon: "old_ship_b" },
      { label: "慶長の役", furigana: "けいちょうのえき", icon: "battle_a" },
      { label: "文禄の役", furigana: "ぶんろくのえき", icon: "battle_b", correct: true },
      { label: "枕投げ大戦争", icon: "joke_pillow" }
    ]
  },
  {
    q: "1582年、織田信長が家臣の明智光秀に攻められ、京都で自害した事件を何といいますか。",
    options: [
      { label: "本能寺の変", furigana: "ほんのうじのへん", icon: "fire_temple", correct: true },
      { label: "応仁の乱", furigana: "おうにんのらん", icon: "battle_c" },
      { label: "山崎の戦い", furigana: "やまざきのたたかい", icon: "battle_a" },
      { label: "たぬきの変身", icon: "joke_tanuki" }
    ]
  },
  {
    q: "火縄を使って火薬に点火する鉄砲を持ち、鉄砲隊として活躍した軽装備の歩兵を何といいますか。",
    options: [
      { label: "足軽", furigana: "あしがる", icon: "ashigaru", correct: true },
      { label: "僧兵", furigana: "そうへい", icon: "monk" },
      { label: "御家人", furigana: "ごけにん", icon: "daimyo_c" },
      { label: "リレーの選手", icon: "joke_runner" }
    ]
  },
  {
    q: "豊臣秀吉が役人を派遣して行った、全国的な規模の検地を何といいますか。",
    options: [
      { label: "太閤検地", furigana: "たいこうけんち", icon: "masu", correct: true },
      { label: "刀狩", furigana: "かたながり", icon: "katana" },
      { label: "楽市・楽座", furigana: "らくいち・らくざ", icon: "market" },
      { label: "たいこの達人検定", icon: "joke_drum" }
    ]
  },
  {
    q: "鉄砲を初めて日本に伝えたのは、何という国の人ですか。",
    options: [
      { label: "スペイン", icon: "globe_b" },
      { label: "ポルトガル", icon: "globe_a", correct: true },
      { label: "オランダ", icon: "globe_c" },
      { label: "ドラえもん王国", icon: "joke_robot" }
    ]
  },
  {
    q: "1543年、中国の船が流れ着き、日本に初めて鉄砲が伝えられた島を何といいますか。",
    options: [
      { label: "種子島", furigana: "たねがしま", icon: "island_a", correct: true },
      { label: "屋久島", furigana: "やくしま", icon: "island_b" },
      { label: "対馬", furigana: "つしま", icon: "island_c" },
      { label: "たねなしスイカ島", icon: "joke_watermelon" }
    ]
  },
  {
    q: "1597年、豊臣秀吉が再び朝鮮に出兵して始まった戦いを何といいますか。",
    options: [
      { label: "慶長の役", furigana: "けいちょうのえき", icon: "battle_a", correct: true },
      { label: "文禄の役", furigana: "ぶんろくのえき", icon: "battle_b" },
      { label: "弘安の役", furigana: "こうあんのえき", icon: "old_ship_b" },
      { label: "学芸会の村人Aの役", icon: "joke_stage" }
    ]
  },
  {
    q: "織田信長が用いた、「京都に行って、武力で天下を統一する」という意味の印の文字は何ですか。",
    options: [
      { label: "天下布武", furigana: "てんかふぶ", icon: "seal_a", correct: true },
      { label: "天下太平", furigana: "てんかたいへい", icon: "seal_b" },
      { label: "一所懸命", furigana: "いっしょけんめい", icon: "seal_c" },
      { label: "天ぷらそば", icon: "joke_tempura" }
    ]
  },
  {
    q: "現在の兵庫県にあり、世界文化遺産に登録されている城はどれですか。",
    options: [
      { label: "安土城", furigana: "あづちじょう", icon: "castle_a" },
      { label: "小田原城", furigana: "おだわらじょう", icon: "castle_c" },
      { label: "姫路城", furigana: "ひめじじょう", icon: "castle_white", correct: true },
      { label: "お菓子の城", icon: "joke_candy_castle" }
    ]
  },
  {
    q: "1573年、織田信長は将軍のだれを京都から追放して、室町幕府を滅ぼしましたか。",
    options: [
      { label: "足利義昭", furigana: "あしかがよしあき", icon: "shogun", correct: true },
      { label: "足利尊氏", furigana: "あしかがたかうじ", icon: "shogun_b" },
      { label: "足利義満", furigana: "あしかがよしみつ", icon: "shogun_c" },
      { label: "アシカのよっちゃん", icon: "joke_sealion" }
    ]
  },
  {
    q: "武田信玄が、甲府盆地を水害から守るために、釜無川沿いに築いた堤防を何といいますか。",
    options: [
      { label: "信玄堤", furigana: "しんげんづつみ", icon: "levee", correct: true },
      { label: "防塁", furigana: "ぼうるい", icon: "stone_wall" },
      { label: "関所", furigana: "せきしょ", icon: "checkpoint" },
      { label: "ビーバーのダム", icon: "joke_beaver" }
    ]
  },
  {
    q: "1587年、豊臣秀吉が禁止したことはどれですか。",
    options: [
      { label: "キリスト教の布教", furigana: "ふきょう", icon: "cross", correct: true },
      { label: "南蛮貿易", furigana: "なんばんぼうえき", icon: "nanban_ship" },
      { label: "茶の湯", furigana: "ちゃのゆ", icon: "tea" },
      { label: "夜ふかしゲーム", icon: "joke_game" }
    ]
  },
  {
    q: "狩野永徳が描いた、金地に獅子をえがいたびょうぶ絵を何といいますか。",
    options: [
      { label: "唐獅子図屏風", furigana: "からじしずびょうぶ", icon: "screen_a", correct: true },
      { label: "風神雷神図屏風", furigana: "ふうじんらいじんずびょうぶ", icon: "screen_b" },
      { label: "鳥獣戯画", furigana: "ちょうじゅうぎが", icon: "ink_painting" },
      { label: "ねこじゃらし図", icon: "joke_cat" }
    ]
  },
  {
    q: "琉球から伝えられ、改良されて三味線のもとになった楽器を何といいますか。",
    options: [
      { label: "三線", furigana: "さんしん", icon: "sanshin", correct: true },
      { label: "琵琶", furigana: "びわ", icon: "biwa" },
      { label: "尺八", furigana: "しゃくはち", icon: "shakuhachi" },
      { label: "エレキギター", icon: "joke_guitar" }
    ]
  },
  {
    q: "織田信長が京都や安土に建てることを許した、キリスト教の教会を何とよびましたか。",
    options: [
      { label: "南蛮寺", furigana: "なんばんじ", icon: "church", correct: true },
      { label: "本願寺", furigana: "ほんがんじ", icon: "temple_a" },
      { label: "金閣", furigana: "きんかく", icon: "temple_gold" },
      { label: "チキン南蛮食堂", icon: "joke_chicken" }
    ]
  }
];
