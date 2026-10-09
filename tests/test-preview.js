const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(0, async () => {
  const PORT = server.address().port;
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const { chromium } = require('playwright');
    let browser;
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch (e1) {
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
      } catch (e2) {
        browser = await chromium.launch({ headless: true });
      }
    }

    const pagesToTest = [
      { name: 'home', path: '/index.html' },
      { name: 'about', path: '/about.html' },
      { name: 'treatments', path: '/treatments.html' },
      { name: 'contact', path: '/contact.html' }
    ];

    const viewports = [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'mobile-390', width: 390, height: 844 },
      { name: 'mobile-320', width: 320, height: 600 }
    ];

    const outDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    for (const testPage of pagesToTest) {
      console.log(`\n--- Testing ${testPage.name.toUpperCase()} (${testPage.path}) ---`);

      for (const vp of viewports) {
        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height }
        });

        page.on('console', msg => {
          if (msg.type() === 'error') console.log(`[Browser Error ${testPage.name} ${vp.name}]:`, msg.text());
        });
        page.on('pageerror', err => console.log(`[Page Error ${testPage.name} ${vp.name}]:`, err.message));

        const res = await page.goto(`http://localhost:${PORT}${testPage.path}`, { waitUntil: 'networkidle' });
        console.log(`Loaded ${testPage.name} at ${vp.name} (Status: ${res.status()})`);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        if (overflow) {
          console.error(`OVERFLOW DETECTED: ${testPage.name} at ${vp.name}!`);
        }

        // Trigger reveal elements and force-load all images
        await page.evaluate(async () => {
          document.querySelectorAll('.reveal-fade').forEach(el => el.classList.add('revealed'));
          document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.loading = 'eager';
          });
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(400);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);

        const shotPath = path.join(outDir, `${testPage.name}-${vp.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: true });
        console.log(`Saved screenshot: ${shotPath}`);
        await page.close();
      }
    }

    await browser.close();
    console.log('\nAll 4 pages tested and screenshots captured successfully!');
  } catch (err) {
    console.error('Playwright execution error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
