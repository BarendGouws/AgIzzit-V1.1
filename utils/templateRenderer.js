// utils/templateRenderer.js
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Try to set up font directory if it doesn't exist
const setupFontDirectory = () => {
  try {
    const fontDir = path.join(process.cwd(), 'public', 'fonts');
    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
      console.log('Created fonts directory:', fontDir);
    }
    return true;
  } catch (error) {
    console.warn('Warning: Could not set up font directory:', error.message);
    return false;
  }
};

// Setup font directory silently
setupFontDirectory();

// Helper functions
// Get template dimensions based on aspect ratio
const getTemplateDimensions = (designSize) => {
  // Default size
  const baseWidth = 1000;
  
  switch (designSize) {
    case '1:1':
      return { width: baseWidth, height: baseWidth };
    case '4:5':
      return { width: baseWidth, height: baseWidth * 5 / 4 };
    case '9:16':
      return { width: baseWidth, height: baseWidth * 16 / 9 };
    case '16:9':
      return { width: baseWidth, height: baseWidth * 9 / 16 };
    default:
      return { width: baseWidth, height: baseWidth };
  }
};

// Helper function to safely get nested property value
const getNestedPropertyValue = (obj, path) => {
  if (!path) return null;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (!value || typeof value !== 'object') return null;
    value = value[key];
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString();
  } else if (value instanceof Date) {
    return value.toLocaleDateString();
  } else if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  } else if (value) {
    return String(value);
  }
  
  return null;
};

// Extract and resize image from base64 string
const extractImageBuffer = async (dataUrl) => {
  try {
    // Extract base64 data
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URL');
    }
    
    // Convert base64 to buffer
    return Buffer.from(matches[2], 'base64');
  } catch (error) {
    console.error('Error extracting image data:', error);
    return null;
  }
};

// Create a placeholder image when no image is available
const createPlaceholderImage = async (width, height, text) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // Draw text
  ctx.fillStyle = '#999999';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width/2, height/2);
  
  return canvas.toBuffer();
};

// Function to fetch image from URL or file path
const fetchImage = async (imageUrl) => {
  try {
    if (imageUrl.startsWith('/')) {
      // Local file
      const localPath = path.join(process.cwd(), 'public', imageUrl);
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath);
      }
    } else if (imageUrl.startsWith('http')) {
      // Remote URL - use node-fetch or similar
      try {
        // For Next.js API routes, we need to use node-fetch or similar
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(imageUrl);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      } catch (err) {
        console.error('Error fetching remote image:', err);
      }
    }
    
    // If we reach here, we couldn't fetch the image
    return null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Render single template with a specific listing
