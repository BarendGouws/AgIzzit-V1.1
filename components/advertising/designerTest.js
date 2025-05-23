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

// Predefined text variables
const toTitleCase = (str) => {
  const separated = str.replace(/([A-Z])/g, ' $1');
  return separated.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Dynamic font discovery from public/fonts directory
const discoverFonts = async () => {
  const fontMap = new Map();
  
  try {
    // Get list of font directories
    const fontDirs = [
      'almendra', 'archivo', 'barlow-condensed', 'bodoni-moda', 'cabin',
      'chivo', 'comic-neue', 'lato', 'montserrat', 'open-sans',
      'playfair-display', 'roboto', 'roboto-condensed', 'roboto-mono', 'ubuntu'
    ];

    for (const dir of fontDirs) {
      const familyName = dir.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      const variants = [];
      const variantChecks = [
        { file: 'Regular.ttf', variant: 'regular' },
        { file: 'Bold.ttf', variant: 'bold' },
        { file: 'Italic.ttf', variant: 'italic' },
        { file: 'BoldItalic.ttf', variant: 'bolditalic' }
      ];

      // Check which variants exist by trying to load them
      for (const { file, variant } of variantChecks) {
        try {
          const fontPath = `/fonts/${dir}/${file}`;
          const response = await fetch(fontPath);
          if (response.ok) {
            variants.push(variant);
            console.log(`✅ Found font: ${familyName} - ${variant}`);
          }
        } catch (error) {
          // Font doesn't exist, skip
        }
      }

      if (variants.length > 0) {
        fontMap.set(familyName, {
          name: familyName,
          folder: dir,
          variants
        });
      }
    }
  } catch (error) {
    console.error('Error discovering fonts:', error);
  }

  return fontMap;
};

// Load font using OpenType.js
const loadFontWithOpenType = async (fontFamily, variant = 'regular') => {
  if (!window.opentype) {
    console.warn('OpenType.js not loaded yet');
    return null;
  }

  try {
    const fontFolder = fontFamily.toLowerCase().replace(/\s+/g, '-');
    let fontFile;
    
    switch (variant) {
      case 'bold':
        fontFile = 'Bold.ttf';
        break;
      case 'italic':
        fontFile = 'Italic.ttf';
        break;
      case 'bolditalic':
        fontFile = 'BoldItalic.ttf';
        break;
      default:
        fontFile = 'Regular.ttf';
    }

    const fontPath = `/fonts/${fontFolder}/${fontFile}`;
    const font = await window.opentype.load(fontPath);
    return font;
  } catch (error) {
    console.warn(`Could not load font ${fontFamily} ${variant}:`, error);
    return null;
  }
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
  fontVariants 
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
    
    onUpdateLayer(layer.id, newProps);
  };

  // Get available variants for current font
  const getCurrentFontVariants = () => {
    const fontFamily = layer.properties?.fontFamily || 'Roboto';
    return fontVariants[fontFamily] || ['regular'];
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
            value={layer.properties.imageIndex || ''}
            onChange={(e) => onUpdateLayer(layer.id, {
              ...layer.properties,
              imageIndex: parseInt(e.target.value)
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
            <style>{`
              .font-select { font-size: 14px !important; }
              .font-select option { padding: 8px !important; }
            `}</style>
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

              <Row className="g-2">
                <Col xs={9}>
                  <Form.Select
                    size="sm"
                    value={layer.properties.fontFamily || 'Roboto'}
                    onChange={(e) => {
                      const newFontFamily = e.target.value;
                      const newVariants = fontVariants[newFontFamily] || ['regular'];
                      
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
                  >
                    {availableFonts.map((fontName) => (
                      <option key={fontName} value={fontName}>
                        {fontName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={3}>
                  <Form.Control
                    size="sm"
                    type="color"
                    value={layer.properties.color}
                    onChange={(e) => onUpdateLayer(layer.id, {
                      ...layer.properties,
                      color: e.target.value
                    })}
                    className="h-100 w-100"
                  />
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
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadedOpenTypeFonts, setLoadedOpenTypeFonts] = useState(new Map());

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

  // Load fonts using OpenType.js
  const loadFonts = async () => {
    try {
      console.log('Starting font discovery...');
      const fontMap = await discoverFonts();
      
      const fonts = Array.from(fontMap.keys());
      const variants = {};
      
      fontMap.forEach((fontInfo, fontName) => {
        variants[fontName] = fontInfo.variants;
      });
      
      setAvailableFonts(fonts);
      setFontVariants(variants);
      setFontsLoaded(true);
      
      console.log('Fonts loaded:', fonts);
      console.log('Font variants:', variants);
      
      // Preload some common fonts
      const commonFonts = ['Roboto', 'Open Sans', 'Montserrat'];
      for (const fontName of commonFonts) {
        if (fonts.includes(fontName)) {
          const font = await loadFontWithOpenType(fontName, 'regular');
          if (font) {
            setLoadedOpenTypeFonts(prev => new Map(prev.set(`${fontName}-regular`, font)));
          }
        }
      }
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Fallback
      setAvailableFonts(['Roboto', 'Open Sans', 'Montserrat']);
      setFontVariants({
        'Roboto': ['regular', 'bold', 'italic', 'bolditalic'],
        'Open Sans': ['regular', 'bold', 'italic', 'bolditalic'],
        'Montserrat': ['regular', 'bold', 'italic', 'bolditalic']
      });
      setFontsLoaded(true);
    }
  };

  // Get OpenType font (load if not cached)
  const getOpenTypeFont = async (fontFamily, variant = 'regular') => {
    const key = `${fontFamily}-${variant}`;
    
    if (loadedOpenTypeFonts.has(key)) {
      return loadedOpenTypeFonts.get(key);
    }
    
    const font = await loadFontWithOpenType(fontFamily, variant);
    if (font) {
      setLoadedOpenTypeFonts(prev => new Map(prev.set(key, font)));
    }
    
    return font;
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
                angle: layer.properties.angle,
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
            textValue = layer.properties.text || '';
          }
          
          const safeTextValue = typeof textValue === 'string' ? textValue : String(textValue);
          
          // Get appropriate font variant
          const fontName = layer.properties.fontFamily || 'Roboto';
          let variant = 'regular';
          if (layer.properties.bold && layer.properties.italic) {
            variant = 'bolditalic';
          } else if (layer.properties.bold) {
            variant = 'bold';
          } else if (layer.properties.italic) {
            variant = 'italic';
          }
          
          // Load the OpenType font for better rendering
          const loadFont = async () => {
            const openTypeFont = await getOpenTypeFont(fontName, variant);
            return openTypeFont;
          };
          
          // Use web-safe font as fallback for Fabric.js display
          const fontFamilyMap = {
            'Roboto': 'Arial, sans-serif',
            'Open Sans': 'Arial, sans-serif',
            'Montserrat': 'Arial, sans-serif',
            'Lato': 'Arial, sans-serif',
            'Cabin': 'Arial, sans-serif',
            'Playfair Display': 'Times, serif',
            'Roboto Mono': 'Courier, monospace',
            'Comic Neue': 'Comic Sans MS, cursive',
            'Ubuntu': 'Arial, sans-serif',
            'Archivo': 'Arial, sans-serif',
            'Almendra': 'Times, serif',
            'Barlow Condensed': 'Arial Narrow, sans-serif',
            'Bodoni Moda': 'Times, serif',
            'Chivo': 'Arial, sans-serif',
            'Roboto Condensed': 'Arial Narrow, sans-serif'
          };
          
          const displayFont = fontFamilyMap[fontName] || 'Arial, sans-serif';
          const textAlign = layer.properties.textAlign || 'left';
          
          const textbox = new window.fabric.Textbox(safeTextValue, {
            layerId: layer.id,
            left: layer.properties.left,
            top: layer.properties.top,
            width: layer.properties.width,
            height: layer.properties.height,
            fontSize: layer.properties.fontSize || 50,
            fontFamily: displayFont,
            fill: layer.properties.color,
            textAlign: textAlign,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            breakWords: true,
            lockUniScaling: true,
            padding: 0,
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
            fontWeight: layer.properties.bold ? 'bold' : 'normal',
            fontStyle: layer.properties.italic ? 'italic' : 'normal',
            underline: layer.properties.underline,
            visible: layer.visible,
            fixedWidth: layer.properties.fixedWidth || layer.properties.width,
            fixedHeight: layer.properties.fixedHeight || layer.properties.height,
            scaleX: 1,
            scaleY: 1,
            angle: layer.properties.angle || 0,
            centeredRotation: true
          });
        
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
          
          // Load the OpenType font for future server rendering
          loadFont();
          break;
        }
        case 'image': {
          if (!window.fabric || !fabricRef.current) {
            continue;
          }
          
          const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
          const containerWidth = fabricRef.current.width * 0.3;
          const containerHeight = (containerWidth * ratioH) / ratioW;
        
          const rect = new window.fabric.Rect({
            layerId: layer.id,
            left: layer.properties.left,
            top: layer.properties.top,
            width: containerWidth,
            height: containerHeight,
            scaleX: layer.properties.scaleX,
            scaleY: layer.properties.scaleY,
            angle: layer.properties.angle,
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
            strokeUniform: true
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
          
            if (layer.properties.imageIndex !== null && 
                layer.properties.imageIndex !== undefined && 
                images[layer.properties.imageIndex]) {
              addImageToContainer(layer.id, layer.properties.imageIndex);
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

    if (!images || !images[imageIndex]) {
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
        evented: false
      });
  
      if (fabricRef.current) {
        fabricRef.current.add(img);
        fabricRef.current.moveTo(img, fabricRef.current.getObjects().indexOf(container) + 1);
      
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
    const tolerance = 0.03; // 3% tolerance

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
    
    let fontSize = 100;
    const minFontSize = 8;
    
    textObject.set({
      width: boxWidth,
      height: boxHeight,
      scaleX: 1,
      scaleY: 1
    });
  
    let low = minFontSize;
    let high = fontSize;
  
    while (low <= high) {
      fontSize = Math.floor((low + high) / 2);
      
      textObject.set({
        fontSize: fontSize,
        width: boxWidth
      });
  
      const textHeight = textObject.calcTextHeight();
      
      if (textHeight <= boxHeight) {
        low = fontSize + 1;
      } else {
        high = fontSize - 1;
      }
    }
  
    fontSize = high;
    
    textObject.set({
      fontSize: fontSize,
      width: boxWidth,
      height: boxHeight,
      scaleX: 1,
      scaleY: 1
    });
  
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
                  top: 50
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
          
          // Use first available font
          const firstFont = availableFonts[0] || 'Roboto';
          const fontFamilyMap = {
            'Roboto': 'Arial, sans-serif',
            'Open Sans': 'Arial, sans-serif',
            'Montserrat': 'Arial, sans-serif',
            'Lato': 'Arial, sans-serif',
            'Cabin': 'Arial, sans-serif',
            'Playfair Display': 'Times, serif',
            'Roboto Mono': 'Courier, monospace',
            'Comic Neue': 'Comic Sans MS, cursive',
            'Ubuntu': 'Arial, sans-serif',
            'Archivo': 'Arial, sans-serif',
            'Almendra': 'Times, serif',
            'Barlow Condensed': 'Arial Narrow, sans-serif',
            'Bodoni Moda': 'Times, serif',
            'Chivo': 'Arial, sans-serif',
            'Roboto Condensed': 'Arial Narrow, sans-serif'
          };
          
          const displayFont = fontFamilyMap[firstFont] || 'Arial, sans-serif';

          fabricObject = new window.fabric.Textbox('Select Variable', {
            left: 50,
            top: 50,
            width: defaultWidth,
            height: defaultHeight,
            fontSize: 50,
            layerId,
            fontFamily: displayFont,
            fill: '#000000',
            textAlign: 'left',
            originX: 'left', 
            originY: 'top',
            splitByGrapheme: false,
            breakWords: true,
            lockUniScaling: true,
            padding: 0,
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
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            centeredRotation: true
          });

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
            fontFamily: firstFont,
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
            imageIndex: null
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
            addImageToContainer(layerId, newProperties.imageIndex);
          } else if (layer.type === 'text') {
            if (newProperties.variable && texts[newProperties.variable] !== undefined) {
              // Get appropriate font variant
              const fontName = newProperties.fontFamily || layer.properties.fontFamily || 'Roboto';
              let variant = 'regular';
              
              if ((newProperties.bold ?? layer.properties.bold) && (newProperties.italic ?? layer.properties.italic)) {
                variant = 'bolditalic';
              } else if (newProperties.bold ?? layer.properties.bold) {
                variant = 'bold';
              } else if (newProperties.italic ?? layer.properties.italic) {
                variant = 'italic';
              }
              
              // Load OpenType font for accurate rendering
              const loadOpenTypeFont = async () => {
                const openTypeFont = await getOpenTypeFont(fontName, variant);
                if (openTypeFont) {
                  console.log(`Loaded OpenType font: ${fontName} ${variant}`);
                }
              };
              loadOpenTypeFont();
              
              // Use web-safe font for Fabric.js display
              const fontFamilyMap = {
                'Roboto': 'Arial, sans-serif',
                'Open Sans': 'Arial, sans-serif',
                'Montserrat': 'Arial, sans-serif',
                'Lato': 'Arial, sans-serif',
                'Cabin': 'Arial, sans-serif',
                'Playfair Display': 'Times, serif',
                'Roboto Mono': 'Courier, monospace',
                'Comic Neue': 'Comic Sans MS, cursive',
                'Ubuntu': 'Arial, sans-serif',
                'Archivo': 'Arial, sans-serif',
                'Almendra': 'Times, serif',
                'Barlow Condensed': 'Arial Narrow, sans-serif',
                'Bodoni Moda': 'Times, serif',
                'Chivo': 'Arial, sans-serif',
                'Roboto Condensed': 'Arial Narrow, sans-serif'
              };
              
              const displayFont = fontFamilyMap[fontName] || 'Arial, sans-serif';
              
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
              
              const textStyles = {
                text: textValue,
                fontFamily: displayFont,
                fill: newProperties.color || layer.properties.color,
                fontWeight: (newProperties.bold ?? layer.properties.bold) ? 'bold' : 'normal',
                fontStyle: (newProperties.italic ?? layer.properties.italic) ? 'italic' : 'normal',
                underline: newProperties.underline ?? layer.properties.underline,
                textAlign: newProperties.textAlign || layer.properties.textAlign || 'left'
              };
          
              // Preserve textbox dimensions when changing formatting
              const currentWidth = fabricObject.fixedWidth || fabricObject.width;
              const currentHeight = fabricObject.fixedHeight || fabricObject.height;
              
              fabricObject.set({
                ...textStyles,
                width: currentWidth,
                height: currentHeight,
                fixedWidth: currentWidth,
                fixedHeight: currentHeight,
                scaleX: 1,
                scaleY: 1
              });
              
              fitTextToBox(fabricObject);
              fabricRef.current.renderAll();
            } else {
              // Handle other property updates while preserving dimensions
              const updates = { ...newProperties };
              const currentWidth = fabricObject.fixedWidth || fabricObject.width;
              const currentHeight = fabricObject.fixedHeight || fabricObject.height;
              
              if ('bold' in updates || 'italic' in updates || 'fontFamily' in updates) {
                const fontName = updates.fontFamily || layer.properties.fontFamily || 'Roboto';
                let variant = 'regular';
                
                if ((updates.bold ?? layer.properties.bold) && (updates.italic ?? layer.properties.italic)) {
                  variant = 'bolditalic';
                } else if (updates.bold ?? layer.properties.bold) {
                  variant = 'bold';
                } else if (updates.italic ?? layer.properties.italic) {
                  variant = 'italic';
                }
                
                // Load OpenType font
                const loadOpenTypeFont = async () => {
                  const openTypeFont = await getOpenTypeFont(fontName, variant);
                  if (openTypeFont) {
                    console.log(`Loaded OpenType font: ${fontName} ${variant}`);
                  }
                };
                loadOpenTypeFont();
                
                // Update display font
                const fontFamilyMap = {
                  'Roboto': 'Arial, sans-serif',
                  'Open Sans': 'Arial, sans-serif',
                  'Montserrat': 'Arial, sans-serif',
                  'Lato': 'Arial, sans-serif',
                  'Cabin': 'Arial, sans-serif',
                  'Playfair Display': 'Times, serif',
                  'Roboto Mono': 'Courier, monospace',
                  'Comic Neue': 'Comic Sans MS, cursive',
                  'Ubuntu': 'Arial, sans-serif',
                  'Archivo': 'Arial, sans-serif',
                  'Almendra': 'Times, serif',
                  'Barlow Condensed': 'Arial Narrow, sans-serif',
                  'Bodoni Moda': 'Times, serif',
                  'Chivo': 'Arial, sans-serif',
                  'Roboto Condensed': 'Arial Narrow, sans-serif'
                };
                
                const displayFont = fontFamilyMap[fontName] || 'Arial, sans-serif';
                fabricObject.set('fontFamily', displayFont);
              }
              
              if ('bold' in updates) {
                fabricObject.set('fontWeight', updates.bold ? 'bold' : 'normal');
              }
              if ('italic' in updates) {
                fabricObject.set('fontStyle', updates.italic ? 'italic' : 'normal');
              }
              if ('underline' in updates) {
                fabricObject.set('underline', updates.underline);
              }
              if ('color' in updates) {
                fabricObject.set('fill', updates.color);
              }
              if ('textAlign' in updates) {
                fabricObject.set('textAlign', updates.textAlign);
              }
              
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
          } else {
            const objects = fabricRef.current?.getObjects().filter(obj => 
              obj.layerId === layerId || obj.containerId === layerId
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

  const handleSaveTemplate = async () => {
    try {
      if (!template.name || template.name.trim() === '') {
        dispatch(setError('Template name is required'));
        return;
      }
  
      const hasDesignLayer = template.layers.some(layer => layer.type === 'design');
      if (!hasDesignLayer) {
        dispatch(setError('Template must include a design/background image'));
        return;
      }
  
      const hasAdditionalLayer = template.layers.some(layer => layer.type !== 'design');
      if (!hasAdditionalLayer) {
        dispatch(setError('Template must include at least one additional layer (text, image, or picture)'));
        return;
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
        dispatch(setError(`The following layers have missing required properties: ${layerTypes}`));
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

  // Load fonts and OpenType.js on component mount
  useEffect(() => {
    const loadOpenTypeScript = () => {
      if (window.opentype) {
        loadFonts();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js';
      script.onload = () => {
        console.log('OpenType.js loaded successfully');
        loadFonts();
      };
      script.onerror = () => {
        console.error('Failed to load OpenType.js');
        // Fallback without OpenType
        setAvailableFonts(['Roboto', 'Open Sans', 'Montserrat']);
        setFontVariants({
          'Roboto': ['regular', 'bold', 'italic', 'bolditalic'],
          'Open Sans': ['regular', 'bold', 'italic', 'bolditalic'],
          'Montserrat': ['regular', 'bold', 'italic', 'bolditalic']
        });
        setFontsLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadOpenTypeScript();
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

  console.log('Template Loaded:', template);
  console.log('Fonts Loaded:', fontsLoaded, 'Available Fonts:', availableFonts);

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

                      {!fontsLoaded && (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Loading font information...
                        </div>
                      )}

                      {fontsLoaded && (
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
                          disabled={!fontsLoaded}
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
                              key={`${layer.id}-${JSON.stringify(layer.properties)}`}
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
                  disabled={loading || !template.name || template.layers.length === 0 || !fontsLoaded || !template.layers.some(layer => layer.type === 'design')}
                >
                <i className="bi bi-download me-2"></i>
                {loading ? 'Saving...' : 'Save Template'}
                </Button>
          
                <Button 
                  variant="danger" 
                  className="w-100 mt-2"
                  onClick={handleDeleteTemplate}
                  disabled={loading}
                >
                  <i className="bi bi-trash me-2"></i>
                  {loading ? 'Deleting...' : 'Delete Template'}
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
                  {fontsLoaded && (
                    <Col>
                      <small className="text-muted">
                        OpenType.js ready - {availableFonts.length} fonts available
                      </small>
                    </Col>
                  )}
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