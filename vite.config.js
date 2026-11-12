import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Stand im Titelbild: Commit und Bauzeit, damit man sieht, ob die Seite aktuell ist
const sha = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'dev'; } })();
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

// base './' sorgt dafür, dass der Build auch unter einem Unterpfad
// (z. B. GitHub Pages: https://<user>.github.io/<repo>/) funktioniert.
export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(`${sha} · ${stamp} UTC`) },
  server: { host: true, port: 5173 },
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 },
});
