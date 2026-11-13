# 呪術廻戦で学ぶ漢字53問

32漢字・53通りの読みを53問で扱い、名前が問題文に現れる人物は30人です。横長版では全53枚を3:2の構図に更新し、吹き出しなしの短いボケ・ツッコミを添えました。セリフは学習用の創作で、原作の引用ではありません。

## 開く・ダウンロードする

- [問題と画像の一覧](exports/v2/index.html) ／ [問題](exports/v2/問題.md) ／ [解答](exports/v2/解答.md)
- [PNG一括](exports/v2/images-png.zip) ／ [WebP一括](exports/v2/images-webp.zip)
- [問題と画像の対応CSV](exports/v2/問題と画像の対応.csv)

PNG・可逆WebPは各53枚、すべて600×400pxです。IDと画像名は `q001`〜`q053`。問題・解答・読みは従来のままで、セリフにその問の対象漢字が含まれないことを検査しています。[旧正方形版](exports/v1/index.html)と旧原画も保存しています。

## 保存内容

- `originals/`：旧原画と、横長の新原画 `q001-wide-v2.png`〜`q053-wide-v2.png`、修正前の稿、生成記録。
- `research/`：元教材の読み、既存の出典・人物・場面メモ、移行元の問題台帳。
- `review/`：旧版の検証結果と、全53枚の横長版の目視確認記録 `wide-image-check.json`。
- `exports/v2/`：現行の配布画像・問題・解答・CSV・一覧・ZIP・台帳。
- `exports/v1/`：旧正方形版。
- `workbook.json`：問題・読み・人物・場面・画像の対応台帳。
- `image-prompts.json`／`generation-history.json`：採用画像の生成入力と既存の生成・修正履歴。
- `wide-dialogue.json`／`wide-generation.json`：セリフと横長版の生成入力・原画の来歴。内蔵imagegenで制作。
- `review-observations.json`：既存の場面メモとファイル照合結果。

## 元教材の範囲と今回の確認

既存教材はアニメ第1期・第2期を中心とし、読み取り問題と語句補足を含みます。[出典と区分](research/出典と出題配分.md)を参照してください。横長版は挿絵と表示の更新です。掛け合いや一部の構図は教材用に創作しており、作中の会話や厳密な場面再現として扱いません。

再出力はリポジトリーのルートから `python3 kanji-50/scripts/build-wide-export.py`、アプリのデータ更新は `node kanji-50/scripts/build-app-data.cjs` を実行します。再出力では原画の目視確認指紋、53問との対応、寸法、PNG/WebPの復号画素一致、セリフ内の対象漢字、ZIPの内容を検査します。
