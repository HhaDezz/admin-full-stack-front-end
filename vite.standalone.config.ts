import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/* The one-file demo: `npm run build:standalone` writes dist-standalone/anjana-admin-demo.html, the whole front end
 * (scripts, styles, fonts, sample data) in a single HTML file that opens with a double-click. No server, no API.
 * Settings come from .env.standalone (demo mode on, hash routes). */

const favicon = `data:image/svg+xml;base64,${readFileSync(new URL('./public/favicon.svg', import.meta.url)).toString('base64')}`;

/** Inline the favicon and drop tags that only make sense on a hosted site. */
const standaloneHtml = (): Plugin => ({
  name: 'atelier-standalone-html',
  transformIndexHtml: (html) =>
    html
      .replace('href="/favicon.svg"', `href="${favicon}"`)
      .replace(/\s*<meta property="og:[^>]+>/g, '')
      .replace(/\s*<meta name="twitter:[^>]+>/g, ''),
});

export default defineConfig({
  mode: 'standalone',
  base: './',
  plugins: [react(), standaloneHtml(), viteSingleFile({ removeViteModuleLoader: true })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // Files in public/ (robots.txt, og.png) belong to a hosted site, not the single file.
  publicDir: false,
  build: {
    outDir: 'dist-standalone',
    emptyOutDir: true,
    // Fonts and images go inline as data URLs, whatever their size.
    assetsInlineLimit: () => true,
    chunkSizeWarningLimit: 20_000,
    reportCompressedSize: false,
  },
});
