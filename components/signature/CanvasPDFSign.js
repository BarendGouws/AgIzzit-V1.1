"use client";

import mongoose from 'mongoose';
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container, Row, Col, Card, Button, Modal, Alert, InputGroup, Form, ButtonGroup, FormGroup, Accordion } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { isMobile, deviceDetect, browserName } from 'mobile-device-detect';
import { SignatureBox } from "@/components/signature/dnd-sign/SignatureBox";
import SignatureCanvas from 'react-signature-canvas';
import 'react-toastify/dist/ReactToastify.css';

const CanvasPage = ({ template, width, setWidth, height, setHeight, pageNumber, setPageNumber }) => {

  console.log(deviceDetect())
  console.log(browserName)

  const signaturePadRef = useRef(null);
  const [isSigned, setIsSigned] = useState(false);

  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(null);   

  useEffect(() => {

    const loadPdf = async () => {
      if (!containerRef.current) return;

      const pdfjsLib = (await import("pdfjs-dist"));
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

      const container = containerRef.current;

      try {
        const loadingTask = pdfjsLib.getDocument(template?.fileUrl);
        const pdf = await loadingTask.promise;

        setNumPages(pdf.numPages);

        let canvas = container.querySelector(`#pdf-canvas-page-${pageNumber}`);
        if (!canvas) {
          container.innerHTML = "";

          canvas = document.createElement("canvas");
          canvas.id = `pdf-canvas-page-${pageNumber}`;
          container.appendChild(canvas);

          const page = await pdf.getPage(pageNumber);

          const viewport = page.getViewport({ scale: 1 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          setHeight(Number(viewport.height).toFixed(0));
          setWidth(Number(viewport.width).toFixed(0));

          const context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          canvas.style.display = "block";
          canvas.style.border = "1px solid black";

          const renderContext = {
            canvasContext: context,
            viewport,
          };

          await page.render(renderContext).promise;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    template?.fileUrl && loadPdf();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };

  }, [template?.fileUrl, pageNumber]);

  useEffect(() => {

    const dropDiv = document.getElementById('drop');
    if (dropDiv) {
      dropDiv.style.width = `${width}px`;
      dropDiv.style.height = `${height}px`;
    }

  }, [width, height]);

  useEffect(() => {

    const handleResize = () => { 

      const pdfDiv = document.getElementById('pdfDiv'); 
      const dropDiv = document.getElementById('drop');

      if (pdfDiv && dropDiv) { 
        const pdfDivWidth = pdfDiv.clientWidth - 24;
        const dropDivWidth = dropDiv.clientWidth;

        const scale = Math.floor(pdfDivWidth / dropDivWidth * 100) / 100;   

        setZoom(scale);
      }

    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [width]);

  const zoomIn = () => {
    setZoom(prevZoom => {
      // Round to the nearest 0.1 before incrementing
      const roundedZoom = Math.round(prevZoom * 10) / 10;
      return Math.min(roundedZoom + 0.1, 2);
    });
  };

  const zoomOut = () => {
    setZoom(prevZoom => {
      // Round to the nearest 0.1 before decrementing
      const roundedZoom = Math.round(prevZoom * 10) / 10;
      return Math.max(roundedZoom - 0.1, 0.5);
    });
  };

  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(prevPageNumber => prevPageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prevPageNumber => prevPageNumber - 1);
    }
  };

  const [show, setShow] = useState(false);
  const [activeSignature, setActiveSignature] = useState({});
  const [signatureError, setSignatureError] = useState(null);

  const showSignatureModal = (props) => {
    
    console.log('showSignatureModal', props);

    setShow(true)

  }

  const clearSignature = () => {
    signaturePadRef.current.clear();
    setIsSigned(false);
  };

  const handleSaveSignature = async () => {
    
    if (signaturePadRef.current.isEmpty()) { 
      
      setSignatureError('Please provide a signature first.'); 
      
      setTimeout(() => {
        setSignatureError(null);
      }, 3000);
      
      return;  
    }      

    const signatureData = signaturePadRef.current.toDataURL('image/png');
    setIsSigned(true);

    // Send the signature to the backend using fetch
    try {
      const response = await fetch('/api/sign-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: signatureData,
          docId: '66f1502a11f64aced7fdaa57',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Document signed successfully.');
        setShow(false)
      } else {
        alert('Failed to sign document.');
      }
    } catch (err) {
      console.error('Error signing document:', err);
      alert('An error occurred.');
    }
  };

  return (
    <div style={{ width: '100%', overflowY: 'auto', position: 'relative', marginBottom: '20px' }}>
      {/* Controls with sticky positioning */}
      <div style={{ position: 'sticky', top: '0px', zIndex: 10, padding: '10px', backgroundColor: '#f8f9fa' }}>
        <Container fluid>
          <Row className="align-items-center">
            {/* Zoom controls on the left */}
            <Col xs="auto">
              <Button variant="primary" onClick={zoomOut} disabled={zoom === 0.5} className="me-2 mb-2 mb-md-0">Zoom Out</Button>
              <Button variant="primary" onClick={zoomIn} disabled={zoom === 2} className="me-2 mb-2 mb-md-0">Zoom In</Button>
              <span className="ms-2">
                Zoom: {(zoom * 100).toFixed(0)}%
              </span>
            </Col>

            {/* Spacer to push the page navigation to the right */}
            <Col className="d-none d-md-block"></Col>

            {/* Page navigation on the right */}
            <Col xs="auto" className="text-md-end mt-2 mt-md-0">
              <Button variant="primary" onClick={prevPage} disabled={pageNumber <= 1} className="me-2 mb-2 mb-md-0">Previous Page</Button>
              <Button variant="primary" onClick={nextPage} disabled={pageNumber >= numPages} className="mb-2 mb-md-0">Next Page</Button>
              <span className="ms-2">
                Page {pageNumber} of {numPages}
              </span>
            </Col>

          </Row>
        </Container>
      </div>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="sm"  // Makes the modal smaller, same width as the canvas
        centered    // Centers the modal on the screen
      >
        <Modal.Header>
          <Modal.Title className="w-100 text-center">Sign Here</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">          
            {signatureError && (
              <Alert variant="danger" className="alert d-flex align-items-center mb-3" role="alert">
                <svg
                  className="flex-shrink-0 me-2 svg-danger"
                  xmlns="http://www.w3.org/2000/svg"
                  height="1.5rem"
                  viewBox="0 0 24 24"
                  width="1.5rem"
                  fill="#000000"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <div>{signatureError}</div>
              </Alert>)}
          </div>

          <div className="d-flex justify-content-center">
            <SignatureCanvas
              ref={signaturePadRef}
              penColor="black"
              canvasProps={{
                width: 200,
                height: 200,
                className: 'sigCanvas',
                style: { border: '2px solid black', borderRadius: '4px' },
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={clearSignature} size="sm">
            Clear Signature
          </Button>
          <Button variant="primary" onClick={handleSaveSignature} disabled={isSigned} size="sm">
            Save Signature
          </Button>
          <Button variant="danger" onClick={() => setShow(false)} size="sm">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
        id='drop'
      >
        {loading && <p>Loading...</p>}
        <div ref={containerRef} style={{ width: "100%", position: "relative" }} />
        {template
          ?.placeholders
          ?.filter((box) => box.pageNumber === pageNumber && box.type) // Filter placeholders for the current page
          .map((box) => (
            <SignatureBox 
              showSignatureModal={showSignatureModal}             
              key={box._id}
              zoom={zoom}
              {...box}           
            />
          ))}
      </div>
    </div>
  );
};

const CanvasPDFSign = ({ signId }) => {  

  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);  
  const [pageNumber, setPageNumber] = useState(1); 
  const [template, setTemplate] = useState({});  
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {

    const loadDocument = async () => {
      try {
        const response = await fetch(`/api/sign/${signId}`);       
        if (response.status === 200) {
          const data = await response.json();      
          if (data) {  setTemplate(data); }
        }
      } catch (error) {
        console.error("Error loading template:", error);
      }
    }

    signId && loadDocument();

  }, [signId]);

  return (
    <>
    <ToastContainer />
    <DndProvider backend={HTML5Backend}>
      <Row id='pdfDiv' className="mt-3 h-100" style={{ minHeight: '100vh' }}>
          <CanvasPage template={template} setTemplate={setTemplate} height={height} setHeight={setHeight} width={width} setWidth={setWidth} pageNumber={pageNumber} setPageNumber={setPageNumber}/>
       </Row>    
    </DndProvider>
    </>
  );
};

export default CanvasPDFSign;
