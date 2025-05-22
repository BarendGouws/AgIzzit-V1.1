import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import moment from 'moment';
import Pagination from '@/components/partials/Pagination';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { fetchTemplates, uploadTemplate } from "@/redux/manage/slices/templates";

const TemplatesPage = ({ }) => {	

    const router = useRouter(); 
    const dispatch = useDispatch();

    const { templates, pagination, profilePlaceholders, loading } = useSelector(state => state.templates);

    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setFile(selectedFile);
            setUploadError('');        
        } else {
            setUploadError('Only .docx files are allowed.');
            setFile(null);        
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
          setUploadError('Please select a file to upload.');
          return;
        }
      
        try {
          const resultAction = await dispatch(uploadTemplate({ file }));
      
          if (uploadTemplate.fulfilled.match(resultAction)) {
            router.push('/manage/templates/' + resultAction.payload.template._id);
          } else {
            setUploadError(resultAction.payload || 'Failed to upload file.');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadError('An error occurred while uploading.');
        }
    };

    const loadTemplates = (page = 1) => {
        dispatch(fetchTemplates({ page, searchTerm }));
    }; 

	const handlePageChange = (page) => {
        loadTemplates(page);       
    };

    const handleSearch = () => {
        dispatch(fetchTemplates({ page: 1, searchTerm }));
    };      

    useEffect(() => {
        loadTemplates();
    }, []);   
      
    return (
        <StateHandler slice="templates" id='templateList'>
    
            <Pageheader title="Templates" heading="Manage" active="Templates" />	
    
            <Row className="mb-4">					
                <Col xs={12} md={6}>
                    <div className="fs-18 mb-2 d-grid d-md-block">	
                        <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                            Add New Template
                        </Button>					
                    </div>
                </Col>				
                <Col xs={12} md={6}>
                   <div className="input-group mb-2">
                        <input 
                            type="text" 
                            className="form-control text-truncate" 
                            placeholder="Search templates....." 
                            aria-label="Search templates....." 
                            aria-describedby="button-addon2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="button" onClick={handleSearch}>Search</button>
                    </div>
                </Col>
            </Row>
         	
            <Row>
                <Col xs={12}>
                        {templates?.length === 0 ? 						
                            <Alert variant='primary' className="alert d-flex align-items-center" role="alert">
                                <svg className="flex-shrink-0 me-2 svg-primary" xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                                <div>
                                    No templates found
                                </div>
                            </Alert> : 
                            templates?.map((template, index) => (
                                <Link key={index} href={`/manage/templates/${template._id}`}>
                                    <Card className="mb-2">
                                        <Card.Body>
                                            <Row className="align-items-center">
                                                <Col xs={12} md={6}>
                                                    <svg
                                                    className="me-2"
                                                    version="1.1"
                                                    id="Livello_1"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                                    x="0px"
                                                    y="0px"
                                                    viewBox="0 0 512 512"
                                                    width="24"
                                                    height="24"
                                                    style={{ enableBackground: "new 0 0 512 512" }}
                                                    xmlSpace="preserve"
                                                    >
                                                    <defs>
                                                        <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="45.8183" y1="-1083.4916" x2="216.1361" y2="-788.5082" gradientTransform="matrix(1 0 0 1 0 1192)">
                                                        <stop offset="0" style={{ stopColor: "#2368C4" }} />
                                                        <stop offset="0.5" style={{ stopColor: "#1A5DBE" }} />
                                                        <stop offset="1" style={{ stopColor: "#1146AC" }} />
                                                        </linearGradient>
                                                    </defs>
                                                    <style jsx>{`
                                                        .st0 { fill: #41A5EE; }
                                                        .st1 { fill: #2B7CD3; }
                                                        .st2 { fill: #185ABD; }
                                                        .st3 { fill: #103F91; }
                                                        .st4 { opacity: 0.1; }
                                                        .st5 { opacity: 0.2; }
                                                        .st6 { fill: url(#SVGID_1_); }
                                                        .st7 { fill: #FFFFFF; }
                                                    `}</style>
                                                    <path className="st0" d="M490.17,19.2H140.9c-12.05,0-21.83,9.72-21.83,21.7l0,0v96.7l202.42,59.2L512,137.6V40.9C512,28.91,502.23,19.2,490.17,19.2L490.17,19.2z" />
                                                    <path className="st1" d="M512,137.6H119.07V256l202.42,35.52L512,256V137.6z" />
                                                    <path className="st2" d="M119.07,256v118.4l190.51,23.68L512,374.4V256H119.07z" />
                                                    <path className="st3" d="M140.9,492.8h349.28c12.05,0,21.83-9.72,21.83-21.7l0,0v-96.7H119.07v96.7C119.07,483.09,128.84,492.8,140.9,492.8L140.9,492.8z" />
                                                    <path className="st4" d="M263.94,113.92H119.07v296h144.87c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C285.73,123.65,275.98,113.96,263.94,113.92z" />
                                                    <path className="st5" d="M252.04,125.76H119.07v296h132.97c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C273.82,135.49,264.07,125.8,252.04,125.76z" />
                                                    <path className="st5" d="M252.04,125.76H119.07v272.32h132.97c12.04-0.04,21.79-9.73,21.83-21.7V147.46C273.82,135.49,264.07,125.8,252.04,125.76z" />
                                                    <path className="st5" d="M240.13,125.76H119.07v272.32h121.06c12.04-0.04,21.79-9.73,21.83-21.7V147.46C261.91,135.49,252.17,125.8,240.13,125.76z" />
                                                    <path className="st6" d="M21.83,125.76h218.3c12.05,0,21.83,9.72,21.83,21.7v217.08c0,11.99-9.77,21.7-21.83,21.7H21.83C9.77,386.24,0,376.52,0,364.54V147.46C0,135.48,9.77,125.76,21.83,125.76z" />
                                                    <path className="st7" d="M89.56,292.21c0.43,3.35,0.71,6.26,0.85,8.76h0.5c0.19-2.37,0.59-5.22,1.19-8.56c0.6-3.34,1.15-6.16,1.63-8.47l22.96-98.49h29.68l23.81,97.01c1.38,6.03,2.37,12.15,2.96,18.3h0.39c0.44-5.97,1.27-11.9,2.48-17.76l18.99-97.6h27.02l-33.36,141.13H157.1l-22.62-93.47c-0.65-2.69-1.4-6.2-2.23-10.53s-1.33-7.48-1.54-9.47h-0.39c-0.26,2.3-0.77,5.71-1.54,10.23c-0.76,4.52-1.37,7.87-1.83,10.04l-21.27,93.17h-32.1L40.04,185.46h27.5l20.68,98.69C88.7,286.17,89.14,288.87,89.56,292.21z" />
                                                   </svg>
                                                    <span className="fs-16">{template.name}</span>
                                                </Col>								
                                                <Col xs={12} md={3} className="mt-1 mt-md-0">
                                                    {template.placeholders.length == 0 ? <Badge bg="primary" className="me-1">Incomplete</Badge>: `${template.placeholders.length} Signatures`} 
                                                </Col>
                                                <Col xs={12} md={3} className="mt-1 mt-md-0 text-muted">
                                                    {moment(template.updatedAt).fromNow()}									
                                                </Col>	                                              															
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            ))
                        }
                </Col>
            </Row> 

             {pagination.totalPages > 1 && (
                <Row className="mt-4">
                    <Col>
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            maxVisiblePages={5}  // Adjust this number as needed
                            className="justify-content-center"  // Center the pagination
                        />
                    </Col>
                </Row>
             )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Add New Word Template</Modal.Title>
                </Modal.Header>
                <Modal.Body>                       
                    <Card className="bd-0 mg-b-20">						
							   {uploadError ? 
								<Card.Body className="border border-danger text-center rounded">
								<div className="danger-widget">
								<i className="bi bi-x-circle mg-b-20 fs-50 text-danger lh-1"></i>
								<h3 className="mt-3 text-danger">Error!</h3>

								<h6 className="mt-3 mb-2">The template is a Microsoft Word Document with a .docx extension. Please edit a exisitng Word Document to include tags as below to be completed and signed by any recipient</h6>		
								<svg
								className="me-2"
								version="1.1"
								id="Livello_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								viewBox="0 0 512 512"
								width="24"
								height="24"
								style={{ enableBackground: "new 0 0 512 512" }}
								xmlSpace="preserve"
								>
								<defs>
									<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="45.8183" y1="-1083.4916" x2="216.1361" y2="-788.5082" gradientTransform="matrix(1 0 0 1 0 1192)">
									<stop offset="0" style={{ stopColor: "#2368C4" }} />
									<stop offset="0.5" style={{ stopColor: "#1A5DBE" }} />
									<stop offset="1" style={{ stopColor: "#1146AC" }} />
									</linearGradient>
								</defs>
								<style jsx>{`
									.st0 { fill: #41A5EE; }
									.st1 { fill: #2B7CD3; }
									.st2 { fill: #185ABD; }
									.st3 { fill: #103F91; }
									.st4 { opacity: 0.1; }
									.st5 { opacity: 0.2; }
									.st6 { fill: url(#SVGID_1_); }
									.st7 { fill: #FFFFFF; }
								`}</style>
								<path className="st0" d="M490.17,19.2H140.9c-12.05,0-21.83,9.72-21.83,21.7l0,0v96.7l202.42,59.2L512,137.6V40.9C512,28.91,502.23,19.2,490.17,19.2L490.17,19.2z" />
								<path className="st1" d="M512,137.6H119.07V256l202.42,35.52L512,256V137.6z" />
								<path className="st2" d="M119.07,256v118.4l190.51,23.68L512,374.4V256H119.07z" />
								<path className="st3" d="M140.9,492.8h349.28c12.05,0,21.83-9.72,21.83-21.7l0,0v-96.7H119.07v96.7C119.07,483.09,128.84,492.8,140.9,492.8L140.9,492.8z" />
								<path className="st4" d="M263.94,113.92H119.07v296h144.87c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C285.73,123.65,275.98,113.96,263.94,113.92z" />
								<path className="st5" d="M252.04,125.76H119.07v296h132.97c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C273.82,135.49,264.07,125.8,252.04,125.76z" />
								<path className="st5" d="M252.04,125.76H119.07v272.32h132.97c12.04-0.04,21.79-9.73,21.83-21.7V147.46C273.82,135.49,264.07,125.8,252.04,125.76z" />
								<path className="st5" d="M240.13,125.76H119.07v272.32h121.06c12.04-0.04,21.79-9.73,21.83-21.7V147.46C261.91,135.49,252.17,125.8,240.13,125.76z" />
								<path className="st6" d="M21.83,125.76h218.3c12.05,0,21.83,9.72,21.83,21.7v217.08c0,11.99-9.77,21.7-21.83,21.7H21.83C9.77,386.24,0,376.52,0,364.54V147.46C0,135.48,9.77,125.76,21.83,125.76z" />
								<path className="st7" d="M89.56,292.21c0.43,3.35,0.71,6.26,0.85,8.76h0.5c0.19-2.37,0.59-5.22,1.19-8.56c0.6-3.34,1.15-6.16,1.63-8.47l22.96-98.49h29.68l23.81,97.01c1.38,6.03,2.37,12.15,2.96,18.3h0.39c0.44-5.97,1.27-11.9,2.48-17.76l18.99-97.6h27.02l-33.36,141.13H157.1l-22.62-93.47c-0.65-2.69-1.4-6.2-2.23-10.53s-1.33-7.48-1.54-9.47h-0.39c-0.26,2.3-0.77,5.71-1.54,10.23c-0.76,4.52-1.37,7.87-1.83,10.04l-21.27,93.17h-32.1L40.04,185.46h27.5l20.68,98.69C88.7,286.17,89.14,288.87,89.56,292.21z" />
								</svg> 			
															
								{profilePlaceholders && (
									<div className="mt-4">
										<h6>Available Profile Placeholders:</h6>
										<div className="row justify-content-center">
											{profilePlaceholders?.map((holder, index) => (
												<div key={index} className="col-md-4 col-sm-6 mb-2">
													<OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}>{holder.text}</Tooltip>}>
														<code className={`${holder.isPresent ? 'text-success' : ''}`} style={{ cursor: 'pointer' }}>
															{holder.tag}
														</code>
													</OverlayTrigger>
												</div>
											))}
										</div>
									</div>									
								)}
								<p className="mt-2">This will allow the template to be automatically be completed by the users profile</p>
								<p className="mt-3 mb-0 text-danger">							
									<strong>Or</strong>
								</p>
								<p className="mt-3 mb-0 text-danger">							
									<strong>{'Add any tag of your choice to be completed by the recipient in format: {tag}'}</strong>
								</p>
							</div>
								</Card.Body> :
								<Card.Body className="border border-info text-center rounded">
								<div className="info-widget">
									<i className="bi bi-info-circle mg-b-20 fs-50 text-info lh-1"></i>
									<h3 className="mt-3 text-info">Info!</h3>
									<h6 className="mt-3 mb-2">The template is a existing Microsoft Word Document that is used to replace placeholders with actual data.</h6>							
									
									<svg
								className="me-2"
								version="1.1"
								id="Livello_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								viewBox="0 0 512 512"
								width="24"
								height="24"
								style={{ enableBackground: "new 0 0 512 512" }}
								xmlSpace="preserve"
								>
								<defs>
									<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="45.8183" y1="-1083.4916" x2="216.1361" y2="-788.5082" gradientTransform="matrix(1 0 0 1 0 1192)">
									<stop offset="0" style={{ stopColor: "#2368C4" }} />
									<stop offset="0.5" style={{ stopColor: "#1A5DBE" }} />
									<stop offset="1" style={{ stopColor: "#1146AC" }} />
									</linearGradient>
								</defs>
								<style jsx>{`
									.st0 { fill: #41A5EE; }
									.st1 { fill: #2B7CD3; }
									.st2 { fill: #185ABD; }
									.st3 { fill: #103F91; }
									.st4 { opacity: 0.1; }
									.st5 { opacity: 0.2; }
									.st6 { fill: url(#SVGID_1_); }
									.st7 { fill: #FFFFFF; }
								`}</style>
								<path className="st0" d="M490.17,19.2H140.9c-12.05,0-21.83,9.72-21.83,21.7l0,0v96.7l202.42,59.2L512,137.6V40.9C512,28.91,502.23,19.2,490.17,19.2L490.17,19.2z" />
								<path className="st1" d="M512,137.6H119.07V256l202.42,35.52L512,256V137.6z" />
								<path className="st2" d="M119.07,256v118.4l190.51,23.68L512,374.4V256H119.07z" />
								<path className="st3" d="M140.9,492.8h349.28c12.05,0,21.83-9.72,21.83-21.7l0,0v-96.7H119.07v96.7C119.07,483.09,128.84,492.8,140.9,492.8L140.9,492.8z" />
								<path className="st4" d="M263.94,113.92H119.07v296h144.87c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C285.73,123.65,275.98,113.96,263.94,113.92z" />
								<path className="st5" d="M252.04,125.76H119.07v296h132.97c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C273.82,135.49,264.07,125.8,252.04,125.76z" />
								<path className="st5" d="M252.04,125.76H119.07v272.32h132.97c12.04-0.04,21.79-9.73,21.83-21.7V147.46C273.82,135.49,264.07,125.8,252.04,125.76z" />
								<path className="st5" d="M240.13,125.76H119.07v272.32h121.06c12.04-0.04,21.79-9.73,21.83-21.7V147.46C261.91,135.49,252.17,125.8,240.13,125.76z" />
								<path className="st6" d="M21.83,125.76h218.3c12.05,0,21.83,9.72,21.83,21.7v217.08c0,11.99-9.77,21.7-21.83,21.7H21.83C9.77,386.24,0,376.52,0,364.54V147.46C0,135.48,9.77,125.76,21.83,125.76z" />
								<path className="st7" d="M89.56,292.21c0.43,3.35,0.71,6.26,0.85,8.76h0.5c0.19-2.37,0.59-5.22,1.19-8.56c0.6-3.34,1.15-6.16,1.63-8.47l22.96-98.49h29.68l23.81,97.01c1.38,6.03,2.37,12.15,2.96,18.3h0.39c0.44-5.97,1.27-11.9,2.48-17.76l18.99-97.6h27.02l-33.36,141.13H157.1l-22.62-93.47c-0.65-2.69-1.4-6.2-2.23-10.53s-1.33-7.48-1.54-9.47h-0.39c-0.26,2.3-0.77,5.71-1.54,10.23c-0.76,4.52-1.37,7.87-1.83,10.04l-21.27,93.17h-32.1L40.04,185.46h27.5l20.68,98.69C88.7,286.17,89.14,288.87,89.56,292.21z" />
									</svg> 
									{profilePlaceholders && (
										<div className="mt-4">
											<h6>Available Profile Placeholders:</h6>
											<div className="row justify-content-center">
												{profilePlaceholders?.map((holder, index) => (
													<div key={index} className="col-md-4 col-sm-6 mb-2">
														<OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}>{holder.text}</Tooltip>}>
															<code className={`${holder.isPresent ? 'text-success' : ''}`} style={{ cursor: 'pointer' }}>
																{holder.tag}
															</code>
														</OverlayTrigger>
													</div>
												))}
											</div>
										</div>									
									)}
									<p className="mt-2">This will allow the template to be automatically be completed by the reciepient's profile</p>
									<p className="mt-3 mb-0 text-info">							
										<strong>Or</strong>
									</p>
									<p className="mt-3 mb-0 text-info">							
										<strong>{'Add any placeholder of your choice in format: {placeholder}'}</strong>
									</p>
					
								</div>
								</Card.Body>}						
					</Card>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>{'Select a Word document (.docx) file to upload'}</Form.Label>
                        <Form.Control type="file" name='file' accept=".docx" onChange={handleFileChange} />
                    </Form.Group>                 
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleFileUpload} disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Template'}
                    </Button>
                </Modal.Footer>
            </Modal>				
        </StateHandler>
    )
};

TemplatesPage.layout = "ManageLayout";

export default TemplatesPage;