# 鎌倉武士クイズ　アイコン生成プロンプト

- サイズ: **256×256 px**（正方形・PNG）
- 使い方: 各アイコンのプロンプトの後ろに「共通スタイル」を必ずつなげて生成する。ネガティブプロンプトが使えるツールでは「ネガティブ」も入れる。
- 現在の icons.js（平安時代用のSVG）と雰囲気をそろえるため、太い焦げ茶の線・くすんだ和風の色・淡いクリーム色の背景にしている。

## 共通スタイル（全アイコンの末尾に付ける）

```
flat vector illustration icon, 256x256 pixels, square format, single subject centered and filling about 70% of the frame, thick dark brown outlines (#2E2620), muted traditional Japanese color palette (indigo #3C5A73, deep purple #4B3868, gold #D9B25C, vermilion #B5482F, moss green #6B7F4A), soft vertical gradient background from pale cream (#F3E6C4) to off-white (#F6EFDD), simple flat ground band at the bottom, cute friendly style for elementary school students, clean shapes, no shading noise, consistent icon set
```

## ネガティブ（使えるツールのみ）

```
text, letters, kanji, numbers, watermark, signature, photorealistic, 3D render, blood, gore, scary face, cluttered background, multiple subjects, cropped subject, border frame
```

---

## 人物

| キー | 使う場面 | プロンプト |
|---|---|---|
| `samurai` | 御家人・地頭・守護・武士全般 | `a Kamakura-period samurai in red-laced oyoroi armor and kabuto helmet, standing proudly with a bow, friendly face` |
| `shogun` | 征夷大将軍・鎌倉幕府・御恩 | `a Kamakura shogun sitting formally on a tatami platform, wearing black eboshi hat and dark indigo hitatare robe, holding a fan, calm dignified expression` |
| `hojo_regent` | 執権・北条氏・北条時宗/泰時/義時 | `a Kamakura regent official in formal robes and eboshi hat sitting beside a small folding screen, holding a scroll, wise serious face` |
| `nun_shogun` | 尼将軍（北条政子） | `a Buddhist nun in a white head cloth and plain purple robe, standing and giving a powerful speech with one hand raised, determined but kind face` |
| `mounted_archer` | 奉公・いざ鎌倉・流鏑馬 | `a samurai riding a galloping brown horse while drawing a bow, yabusame style, dynamic but cute` |
| `retired_emperor` | 後鳥羽上皇などの上皇 | `a retired Japanese emperor in elegant white and purple court robes and a tall black court hat, seated on a raised mat behind bamboo blinds` |
| `court_noble` | 公家・関白・摂政 | `a Heian-style court noble in layered pale purple robes and tall black court hat, holding a flat wooden shaku scepter, gentle smile` |
| `judge` | 問注所・裁判 | `a Kamakura judge official sitting at a low desk reading a long paper scroll, two small figures kneeling in front of him presenting their case` |
| `kublai` | フビライ＝ハン・元の皇帝 | `a Mongol emperor with a mustache and small beard, wearing a white robe and a round fur-trimmed hat, seated on a throne, stern expression` |
| `biwa_hoshi` | 平家物語・琵琶法師 | `a blind Japanese storyteller monk with a shaved head sitting and playing a biwa lute, eyes closed, peaceful` |
| `zen_monk` | 臨済宗・曹洞宗・禅宗 | `a Zen monk in a black robe sitting in zazen meditation on a round cushion, eyes closed, calm` |
| `nembutsu_monk` | 浄土宗・浄土真宗・時宗 | `a Buddhist monk in a gray robe holding prayer beads with hands together, a soft glowing lotus flower floating behind him` |
| `nichiren_monk` | 日蓮宗 | `a Buddhist monk standing on a street corner beating a round hand drum and chanting, energetic expression` |

## 戦い・元寇

