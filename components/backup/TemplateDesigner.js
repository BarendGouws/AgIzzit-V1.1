'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Row, Col, Card, Button, Form, Accordion, ButtonGroup , Container } from 'react-bootstrap';
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
  // Handle camelCase
  const separated = str.replace(/([A-Z])/g, ' $1');
  // Convert to title case
  return separated.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Font options
const fontOptions = [
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif' },
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, sans-serif' },
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Nunito', family: 'Nunito, sans-serif' },
  { name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif' },
  { name: 'Raleway', family: 'Raleway, sans-serif' },
  { name: 'Ubuntu', family: 'Ubuntu, sans-serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
  { name: 'Mulish', family: 'Mulish, sans-serif' },
  { name: 'Noto Sans', family: '"Noto Sans", sans-serif' },
  { name: 'PT Sans', family: '"PT Sans", sans-serif' },
  { name: 'Merriweather', family: 'Merriweather, serif' },
  { name: 'Work Sans', family: '"Work Sans", sans-serif' },
  { name: 'Oswald', family: 'Oswald, sans-serif' },
  { name: 'Quicksand', family: 'Quicksand, sans-serif' },
  { name: 'Rubik', family: 'Rubik, sans-serif' },
  { name: 'DM Sans', family: '"DM Sans", sans-serif' },
  { name: 'Josefin Sans', family: '"Josefin Sans", sans-serif' },
  { name: 'Karla', family: 'Karla, sans-serif' },
  { name: 'Barlow', family: 'Barlow, sans-serif' },
  { name: 'Roboto Mono', family: '"Roboto Mono", monospace' },
  { name: 'Space Grotesk', family: '"Space Grotesk", sans-serif' },
  { name: 'Outfit', family: 'Outfit, sans-serif' },
  { name: 'IBM Plex Sans', family: '"IBM Plex Sans", sans-serif' },
  { name: 'Be Vietnam Pro', family: '"Be Vietnam Pro", sans-serif' }
];

// Layer item component for the draggable layer list
const LayerItem = ({ layer, index, moveLayer, onVisibilityToggle, onDeleteLayer, onUpdateLayer, images, textVariables }) => {
  
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
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Get rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get mouse position
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
        return (
          <>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
              .font-select { font-size: 14px !important; }
              .font-select option { padding: 8px !important; }
            `}</style>
            <div className="mt-2">
              <Form.Select
                size="sm"
                className="mb-2"
                value={layer.properties.variable || ''}
                onChange={(e) => {
                  const newProps = {
                    ...layer.properties,
                    variable: e.target.value,
                    originalWidth: layer.properties.width,
                    originalHeight: layer.properties.height,
                    originalScaleX: layer.properties.scaleX,
                    originalScaleY: layer.properties.scaleY
                  };
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

              <ButtonGroup className="w-100 mb-2" size="sm">
                <Button
                  type="button"
                  variant={layer.properties.bold ? "primary" : "outline-primary"}
                  onClick={() => toggleFormat('bold')}
                >
                  <i className="bi bi-type-bold"></i>
                </Button>
                <Button
                  type="button"
                  variant={layer.properties.italic ? "primary" : "outline-primary"}
                  onClick={() => toggleFormat('italic')}
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

              <Row className="g-2">
                <Col xs={9}>
                  <Form.Select
                    size="sm"
                    value={layer.properties.fontFamily}
                    onChange={(e) => onUpdateLayer(layer.id, {
                      ...layer.properties,
                      fontFamily: e.target.value
                    })}
                    className="font-select"
                    style={{ 
                      fontFamily: fontOptions.find(f => f.name === layer.properties.fontFamily)?.family || 'Arial, sans-serif' 
                    }}
                  >
                    {fontOptions.map((font) => (
                      <option 
                        key={font.name} 
                        value={font.name}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
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

  const textVariables = useMemo(() => {
    if (!texts) return [];
    return Object.keys(texts).map(key => ({
      name: key,
      label: toTitleCase(key),
      value: texts[key]
    }));
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

  const getCanvasDimensions = (ratio) => {
    // Fixed base dimensions
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
        
            // Always allow pictures to be interactive regardless of layer order
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
              // For other objects, maintain the layer order restrictions
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
  
    // Clear existing canvas
    fabricRef.current.clear();
  
    // Process layers in reverse order (bottom to top)
    for (const layer of [...loadedTemplate.layers].reverse()) {
      switch (layer.type) {
        case 'design': {
          await new Promise((resolve) => {
            window.fabric.Image.fromURL(layer.properties.imageData, (fabricImg) => {
              
              const canvasWidth = fabricRef.current?.width;
              const canvasHeight = fabricRef.current?.height;
              if (!canvasWidth || !canvasHeight) return;

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
              resolve();
            });
          });
          break;
        }
        case 'picture': {
          await new Promise((resolve) => {
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
                padding: 5,
                lockUniScaling: true,
                visible: layer.visible
              });
  
              fabricRef.current.add(img);
              resolve();
            });
          });
          break;
        }
        case 'text': {
          const textbox = new fabric.Textbox(texts[layer.properties.variable] || layer.properties.text, {
            layerId: layer.id,
            left: layer.properties.left,
            top: layer.properties.top,
            width: layer.properties.width,
            height: layer.properties.height,
            fontSize: layer.properties.fontSize || 50,
            fontFamily: layer.properties.fontFamily,
            fill: layer.properties.color,
            textAlign: layer.properties.textAlign,
            splitByGrapheme: false,
            breakWords: true,
            lockUniScaling: true,
            padding: 10,
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
            fabricRef.current.renderAll();
          });
        
          textbox.on('rotating', () => {
            updateLayerData({ target: textbox });
          });
        
          fabricRef.current.add(textbox);
          fitTextToBox(textbox);
          break;
        }
        case 'image': {
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
            fabricRef.current.requestRenderAll();
          });
        
          fabricRef.current.add(rect);
        
          if (layer.properties.imageIndex !== null && 
              layer.properties.imageIndex !== undefined && 
              images[layer.properties.imageIndex]) {
            addImageToContainer(layer.id, layer.properties.imageIndex);
          }
          break;
        }
      }
    }
  
    fabricRef.current.renderAll();
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
  
          // Add the image to canvas and send to back
          fabricRef.current.add(fabricImg);
          fabricRef.current.sendToBack(fabricImg);
  
          // Add layer to the end of the layers array instead of the beginning
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

    if (!fabricRef.current) return;

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
      // Remove old image if exists
      const oldImage = fabricRef.current.getObjects().find(
        obj => obj.type === 'image' && obj.containerId === layerId
      );
      if (oldImage) {
        fabricRef.current.remove(oldImage);
      }
  
      // Calculate scale to fill container while maintaining aspect ratio
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
  
      // Create clipping path
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
  
      // Set up the image
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
  
      // Add image to canvas and position it right after the container
      fabricRef.current.add(img);
      fabricRef.current.moveTo(img, fabricRef.current.getObjects().indexOf(container) + 1);
  
      // Remove any existing event listeners
      container.off('moving');
      container.off('scaling');
      container.off('rotating');
  
      // Add new event listeners
      container.on('moving', () => {
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
        // Update clipPath with container's new dimensions
        clipPath.set({
          scaleX: container.scaleX,
          scaleY: container.scaleY,
          left: container.left,
          top: container.top
        });
  
        // Recalculate image scale to fit new container size
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
  
      // Ensure proper stacking order
      fabricRef.current.renderAll();
    });
  };

  const validateImageSize = (img, canvasWidth, canvasHeight) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    const tolerance = 0.03; // 3% tolerance

    if (Math.abs(imgRatio - canvasRatio) <= tolerance) {
      // Ratios are close enough, fill the canvas
      const scaleX = canvasWidth / img.width;
      const scaleY = canvasHeight / img.height;
      return Math.max(scaleX, scaleY);
    } else {
      // Ratios differ significantly, maintain aspect ratio
      if (imgRatio > canvasRatio) {
        // Image is wider, fill width
        return canvasWidth / img.width;
      } else {
        // Image is taller, fill height
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
  
    // Binary search for optimal font size
    let low = minFontSize;
    let high = fontSize;
  
    while (low <= high) {
      fontSize = Math.floor((low + high) / 2);
      
      textObject.set({
        fontSize: fontSize,
        width: boxWidth
      });
  
      // Get height after text wrapping
      const textHeight = textObject.calcTextHeight();
      
      if (textHeight <= boxHeight) {
        low = fontSize + 1;
      } else {
        high = fontSize - 1;
      }
    }
  
    // Use the largest font size that fits
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
  
    // Helper functions for getting next number
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
                padding: 5,
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
  
              // Add new layer to the beginning of the array (will appear on top)
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

          const defaultWidth = fabricRef.current.width * 0.3;
          const defaultHeight = fabricRef.current.height * 0.1;

          fabricObject = new fabric.Textbox('Select Variable', {
            left: 50,
            top: 50,
            width: defaultWidth,
            height: defaultHeight,
            fontSize: 50,
            layerId,
            fontFamily: 'Arial',
            fill: '#000000',
            textAlign: 'center',
            splitByGrapheme: false,
            breakWords: true,
            lockUniScaling: true,
            padding: 10,
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
            fontFamily: 'Arial',
            color: '#000000',
            left: 50,
            top: 50,
            width: defaultWidth,
            height: defaultHeight,
            fixedWidth: defaultWidth,
            fixedHeight: defaultHeight,
            originalWidth: defaultWidth,
            originalHeight: defaultHeight,
            textAlign: 'center',
            bold: false,
            italic: false,
            underline: false,
            fontSize: 50,
            angle: 0
          };
          break;
  
        case 'image':
          
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
            fabricRef.current.requestRenderAll();
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
  
      // Add new layer to the beginning of the array (will appear on top)
      setTemplate(prev => ({
        ...prev,
        layers: [newLayer, ...prev.layers]
      }));
    }
  };

  const updateLayer = (layerId, newProperties) => {

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
            if (newProperties.variable && texts[newProperties.variable]) {
              const font = fontOptions.find(f => f.name === (newProperties.fontFamily || layer.properties.fontFamily));
              const textStyles = {
                text: texts[newProperties.variable],
                fontFamily: font ? font.family : 'Arial, sans-serif',
                fill: newProperties.color || layer.properties.color,
                fontWeight: (newProperties.bold ?? layer.properties.bold) ? 'bold' : 'normal',
                fontStyle: (newProperties.italic ?? layer.properties.italic) ? 'italic' : 'normal',
                underline: newProperties.underline ?? layer.properties.underline,
              };
          
              fabricObject.set(textStyles);
              fitTextToBox(fabricObject);
              fabricRef.current.renderAll();
            } else {
              // Handle other property updates
              const updates = { ...newProperties };
              if ('bold' in updates) {
                fabricObject.set('fontWeight', updates.bold ? 'bold' : 'normal');
              }
              if ('italic' in updates) {
                fabricObject.set('fontStyle', updates.italic ? 'italic' : 'normal');
              }
              if ('underline' in updates) {
                fabricObject.set('underline', updates.underline);
              }
              if ('fontFamily' in updates) {
                const font = fontOptions.find(f => f.name === updates.fontFamily);
                if (font) {
                  fabricObject.set('fontFamily', font.family);
                }
              }
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
  
    // Handle design layer specially
    if (layerId === 'design-layer') {
      const designObject = fabricRef.current.getObjects().find(obj => obj.isDesign);
      if (designObject) {
        fabricRef.current.remove(designObject);
      }
    } else {
      // Handle other layers
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
    // Update the template state with the new layer order
    setTemplate(prev => {
      const newLayers = update(prev.layers, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prev.layers[dragIndex]],
        ],
      });
  
      if (fabricRef.current) {
        // Get all canvas objects
        const canvasObjects = fabricRef.current.getObjects();
        
        // Create a map of objects by layer ID for quick lookup
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
  
        // Clear the canvas
        fabricRef.current.clear();
  
        // Add objects back in the correct order (bottom to top)
        // Reverse the layers array since fabric.js renders bottom to top
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
          // Handle design layer visibility
          if (layer.type === 'design') {
            const designObject = fabricRef.current.getObjects().find(obj => obj.isDesign);
            if (designObject) {
              designObject.visible = !layer.visible;
              fabricRef.current.renderAll();
            }
          } else {
            // Handle other layers
            const objects = fabricRef.current.getObjects().filter(obj => 
              obj.layerId === layerId || obj.containerId === layerId
            );
            objects.forEach(obj => {
              obj.visible = !layer.visible;
            });
            fabricRef.current.renderAll();
          }
          return { ...layer, visible: !layer.visible };
        }
        return layer;
      })
    }));
  };

  const validateDesignRatio = (imgWidth, imgHeight, targetRatio) => {
    const imgRatio = imgWidth / imgHeight;
    const tolerance = 0.03; // 3% tolerance
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
      // Validate template name
      if (!template.name || template.name.trim() === '') {
        dispatch(setError('Template name is required'));
        return;
      }
  
      // Check for design layer
      const hasDesignLayer = template.layers.some(layer => layer.type === 'design');
      if (!hasDesignLayer) {
        dispatch(setError('Template must include a design/background image'));
        return;
      }
  
      // Check for at least one additional layer (text, image, or picture)
      const hasAdditionalLayer = template.layers.some(layer => layer.type !== 'design');
      if (!hasAdditionalLayer) {
        dispatch(setError('Template must include at least one additional layer (text, image, or picture)'));
        return;
      }
  
      // Validate all layers have required properties
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
  
      // If validation passes, save the template
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

  useEffect(() => { 
    const { id } = router.query;  
    if (id) dispatch(fetchAdvertisingTemplate(id));
  }, [router.query]);

  useEffect(() => {
    if (reduxTemplate) {
      setTemplate(reduxTemplate);
      if (fabricRef.current && assetsLoaded) {
        restoreCanvas(reduxTemplate);
      }
    }
  }, [reduxTemplate, assetsLoaded]);

  useEffect(() => {
    // Check if necessary data is loaded
    if (images && images.length > 0 && texts && Object.keys(texts).length > 0) {
      setAssetsLoaded(true);
    }
  }, [images, texts]);

  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.on('mouse:down', (e) => {
        if (e.target) {
          // All objects except design layer and container images should be interactive
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
    if (window.fabric) {
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
  }, [template.designSize]);

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

  return (
    <StateHandler slice="advertisingTemplate">
      <DndProvider backend={HTML5Backend}>
        <Script 
          src="/fabricjs/fabric.min.js"
          onLoad={() => {
            console.log('Fabric.js loaded successfully');
            initializeCanvas();
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
                          Add Design
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
                  disabled={loading || !template.name || template.layers.length === 0 }
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