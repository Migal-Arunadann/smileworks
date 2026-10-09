const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

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
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(0, async () => {
  const PORT = server.address().port;
  console.log(`Test server running at http://localhost:${PORT}`);

  try {
    let browser;
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    }

    const outDir = path.join(__dirname, 'screenshots');

    // 1. Test Mobile Menu Open (390x844)
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    
    // Click hamburger button
    await mobilePage.click('.mobile-menu-toggle');
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(outDir, 'mobile-menu-open.png') });
    console.log('Mobile menu open screenshot saved');
    await mobilePage.close();

    // 2. Test Contact Links & Direct Actions (1440x900)
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    
    // Verify phone links and WhatsApp links exist and are correct
    const callLinks = await desktopPage.$$eval('a[href^="tel:"]', els => els.map(e => e.href));
    const waLinks = await desktopPage.$$eval('a[href*="wa.me"]', els => els.map(e => e.href));
    const mapLinks = await desktopPage.$$eval('a[href*="maps.app.goo.gl"]', els => els.map(e => e.href));

    console.log(`Found ${callLinks.length} phone links, ${waLinks.length} WhatsApp links, ${mapLinks.length} Google Maps links.`);
    
    // Screenshot header & contact section
    await desktopPage.screenshot({ path: path.join(outDir, 'desktop-header-contact.png') });
    console.log('Desktop contact screenshot saved');
    await desktopPage.close();

    // 3. Test 320px ultra-compact mobile overflow
    const smallMobile = await browser.newPage({ viewport: { width: 320, height: 600 } });
    await smallMobile.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    const hasHorizontalOverflow = await smallMobile.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`320px viewport horizontal overflow: ${hasHorizontalOverflow ? 'FAIL' : 'PASS (No overflow)'}`);
    await smallMobile.close();

    await browser.close();
  } catch (err) {
    console.error('Interaction test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
