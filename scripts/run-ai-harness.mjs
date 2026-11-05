import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const repoRoot = process.cwd();
const venvPythonWin = path.join(repoRoot, 'ml-service', '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(repoRoot, 'ml-service', '.venv', 'bin', 'python');

const pythonExe = fs.existsSync(venvPythonWin) ? venvPythonWin : fs.existsSync(venvPythonUnix) ? venvPythonUnix : 'python';

const runner = spawn(pythonExe, ['-m', 'harness.runner'], {
  cwd: path.join(repoRoot, 'ml-service'),
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    PYTHONUTF8: '1',
  },
});

runner.on('close', (code) => {
  process.exit(code ?? 0);
});
