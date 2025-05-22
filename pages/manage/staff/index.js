import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import Pagination from '@/components/partials/Pagination';
import { fetchStaff } from "@/redux/manage/slices/staff";

const Stafflist = ({ }) => {

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

    console.log(staff);
	
	return (
		<StateHandler slice="staff">
     
            <Pageheader title="Staff" heading="Manage" active="Staff" />

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
                            staff.map((staff, index) => (
                                <Link key={index} href={`/manage/staff/${staff._id}`}>
                                    <Card className="mb-2">
                                        <Card.Body>
                                            <Row className="align-items-center">
                                                <Col xs={12} md={4}>                                              
                                                    <span className="fs-14">{staff.fullNames}</span>
                                                </Col>
                                                <Col xs={12} md={3}>                                              
                                                    <span className="fs-14">{staff.occupation}</span>
                                                </Col>
                                                <Col xs={12} md={3} className="mt-1 mt-md-0">
                                                    <Badge bg={staff.isActive ? 'success' : 'warning'}>
                                                        {staff.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </Col>
                                                <Col xs={12} md={2} className="mt-1 mt-md-0 text-muted">
                                                    {moment(staff.startDate).fromNow()}
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
                                    No Staff Found
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

Stafflist.layout = "ManageLayout"

export default Stafflist;