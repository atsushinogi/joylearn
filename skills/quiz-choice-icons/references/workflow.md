# 問題・選択肢からアイコンを作る共通手順

この手順は、抽出→設計→生成→全件照合→対象だけ修正→再照合→書き出し、の順で進める。基本例は50問×4択＝200枚、原画1024px、アプリ用148px。問題数・選択肢数・生成方法は依頼に合わせる。

標準の生成方法は**最初からimagegen**。試作、本生成、不一致画像の再生成・参照編集まで一貫して使う。SDXLはユーザーが今回の依頼で明示指定した場合の補足手順とする。

## 1. 問題と選択肢を固定する

元データと元画像を保存し、問題文と選択肢を読み取る。既存の `QUIZ_DATA`、JSONなどがあれば使う。本文や正解は画像制作の都合で変更しない。

IDは元の問題番号・選択肢位置から付ける。

| ID | 意味 | ファイル |
|---|---|---|
| q01_a | 第1問の元データの1番目 | q01_a.png |
| q01_d | 第1問の元データの4番目 | q01_d.png |
| q50_d | 第50問の元データの4番目 | q50_d.png |

`battle_a` や `noble` のような既存のアイコンキーは、複数の選択肢で異なる意味に使われる場合がある。対応表に残すが、画像の識別子にはしない。

補助スクリプトの場所を、使用する環境に合わせて設定する。以下の `HELPER` は任意のシェル変数である。

```bash
HELPER="/content/drive/MyDrive/codex/skills/quiz-choice-icons/scripts/quiz_icons.py"
python "$HELPER" extract --input quiz-data.js --manifest icons-manifest.jsonl --questions 50 --choices 4
```

入力はJSONの問題配列、または `{ "questions": [...] }`。質問キーは `q` または `question`、選択肢は `options`、選択肢の文字列は `label`。文字列だけの選択肢配列も扱える。

JavaScriptでは `const QUIZ_DATA = [...]` などの**データリテラル**だけを読み取る。コメント・末尾カンマ・引用文字列は扱うが、関数・式・テンプレート文字列などは実行しない。動的データの場合はアプリ側の信頼できる方法でJSONへ書き出す。

抽出で `icons-manifest.jsonl` と `icons-manifest.source.json` ができる。後者に元データのスナップショットとSHA256が入る。問題数・選択肢数・全ID・ラベルとの対応を以後の検査で確認する。

## 2. 選択肢ごとに場面と合格条件を作る

画像が表す対象はその選択肢である。例えば長篠を問う問題でも、「桶狭間の戦い」の選択肢には桶狭間を描く。問題の正解に全選択肢の画像を寄せない。

各行の空欄を埋める。主要フィールドは次のとおり。

| フィールド | 内容 |
|---|---|
| id / filename | 抽出したIDとファイル名。固定 |
| question / option_label | 元の問題文とその選択肢。固定 |
| style / scene | 画風、日本語の場面・構図 |
| prompt | 日本語の設計指示 |
| prompt_en | 実際に生成へ送った最終入力。編集時は実際の編集指示。名称は従来形式に合わせているが、引用する日本語などを含めてよい |
| required_features | 一件ずつ照合する必須特徴。key / description / critical |
| forbidden_features | 取り違え・不要物・避ける表現。必要なものだけ |
| text_policy | 読める文字なし、指定の四文字のみ可、など |
| generation_backend / seed | 実際の方法とシード。未指定ならnull |
| negative_prompt | 専用の負入力、または本文に含めた回避事項。その区別も記録する |
| settings | 実際のモデル、サイズ、ステップ数等。分からない内部モデル名を推測しない |
| generation_history | 参照編集前の入力、参照画像の保管先とSHA256 |

`required_features` の例：

```json
[
  {"key":"both_armies","description":"両軍とも多数の兵が見える","critical":true},
  {"key":"fighting","description":"兵が武器を使って交戦している","critical":true},
  {"key":"palisade","description":"長い木の馬防柵が見える","critical":true},
  {"key":"musketeers","description":"柵の内側で多数の火縄銃兵が発砲している","critical":true},
  {"key":"cavalry","description":"柵の向こう側に騎馬の集団がいる","critical":true}
]
```

