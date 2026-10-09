const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'about.html', 'treatments.html', 'contact.html'];
let missingAssets = 0;
let totalChecked = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`HTML file missing: ${file}`);
    missingAssets++;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /(href|src|srcset)=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const attr = match[1];
    const raw = match[2];
    const entries = attr === 'srcset' ? raw.split(',').map(s => s.trim().split(' ')[0]) : [raw];
    for (const url of entries) {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('#') || url.startsWith('//') || url.startsWith('data:')) {
        continue;
      }
      const cleanPath = url.split('?')[0].split('#')[0];
      if (!cleanPath) continue;
      totalChecked++;
      const fullPath = path.join(rootDir, cleanPath);
      if (!fs.existsSync(fullPath)) {
        console.error(`MISSING in ${file}: "${cleanPath}" -> not found at ${fullPath}`);
        missingAssets++;
      }
    }
  }
});

// Check css/style.css
const cssFile = path.join(rootDir, 'css', 'style.css');
if (fs.existsSync(cssFile)) {
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  const cssRegex = /url\(["']?([^"')]+)["']?\)/g;
  let cssMatch;
  while ((cssMatch = cssRegex.exec(cssContent)) !== null) {
    const url = cssMatch[1];
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('#')) continue;
    const cleanPath = url.split('?')[0].split('#')[0];
    if (!cleanPath) continue;
    totalChecked++;
    const fullPath = path.resolve(rootDir, 'css', cleanPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`MISSING in css/style.css: "${cleanPath}" -> not found at ${fullPath}`);
      missingAssets++;
    }
  }
}

console.log(`\nValidation complete:`);
console.log(`Total local asset references checked: ${totalChecked}`);
console.log(`Missing assets: ${missingAssets}`);
if (missingAssets === 0) {
  console.log('SUCCESS: All internal HTML, CSS, JavaScript, image, icon, and font references exist on disk!');
} else {
  process.exit(1);
}
