import React, { Fragment, useState, useCallback, useRef } from "react";
import { Col, Row, Card, Form, Modal, Button } from "react-bootstrap";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Trash2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { useDispatch } from 'react-redux';
import { uploadImages, deleteImage } from '@/redux/manage/slices/inventory';
import { useRouter } from "next/router";

const ItemTypes = {
  CARD: 'card'
};

const DraggableCard = ({ image, index, moveImage, handleDelete, handleCaptionChange, setPhotoIndex, setLightboxOpen }) => {
  const ref = useRef();
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Col xl={2} lg={3} md={4} sm={6} xs={12} key={`${image.url}-${index}`}>
      <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Card className="custom-card overflow-hidden">
          <div className="position-relative">
            <div 
              className="cursor-pointer"
              onClick={() => {
                setPhotoIndex(index);
                setLightboxOpen(true);
              }}
            >
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                className="w-100"
                style={{ 
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  display: "block"
                }}
              />
            </div>
            <button
              className="position-absolute btn btn-danger btn-sm p-1"
              style={{ 
                top: "8px", 
                right: "8px",
                zIndex: 1,
                minWidth: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px"
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(index);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="border-top" style={{ marginTop: "-1px" }}>
            <Form.Control
              type="text"
              size="sm"
              value={image.caption || ''}
              onChange={(e) => handleCaptionChange(index, e.target.value)}
              placeholder="Add caption"
              className="border-0 rounded-0"
              style={{ 
                boxShadow: 'none',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </Card>
      </div>
    </Col>
  );
};

const ImageGallery = ({ inventoryItem, handleInputChange }) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const { id } = router.query;

  // Gallery states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Upload and Crop Modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cropStates, setCropStates] = useState({});
  const [croppedAreas, setCroppedAreas] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(results => {
      setUploadedImages(results);
      setShowCropModal(true);
      setCurrentImageIndex(0);
      const initialCropStates = {};
      results.forEach((_, index) => {
        initialCropStates[index] = {
          crop: { x: 0, y: 0 },
          zoom: 1
        };
      });
      setCropStates(initialCropStates);
    });

    e.target.value = '';
  };

  // Cropping functions
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreas(prev => ({
      ...prev,
      [currentImageIndex]: { croppedArea, croppedAreaPixels }
    }));
  }, [currentImageIndex]);

  const onCropChange = useCallback((crop) => {
    setCropStates(prev => ({
      ...prev,
      [currentImageIndex]: {
        ...prev[currentImageIndex],
        crop
      }
    }));
  }, [currentImageIndex]);

  const onZoomChange = useCallback((zoom) => {
    setCropStates(prev => ({
      ...prev,
      [currentImageIndex]: {
        ...prev[currentImageIndex],
        zoom
      }
    }));
  }, [currentImageIndex]);

  // Image processing
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const compressedFile = await imageCompression(blob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920
        });
        resolve(URL.createObjectURL(compressedFile));
      }, 'image/jpeg');
    });
  };

  // Navigation
  const handlePrevious = () => {
    setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex(Math.min(uploadedImages.length - 1, currentImageIndex + 1));
  };

  // File conversion and upload
  const dataURLtoFile = async (dataUrl, fileName = 'image.jpg') => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: 'image/jpeg' });
  };

  const handleCropSave = async () => {
    try {
      setIsUploading(true);
      
      // Process all images through cropping
      const processedImages = await Promise.all(
        uploadedImages.map(async (image, index) => {
          const cropData = croppedAreas[index];
          if (cropData) {
            const croppedUrl = await getCroppedImg(image, cropData.croppedAreaPixels);
            return croppedUrl;
          }
          return image;
        })
      );

      // Convert processed DataURLs to Files
      const imageFiles = await Promise.all(
        processedImages.map((dataUrl, index) => 
          dataURLtoFile(dataUrl, `image-${index}.jpg`)
        )
      );

      console.log('Uploading images:', imageFiles);

      // Upload images using the slice
      const result = await dispatch(uploadImages({
        files: imageFiles,
        itemId: id
      })).unwrap();

      // Reset states
      setShowCropModal(false);
      setUploadedImages([]);
      setCropStates({});
      setCroppedAreas({});
      setCurrentImageIndex(0);

    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Gallery functions
  const handleDelete = async (index) => {
      try {
        const imageToDelete = inventoryItem.images[index];
        await dispatch(deleteImage({ 
          itemId: id, 
          imageId: imageToDelete._id 
        })).unwrap();
        
        // Local state will be updated via the useEffect when redux store updates
      } catch (error) {
        console.error('Error deleting image:', error);
      }
  };

  const handleCaptionChange = async (index, newCaption) => {
    try {
      const currentImages = inventoryItem?.images || [];
      const updatedImages = currentImages.map((img, i) => 
        i === index ? { ...img, caption: newCaption } : img
      );
  
      // Update local state immediately for responsive UI
      handleInputChange('images', updatedImages); 

  
    } catch (error) {
      console.error('Error updating caption:', error);
      // Revert to original state if save fails
      handleInputChange('images', inventoryItem?.images || []);
    }
  };

  // Drag and Drop functionality
  const moveImage = async (dragIndex, hoverIndex) => {
    try {
      const currentImages = inventoryItem?.images || [];
      const updatedImages = [...currentImages];
      const dragCard = updatedImages[dragIndex];
      updatedImages.splice(dragIndex, 1);
      updatedImages.splice(hoverIndex, 0, dragCard);

      handleInputChange('images', updatedImages);
  
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  const currentCropState = cropStates[currentImageIndex] || { crop: { x: 0, y: 0 }, zoom: 1 };

  return (
    <DndProvider backend={HTML5Backend}>
      <Fragment>
        <div className="mb-2 d-flex justify-content-between align-items-center mb-3">
          <div className="main-content-label text-primary">Images</div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <Button 
            onClick={() => document.getElementById('image-upload').click()}
            className="btn btn-primary btn-sm"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Images'}
          </Button>
        </div>
               
        {!inventoryItem?.images?.length ? (
          <div className="text-muted">No images added.</div>
        ) : (
          <Row className="row-sm">
            {(inventoryItem?.images || []).map((image, index) => (
              <DraggableCard
                key={`${image.url}-${index}`}
                image={image}
                index={index}
                moveImage={moveImage}
                handleDelete={handleDelete}
                handleCaptionChange={handleCaptionChange}
                setPhotoIndex={setPhotoIndex}
                setLightboxOpen={setLightboxOpen}
              />
            ))}
          </Row>
        )}

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={photoIndex}
          slides={(inventoryItem?.images || []).map(img => ({
            src: img.url,
            alt: img.caption
          }))}
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          zoom={{
            maxZoomPixelRatio: 10,
            scrollToZoom: true
          }}
        />

        <Modal 
          show={showCropModal} 
          fullscreen={true} 
          onHide={() => !isUploading && setShowCropModal(false)}
        >
          <Modal.Header closeButton={!isUploading}>
            <Modal.Title>
              {uploadedImages.length === 1 
                ? 'Crop Image'
                : `Crop Image ${currentImageIndex + 1} of ${uploadedImages.length}`
              }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div style={{ position: 'relative', height: 'calc(100vh - 140px)' }}>
              {uploadedImages[currentImageIndex] && (
                <Cropper
                  image={uploadedImages[currentImageIndex]}
                  crop={currentCropState.crop}
                  zoom={currentCropState.zoom}
                  aspect={4/3}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropComplete}
                  objectFit="contain"
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            {currentImageIndex > 0 && (
              <Button 
                variant="secondary" 
                onClick={handlePrevious}
                disabled={isUploading}
              >
                Previous
              </Button>
            )}
            {currentImageIndex < uploadedImages.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={isUploading}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleCropSave}
                disabled={isUploading}
              >
                {isUploading 
                  ? 'Uploading...' 
                  : uploadedImages.length === 1 
                    ? 'Save Image' 
                    : 'Save All Images'
                }
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Fragment>
    </DndProvider>
  );
};

export default ImageGallery;