人物の本当の容貌など、AI画像から確認できないことを、確認可能な必須条件のように書かない。厳密な史料再現が依頼されている場合は、資料と照合し、保証できない部分を区別する。

写真リアルを基本とし、架空の面白い選択肢には漫画、制度には説明しやすい再現や教育イラストを使える。小さくしても主役を区別できる構図にする。正解の選択肢だけに特別な光・枠・丸印などを付けない。

## 3. imagegenで小規模に試し、本生成する

imagegenは、この環境に用意された画像生成・編集ツールを指す。最初の試作からimagegenを呼び出し、各IDを別の成果物として作る。既存のSDXLコード・モデルや過去の制作記録があっても、先にSDXLで全200枚を生成する工程は設けない。

合戦、人物、小道具、制度、作品など、再現の難しさが違う題材から数枚を選んで試す。特徴が落ちる場合は短い主指示へ整理し、最も重要な対象・動作・構図を先に置く。見分けに不要な持ち物や背景を増やしすぎない。

試作を問題文・選択肢・必須特徴と照合し、148pxでも識別できることを確認したら、残りのIDもimagegenで生成する。見た目の良さだけで本生成へ進めず、人数・道具・動作などの内容も確認する。

### imagegenの生成記録と参照編集

- 一件の選択肢につき一枚を生成する。検品用の一覧と納品用の画像を混同しない。
- 参照編集では、元画像を実際に見てから、変更対象と保つ部分を明示する。
- 元の出力を残して所定サイズへ正規化し、その後にメタデータと確認用ハッシュを確定する。
- 実際にimagegenで生成・編集した行は `generation_backend` を `imagegen` にする。内部モデル名は確認できた場合だけ記録する。
- シードを指定していなければnull。専用negative_prompt引数を使わなかった場合、回避事項を本文に含めたことを記録する。
- 途中再開時はID・実際の生成入力・画像・確認記録を照合し、同じ条件で完成した画像を再利用する。異なる条件の画像を黙って上書きしない。

imagegenが利用できない場合は、その状況と代替案を伝える。自動でSDXLに切り替えず、データ抽出・設計など実行できる作業を進める。ユーザーが今回の依頼で別の方式を明示指定した場合はそれを優先し、実際の方法を記録する。SDXLの場合は末尾の補足を使う。

## 4. 実際の入力をPNGとログへ保存する

送信直前の引数と、返された出力のパス・生成方法を保存する。設計案と実際の入力は別のものとして扱う。PNGメタデータは次のキーを使う。

```python
# jobは実際の呼び出しに使った記録。imageはその呼び出しの出力を正規化した画像。
from PIL import PngImagePlugin
metadata = PngImagePlugin.PngInfo()
metadata.add_text("job_id", job["id"])
metadata.add_text("prompt", job["prompt_en"])
metadata.add_text("negative_prompt", job.get("negative_prompt", ""))
metadata.add_text("generation_backend", job["generation_backend"])
metadata.add_text("seed", "unspecified" if job.get("seed") is None else str(job["seed"]))
image.save(output_path, format="PNG", pnginfo=metadata)
```

これは不足している記録を後付けで捏造するためのコードではない。使われた入力が不明な既存画像には、不明と記録し、必要なら正しい記録を残して作り直す。

参照編集した行には、元の入力も残す。

```json
{
  "generation_history": [{
    "prompt_en": "編集前の実際の生成入力",
    "reference_archive": "/project/review/before-edit/q01_a.png",
    "reference_sha256": "その参照PNGのSHA256"
  }]
}
```

この補助スクリプトでは `reference_archive` を実際に読めるパスとして扱う。保存先を変えた場合は、参照の同一性を確認し、記録と確認結果も整合させる。

## 5. 全画像を一件ずつ照合する

