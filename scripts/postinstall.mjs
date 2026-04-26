import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function log(message) {
  console.log(`[postinstall] ${message}`);
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function syncIcons() {
  const sourceDir = path.join(rootDir, 'node_modules', 'lucide-static', 'icons');
  const targetDir = path.join(rootDir, 'assets', 'icons');

  ensureDir(targetDir);

  if (!existsSync(sourceDir)) {
    if (readdirSync(targetDir).length > 0) {
      log('lucide-static not installed; keeping committed icons.');
      return;
    }

    throw new Error('lucide-static icons are unavailable and assets/icons is empty.');
  }

  cpSync(sourceDir, targetDir, { recursive: true, force: true });
  log('synced Lucide icons.');
}

function syncMonaco() {
  const sourceDir = path.join(rootDir, 'node_modules', 'monaco-editor', 'min', 'vs');
  const monacoDir = path.join(rootDir, '_studio', 'ui', 'lib', 'monaco');
  const targetDir = path.join(monacoDir, 'vs');

  ensureDir(monacoDir);

  if (!existsSync(sourceDir)) {
    if (existsSync(targetDir)) {
      log('monaco-editor not installed; keeping committed Monaco bundle.');
      return;
    }

    throw new Error('monaco-editor bundle is unavailable and _studio/ui/lib/monaco/vs is missing.');
  }

  rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true, force: true });
  log('synced Monaco bundle.');
}

const mode = process.argv[2] ?? 'all';

if (mode === 'icons') {
  syncIcons();
} else if (mode === 'monaco') {
  syncMonaco();
} else if (mode === 'all') {
  syncIcons();
  syncMonaco();
} else {
  throw new Error(`Unknown postinstall mode: ${mode}`);
}
