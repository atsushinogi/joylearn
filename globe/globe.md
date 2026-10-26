# TERRA 地球儀アプリ — 環境構築から公開まで

作成日：2026-10-23。最終公開版のコードと制作時の実行記録に基づく開発・運用ドキュメント。

## 1. 成果物と対象範囲

マウスで地球を見渡し、矢印キーで日時を移動できる地球儀。地図、CSS、ライブラリ、描画処理を [dist/index.html](dist/index.html) の1ファイルに収めた。

| 項目 | 内容 |
| --- | --- |
| アプリ名 | TERRA — 手のひらの地球儀 |
| 配信URL | [地球儀を開く](https://night-globe-jp.mintymoon64.chatgpt.site) |
| 最終公開時のアクセス | 所有者のみ閲覧できる非公開サイト |
| 実装形式 | ビルド不要の静的HTML 1枚 |
| 描画 | CPUによる球面の画素計算とCanvas 2D表示、SVGの補助表示 |
| 実行時の通信 | 地図・スクリプトを含め、外部取得なし。公開サイト自体の取得・認証は別 |
| HTMLのサイズ | 643,412 bytes（この文書作成時点） |
| バックエンド・DB | 使用しない |

本書の追加作業ではアプリ本体を変更せず、再デプロイも行わない。以下の公開情報は、最後に成功を確認したアプリ版の記録である。

関連ファイルは次のとおり。

```text
work/
├── globe.md                   この文書
├── dist/
│   └── index.html             単体で動く地球儀
└── .openai/
    └── hosting.json           Sitesの識別子と静的配信設定
```

配信対象は `dist/`。ルートの `globe.md` や、作業場所にある他のファイルはアプリの静的配信対象に含めない。

## 2. 要求と改善の経緯

初期要求は「HTML 1枚」「マウスで回転」「傾いた地軸」「夜側を薄暗くする」。試作後、海岸線の正確さ、操作の軽さ、地軸を含む自由回転、日時との連動へ要求を具体化した。

| 課題・追加要求 | 最終的な対応 |
| --- | --- |
| マウスの追従が遅い | 回転の補間待ちをなくし、最新の入力を優先する描画キューへ変更 |
| 大陸が不正確 | 生成ノイズ・手描き輪郭からNatural Earthの実地図データへ変更 |
| CPUで描画したい | WebGL / WebGPUを使用せず、画素計算をWeb Workerで実行 |
| 地軸ごと動かしたい | 地球、極、地軸に共通のクォータニオンを適用 |
| 夜側は少し暗い程度 | 一定倍率の陰影に変更。初期値78%、調整範囲45〜95% |
| 昼夜を線で区切りたい | 太陽方向に直交する大円をSVGで描画 |
| マウス操作に境界も追従 | 地球の視点と同じ回転を太陽方向にも適用 |
| キー操作で自転・日時を連動 | 視点回転と時間変化を分離し、日時から地球姿勢を計算 |
| 日付に応じて地軸の角度も変化 | 地軸の傾きを任意に変えず、公転に追従する視点で見かけの変化を表現 |

GPU描画も検討したが、利用者のCPU指定に合わせて採用しなかった。

## 3. 環境構築・インストール

### 3.1 実装環境

この文書作成時に確認した環境。バージョンは制作環境の記録であり、閲覧者に同じ開発環境を要求するものではない。

| ソフトウェア | 確認したバージョン・用途 |
| --- | --- |
| OS | Ubuntu 24.04.4 LTS |
| Node.js | v20.19.0。構文確認、検証、Sites補助スクリプト |
| npm | 10.8.2。検証用Playwrightの取得 |
| Git | 2.43.0。Sitesソースの保存・同期 |
| curl | 8.5.0。地図とライブラリの取得 |
| Python | 3.13.15。必要に応じたローカルHTTP配信に利用可能 |
| Playwright | 1.64.1。Chromiumによるブラウザ検証 |
| Sitesプラグイン | 使用したチェックアウト：1.1.1 |

Node.js、npm、Gitなどは用意済みの環境を使用した。アプリ用の `npm install`、フレームワークの導入、バンドル・ビルドは実施していない。

### 3.2 閲覧だけに必要なもの

JavaScriptとCanvas 2Dに対応するブラウザで `dist/index.html` を開く。アプリ本体はNode.jsやPythonを必要としない。Chromiumでは `file://` からの起動も確認した。

Web Workerが使える場合は描画計算を別スレッドに分ける。使えない場合は同じCPUレンダラーをメインスレッドで動かす。

### 3.3 検証ツールの導入

制作時は以下の形でPlaywrightとChromiumを取得した。

```bash
npm exec --yes --package=playwright -- playwright --version
npm exec --yes --package=playwright -- playwright install chromium
```

最初のブラウザ起動は `libatk-1.0.so.0` 不足で失敗したため、以下で必要なLinux共有ライブラリとフォント類を導入した。

```bash
npm exec --yes --package=playwright -- playwright install-deps chromium
```

検証環境を新しく用意する場合は、次のようにバージョンを固定できる。Linuxの依存関係導入には管理者権限が必要になることがある。

```bash
npm exec --yes --package=playwright@1.64.1 -- playwright install-deps chromium
npm exec --yes --package=playwright@1.64.1 -- playwright install chromium
```

アプリの配布先にPlaywrightを入れる必要はない。

### 3.4 地図・ライブラリの取得

次の公開ファイルを制作時に取得し、HTMLへ埋め込んだ。CDNは制作時だけ使用する。

```bash
curl -L --fail --silent --show-error --max-time 45 \
  https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json \
  -o /tmp/globe-land-50m.json

curl -L --fail --silent --show-error --max-time 45 \
  https://cdn.jsdelivr.net/npm/d3-array@3.2.4/dist/d3-array.min.js \
  -o /tmp/globe-d3-array.js

curl -L --fail --silent --show-error --max-time 45 \
  https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/dist/d3-geo.min.js \
  -o /tmp/globe-d3-geo.js

curl -L --fail --silent --show-error --max-time 45 \
  https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js \
  -o /tmp/globe-topojson.js
```

| 要素 | 役割 |
| --- | --- |
| world-atlas 2.0.2 / land-50m | Natural Earth由来の陸地TopoJSON。1:50mは5000万分の1の縮尺を指す |
| topojson-client 3.1.0 | TopoJSONをGeoJSONへ変換 |
| d3-geo 3.1.1 | 日付変更線や極域も扱う地図投影・パス生成 |
| d3-array 3.2.4 | d3-geoが利用する補助処理 |

`land-50m.json` は約545 KB、1,425本のarcを含む。国境ではなく陸地形状を使用する。縮尺に応じた一般化を含むため、測量用途や街区単位の海岸線を保証するデータではない。[world-atlasの説明](https://github.com/topojson/world-atlas)を参照。

Natural Earthの地図データはパブリックドメイン。埋め込んだ各ライブラリの著作権表示とライセンス本文もHTML内に保持した。[Natural Earthの利用条件](https://www.naturalearthdata.com/about/terms-of-use/)

## 4. アプリの仕様

### 4.1 表示

- 実地図の海岸線、海・陸、地軸、北極・南極、経緯線、赤道、主要都市を表示する。
- 地名は東京、ロンドン、ニューヨーク、シドニー、ケープタウン、リオデジャネイロ、ニューデリー。裏側や重なるラベルは隠す。
- 地球表面の昼側は通常色、夜側は一定倍率で暗くする。薄明のグラデーションは設けない。
- 画面中央の緯度・経度、日本時間の日時、画面上の地軸角度を表示する。狭い画面では補助説明の一部を省略する。
- 経緯線、地軸、地名を個別に切り替えられる。
- 初期視点の中心は北緯27°・東経130°。初期の画面上の地軸傾斜は23.44°。

### 4.2 操作

| 操作 | 動作 |
| --- | --- |
| マウスドラッグ・1本指ドラッグ | 地球、地軸、太陽方向を含めて視点を回す |
| 地球の外周をドラッグ | 視線方向まわりの傾きも変える |
| ホイール | 拡大・縮小 |
| 2本指ピンチ | 拡大・縮小 |
| 2本指のひねり・中心移動 | 視点を回転 |
| `←` / `→` | 表示日時を1時間前 / 後へ移動 |
| `↓` / `↑` | 表示日時を1日前 / 後へ移動 |
| `Shift + ← / →` | 6時間前 / 後へ移動 |
| `Shift + ↓ / ↑` | 30日前 / 後へ移動 |
| `+`、`=` / `-`、拡大縮小ボタン | 倍率を1.18倍 / 1÷1.18倍にする |
| `Home`、リセット | 視点と倍率だけを初期化。表示日時は維持 |
| 現在へ | 現在時刻への追従を再開。視点と倍率は維持 |
| 夜側の明るさ | 45〜95%。初期値78% |

倍率範囲は0.7〜2.4。入力欄やスライダー内での矢印キー操作、Ctrl / Meta / Altを伴うショートカットは、地球儀の時間操作に使わない。

### 4.3 時間の状態

開始時は現在時刻モード。端末の `Date.now()` を基準にし、表示は日本時間JST（UTC+9）へ変換する。時刻合わせのネットワーク通信は行わない。

矢印キーを押すと、その時点の日時を基準にシミュレーションモードへ切り替える。以降はキー操作時だけ日時を変更し、表示は「日時を操作中」となる。「現在へ」でライブ表示に戻る。

時計は1秒ごとに更新する。ライブ時の地球の高精細描画は、ページが表示中かつドラッグしていない場合に約15秒間隔で更新する。操作中の描画要求やページへの復帰時は、その時点の日時で計算し直す。

キーで設定できる時刻の範囲は、UTCで1800-01-01 00:00:00〜2199-12-31 23:59:59。

## 5. 設計の中心：視点と時間を分ける

マウスで見る方向を変える操作と、地球を自転・公転させる操作は別の状態として扱う。

| 状態 | 意味 | 主に変更する操作 |
| --- | --- | --- |
| `view` | 観察者の視点を表すクォータニオン | マウス・タッチ・視点リセット |
| `live` / `simulationTime` | どの日時を表示するか | 矢印キー・現在へ |
| `model.orientation` | 日時から計算した地球姿勢 | `solarModel(time)` |
| `model.light` | 同じ基準座標での太陽方向 | `solarModel(time)` |
| `q` | 実際の表示に使う地球姿勢 | `view × model.orientation` |
| `sun` | 実際の表示に使う太陽方向 | `rotate(view, model.light)` |

```text
マウス・タッチ ──→ view ─────────────────┐
                                         ├→ 描画状態のスナップショット
時計・矢印キー ──→ 日時 → solarModel ────┘       ├→ Worker → RGBA画素 → Canvas 2D
                                                └→ 同じ状態で地軸・境界・地名のSVG
```

マウス操作では、地球と太陽方向を同じだけ回す。したがって、画面上では昼夜境界が追従し、同じ地点の昼夜判定は変わらない。ライブ時は実時間が進む分だけ変化する。

矢印キーでは `view` を変えず日時を変更する。地球は主に地軸まわりに自転し、日付に応じた公転と太陽位置の変化も反映される。

地軸の傾きそのものと、画面上で見える角度は区別する。約23.44°という本来の傾きを大きく変える演出はせず、公転に追従する基準座標から見た向きが変わるようにした。

## 6. 座標・回転・天文計算

### 6.1 座標系とクォータニオン

地理座標は、緯度を `φ`、東経を正とする経度を `λ` として単位球に変換する。

```text
x = cos(φ) sin(λ)
y = sin(φ)
z = cos(φ) cos(λ)
```

北極は `[0, 1, 0]`、緯度0°・経度0°は `[0, 0, 1]`。画面ではXが右、Yが上、Zが手前を向く。

クォータニオンは `[x, y, z, w]` の順。`multiply`、`rotation`、`rotate`、`inverse`、`between`、`norm` を使用する。回転の合成順に注意し、ドラッグ時は差分回転を `view` の左から掛ける。

Arcballはドラッグ開始点と現在点を仮想球面上へ移し、その2ベクトル間の回転を求める。球の外ではXY方向を正規化し、外周ドラッグでロールできるようにする。補間や慣性による入力待ちは設けていない。

### 6.2 太陽位置と恒星時

[USNOの太陽位置近似式](https://aa.usno.navy.mil/faq/sun_approx)と[恒星時近似式](https://aa.usno.navy.mil/faq/GAST)を使用する。以下の角度定数は度で、三角関数へ渡す際にラジアンへ変換する。

```text
JD = Unix時刻[ms] / 86400000 + 2440587.5
D  = JD - 2451545.0

g  = 357.529 + 0.98560028 D
L̄  = 280.459 + 0.98564736 D
L  = L̄ + 1.915 sin(g) + 0.020 sin(2g)
ε  = 23.439 - 0.00000036 D

RA = atan2(cos(ε) sin(L), cos(L))
δ  = asin(sin(ε) sin(L))
```

`L̄` は太陽の平均黄経、`L` はUSNO近似式による太陽の見かけの黄経、`ε` は黄道傾斜、`RA` は赤経、`δ` は赤緯。

グリニッジ平均恒星時GMSTは、直前のUTC午前0時のユリウス日 `JD0`、`D0 = JD0 - 2451545`、その午前0時からの時間 `H`、`T = D / 36525` から求める。

```text
GMST[h] = mod(6.697375 + 0.065709824279 D0
              + 1.0027379 H + 0.0000258 T², 24)
太陽直下点の経度 = wrap180(RA[deg] - 15 × GMST[h])
太陽直下点の緯度 = δ
```

この可視化ではUTCをUT1の近似として扱い、章動などの高精度補正は省略する。時刻・季節を連動させる地球儀であり、測地・航法や厳密な日の出時刻の計算器ではない。

### 6.3 公転に追従する姿勢

`R_axis(angle)` を軸回転とすると、モデル姿勢と太陽方向は次になる。

```text
M(t) = R_y(-L̄) × R_z(-ε) × R_y(GMST[rad])
S(t) = [sin(L - L̄), 0, cos(L - L̄)]

Q(t) = V × M(t)
sun  = rotate(V, S(t))
```

平均公転に追従する座標を使うため、公転に応じて地軸の見え方が変わる。真の黄経と平均黄経の差も太陽方向へ反映し、境界線を単なる固定光源として扱わない。

初期姿勢は `R_z(-23.44°) × R_x(27°) × R_y(-130°)`。起動時のモデル姿勢を打ち消す `homeView(time)` により、開始日時が違っても同じ地域から見始められる。

## 7. CPUレンダラーの実装

### 7.1 地図を先に一度描く

`drawMap()` がTopoJSONをGeoJSONへ変換し、d3-geoの正距円筒図法で4096×2048の一時Canvasへ陸地を描く。日付変更線や極域を含む投影処理はd3-geoに任せる。

海は `#23516c`、陸は `#b7c8a4`、海岸線は `#d4dfc2`。RGBA配列を取り出し、Workerへ転送する。地形ノイズをフレームごとに計算しない。

JSONは `<script type="application/json" id="geo-data">`、ライブラリとアプリコードはインラインの `<script>` に入る。スクリプトブロックは計5個で、外部スクリプトの `src` はない。

### 7.2 球面へ逆投影する

出力画像の一辺を `n`、倍率を `zoom` とすると、地球の半径は `r = 0.39 × n × zoom`。

```text
X = (px + 0.5 - n/2) / r
Y = (n/2 - py - 0.5) / r
Z = sqrt(1 - X² - Y²)
```

球の外側は透明にする。球内の画面法線 `[X,Y,Z]` を `Q` の逆回転で地理座標へ戻し、経度 `atan2(x,z)` と緯度 `asin(y)` から地図の画素を読む。現実装の地図サンプリングは最近傍参照。

出力寸法と倍率が同じ間は、画面法線・有効画素の位置・輪郭のα値をキャッシュする。逆回転行列も画素ごとではなくフレームごとに1回計算する。

### 7.3 昼夜の陰影と境界線

画面法線を `N`、同じフレームの太陽方向を `sun` とし、`N · sun >= 0` を昼、それ以外を夜とする。

昼は元の色、夜は元のRGBに `brightness` を掛ける。夜側の中では光量を一様にする。照明判定は毎フレーム計算し、太陽方向が変わるのに古い昼夜マスクを再利用しない。

境界は `N · sun = 0` を満たす大円。SVGで1°刻みにサンプリングし、表側の部分だけを描画する。地軸、都市、経緯線とともに、Canvasに実際に表示したフレームのスナップショットを使う。

### 7.4 Workerと描画要求

Workerのソースは `createRenderer.toString()` からBlobとして生成し、HTMLを分割せず別スレッドで計算する。RGBAの `ArrayBuffer` は転送リストで受け渡し、メインスレッドでは `ImageData` と `putImageData()` で表示する。

- 同時に実行する描画は1件。
- 描画中に来た要求は `pending` に最新の1件だけ残す。
- 処理終了後、最新の要求があればすぐ送る。
- 位置・時刻・太陽方向などをまとめた状態をフレームごとに固定する。
- Worker未対応・起動失敗・実行エラー時は同じCPU処理へフォールバックする。

`createRenderer()` はGPU APIを呼ばない。ブラウザやOS自体の画面合成の方式とは別に、地球の画素計算をCPUで行う設計である。

### 7.5 解像度と負荷の調整

| 項目 | 実装値 |
| --- | --- |
| DPRの上限 | 2 |
| 操作中の解像度上限の初期値 | 一辺480 px |
| 上限の自動調整 | 19 ms超で0.88倍、最小360 px。9 ms未満で20 px増、最大640 px |
| 操作中の実際の一辺 | `min(dragSize, max(320, 表示幅 × DPR))` の丸め値 |
| 静止時の一辺 | `clamp(表示幅 × DPR, 540, 1100)` の丸め値 |
| 操作停止後の高精細化 | 原則140 ms後。ポインターを離したときは直ちに要求 |

操作中は応答性を優先し、停止後に高精細な画像を描き直す。制作時のCPU版検証では、安定したドラッグ中の画素計算が約14〜17 ms、初回・高精細フレームが約70〜80 msだった。端末依存の計測であり、常時60 fpsの保証値ではない。

## 8. 主要関数と変更箇所

| 関数・要素 | 担当 |
| --- | --- |
| `geographic`、クォータニオン関数群 | 座標変換・姿勢計算 |
| `solarModel` | 太陽位置、自転、公転のモデル |
| `displayTime`、`updateClock`、`shiftTime` | 日時の状態と表示 |
| `homeView`、`reset` | 日時と独立した視点の初期化 |
| `drawMap` | 海岸線から地図画像を作る |
| `createRenderer` | CPUで球面のRGBA画素を計算 |
| `initialize`、`startLocal` | Worker起動・代替経路 |
| `requestRender`、`dispatch`、`receive` | 描画要求、最新状態の選択、表示 |
| `project`、`projectedPath`、`updateOverlay` | 地軸、経緯線、境界、都市のSVG表示 |
| `arcball`、`rebase`、Pointer Events | マウス・タッチの回転操作 |
| `window.globeDiagnostics` | 検証用の状態参照 |

HTML先頭が見た目のCSSとDOM、中ほどが埋め込みデータ・ライブラリ、末尾の即時関数がアプリ本体。巨大なJSONやminifiedライブラリを検索対象に含めないよう、保守時は関数名で対象を絞ると読みやすい。

```bash
rg -n '^function |^const home=|globeDiagnostics' dist/index.html
```

`globeDiagnostics` からは `renderer`、`worker`、`q`、`view`、`sun`、`live`、`simTime`、`currentFrame`、描画時間、待機状態などを確認できる。公開アプリの正式な設定APIではなく、検証用の情報である。

## 9. 起動と検証

### 9.1 ローカル起動

`dist/index.html` をブラウザで直接開く。HTTP配信が必要な場合だけ、作業ディレクトリから以下を実行する。

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

[http://127.0.0.1:8000/](http://127.0.0.1:8000/) にアクセスする。リモート環境の場合は、その環境のポート転送を別途使う。制作時の自動検証は主に `file://` を使用した。

### 9.2 構文・データ確認

作業ディレクトリで、全インラインJavaScriptと地図JSONを確認する。

```bash
node <<'NODE'
const fs = require('node:fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (match[1].includes('application/json')) JSON.parse(match[2]);
  else new Function(match[2]);
}
console.log('Scripts and embedded map data: OK');
NODE

git diff --check
```

### 9.3 ブラウザ検証の環境と実行記録

PlaywrightでChromiumを `--disable-gpu` 付きで起動し、ページ側でもWebGL / WebGPUのコンテキスト要求を検出する検証を行った。記録されたコンテキストは `2d` のみだった。

制作時の検証スクリプトは次の一時ファイルに置いた。これらはアプリの同梱物ではなく、作業環境の `/tmp` が消えると失われる。

| スクリプト | 検証対象 |
| --- | --- |
| `/tmp/globe-qa.cjs` | 初期CPU版の地図、ドラッグ、ピンチ、Workerなしの代替描画 |
| `/tmp/globe-time-qa.cjs` | 最終時間連動版の日時、自転、季節、マウス追従、陰影、オフライン動作 |
| `/tmp/globe-time-layout.cjs` | 実際の時計更新、複数画面サイズの重なり・はみ出し |

同じ制作環境にファイルが残っている場合の実行例：

```bash
node /tmp/globe-time-qa.cjs
node /tmp/globe-time-layout.cjs
```

これらのスクリプトには制作環境固有のPlaywrightのrequireパスとHTMLの絶対パスが含まれる。他の環境へ持ち出す際は、`require('playwright')` とその環境のHTMLパスへ変更する。初期CPU版のスクリプトには時間連動前の前提もあるため、最終版の回帰検証には時間連動版の2本を使う。

最小限のブラウザ確認を再作成する場合は、アプリとは別のQA用ディレクトリへ `playwright@1.64.1` を入れる。Chromiumの導入は3.3節を参照。

```bash
globe_qa_dir="$(mktemp -d)"
cd "$globe_qa_dir"
npm install --save-exact playwright@1.64.1
```

次の例を、そのQA用ディレクトリの `globe-smoke.cjs` として保存する。

```javascript
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() =>
      window.globeDiagnostics?.renderCount > 0 &&
      !globeDiagnostics.busy && !globeDiagnostics.pending);
    console.log(await page.evaluate(() => globeDiagnostics));
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() =>
      !globeDiagnostics.live && !globeDiagnostics.busy && !globeDiagnostics.pending);
    await page.screenshot({ path: 'globe-check.png' });
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
```

実行時にHTMLのパスを渡す。

```bash
node globe-smoke.cjs /content/drive/MyDrive/work/dist/index.html
```

制作環境では管理されたコンテナ内で `--no-sandbox` も指定したが、通常の環境ではブラウザのサンドボックスを有効にして使用する。

### 9.4 確認した結果

CPU版構築時には、東京・デリー・パリ・ニューアーク・シドニー・マダガスカル・南極の陸地判定と、太平洋・大西洋・インド洋・日付変更線付近の海判定を確認した。2本指操作で約1.67倍の拡大とひねり回転ができ、Workerなしでも表示できた。

最終時間連動版では、時刻を `2026-03-20T14:30:00Z` に固定して以下を確認した。

| 検証 | 結果 |
| --- | --- |
| 初期の日本時間 | 2026/03/20 23:30:00 |
| `→` を1回 | 2026/03/21 00:30:00へ日付を繰り上げ |
| 1時間の姿勢差 | 約15.0034°。観察者の `view` は不変 |
| 1時間前に戻す | 日時と地球姿勢が元に戻る |
| `Shift + ↑` | 30日後へ移動。赤緯と地軸の見かけが変化 |
| マウス回転 | 日時は不変。太陽方向・境界が追従し、地理上の昼夜は維持 |
| 陰影と太陽方向の一致 | サンプル18,482点の海の画素で不一致0 |
| リセット | 表示日時を変えず、初期視点と倍率へ戻る |
| スライダーでの矢印操作 | 表示日時を変えない |
| 現在へ | ライブ表示へ復帰 |
| 実時計 | 秒表示が実際に更新される |
| 実行時HTTP依存 | 外部HTTPリクエストなし |
| ページエラー | 検証中0件 |

春分・夏至・秋分・冬至付近の太陽赤緯も確認し、夏至・冬至付近では約±23.4355°となった。地理上の太陽直下点をモデル座標へ回した方向と、モデルの太陽方向の一致も数値確認した。

画面サイズは1440×1000、1440×900、1280×720、1024×600、768×1024、390×844、320×568を使用。時計、見出し、操作部の重なりと横方向のはみ出しを確認した。

## 10. Sitesへの公開

### 10.1 配信設定

[.openai/hosting.json](.openai/hosting.json) は次の内容。

```json
{
  "project_id": "appgprj_6adb0d0ab52081918e504a8413f0586f",
  "static": {
    "directory": "dist"
  }
}
```

プロジェクトIDは既存サイトの識別子としてそのまま再利用する。更新のたびに新しいサイトを作らない。公開処理と閲覧権限は別であり、今回のデプロイで非公開の閲覧範囲を変更していない。

### 10.2 実施したワークフロー

以下はSitesプラグインのツールと補助スクリプトを使った手順。一般のシェルだけでSitesの認証やデプロイを完結させる手順ではない。

1. `get_site` で既存サイトと閲覧範囲を確認する。
2. `create_source_repository_write_credential` で短期のソース書き込み資格情報を取得する。
3. ソース補助スクリプトを開くモードで実行し、返されたソース・コミットを確認する。
4. HTMLを編集し、ローカルで検証する。
5. 同じ補助スクリプトでソースをcommit / pushし、配信用アーカイブを作る。
6. 所有者限定サイト用の `save_version_and_deploy_private` に、検証したコミットと対応するアーカイブを渡す。
7. `status: succeeded` とURLを確認する。非終端状態の場合だけ `get_deployment_status` で追跡する。

使用した補助スクリプトの起動コマンド：

```bash
node /content/drive/MyDrive/codex/plugins/cache/openai-curated-remote/sites/1.1.1/scripts/site-workflow.mjs \
  --project-id appgprj_6adb0d0ab52081918e504a8413f0586f
```

TTY付きで起動し、`Ready for Site workflow JSON on stdin (input is hidden).` を受け取ってから、資格情報を含むJSONを標準入力で渡す。

開くときは `credential` を渡し、`archivePath` を付けない。公開用パッケージ作成時の入力構造は次のとおり。これはオーケストレーター上のJavaScriptの例で、資格情報そのものを文書やファイルへ保存しない。

```javascript
const payload = {
  credential,       // Sitesが返したオブジェクト。セッションのメモリ内だけで保持
  source: opened,  // 開くモードが返した結果をそのまま渡す
  commands: [],    // ビルドなし。必要な検証は先に完了させる
  archivePath: '/content/drive/MyDrive/night-globe-time-v4.tar.gz',
};

await tools.write_stdin({
  session_id,
  chars: JSON.stringify(payload) + '\n',
});
```

アーカイブはソースのチェックアウト外、または無視対象の出力ディレクトリに置く。制作初期にチェックアウト直下を指定して拒否されたため、最終版ではワークスペース外の上記パスを使った。後続版では別のアーカイブ名を使うと履歴を保持しやすい。

補助スクリプトが返した `project_id`、`commit_sha`、`archive` をそのまま次へ渡す。

```javascript
await tools.mcp__codex_apps__sites_save_version_and_deploy_private({
  project_id: packaged.project_id,
  commit_sha: packaged.commit_sha,
  archive: packaged.archive,
});
```

資格情報のトークンをコマンド引数、ディスク、ログへ出さない。アーカイブは保存成功まで変更しない。資格情報が失効した場合は同じプロジェクトで再取得する。

### 10.3 最終公開の記録

| 項目 | 値 |
| --- | --- |
| ソースコミット | `61d932b9fab3a777308aafc856c36bdde5e711b0` |
| 保存バージョンID | `appgprj_6adb0d0ab52081918e504a8413f0586f~appgver_47e0fb8c6cac81918eb6b5792c442d35` |
| デプロイID | `appgdep_6adb1f37a0c881918ca6c8b2f383391f` |
| 成功応答の日時 | 2026-10-23 08:47:58 UTC |
| 状態 | `succeeded` |
| URL | https://night-globe-jp.mintymoon64.chatgpt.site |
| アーカイブ | `/content/drive/MyDrive/night-globe-time-v4.tar.gz` |
| アーカイブサイズ | 209,410 bytes |

旧版で公開サービス側の不明なエラーが出た際は、既に保存された同じバージョンを `deploy_private_site_version` で再デプロイして成功した。保存済みバージョンがある場合は、同じ内容を改めて保存・新規登録する前に、そのバージョンの状態を確認する。

## 11. 保守時の確認事項

- マウス操作と時間操作の責務を保つ。キー操作で直接 `view` を回さない。
- 地球・地軸・太陽・境界の座標系と、フレームのスナップショットをそろえる。
- 法線のキャッシュと、時々刻々変わる照明を混同しない。
- 実行時の外部CDN参照を加えない。地図やライブラリ更新時も必要なコードとライセンスをHTMLへ埋め込む。
- HTMLへの埋め込み後に、JavaScript構文とJSONを確認する。
- 日付の繰り上がり・繰り下がり、季節、入力欄内のキー操作、現在へ、リセットの意味を回帰確認する。
- CPU描画時間と、停止後の高精細化の両方を見る。計算時間と体感の入力遅延は区別する。
- 公開する場合は同じSite IDと閲覧範囲を維持し、ソースコミットと配信アーカイブを一致させる。

## 12. 参照資料

- [Natural Earth](https://www.naturalearthdata.com/)
- [Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/)
- [World Atlas TopoJSON](https://github.com/topojson/world-atlas)
- [USNO: Computing Approximate Solar Coordinates](https://aa.usno.navy.mil/faq/sun_approx)
- [USNO: Computing Approximate Sidereal Time](https://aa.usno.navy.mil/faq/GAST)

制作環境のSites運用手順は `/content/drive/MyDrive/codex/plugins/cache/openai-curated-remote/sites/1.1.1/skills/sites/SKILL.md` にある。プラグインの配置・版が変わった場合は、現在の手順と補助スクリプトのパスを確認してから公開する。
