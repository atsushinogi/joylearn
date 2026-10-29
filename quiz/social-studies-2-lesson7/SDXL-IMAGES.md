# 歴史クイズ第7回 画像と生成記録

50問×4選択肢に対応する200枚です。ファイル名は `q01_a`〜`q50_d`。A〜Dは元の問題データの順序で、画面でランダムに並べ替えた後の記号ではありません。

**今後の新規制作は、最初の試作から本生成・修正までimagegenを使います。** [制作手順書](./CHOICE-ICON-WORKFLOW.md) と [スキル](../../skills/quiz-choice-icons/SKILL.md) を参照してください。本書は第7回の実際の生成方法と既存画像の再検査・再実行方法を記録したものです。SDXLの再実行は、ユーザーが明示的に指定した場合に行います。

## 保存形式

| フォルダ | 画像 | 設定 |
|---|---|---|
| `images-sdxl/` | 1024×1024 PNG、200枚 | 元のフォルダ名を継続使用 |
| `images-sdxl-148/` | 148×148 PNG、200枚 | 原画像からLanczos縮小 |
| `images-sdxl-148-webp/` | 148×148 WebP、200枚 | quality 85、method 6 |

画風の設計分類：写真リアル162件、漫画風26件、教育イラスト12件。

## 個別見直し

全200件を問題文・選択肢・日本語の作画指示・実際の生成プロンプトと目視照合し、161枚を修正しました。歴史上の合戦19件は、両軍の多数の兵が交戦する広い構図へ変更しています。

- [修正前と採用画像の比較・個別確認](./sdxl-review-v2/report.html)
- [全200件の確認記録](./sdxl-review-v2/report.md)
- [確認結果CSV](./sdxl-review-v2/report.csv)
- [参照資料](./sdxl-review-v2/references.md)

確認対象は主題、主要な人数・小道具・動作・基本構図です。人物の容貌、甲冑、旗の家紋・所属、建築・地形、美術作品の細部を史料や実物と完全に一致すると保証する判定ではありません。各画像の確認範囲と限界は記録に明示しています。

`aligned` は主要な作画要件を確認、`limited` は題材を確認したが史実の厳密な復元等には限界あり、`mismatch` は具体的な不一致が残ることを示します。機械検査の合格だけでは内容の一致を証明しません。

## 生成方法

今回の採用画像は、画像生成ツール `imagegen` 161枚、元のローカルSDXL画像 39枚です。SDXLで小道具・軍装・人数等の再現が不足したものは画像生成ツールで生成・参照編集しました。元のフォルダ名 `images-sdxl` でも、全画像をSDXLで生成したという意味ではありません。

実際に渡した文章は `icon-prompts-sdxl.jsonl` の `prompt_en`、生成方法は `generation_backend` に保存しています。PNGのメタデータにも実際の最終入力を保存しています。参照編集をした画像は `generation_history` に編集前の生成プロンプトと参照画像の保存先・SHA256を残しています。画像生成ツールはシードを指定していないため `seed` は `null`、PNG内では `unspecified` です。専用のnegative_prompt引数は使わず、回避事項は入力本文に含めています。

画像生成ツールの出力は必要に応じて1024×1024へLanczos縮小し、PNGとして保存しています。元のツール出力の寸法と保存先もPNGメタデータ・生成ログに残しています。

元のSDXLの設定：`/content/drive/MyDrive/ColabAI/sdxl-base`、`StableDiffusionXLPipeline`、float16、30ステップ、guidance 6.0、保存モデルのEuler scheduler、画像ごとの固定シードです。

## 元画像と履歴

`sdxl-review-v2/before/` に修正前の全200枚×3形式とプロンプト類、旧ZIPを保存しています。原画像のSHA256は `before/sha256.json`。参照編集前の入力画像は `before-refinement/` に保存しています。

SDXLの未採用候補は `sdxl-review-v2/candidates/`、画像生成ツールの採用候補は `imagegen-candidates/`、細部の補正候補は `refined-candidates/` に残しています。

## Colabで比較

```python
%run "/content/drive/MyDrive/joylearn/quiz/social-studies-2-lesson7/compare-sdxl-images.py"
```

3形式を同じ表示サイズで比較し、問題文・選択肢・実際の最終プロンプト・日本語の設計指示・個別確認結果を表示します。参照編集をした画像では、編集前の入力画像と元の生成プロンプトも展開できます。

## 検査と一覧更新

```sh
python review-sdxl-icons.py --zip
python sdxl-review-v2/validate-final.py
```

200枚の寸法・形式・実際の生成プロンプトとPNGメタデータの一致・画素の完全重複、問題と選択肢の対応、148px PNGと原画像の関係、WebP、元画像の保全、ZIPの内容とCRCを検査します。

## SDXLを明示的に指定して再実行する場合

```sh
python generate-sdxl-icons.py --dry-run
python generate-sdxl-icons.py
```

現在のデータではSDXL方式の画像だけを対象とし、画像生成ツール方式の161枚はスキップします。画像生成ツール用の長い入力をSDXLへそのまま送ることはできません。SDXLの入力は両方のCLIP tokenizerの上限内を検査します。

今回のSDXL候補用の短い入力200件は `sdxl-review-v2/prompts-candidate.jsonl` に保存しています。これを別フォルダに生成する場合：

```sh
python generate-sdxl-icons.py --prompts sdxl-review-v2/prompts-candidate.jsonl --output-dir images-sdxl-trial
```

これはSDXL候補を生成するための設定であり、採用した画像生成ツールの出力と同じ画像・同じ精度を再現するものではありません。
