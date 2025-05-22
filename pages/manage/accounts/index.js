import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert, Form, InputGroup } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import Pagination from '@/components/partials/Pagination';
import StaffCard from '@/components/manage/StaffCard';
import { fetchStaff } from "@/redux/manage/slices/staff";

const Accountslist = ({ }) => {

	const router = useRouter(); 
    const dispatch = useDispatch();

    const { staff, pagination, stats } = useSelector(state => state.staff);

	const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const loadStaff = (page = 1) => {
        dispatch(fetchStaff({ page, searchTerm, statusFilter }));
    };   

    useEffect(() => {
        loadStaff();
    }, []); 

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
	

	return (
		<StateHandler slice="accounts">
     
            <Pageheader title="Accounts" heading="Manage" active="Accounts" />

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
						Load a new staff member
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
					<button className="btn btn-primary" type="button" onClick={() => { setStatusFilter(''); loadStaff(1);}}>
						Search
					</button>
					</div>
				</Col>
			</Row>
           
            <Row>
               <Col xs={12}>
                        {staff && staff.length > 0 ? (
                            staff.map((signature, index) => (
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
                            onPageChange={(page) => loadStaff(page)}
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
                    <h1>Test</h1>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={(e) => console.log(e)} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate TODO'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </StateHandler>
	);
   
}

Accountslist.layout = "ManageLayout"

export default Accountslist;