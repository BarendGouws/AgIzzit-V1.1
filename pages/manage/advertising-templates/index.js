import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import moment from 'moment';
import Pagination from '@/components/partials/Pagination';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { fetchAdvertisingTemplates,  } from "@/redux/manage/slices/advertisingTemplates";

const AdvertisingTemplatesPage = ({ }) => {	

    const router = useRouter(); 
    const dispatch = useDispatch();

    const { templates, pagination, loading } = useSelector(state => state.advertisingTemplate);

    const [searchTerm, setSearchTerm] = useState('');   

    const loadTemplates = (page = 1) => {
        dispatch(fetchAdvertisingTemplates({ page, searchTerm }));
    }; 

	const handlePageChange = (page) => {
        loadTemplates(page);       
    };

    const handleSearch = () => {
        dispatch(fetchAdvertisingTemplates({ page: 1, searchTerm }));
    };  

    useEffect(() => {
        loadTemplates();
    }, []);   
    
    return (
        <StateHandler slice="advertisingTemplate">
    
            <Pageheader title="Advertsing Templates" heading="Manage" active="Advertsing Templates" />	
    
            <Row className="mb-4">					
                <Col xs={12} md={6}>
                    <div className="fs-18 mb-2 d-grid d-md-block">	
                        <Button variant="outline-primary" href='/manage/advertising-templates/new' >
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
                                <Link key={index} href={`/manage/advertising-templates/${template._id}`}>
                                    <Card className="mb-2">
                                        <Card.Body>
                                            <Row className="align-items-center">
                                                <Col xs={12} md={4}>
                                                    <svg 
                                                     className="me-2"
                                                     xmlns="http://www.w3.org/2000/svg" 
                                                     shape-rendering="geometricPrecision" 
                                                     text-rendering="geometricPrecision" 
                                                     image-rendering="optimizeQuality" 
                                                     fill-rule="evenodd" 
                                                     clip-rule="evenodd" 
                                                     viewBox="0 0 512 407.96"width="24"
                                                     height="24">
                                                    <path fill-rule="nonzero" d="M74.36 0h295.21c40.84 0 74.37 33.52 74.37 74.36v146.3c-9.49-5.1-19.01-10.13-28.35-14.93V74.36c0-25.32-20.69-46.02-46.02-46.02H74.36c-25.34 0-46.02 20.68-46.02 46.02v169.07c0 25.27 20.76 46.01 46.02 46.01h240.72l4.55 28.35H74.36C33.46 317.79 0 284.33 0 243.43V74.36C0 33.51 33.51 0 74.36 0zM460.8 406.23c-5.6 3.19-12.89 1.91-16.8-3.38l-28.14-38.81-19.56 27.06c-1.61 2.22-3.37 4.22-5.2 5.88-11.66 10.7-26.11 7.98-29.12-9.25l-25.01-166.24c-1.59-7.56 6.08-13.54 13.1-10.47 41.84 16.73 107.81 52.79 151 76.3 20.73 11.36 8.43 28.53-7.57 33.59-9.71 3.71-21.78 6.88-31.9 10.07l28.07 39.08c3.84 5.52 2.52 13.21-2.7 17.36-7.55 5.36-18.61 14.72-26.17 18.81zm-6.17-13.11L477 376.97c-7.25-9.92-31.76-39.89-35.15-48.82-1.19-3.75.94-7.79 4.69-8.96 13.6-4.19 27.8-7.94 41.53-11.83 3.16-1.01 5.95-2.36 8.11-4.94-1.09-1.1-1.74-1.62-3.14-2.38l-138.81-70.13 22.94 153.4c.08.44.91 3.8 1.1 4.03 3.36-2 5.02-3.25 7.41-6.55 4.87-7.26 19.14-31.77 24.72-35.97 3.19-2.19 7.6-1.46 9.88 1.68l34.35 46.62zM232.67 215.38V102.41h50.61c20.36 0 34.34 4.34 41.93 13.02 7.59 8.67 11.39 23.17 11.39 43.47 0 20.3-3.8 34.79-11.39 43.46-7.59 8.68-21.57 13.02-41.93 13.02h-50.61zm51.15-84.04h-15v55.12h15c4.94 0 8.53-.58 10.75-1.72 2.23-1.14 3.35-3.77 3.35-7.86v-35.97c0-4.09-1.12-6.71-3.35-7.86-2.22-1.14-5.81-1.71-10.75-1.71zm-138.35 84.04h-38.14l29.28-112.97h55.85l29.28 112.97H183.6l-4.15-17.9h-29.83l-4.15 17.9zm18.07-78.26-7.41 31.63h16.63l-7.23-31.63h-1.99z"/></svg>
                                                    <span className="fs-16">{template.name}</span>
                                                </Col>
                                                <Col xs={12} md={2} className="mt-1 mt-md-0 text-muted">
                                                    {`${template.designSize} Ratio`}									
                                                </Col>								
                                                <Col xs={12} md={3} className="mt-1 mt-md-0">
                                                    {template?.layers?.length == 0 ? <Badge bg="primary" className="me-1">Incomplete</Badge>: `${template.layers.length} Layers`} 
                                                </Col>
                                                <Col xs={12} md={2} className="mt-1 mt-md-0 text-muted">
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
        			
        </StateHandler>
    )
};

AdvertisingTemplatesPage.layout = "ManageLayout";

export default AdvertisingTemplatesPage;