| キー | 使う場面 | プロンプト |
|---|---|---|
| `genpei_flags` | 壇ノ浦・一ノ谷・屋島・承久の乱など合戦 | `two crossed battle banners, one white and one red, planted on a seaside hill with small waves below` |
| `mongol_ship` | 文永の役・弘安の役 | `a large Mongol war ship with square sails tossed on stormy sea waves, dark clouds in the sky` |
| `tetsuhau` | てつはう | `a round clay bomb with a lit fuse giving off small sparks, sitting on the ground, simple and not scary` |
| `stone_wall` | 石塁 | `a long low stone defensive wall along a sandy beach with pine trees behind it` |
| `kiridoshi` | 切通し | `a narrow mountain path cut between two tall mossy rock walls, only wide enough for one horse` |
| `kamakura_road` | 鎌倉街道 | `a dirt road winding through green fields toward distant mountains, with a small wooden signpost (blank)` |

## 政治・くらし・経済

| キー | 使う場面 | プロンプト |
|---|---|---|
| `law_scroll` | 御成敗式目・法律・徳政令 | `an unrolled old Japanese paper scroll with abstract brush lines (no readable text) and a red seal stamp, on a wooden stand` |
| `land_deed` | 御恩・領地・封建制度 | `a small map of rice fields and a farmhouse on a paper sheet with a red seal, held by two hands` |
| `market` | 定期市・座 | `a small medieval Japanese open-air market stall with a wooden plank roof, selling cloth, rice bags and pottery` |
| `song_coins` | 宋銭・年貢・お金 | `a stack of round copper coins with square holes in the middle, strung on a cord` |
| `transport_boat` | 問（問丸）・運送業者 | `a small wooden cargo boat loaded with straw rice bales on a calm river` |
| `ox_plow` | 牛馬の耕作・二毛作 | `an ox pulling a wooden plow through a muddy rice field, a farmer walking behind` |
| `ash_fertilizer` | 草や木の灰（肥料） | `a wooden bucket full of gray ash next to a small pile of burned grass and twigs, with green sprouts growing nearby` |
| `two_crops` | 二毛作・二期作 | `a field split in two halves, left half golden rice stalks, right half green wheat, with a small sun and arrow circle between them` |
| `farmers_protest` | 農民の訴え・地頭の乱暴 | `a group of three farmers in straw hats kneeling and holding up a paper petition, determined faces` |

## 文化・寺社

| キー | 使う場面 | プロンプト |
|---|---|---|
| `nio_statue` | 金剛力士像・運慶・快慶 | `a muscular wooden Nio guardian statue in a fierce pose with one fist raised, carved wood texture, cute chibi proportions` |
| `great_gate` | 東大寺南大門 | `a huge two-story wooden Buddhist temple gate with wide curved roofs, front view` |
| `zen_hall` | 円覚寺舎利殿・禅寺 | `a small Zen temple hall with a steeply curved thatched-style roof surrounded by tall green cedar trees` |
| `poem_book` | 新古今和歌集・方丈記・徒然草 | `an old Japanese bound book lying open next to a writing brush and ink stone` |
| `golden_island` | ジパング | `a small island with a shining golden palace on it, floating in a blue sea, sparkles around` |

## ネタ選択肢用（おふざけ）

| キー | 使う場面 | プロンプト |
|---|---|---|
| `joke_hero` | マリオ・ドラえもん・勇者など | `a generic cartoon superhero kid with a red cape striking a heroic pose, funny face, original character` |
| `joke_sweet` | ラーメン宗・お年玉・わたあめなど | `a giant bowl of ramen and a pink cotton candy side by side with happy cartoon faces` |
| `joke_landmark` | 自由の女神像・交番・ハワイなど | `a funny tropical island with a palm tree and a tiny amusement park ferris wheel` |
| `joke_fairytale` | 桃太郎・シンデレラ・金太郎など | `a giant peach split open with a sparkling fairy tale glow, storybook style` |
| `joke_dragon` | ゴジラ・怪獣・宇宙人 | `a cute chubby green kaiju monster and a tiny UFO above it, both smiling` |
| `joke_sparkle` | 雪合戦大会・枕投げなど | `a pillow and a snowball flying through the air with stars and sparkles, playful` |

---

※ 実在のキャラクター名（マリオ、ドラえもん、ポケモンなど）はプロンプトに入れない。生成AIによっては拒否されたり、権利的に問題のある画像になったりするため、オリジナルの「それっぽい」絵にしている。
