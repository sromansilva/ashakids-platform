// Read-only reachability inventory. Deletion is applied separately after review.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
function resolve(spec, current) {
  const base = spec.startsWith('@/') ? path.join(src, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(current), spec) : null;
  return base && ['', '.ts', '.tsx', '.css', '/index.ts', '/index.tsx'].map(e => base + e).find(f => fs.existsSync(f) && fs.statSync(f).isFile());
}
const files = walk(src);
const seen = new Set();
function visit(file) {
  if (seen.has(file)) return;
  seen.add(file);
  if (!/\.(ts|tsx|css)$/.test(file)) return;
  const code = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.css')) {
    for (const m of code.matchAll(/@import\s+["']([^"']+)/g)) { const f = resolve(m[1], file); if (f) visit(f); }
  } else {
    const tree = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    function node(n) {
      if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) { const f = resolve(n.moduleSpecifier.text, file); if (f) visit(f); }
      if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(n.arguments[0])) { const f = resolve(n.arguments[0].text, file); if (f) visit(f); }
      ts.forEachChild(n, node);
    }
    node(tree);
  }
}
visit(path.join(src, 'main.tsx'));
for (const file of walk(path.join(root, 'tests')).filter(f => /\.(tsx?|mjs)$/.test(f))) visit(file);
// API contracts and adapters deliberately reserved for the next backend task.
for (const file of files.filter(f => f.includes(path.sep + 'services' + path.sep) || f.includes(path.sep + 'types' + path.sep) || f.endsWith('.d.ts'))) visit(file);
const unused = files.filter(f => /\.(ts|tsx|css)$/.test(f) && !seen.has(f));
const retainedText = [...seen].filter(f => /\.(ts|tsx|css)$/.test(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const unusedMedia = [...files.filter(f => !/\.(ts|tsx|css)$/.test(f)), ...walk(path.join(root, 'public'))].filter(f => !retainedText.includes(path.basename(f)));
console.log(JSON.stringify({ unused: unused.map(f => path.relative(root, f).split(path.sep).join('/')), unusedMedia: unusedMedia.map(f => path.relative(root, f).split(path.sep).join('/')) }));
