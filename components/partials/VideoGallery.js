import React, { Fragment, useState, useRef } from "react";
import { Col, Row, Card, Form, Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { User, Trash2, Play, X, Info } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from "next/router";
import { uploadVideo, deleteVideo } from '@/redux/manage/slices/inventory';

const ItemTypes = {
  CARD: 'card'
};

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

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const AddVideoModal = ({ show, onHide, onAdd }) => {

  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    onAdd({ url, caption, thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`});
    setUrl('');
    setCaption('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add YouTube Video</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>YouTube URL</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter YouTube video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            isInvalid={!!error}
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label>Caption (optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Video</Button>
      </Modal.Footer>
    </Modal>
  );
};

const VideoPlayerModal = ({ show, onHide, video }) => {
  if (!video) return null;
  
  const videoId = getYouTubeVideoId(video.url);
  
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header className="border-0 p-3">
        <Modal.Title className="text-primary">{video.caption || 'Video Player'}</Modal.Title>
        <Button
          variant="link"
          className="p-0 ms-auto border-0 text-dark"
          onClick={onHide}
        >
          <X size={24} />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="ratio ratio-16x9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const DraggableCard = ({ video, index, moveVideo, handleDelete, handleCaptionChange, onPlay }) => {
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
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveVideo(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Col xl={2} lg={3} md={4} sm={6} xs={12}>
      <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Card className="custom-card overflow-hidden">
          <div className="position-relative">
            <div 
              className="cursor-pointer"
              onClick={() => onPlay(video)}
            >
              <img
                src={video.thumbnailUrl}
                alt={video.caption || `Video ${index + 1}`}
                className="w-100"
                style={{ 
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  display: "block"
                }}
              />
              <div className="position-absolute top-50 start-50 translate-middle">
                <Play size={48} className="text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
              </div>
            </div>
            <UploadInfo 
              uploadedBy={video.uploadedBy} 
              uploadedAt={video.uploadedAt}
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
            value={video.caption || ''}
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

const VideoGallery = ({ inventoryItem, handleInputChange }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const handleAddVideo = async (newVideo) => {
    try {
      const videoId = getYouTubeVideoId(newVideo.url);
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }

      await dispatch(uploadVideo({
        itemId: id,
        videoId,
        url: newVideo.url,
        caption: newVideo.caption
      })).unwrap();
      
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video. Please try again.');
    }
  };

  const handleDelete = async (index) => {
    try {
      const videoToDelete = inventoryItem.videos[index];
      await dispatch(deleteVideo({
        itemId: id,
        videoId: videoToDelete._id
      })).unwrap();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const handleCaptionChange = (index, newCaption) => {
    const updatedVideos = inventoryItem.videos.map((video, i) => 
      i === index ? { ...video, caption: newCaption } : video
    );
    handleInputChange('videos', updatedVideos);
  };

  const moveVideo = (dragIndex, hoverIndex) => {
    const updatedVideos = [...inventoryItem.videos];
    const dragVideo = updatedVideos[dragIndex];
    updatedVideos.splice(dragIndex, 1);
    updatedVideos.splice(hoverIndex, 0, dragVideo);
    handleInputChange('videos', updatedVideos);
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Fragment>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div className="main-content-label text-primary">
            Videos
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="video-tooltip">
                  Add a YouTube link for a video related to this listing. 
                  Ensure that monetization is turned off to prevent adverts from appearing.
                </Tooltip>
              }
            >
              <span className="ms-2">
                <Info size={16} className="text-muted" style={{ cursor: "pointer" }} />
              </span>
            </OverlayTrigger>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            Add Video
          </Button>
        </div>
               
        {!inventoryItem?.videos?.length ? (
          <div className="text-muted">No videos added.</div>
        ) : (
          <Row className="row-sm">
            {(inventoryItem.videos || []).map((video, index) => (
              <DraggableCard
                key={`${video.url}-${index}`}
                video={video}
                index={index}
                moveVideo={moveVideo}
                handleDelete={handleDelete}
                handleCaptionChange={handleCaptionChange}
                onPlay={handlePlayVideo}
              />
            ))}
          </Row>
        )}

        <AddVideoModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onAdd={handleAddVideo}
        />

        <VideoPlayerModal
          show={showPlayer}
          onHide={() => {
            setShowPlayer(false);
            setSelectedVideo(null);
          }}
          video={selectedVideo}
        />
      </Fragment>
    </DndProvider>
  );
};

export default VideoGallery;