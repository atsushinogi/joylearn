'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { imageToAscii, sizeFromCols, sizeFromRows, parseRamp, clampSize, detectDotSize, dotFitSize, MAX_SIZE } = require('../ascii-core.js');

function solid(width, height, [r, g, b, a = 255]) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) pixels.set([r, g, b, a], i);
  return pixels;
}
const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];

test('出力は指定した行数・列数ぴったりになる（行末の空白も残す）', () => {
  const out = imageToAscii(solid(64, 48, WHITE), 64, 48, { cols: 13, rows: 7, ramp: ' #' });
  const lines = out.split('\n');
  assert.equal(lines.length, 7);
  for (const line of lines) assert.equal(line, ' '.repeat(13));
});

test('元画像より大きいサイズを指定しても寸法が保たれる', () => {
  const lines = imageToAscii(solid(2, 2, BLACK), 2, 2, { cols: 9, rows: 5, ramp: ' #' }).split('\n');
  assert.equal(lines.length, 5);
  for (const line of lines) assert.equal(line, '#'.repeat(9));
});

test('白い背景用は暗い部分がこい文字、黒い背景用は明るい部分がこい文字', () => {
  const ramp = ' .#';
  const opts = (background) => ({ cols: 1, rows: 1, ramp, background });
  assert.equal(imageToAscii(solid(1, 1, BLACK), 1, 1, opts('light')), '#');
  assert.equal(imageToAscii(solid(1, 1, WHITE), 1, 1, opts('light')), ' ');
  assert.equal(imageToAscii(solid(1, 1, BLACK), 1, 1, opts('dark')), ' ');
  assert.equal(imageToAscii(solid(1, 1, WHITE), 1, 1, opts('dark')), '#');
});

test('透明な部分は背景に溶け込み、空白になる', () => {
  const clear = solid(2, 2, [0, 0, 0, 0]);
  assert.equal(imageToAscii(clear, 2, 2, { cols: 1, rows: 1, ramp: ' #', background: 'light' }), ' ');
  assert.equal(imageToAscii(clear, 2, 2, { cols: 1, rows: 1, ramp: ' #', background: 'dark' }), ' ');
});

test('1つの文字には対応する範囲のピクセルの平均が使われる', () => {
  // 左半分が黒、右半分が白の4×1画像を1文字にすると中間の濃さになる。
  const pixels = new Uint8ClampedArray(16);
  pixels.set([0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
  assert.equal(imageToAscii(pixels, 4, 1, { cols: 1, rows: 1, ramp: ' .:#' }), ':');
  // 2文字にすると左右を区別できる。
  assert.equal(imageToAscii(pixels, 4, 1, { cols: 2, rows: 1, ramp: ' #' }), '# ');
});

test('明るさとコントラストが結果に反映される', () => {
  const gray = solid(1, 1, [128, 128, 128]);
  const base = { cols: 1, rows: 1, ramp: ' #' };
  assert.equal(imageToAscii(gray, 1, 1, { ...base, brightness: 100 }), ' ');
  assert.equal(imageToAscii(gray, 1, 1, { ...base, brightness: -100 }), '#');
  const dim = solid(1, 1, [100, 100, 100]);
  assert.equal(imageToAscii(dim, 1, 1, { ...base, contrast: 0 }), ' ');
});

test('文字セットはコードポイント単位で扱い、空なら標準に戻す', () => {
  assert.deepEqual(parseRamp('a😀b'), ['a', '😀', 'b']);
  assert.ok(parseRamp('').length > 1);
  assert.equal(imageToAscii(solid(1, 1, BLACK), 1, 1, { cols: 1, rows: 1, ramp: '' }), '@');
  assert.equal(imageToAscii(solid(1, 1, BLACK), 1, 1, { cols: 1, rows: 1, ramp: 'x' }), 'x');
});

test('縦横比を保つサイズ計算は文字の縦長さを補正する', () => {
  assert.deepEqual(sizeFromCols(80, 800, 600), { cols: 80, rows: 30 });
  assert.deepEqual(sizeFromRows(30, 800, 600), { cols: 80, rows: 30 });
});

test('縦横比を保ったまま上限内におさめ、最小でも1にする', () => {
  // 極端に縦長・横長の画像でも、比率を保てる範囲に両方を収める。
  assert.deepEqual(sizeFromCols(400, 100, 1000), { cols: 80, rows: MAX_SIZE });
  assert.deepEqual(sizeFromRows(400, 1000, 100), { cols: MAX_SIZE, rows: 20 });
  assert.deepEqual(sizeFromCols(10, 10000, 1), { cols: 10, rows: 1 });
  assert.deepEqual(sizeFromRows(10, 1, 10000), { cols: 1, rows: 10 });
});

test('サイズの丸めは範囲外や数値でない入力を受け付けない', () => {
  assert.equal(clampSize(0), 1);
  assert.equal(clampSize(99999), MAX_SIZE);
  assert.equal(clampSize('abc'), 1);
  assert.equal(clampSize('12.6'), 13);
});

/* dots（色の配列の配列）を scale 倍に拡大したRGBAを作る。 */
function upscale(dots, scale) {
  const height = dots.length * scale;
  const width = dots[0].length * scale;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a = 255] = dots[Math.floor(y / scale)][Math.floor(x / scale)];
      pixels.set([r, g, b, a], (y * width + x) * 4);
    }
  }
  return { pixels, width, height };
}
const CHECKER = [[BLACK, WHITE, BLACK], [WHITE, BLACK, WHITE]];

