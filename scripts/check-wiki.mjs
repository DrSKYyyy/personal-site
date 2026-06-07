import fs from 'node:fs';
import path from 'node:path';

// Check the tutorial index page: dist/writing/unity超详细教程/unity总教程/index.html
const baseDir = 'dist/writing/unity超详细教程/unity总教程';
const htmlPath = path.join(baseDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.log('File not found:', htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf-8');

// Find wiki-index JSON
const idxMatch = html.match(/id="wiki-index">([^<]+)<\/script>/);
if (!idxMatch) {
  console.log('wiki-index NOT found in HTML');
  process.exit(1);
}

let wikiIndex;
try { wikiIndex = JSON.parse(idxMatch[1]); } catch(e) {
  console.log('Failed to parse wiki-index:', e.message);
  process.exit(1);
}

console.log(`Wiki index: ${wikiIndex.length} entries\n`);

// Print the first 5 entries
console.log('First 5 entries:');
wikiIndex.slice(0,5).forEach(e => {
  console.log(`  "${e.title}" → /writing/${e.slug}  file: ${e.file}`);
});

// Find 脚本相关条目
const scripts = wikiIndex.filter(e => e.file && e.file.startsWith('脚本'));
console.log(`\n脚本 entries: ${scripts.length}`);
scripts.slice(0,3).forEach(e => {
  console.log(`  file: ${e.file} → slug: ${e.slug}`);
});

// Check wiki links in HTML
const linkRegex = /data-wiki="true"[^>]*/g;
let linkMatch;
let count = 0;
console.log('\nWiki link examples:');
while ((linkMatch = linkRegex.exec(html)) !== null && count < 5) {
  console.log(`  ${linkMatch[0]}`);
  count++;
}
