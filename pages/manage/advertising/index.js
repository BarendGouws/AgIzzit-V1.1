import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Row, Badge, Alert, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import Link from "next/link";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import Pagination from '@/components/partials/Pagination';
import { fetchAdvertising } from "@/redux/manage/slices/advertising";
import { FilterX, Database } from "lucide-react";

const AdvertisingList = () => {
    const dispatch = useDispatch();

    const { advertising, pagination, stats } = useSelector(state => state.advertising);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadFeeds = (page = 1) => {
        dispatch(fetchAdvertising({ page, searchTerm, status: statusFilter }));
    };

    const handlePageChange = (page) => {
        loadFeeds(page);       
    };

    const handleSearch = () => {
        loadFeeds(1);
    };

    useEffect(() => {
        loadFeeds();
    }, [statusFilter]); 

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
                                <i className={`fe fe-${title === 'Total' ? 'file-text' : title === 'Draft' ? 'clock' : title === 'Active' ? 'activity' : 'check-circle'} fs-40`}></i>
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

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'meta':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 340.238"><path fillRule="nonzero" d="M367.457 0c-41.982 0-74.801 31.62-104.509 71.788C222.124 19.807 187.982 0 147.124 0 63.824 0 0 108.407 0 223.149c0 71.802 34.737 117.089 92.92 117.089 41.877 0 71.995-19.743 125.536-113.334 0 0 22.319-39.414 37.673-66.564a1722.74 1722.74 0 0117 28.081l25.107 42.237c48.909 81.843 76.159 109.58 125.536 109.58 56.683 0 88.228-45.906 88.228-119.2C512 100.898 446.737 0 367.457 0zM177.628 201.562c-43.41 68.047-58.427 83.3-82.596 83.3-24.872 0-39.655-21.837-39.655-60.774 0-83.3 41.532-168.477 91.043-168.477 26.811 0 49.216 15.484 83.536 64.616-32.588 49.985-52.328 81.335-52.328 81.335zm163.834-8.567l-30.019-50.065c-8.124-13.212-15.931-25.374-23.422-36.484 27.056-41.759 49.374-62.567 75.917-62.567 55.141 0 99.255 81.188 99.255 180.913 0 38.013-12.45 60.07-38.248 60.07-24.725 0-36.536-16.33-83.483-91.867z"/></svg> );
            case 'tiktok':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 449.45 515.38"><path fillRule="nonzero" d="M382.31 103.3c-27.76-18.1-47.79-47.07-54.04-80.82-1.35-7.29-2.1-14.8-2.1-22.48h-88.6l-.15 355.09c-1.48 39.77-34.21 71.68-74.33 71.68-12.47 0-24.21-3.11-34.55-8.56-23.71-12.47-39.94-37.32-39.94-65.91 0-41.07 33.42-74.49 74.48-74.49 7.67 0 15.02 1.27 21.97 3.44V190.8c-7.2-.99-14.51-1.59-21.97-1.59C73.16 189.21 0 262.36 0 352.3c0 55.17 27.56 104 69.63 133.52 26.48 18.61 58.71 29.56 93.46 29.56 89.93 0 163.08-73.16 163.08-163.08V172.23c34.75 24.94 77.33 39.64 123.28 39.64v-88.61c-24.75 0-47.8-7.35-67.14-19.96z"/></svg>
                )            
            case 'google':
                return (
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2"><path d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032v-.233z"/></svg>
                );
            case 'microsoft':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512.02"><path fill="#0078D4" fillRule="nonzero" d="M0 512.02h242.686V269.335H0V512.02zm0-269.334h242.686V0H0v242.686zm269.314 0H512V0H269.314v242.686zm0 269.334H512V269.335H269.314V512.02z"/></svg>
                );
            case 'pinterest':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512"><path fillRule="nonzero" d="M0 256c0 109.29 68.5 202.6 164.91 239.32-2.35-19.99-4.84-52.95.53-76.07 4.63-19.89 29.89-126.68 29.89-126.68s-7.62-15.25-7.62-37.85c0-35.41 20.53-61.87 46.11-61.87 21.76 0 32.25 16.33 32.25 35.89 0 21.87-13.93 54.55-21.12 84.87-5.99 25.36 12.74 46.05 37.74 46.05 45.29 0 80.13-47.77 80.13-116.71 0-61.04-43.86-103.68-106.48-103.68-72.48 0-115.04 54.38-115.04 110.59 0 21.91 8.42 45.38 18.96 58.16a7.568 7.568 0 012.07 5.21c0 .7-.1 1.41-.29 2.09-1.94 8.07-6.26 25.37-7.08 28.9-1.13 4.65-3.69 5.66-8.54 3.4-31.82-14.81-51.71-61.34-51.71-98.71 0-80.41 58.4-154.22 168.36-154.22 88.41 0 157.13 63 157.13 147.18 0 87.83-55.37 158.53-132.25 158.53-25.84 0-50.09-13.45-58.41-29.3 0 0-12.78 48.68-15.88 60.59-6.01 23.13-22.7 52.39-33.04 69.01 23.84 7.36 49.14 11.3 75.38 11.3 141.38 0 256-114.63 256-256S397.38 0 256 0 0 114.62 0 256z"/></svg>
                );
            case 'linkedin':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 509.64"><rect width="512" height="509.64" rx="115.61" ry="115.61"/><path fill="#fff" d="M204.97 197.54h64.69v33.16h.94c9.01-16.16 31.04-33.16 63.89-33.16 68.31 0 80.94 42.51 80.94 97.81v116.92h-67.46l-.01-104.13c0-23.81-.49-54.45-35.08-54.45-35.12 0-40.51 25.91-40.51 52.72v105.86h-67.4V197.54zm-38.23-65.09c0 19.36-15.72 35.08-35.08 35.08-19.37 0-35.09-15.72-35.09-35.08 0-19.37 15.72-35.08 35.09-35.08 19.36 0 35.08 15.71 35.08 35.08zm-70.17 65.09h70.17v214.73H96.57V197.54z"/></svg>
                )
            case 'x':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 462.799"><path fillRule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/></svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 511.999"><path d="M476.335 35.664v.001c47.554 47.552 47.552 125.365.002 172.918l-101.729 101.73c-60.027 60.025-162.073 42.413-194.762-32.45 35.888-31.191 53.387-21.102 87.58-6.638 20.128 8.512 43.74 3.955 60.08-12.387l99.375-99.371c21.49-21.493 21.492-56.662 0-78.155-21.489-21.488-56.677-21.472-78.151 0l-71.278 71.28c-23.583-11.337-50.118-14.697-75.453-10.07a121.476 121.476 0 0118.767-24.207l82.651-82.65c47.554-47.551 125.365-47.555 172.918-.001zM35.664 476.334l.001.001c47.554 47.552 125.365 47.552 172.917 0l85.682-85.682a121.496 121.496 0 0019.325-25.157c-27.876 6.951-57.764 4.015-83.932-8.805l-70.192 70.19c-21.472 21.471-56.658 21.492-78.149 0-21.492-21.491-21.493-56.658 0-78.149l99.375-99.376c20.363-20.363 61.002-26.435 91.717 1.688 29.729-3.133 41.275-8.812 59.742-26.493-39.398-69.476-137.607-80.013-194.757-22.863L35.664 303.417c-47.552 47.553-47.552 125.364 0 172.917z"/></svg>);
        }
    };

    const AdvertisingCard = ({ feed, index }) => {
    // Function to get status badge
    const getStatusBadge = (status) => {
        let variant = "secondary";
        
        switch (status) {
        case "active":
            variant = "success";
            break;
        case "paused":
            variant = "info";
            break;
        case "inactive":
            variant = "danger";
            break;
        default:
            variant = "secondary";
        }
        
        return <Badge bg={variant}>{status}</Badge>;
    };

    // Calculate the number of filters applied
    const filterCount = feed.filters ? Object.keys(feed.filters).length : 0;
    
    // Get inventory count
    const inventoryCount = feed.inventory ? feed.inventory.length : 0;

    return (
        <Link href={`/manage/advertising/${feed._id}`} key={index}>
        <Card className="mb-2">
            <Card.Body>
            {/* Two-row layout for medium and smaller screens */}
            <Row className="align-items-center">
                {/* Title/name - full width on md and smaller, col-8 on lg+ */}
                <Col xs={12} lg={5} className="mb-2 mb-lg-0">
                    <div className="d-flex align-items-center">
                        {getPlatformIcon(feed.platform)}
                        <span className="ms-2 fs-16">
                            {feed.name}
                        </span>
                    </div>
                </Col>
                
                {/* Hidden on medium and smaller, shown on lg+ with original layout */}
                <Col lg={2} className="d-none d-lg-block">
                    {getStatusBadge(feed.status)}
                </Col>
                
                <Col lg={3} className="d-none d-lg-block">
                    <div className="d-flex">
                        <OverlayTrigger
                            placement="top"
                            overlay={
                            <Tooltip>
                                {filterCount > 0 
                                ? `${filterCount} filter${filterCount !== 1 ? 's' : ''} applied` 
                                : 'No filters applied'}
                            </Tooltip>
                            }
                        >
                            <span className="d-inline-flex align-items-center text-muted me-3">
                                <FilterX size={16} className="me-1" />
                                {filterCount}
                            </span>
                        </OverlayTrigger>
                        
                        <OverlayTrigger
                            placement="top"
                            overlay={
                            <Tooltip>
                                {inventoryCount > 0 
                                ? `${inventoryCount} item${inventoryCount !== 1 ? 's' : ''} in inventory` 
                                : 'No inventory items'}
                            </Tooltip>
                            }
                        >
                            <span className="d-inline-flex align-items-center text-muted">
                                <Database size={16} className="me-1" />
                                {inventoryCount}
                            </span>
                        </OverlayTrigger>
                    </div>
                </Col>
                
                <Col lg={2} className="d-none d-lg-block text-end">
                    <OverlayTrigger
                        placement="left"
                        overlay={
                        <Tooltip>
                            Updated: {moment(feed.updatedAt).format('MMM DD, YYYY HH:mm')}
                        </Tooltip>
                        }
                    >
                        <span className="d-inline-flex align-items-center text-muted">                  
                            {moment(feed.updatedAt).fromNow()}
                        </span>
                    </OverlayTrigger>
                </Col>
            </Row>
            
            {/* Second row - only visible on medium and smaller screens */}
            <Row className="d-lg-none mt-2">
                <Col xs={6} sm={4} md={4}>
                    {getStatusBadge(feed.status)}
                </Col>
                
                <Col xs={6} sm={4} md={4} className="text-center">
                    <div className="d-flex justify-content-center">
                        <OverlayTrigger
                            placement="top"
                            overlay={
                            <Tooltip>
                                {filterCount > 0 
                                ? `${filterCount} filter${filterCount !== 1 ? 's' : ''} applied` 
                                : 'No filters applied'}
                            </Tooltip>
                            }
                        >
                            <span className="d-inline-flex align-items-center text-muted me-2">
                                <FilterX size={16} className="me-1" />
                                {filterCount}
                            </span>
                        </OverlayTrigger>
                        
                        <OverlayTrigger
                            placement="top"
                            overlay={
                            <Tooltip>
                                {inventoryCount > 0 
                                ? `${inventoryCount} item${inventoryCount !== 1 ? 's' : ''} in inventory` 
                                : 'No inventory items'}
                            </Tooltip>
                            }
                        >
                            <span className="d-inline-flex align-items-center text-muted">
                                <Database size={16} className="me-1" />
                                {inventoryCount}
                            </span>
                        </OverlayTrigger>
                    </div>
                </Col>
                
                {/* Last updated - hidden on xs screens, right-aligned on sm+ */}
                <Col xs={6} sm={4} md={4} className="text-end d-none d-sm-block">
                    <OverlayTrigger
                        placement="left"
                        overlay={
                        <Tooltip>
                            Updated: {moment(feed.updatedAt).format('MMM DD, YYYY HH:mm')}
                        </Tooltip>
                        }
                    >
                        <span className="d-inline-flex align-items-center text-muted justify-content-end">                  
                            {moment(feed.updatedAt).fromNow()}
                        </span>
                    </OverlayTrigger>
                </Col>
            </Row>
            </Card.Body>
        </Card>
        </Link>
    );
    };
    
    return (
        <StateHandler slice="advertising">
            <Pageheader title="Advertising Feeds" heading="Manage" active="Advertising" />

            <Row className="row-sm mb-4">
                {renderStatusCard("Total", stats?.total || 0, "", "bg-primary-gradient")}
                {renderStatusCard("Active", stats?.active || 0, "active", "bg-success-gradient")}                             
                {renderStatusCard("Paused", stats?.paused || 0, "paused", "bg-info-gradient")}
                {renderStatusCard("Inactive", stats?.inactive || 0, "inactive", "bg-secondary-gradient")}  
            </Row>

            <Row className="mb-4">
                <Col xs={12} md={6}>
                    <div className="mb-2">
                        {/* For mobile - stacked full-width buttons */}
                        <div className="d-block d-md-none">
                            <Link href="/manage/advertising/new">
                                <Button variant="outline-primary" className="w-100 mb-2">
                                    Create New Feed
                                </Button>
                            </Link>
                            <Link href="/manage/advertising-templates">
                                <Button variant="outline-primary" className="w-100">
                                    Design Templates
                                </Button>
                            </Link>
                        </div>
                        
                        {/* For medium and up - side-by-side buttons */}
                        <div className="d-none d-md-block">
                            <ButtonGroup>
                                <Link href="/manage/advertising/new">
                                    <Button variant="outline-primary" className="me-2">
                                        Create New Feed
                                    </Button>
                                </Link>
                                <Link href="/manage/advertising-templates">
                                    <Button variant="outline-primary">
                                        Design Templates
                                    </Button>
                                </Link>
                            </ButtonGroup>
                        </div>
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <div className="input-group mb-2">
                        <input
                            type="text"
                            className="form-control text-truncate"
                            placeholder="Search Feeds....."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="button" onClick={handleSearch}>
                            Search
                        </button>
                    </div>
                </Col>
            </Row>
           
            <Row>
               <Col xs={12}>
                    {advertising && advertising.length > 0 ? (
                        advertising.map((feed, index) => (
                            <AdvertisingCard key={index} feed={feed} index={index} />
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
                                No Feeds Found
                            </div>
                        </Alert>
                    )}
               </Col>
            </Row>

            {pagination && pagination.totalPages > 1 && (
                <Row className="mt-4">
                    <Col>
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            maxVisiblePages={5}
                            className="justify-content-center"
                        />
                    </Col>
                </Row>
            )}
        </StateHandler>
    );
};

AdvertisingList.layout = "ManageLayout";

export default AdvertisingList;