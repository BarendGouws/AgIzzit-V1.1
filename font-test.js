// font-test.js
//
// A Node.js script to test all three font-loading approaches:
// 1) node-canvas registerFont + drawText
// 2) opentype.js load & parse
// 3) fontkit openSync
//
// Run with: node font-test.js
//

const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');
const opentype = require('opentype.js');
const fontkit = require('fontkit');

(async () => {
  const fontsRoot = path.join(__dirname, 'public', 'fonts');
  if (!fs.existsSync(fontsRoot)) {
    console.error('❌ public/fonts not found. Make sure you run this from your project root.');
    process.exit(1);
  }

  const folders = fs.readdirSync(fontsRoot)
    .filter(entry => fs.statSync(path.join(fontsRoot, entry)).isDirectory());

  console.log('🔍 Testing font folders:', folders);

  for (const folder of folders) {
    const folderPath = path.join(fontsRoot, folder);
    const familyBase = folder
      .split(/[\-_ ]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    console.log(`\n=== ${familyBase} ===`);

    const files = fs.readdirSync(folderPath)
      .filter(f => f.toLowerCase().endsWith('.ttf'));

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const suffix = file.replace(/\.ttf$/i, '');
      const variantFamily = `${familyBase} ${suffix}`;

      // 1) node-canvas registerFont + drawText
      try {
        registerFont(filePath, { family: variantFamily });
        const canvas = createCanvas(200, 50);
        const ctx = canvas.getContext('2d');
        ctx.font = `24px "${variantFamily}"`;
        ctx.fillText('Test', 10, 30);
        console.log(`✅ [canvas]   Registered & drew with "${variantFamily}"`);
      } catch (err) {
        console.error(`❌ [canvas]   ${variantFamily}: ${err.message}`);
      }

      // 2) opentype.js load
      try {
        await opentype.load(filePath);
        console.log(`✅ [opentype] Loaded "${file}"`);
      } catch (err) {
        console.error(`❌ [opentype] ${file}: ${err.message}`);
      }

      // 3) fontkit openSync
      try {
        fontkit.openSync(filePath);
        console.log(`✅ [fontkit]  Opened "${file}"`);
      } catch (err) {
        console.error(`❌ [fontkit]  ${file}: ${err.message}`);
      }
    }
  }

  console.log('\n🎉 Font tests complete.');
})();
