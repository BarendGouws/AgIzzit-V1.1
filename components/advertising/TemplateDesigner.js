'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Row, Col, Card, Button, Form, Accordion, ButtonGroup, Container } from 'react-bootstrap';
import Script from 'next/script';
import StateHandler from '@/components/partials/StateHandler';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from 'immutability-helper';
import { setError, fetchAdvertisingTemplate, saveAdvertisingTemplate, deleteAdvertisingTemplate } from '@/redux/manage/slices/advertisingTemplates';
import { useRouter } from 'next/router';
import opentype from 'opentype.js';

// Predefined text variables
const toTitleCase = (str) => {
  const separated = str.replace(/([A-Z])/g, ' $1');
  return separated.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Create CSS @font-face rules for loaded fonts
const createFontFaceRules = (fontDetails) => {
  const rules = [];
  
  fontDetails.forEach((fontInfo, familyName) => {
    fontInfo.variants.forEach(variant => {
      const variantFile = fontInfo.variantFiles?.[variant];
      if (!variantFile) return;
      
      const fontPath = `/fonts/${fontInfo.folder}/${variantFile}`;
      const fontWeight = variant.includes('bold') ? 'bold' : 'normal';
      const fontStyle = variant.includes('italic') ? 'italic' : 'normal';
      
      rules.push(`
        @font-face {
          font-family: "${familyName}";
          src: url("${fontPath}") format("truetype");
          font-weight: ${fontWeight};
          font-style: ${fontStyle};
          font-display: swap;
        }
      `);
    });
  });
  
  return rules.join('\n');
};

// Apply font CSS to document
const applyFontCSS = (fontDetails) => {
  const existingStyle = document.getElementById('dynamic-fonts');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'dynamic-fonts';
  style.textContent = createFontFaceRules(fontDetails);
  document.head.appendChild(style);
};

// Layer item component for the draggable layer list
const LayerItem = ({ 
  layer, 
  index, 
  moveLayer, 
  onVisibilityToggle, 
  onDeleteLayer, 
  onUpdateLayer, 
  images, 
  textVariables,
  availableFonts,
  fontVariants,
  fontMap,
  onForceRerender
}) => {
  
  const ref = useRef(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: 'layer',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveLayer(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'layer',
    item: () => ({ id: layer.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const toggleFormat = (formatType) => {
    const newProps = { ...layer.properties };
    if (formatType === 'bold') {
      newProps.bold = !newProps.bold;
    } else if (formatType === 'italic') {
      newProps.italic = !newProps.italic;
    } else if (formatType === 'underline') {
      newProps.underline = !newProps.underline;
    }
    
    // Update layer and force re-render
    onUpdateLayer(layer.id, newProps);
    
    // Force complete component re-render
    if (onForceRerender) {
      setTimeout(() => onForceRerender(), 30);
    }
  };

  // Get available variants for current font
  const getCurrentFontVariants = () => {
    const fontFamily = layer.properties?.fontFamily;
    if (!fontFamily || !fontVariants[fontFamily]) {
      return [];
    }
    return fontVariants[fontFamily];
  };

  // Check if a format is available for current font
  const isFormatAvailable = (format) => {
    const variants = getCurrentFontVariants();
    switch (format) {
      case 'bold':
        return variants.includes('bold') || variants.includes('bolditalic');
      case 'italic':
        return variants.includes('italic') || variants.includes('bolditalic');
      default:
        return true;
    }
  };

  drag(drop(ref));

  const renderLayerControls = () => {
    switch (layer.type) {
      case 'image':
        return (
          <Form.Select
            size="sm"
            className="mt-2"
            value={layer.properties.imageIndex !== null && layer.properties.imageIndex !== undefined ? layer.properties.imageIndex : ''}
            onChange={(e) => onUpdateLayer(layer.id, {
              ...layer.properties,
              imageIndex: e.target.value !== '' ? parseInt(e.target.value) : null
            })}
          >
            <option value="">Select an image</option>
            {images?.map((img, idx) => (
              <option key={idx} value={idx}>Image {idx + 1}</option>
            ))}
          </Form.Select>
        );
        
      case 'text':
        const currentFontVariants = getCurrentFontVariants();
        const canBold = isFormatAvailable('bold');
        const canItalic = isFormatAvailable('italic');
        
        return (
          <>
            <div className="mt-2">
              <Form.Select
                size="sm"
                className="mb-2"
                value={layer.properties.variable || ''}
                onChange={(e) => {
                  const variableName = e.target.value;
                  const variableData = textVariables.find(v => v.name === variableName);
                  const newProps = {
                    ...layer.properties,
                    variable: variableName,
                    originalWidth: layer.properties.width,
                    originalHeight: layer.properties.height,
                    originalScaleX: layer.properties.scaleX,
                    originalScaleY: layer.properties.scaleY
                  };
                  
                  if (variableName && variableData?.formatting?.length === 1) {
                    newProps.format = variableData.formatting[0].format;
                  } else if (variableName && variableData?.formatting?.length > 1) {
                    newProps.format = variableData.formatting[0].format;
                  } else {
                    newProps.format = '';
                  }
                  
                  onUpdateLayer(layer.id, newProps);
                }}
              >
                <option value="">Select variable</option>
                {textVariables.map((variable) => (
                  <option key={variable.name} value={variable.name}>
                    {variable.label}
                  </option>
                ))}
              </Form.Select>
              
              {layer.properties.variable && 
              (() => {
                const variableData = textVariables.find(v => v.name === layer.properties.variable);
                return variableData?.formatting?.length > 1 && (
                  <Form.Select
                    size="sm"
                    className="mb-2"
                    value={layer.properties.format || ''}
                    onChange={(e) => {
                      onUpdateLayer(layer.id, {
                        ...layer.properties,
                        format: e.target.value
                      });
                    }}
                  >
                    {variableData.formatting.map((format, idx) => (
                      <option key={idx} value={format.format}>
                        {format.result}
                      </option>
                    ))}
                  </Form.Select>
                );
              })()
              }
              
              {layer.properties.variable && 
              (() => {
                const variableData = textVariables.find(v => v.name === layer.properties.variable);
                return variableData?.formatting?.length === 1 && (
                  <div className="mb-2 small text-muted">
                    Format: {variableData.formatting[0].result}
                  </div>
                );
              })()
              }

              <Row className="g-2 mb-2">
                <Col xs={9}>
                  <Form.Select
                    size="sm"
                    value={layer.properties.fontFamily || availableFonts[0] || ''}
                    onChange={(e) => {
                      const newFontFamily = e.target.value;
                      const newVariants = fontVariants[newFontFamily] || [];
                      
                      // Reset bold/italic if not available in new font
                      const newProps = {
                        ...layer.properties,
                        fontFamily: newFontFamily
                      };
                      
                      if (layer.properties.bold && !newVariants.includes('bold') && !newVariants.includes('bolditalic')) {
                        newProps.bold = false;
                      }
                      
                      if (layer.properties.italic && !newVariants.includes('italic') && !newVariants.includes('bolditalic')) {
                        newProps.italic = false;
                      }
                      
                      onUpdateLayer(layer.id, newProps);
                    }}
                    className="font-select"
                    style={{ fontFamily: layer.properties.fontFamily ? `"${layer.properties.fontFamily}", sans-serif` : 'inherit' }}
                  >
                    {availableFonts.map((fontName) => (
                      <option 
                        key={fontName} 
                        value={fontName}
                        style={{ fontFamily: `"${fontName}", sans-serif` }}
                      >
                        {fontName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={3}>
                  <Form.Control
                    size="sm"
                    type="color"
                    value={layer.properties.color || '#000000'}
                    onChange={(e) => onUpdateLayer(layer.id, {
                      ...layer.properties,
                      color: e.target.value
                    })}
                    className="h-100 w-100"
                  />
                </Col>
              </Row>

              <ButtonGroup className="w-100 mb-2" size="sm">
                <Button
                  type="button"
                  variant={layer.properties.bold ? "primary" : "outline-primary"}
                  onClick={() => toggleFormat('bold')}
                  disabled={!canBold}
                  title={!canBold ? "Bold not available for this font" : ""}
                >
                  <i className="bi bi-type-bold"></i>
                </Button>
                <Button
                  type="button"
                  variant={layer.properties.italic ? "primary" : "outline-primary"}
                  onClick={() => toggleFormat('italic')}
                  disabled={!canItalic}
                  title={!canItalic ? "Italic not available for this font" : ""}
                >
                  <i className="bi bi-type-italic"></i>
                </Button>
                <Button
                  type="button"
                  variant={layer.properties.underline ? "primary" : "outline-primary"}
                  onClick={() => toggleFormat('underline')}
                >
                  <i className="bi bi-type-underline"></i>
                </Button>
              </ButtonGroup>
              
              <Row className="g-2 mb-2">
                <Col>
                  <Form.Select 
                    size="sm"
                    value={layer.properties.textAlign || 'left'}
                    onChange={(e) => onUpdateLayer(layer.id, {
                      ...layer.properties,
                      textAlign: e.target.value
                    })}
                  >
                    <option value="left">Left Align</option>
                    <option value="center">Center Align</option>
                    <option value="right">Right Align</option>
                  </Form.Select>
                </Col>
              </Row>

              {currentFontVariants.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    Available: {currentFontVariants.join(', ')}
                  </small>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className="position-relative d-flex flex-column gap-2 mb-2 p-3 border rounded bg-light"
      style={{ 
        opacity: isDragging ? 0.5 : 1, 
        cursor: 'move',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
      data-handler-id={handlerId}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2 align-items-center">
          <Form.Check
            type="checkbox"
            checked={layer.visible}
            onChange={() => onVisibilityToggle(layer.id)}
          />
          <span>
            {layer.type === 'design' ? 'Design' : 
             layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
            {layer.type !== 'design' && ' - '}
            {layer.type === 'image' && layer.name.split('Container ')[1]}
            {layer.type === 'picture' && layer.name.split('Picture ')[1]}
            {layer.type === 'text' && layer.name.split('Text ')[1]}
          </span>
        </div>
        <Button
          variant="link"
          className="p-0 text-danger"
          onClick={() => onDeleteLayer(layer.id)}
        >
          <i className="bi bi-trash"></i>
        </Button>
      </div>
      {renderLayerControls()}
    </div>
  );
};

const TemplateDesigner = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { aspectRatio, images = [], texts = {}, template: reduxTemplate, loading } = useSelector((state) => state.advertisingTemplate);

  // Font management state
  const [availableFonts, setAvailableFonts] = useState([]);
  const [fontVariants, setFontVariants] = useState({});
  const [fontMap, setFontMap] = useState(new Map());
  const [fontDetails, setFontDetails] = useState(new Map());
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const textVariables = useMemo(() => {
    if (!texts) return [];
    return Object.keys(texts).map(key => {
      const textObj = texts[key];
      return {
        name: key,
        label: textObj.label || toTitleCase(key),
        value: textObj.value,
        formatting: textObj.formatting || []
      };
    });
  }, [texts]);

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const containerRef = useRef(null);

  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);

  const [template, setTemplate] = useState({
    name: '',
    designSize: "1:1",
    layers: [],
  });
  
  // Force re-render state
  const [forceRenderKey, setForceRenderKey] = useState(0);

  // Load fonts using OpenType.js with enhanced API
  const loadFonts = async () => {
    try {
      console.log('Starting font discovery...');
      
      // First get the font details from API
      const response = await fetch('/api/fonts/list');
      if (!response.ok) {
        console.error('Failed to fetch font list');
        setFontsLoaded(false);
        return;
      }
      
      const { directories = [], fontDetails: apiDetails = {} } = await response.json();
      
      const fontDetailsMap = new Map();
      const discoveredFontMap = new Map();
      const fonts = [];
      const variants = {};
      
      // Process each font directory
      for (const dir of directories) {
        const familyName = dir.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        const variantInfo = apiDetails[dir] || [];
        const loadedVariants = [];
        const loadedFonts = {};
        const variantFiles = {};
        
        // Load each variant
        for (const { file, variant } of variantInfo) {
          try {
            const fontPath = `/fonts/${dir}/${file}`;
            const font = await opentype.load(fontPath);
            
            if (font) {
              loadedVariants.push(variant);
              loadedFonts[variant] = font;
              variantFiles[variant] = file;
              console.log(`✅ Loaded font: ${familyName} - ${variant}`);
            }
          } catch (error) {
            console.warn(`Failed to load ${familyName} - ${variant}:`, error);
          }
        }
        
        // Only add font family if at least regular variant was loaded
        if (loadedVariants.includes('regular')) {
          fonts.push(familyName);
          variants[familyName] = loadedVariants;
          
          const fontInfo = {
            name: familyName,
            folder: dir,
            variants: loadedVariants,
            fonts: loadedFonts,
            variantFiles: variantFiles
          };
          
          discoveredFontMap.set(familyName, fontInfo);
          fontDetailsMap.set(familyName, fontInfo);
        }
      }
      
      setFontMap(discoveredFontMap);
      setFontDetails(fontDetailsMap);
      setAvailableFonts(fonts);
      setFontVariants(variants);
      
      // Apply CSS font faces
      applyFontCSS(fontDetailsMap);
      
      // Wait a bit for CSS to be applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setFontsLoaded(true);      

      setTimeout(() => setForceRenderKey(prev => prev + 1), 100);
      
      console.log('Fonts loaded:', fonts);
      console.log('Font variants:', variants);
      
    } catch (error) {
      console.error('Error loading fonts:', error);
      setFontsLoaded(true);
    }
  };

  // Helper to calculate appropriate padding based on text properties
  const calculateTextPadding = (fabricObject) => {
    let basePadding = 8;
    const isBold = fabricObject.fontWeight === 'bold';
    const isRightAligned = fabricObject.textAlign === 'right';
    
    if (isBold) {
      basePadding += 2;
      if (isRightAligned) {
        basePadding += 3;
      }
    }
    
    return basePadding;
  };

  // *** UNIFIED FONT APPLICATION SYSTEM ***
  const applyFontToFabricObject = (fabricObject, fontFamily, bold, italic, underline, color, textAlign) => {
    if (!fabricObject || !fabricRef.current) return;

    // Get the actual font family name - ensure it exists
    const actualFontFamily = fontFamily && availableFonts.includes(fontFamily) ? fontFamily : availableFonts[0];
    if (!actualFontFamily) return;

    // Build complete font CSS family string
    const cssFontFamily = `"${actualFontFamily}", sans-serif`;
    
    // Determine proper font weight and style based on available variants
    let fontWeight = 'normal';
    let fontStyle = 'normal';
    
    if (actualFontFamily && fontVariants[actualFontFamily]) {
      const variants = fontVariants[actualFontFamily];
      
      // Check what's actually available and requested
      const hasBold = variants.includes('bold');
      const hasItalic = variants.includes('italic');
      const hasBoldItalic = variants.includes('bolditalic');
      
      if (bold && italic && hasBoldItalic) {
        fontWeight = 'bold';
        fontStyle = 'italic';
      } else if (bold && (hasBold || hasBoldItalic)) {
        fontWeight = 'bold';
        fontStyle = italic && hasItalic ? 'italic' : 'normal';
      } else if (italic && (hasItalic || hasBoldItalic)) {
        fontWeight = bold && hasBold ? 'bold' : 'normal';
        fontStyle = 'italic';
      } else {
        // Fallback to CSS simulation if variants not available
        fontWeight = bold ? 'bold' : 'normal';
        fontStyle = italic ? 'italic' : 'normal';
      }
    } else {
      // Fallback CSS simulation
      fontWeight = bold ? 'bold' : 'normal';
      fontStyle = italic ? 'italic' : 'normal';
    }

    // Apply all font properties at once
    const fontProperties = {
      fontFamily: cssFontFamily,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      underline: underline || false,
      fill: color || '#000000',
      textAlign: textAlign || 'left'
    };

    console.log('Applying font properties to canvas:', {
      actualFontFamily,
      bold,
      italic,
      fontProperties,
      availableVariants: fontVariants[actualFontFamily]
    });

    fabricObject.set(fontProperties);
    
    // Adjust padding based on font properties
    const newPadding = calculateTextPadding(fabricObject);
    fabricObject.set('padding', newPadding);
    
    // Clear cache to force re-render with new font properties
    fabricObject._clearCache();
    
    // Force immediate render
    if (fabricRef.current) {
      fabricRef.current.renderAll();
    }
  };

  const getCanvasDimensions = (ratio) => {
    const baseWidth = 1000;
    const [w, h] = ratio.split(':').map(Number);
    const baseHeight = (baseWidth * h) / w;
    
    setWidth(baseWidth);
    setHeight(baseHeight);
    
    return { width: baseWidth, height: baseHeight };
  };

  const initializeCanvas = () => {
    if (!window.fabric || fabricRef.current) return;
    
    try {
      setIsLoading(true);
      const canvasElement = document.createElement('canvas');
      canvasElement.id = 'fabric-canvas';
      
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
        canvasRef.current.appendChild(canvasElement);
  
        const dimensions = getCanvasDimensions(template.designSize);
  
        fabricRef.current = new window.fabric.Canvas('fabric-canvas', {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: '#ffffff',
          preserveObjectStacking: true,
        });
  
        fabricRef.current.on('object:modified', updateLayerData);
        fabricRef.current.on('object:moved', updateLayerData);
  
        fabricRef.current.on('mouse:down', (e) => {
          if (e.target) {
            const designIndex = template.layers.findIndex(l => l.type === 'design');
            const targetIndex = template.layers.findIndex(l => l.id === e.target.layerId);
            const targetType = template.layers.find(l => l.id === e.target.layerId)?.type;
        
            if (targetType === 'picture') {
              e.target.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                lockMovementX: false,
                lockMovementY: false,
                lockRotation: false,
                lockScalingX: false,
                lockScalingY: false
              });
              e.target.setControlsVisibility({
                mtr: true,
                mt: true,
                mb: true,
                ml: true,
                mr: true,
                bl: true,
                br: true,
                tl: true,
                tr: true
              });
              fabricRef.current.renderAll();
            } else {
              if (designIndex !== -1 && targetIndex < designIndex) {
                e.target.selectable = false;
                e.target.evented = false;
              } else {
                e.target.selectable = true;
                e.target.evented = true;
              }
            }
          }
        });

        fabricRef.current.on('object:added', (e) => {
          const obj = e.target;
          if (obj.type === 'image' && obj.layerId && !obj.isDesign) {
            obj.set({
              selectable: true,
              evented: true,
              hasControls: true,
              hasBorders: true,
              lockMovementX: false,
              lockMovementY: false,
              lockRotation: false,
              lockScalingX: false,
              lockScalingY: false
            });
            obj.setControlsVisibility({
              mtr: true,
              mt: true,
              mb: true,
              ml: true,
              mr: true,
              bl: true,
              br: true,
              tl: true,
              tr: true
            });
          }
          fabricRef.current.renderAll();
        });
  
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing canvas:', error);
      setIsLoading(false);
    }
  };

  const restoreCanvas = async (loadedTemplate) => {
    if (!fabricRef.current || !loadedTemplate?.layers) return;
  
    fabricRef.current.clear();
  
    for (const layer of [...loadedTemplate.layers].reverse()) {
      switch (layer.type) {
        case 'design': {
          await new Promise((resolve) => {
            if (!window.fabric) {
              console.error('Fabric.js is not available');
              resolve();
              return;
            }

            window.fabric.Image.fromURL(layer.properties.imageData, (fabricImg) => {
              if (!fabricRef.current) {
                console.error('Canvas reference is not available');
                resolve();
                return;
              }
              
              const canvasWidth = fabricRef.current.width;
              const canvasHeight = fabricRef.current.height;
              if (!canvasWidth || !canvasHeight) {
                console.error('Canvas dimensions are not available');
                resolve();
                return;
              }

              const scale = validateImageSize(fabricImg, canvasWidth, canvasHeight);
  
              fabricImg.set({
                scaleX: scale,
                scaleY: scale,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                isDesign: true,
                selectable: false,
                evented: false,
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                originalScaleX: scale,
                originalScaleY: scale
              });
  
              if (fabricRef.current) {
                fabricRef.current.add(fabricImg);
              }
              resolve();
            });
          });
          break;
        }
        case 'picture': {
          await new Promise((resolve) => {
            if (!window.fabric || !fabricRef.current) {
              resolve();
              return;
            }
            
            window.fabric.Image.fromURL(layer.properties.imageData, (img) => {
              img.set({
                layerId: layer.id,
                left: layer.properties.left,
                top: layer.properties.top,
                scaleX: layer.properties.scaleX,
                scaleY: layer.properties.scaleY,
                angle: layer.properties.angle || 0,
                cornerStyle: 'circle',
                cornerSize: 8,
                transparentCorners: false,
                centeredRotation: true,
                borderColor: '#000000',
                cornerColor: '#ffffff',
                cornerStrokeColor: '#000000',
                borderScaleFactor: 1,
                padding: 0,
                lockUniScaling: true,
                visible: layer.visible
              });
  
              if (fabricRef.current) {
                fabricRef.current.add(img);
              }
              resolve();
            });
          });
          break;
        }
        case 'text': {
          if (!window.fabric || !fabricRef.current) {
            continue;
          }
          
          const variableName = layer.properties.variable;
          let textValue = '';
          
          if (variableName && texts[variableName]) {
            if (layer.properties.format && texts[variableName].formatting) {
              const formatItem = texts[variableName].formatting.find(f => f.format === layer.properties.format);
              if (formatItem) {
                textValue = formatItem.result;
              } else {
                textValue = texts[variableName].formatting && texts[variableName].formatting.length > 0 
                  ? texts[variableName].formatting[0].result 
                  : texts[variableName].value;
              }
            } else {
              textValue = texts[variableName].formatting && texts[variableName].formatting.length > 0 
                ? texts[variableName].formatting[0].result 
                : texts[variableName].value;
            }
          } else {
            textValue = layer.properties.text || 'Select Variable';
          }
          
          const safeTextValue = typeof textValue === 'string' ? textValue : String(textValue);
          
          // Ensure font family is set with fallback
          const fontFamily = layer.properties.fontFamily || availableFonts[0] || 'Open Sans';
          
          const textbox = new window.fabric.Textbox(safeTextValue, {
            layerId: layer.id,
            left: layer.properties.left,
            top: layer.properties.top,
            width: layer.properties.width,
            height: layer.properties.height,
            fontSize: layer.properties.fontSize || 50,
            fill: layer.properties.color || '#000000',
            textAlign: layer.properties.textAlign || 'left',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            breakWords: true,
            lockUniScaling: true,
            padding: 8,
            cornerStyle: 'circle',
            cornerSize: 8,
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#000000',
            borderColor: '#000000',
            borderScaleFactor: 1,
            hasControls: true,
            charSpacing: 0,
            lineHeight: 1.2,
            underline: layer.properties.underline,
            visible: layer.visible,
            fixedWidth: layer.properties.fixedWidth || layer.properties.width,
            fixedHeight: layer.properties.fixedHeight || layer.properties.height,
            scaleX: 1,
            scaleY: 1,
            angle: layer.properties.angle || 0,
            centeredRotation: true
          });

          // Apply font using unified system - immediately, not with delay
          applyFontToFabricObject(
            textbox,
            fontFamily,
            layer.properties.bold,
            layer.properties.italic,
            layer.properties.underline,
            layer.properties.color,
            layer.properties.textAlign
          );
        
          textbox.on('scaling', () => {
            const width = textbox.width * textbox.scaleX;
            const height = textbox.height * textbox.scaleY;
            
            textbox.set({
              fixedWidth: width,
              fixedHeight: height,
              width: width,
              height: height,
              scaleX: 1,
              scaleY: 1
            });
            
            fitTextToBox(textbox);
            if (fabricRef.current) {
              fabricRef.current.renderAll();
            }
          });
        
          textbox.on('rotating', () => {
            updateLayerData({ target: textbox });
          });
        
          if (fabricRef.current) {
            fabricRef.current.add(textbox);
            fitTextToBox(textbox);
          }
          break;
        }
        case 'image': {
          if (!window.fabric || !fabricRef.current) {
            continue;
          }
          
          const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
          const containerWidth = layer.properties.width || fabricRef.current.width * 0.3;
          const containerHeight = layer.properties.height || (containerWidth * ratioH) / ratioW;
        
          const rect = new window.fabric.Rect({
            layerId: layer.id,
            left: layer.properties.left,
            top: layer.properties.top,
            width: containerWidth,
            height: containerHeight,
            scaleX: layer.properties.scaleX || 1,
            scaleY: layer.properties.scaleY || 1,
            angle: layer.properties.angle || 0,
            fill: 'transparent',
            stroke: '#cccccc',
            strokeWidth: 1,
            cornerStyle: 'circle',
            cornerSize: 8,
            cornerColor: '#000000',
            transparentCorners: false,
            centeredRotation: true,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            borderColor: 'transparent',
            noScaleCache: false,
            objectCaching: false,
            strokeUniform: true,
            visible: layer.visible
          });
        
          rect.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false
          });
        
          rect.on('mousemove', () => {
            const ratio = ratioW / ratioH;
            const width = rect.width * rect.scaleX;
            const height = width / ratio;
            rect.set({
              scaleY: height / rect.height,
              scaleX: width / rect.width
            });
            if (fabricRef.current) {
              fabricRef.current.requestRenderAll();
            }
          });
        
          if (fabricRef.current) {
            fabricRef.current.add(rect);
          
            // Load image if imageIndex is set
            if (layer.properties.imageIndex !== null && 
                layer.properties.imageIndex !== undefined && 
                images[layer.properties.imageIndex]) {
              // Delay to ensure container is fully added
              setTimeout(() => {
                addImageToContainer(layer.id, layer.properties.imageIndex);
              }, 100);
            }
          }
          break;
        }
      }
    }
  
    if (fabricRef.current) {
      fabricRef.current.renderAll();
    }
  };

  const updateLayerData = (e) => {
    const obj = e.target;
    if (!obj || !obj.layerId) return;

    setTemplate(prev => ({
      ...prev,
      layers: prev.layers.map(layer => {
        if (layer.id === obj.layerId) {
          return {
            ...layer,
            properties: {
              ...layer.properties,
              left: obj.left,
              top: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              angle: obj.angle || 0,
              fixedWidth: obj.fixedWidth,
              fixedHeight: obj.fixedHeight,
              width: obj.width,
              height: obj.height,
              fontSize: obj.fontSize
            }
          };
        }
        return layer;
      })
    }));
  };

  const handleDesignUpload = (e) => {
    console.log('Design upload triggered');
    const file = e.target.files[0];
    if (!file || !fabricRef.current) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const validationResult = validateDesignRatio(img.width, img.height, template.designSize);
        
        if (!validationResult.isValid) {
          dispatch(setError(validationResult.message));
          return;
        }
  
        window.fabric.Image.fromURL(event.target.result, (fabricImg) => {
          const oldDesign = fabricRef.current.getObjects().find(obj => obj.isDesign);
          if (oldDesign) {
            fabricRef.current.remove(oldDesign);
          }
  
          const canvasWidth = fabricRef.current.getWidth();
          const canvasHeight = fabricRef.current.getHeight();
          const scale = validateImageSize(fabricImg, canvasWidth, canvasHeight);
  
          fabricImg.set({
            scaleX: scale,
            scaleY: scale,
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            isDesign: true,
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            originalScaleX: scale,
            originalScaleY: scale
          });
  
          fabricRef.current.add(fabricImg);
          fabricRef.current.sendToBack(fabricImg);
  
          setTemplate(prev => ({
            ...prev,
            layers: [
              ...prev.layers.filter(layer => layer.id !== 'design-layer'),
              {
                id: 'design-layer',
                type: 'design',
                name: 'Background Design',
                visible: true,
                properties: {
                  imageData: event.target.result
                }
              }
            ]
          }));
  
          fabricRef.current.renderAll();
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const addImageToContainer = (layerId, imageIndex) => {
    if (!fabricRef.current) {
      console.warn('Canvas reference is not available. Cannot add image to container.');
      return;
    }

    if (!images || images[imageIndex] === undefined) {
      console.warn('Image not available:', { layerId, imageIndex, images });
      return;
    }

    const container = fabricRef.current.getObjects().find(obj => obj.layerId === layerId);
    if (!container) {
      console.warn('Container not found:', layerId);
      return;
    }
  
    window.fabric.Image.fromURL(images[imageIndex], (img) => {
      if (!fabricRef.current) {
        console.warn('Canvas reference was lost while loading image');
        return;
      }
      
      // Remove old image if exists
      const oldImage = fabricRef.current.getObjects().find(
        obj => obj.type === 'image' && obj.containerId === layerId
      );
      if (oldImage) {
        fabricRef.current.remove(oldImage);
      }
  
      const containerWidth = container.width * container.scaleX;
      const containerHeight = container.height * container.scaleY;
      const imgAspectRatio = img.width / img.height;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let scaleX, scaleY;
      if (imgAspectRatio > containerAspectRatio) {
        scaleY = containerHeight / img.height;
        scaleX = scaleY;
      } else {
        scaleX = containerWidth / img.width;
        scaleY = scaleX;
      }
  
      const clipPath = new window.fabric.Rect({
        left: container.left,
        top: container.top,
        width: container.width,
        height: container.height,
        scaleX: container.scaleX,
        scaleY: container.scaleY,
        angle: container.angle,
        absolutePositioned: true,
        noScaleCache: false,
        objectCaching: false
      });
  
      img.set({
        left: container.left,
        top: container.top,
        scaleX: scaleX,
        scaleY: scaleY,
        angle: container.angle,
        containerId: layerId,
        clipPath: clipPath,
        selectable: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        evented: false,
        visible: container.visible
      });
  
      if (fabricRef.current) {
        fabricRef.current.add(img);
        fabricRef.current.moveTo(img, fabricRef.current.getObjects().indexOf(container) + 1);
      
        // Remove old event handlers
        container.off('moving');
        container.off('scaling');
        container.off('rotating');
      
        container.on('moving', () => {
          if (!fabricRef.current) return;
          
          clipPath.set({
            left: container.left,
            top: container.top
          });
          
          img.set({
            left: container.left,
            top: container.top
          });
      
          fabricRef.current.renderAll();
        });
      
        container.on('scaling', () => {
          if (!fabricRef.current) return;
          
          clipPath.set({
            scaleX: container.scaleX,
            scaleY: container.scaleY,
            left: container.left,
            top: container.top
          });
      
          const newWidth = container.width * container.scaleX;
          const newHeight = container.height * container.scaleY;
          const newAspectRatio = newWidth / newHeight;
      
          let newScaleX, newScaleY;
          if (imgAspectRatio > newAspectRatio) {
            newScaleY = newHeight / img.height;
            newScaleX = newScaleY;
          } else {
            newScaleX = newWidth / img.width;
            newScaleY = newScaleX;
          }
      
          img.set({
            scaleX: newScaleX,
            scaleY: newScaleY,
            left: container.left,
            top: container.top
          });
      
          fabricRef.current.renderAll();
        });
      
        container.on('rotating', () => {
          if (!fabricRef.current) return;
          
          clipPath.set({
            angle: container.angle,
            left: container.left,
            top: container.top
          });
          
          img.set({
            angle: container.angle,
            left: container.left,
            top: container.top
          });
      
          fabricRef.current.renderAll();
        });
      
        fabricRef.current.renderAll();
      }
    });
  };

  const validateImageSize = (img, canvasWidth, canvasHeight) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    const tolerance = 0.03;

    if (Math.abs(imgRatio - canvasRatio) <= tolerance) {
      const scaleX = canvasWidth / img.width;
      const scaleY = canvasHeight / img.height;
      return Math.max(scaleX, scaleY);
    } else {
      if (imgRatio > canvasRatio) {
        return canvasWidth / img.width;
      } else {
        return canvasHeight / img.height;
      }
    }
  };

  const fitTextToBox = (textObject) => {
    if (!textObject.fixedWidth || !textObject.fixedHeight) return;
  
    const boxWidth = textObject.fixedWidth;
    const boxHeight = textObject.fixedHeight;
    
    // Add more padding for bold text and right alignment
    let internalPadding = 5;
    const isBold = textObject.fontWeight === 'bold';
    const isRightAligned = textObject.textAlign === 'right';
    const isCenterAligned = textObject.textAlign === 'center';
    
    // Add extra padding for bold text
    if (isBold) {
      internalPadding += 3;
    }
    
    // Calculate effective width accounting for alignment and bold
    let effectiveWidth = boxWidth - (internalPadding * 2);
    
    // For right-aligned bold text, add even more padding
    if (isBold && isRightAligned) {
      effectiveWidth -= 5;
    }
    
    // For center-aligned bold text, ensure symmetrical padding
    if (isBold && isCenterAligned) {
      effectiveWidth -= 2;
    }
    
    let fontSize = 100;
    const minFontSize = 8;
    
    textObject.set({
      width: effectiveWidth,
      height: boxHeight,
      scaleX: 1,
      scaleY: 1
    });
  
    let low = minFontSize;
    let high = fontSize;
  
    // Binary search for the best font size
    while (low <= high) {
      fontSize = Math.floor((low + high) / 2);
      
      textObject.set({
        fontSize: fontSize,
        width: effectiveWidth
      });
  
      // Force text measurement update
      textObject._clearCache();
      
      const textHeight = textObject.calcTextHeight();
      
      if (textHeight <= boxHeight - (internalPadding * 2)) {
        low = fontSize + 1;
      } else {
        high = fontSize - 1;
      }
    }
  
    fontSize = high;
    
    // Final setup with proper width
    textObject.set({
      fontSize: fontSize,
      width: boxWidth,
      height: boxHeight,
      scaleX: 1,
      scaleY: 1
    });
    
    // Force final render
    textObject._clearCache();
    textObject.setCoords();
  
    if (textObject.layerId) {
      setTemplate(prev => ({
        ...prev,
        layers: prev.layers.map(layer => {
          if (layer.id === textObject.layerId) {
            return {
              ...layer,
              properties: {
                ...layer.properties,
                fontSize,
                width: boxWidth,
                height: boxHeight,
                fixedWidth: boxWidth,
                fixedHeight: boxHeight
              }
            };
          }
          return layer;
        })
      }));
    }
  };  

  const addLayer = (type) => {
    if (!fabricRef.current) return;
  
    const layerId = `layer-${Date.now()}`;
    let fabricObject;
    let layerName;
    let layerProperties;
  
    const getNextNumber = (layerType, namePattern) => {
      const filteredLayers = template.layers.filter(l => l.type === layerType);
      const numbers = filteredLayers.map(l => {
        const match = l.name.match(namePattern);
        return match ? parseInt(match[1]) : 0;
      });
      return Math.max(0, ...numbers) + 1;
    };
  
    switch (type) {
      case 'picture': 
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
  
          const reader = new FileReader();
          reader.onload = (event) => {
            window.fabric.Image.fromURL(event.target.result, (img) => {
              const canvasWidth = fabricRef.current.width;
              const scale = (canvasWidth * 0.1) / img.width;
  
              img.set({
                layerId,
                scaleX: scale,
                scaleY: scale,
                left: 50,
                top: 50,
                cornerStyle: 'circle',
                cornerSize: 8,
                transparentCorners: false,
                centeredRotation: true,
                borderColor: '#000000',
                cornerColor: '#ffffff',
                cornerStrokeColor: '#000000',
                borderScaleFactor: 1,
                padding: 0,
                lockUniScaling: true
              });
  
              fabricRef.current.add(img);
              fabricRef.current.setActiveObject(img);
              fabricRef.current.renderAll();
  
              const newLayer = {
                id: layerId,
                type: 'picture',
                name: `Picture ${getNextNumber('picture', /Picture (\d+)/)}`,
                visible: true,
                properties: {
                  imageData: event.target.result,
                  scaleX: scale,
                  scaleY: scale,
                  left: 50,
                  top: 50,
                  angle: 0
                }
              };
  
              setTemplate(prev => ({
                ...prev,
                layers: [newLayer, ...prev.layers]
              }));
            });
          };
          reader.readAsDataURL(file);
        };
        input.click();
        return;
  
        case 'text':
          if (!window.fabric) return;

          const defaultWidth = fabricRef.current.width * 0.3;
          const defaultHeight = fabricRef.current.height * 0.1;
          
          // Use first available font - CRITICAL: Ensure layer properties match what will be displayed
          const defaultFontFamily = availableFonts[0] || 'Open Sans';

          fabricObject = new window.fabric.Textbox('Select Variable', {
            left: 50,
            top: 50,
            width: defaultWidth,
            height: defaultHeight,
            fontSize: 50,
            layerId,
            fill: '#000000',
            textAlign: 'left',
            originX: 'left', 
            originY: 'top',
            splitByGrapheme: false,
            breakWords: true,
            lockUniScaling: true,
            padding: 8,
            cornerStyle: 'circle',
            cornerSize: 8,
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#000000',
            borderColor: '#000000',
            borderScaleFactor: 1,
            hasControls: true,
            charSpacing: 0,
            lineHeight: 1.2,
            underline: false,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            centeredRotation: true
          });

          // Apply default font using unified system
          applyFontToFabricObject(fabricObject, defaultFontFamily, false, false, false, '#000000', 'left');

          fabricObject.set({
            fixedWidth: defaultWidth,
            fixedHeight: defaultHeight,
            originalWidth: defaultWidth,
            originalHeight: defaultHeight
          });

          fabricObject.on('scaling', () => {
            const width = fabricObject.width * fabricObject.scaleX;
            const height = fabricObject.height * fabricObject.scaleY;
            
            fabricObject.set({
              fixedWidth: width,
              fixedHeight: height,
              width: width,
              height: height,
              scaleX: 1,
              scaleY: 1
            });
            
            fitTextToBox(fabricObject);
            fabricRef.current.renderAll();
          });

          fabricObject.on('rotating', () => {
            updateLayerData({ target: fabricObject });
          });

          layerName = `Text ${getNextNumber('text', /Text (\d+)/)}`;
          layerProperties = {
            variable: '',
            text: 'Select Variable',
            format: '',
            fontFamily: defaultFontFamily, // CRITICAL: Match what's displayed
            color: '#000000',
            left: 50,
            top: 50,
            width: defaultWidth,
            height: defaultHeight,
            fixedWidth: defaultWidth,
            fixedHeight: defaultHeight,
            originalWidth: defaultWidth,
            originalHeight: defaultHeight,
            textAlign: 'left',
            bold: false,
            italic: false,
            underline: false,
            fontSize: 50,
            angle: 0
          };
          break;
  
        case 'image':
          if (!window.fabric) return;
          
          const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
          const containerWidth = fabricRef.current.width * 0.3;
          const containerHeight = (containerWidth * ratioH) / ratioW;

          fabricObject = new window.fabric.Rect({
            left: 50,
            top: 50,
            width: containerWidth,
            height: containerHeight,
            fill: 'transparent',
            stroke: '#cccccc',
            strokeWidth: 1,
            layerId,
            cornerStyle: 'circle',
            cornerSize: 8,
            cornerColor: '#000000',
            transparentCorners: false,
            centeredRotation: true,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            borderColor: 'transparent',
            noScaleCache: false,
            objectCaching: false,
            strokeUniform: true
          });

          fabricObject.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false
          });

          fabricObject.on('mousemove', () => {
            const ratio = ratioW / ratioH;
            const width = fabricObject.width * fabricObject.scaleX;
            const height = width / ratio;
            fabricObject.set({
              scaleY: height / fabricObject.height,
              scaleX: width / fabricObject.width
            });
            if (fabricRef.current) {
              fabricRef.current.requestRenderAll();
            }
          });

          layerName = `Image Container ${getNextNumber('image', /Container (\d+)/)}`;
          layerProperties = {
            width: containerWidth,
            height: containerHeight,
            left: 50,
            top: 50,
            imageIndex: null,
            scaleX: 1,
            scaleY: 1,
            angle: 0
          };
          break;
  
      default:
        return;
    }
  
    if (fabricObject) {
      fabricRef.current.add(fabricObject);
      fabricRef.current.bringToFront(fabricObject);
      fabricRef.current.setActiveObject(fabricObject);
      fabricRef.current.renderAll();
  
      const newLayer = {
        id: layerId,
        type,
        name: layerName,
        visible: true,
        properties: layerProperties
      };
  
      setTemplate(prev => ({
        ...prev,
        layers: [newLayer, ...prev.layers]
      }));
    }
  };

  const updateLayer = async (layerId, newProperties) => {
    if (!fabricRef.current) return;

    const fabricObject = fabricRef.current.getObjects().find(obj => obj.layerId === layerId);
    if (!fabricObject) return;

    setTemplate(prev => ({
      ...prev,
      layers: prev.layers.map(layer => {
        if (layer.id === layerId) {
          if (layer.type === 'image' && 'imageIndex' in newProperties) {
            // Handle image container updates
            if (newProperties.imageIndex !== null) {
              addImageToContainer(layerId, newProperties.imageIndex);
            }
          } else if (layer.type === 'text') {
            // Get current and new properties
            const currentProps = layer.properties;
            const updatedProps = { ...currentProps, ...newProperties };
            
            // Preserve dimensions
            const currentWidth = fabricObject.fixedWidth || fabricObject.width;
            const currentHeight = fabricObject.fixedHeight || fabricObject.height;
            
            if (newProperties.variable && texts[newProperties.variable] !== undefined) {
              // Handle variable selection
              let textValue;
              const variableData = texts[newProperties.variable];
              
              if (newProperties.format) {
                const formatItem = variableData.formatting?.find(f => f.format === newProperties.format);
                if (formatItem) {
                  textValue = formatItem.result;
                } else if (variableData.formatting?.length > 0) {
                  textValue = variableData.formatting[0].result;
                } else {
                  textValue = variableData.value;
                }
              } else if (variableData.formatting?.length > 0) {
                textValue = variableData.formatting[0].result;
                
                if (newProperties.variable !== layer.properties.variable) {
                  newProperties.format = variableData.formatting[0].format;
                }
              } else {
                textValue = variableData.value;
              }
              
              if (textValue === null || textValue === undefined) {
                textValue = '';
              } else if (typeof textValue !== 'string') {
                textValue = String(textValue);
              }
              
              fabricObject.set('text', textValue);
            }
            
            // Apply font changes immediately without delay
            applyFontToFabricObject(
              fabricObject,
              updatedProps.fontFamily,
              updatedProps.bold,
              updatedProps.italic,
              updatedProps.underline,
              updatedProps.color,
              updatedProps.textAlign
            );
            
            // Preserve dimensions and refit text
            fabricObject.set({
              width: currentWidth,
              height: currentHeight,
              fixedWidth: currentWidth,
              fixedHeight: currentHeight,
              scaleX: 1,
              scaleY: 1
            });
            
            fitTextToBox(fabricObject);
            
            // Force render
            if (fabricRef.current) {
              fabricRef.current.renderAll();
            }
          }
          
          return {
            ...layer,
            properties: {
              ...layer.properties,
              ...newProperties
            }
          };
        }
        return layer;
      })
    }));
  };

  const deleteLayer = (layerId) => {
    if (!fabricRef.current) return;
  
    if (layerId === 'design-layer') {
      const designObject = fabricRef.current.getObjects().find(obj => obj.isDesign);
      if (designObject) {
        fabricRef.current.remove(designObject);
      }
    } else {
      const objects = fabricRef.current.getObjects().filter(obj => 
        obj.layerId === layerId || obj.containerId === layerId
      );
      
      objects.forEach(obj => {
        fabricRef.current.remove(obj);
      });
    }
  
    setTemplate(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId)
    }));
  
    fabricRef.current.renderAll();
  };

  const moveLayer = (dragIndex, hoverIndex) => {
    setTemplate(prev => {
      const newLayers = update(prev.layers, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prev.layers[dragIndex]],
        ],
      });
  
      if (fabricRef.current) {
        const canvasObjects = fabricRef.current.getObjects();
        
        const objectMap = new Map();
        canvasObjects.forEach(obj => {
          if (obj.layerId) {
            objectMap.set(obj.layerId, obj);
          } else if (obj.containerId) {
            objectMap.set(`contained-${obj.containerId}`, obj);
          } else if (obj.isDesign) {
            objectMap.set('design', obj);
          }
        });
  
        fabricRef.current.clear();
  
        [...newLayers].reverse().forEach(layer => {
          switch(layer.type) {
            case 'design': {
              const designObj = objectMap.get('design');
              if (designObj) {
                fabricRef.current.add(designObj);
              }
              break;
            }
            case 'image': {
              const containerObj = objectMap.get(layer.id);
              const imageObj = objectMap.get(`contained-${layer.id}`);
              if (containerObj) {
                fabricRef.current.add(containerObj);
              }
              if (imageObj) {
                fabricRef.current.add(imageObj);
              }
              break;
            }
            case 'picture':
            case 'text': {
              const obj = objectMap.get(layer.id);
              if (obj) {
                fabricRef.current.add(obj);
              }
              break;
            }
          }
        });
  
        fabricRef.current.renderAll();
      }
  
      return { ...prev, layers: newLayers };
    });
  };

  const toggleLayerVisibility = (layerId) => {
    setTemplate(prev => ({
      ...prev,
      layers: prev.layers.map(layer => {
        if (layer.id === layerId) {
          if (layer.type === 'design') {
            const designObject = fabricRef.current?.getObjects().find(obj => obj.isDesign);
            if (designObject) {
              designObject.visible = !layer.visible;
              fabricRef.current.renderAll();
            }
          } else if (layer.type === 'image') {
            // Toggle both container and image visibility
            const container = fabricRef.current?.getObjects().find(obj => obj.layerId === layerId);
            const image = fabricRef.current?.getObjects().find(obj => obj.containerId === layerId);
            if (container) {
              container.visible = !layer.visible;
            }
            if (image) {
              image.visible = !layer.visible;
            }
            fabricRef.current?.renderAll();
          } else {
            const objects = fabricRef.current?.getObjects().filter(obj => 
              obj.layerId === layerId
            );
            objects.forEach(obj => {
              obj.visible = !layer.visible;
            });
            fabricRef.current?.renderAll();
          }
          return { ...layer, visible: !layer.visible };
        }
        return layer;
      })
    }));
  };

  const validateDesignRatio = (imgWidth, imgHeight, targetRatio) => {
    const imgRatio = imgWidth / imgHeight;
    const tolerance = 0.03;
    const [targetW, targetH] = targetRatio.split(':').map(Number);
    const expectedRatio = targetW / targetH;
    
    const errorPercentage = Math.abs((imgRatio - expectedRatio) / expectedRatio * 100);
    
    if (errorPercentage > tolerance * 100) {
      return {
        isValid: false,
        message: `Image aspect ratio (${imgRatio.toFixed(3)}) differs from template ratio (${expectedRatio.toFixed(3)}) by ${errorPercentage.toFixed(1)}%. Please use an image closer to ${targetRatio} ratio.`
      };
    }
    
    return { isValid: true };
  };

  // Get validation messages for template
  const getValidationMessages = () => {
    const messages = [];
    
    if (!template.name || template.name.trim() === '') {
      messages.push('Template name is required');
    }
    
    const hasDesignLayer = template.layers.some(layer => layer.type === 'design');
    if (!hasDesignLayer) {
      messages.push('Template must include a design/background image');
    }
    
    const hasAdditionalLayer = template.layers.some(layer => layer.type !== 'design');
    if (!hasAdditionalLayer && hasDesignLayer) {
      messages.push('Template must include at least one additional layer (text, image, or picture)');
    }
    
    const invalidLayers = template.layers.filter(layer => {
      switch (layer.type) {
        case 'design':
          return !layer.properties?.imageData;
        case 'picture':
          return !layer.properties?.imageData;
        case 'image':
          return layer.properties?.imageIndex === null || layer.properties?.imageIndex === undefined;
        case 'text':
          return !layer.properties?.variable || !layer.properties?.fontFamily;
        default:
          return false;
      }
    });
    
    if (invalidLayers.length > 0) {
      const layerTypes = invalidLayers.map(layer => layer.name).join(', ');
      messages.push(`The following layers have missing required properties: ${layerTypes}`);
    }
    
    return messages;
  };

  const handleSaveTemplate = async () => {
    try {
      const validationMessages = getValidationMessages();
      
      if (validationMessages.length > 0) {
        dispatch(setError(validationMessages[0])); // Show first error
        return;
      }
  
      const { id } = router.query;
      await dispatch(saveAdvertisingTemplate({ id, template })).unwrap();  
      router.push('/manage/advertising-templates');
  
    } catch (error) {
      console.error('Error saving template:', error);
      dispatch(setError('Failed to save template. Please try again.'));
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      const { id } = router.query;
      if (!id) return; 
  
      await dispatch(deleteAdvertisingTemplate(id)).unwrap();
      router.push('/manage/advertising-templates');       

    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Load fonts on component mount
  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => { 
    const { id } = router.query;  
    if (id) dispatch(fetchAdvertisingTemplate(id));
  }, [router.query]);

  useEffect(() => {
    if (reduxTemplate) {
      setTemplate(reduxTemplate);
      if (fabricRef.current && assetsLoaded && fontsLoaded) {
        restoreCanvas(reduxTemplate);
      }
    }
  }, [reduxTemplate, assetsLoaded, fontsLoaded]);

  useEffect(() => {
    if (images && images.length > 0 && texts && Object.keys(texts).length > 0 && fontsLoaded) {
      setAssetsLoaded(true);
    }
  }, [images, texts, fontsLoaded]);

  // Handle canvas object selection
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.on('mouse:down', (e) => {
        if (e.target) {
          if (e.target.isDesign || e.target.containerId) {
            e.target.selectable = false;
            e.target.evented = false;
          } else {
            e.target.selectable = true;
            e.target.evented = true;
            e.target.hasControls = true;
            e.target.hasBorders = true;
          }
        }
      });
    }
  }, [template.layers]);

  // Force re-render when key changes
  useEffect(() => {
    if (!fabricRef.current || forceRenderKey === 0) return;
    
    // Re-apply fonts to all text objects
    template.layers.forEach(layer => {
      if (layer.type === 'text') {
        const fabricObject = fabricRef.current.getObjects().find(obj => obj.layerId === layer.id);
        if (fabricObject) {
          applyFontToFabricObject(
            fabricObject,
            layer.properties.fontFamily,
            layer.properties.bold,
            layer.properties.italic,
            layer.properties.underline,
            layer.properties.color,
            layer.properties.textAlign
          );
          fitTextToBox(fabricObject);
        }
      }
    });
    
    if (fabricRef.current) {
      fabricRef.current.renderAll();
    }
  }, [forceRenderKey]);

  // Initialize canvas once fonts are loaded
  useEffect(() => {
    if (window.fabric && fontsLoaded) {
      initializeCanvas();
      if (template?.layers?.length > 0) {
        restoreCanvas(template);
      }
    }
  
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [template.designSize, fontsLoaded]);

  useEffect(() => {
    const handleResize = () => {
      const pdfDiv = document.getElementById('pdfDiv');
      const dropDiv = document.getElementById('drop');
    
      if (pdfDiv && dropDiv) {
        const availableWidth = pdfDiv.getBoundingClientRect().width - 48;
        const availableHeight = window.innerHeight * 0.8;
        
        const scale = Math.min(
          availableWidth / width,
          availableHeight / height
        ) * zoom;
        
        dropDiv.style.transform = `scale(${scale})`;
      }
    };
  
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height, zoom]);

  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.setDimensions({
        width: width,
        height: height
      });
      fabricRef.current.renderAll();
    }
  }, [width, height]);

  const zoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };
  
  const zoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  return (
    <StateHandler slice="advertisingTemplate">
      <DndProvider backend={HTML5Backend}>
        <Script 
          src="/fabricjs/fabric.min.js"
          onLoad={() => {
            console.log('Fabric.js loaded successfully');
            if (fontsLoaded) {
              initializeCanvas();
            }
          }}
          onError={(e) => console.error('Error loading Fabric.js:', e)}
        />
        <Row className="mt-3 h-100" style={{ minHeight: '100vh' }}>
          <Col lg={5} xl={4} className='ms-0'>
            <Card className="mb-4">
              <Card.Body>

                <Accordion defaultActiveKey="0" flush>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Template Settings</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Template Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={template.name}
                          onChange={(e) => setTemplate(prev => ({ 
                            ...prev, 
                            name: e.target.value 
                          }))}
                          placeholder="Enter template name"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Design Size</Form.Label>
                        <Form.Select 
                          value={template.designSize}
                          onChange={(e) => {
                            if (fabricRef.current) {
                              fabricRef.current.clear();
                              fabricRef.current.renderAll();
                            }
                            setTemplate(prev => ({
                              ...prev,
                              designSize: e.target.value,
                              layers: []
                            }));
                          }}
                        >
                          <option value="1:1">Square (1:1)</option>
                          <option value="4:5">Vertical (4:5)</option>
                          <option value="9:16">Portrait (9:16)</option>
                          <option value="16:9">Horizontal (16:9)</option>
                        </Form.Select>
                      </Form.Group>

                      {!fontsLoaded ? (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Loading font information...
                        </div>
                      ) : availableFonts.length === 0 ? (
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          No fonts found in /public/fonts directory
                        </div>
                      ) : (
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          {availableFonts.length} fonts loaded successfully
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header>
                      <div className="d-flex align-items-center gap-2">
                        <span>Layers</span>
                        <span className="badge bg-secondary">{template.layers.length}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>               
                     <Row className="d-flex gap-2 mb-3">
                      <Col>
                      <Button 
                          variant="outline-primary" 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = handleDesignUpload;
                            input.click();
                          }}
                          className="w-100"
                          disabled={template.layers.some(layer => layer.type === 'design')}
                        >
                          <i className="bi bi-image me-2"></i>
                          {template.layers.some(layer => layer.type === 'design') ? 'Design Added' : 'Add Design'}
                        </Button>
                        </Col>
                        <Col >
                        <Button 
                          variant="outline-primary" 
                          onClick={() => addLayer('picture')}
                          className="w-100"
                        >
                          <i className="bi bi-image me-2"></i>
                          Add Picture
                        </Button>
                        </Col>
                        <Col >
                        <Button 
                          variant="outline-primary" 
                          onClick={() => addLayer('text')}
                          className="w-100"
                          disabled={!fontsLoaded || availableFonts.length === 0}
                        >
                          <i className="bi bi-type me-2"></i>
                          Add Text
                        </Button>
                        </Col>
                        <Col >
                        <Button 
                          variant="outline-primary" 
                          onClick={() => addLayer('image')}
                          className="w-100"
                        >
                          <i className="bi bi-card-image me-2"></i>
                          Add Container
                        </Button>
                        </Col>
                        </Row>

                      {!template.layers.some(layer => layer.type === 'design') && (
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <strong>Add a design background first!</strong> Upload a background design image before adding other layers.
                        </div>
                      )}
                  
                      <div className="layers-list">
                        {template.layers.length === 0 ? (
                          <div className="text-center text-muted p-4 border rounded">
                            <i className="bi bi-layers fs-4 d-block mb-2"></i>
                            <p className="mb-0">No layers added yet</p>
                            <small>Add layers using the buttons above</small>
                          </div>
                        ) : (
                          template.layers.map((layer, index) => (
                            <LayerItem
                              key={`${layer.id}-${JSON.stringify(layer.properties)}-${forceRenderKey}`}
                              layer={layer}
                              index={index}
                              moveLayer={moveLayer}
                              onVisibilityToggle={toggleLayerVisibility}
                              onDeleteLayer={deleteLayer}
                              onUpdateLayer={updateLayer}
                              images={images}
                              textVariables={textVariables}
                              availableFonts={availableFonts}
                              fontVariants={fontVariants}
                              fontMap={fontMap}
                              onForceRerender={() => setForceRenderKey(prev => prev + 1)}
                            />
                          ))
                        )}
                      </div>

                      {template.layers.length > 0 && (
                        <div className="mt-3">
                          <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Drag layers to reorder. Use checkboxes to toggle visibility.
                          </small>
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <Button 
                  variant="primary" 
                  className="w-100 mt-3"
                  onClick={handleSaveTemplate}
                  disabled={loading || !fontsLoaded}
                >
                <i className="bi bi-download me-2"></i>
                {loading ? 'Saving...' : 'Save Template'}
                </Button>

                {/* Validation Messages */}
                {(() => {
                  const validationMessages = getValidationMessages();
                  return validationMessages.length > 0 && (
                    <div className="mt-2">
                      {validationMessages.map((message, index) => (
                        <div key={index} className="alert alert-warning alert-sm mb-1 py-2">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <small>{message}</small>
                        </div>
                      ))}
                    </div>
                  );
                })()}
          
                <Button 
                  variant="danger" 
                  className="w-100 mt-2"
                  onClick={handleDeleteTemplate}
                  disabled={loading}
                >
                  <i className="bi bi-trash me-2"></i>
                  {loading ? 'Deleting..' : 'Delete Template'}
                </Button>              

              </Card.Body>
            </Card>
          </Col>

          <Col lg={7} xl={8} id='pdfDiv'>
          
            <div style={{ position: 'sticky', top: '0px', zIndex: 10, padding: '10px', backgroundColor: '#f8f9fa' }}>
              <Container fluid>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Button variant="primary" onClick={zoomOut} disabled={zoom <= 0.5} className="me-2">
                      <i className="bi bi-zoom-out"></i>
                    </Button>
                    <Button variant="primary" onClick={zoomIn} disabled={zoom >= 2} className="me-2">
                      <i className="bi bi-zoom-in"></i>
                    </Button>
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                  </Col>                  
                </Row>
              </Container>
            </div>

            <div style={{ width: '100%', overflowY: 'auto', position: 'relative', marginBottom: '20px' }}>
              <div
                id="drop"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: `${width}px`,
                  height: `${height}px`
                }}
              >
                <div 
                  ref={containerRef} 
                  style={{ width: "100%", position: "relative" }} 
                >
                  {isLoading ? (
                    <div className="text-center p-4">
                      <i className="bi bi-arrow-repeat spin fs-3 mb-2"></i>
                      <p>Loading canvas...</p>
                    </div>
                  ) : (
                    <div
                      ref={canvasRef}
                      style={{
                        border: '2px solid #dee2e6',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

          </Col>

        </Row>
      </DndProvider>
    </StateHandler>
  );
};

export default TemplateDesigner;