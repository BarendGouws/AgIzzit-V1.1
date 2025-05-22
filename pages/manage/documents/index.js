import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert, Form, InputGroup } from "react-bootstrap";
import Link from "next/link";
import moment from 'moment';

import Pagination from '@/components/partials/Pagination';
import Pageheader from "@/components/partials/Pageheader";
import { errorToast, successToast } from "@/components/partials/Toast";
import { fetchDocuments, generateDocument } from '@/redux/manage/slices/documents';
import StateHandler from "@/components/partials/StateHandler";

const DocumentsPage = ({ }) => { 

    const dispatch = useDispatch();
    const { templates, documents, pagination, stats } = useSelector(state => state.documents);

    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [emailInputs, setEmailInputs] = useState({});
	const [emailValidity, setEmailValidity] = useState({});
    const [senderFields, setSenderFields] = useState({});
    const [senderFieldsValidity, setSenderFieldsValidity] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadSignatures = (page = 1) => {
        dispatch(fetchDocuments({ page, searchTerm, statusFilter }));
    };

    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);
        
        const template = templates.find(t => t._id === templateId);
        if (template) {
            const roles = new Set(template.fields.map(f => f.role).filter(role => role !== 'Sender'));
            const newEmailInputs = {};
            roles.forEach(role => {
                newEmailInputs[role] = '';
            });
            setEmailInputs(newEmailInputs);
            setEmailValidity({});

            // Set up sender fields
            const newSenderFields = {};
            const newSenderFieldsValidity = {};
            template.fields.filter(f => f.role === 'Sender').forEach(field => {
                newSenderFields[field.tag] = '';
                newSenderFieldsValidity[field.tag] = false;
            });
            setSenderFields(newSenderFields);
            setSenderFieldsValidity(newSenderFieldsValidity);
        }
    };

    const handleSenderFieldChange = (tag, value) => {
        setSenderFields(prev => ({ ...prev, [tag]: value }));
        setSenderFieldsValidity(prev => ({ ...prev, [tag]: value.trim() !== '' }));
    };

    const handleEmailChange = async (role, value) => {

        setEmailInputs(prev => ({ ...prev, [role]: value }));
        
        if (value.trim() !== '') {
			
            try {
                const response = await fetch('/api/validate/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: value }),
                });
                const data = await response.json();
                setEmailValidity(prev => ({ ...prev, [role]: data.isValid }));
            } catch (error) {
                console.error('Email validation error:', error);
                setEmailValidity(prev => ({ ...prev, [role]: false }));
            }
        } else {
            setEmailValidity(prev => ({ ...prev, [role]: null }));
        }
    };

    const handleGenerateSignature = async () => {
        
        if (!selectedTemplate) {
            errorToast("Please select a template.");
            return;
        }

        const signerEmails = Object.entries(emailInputs)
            .filter(([_, email]) => email.trim() !== '')
            .reduce((acc, [role, email]) => {
                acc[role] = email;
                return acc;
            }, {});
        
        if (Object.keys(signerEmails).length === 0) {
            errorToast("Please enter at least one email address.");
            return;
        }

        if (Object.values(emailValidity).some(validity => validity === false)) {
            errorToast("Please enter valid email addresses for all roles.");
            return;
        }

        if (Object.values(senderFieldsValidity).some(validity => validity === false)) {
            errorToast("Please fill in all sender fields.");
            return;
        }

        setIsGenerating(true);

        try {
            const result = await dispatch(generateDocument({
                templateId: selectedTemplate,
                signerEmails: signerEmails,
                senderFields: senderFields,
            }));

            if (generateDocument.fulfilled.match(result)) {
                successToast("Signature request generated successfully.");
                setShowModal(false);
                loadSignatures();
                
                // Reset all inputs
                setEmailInputs({});
                setEmailValidity({});
                setSenderFields({});
                setSenderFieldsValidity({});
                setSelectedTemplate('');
            } else {
                errorToast(result.error?.message || "Failed to generate signature request.");
            }
        } catch (error) {
            errorToast("An error occurred while generating the signature request.");
        } finally {
            setIsGenerating(false);
        }
    };

    const renderStatusCard = (title, count, status, bgClass) => (
        <Col xl={3} lg={6} md={6} sm={12}>
            <Card 
                className={`${bgClass} text-white`} 
                style={{ cursor: 'pointer' }}
                onClick={() => { setSearchTerm(''); setStatusFilter(status); }}
            >
                <Card.Body>                            
                    <Row>
                        <div className="col-6">
                            <div className="icon1 mt-2 text-center text-fixed-white">
                                <i className={`fe fe-${title === 'Total' ? 'file-text' : title === 'Pending' ? 'clock' : title === 'Completed' ? 'check-circle' : 'activity'} fs-40`}></i>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="mt-0 text-center text-fixed-white">
                                <span>{title}</span>
                                <h2 className="mb-0 mt-1 text-fixed-white">{count}</h2>
                            </div>
                        </div>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    );

    useEffect(() => {
        loadSignatures();
    }, [statusFilter]);
    
    return (
        <StateHandler slice="documents">
     
            <Pageheader title="Documents" heading="Manage" active="Documents" />

            <Row className="row-sm mb-4">
                {renderStatusCard("Total", stats.totalSignatures, "", "bg-primary-gradient")}
                {renderStatusCard("Pending", stats.pendingSignatures, "Draft", "bg-danger-gradient")}
                {renderStatusCard("Completed", stats.completedSignatures, "Completed", "bg-success-gradient")}
                {renderStatusCard("In Progress", stats.inProgressSignatures, "In Progress", "bg-warning-gradient")}
            </Row>

            <Row className="mb-4">
				<Col xs={12} md={6}>
					<div className="fs-18 mb-2 d-grid d-md-block">
					<Button
						variant="outline-primary"
						onClick={() => setShowModal(true)}
					>
						Generate New Signature Request
					</Button>
					</div>
				</Col>
				<Col xs={12} md={6}>
					<div className="input-group mb-2">
					<input
						type="text"
						className="form-control text-truncate"
						placeholder="Search documents....."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<button className="btn btn-primary" type="button" onClick={() => { setStatusFilter(''); loadSignatures(1);}}>
						Search
					</button>
					</div>
				</Col>
			</Row>
           
            <Row>
               <Col xs={12}>
                        {documents && documents.length > 0 ? (
                            documents.map((signature, index) => (
                                <Link key={index} href={`/manage/documents/${signature._id}`}>
                                    <Card className="mb-2">
                                        <Card.Body>
                                            <Row className="align-items-center">
                                                <Col xs={12} md={6}>
                                                <svg 
                                                    className="me-2" 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    shapeRendering="geometricPrecision" 
                                                    textRendering="geometricPrecision" 
                                                    imageRendering="optimizeQuality" 
                                                    fillRule="evenodd" 
                                                    clipRule="evenodd" 
                                                    viewBox="0 0 500 511.56" 
                                                    width="24" 
                                                    height="24"
                                                >
                                                    <path 
                                                    fillRule="nonzero" 
                                                    d="M117.91 0h201.68c3.93 0 7.44 1.83 9.72 4.67l114.28 123.67c2.21 2.37 3.27 5.4 3.27 8.41l.06 310c0 35.43-29.4 64.81-64.8 64.81H117.91c-35.57 0-64.81-29.24-64.81-64.81V64.8C53.1 29.13 82.23 0 117.91 0zM325.5 37.15v52.94c2.4 31.34 23.57 42.99 52.93 43.5l36.16-.04-89.09-96.4zm96.5 121.3l-43.77-.04c-42.59-.68-74.12-21.97-77.54-66.54l-.09-66.95H117.91c-21.93 0-39.89 17.96-39.89 39.88v381.95c0 21.82 18.07 39.89 39.89 39.89h264.21c21.71 0 39.88-18.15 39.88-39.89v-288.3z" 
                                                    />
                                                    <path 
                                                    fill="red" 
                                                    d="M28.04 194.61h443.92c15.43 0 28.04 12.63 28.04 28.04v188.54c0 15.4-12.63 28.04-28.04 28.04H28.04C12.64 439.23 0 426.61 0 411.19V222.65c0-15.43 12.62-28.04 28.04-28.04z" 
                                                    />
                                                    <path 
                                                    fill="#fff" 
                                                    fillRule="nonzero" 
                                                    d="M150.36 348.17H125.2v29.21H86.5V256.45h60.95c27.74 0 41.6 14.9 41.6 44.7 0 16.38-3.61 28.51-10.83 36.37-2.71 2.97-6.45 5.49-11.22 7.55-4.78 2.07-10.32 3.1-16.64 3.1zm-25.16-60.76v29.8h8.9c4.65 0 8.03-.49 10.16-1.45 2.13-.97 3.19-3.2 3.19-6.68v-13.54c0-3.49-1.06-5.71-3.19-6.68-2.13-.97-5.51-1.45-10.16-1.45h-8.9zm79.82 89.97V256.45h54.17c21.8 0 36.77 4.65 44.89 13.93 8.13 9.29 12.19 24.8 12.19 46.54 0 21.73-4.06 37.24-12.19 46.53-8.12 9.29-23.09 13.93-44.89 13.93h-54.17zm54.75-89.97h-16.06v59.02h16.06c5.29 0 9.13-.62 11.52-1.84 2.38-1.23 3.58-4.03 3.58-8.42v-38.5c0-4.39-1.2-7.2-3.58-8.42-2.39-1.23-6.23-1.84-11.52-1.84zm145.99 45.08h-32.89v44.89h-38.7V256.45h79.33l-4.84 30.96h-35.79v16.25h32.89v28.83z" 
                                                    />
                                                </svg>
                                                    <span className="fs-16">{signature.documentName}</span>
                                                </Col>
                                                <Col xs={12} md={3} className="mt-1 mt-md-0">
                                                    <Badge bg={signature.documentStatus === 'Completed' ? 'success' : signature.documentStatus === 'Draft' ? 'secondary' : 'warning'}>
                                                        {signature.documentStatus}
                                                    </Badge>
                                                </Col>
                                                <Col xs={12} md={3} className="mt-1 mt-md-0 text-muted">
                                                    {moment(signature.updatedAt).fromNow()}
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <Alert variant='primary' className="alert d-flex align-items-center" role="alert">                            
                                <svg 
                                    className="flex-shrink-0 me-2 svg-primary" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    height="1.5rem" 
                                    viewBox="0 0 24 24" 
                                    width="1.5rem" 
                                    fill="#000000"
                                >
                                    <path d="M0 0h24v24H0V0z" fill="none" />
                                    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                </svg>
                                <div>
                                    No Documents Found
                                </div>
                            </Alert>
                        )}
               </Col>
            </Row>

            {pagination.totalPages > 1 && (
                <Row className="mt-4">
                    <Col>
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => loadSignatures(page)}
                            maxVisiblePages={5}
                            className="justify-content-center"
                        />
                    </Col>
                </Row>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate New Signature Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Template</Form.Label>
                        <Form.Select value={selectedTemplate} onChange={handleTemplateChange}>
                            <option value="">Choose a template...</option>
                            {templates.map(template => (
                                <option key={template._id} value={template._id}>{template.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {selectedTemplate && templates.find(t => t._id === selectedTemplate).fields
                        .filter(field => field.role === 'Sender')
                        .map(field => (
                        <Form.Group key={field.tag} className="mb-3">
                            <Form.Label>{field.text}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`Enter ${field.text}`}
                                value={senderFields[field.tag] || ''}
                                onChange={(e) => handleSenderFieldChange(field.tag, e.target.value)}
                                isInvalid={senderFieldsValidity[field.tag] === false}
                            />
                            <Form.Control.Feedback type="invalid">
                                This field is required.
                            </Form.Control.Feedback>
                        </Form.Group>
                    ))}

                    {Object.entries(emailInputs).map(([role, email]) => (
                        <Form.Group key={role} className="mb-3">
                            <Form.Label>{role} Email</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="email"
                                    placeholder={`Enter ${role.toLowerCase()} email`}
                                    value={email}
                                    onChange={(e) => handleEmailChange(role, e.target.value)}
                                    isValid={emailValidity[role] === true}
                                    isInvalid={emailValidity[role] === false}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid email address.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleGenerateSignature} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate Signature Request'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </StateHandler>
    );   

};

DocumentsPage.layout = "ManageLayout";

export default DocumentsPage;