import { defineConfig } from 'vite';

// base './' sorgt dafür, dass der Build auch unter einem Unterpfad
// (z. B. GitHub Pages: https://<user>.github.io/<repo>/) funktioniert.
export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 },
});
