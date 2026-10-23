const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), crypto = require('node:crypto');
const ts = require('../../frontend/node_modules/typescript');
const folder = path.resolve('frontend/src/pages/padre/Sessions/SoundGames');
function load(file) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, require: id => load(path.resolve(path.dirname(file), id + '.ts')) });
  return exports;
}
const { soundGames } = load(path.join(folder, 'soundGames.ts'));
const texts = new Map();
function add(text) { texts.set(text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es'), text); }
add('Hola. Vamos a descubrir sonidos juntos. Escucha con calma y juega a tu ritmo.');
for (const game of soundGames) { add(game.goal); add(game.instruction); add(`${game.goal} ${game.steps.join(' ')}`); }
const clips = [...texts].map(([key, text]) => ({ key, text, file: crypto.createHash('sha256').update(key).digest('hex').slice(0, 16) + '.mp3' }));
fs.mkdirSync('tmp/sounds-v108', { recursive: true });
fs.writeFileSync('tmp/sounds-v108/texts.json', JSON.stringify(clips, null, 2));
console.log(`${clips.length} public sound instructions prepared`);
