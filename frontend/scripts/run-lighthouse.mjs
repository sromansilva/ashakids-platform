import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const url = process.env.LIGHTHOUSE_URL || process.env.E2E_BASE_URL || "http://127.0.0.1:5174/";
const reportDir = resolve(process.env.QA_REPORT_DIR || "../qa/reports/lighthouse");
mkdirSync(reportDir, { recursive: true });

const cli = resolve("node_modules", "lighthouse", "cli", "index.js");
const output = resolve(reportDir, "lighthouse-report.json");

console.log(`Ejecutando Lighthouse contra ${url}`);
execFileSync(
  process.execPath,
  [cli, url, "--output=json", `--output-path=${output}`, "--chrome-flags=--headless=new", "--quiet"],
  { stdio: "inherit" },
);
console.log(`Reporte guardado en ${output}`);
