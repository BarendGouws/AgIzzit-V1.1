import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import Image from 'next/image';
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import Pagination from '@/components/partials/Pagination';
import { fetchInventory } from "@/redux/manage/slices/inventory";

const Inventorylist = ({}) => {

	const router = useRouter(); 
    const dispatch = useDispatch();

    const { inventory, pagination, stats } = useSelector(state => state.inventory);

	const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const loadInventory = (page = 1) => {
        dispatch(fetchInventory({ page, searchTerm, statusFilter }));
    };   

    useEffect(() => {
        loadInventory();
    }, []); 

	const renderStatusCard = (title, count, status, bgClass) => (
        <Col xl={3} lg={6} md={6} sm={12} className="d-flex">
            <Card 
                className={`${bgClass} text-white`} 
                style={{ cursor: 'pointer' }}
                onClick={() => { setSearchTerm(''); setStatusFilter(status); }}
            >
                <Card.Body>                            
                    <Row>
                        <div className="col-6">
                            <div className="icon1 mt-2 text-center text-fixed-white">
                                <i className={`fe fe-${title === 'Total' ? 'file-text' : title === 'Distinct Products' ? 'layers' : title === 'Low Stock Items' ? 'alert-triangle' : title === 'Inventory Value' ? 'dollar-sign' : 'activity'} fs-40`}></i>
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

    const InventoryCard = ({ item }) => {

        const getStatusBadge = () => {
          if (item.isSold) return { label: 'Sold', variant: 'destructive' };
          if (item.isUnavailable) return { label: 'Unavailable', variant: 'destructive' };
          if (item.isReserved) return { label: 'Reserved', variant: 'warning' };
          if (item.saleInProgress) return { label: 'Sale in Progress', variant: 'warning' };
          if (item.isPreApproved) return { label: 'Pre-Approved', variant: 'success' };
          return { label: 'Available', variant: 'default' };
        };
      
        const status = getStatusBadge();
          
        return (
            <Link href={`/manage/inventory/${item._id}`}>
                                    <Card className="mb-2">
                                        <Card.Body>
                                            <Row className="align-items-center">
                                                <Col xs={12} md={2}>
                                                <Image
                                                        src={item?.images?.[0]?.url || '/assets/img/system/no-image-available.png'}
                                                        alt={item.fullDescription || 'Vehicle image'}
                                                        width={120}
                                                        height={90}
                                                        className="rounded object-cover"                                                        
                                                    />                                                
                                                </Col>

                                                <Col xs={12} md={6} lg={4} className="mt-2 mt-md-0">
                                                    <h6 className="mb-0 mt-1">{item.fullDescription}</h6>
                                                    <p className="text-primary mt-1 mt-md-3 mb-0"><strong>{`R ${item.price}`}</strong></p>
                                                </Col>

                                                <Col xs={12} md={2} className="d-none d-lg-block mt-1 mt-md-0">
                                                    <OverlayTrigger placement="left" overlay={<Tooltip>Views</Tooltip>}>
                                                        <p className="text-muted mt-3 mb-0">
                                                            <i className="fas fa-eye me-2"></i>{item.views}
                                                        </p>
                                                    </OverlayTrigger>

                                                    <OverlayTrigger placement="left" overlay={<Tooltip>Engagements</Tooltip>}>
                                                        <p className="text-muted mt-3 mb-0">
                                                            <i className="fas fa-chart-line me-2"></i>{item.engagements}
                                                        </p>
                                                    </OverlayTrigger>
                                                </Col>

                                                <Col xs={12} md={2} className="d-none d-lg-block mt-1 mt-md-0">
                                                    <OverlayTrigger placement="left" overlay={<Tooltip>Call Events</Tooltip>}>
                                                        <p className="text-muted mt-2 mb-0">
                                                            <i className="fas fa-phone me-2"></i>{item.callEvents}
                                                        </p>
                                                    </OverlayTrigger>

                                                    <OverlayTrigger placement="left" overlay={<Tooltip>WhatsApp Started</Tooltip>}>
                                                        <p className="text-muted mt-3 mb-0">
                                                            <i className="fab fa-whatsapp me-2"></i>{item.watsappsStarted}
                                                        </p>
                                                    </OverlayTrigger>
                                                </Col>

                                                <Col xs={12} sm={4} md={2} className="mt-1 mt-md-0 text-muted">
                                                    <Badge variant={status.variant} className="mt-1 mt-md-2 mb-0">
                                                     {status.label}
                                                    </Badge>
                                                    <p className="text-muted mt-1 mt-md-3 mb-0">{moment(item.updatedAt).fromNow()}</p>
                                                </Col>
                                                
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Link>
        
        );
    };

	return (
		<StateHandler slice="inventory">
     
            <Pageheader title="Inventory" heading="Manage" active="Inventory" />

            <Row className="row-sm mb-4 align-items-stretch">
                {renderStatusCard("Total", stats.totalItems, "", "bg-primary-gradient")}
                {renderStatusCard("Distinct Products", stats.distinctProducts, "Distinct Products", "bg-danger-gradient")}
                {renderStatusCard("Low Stock Items", stats.lowStockItems, "Low Stock Items", "bg-success-gradient")}
                {renderStatusCard("Inventory Value", stats.totalInventoryValue, "Inventory Value", "bg-warning-gradient")}
            </Row>

            <Row className="mb-4">
				<Col xs={12} md={6}>
					<div className="fs-18 mb-2 d-grid d-md-block">
					<Button variant="outline-primary" href="/manage/inventory/new">
						Load inventory
					</Button>
					</div>
				</Col>
				<Col xs={12} md={6}>
					<div className="input-group mb-2">
					<input
						type="text"
						className="form-control text-truncate"
						placeholder="Search inventory....."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<button className="btn btn-primary" type="button" onClick={() => { setStatusFilter(''); loadInventory(1);}}>
						Search
					</button>
					</div>
				</Col>
			</Row>
           
            <Row>
               <Col xs={12}>
                        {inventory && inventory.length > 0 ? (
                            inventory.map((item, index) => (
                                <InventoryCard key={index} item={item} />
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
                                    No Inventory Found
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
                            onPageChange={(page) => loadInventory(page)}
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

Inventorylist.layout = "ManageLayout"

export default Inventorylist;