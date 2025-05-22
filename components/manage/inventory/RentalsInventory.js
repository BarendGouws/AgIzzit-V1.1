import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Row, Badge, Alert, Form, FormGroup, InputGroup, Tab, Nav, OverlayTrigger, Tooltip, Accordion, Modal, Table } from "react-bootstrap";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import Pagination from "@/components/partials/Pagination";
import StateHandler from "@/components/partials/StateHandler";
import { fetchInventoryItem, saveInventoryItem, createInventory } from "@/redux/manage/slices/inventory";
import { categories } from "@/utils/config";
import ImageGallery from '@/components/partials/ImageGallery';
import DocumentGallery from '@/components/partials/DocumentGallery';
import VideoGallery from '@/components/partials/VideoGallery';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const RentalsInventory  = ({ id, type, router }) => { 
 
  const dispatch = useDispatch();

  const { item, extras, loading } = useSelector((state) => state.inventory);
  const { organization } = useSelector((state) => state.organization);

  const [inventoryErrors, setInventoryErrors] = useState({});
  const [inventoryItem, setInventoryItem] = useState({});

  useEffect(() => {
    id !== 'new' && dispatch(fetchInventoryItem(id));    
  },[id]);

  useEffect(() => { 
    item && setInventoryItem(item); 
  }, [item]);

  //UNIVERSAL FROM CATEGORIES FILE ATTRIBUTES
  const handleInputChange = (field, value) => {
    // Get the complete category structure
    const categoryPath = categories[organization?.type]?.subcategories
      .find(cat => (cat.label || cat) === inventoryItem.subcategory);
  
    // Get attributes from current level and nested levels
    let allAttributes = [];
    
    // Add main category attributes
    if (categoryPath?.attributes) {
      allAttributes = [...allAttributes, ...categoryPath.attributes];
    }
  
    // Add subType attributes if exists
    if (inventoryItem.subType) {
      const subCategory = categoryPath?.subcategories?.find(sub => sub.label === inventoryItem.subType);
      if (subCategory?.attributes) {
        allAttributes = [...allAttributes, ...subCategory.attributes];
      }
  
      // Add specificType attributes if exists
      if (inventoryItem.specificType) {
        const specificCategory = subCategory?.subcategories?.find(spec => spec.label === inventoryItem.specificType);
        if (specificCategory?.attributes) {
          allAttributes = [...allAttributes, ...specificCategory.attributes];
        }
      }
    }
  
    // Find the attribute for this field
    const attribute = allAttributes.find(attr => attr.key === field);
    
    // Convert case if specified
    let convertedValue = value;
    if (attribute?.convert === 'uppercase') {
      convertedValue = value.toString().toUpperCase();
    } else if (attribute?.convert === 'titlecase') {
      convertedValue = value.toString()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  
    setInventoryItem(prev => ({
      ...prev,
      [field]: convertedValue
    }));
  };

  const handleDetailsSave = async () => {

    const attributes = getAttributes();
    const errors = {};
    
    // Validate required fields from attributes
    attributes.forEach(attr => {
      if (attr.required && (!inventoryItem[attr.key] || inventoryItem[attr.key].toString().trim() === '')) {
        errors[attr.key] = `${attr.label} is required`;
      }
    });

    // Validate price
    if(id === "new" && (!inventoryItem.price || inventoryItem.price <= 0)) { 
      errors.price = 'Price is required and must be greater than 0';
    }
  
    setInventoryErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      try {
        if(id === "new") {
          const result = await dispatch(createInventory(inventoryItem)).unwrap();
          if (result) router.push(`/manage/inventory/${result.item._id}`);
        } else {
          await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();         
        }
      } catch (error) {
        console.error('Error saving inventory details:', error);
      }
    }
  };

  const getAttributes = () => {

    if (!categories.Dealership) return [];
    
    const categoryPath = categories.Dealership.subcategories.find(cat => (cat.label || cat) === inventoryItem.subcategory);

    if (!categoryPath?.attributes) {
      if (inventoryItem.subType) {
        const subCategory = categoryPath?.subcategories?.find(sub => sub.label === inventoryItem.subType);
        if (!subCategory?.attributes) {
          if (inventoryItem.specificType) {
            return subCategory?.subcategories?.find(spec => spec.label === inventoryItem.specificType)?.attributes || [];
          }
          return [];
        }
        return subCategory.attributes;
      }
      return [];
    }
    
    return categoryPath.attributes;
  }; 

  const handleMarketSave = async () => {
    const errors = {};
  
    // 1. If onSpecial, ensure onSpecialName is non-empty.
    if (inventoryItem.onSpecial) {
      if (!inventoryItem.onSpecialName || !inventoryItem.onSpecialName.trim()) {
        errors.onSpecialName = 'Please provide a valid name for the special item.';
      }
    } 


    if (inventoryItem.isSold) {
      if (!inventoryItem.soldAt || !moment(inventoryItem.soldAt).isValid()) {
        errors.soldAt = 'Please provide a valid sold date.';
      }
    }

    if (
      inventoryItem.isReserved ||
      inventoryItem.saleInProgress ||
      inventoryItem.isPreApproved ||
      inventoryItem.isUnavailable ||
      inventoryItem.onSpecial
    ) {
      if (!inventoryItem.flagExpire || !moment(inventoryItem.flagExpire).isValid()) {
        errors.flagExpire = 'Please provide a valid expiry date.';
      }
    }
  
    // 3. If online offers allowed, ensure autoRejectMinOffer >= 1000
    if (inventoryItem.allowOnlineOffers) {
      if (!inventoryItem.autoRejectMinOffer || inventoryItem.autoRejectMinOffer < 1000) {
        errors.autoRejectMinOffer = 'Auto-reject minimum offer must be at least R1,000.';
      }
    }
  
    // 4. Store errors in local state
    setInventoryErrors(errors);
  
    // 5. If no errors, dispatch the save
    if (Object.keys(errors).length === 0) {
      try {
        await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();
        // Optionally, show success feedback
      } catch (error) {
        console.error('Error saving market details:', error);
      }
    } else {
      // 6. Scroll to the first invalid field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };   

  const handleMediaSave = async () => {
    try {       
      await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();              
    } catch (error) {
      console.error('Error saving media updates:', error);
    }
  };

  //STATUS AND FLAGS

  function InventoryStatus({ inventoryItem, setInventoryItem, organization }) {
    // Helper to update inventoryItem fields
    const handleInputChange = (field, value) => {
      setInventoryItem((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  
    // Handle status changes from dropdown
    const handleStatusChange = (e) => {
      const { value } = e.target;
      const now = moment().format(); // Current time in ISO
      const expiryDate = moment().utc().add(organization?.flagExpireIn || 2, 'days').format();
  
      switch (value) {
        case 'sold':
          // When sold is chosen, we immediately store soldAt and clear all other flags
          setInventoryItem((prev) => ({
            ...prev,
            isSold: true,
            soldAt: now,
            isReserved: false,
            saleInProgress: false,
            isPreApproved: false,
            isUnavailable: false,
            onSpecial: false,
            onSpecialName: '',
            flagExpire: null,
          }));
          break;
  
        case 'reserved':
          setInventoryItem((prev) => ({
            ...prev,
            isSold: false,
            soldAt: null,
            isReserved: true,
            saleInProgress: false,
            isPreApproved: false,
            isUnavailable: false,
            onSpecial: false,
            onSpecialName: '',
            flagExpire: expiryDate,
          }));
          break;
  
        case 'saleInProgress':
          setInventoryItem((prev) => ({
            ...prev,
            isSold: false,
            soldAt: null,
            isReserved: false,
            saleInProgress: true,
            isPreApproved: false,
            isUnavailable: false,
            onSpecial: false,
            onSpecialName: '',
            // If you want expiry logic for Sale in Progress:
            flagExpire: expiryDate,
          }));
          break;
  
        case 'preApproved':
          setInventoryItem((prev) => ({
            ...prev,
            isSold: false,
            soldAt: null,
            isReserved: false,
            saleInProgress: false,
            isPreApproved: true,
            isUnavailable: false,
            onSpecial: false,
            onSpecialName: '',
            flagExpire: expiryDate,
          }));
          break;
  
        case 'unavailable':
          setInventoryItem((prev) => ({
            ...prev,
            isSold: false,
            soldAt: null,
            isReserved: false,
            saleInProgress: false,
            isPreApproved: false,
            isUnavailable: true,
            onSpecial: false,
            onSpecialName: '',
            // If you want expiry logic for Unavailable:
            flagExpire: expiryDate,
          }));
          break;
  
        case 'onSpecial':
          setInventoryItem((prev) => ({
            ...prev,
            isSold: false,
            soldAt: null,
            isReserved: false,
            saleInProgress: false,
            isPreApproved: false,
            isUnavailable: false,
            onSpecial: true,
            // Initialize name to empty or keep existing if you prefer
            onSpecialName: '',
            // If you want expiry logic for On Special:
            flagExpire: expiryDate,
          }));
          break;
  
        default: // 'available'
          // Reset all flags when 'Available' is selected
          setInventoryItem((prev) => ({
            ...prev,
            isSold: false,
            soldAt: null,
            isReserved: false,
            saleInProgress: false,
            isPreApproved: false,
            isUnavailable: false,
            onSpecial: false,
            onSpecialName: '',
            flagExpire: null,
          }));
          break;
      }
    };
  
    // Derive the current status value from your inventoryItem flags
    // (You can also store a `currentStatus` field directly if you prefer.)
    const getCurrentStatus = () => {
      if (inventoryItem.isSold) return 'sold';
      if (inventoryItem.isReserved) return 'reserved';
      if (inventoryItem.saleInProgress) return 'saleInProgress';
      if (inventoryItem.isPreApproved) return 'preApproved';
      if (inventoryItem.isUnavailable) return 'unavailable';
      if (inventoryItem.onSpecial) return 'onSpecial';
      return 'available';
    };
  
    return (
      <>
        <div className="mb-4 main-content-label text-primary">Status & Flags</div>
  
        <Row className="mb-4">
          {/* Dropdown for current status */}
          <Col xs={12} sm={12} md={6}>
            <FormGroup className="form-group">
              <Form.Label>Current Status</Form.Label>
              <Form.Control
                as="select"
                value={getCurrentStatus()}
                onChange={handleStatusChange}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
                <option value="saleInProgress">Sale in Progress</option>
                <option value="preApproved">Pre-Approved</option>
                <option value="unavailable">Unavailable</option>
                <option value="onSpecial">On Special</option>
              </Form.Control>
            </FormGroup>
          </Col>
  
          {/* Sold Date field */}
            {inventoryItem.isSold && (
              <Col xs={12} sm={12} md={6}>
                <Form.Group className="form-group">
                  <Form.Label>Sold Date</Form.Label>
                  <Form.Control
                      type="datetime-local"
                      name="soldAt" 
                      value={
                        // Convert your stored date to local datetime format for the input
                        inventoryItem.soldAt
                          ? moment(inventoryItem.soldAt).format('YYYY-MM-DDTHH:mm')
                          : ''
                      }
                      onChange={(e) => {
                        // e.target.value should look like "2025-02-14T13:30"
                        const dateValue = e.target.value;
                        if (!dateValue) {
                          // If user clears the field, store null
                          handleInputChange('soldAt', null);
                        } else {
                          // Strictly parse the local datetime
                          const parsed = moment(dateValue, 'YYYY-MM-DDTHH:mm', true);
                          if (parsed.isValid()) {
                            // Store as an ISO string in state
                            handleInputChange('soldAt', parsed.toISOString());
                          } else {
                            // If invalid, store null or handle error
                            handleInputChange('soldAt', null);
                          }
                        }
                      }}
                      isInvalid={!!inventoryErrors.soldAt}
                    />
                    <Form.Control.Feedback type="invalid">
                      {inventoryErrors.soldAt}
                    </Form.Control.Feedback>

                </Form.Group>
              </Col>
            )}

            {/* Flag Expiry Date field */}
            {(inventoryItem.isReserved ||
              inventoryItem.saleInProgress ||
              inventoryItem.isPreApproved ||
              inventoryItem.isUnavailable ||
              inventoryItem.onSpecial) &&
              !inventoryItem.isSold && (
                <Col xs={12} sm={12} md={6}>
                  <Form.Group className="form-group">
                    <Form.Label>Status Expiry Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="flagExpire"
                      value={
                        inventoryItem.flagExpire
                          ? moment(inventoryItem.flagExpire).format('YYYY-MM-DDTHH:mm')
                          : ''
                      }
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (!dateValue) {
                          handleInputChange('flagExpire', null);
                        } else {
                          const parsed = moment(dateValue, 'YYYY-MM-DDTHH:mm', true);
                          if (parsed.isValid()) {
                            handleInputChange('flagExpire', parsed.toISOString());
                          } else {
                            handleInputChange('flagExpire', null);
                          }
                        }
                      }}
                      isInvalid={!!inventoryErrors.flagExpire}
                    />
                    <Form.Control.Feedback type="invalid">
                      {inventoryErrors.flagExpire}
                    </Form.Control.Feedback>

                    <small className="text-muted">
                      Default expiry is {organization?.flagExpireIn || 2} days from now
                    </small>
                  </Form.Group>
                </Col>
              )}

  
          {/* If onSpecial is true, ask for the name (capital case) */}
          {inventoryItem.onSpecial && (
            <Col xs={12} sm={12} md={6}>
              <Form.Group className="form-group">
              <Form.Label>On Special Name</Form.Label>
              <Form.Control
                type="text"
                name="onSpecialName"  // Matches errors.onSpecialName
                value={inventoryItem.onSpecialName || ''}
                onChange={(e) => {
                  const newName = e.target.value.toUpperCase();
                  handleInputChange('onSpecialName', newName);
                }}
                isInvalid={!!inventoryErrors.onSpecialName}
              />
              <Form.Control.Feedback type="invalid">
                {inventoryErrors.onSpecialName}
              </Form.Control.Feedback>
            </Form.Group>
            </Col>
          )}
        </Row>
      </>
    );
  }  
 
  //CHANGES
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;  

  const filteredChanges = useMemo(() => {
    if (!inventoryItem?.changes) return [];
    return inventoryItem.changes.filter(change => {
    const searchLower = searchTerm.toLowerCase();
    const fromToText = `${change.from} ${change.to}`.toLowerCase();
    const fieldName = change.fieldName.toLowerCase();
    return fromToText.includes(searchLower) || fieldName.includes(searchLower);
    });
  }, [inventoryItem?.changes, searchTerm]);  

  const totalPages = useMemo(() => {
    return Math.ceil(filteredChanges.length / itemsPerPage);
  }, [filteredChanges.length]);  

  const currentChanges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredChanges.slice(startIndex, endIndex);
  }, [filteredChanges, currentPage]);  

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <StateHandler slice="inventory">

      <Pageheader title={id == 'new' ? "Load New Inventory": inventoryItem.fullDescription} heading="Manage" active="Inventory" />
      
        <Row>
          <Col lg={12} md={12}>
            <Tab.Container id="left-tabs-example" defaultActiveKey={ id == "new" ? 'details' : 'market' }>

              {id !== "new" && (<>
              {/* Tabs for Large Screens */}              
              <Card className="custom-card d-none d-lg-block">               
                <Card.Footer className="py-0">
                  <div className="profile-tab tab-menu-heading border-bottom-0">
                    <Nav variant="pills" className="nav main-nav-line p-0 tabs-menu profile-nav-line border-0 br-5 mb-0">
                      <Nav.Item className="me-1">
                        <Nav.Link className="mb-2 mt-2" eventKey="details">
                          Details
                        </Nav.Link>
                      </Nav.Item>                                          
                      <Nav.Item className="me-1">
                        <Nav.Link className="mb-2 mt-2" eventKey="market">
                           Market Activity
                        </Nav.Link>
                      </Nav.Item>                     
                      <Nav.Item className="me-1">
                        <Nav.Link className="mb-2 mt-2" eventKey="media">
                          Media & Documents
                        </Nav.Link>
                      </Nav.Item>                                       
                      <Nav.Item className="me-1">
                        <Nav.Link className="mb-2 mt-2" eventKey="history">
                          History
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                </Card.Footer>
              </Card>
              {/* Accordion for Mobile & Tablet */}
              <Accordion className="d-lg-none mb-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Menu</Accordion.Header>
                  <Accordion.Body>
                    <Nav variant="pills" className="nav flex-column" >
                      <Nav.Item className="mb-1">
                        <Nav.Link eventKey="details">Details</Nav.Link>
                      </Nav.Item>                    
                      <Nav.Item className="mb-1">
                        <Nav.Link eventKey="market">Market Activity</Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="mb-1">
                        <Nav.Link eventKey="media">Media & Documents</Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="mb-1">
                        <Nav.Link eventKey="history">History</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              </>)}

              <span className=" py-0 ">
                <div className="profile-tab tab-menu-heading border-bottom-0 ">
                  <Row className=" row-sm ">
                    <Col lg={12} md={12}>
                      <div className="custom-card main-content-body-profile">
                        <Tab.Content className="">

                          <Tab.Pane eventKey="details" className="main-content-body  p-0 border-0">
                            <Card>
                              <Card.Body className=" border-0">

                                    <div className="mb-4 main-content-label text-primary">
                                      Details
                                    </div>

                                    <Row className="gy-3">  
                                      
                                       <h1>TODO RENTALS</h1>

                                    </Row>

                                    <FormGroup className="form-group mt-4">
                                      <Row className="row-sm justify-content-end">
                                        <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                          <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDetailsSave}>
                                            {id == "new" ? "Create" : "Save"}
                                          </Button>
                                        </Col>
                                      </Row>
                                    </FormGroup>

                              </Card.Body>
                            </Card>
                          </Tab.Pane>

                          <Tab.Pane eventKey="market" className="main-content-body p-0 border-0">
                            <Card>
                              <Card.Body>

                              <div className="mb-4 main-content-label text-primary">Statistics</div>

                                {/* Overview Statistics */}
                                <Row className="mb-4">
                                  <Col xl={3} lg={6} sm={12}>
                                    <Card className="card-img-holder">
                                      <Card.Body className="list-icons">
                                        <div className="clearfix">
                                          <div className="float-end mt-2">
                                            <span className="text-primary">
                                              <i className="si si-eye fs-30"></i>
                                            </span>
                                          </div>
                                          <div className="float-start">
                                            <p className="card-text text-muted mb-1">Total Views</p>
                                            <h3>{inventoryItem.views || 0}</h3>
                                          </div>
                                        </div>
                                        <Card.Footer className="p-0">
                                          <p className="text-muted mb-0 pt-4">
                                            <i className="si si-chart text-primary mx-2"></i>
                                            View History Available
                                          </p>
                                        </Card.Footer>
                                      </Card.Body>
                                    </Card>
                                  </Col>

                                  <Col xl={3} lg={6} sm={12}>
                                    <Card className="card-img-holder">
                                      <Card.Body className="list-icons">
                                        <div className="clearfix">
                                          <div className="float-end mt-2">
                                            <span className="text-primary">
                                              <i className="si si-bubbles fs-30"></i>
                                            </span>
                                          </div>
                                          <div className="float-start">
                                            <p className="card-text text-muted mb-1">WhatsApp Chats</p>
                                            <h3>{inventoryItem.watsappsStarted || 0}</h3>
                                          </div>
                                        </div>
                                        <Card.Footer className="p-0">
                                          <p className="text-muted mb-0 pt-4">
                                            <i className="si si-phone text-success mx-2"></i>
                                            Call Events: {inventoryItem.callEvents || 0}
                                          </p>
                                        </Card.Footer>
                                      </Card.Body>
                                    </Card>
                                  </Col>

                                  <Col xl={3} lg={6} sm={12}>
                                    <Card className="card-img-holder">
                                      <Card.Body className="list-icons">
                                        <div className="clearfix">
                                          <div className="float-end mt-2">
                                            <span className="text-primary">
                                              <i className="si si-heart fs-30"></i>
                                            </span>
                                          </div>
                                          <div className="float-start">
                                            <p className="card-text text-muted mb-1">Favorites</p>
                                            <h3>{inventoryItem.addedToFavourites || 0}</h3>
                                          </div>
                                        </div>
                                        <Card.Footer className="p-0">
                                          <p className="text-muted mb-0 pt-4">
                                            <i className="si si-basket text-warning mx-2"></i>
                                            Cart Adds: {inventoryItem.addedToCart || 0}
                                          </p>
                                        </Card.Footer>
                                      </Card.Body>
                                    </Card>
                                  </Col>

                                  <Col xl={3} lg={6} sm={12}>
                                    <Card className="card-img-holder">
                                      <Card.Body className="list-icons">
                                        <div className="clearfix">
                                          <div className="float-end mt-2">
                                            <span className="text-primary">
                                              <i className="si si-chart fs-30"></i>
                                            </span>
                                          </div>
                                          <div className="float-start">
                                            <p className="card-text text-muted mb-1">Engagement Rate</p>
                                            <h3>{((inventoryItem.engagements || 0) / (inventoryItem.views || 1) * 100).toFixed(1)}%</h3>
                                          </div>
                                        </div>
                                        <Card.Footer className="p-0">
                                          <p className="text-muted mb-0 pt-4">
                                            <i className="si si-ghost text-info mx-2"></i>
                                            Total Engagements: {inventoryItem.engagements || 0}
                                          </p>
                                        </Card.Footer>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                </Row>   
                              
                                <InventoryStatus inventoryItem={inventoryItem} setInventoryItem={setInventoryItem} organization={organization} />
                              
                                {organization?.allowOnlineOffers && <>

                                <div className="mt-4 mb-3 main-content-label text-primary">Online Offers</div>

                                <FormGroup className="form-group">
                                  <Form.Check
                                    type="switch"
                                    id="allowOnlineOffers"
                                    label="Allow Online Offers"
                                    checked={inventoryItem.allowOnlineOffers || false}
                                    onChange={(e) => handleInputChange('allowOnlineOffers', e.target.checked)}
                                  />
                                </FormGroup>

                                {inventoryItem.allowOnlineOffers && (                            
                                  <Col xs={12} sm={12} md={6}>
                                    <FormGroup className="form-group">
                                      <Form.Label>Auto-Reject Minimum Offer</Form.Label>
                                      <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter minimum offer to auto-reject"
                                        value={inventoryItem.autoRejectMinOffer || ''}
                                        isInvalid={!!inventoryErrors.autoRejectMinOffer}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/[^\d]/g, '');
                                          handleInputChange('autoRejectMinOffer', value ? parseInt(value) : '');
                                        }}
                                        disabled={!inventoryItem.price || inventoryItem.price <= 0}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                      {inventoryErrors.autoRejectMinOffer}
                                    </Form.Control.Feedback>
                                      {!inventoryItem.price || inventoryItem.price <= 0 ? (
                                        <small className="text-danger d-block mt-1">
                                          A selling price must be set before enabling auto-reject for offers.
                                        </small>
                                      ) : (
                                        <small className="text-muted d-block mt-1">
                                          Offers below this amount will be automatically rejected. <br />
                                          Selling Price: <strong>R {inventoryItem.price.toLocaleString()}</strong>
                                        </small>
                                      )}
                                    </FormGroup>
                                  </Col>
                                )}
                                </>}

                                <div className="mb-4 main-content-label text-primary">Activity</div>
                                  {/* Detailed Statistics */}
                                <Row>
                                  <Col md={6} className="mb-3">
                                    <Card className="border h-100">
                                      <Card.Body>
                                        <h6 className="mb-3">Sales Rep Performance</h6>
                                        {inventoryItem.repDisplayHistory?.length > 0 ? (
                                          <div className="table-responsive">
                                            <table className="table table-sm">
                                              <thead>
                                                <tr>
                                                  <th>Rep Name</th>
                                                  <th className="text-end">Displays</th>
                                                  <th className="text-end">Conversations</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {inventoryItem.repDisplayHistory.map((rep, index) => (
                                                  <tr key={index}>
                                                    <td>{rep.rep?.fullNames || 'Unknown'}</td>
                                                    <td className="text-end">{rep.count}</td>
                                                    <td className="text-end">{rep.conversationsStarted}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div className="text-muted">No rep activity recorded</div>
                                        )}
                                      </Card.Body>
                                    </Card>
                                  </Col>

                                  <Col md={6} className="mb-3">
                                    <Card className="border h-100">
                                      <Card.Body>
                                        <h6 className="mb-3">Sharing Activity</h6>
                                        {inventoryItem.shareHistory?.length > 0 ? (
                                          <div className="table-responsive">
                                            <table className="table table-sm">
                                              <thead>
                                                <tr>
                                                  <th>Date</th>
                                                  <th>Method</th>
                                                  <th>User</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {inventoryItem.shareHistory.map((share, index) => (
                                                  <tr key={index}>
                                                    <td>{moment(share.timestamp).format('DD MMM YYYY')}</td>
                                                    <td className="text-capitalize">{share.shareMethod}</td>
                                                    <td>{share.user?.fullNames || 'Anonymous'}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div className="text-muted">No sharing activity recorded</div>
                                        )}
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                </Row>

                                <FormGroup className="form-group mt-4">
                                  <Row className="row-sm justify-content-end">
                                    <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                      <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleMarketSave}>
                                        {id == "new" ? "Create" : "Save"}
                                      </Button>
                                    </Col>
                                  </Row>
                                </FormGroup>         

                              </Card.Body>
                            </Card>
                          </Tab.Pane>                   

                          <Tab.Pane eventKey="media" className="main-content-body p-0 border-0">
                          <Card>
                            <Card.Body>                              

                            <div className="mb-4">
                              <ImageGallery 
                                inventoryItem={inventoryItem}
                                handleInputChange={handleInputChange}
                              />
                            </div>

                            <div className="mb-4">                                
                              <DocumentGallery 
                                inventoryItem={inventoryItem}
                                handleInputChange={handleInputChange}
                                organization={organization}
                              />
                            </div> 

                            <div className="mb-4">
                              <VideoGallery 
                                inventoryItem={inventoryItem} 
                                handleInputChange={handleInputChange}
                              />
                            </div> 
                            
                            <FormGroup className="form-group mt-4">
                               <Row className="row-sm justify-content-end">
                                  <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                    <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleMediaSave}>
                                      Save
                                    </Button>
                                  </Col>
                                </Row>
                            </FormGroup>                                                    

                            </Card.Body>
                          </Card>
                          </Tab.Pane>                                

                          <Tab.Pane eventKey="history" className="main-content-body  p-0 border-0">
                            <Card>
                              <Card.Body>
                                <div className="mb-4 main-content-label text-primary">History</div>
                                {inventoryItem?.changes?.length === 0 ? (
                                    <Card>	
                                      <Card.Body className="border border-primary text-center rounded">
                                         <div>
                                          <i className="bi bi-check-circle mg-b-20 fs-50 text-primary lh-1"></i>
                                          <h3 className="mt-3 text-primary">No history as yet!</h3>
                                          <p className="mt-3 mb-0">Your change history will show here</p>
                                         </div>
                                      </Card.Body>
                                    </Card>
                                    ) : (<>
                                          <div className="d-flex justify-content-between align-items-center mb-3 ms-2">
                                            <div className="main-content-label">Change History</div>
                                            <div className="col-md-4">
                                            <InputGroup>
                                            <Form.Control
                                             type="text"
                                             placeholder="Search changes..."
                                             value={searchTerm}
                                             onChange={handleSearchChange}
                                             />
                                             {searchTerm && (
                                               <InputGroup.Text className="cursor-pointer" onClick={() => setSearchTerm('')}>×</InputGroup.Text>)}
                                               </InputGroup>
                                            </div>
                                          </div>
                                                          
                                          {currentChanges?.map((change, index) => (														
                                          <Card key={index} className="mb-3">
                                           <Card.Body className="border-0">
                                           <h5 className="fw-semibold text-primary">{`Field: ${change.fieldName}`}</h5>
                                            <p className="fs-6 font-weight-semibold text-dark mb-1">{`Timestamp: ${moment(change.timestamp).utcOffset('+0200').format('DD MMM YYYY HH:mm')}`}</p>
                                            <p className="fs-6 font-weight-semibold text-dark mb-2">{`Changed by: ${change.changedBy?.fullNames}`}</p>
                                            <p className="fs-6 font-weight-semibold text-dark mb-1">{`From: ${change.from}`}</p>														
                                            <p className="fs-6 font-weight-semibold text-dark mb-1">{`To: ${change.to}`}</p>
                                            </Card.Body>
                                           </Card>))}
                                
                                           {totalPages > 1 && (
                                              <div className="d-flex justify-content-center my-4">
                                              <Pagination
                                              currentPage={currentPage}
                                              totalPages={totalPages}
                                              onPageChange={handlePageChange}
                                              maxVisiblePages={5}
                                              className="mb-0"
                                              />
                                              </div>)}
                                        </>)}                          
                              </Card.Body>
                            </Card>
                          </Tab.Pane>                                                   

                        </Tab.Content>
                      </div>
                    </Col>
                  </Row>
                </div>
              </span>
            </Tab.Container>
          </Col>
        </Row>    

    </StateHandler>
  );
};

RentalsInventory.layout = "ManageLayout";

export default RentalsInventory ;
