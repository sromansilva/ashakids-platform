// Extract public, editorial game text only. Run from the repository root.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const ts = require('../../frontend/node_modules/typescript');
const root = 'frontend/src/pages/padre/Sessions/WordGames';
function evaluate(source) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: module.exports });
  return module.exports;
}
function constant(file, name) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let value;
  function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) value = node.initializer.getText(source); ts.forEachChild(node, visit); }
  visit(source); if (!value) throw new Error(`Missing ${name}`);
  return evaluate(`export const value = ${value}`).value;
}
const { words, wordGames, vocabulary, rhymes, sentenceRounds } = evaluate(fs.readFileSync(path.join(root, 'wordContent.ts'), 'utf8'));
const texts = new Map();
function add(text) { const key = text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es'); if (key) texts.set(key, text); }
add('Hola. Vamos a descubrir palabras juntos. Escucha y juega a tu ritmo.');
for (const game of wordGames) { add(game.goal); add(`${game.goal} ${game.steps.join(' ')}`); }
const syllableSteps = ['Escucha la palabra por partes.', 'Toca los trocitos en orden.', 'Escucha la palabra que has construido.'];
add(`${wordGames.find(g => g.id === 'syllables').goal} ${syllableSteps.join(' ')}`);
for (const word of Object.values(words)) add(word.name);
for (const round of vocabulary) { add(round.clue); add(round.hint); }
for (const round of rhymes) {
  add(`Escucha: ${words[round.target].name}. Busca una palabra que termine parecido.`);
  add(`${words[round.target].name} y ${words[round.answer].name} terminan en ${round.ending}.`);
  for (const id of round.options) add(`${words[round.target].name}. ${words[id].name}.`);
}
for (const pair of constant('DiscoveryGames.tsx', 'opposites')) {
  add(pair.left); add(pair.right); add(pair.hint); add(`Mira: ${pair.left}. Busca lo contrario.`);
}
add('Mira dónde están los dibujos iguales. Cuando estés listo, toca Ya las vi.');
add('Toca dos cartas y busca los dibujos iguales.');
for (const word of Object.values(words).filter(word => ['animal', 'fruta', 'transporte'].includes(word.category))) {
  add(`¿Dónde va ${word.name.toLowerCase()}? Toca su cesta.`);
  add(`${word.name} va con ${{ animal: 'animales', fruta: 'frutas', transporte: 'transportes' }[word.category]}. Mira el dibujo de esa cesta.`);
}
add('¡Todos los dibujos están en su familia!');
for (const amount of [2, 3, 4, 5]) {
  add(`Hay ${amount} amigos. Necesitamos ${amount} piezas de merienda: una para cada uno.`);
  add(`Vienen ${amount} amigos. Pon una pieza de merienda para cada uno.`);
}
for (const target of constant('MovementGames.tsx', 'positions')) {
  add(`El ${words[target.id].name.toLowerCase()} quiere estar ${target.label}. Llévalo allí.`);
  add(`Mira el ejemplo: tu amigo está ${target.label}.`);
}
for (const id of constant('PuzzleGames.tsx', 'syllablePool')) {
  const word = words[id];
  for (const part of word.syllables) add(part);
  add(`Escucha ${word.name}. Toca una palmada por cada trocito de la palabra.`);
  add(word.syllables.join('. ') + '.');
  add(`${word.name}: ${word.syllables.join(', ')}. Son ${word.syllables.length} trocitos.`);
  add(`Escucha por partes: ${word.syllables.join('. ')}. Junta los trocitos para formar ${word.name}.`);
  add(`${word.name} se forma así: ${word.syllables.join(', ')}.`);
}
for (const round of sentenceRounds) {
  add(round.phrase); for (const word of round.words) add(word);
  add(`Vamos a contar: ${round.phrase} Elige primero quién, después qué hace y al final dónde o qué.`);
  add(`Primero ${round.words[0].toLowerCase()}, después ${round.words[1]}, al final ${round.words[2]}.`);
}
add('con un libro');
for (const story of constant('StoryGame.tsx', 'stories')) {
  for (const step of story.steps) add(step.text);
  add(`${story.title}. Mira las tres imágenes. ¿Qué pasa primero, después y al final?`);
  add(story.steps.map((step, i) => `${['Primero', 'Después', 'Al final'][i]}, ${step.text.toLowerCase()}`).join('. ') + '.');
}
const clips = [...texts].map(([key, text]) => ({ key, text, file: crypto.createHash('sha256').update(key).digest('hex').slice(0, 16) + '.mp3' }));
fs.mkdirSync('tmp/voice-v106', { recursive: true });
fs.writeFileSync('tmp/voice-v106/texts.json', JSON.stringify(clips, null, 2));
console.log(`${clips.length} public game phrases prepared`);
