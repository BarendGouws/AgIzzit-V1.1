const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { createCanvas } = require('canvas');

const width = 500, height = 200;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Draw a red rectangle
ctx.strokeStyle = '#f00';
ctx.lineWidth = 2;
ctx.strokeRect(10, 10, 400, 100);

// Try to load the Bodoni Moda BoldItalic font
const fontPath = path.join(__dirname, 'public', 'fonts', 'bodoni-moda', 'BoldItalic.ttf');
console.log('Font file exists:', fs.existsSync(fontPath));

const font = opentype.loadSync(fontPath);

const testText = "OpenType TEST!";
const fontSize = 60;

const pathObj = font.getPath(testText, 20, 80, fontSize);
console.log('Test path cmds:', pathObj.commands.length);
pathObj.draw(ctx);

// Save the PNG so you can inspect it
const outPath = path.join(__dirname, 'test-opentype-output.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log('Done! Saved:', outPath);
