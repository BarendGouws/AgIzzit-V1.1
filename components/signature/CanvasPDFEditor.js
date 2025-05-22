"use client";

import mongoose from 'mongoose';
import { useDispatch, useSelector } from 'react-redux';
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from 'next/router';
import { useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container, Row, Col, Card, Button, InputGroup, Form, ButtonGroup, FormGroup, Accordion, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { DraggableBox } from "@/components/signature/dnd/DraggableBox";
import { CustomDragLayer } from "@/components/signature/dnd/CustomDragLayer";
import { errorToast, infoToast, successToast } from '@/components/partials/Toast';
import { fetchTemplate, saveTemplate, deleteTemplate, setActiveKey, setShowModal } from '@/redux/manage/slices/templates';
import StateHandler from "@/components/partials/StateHandler";

const CanvasPage = ({ template, setTemplate, width, setWidth, height, setHeight, pageNumber, setPageNumber }) => { console.log('specs', width, height)

  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(null); 

  const moveBox = useCallback((_id, left, top) => { 
    // Find the box by its _id within the template's placeholders
    const box = template.placeholders.find(box => box._id === _id);
    if (!box) return;
  
    // Update the template's placeholders
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      placeholders: prevTemplate.placeholders.map((box) =>
        box._id === _id ? { ...box, left, top } : box
      ),
    }));
  }, [template]);

  const resizeBox = useCallback((_id, width, height) => {
    // Update the template's placeholders by resizing the box with the matching _id
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      placeholders: prevTemplate.placeholders.map((box) =>
        box._id === _id ? { ...box, width, height } : box
      ),
    }));
  }, []);  

  const deleteBox = (_id) => {
    setTemplate((prevTemplate) => {
      // Find the placeholder that is being deleted
      const deletedPlaceholder = prevTemplate.placeholders.find((box) => box._id === _id);
  
      // Check if there are other placeholders for the same role
      const placeholdersWithSameRole = prevTemplate.placeholders.filter(
        (box) => box.role === deletedPlaceholder.role && box._id !== _id
      );
  
      let updatedPlaceholders;
  
      if (placeholdersWithSameRole.length === 0) {
        // If no other placeholders with the same role, remove all properties except _id and role
        updatedPlaceholders = prevTemplate.placeholders.map((box) =>
          box._id === _id ? { _id: box._id, role: box.role } : box
        );
      } else {
        // If there are other placeholders, simply remove the one being deleted
        updatedPlaceholders = prevTemplate.placeholders.filter((box) => box._id !== _id);
      }
  
      return {
        ...prevTemplate,
        placeholders: updatedPlaceholders,
      };
    });
  };   

  const [,drop] = useDrop(() => ({
    accept: 'box',
    drop(item, monitor) {
      if (!monitor.getDifferenceFromInitialOffset()) return; // Prevent drop on initial load  

      const delta = monitor.getDifferenceFromInitialOffset();
      // Adjust delta by the zoom level
      const adjustedDeltaX = delta.x / zoom;
      const adjustedDeltaY = delta.y / zoom;
      let left = Math.round(item.left + adjustedDeltaX);
      let top = Math.round(item.top + adjustedDeltaY);
      //BOUNDARY CHECK ON TOP OF THE PAGE BASED ON PAGE HEIGHT
      top = top < Number(height) * -1 ? Number(height) * -1 : top;
      //BOUNDARY CHECK ON LEFT OF THE PAGE BASED ON PAGE WIDTH
      left = left < 0 ? 0 : left
      //BOUNDARY CHECK FOR THE BOTTOM OF THE PAGE, BOTTOM IS ZERO, SO TOP IS NEGATIVE 
      const bottom = top + item.height
      if (bottom > 0) { top = Number(item.height) * -1 }
      //BOUNDARY CHECK FOR THE RIGHT OF THE PAGE
      const right = left + item.width
      if (right > width) { left = width - item.width }
      
      moveBox(item._id, left, top);
      
    }
  }), [zoom, pageNumber, height, width, template?.placeholders]);

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
  
          // Original viewport at scale 1
          const viewport = page.getViewport({ scale: 1 });
          setHeight(Number(viewport.height).toFixed(0));
          setWidth(Number(viewport.width).toFixed(0));       
          
          const scaledViewport = page.getViewport({ scale: 2 });
  
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
  
          const context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
  
          // Set CSS dimensions to original size
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
  
          canvas.style.display = "block";
          canvas.style.border = "1px solid black";
  
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
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
      <div
        ref={drop}
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
            <DraggableBox
              key={box._id}
              zoom={zoom}
              {...box}
              resizeBox={resizeBox} // Pass resizeBox to update size
              deleteBox={deleteBox} // Pass deleteBox to remove box
            />
          ))}
      </div>
    </div>
  );
};