```bash
python "$HELPER" sheets --manifest icons-manifest.jsonl --images candidates --out review
```

途中確認だけの場合は `--partial` を付けられる。`review/review.html` は日本語の問題・選択肢と埋め込みサムネイル、`sheet-001.jpg` などは8枚ずつの一覧。日本語フォントを指定したい場合は `--font` を使う。

生成された `review-template.json` の状態はすべてpending。初回はこれを `audit.json` にコピーして、実際に画像を見て記入する。再実行でテンプレートは作り直されるが、手書きの `audit.json` は書き換えない。修正時は該当IDのハッシュ・記録だけを更新して再確認する。

確認項目：

1. IDの問題文・選択肢と、描かれた主題は一致するか。
2. 設計した人数・物の数・種類・主要な形状はあるか。
3. 必須の小道具は実際に見えるか。別の道具になっていないか。
4. 求めた動作をしているか。戦闘なら静止・整列・行進だけになっていないか。
5. 背景・衣装・武器・国・時代を取り違えていないか。
6. 指定した文字の有無・綴り・並び順は合うか。
7. 全体を見せる指示なら、重要な対象が切れていないか。
8. 148pxでも識別できるか。

サムネイルで分からない場合は原寸を開く。PNGの寸法やファイル数が正しくても、内容の一致を確認したことにはならない。

記録例：

```json
{
  "id": "q01_b",
  "status": "limited",
  "spec_sha256": "テンプレートの指示ハッシュ",
  "reviewed_png_sha256": "実際に目視したPNGのハッシュ",
  "observation": "柵の手前で複数の銃兵が発砲し、向こう側から騎馬の集団が迫っている。",
  "limitations": "当時の兵の配置や各兵の家紋を厳密に復元したものではない。",
  "checked_features": [
    {"key":"both_armies","result":"pass","observation":"左右に対向する多数の兵が見える。"}
  ]
}
```

例は一項目だけを示している。実際はrequired_featuresの全項目を記録する。結果はpass / uncertain / fail。criticalな特徴はpassが必要。alignedでは全項目pass、limitedでuncertainにできるのは非critical項目だけで、限界の説明も必要。既知のfailはlimitedとして通さず、mismatchにする。

## 6. 不一致だけを直して再照合する

不一致が見つかったIDはimagegenで再生成または参照編集する。修正対象が限られる場合は、確認済みの元画像を参照し、変更箇所と維持する部分を具体的に指示する。ユーザーが別方式を明示指定した場合はその指定に従う。

| 観察した不一致 | 修正の例 |
|---|---|
| 合戦が一人の立ち姿 | 両軍の集団と交戦の動作、広い構図を主指示にする |
| 長篠に柵がない | 長い木の馬防柵・内側の銃兵・外側の騎馬を必須特徴にする |
| 人数や小道具が落ちる | 背景や装飾を減らし、主役と必須物へ絞る |
| 日本の烏帽子が別文化の帽子 | 必要な帽子の形・つばの有無を具体化する |
| 三線が三味線やバンジョーになる | 蛇皮を張った胴・細い棹・三弦を確認対象にする |
| 読める文字が不要な文書に出る | 書字部分だけを読めない墨の列へ参照編集する |
| 印の四文字まで消える | その画像の文字例外を明記し、文字・順序を照合する |
| 本や建物の端が切れる | カメラを少し引いて外縁を画面内に収める |
| 木組みが別の装置に見える | 資料で基本形を確認し、構造の違いを具体的に直す |

候補と失敗を保存し、修正時は元画像と編集入力も退避する。修正後は全体を見直して副作用を確認する。画像だけ変えて古いauditを使うことも、入力を書き換えて古い画像の記録を合わせることもしない。

確認の限界と不一致は別物である。人物の容貌・失われた建物・作品の精密な複製を保証できないことと、必要な人物・建物・道具が欠けていることを混同しない。

## 7. 検査して3形式を書き出す

