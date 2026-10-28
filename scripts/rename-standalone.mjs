// After `vite build --config vite.standalone.config.ts`: index.html → anjana-admin-demo.html.
import { renameSync, readdirSync } from 'node:fs';
renameSync('dist-standalone/index.html', 'dist-standalone/anjana-admin-demo.html');
console.log('dist-standalone:', readdirSync('dist-standalone').join(', '));
