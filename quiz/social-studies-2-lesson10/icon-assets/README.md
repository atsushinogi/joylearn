# 社会 第10回 選択肢アイコン

60問×4択＝240件。元の問題番号と選択肢位置から `q01_a`〜`q60_d` を付けた。同名の選択肢も別々にimagegenで生成している。

- `webp-148/` と `webp-148.zip`：148×148 WebP、各240枚。quality 85 / method 6。
- `png-148/` と `png-148.zip`：148×148 PNG、各240枚。Lanczosで縮小。
- `png-1024/` と `png-1024.zip`：確認済みの1024×1024 PNG、各240枚。生成入力などのメタデータを保持。
- `comparison.html`：問題・選択肢と三形式の比較。
- `manifest.jsonl`：対応表、場面設計、必須特徴、実際の最終入力と生成履歴。
- `audit.json`：各画像を実際に見て記録した特徴別の観察、画像と指示のハッシュ。
- `validation.json` と `export-verification.json`：対応・寸法・メタデータ・ハッシュ・書き出し画像の検査結果。

個別照合と148pxでの全件確認を実施し、9件の不一致をimagegenで修正した。既知の未解消不一致は0件。生成原画249件の元バイト列は `../icon-production/recovery/originals.zip`、修正前の参照画像は `../icon-production/review/before-edit/` に保存した。

学習用の再現画像であり、人物本人の容貌、史料細部、失われた建築・作品の厳密な復元は保証しない。元の問題文・選択肢・正解は変更していない。