```bash
python "$HELPER" verify --manifest icons-manifest.jsonl --images accepted --audit audit.json
python "$HELPER" export --manifest icons-manifest.jsonl --images accepted --audit audit.json --out icon-assets
```

`accepted` は採用候補の1024 PNGを集めたフォルダ。ファイルをそのまま移してもハッシュは変わらないが、再保存・追記・加工をしたら再確認する。

検査では元データとの対応、件数、PNG寸法、実際の入力・バックエンド・シード、確認した画像と指示のハッシュ、全必須特徴の確認記録、参照画像の保存、画素の意図しない重複を確認する。意図的な画像再利用を依頼された場合は `reuse_of` に元IDを記録し、ファイル数と独立画像数を分けて報告する。

未確認、不一致、criticalな特徴の未確認、確認後の画像・指示の変更があれば書き出しを止める。これは自分で行う品質確認で、ユーザーの追加承認を求める意味ではない。

出力は次のとおり。

```text
icon-assets/
  png-1024/             原画PNG。元のバイト列を保存
  png-148/              Lanczosで縮小したPNG
  webp-148/             quality 85 / method 6
  png-1024.zip
  png-148.zip
  webp-148.zip
  comparison.html       3形式を同じ148px表示で比較
  manifest.jsonl
  manifest.source.json
  audit.json
  validation.json
  backups/              既存の書き出しがあった場合の退避とSHA256
```

既存の同名出力を更新するときは、旧出力を検証付きで退避してから入れ替える。補助コードが扱う標準形式は1024/148。別のサイズの依頼には、プロフィールを適切に調整する。

## 8. 比較・報告する

`comparison.html` を出力フォルダ内で開くと3形式を比較できる。Colabで相対画像パスが使えない場合は、一件ずつ次のように表示する。

```python
from pathlib import Path
import base64, html, json
from IPython.display import HTML, display

root = Path("/content/drive/MyDrive/your-project/icon-assets")
image_id = "q01_a"
rows = {r["id"]: r for r in map(json.loads, (root / "manifest.jsonl").read_text().splitlines())}
row = rows[image_id]
cards = []
for folder, ext, mime in [("png-1024", ".png", "image/png"),
                          ("png-148", ".png", "image/png"),
                          ("webp-148", ".webp", "image/webp")]:
    data = (root / folder / (image_id + ext)).read_bytes()
    encoded = base64.b64encode(data).decode()
    cards.append(f'<div><b>{folder}</b><br><img width="148" height="148" src="data:{mime};base64,{encoded}"></div>')
display(HTML('<h3>' + html.escape(row["option_label"]) + '</h3>'
             + '<div style="display:flex;gap:20px">' + ''.join(cards) + '</div>'
             + '<pre style="white-space:pre-wrap">' + html.escape(row["prompt_en"]) + '</pre>'))
```

報告には、対象数・修正数・出力先・実際の生成方法・元画像の保存先・確認した範囲・既知の未解消不一致を記載する。寸法検査やメタデータ一致だけを根拠に「画像と指示が完全一致」「史実どおり」とは書かない。

## 補足：SDXLを明示指定された場合だけ使う手順

これは、ユーザーが今回の依頼でローカルSDXLの使用を明示指定した場合に使う。通常の試作・本生成・修正はimagegenで行う。

- `StableDiffusionXLPipeline` を正しくimportする。既存の動作確認済みコードがあれば使う。
- モデルのパス、GPU空き容量、dtype、ステップ数、guidance、scheduler、実際のシードを記録する。
- 両方のCLIP tokenizerで入力長と `model_max_length` を確認する。第7回で使ったモデルの上限は77トークンだった。長いimagegen用入力をそのまま渡さない。
- 途中再開時はIDと生成条件を照合し、同条件の完成画像だけをスキップする。別条件の画像を黙って上書きしない。
- 実行していない設定やシードを、後から画像に対応付けない。`generation_backend` は実際の方式である `sdxl` にする。
- 全件の目視照合・不一致の修正・再照合・元画像の保全は、標準手順と同様に実施する。