test('拡大されたドット絵から1ドットの大きさを検出する', () => {
  for (const scale of [1, 2, 7, 10]) {
    const { pixels, width, height } = upscale(CHECKER, scale);
    assert.equal(detectDotSize(pixels, width, height), scale);
  }
});

test('縦方向だけ細かい模様でも、小さいほうのドットを検出する', () => {
  const { pixels, width, height } = upscale([[BLACK, BLACK], [WHITE, WHITE]], 3);
  assert.equal(detectDotSize(pixels, width, height), 3);
});

test('透明なドットは内部の色が違っても同じ色として数える', () => {
  const { pixels, width, height } = upscale([[BLACK, WHITE]], 4);
  // 透明部分の中に、色だけ違うピクセルを混ぜる。
  for (let y = 0; y < height; y++) for (let x = 0; x < 4; x++) {
    pixels.set([(x * 40) % 255, 10, 20, 0], (y * width + x) * 4);
  }
  assert.equal(detectDotSize(pixels, width, height), 4);
});

test('ドットの区切りがない画像では 1 を返す', () => {
  const noisy = new Uint8ClampedArray(9 * 9 * 4);
  for (let i = 0; i < noisy.length; i += 4) noisy.set([i % 251, (i * 3) % 251, 0, 255], i);
  assert.equal(detectDotSize(noisy, 9, 9), 1);
});

test('1ドットはよこ2文字×たて1行に割り当てる', () => {
  assert.deepEqual(dotFitSize(320, 160, 10), { cols: 64, rows: 16, dotsWide: 32, dotsHigh: 16, exact: true });
});

test('上限を超えるドット絵は比率を保って縮め、exact を false にする', () => {
  const fit = dotFitSize(1000, 500, 1);
  assert.equal(fit.exact, false);
  assert.equal(fit.cols, MAX_SIZE);
  assert.equal(fit.rows, 100);
  assert.equal(fit.dotsWide, 1000);
  assert.equal(dotFitSize(200, 400, 1).exact, true);
  assert.equal(dotFitSize(201, 10, 1).exact, false);
});

test('nearest ではドットの色が混ざらず、1ドットが2文字×1行になる', () => {
  const { pixels, width, height } = upscale(CHECKER, 10);
  const fit = dotFitSize(width, height, 10);
  const out = imageToAscii(pixels, width, height, { cols: fit.cols, rows: fit.rows, ramp: ' .#', sampling: 'nearest' });
  assert.equal(out, '##  ##\n  ##  ');
});

test('nearest では指定サイズが元画像とずれても中間の濃さが出ない', () => {
  const { pixels, width, height } = upscale(CHECKER, 3);
  const out = imageToAscii(pixels, width, height, { cols: 5, rows: 3, ramp: ' .#', sampling: 'nearest' });
  assert.ok(!out.includes('.'), out);
  // 平均だと、同じサイズでも中間の濃さが出る（違いの確認）。
  assert.ok(imageToAscii(pixels, width, height, { cols: 5, rows: 3, ramp: ' .#' }).includes('.'));
});
