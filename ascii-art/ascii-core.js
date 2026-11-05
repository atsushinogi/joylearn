/* 画像のピクセル列を文字に変換する純粋ロジック（DOMに依存しない） */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AsciiCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MIN_SIZE = 1;
  const MAX_SIZE = 400;
  // 一般的な等幅フォントの1文字は「幅:高さ = 1:2」に近い。
  const CELL_ASPECT = 0.5;
  // うすい文字 → こい文字 の順。
  const DEFAULT_RAMP = ' .:-=+*#%@';
  // 文字は縦長なので、ドットを四角く見せるには1ドットをよこ2文字にする。
  const DOT_COLS = 2;

  function clampSize(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return MIN_SIZE;
    return Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));
  }

  /* 列数から、画像の縦横比を保つ行数を求める。行数が上限を超えたら列数も縮める。 */
  function sizeFromCols(cols, imageWidth, imageHeight) {
    const ratio = (imageHeight / imageWidth) * CELL_ASPECT;
    const c = clampSize(cols);
    const r = Math.round(c * ratio);
    if (r > MAX_SIZE) return { cols: clampSize(MAX_SIZE / ratio), rows: MAX_SIZE };
    return { cols: c, rows: clampSize(r) };
  }

  /* 行数から、画像の縦横比を保つ列数を求める。列数が上限を超えたら行数も縮める。 */
  function sizeFromRows(rows, imageWidth, imageHeight) {
    const ratio = (imageHeight / imageWidth) * CELL_ASPECT;
    const r = clampSize(rows);
    const c = Math.round(r / ratio);
    if (c > MAX_SIZE) return { cols: MAX_SIZE, rows: clampSize(MAX_SIZE * ratio) };
    return { cols: clampSize(c), rows: r };
  }

  /* サロゲートペアを壊さないよう、コードポイント単位で分割する。 */
  function parseRamp(text) {
    const chars = Array.from(text || '');
    return chars.length ? chars : Array.from(DEFAULT_RAMP);
  }

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }

  /**
   * 拡大されたドット絵の「1ドットの一辺（ピクセル数）」を求める。
   * 同じ色が続く長さの最大公約数を使うので、ピクセルが完全にそろった画像だけ検出できる。
   * 写真やJPEGのノイズがある画像では 1 を返す。
   */
  function detectDotSize(pixels, width, height) {
    const sameColor = (a, b) => {
      if (pixels[a + 3] === 0 && pixels[b + 3] === 0) return true; // 透明どうしは色を問わない。
      return pixels[a] === pixels[b] && pixels[a + 1] === pixels[b + 1]
        && pixels[a + 2] === pixels[b + 2] && pixels[a + 3] === pixels[b + 3];
    };
    let size = 0;
    const scan = (lines, length, offset) => {
      for (let line = 0; line < lines; line++) {
        let run = 1;
        for (let i = 1; i < length; i++) {
          if (sameColor(offset(line, i - 1), offset(line, i))) {
            run++;
          } else {
            size = gcd(size, run);
            if (size === 1) return;
            run = 1;
          }
        }
        size = gcd(size, run);
        if (size === 1) return;
      }
    };
    scan(height, width, (y, x) => (y * width + x) * 4);
    if (size !== 1) scan(width, height, (x, y) => (y * width + x) * 4);
    return size || 1;
  }

  /**
   * 1ドットを「よこ2文字×たて1行」に割り当てるサイズを求める。
   * 上限を超える大きな画像は同じ比率のまま縮め、exact を false にする。
   */
  function dotFitSize(width, height, dotSize) {
    const dotsWide = Math.max(1, Math.round(width / dotSize));
    const dotsHigh = Math.max(1, Math.round(height / dotSize));
    const cols = dotsWide * DOT_COLS;
    const rows = dotsHigh;
    if (cols <= MAX_SIZE && rows <= MAX_SIZE) return { cols, rows, dotsWide, dotsHigh, exact: true };
    const shrink = Math.max(cols, rows) / MAX_SIZE;
    return {
      cols: clampSize(cols / shrink),
      rows: clampSize(rows / shrink),
      dotsWide,
      dotsHigh,
      exact: false,
    };
  }

  /**
   * RGBAピクセル列を文字列に変換する。出力は必ず rows 行・各行 cols 文字（行末の空白も残す）。
   * @param {Uint8ClampedArray|number[]} pixels 幅×高さ×4 のRGBA
   * @param {number} width
   * @param {number} height
   * @param {{cols:number, rows:number, ramp?:string, background?:'light'|'dark',
   *          brightness?:number, contrast?:number, sampling?:'average'|'nearest'}} options
   *   sampling: 'average' は範囲の平均（写真向け）、'nearest' は中央の1ピクセル（色を混ぜない）
   */
  function imageToAscii(pixels, width, height, options) {
    const { cols, rows, background = 'light', brightness = 0, contrast = 1, sampling = 'average' } = options;
    const ramp = parseRamp(options.ramp);
    const onDark = background === 'dark';
    // 透明部分は、表示する背景の色に溶け込ませる。
    const backdrop = onDark ? 0 : 255;
    const nearest = sampling === 'nearest';
    const lines = new Array(rows);

    for (let row = 0; row < rows; row++) {
      const y0 = Math.floor(((row + (nearest ? 0.5 : 0)) * height) / rows);
      const y1 = nearest ? y0 + 1 : Math.max(y0 + 1, Math.floor(((row + 1) * height) / rows));
      let line = '';
      for (let col = 0; col < cols; col++) {
        const x0 = Math.floor(((col + (nearest ? 0.5 : 0)) * width) / cols);
        const x1 = nearest ? x0 + 1 : Math.max(x0 + 1, Math.floor(((col + 1) * width) / cols));
        let sum = 0;
        let count = 0;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const i = (y * width + x) * 4;
            const alpha = pixels[i + 3] / 255;
            const luma = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
            sum += luma * alpha + backdrop * (1 - alpha);
            count++;
          }
        }
        const adjusted = (sum / count - 128) * contrast + 128 + brightness;
        const level = Math.min(1, Math.max(0, adjusted / 255));
        // 白い背景では暗い部分を、黒い背景では明るい部分を、こい文字にする。
        const ink = onDark ? level : 1 - level;
        line += ramp[Math.min(ramp.length - 1, Math.floor(ink * ramp.length))];
      }
      lines[row] = line;
    }
    return lines.join('\n');
  }

  return { MIN_SIZE, MAX_SIZE, CELL_ASPECT, DEFAULT_RAMP, clampSize, sizeFromCols, sizeFromRows, parseRamp, detectDotSize, dotFitSize, imageToAscii };
});
