import React, { Fragment, useState, useRef } from "react";
import { Col, Row, Card, Form, Button, Modal, OverlayTrigger, Tooltip  } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { User, Trash2, FileText, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { uploadDocuments, deleteDocument } from '@/redux/manage/slices/inventory';
import { useRouter } from "next/router";
import { documentTypes } from '@/utils/config';

const ItemTypes = {
  CARD: 'card'
};

const PERMISSION_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "public_logged_in", label: "Logged In Users" },
  { value: "private_org", label: "Organization Only" },
];

const DocumentViewerModal = ({ show, onHide, document }) => {
  if (!document) return null;
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="xl"
      centered
      className="document-viewer-modal"
    >
      <Modal.Header className="border-0 p-3">
        <Modal.Title className="text-primary">{document.caption || 'Document Viewer'}</Modal.Title>
        <Button
          variant="link"
          className="p-0 ms-auto border-0 text-dark"
          onClick={onHide}
        >
          <X size={24} />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div style={{ height: "85vh" }}>
          <iframe
            src={`${document.url}#toolbar=1`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "#f8f9fa"
            }}
            title="PDF viewer"
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const DraggableCard = ({ document, index, moveDocument, handleDelete, handleCaptionChange, handlePermissionChange, onView, organizationType }) => {

  const ref = useRef();
  
  // Get available document types based on organizationType
  const availableTypes = documentTypes[organizationType] || ['Other'];

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
      moveDocument(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Col xl={2} lg={3} md={4} sm={6} xs={12}>
      <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Card 
          className="custom-card overflow-hidden cursor-pointer"
          onClick={() => onView(document)}
        >
          <div className="position-relative">
            <div className="d-flex justify-content-center align-items-center p-3" style={{ height: "120px" }}>
              <FileText size={48} className="text-primary" />
            </div>
            <div 
              className="position-absolute" 
              style={{ top: "8px", right: "8px", gap: "8px", display: "flex" }}
              onClick={e => e.stopPropagation()}
            >
              {document.uploadedBy?.fullNames && (
                <Button
                  variant="light"
                  size="sm"
                  style={{ minWidth: "32px", height: "32px" }}
                >
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        Uploaded by {document.uploadedBy.fullNames}
                        <br />
                        {new Date(document.uploadedAt).toLocaleString()}
                      </Tooltip>
                    }
                  >
                    <User size={16} />
                  </OverlayTrigger>
                </Button>
              )}
              
              <button
                className="btn btn-danger btn-sm p-1"
                style={{ minWidth: "32px", height: "32px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div 
            className="border-top p-2"
            onClick={e => e.stopPropagation()}
          >
            <Form.Select
              size="sm"
              value={document.caption || ''}
              onChange={(e) => handleCaptionChange(index, e.target.value)}
              className="mb-2"
            >        
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              size="sm"
              value={document.permission || 'public'}
              onChange={(e) => handlePermissionChange(index, e.target.value)}
            >
              {PERMISSION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </div>
        </Card>
      </div>
    </Col>
  );
};

const DocumentGallery = ({ inventoryItem, handleInputChange, organization }) => {

  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const organizationType = organization?.type;

  const handleFileSelect = async (e) => {
    try {
      const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      
      if (files.length === 0) {
        alert('Please select PDF files only');
        return;
      }

      setIsUploading(true);   

      await dispatch(uploadDocuments({
        files,
        itemId: id
      })).unwrap();

      e.target.value = '';
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (index) => {
    try {
      const documentToDelete = inventoryItem.documents[index];
      await dispatch(deleteDocument({ 
        itemId: id, 
        documentId: documentToDelete._id 
      })).unwrap();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleCaptionChange = (index, newCaption) => {
    const updatedDocuments = inventoryItem.documents.map((doc, i) => 
      i === index ? { ...doc, caption: newCaption } : doc
    );
    handleInputChange('documents', updatedDocuments);
  };

  const handlePermissionChange = (index, newPermission) => {
    const updatedDocuments = inventoryItem.documents.map((doc, i) => 
      i === index ? { ...doc, permission: newPermission } : doc
    );
    handleInputChange('documents', updatedDocuments);
  };

  const moveDocument = (dragIndex, hoverIndex) => {
    const updatedDocuments = [...inventoryItem.documents];
    const dragDoc = updatedDocuments[dragIndex];
    updatedDocuments.splice(dragIndex, 1);
    updatedDocuments.splice(hoverIndex, 0, dragDoc);
    handleInputChange('documents', updatedDocuments);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedDocument(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Fragment>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div className="main-content-label text-primary">Documents</div>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="document-upload"
          />
          <Button 
            onClick={() => document.getElementById('document-upload').click()}
            className="btn btn-primary btn-sm"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Documents'}
          </Button>
        </div>
               
        {!inventoryItem?.documents?.length ? (
          <div className="text-muted">No documents added.</div>
        ) : (
          <Row className="row-sm">
            {inventoryItem.documents.map((document, index) => (
              <DraggableCard
                key={`${document.url}-${index}`}
                document={document}
                index={index}
                moveDocument={moveDocument}
                handleDelete={handleDelete}
                handleCaptionChange={handleCaptionChange}
                handlePermissionChange={handlePermissionChange}
                onView={handleViewDocument}
                organizationType={organizationType}
              />
            ))}
          </Row>
        )}

        <DocumentViewerModal
          show={showViewer}
          onHide={handleCloseViewer}
          document={selectedDocument}
        />
      </Fragment>
    </DndProvider>
  );
};

export default DocumentGallery;