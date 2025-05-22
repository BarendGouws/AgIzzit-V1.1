import React, { Fragment, useState, useCallback, useRef, useEffect } from "react";
import { Col, Row, Card, Form, Modal, Button, OverlayTrigger, Tooltip  } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { User, Trash2, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useDispatch } from 'react-redux';
import { uploadImages, deleteImage } from '@/redux/manage/slices/inventory';
import { useRouter } from "next/router";

const UploadInfo = ({ uploadedBy, uploadedAt }) => {
  if (!uploadedBy?.fullNames) return null;

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip>
          Uploaded by {uploadedBy.fullNames}
          <br />
          {new Date(uploadedAt).toLocaleString()}
        </Tooltip>
      }
    >
      <Button
        variant="light"
        size="sm"
        className="position-absolute"
        style={{ 
          top: "8px", 
          right: "48px", // Position it next to delete button
          zIndex: 1,
          padding: "0.25rem",
          minWidth: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <User size={16} />
      </Button>
    </OverlayTrigger>
  );
};

const DraggableCard = ({ image, index, moveImage, handleDelete, handleCaptionChange, setPhotoIndex, setLightboxOpen }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'IMAGE_CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'IMAGE_CARD',
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
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
            <UploadInfo 
                uploadedBy={image.uploadedBy} 
                uploadedAt={image.uploadedAt}
              />

            <Button
              variant="danger"
              size="sm"
              className="position-absolute"
              style={{ 
                top: "8px", 
                right: "8px",
                zIndex: 1,
                padding: "0.25rem",
                minWidth: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(index);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <Form.Control
            type="text"
            size="sm"
            value={image.caption || ''}
            onChange={(e) => handleCaptionChange(index, e.target.value)}
            placeholder="Add caption"
            className="border-top rounded-0"
            style={{ 
              boxShadow: 'none',
              backgroundColor: 'transparent'
            }}
          />
        </Card>
      </div>
    </Col>
  );
};

const resizeImage = async (file, maxDimension = 1000) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(img.src);
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const ImageGallery = ({ inventoryItem, handleInputChange }) => { 

  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  // UI States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Image Processing States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (showCropModal && selectedFiles[currentImageIndex]?.preview) {
      // Cleanup previous URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // Create new URL
      const url = URL.createObjectURL(selectedFiles[currentImageIndex].preview);
      setPreviewUrl(url);
    } else {
      // Cleanup when modal closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [showCropModal, selectedFiles, currentImageIndex]);

  const checkAspectRatio = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const targetRatio = 4/3;
        const tolerance = 0.02;
        const needsCrop = Math.abs(ratio - targetRatio) > tolerance;
        URL.revokeObjectURL(img.src);
        resolve(needsCrop);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
  
    console.log('Selected files:', files.length);
  
    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const preview = await resizeImage(file, 1000);  // Add preview
          const needsCrop = await checkAspectRatio(file);
          return { 
            original: file,
            preview,  // Add preview to object
            needsCrop,
            uploaded: false
          };
        })
      );
  
      console.log('Processed files:', processedFiles);
      setSelectedFiles(processedFiles);
      setCurrentImageIndex(0);
  
      // Process files in strict order
      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];
        if (file.needsCrop) {
          setCurrentImageIndex(i);
          setShowCropModal(true);
          break;
        } else {
          setCurrentImageIndex(i);
          // Pass true for isAutoUpload since these don't need cropping
          await handleUploadImage(file.original, true);
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
    }
  
    e.target.value = '';
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUploadImage = async (file, isAutoUpload = false) => {
    try {
      console.log('Starting upload for index:', currentImageIndex);
      setIsUploading(true);
  
      // If this is an auto-upload, we know it doesn't need cropping
      const needsCropping = !isAutoUpload && selectedFiles[currentImageIndex]?.needsCrop;
      
      await dispatch(uploadImages({
        files: [file],
        itemId: id,
        cropData: needsCropping ? croppedAreaPixels : null
      })).unwrap();
  
      console.log('Upload complete for index:', currentImageIndex);
  
      setSelectedFiles(prevFiles => 
        prevFiles.map((f, idx) => 
          idx === currentImageIndex ? { ...f, uploaded: true } : f
        )
      );
  
      // Calculate progress
      const progress = ((currentImageIndex + 1) / selectedFiles.length) * 100;
      setUploadProgress(progress);
  
      // If this is the last file, reset progress bar
      if (currentImageIndex === selectedFiles.length - 1) {
        setTimeout(() => {
          setUploadProgress(0);
        }, 500);
      }
  
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !selectedFiles[currentImageIndex]) return;
  
    setShowCropModal(false);
    
    // Upload current cropped file
    await handleUploadImage(selectedFiles[currentImageIndex].original);
  
    // Continue with remaining files
    const remainingFiles = selectedFiles.slice(currentImageIndex + 1);
    for (let i = 0; i < remainingFiles.length; i++) {
      const actualIndex = currentImageIndex + 1 + i;
      const file = remainingFiles[i];
      
      setCurrentImageIndex(actualIndex);
      if (file.needsCrop) {
        setShowCropModal(true);
        break;
      } else {
        await new Promise(async (resolve) => {
          await handleUploadImage(file.original);
          resolve();
        });
      }
    }
  };

  const resetUploadState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFiles(prevFiles => {
      // Cleanup any preview URLs in selected files
      prevFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      return [];
    });
    setCurrentImageIndex(0);
    setUploadProgress(0);
    setIsUploading(false);
    setShowCropModal(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleDelete = async (index) => {
    try {
      const imageToDelete = inventoryItem.images[index];
      await dispatch(deleteImage({ 
        itemId: id, 
        imageId: imageToDelete._id 
      })).unwrap();
      
      // Redux will handle state update
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleCaptionChange = (index, newCaption) => {
    const updatedImages = inventoryItem.images.map((img, i) => 
      i === index ? { ...img, caption: newCaption } : img
    );
    handleInputChange('images', updatedImages);
  };

  const moveImage = (dragIndex, hoverIndex) => {
    const updatedImages = [...inventoryItem.images];
    const draggedImage = updatedImages[dragIndex];
    updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, draggedImage);
    handleInputChange('images', updatedImages);
  }; 

  return (
    <DndProvider backend={HTML5Backend}>
      <Fragment>
        {/* Header and Upload Button */}
        <div className="mb-2 d-flex justify-content-between align-items-center mb-3">
          <div className="main-content-label text-primary">Images</div>
          <div className="d-flex align-items-center gap-3">
            {isUploading && (
              <div className="d-flex align-items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>
                  Uploading {currentImageIndex + 1} of {selectedFiles.length}
                </span>
              </div>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
              disabled={isUploading}
            />
            <Button 
              variant="primary"
              size="sm"
              onClick={() => document.getElementById('image-upload').click()}
              disabled={isUploading}
            >
              Add Images
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="progress mb-3" style={{ height: "4px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        )}

        {/* Image Grid */}
        {!inventoryItem?.images?.length ? (
          <div className="text-muted">No images added.</div>
        ) : (
          <Row className="row-sm">
            {inventoryItem.images.map((image, index) => (
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

        {/* Cropper Modal */}
        <Modal 
          show={showCropModal} 
          fullscreen={true} 
          onHide={() => !isUploading && setShowCropModal(false)}
        >
          <Modal.Header closeButton={!isUploading}>
          <Modal.Title>
            {selectedFiles.length === 1 
              ? 'Crop Image'
              : `Crop Image ${currentImageIndex + 1} of ${selectedFiles.length}`
            }
          </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {selectedFiles[currentImageIndex] && (
              <div style={{ position: 'relative', height: 'calc(100vh - 140px)' }}>
                <Cropper
                  image={URL.createObjectURL(
                    //selectedFiles[currentImageIndex].preview || the whole image cropping is then incorrect due to change in px
                    selectedFiles[currentImageIndex].original
                  )}
                  crop={crop}
                  zoom={zoom}
                  aspect={4/3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCropModal(false);
                resetUploadState();
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCropSave}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save & Upload'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Lightbox */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={photoIndex}
          slides={inventoryItem?.images?.map(img => ({
            src: img.url,
            alt: img.caption
          }))}
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          zoom={{
            maxZoomPixelRatio: 10,
            scrollToZoom: true
          }}
        />
      </Fragment>
    </DndProvider>
  );
};

export default ImageGallery;