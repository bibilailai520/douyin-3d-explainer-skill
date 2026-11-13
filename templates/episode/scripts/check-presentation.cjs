const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), ts = require('typescript');
const root = path.resolve(__dirname, '..'), modules = new Map();
function load(file) {
  const full = path.resolve(root, file);
  if (modules.has(full)) return modules.get(full).exports;
  if (full.endsWith('.json')) return JSON.parse(fs.readFileSync(full, 'utf8'));
  const mod = {exports: {}}; modules.set(full, mod);
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, resolveJsonModule: true, esModuleInterop: true}}).outputText;
  const localRequire = name => {
    if (!name.startsWith('.')) return require(name);
    let target = path.resolve(path.dirname(full), name);
    if (!path.extname(target)) target += '.ts';
    return load(path.relative(root, target));
  };
  new Function('exports', 'module', 'require', code)(mod.exports, mod, localRequire);
  return mod.exports;
}
const {chapterStateAt} = load('src/chapter-state.ts');
assert.equal(chapterStateAt([], 24, 0), null);
for (const n of [1, 3, 5, 7]) {
  const chapters = Array.from({length: n}, (_, i) => ({at: i * 2, text: `Chapter ${i + 1}`}));
  for (let f = 0; f <= n * 2 * 30; f++) {
    const t = f / 30, state = chapterStateAt(chapters, n * 2, t), index = Math.min(n - 1, Math.floor(t / 2));
    assert.equal(state.index, index); assert.equal(state.total, n); assert.equal(state.chapter, chapters[index]);
    state.progress.forEach((p, i) => {assert.ok(p >= 0 && p <= 1); if (i < index) assert.equal(p, 1); if (i > index) assert.equal(p, 0);});
  }
  assert.ok(chapterStateAt(chapters, n * 2, n * 2).progress.every(p => p === 1));
}
const {entrancePose} = load('src/motion.ts');
assert.ok(entrancePose(1 / 30, 0).scale < entrancePose(0, 0).scale, 'Pullback must move on the first frame');
assert.ok(Math.abs(entrancePose(4.15, 0).scale - 1) < 1e-9);
console.log('Presentation: 1/3/5/7 chapters, frame boundaries, final state, immediate pullback passed');