const CanvasPDFEditor = ({ docId, isManage }) => { 

  const router = useRouter();
  const dispatch = useDispatch();

  const reduxTemplate = useSelector((state) => state.templates.template); 
  const { showModal, activeKey, placeholderInfo } = useSelector((state) => state.templates); 
  
  const [validationMessages, setValidationMessages] = useState({});
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);  
  const [pageNumber, setPageNumber] = useState(1); 
  const [template, setTemplate] = useState({});

  const signatories = Array.from((template?.placeholders || []).filter((placeholder) => placeholder._id).reduce((acc, placeholder) => {if (!placeholder.role && placeholder._id) { acc.set(placeholder._id, { _id: placeholder._id, role: "" });} else if (placeholder.role && !acc.has(placeholder.role)) {acc.set(placeholder.role, { _id: placeholder._id, role: placeholder.role });} return acc; }, new Map())).map(([_, value]) => value); // Convert Map values to array of objects

  const selectedRoles = signatories.map((signatory) => signatory.role);

  const handleSelectChange = (_id, field, value) => {

    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      placeholders: prevTemplate.placeholders.map((placeholder) =>
        placeholder._id === _id ? { ...placeholder, [field]: value } : placeholder
      ),
    }));

    // Clear validation message if role is selected
    if (field === 'role' && value) {
      setValidationMessages((prevMessages) => ({ ...prevMessages, [_id]: '' }));
    }
  };

  const handleButtonClick = (_id, type) => {
    // Find the signatory by its _id
    const signatory = signatories.find((s) => s._id === _id);
  
    if (!signatory.role) {
      setValidationMessages((prevMessages) => ({
        ...prevMessages,
        [_id]: 'Please select a role before adding a signature or initial.',
      }));
    } else {
      setTemplate((prevTemplate) => {
        // Find an existing placeholder without a type and the same role
        const existingPlaceholder = prevTemplate.placeholders.find(
          (placeholder) => placeholder._id === _id && !placeholder.type
        );
  
        let newPlaceholders;

        let newLeft = 20;
        let newTop = -570;
        let boxWidth = type === 'signature' ? 110 : 50;
        let boxHeight = 50;

        const doesOverlap = (left, top, width, height) => {
          return prevTemplate.placeholders.some((box) => {
            return (
              left < box.left + box.width &&
              left + width > box.left &&
              top < box.top + box.height &&
              top + height > box.top
            );
          });
        };

        let tries = 0;
        while (doesOverlap(newLeft, newTop, boxWidth, boxHeight) && tries < 50) {
          newLeft += 10; // Shift the box slightly to the right
          newTop += 10; // Shift the box slightly upwards
          tries++;
        }

        // Boundary checks for the new box (keep it within the page size)
        newTop = newTop < -height ? -height : newTop; // Ensure the box stays within the page height (top boundary)
        newLeft = newLeft < 0 ? 0 : newLeft; // Ensure the box stays within the left boundary
        newTop = newTop + boxHeight > 0 ? 0 - boxHeight : newTop; // Ensure it stays above the bottom boundary (bottom is 0)
        newLeft = newLeft + boxWidth > width ? width - boxWidth : newLeft; // Ensure it stays within the right boundary
  
        if (existingPlaceholder) {
          // If a placeholder without a type exists, update its type
          newPlaceholders = prevTemplate.placeholders.map((placeholder) =>
            placeholder._id === _id
              ? { ...placeholder,            
                left: newLeft,
                top: newTop,
                type: type, // signature or initial
                width: boxWidth,
                height: boxHeight,               
                pageNumber: pageNumber,              
              } // Assign the type (signature or initial)
              : placeholder
          );

        } else {   
  
          // Add a new placeholder for the signatory with the defined type
          newPlaceholders = [
            ...prevTemplate.placeholders,
            {
              _id: Math.random().toString(36).substr(2, 9),
              left: newLeft,
              top: newTop,
              type: type, // signature or initial
              width: boxWidth,
              height: boxHeight,
              role: signatory.role, // Assign role from the signatory
              pageNumber: pageNumber,
            },
          ];
        }
  
        return { ...prevTemplate, placeholders: newPlaceholders };
      });

      infoToast(`${type === 'signature' ? 'Signature' : 'Initial'} placeholder added for ${signatory.role}. You can now drag the placeholder to the desired position on the PDF.`);
  
    }
  };  

  const deleteSignatory = (role) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      placeholders: prevTemplate.placeholders.filter((box) => box.role !== role),
    }));
  };  

  const handleFieldChange = (_id, newValue) => {
    // Update the template's fields by changing the text of the field with the matching _id
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      fields: prevTemplate.fields.map((field) =>
        field._id === _id ? { ...field, text: newValue } : field
      ),
    }));
  };  

  const handleFormatChange = (fieldId, newFormat) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      fields: prevTemplate.fields.map((field) =>
        field._id === fieldId ? { ...field, format: newFormat } : field
      ),
    }));
  };

  const handleRoleAssignToField = (fieldId, newRole) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      fields: prevTemplate.fields.map((field) =>
        field._id === fieldId ? { ...field, role: newRole } : field
      ),
    }));
  };

  const handleSaveTemplate = async () => {
    // Validation logic
    let validationErrors = [];
  
    // 1. Check that all placeholders have a type
    const invalidPlaceholders = template.placeholders.filter((placeholder) => !placeholder.type);
    if (invalidPlaceholders.length > 0) {
      validationErrors.push('All placeholders must have a type (signature or initial).');      
      dispatch(setActiveKey('2'));
    }
  
    // 2. Check that all fields have non-empty text
    if(template.fields.length === 0){
      validationErrors.push('No fillable fields found. Please adjust template and upload again.');
      dispatch(setActiveKey('1'));
    }

    const emptyFields = template.fields.filter((field) => !field.text || field.text.trim() === '');
    if (emptyFields.length > 0) {
      validationErrors.push('All fields must have non-empty text.');   
      dispatch(setActiveKey('1'));   
    }
  
    // 3. Check that the template name is not blank
    if (!template.name || template.name.trim() === '') {
      validationErrors.push('Template name cannot be blank.');
      dispatch(setActiveKey('0'));
    }
  
    // 4. Check that at least one "Recipient" placeholder exists with a type
    const recipientPlaceholder = template.placeholders.find((placeholder) => placeholder.role === 'Recipient' && placeholder.type);
    if (!recipientPlaceholder) {
      validationErrors.push('At least one "Recipient" placeholder with a type must be present.');
    }
  
    // If there are validation errors, show them and return early
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => errorToast(error));
      return;
    }

    const preparedTemplate = {
      ...template,
      placeholders: template.placeholders.map((placeholder) => {
        // Check if _id is a valid MongoDB ObjectId
        if (placeholder._id && !mongoose.Types.ObjectId.isValid(placeholder._id)) {
          const { _id, ...rest } = placeholder; // Exclude _id if it's not valid
          return rest;
        }
        return placeholder; // Keep the placeholder if _id is a valid ObjectId
      }),
    };

    console.log('Prepared template:', preparedTemplate);
  
    try {
      const resultAction = await dispatch(saveTemplate(preparedTemplate));
      
      if (saveTemplate.fulfilled.match(resultAction)) {
        isManage ? router.push('/manage/templates') : router.push('/templates');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!template._id) {
      console.error('Template ID is missing');
      return;
    }

    try {
      const resultAction = await dispatch(deleteTemplate(template._id));

      if (deleteTemplate.fulfilled.match(resultAction)) {       
        isManage ? router.push('/manage/templates') : router.push('/templates');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleActiveKeyChange = (key) => {
    dispatch(setActiveKey(key));
  };

  const handleCloseModal = () => {
    dispatch(setShowModal(false));
  };

  const loadTemplate = async (docId) => {

    const resultAction = await dispatch(fetchTemplate(docId));
    if (fetchTemplate.rejected.match(resultAction)) {       
      isManage ? router.push('/manage/templates') : router.push('/templates');
    }

  };

  useEffect(() => { 
    docId && loadTemplate(docId);    
  }, [docId]);

  useEffect(() => {   
    reduxTemplate && setTemplate(reduxTemplate);    
  }, [reduxTemplate]);
  
  return (
    <StateHandler slice="templates" id='templateDetail'>
      <DndProvider backend={HTML5Backend}>
        <Row className="mt-3 h-100" style={{ minHeight: '100vh' }}>
          <Col lg={4} xl={3} className="d-flex flex-column">
            <div className="mb-4 flex-grow-1" style={{ position: "sticky", top: 80 }}>
              <Card className="h-100">
                <Card.Body className="main-content-left main-content-left-mail">

                <Accordion activeKey={activeKey} onSelect={handleActiveKeyChange} flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Settings</Accordion.Header>
                  <Accordion.Body>

                    <FormGroup className="form-group">
                    <Form.Label className="form-label">
                      <span>Template Name</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control"
                      value={template?.name || ''} // Ensure that it handles undefined cases
                      onChange={(e) =>
                        setTemplate((prevTemplate) => ({
                          ...prevTemplate,
                          name: e.target.value,
                        }))
                      }
                    />
                    </FormGroup>

                    <FormGroup className="form-group">
                      <Form.Label className="form-label">
                        <span>Restrict IP to South Africa</span>
                      </Form.Label>
                      <select
                        className="form-control"
                        value={template?.restrictIP?.toString()}
                        onChange={(e) =>
                          setTemplate((prevTemplate) => ({
                            ...prevTemplate,
                            restrictIP: e.target.value === 'true', // Convert the string back to boolean
                          }))
                        }
                      >
                        <option value='true'>Yes</option>
                        <option value='false'>No</option>
                      </select>
                    </FormGroup>

                    <FormGroup className="form-group">
                      <Form.Label className="form-label">
                        <span>Facial Verification</span>
                      </Form.Label>
                      <select
                        className="form-control"
                        value={template?.facialVerification?.toString()}
                        onChange={(e) =>
                          setTemplate((prevTemplate) => ({
                            ...prevTemplate,
                            facialVerification: e.target.value === 'true', // Convert the string back to boolean
                          }))
                        }
                      >
                        <option value='true' disabled>Yes (in development)</option>
                        <option value='false'>No</option>
                      </select>
                    </FormGroup>

                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Fillable Fields</Accordion.Header>
                  <Accordion.Body>

                    {template?.fields?.length === 0 ? (<>
                      <p className="text-center text-danger">No Fillable Field! Please adjust template and upload again.</p>
                      <p className="text-center text-danger text-bold">{'Please make sure the file has tags like {firstName}'}</p>
                      </>) : (
                        <p className="text-center">Field Names Corresponding to Placeholders</p>
                      )}

                    {template?.fields?.filter((field) => !field.dbKey).map((field) => (
                      <InputGroup className="mb-3" key={field._id}>
                        <InputGroup.Text id="inputGroup-sizing-default">
                          {field.tag}
                        </InputGroup.Text>
                      
                        <Form.Control
                          type="text"
                          aria-label="Sizing example input"
                          aria-describedby="inputGroup-sizing-default"
                          value={field.text} // Bind the value to the field's text
                          onChange={(e) => handleFieldChange(field._id, e.target.value)} // Handle input changes
                        />
                      </InputGroup>
                    ))}

                    {template?.fields?.filter((field) => field.dbKey).map((field, index) => (
                      <Fragment key={index}>
                      {index === 0 && (<p className="text-center">Populating fields by Recipient's profile.</p>)}

                      <div className="text-center">
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}>{field.text}</Tooltip>}>
                              <code className="text-success" style={{ cursor: 'pointer' }}>{field?.tag}</code>		
                        </OverlayTrigger>											
                      </div>
                    </Fragment>
                    ))}

                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  
                  <Accordion.Header>Assign Fields to Roles</Accordion.Header>
                  <Accordion.Body>

                    {template?.fields?.filter((field) => field.dbKey).map((field, index) => (
                      <Fragment key={index} >
                      {index === 0 && (<p className="text-center">Populating fields by Recipient's profile.</p>)}

                      <div className="text-center">
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}>{field.text}</Tooltip>}>
                              <code className="text-success" style={{ cursor: 'pointer' }}>{field?.tag}</code>		
                        </OverlayTrigger>											
                      </div>
                      </Fragment>
                    ))}

                    <p className="text-center">Assign Fields to specific roles to complete before document is generated </p>

                    {template?.fields?.filter((field) => !field.dbKey).map((field, index) => (
                      <InputGroup className="mb-3" key={field._id}>
                        <InputGroup.Text as="label" htmlFor={`role-select-${field._id}`}>
                          {field.tag}
                        </InputGroup.Text>
                        <Form.Select
                          id={`role-select-${field._id}`}
                          value={field.role || 'Recipient'}
                          onChange={(e) => handleRoleAssignToField(field._id, e.target.value)}
                          aria-label="Select role"
                        >                     
                          <option value="Recipient">Recipient</option>
                          <option value="Sender">Sender</option>               
                        </Form.Select>
                      </InputGroup>
                    ))}               

                  </Accordion.Body>
                </Accordion.Item>    
                <Accordion.Item eventKey="4">
                  <Accordion.Header>Field Formatting</Accordion.Header>
                  <Accordion.Body>
                    <p className="text-center">Allocate custom formatting for each placeholder</p>  

                    {template?.fields?.map((field) => (
                    <InputGroup className="mb-3" key={field._id}>
                      <InputGroup.Text as="label" htmlFor={`format-select-${field._id}`}>
                        {field.tag}
                      </InputGroup.Text>
                      <Form.Select
                        id={`format-select-${field._id}`}
                        value={field.format || 'TitleCase'}
                        onChange={(e) => handleFormatChange(field._id, e.target.value)}
                        aria-label="Select format"
                      >
                        <option value="TitleCase">Title Case</option>
                        <option value="UpperCase">Upper Case</option>
                        <option value="LowerCase">Lower Case</option>
                      </Form.Select>
                    </InputGroup>
                  ))}
                                    
                  </Accordion.Body>
                </Accordion.Item>           
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Signatories</Accordion.Header>
                  <Accordion.Body>

                    {template?.placeholders?.length === 0 && (
                      <p className="text-center">No signatories added yet.</p>
                    )}

                    {signatories.map((signatory, index) => (
                      <Fragment key={signatory._id}>
                        <div className="position-relative gap-3 mb-4 p-4 border rounded bg-light">
                          {/* Delete Button */}
                          <Button 
                            variant="danger" 
                            className="position-absolute top-0 end-0 mt-2 me-2 px-2 py-1"
                            onClick={() => deleteSignatory(signatory.role)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>

                          <h5 className="mb-3 text-center">Signature {index + 1}</h5>
                        
                          {/* Role Dropdown */}
                          <InputGroup className="mb-3">
                            <InputGroup.Text className="bg-info text-white">Role</InputGroup.Text>
                            <Form.Select
                              defaultValue={signatory.role}
                              onChange={(e) => handleSelectChange(signatory._id, 'role', e.target.value)}
                              disabled={!!signatory.role} // Disable dropdown if a role is already selected
                              style={{
                                backgroundColor: !!signatory.role ? 'white' : '',
                                color: !!signatory.role ? 'black' : '',
                                pointerEvents: !!signatory.role ? 'none' : 'auto',
                                opacity: !!signatory.role ? 1 : '',
                              }}
                            >
                              <option value="">Select Role</option>
                              <option value="Recipient" disabled={selectedRoles.includes('Recipient')}>Recipient</option>
                              <option value="Sender" disabled={selectedRoles.includes('Sender')}>Sender</option>                            
                              <option value="Witness 1" disabled={selectedRoles.includes('Witness 1')}>Witness 1</option>
                              <option value="Witness 2" disabled={selectedRoles.includes('Witness 2')}>Witness 2</option>
                            </Form.Select>
                          </InputGroup>

                          {/* Validation Message */}
                          {validationMessages[signatory._id] && (
                            <p className="text-danger">{validationMessages[signatory._id]}</p>
                          )}

                          {/* Signature Buttons */}
                          <ButtonGroup className="btn-group d-flex justify-content-center">
                            <Button 
                              variant="info" 
                              className="btn"
                              onClick={() => handleButtonClick(signatory._id, 'signature')}
                            >
                              Signature
                            </Button>
                            <Button
                              variant="info" 
                              className="btn"
                              onClick={() => handleButtonClick(signatory._id, 'initial')}
                            >
                              Initial
                            </Button>
                          </ButtonGroup>
                        </div>
                        <hr className="mb-4" />
                      </Fragment>
                    ))}

                    <div className="d-grid gap-2 mb-4">
                      <Button 
                        variant='info' 
                        type="button" 
                        className="" 
                        disabled={signatories.length >= 4}
                        onClick={() => {
                          setTemplate((prevTemplate) => {
                            const isFirstSignatory = prevTemplate.placeholders.length === 0;
                            return {
                              ...prevTemplate,
                              placeholders: [
                                ...prevTemplate.placeholders,
                                {
                                  _id: Math.random().toString(36).substr(2, 9), // Generate a unique _id
                                  role: isFirstSignatory ? 'Recipient' : '', // Set role as 'Recipient' if it's the first signatory, otherwise empty string
                                },
                              ],
                            };
                          });
                        }}
                        >                        
                        Add Signatory
                      </Button>                 
                    </div>

                  </Accordion.Body>
                </Accordion.Item>
                </Accordion>
                  <div className="d-grid gap-2 mb-4 mt-4">
                    <Button variant="primary" className="btn btn-wave thumb" type="button" onClick={handleSaveTemplate}>
                      Save Template
                    </Button>
                  </div>
                  <div className="d-grid gap-2 mb-4 mt-4">
                    <Button variant="danger" className="btn btn-wave thumb" type="button" onClick={handleDeleteTemplate}>
                      Delete Template
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
          <Col xl={9} lg={8} id='pdfDiv' className="h-100">
            <Row>
              <div className="col-6 mt-1">
                <div className="text-muted ms-3 mb-1 fs-18">{`${template?.name}.docx`}</div>
              </div>
            </Row>
            <CustomDragLayer />
            <CanvasPage template={template} setTemplate={setTemplate} height={height} setHeight={setHeight} width={width} setWidth={setWidth} pageNumber={pageNumber} setPageNumber={setPageNumber}/>
          </Col>
        </Row>    
      </DndProvider>
       <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header>
          <Modal.Title>New Template Added</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Card className="bd-0 mg-b-20">
            <Card.Body className=" border border-success text-center rounded">

                    <div className="success-widget">
                      <i className="bi bi-check-circle mg-b-20 fs-50 text-success lh-1"></i>
                      <h3 className="mt-3 text-success">Success!</h3>																
                    
                    {placeholderInfo && (<>
                      <div className="mt-4">
                        <p className="text-success fs-16">Using profile fields, the fields will be populated automatically by the reciepient's profile</p>											
                        <h6>Available Profile Placeholders:</h6>
                        <div className="row justify-content-center">
                          {placeholderInfo?.profilePlaceholders?.map((holder, index) => (
                            <div key={index} className="col-md-4 col-sm-6 mb-2">
                              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}>{holder.text}</Tooltip>}>
                                <code className={`${holder.isPresent ? 'text-success' : ''}`} style={{ cursor: 'pointer' }}>
                                  {holder.tag}
                                </code>
                              </OverlayTrigger>
                            </div>
                          ))}
                        </div>
                        <h6>Placeholders that must be manually completed </h6>
                        <div className="row justify-content-center mb-3 mt-2">
                          {placeholderInfo?.nonProfilePlaceholders?.map((holder, index) => (
                            <div key={index} className="col-md-4 col-sm-6 mb-2">
                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}>{holder.text}</Tooltip>}>
                              <code className="text-success" style={{ cursor: 'pointer' }}>{holder?.tag}</code>		
                            </OverlayTrigger>											
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-danger fs-16">Please do not forget to ensure field assignment and settings is correct</p>	
                      </>
                    )}									
                  </div>
                  </Card.Body>
      </Card>
                      
      </Modal.Body>
      <Modal.Footer>      
          <Button variant="primary" onClick={handleCloseModal}>
              Close
          </Button>
      </Modal.Footer>
      </Modal>
    </StateHandler>
  );
};

export default CanvasPDFEditor;
