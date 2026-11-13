# 歴史クイズ lesson 4 選択肢アイコン

45問×4択＝**全180件をimagegenで生成し、照合・148px確認・書き出し済み**。未生成・既知の不一致は0件。

以前に生成できなかった7件は、ユーザーの指示で画像化しやすい別の誤答に変更し、組み込みimagegenで新たに生成した。問題文と正答は変更していない。既存173枚は確認済み画像とハッシュが一致し、対応する問題・選択肢・実際の入力・必須特徴が同一であることを確認して再利用した。

| ID | 旧選択肢 | 新選択肢 |
|---|---|---|
| q02_d | マリオ | 消防士 |
| q11_d | スパイダーマン | 宇宙飛行士 |
| q36_d | ポケモン | 宇宙 |
| q37_d | ヨーダ | 大工 |
| q38_d | ハリーポッター | 手品師 |
| q42_d | シンデレラ | パン職人 |
| q43_d | 白雪姫 | 料理人 |

「宇宙」は問題の「何貿易」の文脈に合わせ、宇宙港で荷物を取引する場面で表現した。クイズ本体は、問題番号と元の選択肢位置に対応する `webp-148/` の全180枚を表示する。選択肢を並べ替えても画像との対応は維持される。

初回のFTP転送では、lesson 4の `index.html`・`quiz-data.js`・`icons.js` と `icon-assets/webp-148/` の180枚を転送する。制作記録・バックアップ・この形式比較ページはFTP同期の対象外で、PNG・ZIPの転送は不要。

- [png-1024.zip](png-1024.zip)：1024×1024 PNG、180枚。確認済みの正規化原画と実際の生成入力メタデータ。
- [png-148.zip](png-148.zip)：148×148 PNG、180枚。Lanczos縮小。
- [webp-148.zip](webp-148.zip)：148×148 WebP、180枚。quality 85 / method 6。
- [comparison.html](comparison.html)：問題・選択肢と三形式の比較。
- [manifest.jsonl](manifest.jsonl)：全IDの対応・設計・実際の最終入力・生成履歴。
- [audit.json](audit.json)：各画像の特徴別の観察、画像・指示のハッシュと148px確認。
- [validation.json](validation.json) / [export-verification.json](export-verification.json)：全180件の対応・メタデータ・ハッシュ・形式・変換・ZIPの検査記録。
- [choice-replacements.json](choice-replacements.json)：選択肢変更と旧データの保存先。
- [app-validation.json](app-validation.json)：選択肢・正答・SVG画像参照の検査。ブラウザ環境がなく、操作確認は未実施。

画像は180件すべて独立したimagegen出力。以前の11件の画像修正に加え、今回は7件の選択肢を変更して生成した。生成元のPNG191件と実際の入力は [../icon-production/](../icon-production/) に保存した。旧173件版は `backups/20261106T035041Z-ebc18c/` に、旧選択肢と生成拒否の記録は制作記録の `revisions/` に退避した。

目視照合とファイル検査は区別して記録している。人物の容貌、失われた建物、家紋細部、合戦の正確な配置は学習用の再現であり厳密な復元ではない。地図は概略、QRコードは外形説明用で読み取り可能性を保証しない。本の表紙は特定の実物の号・版の複製ではない。

第10問の「1052年」は平等院の開創年と鳳凰堂の建立年（1053年）の既存の混同であり、[production-findings.json](production-findings.json) に記録している。この問題文は今回の7誤答の置き換え対象には含めていない。[京都府「平等院」](https://www.pref.kyoto.jp/kyotoyamashirokanko/treasure_1.html)を参照。
