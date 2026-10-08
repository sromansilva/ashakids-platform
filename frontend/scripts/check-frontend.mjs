import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const root = fileURLToPath(new URL("..", import.meta.url));
const src = path.join(root, "src");
const ignored = new Set(["node_modules", "dist", ".git", ".vite"]);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    ignored.has(entry.name) ? [] : entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const files = walk(root).filter(file => /\.(tsx?|jsx?|mjs|cjs|css|html|json|ya?ml)$/.test(file)
  && path.basename(file) !== "package-lock.json");
const errors = [];
let largest = { file: "", lines: 0 };
function resolve(specifier, from) {
  const base = specifier.startsWith("@/") ? path.join(src, specifier.slice(2))
    : specifier.startsWith(".") ? path.resolve(path.dirname(from), specifier) : null;
  if (!base) return null;
  return ["", ".ts", ".tsx", ".js", ".mjs", ".css", "/index.ts", "/index.tsx"].map(ext => base + ext)
    .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
}
for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const count = code.split(/\r?\n/).length - (code.endsWith("\n") ? 1 : 0);
  if (count > largest.lines) largest = { file: relative, lines: count };
  if (count > 500) errors.push(`${relative}: ${count} lines (maximum 500)`);
  if (/(?:^|\n)(<<<<<<< |=======\s*\n|>>>>>>> )/.test(code)) errors.push(`${relative}: merge markers`);
  if (file.startsWith(src + path.sep) && /\bfetch\s*\(/.test(code) && relative !== "src/api/client.ts") errors.push(`${relative}: fetch outside HTTP client`);
  if (/\.(tsx?|jsx?|mjs|cjs)$/.test(file)) {
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    function check(node) {
      let specifier;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) specifier = node.moduleSpecifier.text;
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) specifier = node.arguments[0].text;
      if (specifier && (specifier.startsWith(".") || specifier.startsWith("@/"))) {
        const target = resolve(specifier, file);
        if (!target) errors.push(`${relative}: unresolved ${specifier}`);
        const ownRole = relative.match(/^src\/pages\/(padre|terapeuta|admin)\//)?.[1];
        const otherRole = target && path.relative(src, target).replaceAll(path.sep, "/").match(/^pages\/(padre|terapeuta|admin)\//)?.[1];
        if (ownRole && otherRole && ownRole !== otherRole) errors.push(`${relative}: internal dependency on ${otherRole}`);
      }
      ts.forEachChild(node, check);
    }
    check(source);
  }
}
const router = fs.readFileSync(path.join(src, "app/AppRouter.tsx"), "utf8");
const manifest = fs.readFileSync(path.join(src, "app/routeManifest.ts"), "utf8");
const declared = [...router.matchAll(/<Route\s+path="([^"]+)"/g)].map(match => match[1]).filter(route => route !== "*");
const expected = [...manifest.matchAll(/"(\/[^"\n]*)"/g)].map(match => match[1]);
if (new Set(declared).size !== declared.length) errors.push("Router: duplicate route paths");
if (declared.some(route => !expected.includes(route)) || expected.some(route => !declared.includes(route))) {
  errors.push("Router: route manifest differs from actual destinations");
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`PASS: ${files.length} files; maximum ${largest.lines} lines (${largest.file}); local imports, role boundaries and HTTP client checked.`);
