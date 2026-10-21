// Prepare only public tutorial text; no child speech or patient data is included.
const fs = require('node:fs');
const ts = require('../../frontend/node_modules/typescript');
const source = fs.readFileSync('frontend/src/pages/padre/Sessions/FluencyGames/fluencyContent.ts', 'utf8');
const evaluated = { exports: {} };
vmRun(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, evaluated);
function vmRun(code, evaluated) { require('node:vm').runInNewContext(code, { exports: evaluated.exports }); }
const { fluencyGames, fluencyDemoCues, fluencyBeatPrompts, fluencyBeatWordPrompt } = evaluated.exports;
const phrases = new Map();
function add(text) { const key = text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es'); if (key) phrases.set(key, text); }
add('Hola. Bienvenido al Ritmo de las Palabras. Aquí compartimos ideas a nuestro propio ritmo.');
for (const text of fluencyBeatPrompts) add(text);
add(fluencyBeatWordPrompt);
for (const game of fluencyGames) {
  add(game.goal);
  add(`${game.goal} ${game.steps.join(' ')}`);
  for (const text of game.steps) add(text);
  for (const text of fluencyDemoCues[game.id]) add(text);
}
const crypto = require('node:crypto');
const clips = [...phrases].map(([key, text]) => ({ key, text, file: crypto.createHash('sha256').update(key).digest('hex').slice(0, 16) + '.mp3' }));
fs.mkdirSync('tmp/voice-fluency-v1', { recursive: true });
fs.writeFileSync('tmp/voice-fluency-v1/texts.json', JSON.stringify(clips, null, 2));
console.log(`${clips.length} public fluency tutorial phrases prepared`);
