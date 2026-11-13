# lesson 6 アイコン

全45問×4択の180枚をimagegenで個別生成しました。全180枚を問題・選択肢・実際の入力と目視照合し、148pxでも確認しました。

## 書き出し

- [1024px PNG 180枚](png-1024.zip)
- [148px PNG 180枚](png-148.zip)
- [148px WebP 180枚](webp-148.zip)
- [3形式の比較](comparison.html)

原画は1024pxに正規化。縮小はLanczos、WebPはquality 85 / method 6です。クイズと一覧はWebP180枚を参照します。

## 確認と修正

参照編集した画像は q02_b, q13_a の2枚です。弓の見切れと時代に合わない家紋を修正し、元画像と入力を保存しました。

imagegenに拒否された誤答は、ユーザーの指示で以下の別の選択肢へ変更して再生成しました。問題文と正解は全45問で保持しています。

- q24_d：ゴジラ → 巨大ロボット
- q31_d：スーパーマリオ → 消防士
- q42_d：シンデレラ → パン職人

目視記録は [audit.json](audit.json)、入力と対応表は [manifest.jsonl](manifest.jsonl) です。51件はaligned、129件は主要要件を確認した学習用の歴史再現としてlimitedと記録しています。人物本人の容貌、建築・法令原本の細部、宗派の全教義、合戦の正確な配置を保証するものではありません。未確認・既知の不一致はありません。

生成直後の原画180枚は `../icon-production/originals/`、修正前の2枚は `../icon-production/review/before-edit/` に保存しています。実際のツール入力と戻り値のパスは `../icon-production/jobs/`、拒否前の選択肢と入力は `../icon-production/revisions/` に保存しています。内部モデル名とシードはツールから提供されていないため推測していません。

## 検査記録

- [書き出しの検査](export-verification.json)：180件の寸法・形式・SHA256・縮小・PNGメタデータ・WebP差分、540画像リンク、各ZIP180件を確認。
- [WebP変換後の目視比較8件](export-visual-samples.json)。
- [クイズの対応検査](app-validation.json)：全180件の固有ID、正解と問題文の保持、シャッフル後の対応、JavaScript構文を確認。ブラウザーの操作試験は実施していません。
- [FTP対象の検査](ftp-selection-verification.json)：WebP180枚＋HTML/JS3件の183ファイル。PNG・ZIP・制作記録は対象外。

FTP反映の結果は `app-validation.json` と `../icon-production/deployments/` に記録します。

## FTP反映

2026-11-06T05:47:42.965700+00:00 にWebP180枚と参照ファイル3件を転送しました。[公開ページ](https://www.asahi-net.or.jp/~fk5a-ng/quiz/social-studies-2-lesson6/index.html) の全183ファイルを取得し、手元のSHA256との一致を確認済みです。転送・検査の記録は `../icon-production/deployments/20261106T054519Z/` に保存しています。
