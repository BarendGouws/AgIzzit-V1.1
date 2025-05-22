import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Row, Badge, Alert, Form, FormGroup, InputGroup, Tab, Nav, OverlayTrigger, Tooltip, Accordion } from "react-bootstrap";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { fetchInventoryItem, saveInventoryItem, createInventory } from "@/redux/manage/slices/inventory";
import colors from "@/components/backup/colors";
import categories from "@/components/backup/categories";
import ImageGallery from '@/components/partials/ImageGallery';
import DocumentGallery from '@/components/partials/DocumentGallery';

const InventoryItem = ({}) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const { id } = router.query;

  const { item, extras } = useSelector((state) => state.inventory);
  const { organization } = useSelector((state) => state.organization);

  const [inventoryErrors, setInventoryErrors] = useState({});
  const [inventoryItem, setInventoryItem] = useState({});

  // State for dependent dropdown options
  const [mmcodeMakes, setMmcodeMakes] = useState([]);
  const [mmcodeModels, setMmcodeModels] = useState([]);
  const [mmcodeVariants, setMmcodeVariants] = useState([]);

  console.log(categories)

  useEffect(() => {
    id && dispatch(fetchInventoryItem(id));    
  },[id]);

  useEffect(() => {    
    if (item) {
      setInventoryItem(item);
      item.category == 'Dealership' && loadDropdownOptions(item);
    }
  }, [item]);

  const handleInputChange = (field, value) => {
    setInventoryItem(prev => ({
      ...prev,
      [field]: value
    }));
  };
 
  //DEALERSHIP
  const loadDropdownOptions = async (item) => {
    if (item?.subcategory === "Cars & Bakkies" && item?.year) {
      try {
        // Load makes
        const makesRes = await fetch(`/api/mmcode?year=${item.year}`);
        if (makesRes.status === 200) {
          const makesData = await makesRes.json();
          setMmcodeMakes(makesData);
  
          // If make exists, load models
          if (item.make) {
            const modelsRes = await fetch(
              `/api/mmcode?year=${item.year}&make=${item.make}`
            );
            if (modelsRes.status === 200) {
              const modelsData = await modelsRes.json();
              setMmcodeModels(modelsData);
  
              // If model exists, load variants
              if (item.model) {
                const variantsRes = await fetch(
                  `/api/mmcode?year=${item.year}&make=${item.make}&model=${item.model}`
                );
                if (variantsRes.status === 200) {
                  const variantsData = await variantsRes.json();
                  setMmcodeVariants(variantsData);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading dropdown options:", error);
      }
    }
  };

  const handleYear = async (selectedYear) => {

    setInventoryItem((prev) => ({
      ...prev,      
      year: selectedYear,
      make: "",
      model: "",
      variant: "",
      mmCode: "",
      fuelType: "",
      transmission: "",      
      fullDescription: selectedYear
    }));
  
    setMmcodeMakes([]);
    setMmcodeModels([]);
    setMmcodeVariants([]);
  
    if (selectedYear && inventoryItem.subcategory === "Cars & Bakkies") {
      try {
        const res = await fetch(`/api/mmcode?year=${selectedYear}`);
        if (res.status === 200) {
          const data = await res.json();
          setMmcodeMakes(data);
        }
      } catch (error) {
        console.error("Error fetching makes:", error);
      }
    }
  };

  const handleMake = async (selectedMake) => {
    setInventoryItem((prev) => ({
      ...prev,    
      make: selectedMake,
      model: "",
      variant: "",
      mmCode: "",
      fuelType: "",
      transmission: "",      
      fullDescription: `${prev.year} ${selectedMake}`
    }));

    setMmcodeModels([]);
    setMmcodeVariants([]);

    if (selectedMake && inventoryItem.subcategory === "Cars & Bakkies") {
      try {
        const res = await fetch(
          `/api/mmcode?year=${inventoryItem.year}&make=${selectedMake}`
        );
        if (res.status === 200) {
          const data = await res.json();
          setMmcodeModels(data);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    }
  };

  const handleModel = async (selectedModel) => {
    setInventoryItem((prev) => ({
      ...prev,     
      model: selectedModel,
      variant: "",
      mmCode: "",
      fuelType: "",
      transmission: "",      
      fullDescription: `${prev.year} ${prev.make} ${selectedModel}`
    }));
  
    setMmcodeVariants([]);
  
    if (selectedModel && inventoryItem.subcategory === "Cars & Bakkies") {
      try {
        const res = await fetch(
          `/api/mmcode?year=${inventoryItem.year}&make=${inventoryItem.make}&model=${selectedModel}`
        );
        if (res.status === 200) {
          const data = await res.json();
          setMmcodeVariants(data);
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
      }
    }
  };

  const handleVariant = (variantId) => {
    if (variantId && inventoryItem.subcategory === "Cars & Bakkies") {
      const selectedVariant = mmcodeVariants.find((item) => item._id === variantId);
      if (selectedVariant) {
        setInventoryItem((prev) => ({
          ...prev,          
          variant: selectedVariant.varient,
          mmCode: selectedVariant.mmCode,
          fuelType: selectedVariant.fuelType || "",
          transmission: selectedVariant.transmission || "",        
          fullDescription: `${prev.year} ${prev.make} ${prev.model} ${selectedVariant.varient}`
        }));
      }
    }
  };    

  const handleDealershipDetailsSave2 = async () => {

    const errors = {};
      
    // Required fields validation for basic details
    const requiredFields = [
      'subcategory',
      'year',
      'make',
      'model',
      'variant',
      'colour'
    ];
  
    if (inventoryItem.subcategory !== 'Leisure') {
      requiredFields.push('fuelType', 'transmission');
    }
  
    requiredFields.forEach(field => {
      if (!inventoryItem[field] || inventoryItem[field].toString().trim() === '') {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });
  
    // VIN number validation
    if (!inventoryItem.vinNr?.trim()) {
      errors.vinNr = 'VIN number is required';
    } else {
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (!vinRegex.test(inventoryItem.vinNr)) {
        errors.vinNr = 'Invalid VIN number format (must be 17 characters)';
      }
    }
  
    // Engine number validation
    if (!inventoryItem.engineNr?.trim()) {
      errors.engineNr = 'Engine number is required';
    } else if (inventoryItem.engineNr.length < 6) {
      errors.engineNr = 'Engine number must be at least 6 characters';
    }
  
    // Registration number validation
    if (!inventoryItem.regNr?.trim()) {
      errors.regNr = 'Registration number is required';
    }
  
    // Mileage validation for non-leisure vehicles
    if (inventoryItem.subcategory !== 'Leisure') {
      if (!inventoryItem.mileage || inventoryItem.mileage.toString().trim() === '') {
        errors.mileage = 'Mileage is required';
      } else if (isNaN(inventoryItem.mileage) || parseInt(inventoryItem.mileage) < 0) {
        errors.mileage = 'Mileage must be a valid positive number';
      }
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
    } else {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleDealershipConditionSave = async () => {

    const errors = {};
  
    // Validate extras
    if (inventoryItem.extras?.length > 0) {
      const extraErrors = inventoryItem.extras.map(extra => 
        !extra.trim() ? 'Extra cannot be empty' : null
      );
      if (extraErrors.some(error => error !== null)) {
        errors.extras = extraErrors;
      }
    }
  
    // Validate manufacturer warranty
    if (inventoryItem.manufacturerWarrantyActive && !inventoryItem.manufacturerWarrantyDes?.trim()) {
      errors.manufacturerWarrantyDes = 'Warranty description is required when warranty is active';
    }
  
    // Validate service plan
    if (inventoryItem.manufacturerServicePlanActive && !inventoryItem.manufacturerServicePlanDes?.trim()) {
      errors.manufacturerServicePlanDes = 'Service plan description is required when service plan is active';
    }
  
    // Validate maintenance plan
    if (inventoryItem.manufacturerMaintananceActive && !inventoryItem.manufacturerMaintananceDes?.trim()) {
      errors.manufacturerMaintananceDes = 'Maintenance plan description is required when maintenance plan is active';
    }
  
    // Validate service history selection when book is present
    if (inventoryItem.serviceHistoryBook && (!inventoryItem.serviceHistory || !inventoryItem.serviceHistory.trim())) {
      errors.serviceHistory = 'Service history type is required when service history book is present';
    }
  
    // Update error state
    setInventoryErrors(errors);

    // If there are no errors, proceed with save
    if (Object.keys(errors).length === 0) {
      try {       
          await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();              
      } catch (error) {
        console.error('Error saving inventory condition:', error);
      }
    } else {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  //NEW CODE

  const handleDealershipDetailsSave = async () => {
    const attributes = getAttributes();
    const errors = {};
    
    // Validate required fields from attributes
    attributes.forEach(attr => {
      if (attr.required && (!inventoryItem[attr.key] || inventoryItem[attr.key].toString().trim() === '')) {
        errors[attr.key] = `${attr.label} is required`;
      }
    });
  
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
    if (!organization?.type || !categories[organization.type]) return [];
    
    const categoryPath = categories[organization.type].subcategories
      .find(cat => (cat.label || cat) === inventoryItem.subcategory);

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

  const renderAttributeField = (attribute) => {
    const { key, type, label, placeholder, disabled, options, optionsSource } = attribute;
    
    const commonProps = {
      className: "form-control",
      placeholder,
      value: inventoryItem[key] || '',
      onChange: (e) => handleInputChange(key, e.target.value),
      isInvalid: inventoryErrors?.[key],
      disabled: disabled || !inventoryItem.subcategory
    };

    if (type === 'select') {
      const dynamicOptions = {
        mmcodeMakes,
        mmcodeModels,
        mmcodeVariants,
        colors
      };
      
      const selectOptions = optionsSource ? dynamicOptions[optionsSource] || [] : options || [];
      
      return (
        <Form.Select {...commonProps}>
          <option value="">{placeholder}</option>
          {selectOptions.map((opt, idx) => (
            <option key={idx} value={typeof opt === 'object' ? opt._id : opt}>
              {typeof opt === 'object' ? opt.label || opt.varient : opt}
            </option>
          ))}
        </Form.Select>
      );
    }

    return <Form.Control type={type} {...commonProps} />;
  };

  const handleCategoryChange = (e) => {
    const newValue = e.target.value;
    setInventoryItem({}); // Reset all state
    setMmcodeMakes([]);
    setMmcodeModels([]);
    setMmcodeVariants([]);
    handleInputChange('subcategory', newValue);
  };

  // Handle subcategory change and reset dependent fields
  const handleSubTypeChange = (e) => {
    const newValue = e.target.value;
    setInventoryItem(prev => ({
      subcategory: prev.subcategory,
      subType: newValue
    }));
  };

  // Handle specific type change
  const handleSpecificTypeChange = (e) => {
    const newValue = e.target.value;
    setInventoryItem(prev => ({
      subcategory: prev.subcategory,
      subType: prev.subType,
      specificType: newValue
    }));
  };

  //CHANGES
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 25;  

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

  console.log(categories)

  return (
    <StateHandler slice="inventory">

      <Pageheader title="Inventory" heading="Manage" active="Inventory" />

      {organization?.type === "Dealership" ? (
        <Row>
          <Col lg={12} md={12}>
            <Tab.Container id="left-tabs-example" defaultActiveKey='details'>

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
                        <Nav.Link className="mb-2 mt-2" eventKey="condition">
                          Condition
                        </Nav.Link>
                      </Nav.Item>                      
                      <Nav.Item className="me-1">
                        <Nav.Link className="mb-2 mt-2" eventKey="costing">
                          Contract & Costing
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
                        <Nav.Link eventKey="condition">Condition</Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="mb-1">
                        <Nav.Link eventKey="costing">Contract & Costing</Nav.Link>
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
                                      {/* First subcategory dropdown */}                            
                                      <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Subcategory</Form.Label>
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.subcategory || ""}
                                            onChange={(e) => {
                                              // Reset all dependent fields when subcategory changes
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                subcategory: e.target.value,
                                                subType: "",           // Reset second level
                                                specificType: "",      // Reset third level
                                                year: "",  
                                                make: "",
                                                model: "",
                                                variant: "",
                                                mmCode: "",
                                                fuelType: "",
                                                transmission: "",    
                                                fullDescription: ""  
                                              }));
                                              setMmcodeMakes([]);
                                              setMmcodeModels([]);
                                              setMmcodeVariants([]);
                                            }}
                                            isInvalid={inventoryErrors?.subcategory}
                                          >
                                            <option value="">Select Subcategory</option>
                                            {(organization?.categories?.length > 0 
                                              ? organization.categories 
                                              : categories.Dealership.subcategories.map(cat => cat.label || cat))
                                              .map((subcat) => (
                                                <option key={subcat} value={subcat}>{subcat}</option>
                                            ))}
                                          </Form.Select>
                                          {inventoryErrors?.subcategory && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.subcategory}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      </Col>

                                      {/* Second level dropdown - only show for Leisure or Commercial */}
                                      {inventoryItem.subcategory && categories.Dealership.subcategories
                                      .find(cat => (cat.label || cat) === inventoryItem.subcategory)?.subcategories && (
                                        <Col xs={12} sm={12} md={6}>
                                          <FormGroup className="form-group">
                                          <Form.Label>
                                            {inventoryItem.subcategory === 'Commercial' ? 'Commercial Type' : 
                                            inventoryItem.subcategory === 'Leisure' ? `${inventoryItem.subcategory} Type` : `${inventoryItem.subcategory} Type`}
                                          </Form.Label>
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.subType || ""}
                                            onChange={(e) => {
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                subType: e.target.value,
                                                specificType: ""      // Reset third level when second level changes
                                              }));
                                            }}
                                          >
                                        <option value="">{`Select ${
                                          inventoryItem.subcategory === 'Commercial' ? 'Commercial' :
                                          inventoryItem.subcategory === 'Leisure' ? inventoryItem.subcategory :
                                          inventoryItem.subcategory
                                        } Type`}</option>
                                        {categories.Dealership.subcategories
                                          .find(cat => cat.label === inventoryItem.subcategory)
                                          ?.subcategories
                                          ?.map(subcat => (
                                            <option key={subcat.label} value={subcat.label}>
                                              {subcat.label}
                                            </option>
                                          ))}
                                      </Form.Select>
                                    </FormGroup>
                                       </Col>
                                       )}

                                  {/* Third level dropdown - only show when applicable */}
                                    {inventoryItem.subType && categories.Dealership.subcategories
                                      .find(cat => cat.label === inventoryItem.subcategory)
                                      ?.subcategories
                                      ?.find(subcat => subcat.label === inventoryItem.subType)
                                      ?.subcategories && (
                                    <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>
                                            {inventoryItem.subcategory === 'Commercial' ? `${inventoryItem.subType} Body` : 
                                            `${inventoryItem.subType} Type`}
                                          </Form.Label>
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.specificType || ""}
                                            onChange={(e) => {
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                specificType: e.target.value
                                              }));
                                            }}
                                        >
                                        <option value="">{`Select ${inventoryItem.subType} ${
                                          inventoryItem.subcategory === 'Commercial' ? 'Body' : 'Type'
                                        }`}</option>
                                        {categories.Dealership.subcategories
                                          .find(cat => cat.label === inventoryItem.subcategory)
                                          ?.subcategories
                                          ?.find(subcat => subcat.label === inventoryItem.subType)
                                          ?.subcategories
                                          ?.map(subcat => (
                                            <option key={subcat.label} value={subcat.label}>
                                              {subcat.label}
                                            </option>
                                          ))}
                                      </Form.Select>
                                    </FormGroup>
                                  </Col>
                                )}               


                                      {getAttributes().map((attribute, index) => (
                                      <Col xs={12} sm={12} md={6} key={index}>
                                        <FormGroup className="form-group">
                                          <Form.Label>{attribute.label}</Form.Label>
                                          {renderAttributeField(attribute)}
                                          {inventoryErrors?.[attribute.key] && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors[attribute.key]}
                                            </Form.Control.Feedback>
                                          )}
                                          {attribute.mutedText && (
                                            <small className="mt-1 d-block text-muted">
                                              <i className="fi fi-rs-info me-1"></i>
                                              {attribute.mutedText}
                                            </small>
                                          )}
                                        </FormGroup>
                                      </Col>
                                    ))}

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Year</Form.Label>
                                        <Form.Select
                                          className="form-control"
                                          value={inventoryItem.year || ""}
                                          onChange={(e) => handleYear(e.target.value)}
                                          isInvalid={inventoryErrors?.year}
                                          disabled={!inventoryItem.subcategory}
                                        >
                                          <option value="">Select Year</option>
                                          {Array.from({ length: 54 }, (_, i) => 2024 - i)?.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                          ))}
                                        </Form.Select>
                                        {inventoryErrors?.year && (
                                          <Form.Control.Feedback type="invalid">
                                            {inventoryErrors.year}
                                          </Form.Control.Feedback>
                                        )}
                                      </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Make</Form.Label>
                                        {inventoryItem.subcategory === 'Cars & Bakkies' ? (
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.make || ""}
                                            onChange={(e) => handleMake(e.target.value)}
                                            isInvalid={inventoryErrors?.make}
                                            disabled={!mmcodeMakes.length}
                                          >
                                            <option value="">Select Make</option>
                                            {mmcodeMakes?.map((make, index) => (
                                              <option key={index} value={make}>{make}</option>
                                            ))}
                                          </Form.Select>
                                        ) : (
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter make"
                                            value={inventoryItem.make || ""}
                                            onChange={(e) => handleInputChange('make', e.target.value)}
                                            isInvalid={inventoryErrors?.make}
                                            disabled={!inventoryItem.subcategory}
                                          />
                                        )}
                                        {inventoryErrors?.make && (
                                          <Form.Control.Feedback type="invalid">
                                            {inventoryErrors.make}
                                          </Form.Control.Feedback>
                                        )}
                                      </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Model</Form.Label>
                                        {inventoryItem.subcategory === 'Cars & Bakkies' ? (
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.model || ""}
                                            onChange={(e) => handleModel(e.target.value)}
                                            isInvalid={inventoryErrors?.model}
                                            disabled={!mmcodeModels.length}
                                          >
                                            <option value="">Select Model</option>
                                            {mmcodeModels?.map((model, index) => (
                                              <option key={index} value={model}>{model}</option>
                                            ))}
                                          </Form.Select>
                                        ) : (
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter model"
                                            value={inventoryItem.model || ""}
                                            onChange={(e) => handleInputChange('model', e.target.value)}
                                            isInvalid={inventoryErrors?.model}
                                            disabled={!inventoryItem.subcategory}
                                          />
                                        )}
                                        {inventoryErrors?.model && (
                                          <Form.Control.Feedback type="invalid">
                                            {inventoryErrors.model}
                                          </Form.Control.Feedback>
                                        )}
                                      </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Variant</Form.Label>
                                        {inventoryItem.subcategory === 'Cars & Bakkies' ? (
                                          <Form.Select
                                            className="form-control"
                                            value={mmcodeVariants.find(v => v.varient === inventoryItem.variant)?._id || ''}
                                            onChange={(e) => handleVariant(e.target.value)}
                                            isInvalid={inventoryErrors?.variant}
                                            disabled={!mmcodeVariants.length}
                                          >
                                            <option value="">Select Variant</option>
                                            {mmcodeVariants?.map((variant) => (
                                              <option key={variant._id} value={variant._id}>
                                                {variant.varient}
                                              </option>
                                            ))}
                                          </Form.Select>
                                        ) : (
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter variant"
                                            value={inventoryItem.variant || ''}
                                            onChange={(e) => handleInputChange('variant', e.target.value)}
                                            isInvalid={inventoryErrors?.variant}
                                            disabled={!inventoryItem.subcategory}
                                          />
                                        )}
                                        {inventoryErrors?.variant && (
                                          <Form.Control.Feedback type="invalid">
                                            {inventoryErrors.variant}
                                          </Form.Control.Feedback>
                                        )}
                                      </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>MMCode</Form.Label>                    
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="Not available"
                                            value={inventoryItem.mmCode ? inventoryItem.mmCode : 'Not available'}
                                            disabled
                                          />
                                      </FormGroup>
                                    </Col>

                                    {inventoryItem.subcategory !== 'Leisure' && (
                                    <> 
                                      <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Fuel Type</Form.Label>
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.fuelType || ''}
                                            onChange={(e) => handleInputChange('fuelType', e.target.value)}
                                            isInvalid={inventoryErrors?.fuelType}
                                            disabled={!inventoryItem.subcategory || (inventoryItem.subcategory === 'Cars & Bakkies' && !!inventoryItem.fuelType)}
                                          >
                                            <option value="">Select Fuel Type</option>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="Electric">Electric</option>
                                          </Form.Select>
                                          {inventoryErrors?.fuelType && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.fuelType}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      </Col>

                                      <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Transmission</Form.Label>
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.transmission || ''}
                                            onChange={(e) => handleInputChange('transmission', e.target.value)}
                                            isInvalid={inventoryErrors?.transmission}
                                            disabled={!inventoryItem.subcategory || (inventoryItem.subcategory === 'Cars & Bakkies' && !!inventoryItem.transmission)}
                                          >
                                            <option value="">Select Transmission</option>
                                            <option value="Auto">Auto</option>
                                            <option value="Manual">Manual</option>                    
                                          </Form.Select>
                                          {inventoryErrors?.transmission && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.transmission}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      </Col>

                                      <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Mileage</Form.Label>
                                          <Form.Control
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter mileage"
                                            onChange={(e) => handleInputChange('mileage', e.target.value)}
                                            value={inventoryItem.mileage || ''}
                                            isInvalid={inventoryErrors?.mileage}
                                            disabled={!inventoryItem.subcategory}
                                          />
                                          {inventoryErrors?.mileage && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.mileage}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      </Col>
                                    </>
                                    )}

                                    <Col xs={12} sm={12} md={6}>
                                    <FormGroup className="form-group">
                                      <Form.Label>Colour</Form.Label>
                                      <Form.Select
                                        className="form-control"
                                        value={inventoryItem.colour || ''}
                                        onChange={(e) => handleInputChange('colour', e.target.value)}
                                        isInvalid={inventoryErrors?.colour}
                                        disabled={!inventoryItem.subcategory}
                                      >
                                        <option value="">Select Colour</option>
                                        {colors?.map((color) => (
                                          <option key={color} value={color}>{color}</option>
                                        ))}
                                      </Form.Select>
                                      {inventoryErrors?.colour && (
                                        <Form.Control.Feedback type="invalid">
                                          {inventoryErrors.colour}
                                        </Form.Control.Feedback>

                                      )}
                                    </FormGroup>
                                    </Col>              

                                    <Col xs={12} sm={12} md={6}>
                                    <FormGroup className="form-group">
                                      <Form.Label>VIN Nr</Form.Label>
                                      <InputGroup className="mb-1 has-validation"> {/* Added has-validation class */}
                                        <Form.Control
                                          type="text"
                                          className="form-control"
                                          placeholder="Enter VIN Number"
                                          onChange={(e) => handleInputChange('vinNr', e.target.value.toString().toUpperCase())}
                                          value={inventoryItem.vinNr || ''}
                                          disabled={!inventoryItem.subcategory}
                                          isInvalid={!!inventoryErrors?.vinNr} // Added isInvalid prop
                                          name="vinNr" // Added name for scroll functionality
                                        />
                                        <Button variant='primary' className="" type="button">Scan</Button>
                                        <Form.Control.Feedback type="invalid">
                                          {inventoryErrors?.vinNr}
                                        </Form.Control.Feedback>
                                      </InputGroup>
                                      <small className="mt-1 d-block text-muted">
                                        <i className="fi fi-rs-info me-1"></i>
                                        The VIN number is not publicly displayed and is only used for invoicing and documentation purposes.
                                      </small>
                                    </FormGroup>
                                    </Col>              

                                    <Col xs={12} sm={12} md={6}>
                                    <FormGroup className="form-group">
                                      <Form.Label>Engine Nr</Form.Label>
                                      <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Engine Number"
                                        onChange={(e) => handleInputChange('engineNr', e.target.value.toString().toUpperCase())}
                                        value={inventoryItem.engineNr || ''}
                                        disabled={!inventoryItem.subcategory}
                                        isInvalid={!!inventoryErrors?.engineNr}
                                        name="engineNr"
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {inventoryErrors?.engineNr}
                                      </Form.Control.Feedback>
                                      <small className="mt-1 d-block text-muted">
                                        <i className="fi fi-rs-info me-1"></i>
                                        The Engine number is not publicly displayed and is only used for invoicing and documentation purposes.
                                      </small>
                                    </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Reg Nr</Form.Label>
                                        <Form.Control
                                          type="text"
                                          className="form-control"
                                          placeholder="Enter Reg Number"
                                          onChange={(e) => handleInputChange('regNr', e.target.value.toString().toUpperCase())}
                                          value={inventoryItem.regNr || ''}
                                          disabled={!inventoryItem.subcategory}
                                          isInvalid={!!inventoryErrors?.regNr}
                                          name="regNr"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                          {inventoryErrors?.regNr}
                                        </Form.Control.Feedback>
                                        <small className="mt-1 d-block text-muted">
                                          <i className="fi fi-rs-info me-1"></i>
                                          The Reg number is not publicly displayed and is only used for invoicing and documentation purposes.
                                        </small>
                                      </FormGroup>
                                    </Col>     

                                    <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Stock Nr</Form.Label>
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Stock Number"
                                            onChange={(e) => handleInputChange('stockNr', e.target.value.toString().toUpperCase())}
                                            value={inventoryItem.stockNr || ''}
                                            disabled={!inventoryItem.subcategory}
                                          />   
                                          {inventoryErrors?.stockNr && (
                                          <Form.Control.Feedback type="invalid">
                                            {inventoryErrors.stockNr}
                                          </Form.Control.Feedback>)}                                   
                                        </FormGroup>
                                    </Col>                                                    

                                    </Row>

                                    <FormGroup className="form-group mt-4">
                                      <Row className="row-sm justify-content-end">
                                        <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                          <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipDetailsSave}>
                                            {id == "new" ? "Create" : "Save"}
                                          </Button>
                                        </Col>
                                      </Row>
                                    </FormGroup>

                              </Card.Body>
                            </Card>
                          </Tab.Pane>

                          <Tab.Pane eventKey="condition" className="main-content-body  p-0 border-0">
                            <Card>
                              <Card.Body>
                                  <div className="mb-4 main-content-label text-primary">Vehicle Condition</div>                                                                         

                                    <div className="mb-4">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">Extras</h6>
                                        <Button
                                          onClick={() => {
                                            const currentExtras = inventoryItem.extras || [];
                                            handleInputChange('extras', [...currentExtras, ""]);
                                          }}
                                          className="btn btn-primary btn-sm" size="sm">
                                          Add Extra
                                        </Button>
                                      </div>

                                      {inventoryItem?.extras?.length > 0 ? (
                                        inventoryItem?.extras?.map((extra, index) => (
                                          <div key={index} className="mb-3">
                                            <div className="d-flex align-items-center">
                                              <div style={{ width: '100px' }}>
                                                <span className="text-dark">Extra {index + 1}</span>
                                              </div>
                                              <div className="flex-grow-1">
                                                <div className="d-flex gap-2">
                                                  <Form.Control
                                                    type="text"
                                                    placeholder="Enter vehicle extra"
                                                    value={extra}
                                                    isInvalid={inventoryErrors?.extras?.[index]}
                                                    onChange={(e) => {
                                                      const updatedExtras = [...inventoryItem.extras];
                                                      updatedExtras[index] = e.target.value;
                                                      handleInputChange('extras', updatedExtras);
                                                    }}
                                                  />
                                                  <Button
                                                    variant="danger"
                                                    className="px-3"
                                                    onClick={() => {
                                                      const updatedExtras = inventoryItem.extras.filter((_, i) => i !== index);
                                                      handleInputChange('extras', updatedExtras);
                                                    }}
                                                  >
                                                    ×
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-muted">No vehicle extras listed.</div>
                                      )}
                                    </div> 

                                    <div className="mb-4 main-content-label text-primary">
                                      Included Accessories & Documentation
                                    </div>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="spareKey"
                                          label="Spare Key"
                                          checked={inventoryItem.spareKey || false}
                                          onChange={(e) => handleInputChange('spareKey', e.target.checked)}
                                        />
                                      </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="ownersManual"
                                          label="Owners Manual"
                                          checked={inventoryItem.ownersManual || false}
                                          onChange={(e) => handleInputChange('ownersManual', e.target.checked)}
                                        />
                                      </FormGroup>
                                    </Col>

                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="serviceHistoryBook"
                                          label="Service History Book"
                                          checked={inventoryItem.serviceHistoryBook || false}
                                          onChange={(e) => {
                                            handleInputChange('serviceHistoryBook', e.target.checked);
                                            if (!e.target.checked) {
                                              handleInputChange('serviceHistory', '');
                                            }
                                          }}
                                        />
                                      </FormGroup>
                                    </Col>

                                    {inventoryItem.serviceHistoryBook && (
                                    <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Service History</Form.Label>
                                          <Form.Select
                                            className="form-control"
                                            value={inventoryItem.serviceHistory || ''}
                                            onChange={(e) => handleInputChange('serviceHistory', e.target.value)}
                                            isInvalid={inventoryErrors?.serviceHistory}                                            
                                          >
                                            <option value="">Select Service History</option>                                         
                                            <option value="Partial Service History">Partial Service History</option>  
                                            <option value="Full Service History">Full Service History</option>  
                                            <option value="Full Franchise Service History">Full Franchise Service History</option>                    
                                          </Form.Select>
                                          {inventoryErrors?.serviceHistory && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.serviceHistory}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                    </Col>)}

                                    <div className="mb-4 main-content-label text-primary">
                                      Manufacturer Plans
                                    </div>

                                    <Col xs={12} sm={12} md={4}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="manufacturerWarranty"
                                          label="Manufacturer Warranty"
                                          checked={inventoryItem.manufacturerWarrantyActive || false}
                                          onChange={(e) => handleInputChange('manufacturerWarrantyActive', e.target.checked)}
                                        />
                                      </FormGroup>
                                      {inventoryItem.manufacturerWarrantyActive && (
                                        <FormGroup className="form-group mt-2">
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 3 Years 100 000km"
                                            value={inventoryItem.manufacturerWarrantyDes || ''}
                                            onChange={(e) => handleInputChange('manufacturerWarrantyDes', e.target.value)}
                                            isInvalid={inventoryErrors?.manufacturerWarrantyDes}
                                          />
                                          {inventoryErrors?.manufacturerWarrantyDes && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.manufacturerWarrantyDes}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      )}
                                    </Col>

                                    <Col xs={12} sm={12} md={4}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="manufacturerServicePlan"
                                          label="Service Plan"
                                          checked={inventoryItem.manufacturerServicePlanActive || false}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              // If turning on service plan, turn off maintenance plan
                                              handleInputChange('manufacturerMaintananceActive', false);
                                              handleInputChange('manufacturerMaintananceDes', '');
                                            }
                                            handleInputChange('manufacturerServicePlanActive', e.target.checked);
                                          }}
                                        />
                                      </FormGroup>
                                      {inventoryItem.manufacturerServicePlanActive && (
                                        <FormGroup className="form-group mt-2">
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 3 Years 45 000km"
                                            value={inventoryItem.manufacturerServicePlanDes || ''}
                                            onChange={(e) => handleInputChange('manufacturerServicePlanDes', e.target.value)}
                                            isInvalid={inventoryErrors?.manufacturerServicePlanDes}
                                          />
                                          {inventoryErrors?.manufacturerServicePlanDes && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.manufacturerServicePlanDes}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      )}
                                    </Col>

                                    <Col xs={12} sm={12} md={4}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="manufacturerMaintenance"
                                          label="Maintenance Plan"
                                          checked={inventoryItem.manufacturerMaintananceActive || false}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              // If turning on maintenance plan, turn off service plan
                                              handleInputChange('manufacturerServicePlanActive', false);
                                              handleInputChange('manufacturerServicePlanDes', '');
                                            }
                                            handleInputChange('manufacturerMaintananceActive', e.target.checked);
                                          }}
                                        />
                                      </FormGroup>
                                      {inventoryItem.manufacturerMaintananceActive && (
                                        <FormGroup className="form-group mt-2">
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 5 Years 100 000km"
                                            value={inventoryItem.manufacturerMaintananceDes || ''}
                                            onChange={(e) => handleInputChange('manufacturerMaintananceDes', e.target.value)}
                                            isInvalid={inventoryErrors?.manufacturerMaintananceDes}
                                          />
                                          {inventoryErrors?.manufacturerMaintananceDes && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.manufacturerMaintananceDes}
                                            </Form.Control.Feedback>
                                          )}
                                        </FormGroup>
                                      )}
                                    </Col>   

                                    <div className="mt-5 mb-4 text-success">
                                      Reminder: Please upload any relevant documents, such as mechanical reports, diagnostic reports, service history, etc under the 'Media & Documents' tab.
                                    </div>

                                    <div className="mb-4 main-content-label text-primary">NATIS Document</div>
                                    <div className="mb-4">
                                    <Row>
                                      <Col xs={12}>
                                        {/* Show different content based on screen size */}
                                        <div className="d-none d-md-block"> {/* Desktop View */}
                                          <Alert variant="info" className="d-flex align-items-center">
                                            <i className="fa fa-info-circle me-2 fs-5"></i>
                                            To scan the NATIS document, please use a mobile device or tablet.
                                          </Alert>
                                        </div>

                                        <div className="d-block d-md-none"> {/* Mobile/Tablet View */}
                                          {!inventoryItem.natisIsDealerStocked ? (
                                            <div className="text-center py-3">
                                              <Button 
                                                variant="primary"
                                                className="d-flex align-items-center mx-auto"
                                                onClick={() => {
                                                  // Implement scan functionality here
                                                  console.log('Scanning NATIS...');
                                                }}
                                              >
                                                <i className="fa fa-qr-code me-2"></i>
                                                Scan NATIS Document
                                              </Button>
                                              <small className="text-muted mt-2">
                                                Use your camera to scan the NATIS document barcode.
                                              </small>
                                            </div>
                                          ) : null}
                                        </div>

                                        {/* Status Display - Show for all devices if NATIS is scanned */}
                                        {inventoryItem.natisIsDealerStocked && (
                                          <div className="border rounded p-3 mt-3">
                                            <div className="d-flex align-items-center">
                                              <div className="me-3">
                                                <i className="fa fa-check-circle text-success fs-4"></i>
                                              </div>
                                              <div>
                                                <h6 className="mb-1">NATIS Document Dealer Stocked</h6>
                                                <p className="mb-0 text-muted">
                                                  Stocked on: {new Date(inventoryItem.natisDealerStockedDate).toLocaleDateString()} at{' '}
                                                  {new Date(inventoryItem.natisDealerStockedDate).toLocaleTimeString()}
                                                </p>
                                                {inventoryItem.natisDealerStockScan && (
                                                  <small className="text-muted">
                                                    Document ID: {inventoryItem.natisDealerStockScan}
                                                  </small>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Trust & Transparency Message */}
                                        <div className="mt-3">
                                        <Alert variant="success" className="d-flex align-items-center">
                                          <i className="fa fa-shield-alt me-2 fs-5"></i>
                                          Displaying the NATIS document **builds trust** by confirming its availability and ensuring a **secure, transparent** sale. 
                                          **VIN and engine numbers won’t be public**—only verification that the document matches the invoice and official records.
                                        </Alert>
                                      </div>

                                        {/* Scanning in Progress State */}
                                        {false && ( // Replace with actual scanning state
                                          <div className="text-center py-3">
                                            <div className="spinner-border text-primary mb-2" role="status">
                                              <span className="visually-hidden">Scanning...</span>
                                            </div>
                                            <p className="mb-0">Scanning NATIS Document...</p>
                                          </div>
                                        )}
                                      </Col>
                                    </Row>
                                    </div> 

                                    <FormGroup className="form-group mt-4">
                                      <Row className="row-sm justify-content-end">
                                        <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                          <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipConditionSave}>
                                             {id == "new" ? "Create" : "Save"}
                                          </Button>
                                        </Col>
                                      </Row>
                                    </FormGroup>                                

                              </Card.Body>
                            </Card>
                          </Tab.Pane>

                          <Tab.Pane eventKey="costing" className="main-content-body  p-0 border-0">
                            <Card>
                              <Card.Body>
                                <div className="mb-4 main-content-label text-primary">Costing</div>

                                <Col xs={12} sm={12} md={6}>
                                  <FormGroup className="form-group">
                                    <Form.Label>Selling Price (R)</Form.Label>
                                    <InputGroup>
                                      <InputGroup.Text>R</InputGroup.Text>
                                      <Form.Control
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter price"
                                        value={inventoryItem.price || ""}
                                        onChange={(e) => handleInputChange("price", e.target.value)}
                                        min="0"
                                      />
                                    </InputGroup>
                                  </FormGroup>
                                </Col>

                                  {/* Show Previous Price Toggle */}
                                  <Col xs={12} sm={12} md={6}>
                                    <FormGroup className="form-group">
                                      <Form.Check
                                        type="switch"
                                        id="showPreviousPrice"
                                        label="Show Previous Price"
                                        checked={inventoryItem.showPreviousPrice !== undefined ? inventoryItem.showPreviousPrice : true}
                                        onChange={(e) => handleInputChange("showPreviousPrice", e.target.checked)}
                                      />
                                      <small className="text-muted d-block mt-1">
                                        This will record the previous price when reduced and display a banner highlighting the price change.
                                      </small>
                                    </FormGroup>
                                  </Col>

                                   <div className="mb-4 main-content-label text-primary">
                                      Charges
                                    </div>

                                    <Col xs={12}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Cash Purchase Charges</Form.Label>
                                          <div className="border rounded p-3">
                                            {extras
                                              ?.filter(extra => extra.saleType === 'Cash')
                                              ?.map((extra) => (
                                                <div key={extra._id || extra.description} className="mb-2">
                                                  <div className="custom-form-check form-check">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      id={`extra-${extra._id || extra.description}`}
                                                      checked={extra.required || inventoryItem.financeExtras?.includes(extra._id || extra.description)}
                                                      onChange={(e) => {
                                                        if (extra.required) return;
                                                        const updatedExtras = e.target.checked
                                                          ? [...(inventoryItem.financeExtras || []), (extra._id || extra.description)]
                                                          : inventoryItem.financeExtras.filter(id => id !== (extra._id || extra.description));
                                                        handleInputChange('financeExtras', updatedExtras);
                                                      }}
                                                      disabled={extra.required}
                                                      style={{ marginTop: '3px' }}
                                                    />
                                                    <label 
                                                      className="form-check-label ms-2 d-flex justify-content-between align-items-center w-100" 
                                                      htmlFor={`extra-${extra._id || extra.description}`}
                                                      style={{ color: '#212529' }}
                                                    >
                                                      <div>
                                                        <span>{extra.description}</span>
                                                        {extra.required && (
                                                          <Badge bg="danger" className="ms-2">Required</Badge>
                                                        )}
                                                      </div>
                                                      <span style={{ fontWeight: 400 }}>R {extra.amount.toLocaleString()}</span>
                                                    </label>
                                                  </div>
                                                </div>
                                              ))}
                                            {!extras?.filter(extra => extra.saleType === 'Cash').length && (
                                              <div className="text-muted">No Cash charges available</div>
                                            )}
                                          </div>
                                          {inventoryErrors?.financeExtras && (
                                            <Form.Control.Feedback type="invalid" className="d-block">
                                              {inventoryErrors.financeExtras}
                                            </Form.Control.Feedback>
                                          )}

                                          <style jsx>{`
                                            .custom-form-check {
                                              position: relative;
                                              display: flex;
                                              align-items: flex-start;
                                            }
                                            .custom-form-check input[type="checkbox"] {
                                              margin-top: 0.3rem;
                                            }
                                            .custom-form-check input[type="checkbox"]:disabled {
                                              opacity: 1;
                                            }
                                            .custom-form-check input[type="checkbox"]:disabled + label {
                                              opacity: 1 !important;
                                              color: #212529 !important;
                                            }
                                          `}</style>
                                        </FormGroup>
                                    </Col>
                              
                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="isFinanceAvailable"
                                          label="Finance Available"
                                          checked={inventoryItem.isFinanceAvailable || false}
                                          onChange={(e) => handleInputChange('isFinanceAvailable', e.target.checked)}
                                        />
                                      </FormGroup>
                                    </Col>

                                    {inventoryItem.isFinanceAvailable && (
                                      <Col xs={12}>
                                        <FormGroup className="form-group">
                                          <Form.Label>Finance Charges</Form.Label>
                                          <div className="border rounded p-3">
                                            {extras
                                              ?.filter(extra => extra.saleType === 'Finance')
                                              ?.map((extra) => (
                                                <div key={extra._id || extra.description} className="mb-2">
                                                  <div className="custom-form-check form-check">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      id={`extra-${extra._id || extra.description}`}
                                                      checked={extra.required || inventoryItem.financeExtras?.includes(extra._id || extra.description)}
                                                      onChange={(e) => {
                                                        if (extra.required) return;
                                                        const updatedExtras = e.target.checked
                                                          ? [...(inventoryItem.financeExtras || []), (extra._id || extra.description)]
                                                          : inventoryItem.financeExtras.filter(id => id !== (extra._id || extra.description));
                                                        handleInputChange('financeExtras', updatedExtras);
                                                      }}
                                                      disabled={extra.required}
                                                      style={{ marginTop: '3px' }}
                                                    />
                                                    <label 
                                                      className="form-check-label ms-2 d-flex justify-content-between align-items-center w-100" 
                                                      htmlFor={`extra-${extra._id || extra.description}`}
                                                      style={{ color: '#212529' }}
                                                    >
                                                      <div>
                                                        <span>{extra.description}</span>
                                                        {extra.required && (
                                                          <Badge bg="danger" className="ms-2">Required</Badge>
                                                        )}
                                                      </div>
                                                      <span style={{ fontWeight: 400 }}>R {extra.amount.toLocaleString()}</span>
                                                    </label>
                                                  </div>
                                                </div>
                                              ))}
                                            {!extras.filter(extra => extra.saleType === 'Finance').length && (
                                              <div className="text-muted">No Finance charges available</div>
                                            )}
                                          </div>
                                          <div className="mt-2 text-muted">
                                            <small>
                                              <i className="fi fi-rs-info me-1"></i>
                                              These charges will be included in the finance calculation to determine monthly installments.
                                            </small>
                                          </div>
                                          {inventoryErrors?.financeExtras && (
                                            <Form.Control.Feedback type="invalid" className="d-block">
                                              {inventoryErrors.financeExtras}
                                            </Form.Control.Feedback>
                                          )}

                                          <style jsx>{`
                                            .custom-form-check {
                                              position: relative;
                                              display: flex;
                                              align-items: flex-start;
                                            }
                                            .custom-form-check input[type="checkbox"] {
                                              margin-top: 0.3rem;
                                            }
                                            .custom-form-check input[type="checkbox"]:disabled {
                                              opacity: 1;
                                            }
                                            .custom-form-check input[type="checkbox"]:disabled + label {
                                              opacity: 1 !important;
                                              color: #212529 !important;
                                            }
                                          `}</style>
                                        </FormGroup>
                                      </Col>
                                    )} 

                                    <div className="mb-4 main-content-label text-primary">
                                      Sale Agreement
                                    </div>
                                    
                                    <div className="mb-4">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h6 className="mb-0 d-inline">
                                            Specific/Sale Conditions{' '}
                                            <OverlayTrigger placement="top" overlay={<Tooltip id="button-tooltip">
                                                These sale conditions will pull to your contract when the sale agreement has been signed.
                                              </Tooltip>}>
                                              <i className="fa fa-info-circle text-muted ms-1" style={{ cursor: 'pointer' }}></i>
                                            </OverlayTrigger>
                                          </h6>
                                         <Button
                                          onClick={() => {
                                            const currentConditions = inventoryItem.specificConditions || [];
                                            handleInputChange('specificConditions', [...currentConditions, ""]);
                                          }}
                                          className="btn btn-primary btn-sm" size="sm"
                                        >
                                          Add Condition
                                        </Button>
                                      </div>
                                      {inventoryItem.specificConditions?.length > 0 && (
                                      <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Check
                                          type="switch"
                                          id="specificConditionsPublic"
                                          label="Make Specific Conditions Public"
                                          checked={inventoryItem.specificConditionsPublic || false }
                                          onChange={(e) => handleInputChange('specificConditionsPublic', e.target.checked)}
                                        />
                                      </FormGroup>
                                    </Col>)}

                                      {inventoryItem?.specificConditions?.length > 0 ? (
                                        inventoryItem?.specificConditions?.map((condition, index) => (
                                          <div key={index} className="mb-3">
                                            <div className="d-flex align-items-center">
                                              <div style={{ width: '100px' }}>
                                                <span className="text-dark">Condition {index + 1}</span>
                                              </div>
                                              <div className="flex-grow-1">
                                                <div className="d-flex gap-2">
                                                  <Form.Control
                                                    type="text"
                                                    placeholder="Enter specific condition"
                                                    value={condition}
                                                    isInvalid={inventoryErrors?.specificConditions?.[index]}
                                                    onChange={(e) => {
                                                      const updatedConditions = [...inventoryItem.specificConditions];
                                                      updatedConditions[index] = e.target.value;
                                                      handleInputChange('specificConditions', updatedConditions);
                                                    }}
                                                  />
                                                  <Button
                                                    variant="danger"
                                                    className="px-3"
                                                    onClick={() => {
                                                      const updatedConditions = inventoryItem.specificConditions.filter((_, i) => i !== index);
                                                      handleInputChange('specificConditions', updatedConditions);
                                                    }}
                                                  >
                                                    ×
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-muted">No specific/sale conditions listed.</div>
                                      )}
                                    </div> 

                                    <FormGroup className="form-group mt-4">
                                      <Row className="row-sm justify-content-end">
                                        <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                          <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipDetailsSave}>
                                            {id == "new" ? "Create" : "Save"}
                                          </Button>
                                        </Col>
                                      </Row>
                                    </FormGroup>  

                              </Card.Body>
                            </Card>
                          </Tab.Pane>                         

                          <Tab.Pane eventKey="market" className="main-content-body  p-0 border-0">
                          <Card>
                            <Card.Body>

                              <div className="mb-4 main-content-label text-primary">Status & Flags</div>

                              <div className="mb-4 main-content-label text-primary">Auction & Offers</div>

                              {/* Allow Auction Toggle */}
                              <FormGroup className="form-group">
                                <Form.Check
                                  type="switch"
                                  id="allowToSellOnAuction"
                                  label="Allow Auction"
                                  checked={inventoryItem.allowToSellOnAuction || false}
                                  onChange={(e) => handleInputChange('allowToSellOnAuction', e.target.checked)}
                                />
                              </FormGroup>

                              {/* Auction Details Section */}
                              {inventoryItem.allowToSellOnAuction && (
                                <Row className="gy-3">
                                  <Col xs={12} sm={12} md={6}>
                                  <FormGroup className="form-group">
                                    <Form.Label>Opening Bid</Form.Label>
                                    <Form.Control
                                      type="number"
                                      className="form-control"
                                      placeholder="Enter opening bid amount"
                                      onChange={(e) => handleInputChange('openingBid', e.target.value)}
                                      value={inventoryItem.openingBid || ''}
                                      min="0"
                                      disabled={!inventoryItem.price || inventoryItem.price <= 0}
                                    />                                    
                                    {/* Conditional Message */}
                                    {!inventoryItem.price || inventoryItem.price <= 0 ? (
                                      <small className="text-danger d-block mt-1">
                                        The opening bid cannot be set without a selling price.
                                      </small>
                                    ) : (
                                      <small className="text-muted d-block mt-1">
                                        The selling price is <strong>R {inventoryItem.price.toLocaleString()}</strong>.
                                      </small>
                                    )}
                                  </FormGroup>
                                </Col>                                  

                                  {inventoryItem.auctionEndedDate && (
                                  <Col xs={12} sm={12} md={6}>
                                    <FormGroup className="form-group">
                                      <Form.Label>Auction End Date</Form.Label>
                                      <Form.Control
                                        type="datetime-local"
                                        className="form-control"
                                        onChange={(e) => handleInputChange('auctionEndedDate', e.target.value)}
                                        value={inventoryItem.auctionEndedDate || ''}
                                        disabled
                                      />
                                    </FormGroup>
                                  </Col>)}
                                 
                                </Row>)}

                              {/* Offers Section */}
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
                                      type="number"
                                      className="form-control"
                                      placeholder="Enter minimum offer to auto-reject"
                                      onChange={(e) => handleInputChange('autoRejectMinOffer', e.target.value)}
                                      value={inventoryItem.autoRejectMinOffer || ''}
                                      min="0"
                                      disabled={!inventoryItem.price || inventoryItem.price <= 0}
                                    />
                                    
                                    {/* Conditional Message */}
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

                              <div className="mb-4 main-content-label text-primary">Statistics</div>

                              <FormGroup className="form-group mt-4">
                                <Row className="row-sm justify-content-end">
                                  <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                    <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipDetailsSave}>
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
                                  documents={inventoryItem} 
                                  onDocumentsUpdate={handleInputChange}
                                />
                            </div> 

                            <div className="mb-4">
                                <div className="mb-2 d-flex justify-content-between align-items-center mb-3">
                                <div className="main-content-label text-primary">
                                    Videos{" "}
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip id="button-tooltip">
                                          Add a YouTube link for a video related to this listing. 
                                          Ensure that monetization is turned off to prevent adverts from appearing.
                                        </Tooltip>}
                                    >
                                      <i
                                        className="fa fa-info-circle text-muted ms-1"
                                        style={{ cursor: "pointer" }}
                                      ></i>
                                    </OverlayTrigger>
                                    </div>
                                  <Button
                                    onClick={() => {
                                      const currentVideos = inventoryItem.videos || [];
                                      handleInputChange("videos", [...currentVideos, { url: "", caption: "" }]);
                                    }}
                                    className="btn btn-primary btn-sm"
                                    size="sm"
                                  >
                                    Add Video
                                  </Button>
                                </div>

                                {inventoryItem?.videos?.length > 0 ? (
                                  inventoryItem?.videos?.map((video, index) => (
                                    <div key={index} className="mb-3">
                                      <Row className="g-2 align-items-center">
                                        {/* Video URL Input */}
                                        <Col xs={12} sm={5}>
                                          <FormGroup className="form-group">
                                            <Form.Control
                                              type="text"
                                              placeholder="Enter YouTube link"
                                              value={video.url}
                                              isInvalid={inventoryErrors?.videos?.[index]?.url}
                                              onChange={(e) => {
                                                const updatedVideos = [...inventoryItem.videos];
                                                updatedVideos[index].url = e.target.value;
                                                handleInputChange("videos", updatedVideos);
                                              }}
                                            />
                                            {inventoryErrors?.videos?.[index]?.url && (
                                              <Form.Control.Feedback type="invalid">
                                                {inventoryErrors.videos[index].url}
                                              </Form.Control.Feedback>
                                            )}
                                          </FormGroup>
                                        </Col>

                                        {/* Caption Input */}
                                        <Col xs={12} sm={5}>
                                          <FormGroup className="form-group">
                                            <Form.Control
                                              type="text"
                                              placeholder="Enter caption (optional)"
                                              value={video.caption}
                                              onChange={(e) => {
                                                const updatedVideos = [...inventoryItem.videos];
                                                updatedVideos[index].caption = e.target.value;
                                                handleInputChange("videos", updatedVideos);
                                              }}
                                            />
                                          </FormGroup>
                                        </Col>

                                        {/* Remove Button */}
                                        <Col xs={12} sm={2}>
                                          <Button
                                            variant="danger"
                                            className="w-100 mb-3 d-flex align-items-center justify-content-center"
                                            onClick={() => {
                                              const updatedVideos = inventoryItem.videos.filter((_, i) => i !== index);
                                              handleInputChange("videos", updatedVideos);
                                            }}
                                          >
                                            ×
                                          </Button>
                                        </Col>
                                      </Row>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted">No videos added.</div>
                                )}
                            </div>   
                            
                            <FormGroup className="form-group mt-4">
                               <Row className="row-sm justify-content-end">
                                  <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                    <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipDetailsSave}>
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
      ) : organization?.type === "Property" ? (
        <Card>{/* Goods form fields */}</Card>
      ) : organization?.type === "Goods" ? (
        <Card>{/* Goods form fields */}</Card>
      ) : organization?.type === "Rentals" ? (
        <Card>{/* Rentals form fields */}</Card>
      ) : (
        <Alert variant="info">Please select a valid type</Alert>
      )}

    </StateHandler>
  );
};

InventoryItem.layout = "ManageLayout";

export default InventoryItem;
