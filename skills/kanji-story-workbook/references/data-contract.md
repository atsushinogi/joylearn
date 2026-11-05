# 台帳と検査コマンドの仕様

## ファイルとID

作業用の `workbook.json` 一つに下記のデータを保持する。IDは重複しない文字列、問題IDは安全なファイル名になる `q001` のような英小文字・数字・ハイフンとする。画像の相対パスはこのJSONが置かれた作業フォルダーの内側を指す。ツール既定の保存先にしかない画像は先にコピーする。

`extract` の出力は読みの**候補**であり、この確定台帳とは別物。`explicit_pair` でも原教材との確認を行う。`word` や `unresolved` を確定済みの字音としてコピーしない。

## トップレベル

- `schema_version`: `1`。
- `sources`: 出典IDから出典への辞書。各項目は `url` または `path`、確認箇所の `note`、`access` を持つ。到達度は `index` / `synopsis` / `detailed` / `full`。
- `targets`: `{id, kanji, reading, reading_type, evidence_source_ids, evidence_note, confirmed: true}` の一覧。`reading` は元教材で確認した辞書形。`kanji` は1字。
- `cast`: `{id, identity_id, name, aliases: [], identity_note, countable: true}` の一覧。`identity_id` は実体が同じなら同じ値。同一人物の外見差は `appearance_by_period` などへ記録する。
- `work`: 作品と全編の調査台帳。
- `scenes`: 根拠のある場面・設定の一覧。
- `questions`: 問題と確認結果の一覧。

`sources` の値には確認した箇所と根拠を記し、URLだけで細部の確認を済ませない。出典の文章を長く転載せず、自分の短い要約で記録する。

## 全編と場面

`work` の必須項目：

```json
{
  "title": "作品名",
  "edition": "原作コミックス版",
  "scope": "第1話から最終話まで",
  "researched_at": "2026-11-05",
  "index_source_ids": ["official-index"],
  "expected_unit_ids": ["ch001", "ch002"],
  "units": [
    {
      "id": "ch001",
      "research_status": "detailed",
      "events": ["人物と因果関係が分かる独自の場面メモ"],
      "setting_notes": ["この話で分かった設定"],
      "character_ids": ["person-a"],
      "source_ids": ["chapter-1-notes"]
    },
    {
      "id": "ch002",
      "research_status": "detailed",
      "events": ["第2話の出来事の確認メモ"],
      "setting_notes": [],
      "character_ids": ["person-b"],
      "source_ids": ["chapter-2-notes"]
    }
  ],
  "segments": [
    {"id": "opening", "title": "導入編", "unit_ids": ["ch001"]},
    {"id": "ending", "title": "終幕編", "unit_ids": ["ch002"]}
  ]
}
```

実行可能な全件の例ではなく、必須項目の形を示したもの。実際には全話を列挙する。単位一覧は公式目次と一致させ、`segments` が同じ順序で全単位を一度ずつ覆うようにする。`detailed` には少なくとも一つ `detailed` または `full` の根拠が必要。短いあらすじへのリンクだけでは詳細調査済みにしない。

`scenes` の項目：`{id, unit_id, basis_type, description, period, character_ids, source_ids, evidence_note, verified: true}`。`basis_type` は原則 `scene` / `setting`。`interpretation` / `vocabulary` は、ユーザーが補足を認めた場合にだけ、トップレベルに `allow_supplements: true` と `supplements_authorization` を明記して利用する。場面の役割と画像に描く時期を具体的に記録する。

## 問題

```json
{
  "id": "q001",
  "prompt": "アキは、相手の話からヒントを〔える〕。",
  "blank_reading": "える",
  "answer": "得る",
  "filled_sentence": "アキは、相手の話からヒントを得る。",
  "targets": [
    {
      "target_id": "t-get-eru",
      "answer_span": [0, 1],
      "surface_reading": "え",
      "reading_note": "辞書形『える』の語幹。送りがなを含めて『得る』と答える。"
    }
  ],
  "character_ids": ["aki"],
  "scene_id": "scene-001",
  "review": {
    "text": {
      "status": "pass",
      "question_sha256": "hashesコマンドの結果",
      "observations": "読みの原資料、日本語と場面の一致を実際に確認した内容"
    }
  }
}
```

`answer_span` は**解答中のUnicode文字位置**で、0始まり・終端を含まない。対象字を実際に含む位置を指定する。`surface_reading` はその字の語中の読み。促音・連濁・活用や送りがなによって辞書形と異なる場合は `reading_note` を記録し、教材・辞書で確認する。機械検査は、この注記が日本語学的に正しいことまでは証明しない。

`character_ids` は本文で意味のある役割を持って言及する人物と一致させる。人物名は正規名か、一意に解決できる別名で書く。匿名役を人数条件へ加えない。別名が衝突する場合はフルネームなどへ変更する。`countable: false` の項目は検査上の最低人数へ加算しない。

## 画像と内容確認

各問題へ次を追加する。

```json
{
  "image": {
    "generation_backend": "imagegen",
    "prompt": "実際にimagegenに送信した入力全文",
    "source_png": "originals/q001-v1.png",
    "required_features": [
      {"id": "scene_fidelity", "description": "該当場面の具体的な動作・関係", "critical": true},
      {"id": "characters", "description": "アキの髪・服・時期・人数", "critical": true},
      {"id": "small_size", "description": "200pxで顔と動作を見分けられる", "critical": true},
      {"id": "no_unwanted_text", "description": "解答・不要な文字・透かしがない", "critical": true}
    ]
  }
}
```

`review.image` は `{status: "pass", question_sha256, prompt_sha256, source_sha256, requirements_sha256, features: [...]}`。各 `features` の項目は `{feature_id, status: "pass", observation: "画像内に実際に見えた内容"}`。必須特徴に一件でも未確認・不一致があれば書き出せない。確認した原画を変更すると、画像指紋の不一致で失効する。

## コマンド

スキルのディレクトリで実行するか、スクリプトを絶対パスで指定する。

```bash
python3 scripts/workbook.py extract 教材.csv --output 読み候補.json
python3 scripts/workbook.py plan workbook.json
python3 scripts/workbook.py hashes workbook.json --output fingerprints.json
python3 scripts/workbook.py validate workbook.json --stage text --output text-check.json
python3 scripts/workbook.py validate workbook.json --stage images --output image-check.json
python3 scripts/workbook.py export workbook.json --output exports/v1 --size 200
```

抽出・配分・本文検査はPython標準ライブラリだけで動く。画像検査と書き出しにはPillowとWebP対応が必要。検査失敗は終了コード1、入力や依存関係の不備は2。検査レポートの `errors` を直し、影響した問題・画像を再確認する。

`export` は新規出力先へ、`originals/`、`png/`、`webp/`、問題・解答Markdown、`workbook.json`、`manifest.json`、`coverage.json`、`validation.json`、`問題と画像の対応.csv`、一覧HTML、PNG/WebPのZIPを作る。PNGとWebPの各解答・画像参照・寸法を揃える。実行途中で失敗したときは `.出力名.partial-*` に残った部分成果を完成版として使わない。
