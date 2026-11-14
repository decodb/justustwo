const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Where the image is saved. Use path.join(__dirname, '..', 'public') if you serve from public/
const outputDir = path.join(__dirname, '..', 'src', 'assets');

// ✏️ Edit the wording here
const TITLE = 'for_you.exe';
const LINE_1 = '> a little something';
const LINE_2 = 'just for you';
const BUTTON = 'unlock >';

// Brand colours from the SCSS
const colors = {
  black: '#121117',
  white: '#FFFFFF',
  pink: '#ff7aac',
  mint: '#3ddabe',
  yellow: '#ffe03d',
  dot: '#ececef',
  grey: '#5a5a63',
};

const FONT = "'Courier New', Consolas, monospace";
const HEART = 'M50 90C8 60 4 30 26 17c13-7 24 2 24 11 0-9 11-18 24-11 22 13 18 43-24 73Z';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function createOGImage() {
  try {
    console.log('Creating Open Graph image...');

    const width = 1200;
    const height = 630;

    // White base canvas
    const base = await sharp({
      create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .png()
      .toBuffer();

    // Everything else is drawn as an SVG overlay
    const overlaySvg = Buffer.from(`
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="${colors.dot}"/>
          </pattern>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${colors.pink}"/>
            <stop offset="50%" style="stop-color:${colors.yellow}"/>
            <stop offset="100%" style="stop-color:${colors.mint}"/>
          </linearGradient>
        </defs>

        <!-- Dot grid background + accent bars -->
        <rect width="1200" height="630" fill="url(#dots)"/>
        <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
        <rect x="0" y="622" width="1200" height="8" fill="url(#accent)"/>

        <!-- Terminal card: hard shadow, body, title bar -->
        <rect x="102" y="82" width="1020" height="490" rx="24" fill="${colors.black}"/>
        <rect x="90" y="70" width="1020" height="490" rx="24" fill="${colors.white}" stroke="${colors.black}" stroke-width="6"/>
        <path d="M90 134V94a24 24 0 0 1 24-24H1086a24 24 0 0 1 24 24V134Z" fill="${colors.black}"/>
        <circle cx="129" cy="102" r="9" fill="${colors.pink}"/>
        <circle cx="159" cy="102" r="9" fill="${colors.yellow}"/>
        <circle cx="189" cy="102" r="9" fill="${colors.mint}"/>
        <text x="225" y="110" font-family="${FONT}" font-size="24" fill="${colors.white}">access_terminal</text>

        <!-- Heart -->
        <g transform="translate(150 190) scale(3.3)">
          <path d="${HEART}" transform="translate(6 6)" fill="${colors.black}"/>
          <path d="${HEART}" fill="${colors.pink}" stroke="${colors.black}" stroke-width="4" stroke-linejoin="round"/>
        </g>

        <!-- Text -->
        <text x="520" y="300" font-family="${FONT}" font-size="76" font-weight="bold" fill="${colors.black}">${TITLE}</text>
        <text x="522" y="370" font-family="${FONT}" font-size="34" fill="${colors.grey}">${LINE_1}</text>
        <text x="562" y="416" font-family="${FONT}" font-size="34" fill="${colors.grey}">${LINE_2}</text>

        <!-- Button -->
        <rect x="522" y="470" width="320" height="50" rx="14" fill="${colors.mint}" stroke="${colors.black}" stroke-width="4"/>
        <text x="682" y="504" font-family="${FONT}" font-size="30" font-weight="bold" fill="${colors.black}" text-anchor="middle">${BUTTON}</text>
      </svg>
    `);

    // Composite everything together
    const result = await sharp(base)
      .composite([{ input: overlaySvg, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'og-image.png'));

    console.log('✅ Open Graph image created successfully!');
    console.log(`   Location: ${path.join(outputDir, 'og-image.png')}`);
    console.log(`   Size: ${result.width}x${result.height}px`);
    console.log(`   File size: ${(result.size / 1024).toFixed(2)} KB`);
    console.log('\n📱 Your image is ready for sharing!');
  } catch (error) {
    console.error('❌ Error creating Open Graph image:', error.message);
    process.exit(1);
  }
}

createOGImage();