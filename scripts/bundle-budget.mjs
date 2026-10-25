// Fails when the JavaScript needed for the first screen (entry chunk + its static imports)
// exceeds the budget. Run after `npm run build`.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const BUDGET_KB = 150;
const dist = 'dist';
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const files = new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]));
let total = 0;
for (const f of files) {
  const kb = gzipSync(readFileSync(join(dist, f))).length / 1024;
  total += kb;
  console.log(`${kb.toFixed(1).padStart(7)} kB  ${f}`);
}
console.log(`${total.toFixed(1).padStart(7)} kB  first screen (budget ${BUDGET_KB} kB)`);
if (total > BUDGET_KB) {
  console.error('Over budget');
  process.exit(1);
}
