// pages/api/fonts/list.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    
    if (!fs.existsSync(fontsDir)) {
      return res.status(200).json({ directories: [], fontDetails: {} });
    }

    const directories = fs.readdirSync(fontsDir)
      .filter(item => {
        const itemPath = path.join(fontsDir, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .sort();

    // Build detailed font information
    const fontDetails = {};
    
    directories.forEach(dir => {
      const dirPath = path.join(fontsDir, dir);
      const files = fs.readdirSync(dirPath);
      const variants = [];
      
      // Check for each possible variant
      const variantMap = {
        'Regular.ttf': 'regular',
        'Bold.ttf': 'bold',
        'Italic.ttf': 'italic',
        'BoldItalic.ttf': 'bolditalic',
        // Add alternative naming conventions
        'regular.ttf': 'regular',
        'bold.ttf': 'bold',
        'italic.ttf': 'italic',
        'bolditalic.ttf': 'bolditalic',
        'bold-italic.ttf': 'bolditalic'
      };
      
      files.forEach(file => {
        const variant = variantMap[file] || variantMap[file.toLowerCase()];
        if (variant && !variants.find(v => v.variant === variant)) {
          variants.push({ file, variant });
        }
      });
      
      // If no standard files found, check for any .ttf files
      if (variants.length === 0) {
        const ttfFiles = files.filter(f => f.toLowerCase().endsWith('.ttf'));
        if (ttfFiles.length > 0) {
          // Assume the first .ttf file is regular
          variants.push({ file: ttfFiles[0], variant: 'regular' });
        }
      }
      
      fontDetails[dir] = variants;
    });

    return res.status(200).json({ directories, fontDetails });
  } catch (error) {
    console.error('Error reading fonts directory:', error);
    return res.status(500).json({ error: 'Failed to read fonts directory' });
  }
}