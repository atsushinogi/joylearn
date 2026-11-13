# FTPアップロード

接続先: `netftp.asahi-net.or.jp`、ポート: `21`、ユーザー: `fk5a-ng`、転送先: `homepage/`。

このサーバーは通常のFTPを使います。2026年10月28日に明示的FTPSを試したところ、`AUTH TLS` に `502 Command not implemented` が返りました。通常のFTPではパスワードと転送内容が暗号化されないため、利用するネットワークに注意してください。

このディレクトリで転送予定のファイルを確認:

```sh
python3 ftp-sync.py
```

現在のポケモンタイピングは `poketyping/pokemon_svg_color_256/` の元画像に近い色の256×256px SVGを参照しています。画像だけを先にアップロードし、全件の転送後にゲームの参照データとタイピング判定を切り替える場合は、次の専用スクリプトを使えます。`.env` の `FTP_PASSWORD` を読み込みます。

```sh
python3 poketyping/deploy_pokemon_svg_ftp.py --upload
```

公開先で新画像の配信を確認した後、旧 `pokemon_svg_69/` を削除して容量を空ける場合:

```sh
python3 poketyping/deploy_pokemon_svg_ftp.py --cleanup-old
```

アップロード（端末でパスワードを入力。入力は表示・保存されません）:

```sh
python3 ftp-sync.py --upload
```

毎回対象ファイルをすべて転送し、同名のファイルを上書きします。サーバー側だけにあるファイルは削除しません。サーバーからの取り込みは行いません。

## トップページだけをアップロードする

`ftp-sync.py --upload` は全対象ファイルを転送します。`index.html` だけを更新する場合は、リポジトリのルートで次を実行します。パスワードは端末で入力し、コマンドやファイルには書き込みません。

```sh
python3 - <<'PY'
import ftplib
import getpass
from pathlib import Path

source = Path('index.html')
with ftplib.FTP('netftp.asahi-net.or.jp', timeout=20) as ftp:
    ftp.login('fk5a-ng', getpass.getpass('FTP password: '))
    ftp.cwd('homepage')
    with source.open('rb') as content:
        ftp.storbinary('STOR index.html', content)
    remote_size = ftp.size('index.html')

if remote_size != source.stat().st_size:
    raise SystemExit('アップロード後のファイルサイズが一致しません')
print('index.html のアップロードが完了しました')
PY
```

公開先は `https://www.asahi-net.or.jp/~fk5a-ng/` です。アップロード後にページを再読み込みして反映を確認してください。ファイルサイズの一致は転送の簡易確認であり、公開ページの表示確認も行います。

poketyping の PNG を WebP に置き換えた後は、旧 PNG もサーバーから消さないと使用容量が減りません。各 WebP の転送成功直後に対応する旧 PNG だけを削除する場合:

```sh
python3 ftp-sync.py --upload --delete-obsolete-pokemon-png
```

poketyping を SVG に切り替えた後は、SVG の転送成功直後に対応する旧 PNG と WebP を削除できます。ローカルの WebP は残ります:

```sh
python3 ftp-sync.py --upload --delete-obsolete-pokemon-raster
```

転送対象はHTML・JavaScript（`.js`）・CSSと、そこから参照される画像・フォント・JSONなどの公開用ファイルです。動的に組み立てるパスは自動検出できません。README、Markdown・Word文書、開発用のPython・CommonJSスクリプト、未参照のJSONは転送しません。ドットで始まるファイル・ディレクトリ、`__pycache__`、シンボリックリンクも対象外です。詳細は README.md を参照してください。

`ftp-sync.py` には `--tls` オプションがありますが、上記のとおり現在の接続先では明示的FTPSを利用できません。

## 漢字50 呪術廻戦

`kanji-50/jujutsu-kaisen/exports/v2/png/` のPNG53枚はFTP同期の対象外です。問題画面と一覧ページの表示は同じフォルダの `webp/` を使います。一覧ページ（`exports/v2/index.html`）の「PNG」ダウンロードリンクは、公開先ではPNGがないため開けません。

## 歴史クイズ lesson 4

全45問×4択の画像は `quiz/social-studies-2-lesson4/icon-assets/webp-148/` の180枚のWebPを参照します。初回の切り替えでは、同じlesson 4配下の `index.html`、`quiz-data.js`、`icons.js` とWebP180枚を転送します。参照するファイル名が同じ画像の更新では、該当するWebPの上書きで更新できます。

lesson 4の制作記録（`icon-production/`）、旧版（`icon-assets/backups/`）、形式比較ページ（`icon-assets/comparison.html`）はFTP同期の対象外です。PNGやZIPの転送は不要です。これらのローカルファイルは保存したままです。

`ftp-sync.py --upload` は、lesson 4だけでなくリポジトリ全体の公開対象を転送します。

## 歴史クイズ lesson 6

全45問×4択の画像は `quiz/social-studies-2-lesson6/icon-assets/webp-148/` の180枚のWebPを参照します。初回の切り替えでは、同じlesson 6配下の `index.html`、`quiz-data.js`、`icons.js` とWebP180枚を転送します。同じファイル名で画像を更新する場合は、該当するWebPを上書きします。

lesson 6の制作記録（`icon-production/`）、旧版（`icon-assets/backups/`）、形式比較ページ（`icon-assets/comparison.html`）はFTP同期の対象外です。PNGとZIPはローカルの書き出しとして保存し、FTPへは転送しません。

`ftp-sync.py --upload` は、lesson 6だけでなくリポジトリ全体の公開対象を転送します。lesson 6だけの転送には、制作記録の `deployments/` に保存された対象183ファイル限定の手順とマニフェストを使えます。画像を先に、参照データとページを最後に転送し、公開URLから全ファイルのSHA256を照合します。