const renderTemplate = async (template, listing, outputPath) => {
  try {
    console.log(`Rendering template for listing: ${listing._id}`);
    
    // Get dimensions based on template design size
    const dimensions = getTemplateDimensions(template.designSize);
    const { width, height } = dimensions;
    
    console.log(`Canvas dimensions: ${width}x${height}`);
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Process layers in reverse order (bottom to top)
    // Sort layers by their order in the template (bottom to top)
    const sortedLayers = [...template.layers].sort((a, b) => {
      // Find index in original array
      const indexA = template.layers.findIndex(l => l.id === a.id);
      const indexB = template.layers.findIndex(l => l.id === b.id);
      return indexA - indexB; // Original order (lower index first = bottom layers)
    });
    
    // Debug log
    console.log(`Processing ${sortedLayers.length} layers`);
    
    // Process each layer
    for (const layer of sortedLayers) {
      if (!layer.visible || !layer.properties) {
        console.log(`Skipping layer ${layer.id}: not visible or no properties`);
        continue;
      }
      
      console.log(`Processing layer: ${layer.type} - ${layer.id}`);
      
      switch (layer.type) {
        case 'design': {
          // Process design layer (background)
          if (layer.properties.imageData) {
            try {
              // Extract image data
              const imageBuffer = await extractImageBuffer(layer.properties.imageData);
              if (imageBuffer) {
                // Load image
                const img = await loadImage(imageBuffer);
                
                // Calculate scale to fill canvas
                const scaleX = width / img.width;
                const scaleY = height / img.height;
                const scale = Math.max(scaleX, scaleY);
                
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                
                // Center the image if needed
                const offsetX = (width - scaledWidth) / 2;
                const offsetY = (height - scaledHeight) / 2;
                
                // Draw to canvas
                ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
                console.log(`Added design layer to canvas`);
              } else {
                console.log(`Failed to process design layer image data`);
              }
            } catch (err) {
              console.error(`Error processing design layer: ${err.message}`);
            }
          }
          break;
        }
        
        case 'image': {
          // Process image container layer
          // Get the exact properties from the template
          const containerLeft = layer.properties.left || 0;
          const containerTop = layer.properties.top || 0;
          const containerWidth = (layer.properties.width || 300) * (layer.properties.scaleX || 1);
          const containerHeight = (layer.properties.height || 225) * (layer.properties.scaleY || 1);
          const containerAngle = layer.properties.angle || 0;
          
          console.log(`Container position: (${containerLeft}, ${containerTop})`);
          console.log(`Container dimensions: ${containerWidth}x${containerHeight}`);
          console.log(`Container angle: ${containerAngle}`);
          
          // Find image to use
          if (listing.images && listing.images.length > 0) {
            const imageIndex = layer.properties.imageIndex !== undefined ? 
              Math.min(layer.properties.imageIndex, listing.images.length - 1) : 0;
            
            if (imageIndex >= 0 && listing.images[imageIndex]) {
              const imageUrl = listing.images[imageIndex].url;
              
              try {
                let imageBuffer = await fetchImage(imageUrl);
                
                if (!imageBuffer) {
                  // Create a placeholder image
                  imageBuffer = await createPlaceholderImage(containerWidth, containerHeight, `Image ${imageIndex}`);
                }
                
                // Load image
                const img = await loadImage(imageBuffer);
                
                // Calculate the scaling ratio to fill the container while maintaining aspect ratio
                const imgRatio = img.width / img.height;
                const containerRatio = containerWidth / containerHeight;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (imgRatio > containerRatio) {
                  // Image is wider than container, scale to container height
                  drawHeight = containerHeight;
                  drawWidth = drawHeight * imgRatio;
                  offsetX = (containerWidth - drawWidth) / 2;
                  offsetY = 0;
                } else {
                  // Image is taller than container, scale to container width
                  drawWidth = containerWidth;
                  drawHeight = drawWidth / imgRatio;
                  offsetX = 0;
                  offsetY = (containerHeight - drawHeight) / 2;
                }
                
                // Save context state
                ctx.save();
                
                // Move to the center of where the container should be
                ctx.translate(containerLeft + containerWidth/2, containerTop + containerHeight/2);
                
                // Rotate if needed
                if (containerAngle) {
                  ctx.rotate(containerAngle * Math.PI / 180);
                }
                
                // Create clipping path for the container
                ctx.beginPath();
                ctx.rect(-containerWidth/2, -containerHeight/2, containerWidth, containerHeight);
                ctx.clip();
                
                // Draw the image within the container
                ctx.drawImage(
                  img,
                  -containerWidth/2 + offsetX,
                  -containerHeight/2 + offsetY,
                  drawWidth,
                  drawHeight
                );
                
                // Draw container border for debugging
                // ctx.strokeStyle = '#FF0000';
                // ctx.lineWidth = 2;
                // ctx.strokeRect(-containerWidth/2, -containerHeight/2, containerWidth, containerHeight);
                
                // Restore context
                ctx.restore();
                
                console.log(`Added image container to canvas: ${drawWidth}x${drawHeight}`);
              } catch (err) {
                console.error(`Error processing image: ${err.message}`);
              }
            }
          }
          break;
        }
        
        case 'picture': {
          // Process picture layer
          const left = layer.properties.left || 0;
          const top = layer.properties.top || 0;
          const originalWidth = layer.properties.width || 200;
          const originalHeight = layer.properties.height || 200;
          const scaleX = layer.properties.scaleX || 1;
          const scaleY = layer.properties.scaleY || 1;
          const picWidth = originalWidth * scaleX;
          const picHeight = originalHeight * scaleY;
          const picAngle = layer.properties.angle || 0;
          
          console.log(`Picture position: (${left}, ${top})`);
          console.log(`Picture dimensions: ${picWidth}x${picHeight}`);
          console.log(`Picture angle: ${picAngle}`);
          
          if (layer.properties.imageData) {
            try {
              // Extract image data
              const imageBuffer = await extractImageBuffer(layer.properties.imageData);
              
              if (imageBuffer) {
                // Load image
                const img = await loadImage(imageBuffer);
                
                // Calculate scaling ratio
                const imgRatio = img.width / img.height;
                const targetRatio = picWidth / picHeight;
                
                let drawWidth, drawHeight;
                
                if (imgRatio > targetRatio) {
                  // Image is wider, scale to height
                  drawHeight = picHeight;
                  drawWidth = drawHeight * imgRatio;
                } else {
                  // Image is taller, scale to width
                  drawWidth = picWidth;
                  drawHeight = drawWidth / imgRatio;
                }
                
                // Save context state
                ctx.save();
                
                // Translate to center of picture position
                ctx.translate(left + picWidth/2, top + picHeight/2);
                
                // Rotate if needed
                if (picAngle) {
                  ctx.rotate(picAngle * Math.PI / 180);
                }
                
                // Draw image centered
                ctx.drawImage(
                  img,
                  -drawWidth/2,
                  -drawHeight/2,
                  drawWidth,
                  drawHeight
                );
                
                // Restore context
                ctx.restore();
                
                console.log(`Added picture layer to canvas: ${drawWidth}x${drawHeight}`);
              }
            } catch (err) {
              console.error(`Error processing picture: ${err.message}`);
            }
          }
          break;
        }
        
        case 'text': {
          // Process text layer
          const left = layer.properties.left || 0;
          const top = layer.properties.top || 0;
          const textWidth = (layer.properties.width || 200) * (layer.properties.scaleX || 1);
          const textHeight = (layer.properties.height || 100) * (layer.properties.scaleY || 1);
          const fontSize = layer.properties.fontSize || 20;
          const color = layer.properties.color || '#000000';
          const align = layer.properties.textAlign || 'left';
          const angle = layer.properties.angle || 0;
          
          console.log(`Text position: (${left}, ${top})`);
          console.log(`Text dimensions: ${textWidth}x${textHeight}`);
          console.log(`Text fontSize: ${fontSize}, color: ${color}`);
          console.log(`Text angle: ${angle}`);
          
          // Get text content
          let textContent = '';
          if (layer.properties.variable) {
            switch (layer.properties.variable) {
              case 'price':
                if (listing.price) {
                  textContent = `R${listing.price.toLocaleString()}`;
                } else if (listing.texts && listing.texts.price) {
                  textContent = listing.texts.price;
                } else {
                  textContent = 'R0';
                }
                break;
              case 'description':
                textContent = listing.fullDescription || 
                             (listing.texts && listing.texts.description ? 
                              listing.texts.description : '');
                break;
              case 'make':
                textContent = listing.make || '';
                break;
              case 'model':
                textContent = listing.model || '';
                break;
              case 'year':
                textContent = listing.year ? listing.year.toString() : '';
                break;
              case 'title':
                textContent = [listing.year, listing.make, listing.model, listing.variant]
                  .filter(Boolean)
                  .join(' ');
                break;
              default:
                // Try to get from the texts object
                if (listing.texts && listing.texts[layer.properties.variable]) {
                  textContent = listing.texts[layer.properties.variable];
                } else {
                  // Try to get nested property value
                  textContent = getNestedPropertyValue(listing, layer.properties.variable) || '';
                }
            }
          } else if (layer.properties.text) {
            textContent = layer.properties.text;
          }
          
          if (textContent) {
            // Configure text style
            ctx.save();
            
            // Move to the text position
            ctx.translate(left, top);
            
            // Apply rotation around the top-left corner if needed
            if (angle) {
              // Move to center for rotation
              ctx.translate(textWidth/2, textHeight/2);
              ctx.rotate(angle * Math.PI / 180);
              ctx.translate(-textWidth/2, -textHeight/2);
            }
            
            // Set font style
            let fontStyle = '';
            if (layer.properties.bold) fontStyle += 'bold ';
            if (layer.properties.italic) fontStyle += 'italic ';
            if (!fontStyle) fontStyle = 'normal ';
            
            // Use the default font family
            const fontFamily = 'sans-serif';
            
            ctx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            
            // Set alignment
            if (align === 'center') {
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
            } else if (align === 'right') {
              ctx.textAlign = 'right';
              ctx.textBaseline = 'middle';
            } else {
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
            }
            
            // Handle multiline text
            const words = textContent.split(' ');
            const lineHeight = fontSize * 1.2;
            const maxLines = Math.floor(textHeight / lineHeight);
            let lines = [];
            let currentLine = words[0] || '';
            
            // Split text into lines that fit within the width
            for (let i = 1; i < words.length; i++) {
              const word = words[i];
              const testLine = currentLine + ' ' + word;
              const metrics = ctx.measureText(testLine);
              
              if (metrics.width > textWidth && i > 0) {
                lines.push(currentLine);
                currentLine = word;
                
                // Check if we've exceeded the max number of lines
                if (lines.length >= maxLines - 1) {
                  // If this is the last line we can display, add ellipsis
                  if (i < words.length - 1) {
                    currentLine += '...';
                    break;
                  }
                }
              } else {
                currentLine = testLine;
              }
            }
            
            // Add the last line
            if (currentLine) lines.push(currentLine);
            
            // Limit lines to maxLines
            if (lines.length > maxLines) {
              lines = lines.slice(0, maxLines);
              // Add ellipsis to the last line if it's truncated
              if (words.length > lines.join(' ').split(' ').length) {
                lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+[^\s]+$/, '...'); 
              }
            }
            
            // Calculate vertical position for text
            let startY;
            if (lines.length === 1) {
              // For single line, center it vertically
              startY = textHeight / 2;
            } else {
              // For multiple lines, start from the top with some padding
              startY = lineHeight / 2;
            }
            
            // Draw each line
            lines.forEach((line, index) => {
              const y = startY + index * lineHeight;
              
              // Draw based on text alignment
              if (align === 'center') {
                ctx.fillText(line, textWidth / 2, y);
              } else if (align === 'right') {
                ctx.fillText(line, textWidth - 10, y);
              } else {
                ctx.fillText(line, 10, y);
              }
              
              // Draw underline if needed
              if (layer.properties.underline) {
                const metrics = ctx.measureText(line);
                let lineStartX, lineEndX;
                
                if (align === 'center') {
                  lineStartX = textWidth / 2 - metrics.width / 2;
                  lineEndX = textWidth / 2 + metrics.width / 2;
                } else if (align === 'right') {
                  lineStartX = textWidth - 10 - metrics.width;
                  lineEndX = textWidth - 10;
                } else {
                  lineStartX = 10;
                  lineEndX = 10 + metrics.width;
                }
                
                const underlineY = y + fontSize * 0.15;
                
                ctx.beginPath();
                ctx.moveTo(lineStartX, underlineY);
                ctx.lineTo(lineEndX, underlineY);
                ctx.strokeStyle = color;
                ctx.lineWidth = fontSize * 0.05;
                ctx.stroke();
              }
            });
            
            // Debug visualize text box
            // ctx.strokeStyle = '#00FF00';
            // ctx.lineWidth = 1;
            // ctx.strokeRect(0, 0, textWidth, textHeight);
            
            // Restore context
            ctx.restore();
            
            console.log(`Added text layer to canvas: "${textContent.substring(0, 20)}${textContent.length > 20 ? '...' : ''}"`);
          }
          break;
        }
      }
    }
    
    // Create designs directory if needed
    const designsDir = path.dirname(outputPath);
    if (!fs.existsSync(designsDir)) {
      fs.mkdirSync(designsDir, { recursive: true });
    }
    
    // Save canvas to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Design generated successfully: ${path.basename(outputPath)}`);
    
    return true; // Success
  } catch (error) {
    console.error('Error generating design:', error);
    
    try {
      // Create designs directory if needed
      const designsDir = path.dirname(outputPath);
      if (!fs.existsSync(designsDir)) {
        fs.mkdirSync(designsDir, { recursive: true });
      }
      
      // Try to create a fallback image
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      
      // Fill background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw error message
      ctx.fillStyle = '#ff0000';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Error: ${error.message}`, 400, 300);
      
      // Save fallback
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Created fallback image for: ${path.basename(outputPath)}`);
      return true;
    } catch (fallbackError) {
      console.error('Failed to create fallback image:', fallbackError);
      return false;
    }
  }
};

// Create designs directory if it doesn't exist
const createDesignsDirectory = () => {
  const designsDir = path.join(process.cwd(), 'public', 'designs');
  if (!fs.existsSync(designsDir)) {
    fs.mkdirSync(designsDir, { recursive: true });
  }
  return designsDir;
};

module.exports = {
  renderTemplate,
  createDesignsDirectory
};