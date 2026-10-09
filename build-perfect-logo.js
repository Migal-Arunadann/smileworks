const fs = require('fs');
const path = require('path');

// Load font files as base64
const pjsFont = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'plus-jakarta-sans-600-latin.woff2')).toString('base64');

function generateLogoSvg(viewBox, width, height, smileX, toothX, toothY, toothScale, worksX, taglineY, tagfontSize) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">
  <defs>
    <style>
      @font-face {
        font-family: 'PlusJakartaSans';
        src: url('data:font/woff2;base64,${pjsFont}') format('woff2');
        font-weight: 700;
        font-style: normal;
      }
      .brand-title {
        font-family: 'PlusJakartaSans', system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 32px;
        letter-spacing: 0.05em;
      }
      .brand-tagline {
        font-family: 'PlusJakartaSans', system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: ${tagfontSize}px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        fill: #152E72;
      }
    </style>
  </defs>

  <!-- SMILE (Dimensional Shadow + Rich Crimson Face) -->
  <text x="${smileX + 1.5}" y="33.5" class="brand-title" fill="#7C1018">SMILE</text>
  <text x="${smileX}" y="32" class="brand-title" fill="#BA1A24">SMILE</text>

  <!-- Tooth Mark in Center (Clean Vector) -->
  <g transform="translate(${toothX}, ${toothY}) scale(${toothScale})">
    <!-- Tooth Outer Contour -->
    <path d="M 60 20 C 74 13, 96 14, 102 34 C 107 50, 98 68, 93 84 C 89 96, 80 108, 69 107 C 62 106, 61 93, 60 88 C 59 93, 58 106, 51 107 C 40 108, 31 96, 27 84 C 22 68, 13 50, 18 34 C 24 14, 46 13, 60 20 Z" 
          fill="#FFFFFF" stroke="#2B5EA7" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Tooth Inner Pink Smile Arc -->
    <path d="M 36 50 Q 60 76, 84 52" 
          fill="none" stroke="#BA1A24" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- WORKS (Dimensional Shadow + Rich Crimson Face) -->
  <text x="${worksX + 1.5}" y="33.5" class="brand-title" fill="#7C1018">WORKS</text>
  <text x="${worksX}" y="32" class="brand-title" fill="#BA1A24">WORKS</text>

  <!-- Tagline: Clean, Uncluttered, Centered Underneath with Breathing Room -->
  <text x="160" y="${taglineY}" text-anchor="middle" class="brand-tagline">DENTISTRY BEYOND EXPECTATIONS</text>
</svg>`;
}

const logoSvg = generateLogoSvg('0 0 320 54', 320, 54, 18, 137, 5, 0.28, 178, 48, 8.8);

fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'logo-header.svg'), logoSvg);
fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'logo-full.svg'), logoSvg);
console.log('SVGs generated successfully.');
