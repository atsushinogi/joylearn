const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { templates, sources, createQuestion, grade } = require('../questions.js');
const { renderDiagram } = require('../diagrams.js');

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('all 19 source figures are represented across 11 spring and 13 buoyancy questions', () => {
  assert.equal(templates.length, 24);
  assert.equal(templates.filter(q => q.category === 'spring').length, 11);
  assert.equal(templates.filter(q => q.category === 'buoyancy').length, 13);
  assert.equal(sources.length, 19);
  assert.deepEqual(new Set(templates.map(q => q.source)), new Set(sources.map(q => q.id)));
  for (const source of sources) assert.ok(fs.existsSync(path.join(__dirname, '..', source.image)));
});

test('4,800 generated questions have four unique choices, one correct answer, and readable diagrams', () => {
  const random = seededRandom(20261107);
  for (const template of templates) {
    const answers = new Set();
    const positions = new Set();
    let previous = '';
    for (let i = 0; i < 200; i++) {
      const q = createQuestion(template.id, random, previous);
      assert.equal(q.options.length, 4, q.id);
      assert.equal(new Set(q.options).size, 4, q.id);
      assert.equal(q.options.filter(option => option === q.answer).length, 1);
      assert.equal(q.options.filter((_, index) => grade(q, index)).length, 1);
      assert.notEqual(q.signature, previous, `Repeated values: ${q.id}`);
      assert.ok(q.prompt && q.explanation && q.facts && q.sourceInfo);
      const svg = renderDiagram(q);
      assert.ok(svg.startsWith('<svg'));
      assert.ok(!/NaN|undefined|Infinity/.test(svg), q.id);
      if (typeof q.answer === 'number') {
        assert.ok(Number.isInteger(q.answer), q.id);
        assert.ok(q.answer > 0 && q.answer <= 500, q.id);
        assert.ok(q.options.every(option => Number.isInteger(option) && option >= 0));
      }
      answers.add(q.answer);
      positions.add(q.options.indexOf(q.answer));
      previous = q.signature;
    }
    assert.ok(answers.size >= 3, `${template.id} needs varied answers`);
    assert.equal(positions.size, 4, `${template.id} should shuffle correct choices`);
  }
});

test('spring extension follows proportionality, series addition, and parallel load sharing', () => {
  const random = seededRandom(123);
  for (let i = 0; i < 100; i++) {
    const serial = createQuestion('series', random);
    assert.equal(serial.answer / serial.data.n, serial.data.extension);
    const parallel = createQuestion('parallel', random);
    assert.equal(parallel.answer * 2, parallel.data.single);
    const cut = createQuestion('cut', random);
    assert.equal(cut.answer * 2, cut.data.natural + cut.data.whole);
    const total = createQuestion('series-total', random);
    assert.equal(total.answer / 2 - total.data.base, total.data.extension);
    for (const id of ['pulley', 'forces']) {
      const q = createQuestion(id, random);
      assert.equal(q.answer, q.data.extension, 'Opposite pulls do not double tension');
    }
  }
});

test('buoyancy and scale readings conserve the supported weight', () => {
  const random = seededRandom(456);
  for (let i = 0; i < 100; i++) {
    for (const id of ['water', 'check-full', 'check-half']) {
      const q = createQuestion(id, random);
      const displacedWaterWeight = q.data.volume * (id === 'check-half' ? 0.5 : 1);
      assert.equal(q.answer + displacedWaterWeight, q.data.weight);
      assert.ok(q.answer > 0);
    }
    for (const id of ['scale-full', 'scale-half']) {
      const q = createQuestion(id, random);
      const buoyancy = q.data.volume * (id === 'scale-half' ? 0.5 : 1);
      const springReading = q.data.weight - buoyancy;
      assert.equal(q.answer + springReading, q.data.weight + q.data.container);
    }
    const bottom = createQuestion('scale-bottom', random);
    assert.equal(bottom.answer, bottom.data.weight + bottom.data.container);
    const floating = createQuestion('float', random);
    assert.equal(floating.answer, floating.data.floatWeight);
    assert.ok(floating.answer < floating.data.floatVolume);
    const pressure = createQuestion('pressure', random);
    assert.equal(pressure.answer + pressure.data.down, pressure.data.up);
    const volume = createQuestion('volume', random);
    assert.equal(volume.answer + volume.data.v * 3, volume.data.weight);
  }
});

test('released objects float, suspend, or sink according to density', () => {
  const random = seededRandom(789);
  const outcomes = new Set();
  for (let i = 0; i < 100; i++) {
    const q = createQuestion('release', random);
    const density = q.data.releaseWeight / q.data.volume;
    assert.equal(q.answer, density < 1 ? '水面に浮く' : density === 1 ? '水中にとどまる' : '底にしずむ');
    outcomes.add(q.answer);
  }
  assert.equal(outcomes.size, 3);
});

test('unknown question IDs fail clearly', () => {
  assert.throws(() => createQuestion('missing'), /Unknown template/);
});
