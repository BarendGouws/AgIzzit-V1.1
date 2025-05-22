import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Row, Form, Alert, Badge, Accordion, Table, Modal } from "react-bootstrap";
import { useRouter } from 'next/router';
import Select from "react-select";
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { Filter, Copy, Download, ExternalLink, ChevronDown, Database, Clock } from "lucide-react";
import { fetchAdvertisingTemplates } from "@/redux/manage/slices/advertisingTemplates";
import { createAdvertising, updateAdvertising, fetchAdvertisingItem, deleteAdvertising, clearItem } from "@/redux/manage/slices/advertising";
import moment from 'moment';

const bodyTypes = [
  { value: "sedan", label: "Sedan" },
  { value: "hatchback", label: "Hatchback" },
  { value: "suv", label: "SUV / Crossover" },
  { value: "bakkie", label: "Bakkie / Pickup" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Convertible" },
  { value: "wagon", label: "Station Wagon" },
  { value: "van", label: "Van / Minibus" },
  { value: "truck", label: "Truck" }
];

const feedPlatforms = {
  Dealership: [
    { 
      value: "meta", 
      label: "Meta (Facebook/Instagram)",
      types: [
        { value: "catalog", label: "Catalog Feed" }
      ],
      format: ["csv", "xml"] 
    },
    { 
      value: "tiktok", 
      label: "TikTok",
      types: [
        { value: "inventory", label: "Inventory Feed" },
        { value: "model", label: "Model Feed" }
      ],
      format: ["csv"] 
    },        
    { 
      value: "website", 
      label: "Website Feed",
      types: [
        { value: "inventory", label: "Inventory Feed" }
      ],
      format: ["csv", "json", "xml"] 
    }
  ],
  Goods: [
    { 
      value: "google", 
      label: "Google",
      types: [
        { value: "shopping", label: "Shopping Feed" }
      ],
      format: ["xml", "csv"] 
    },
    { 
      value: "meta", 
      label: "Meta (Facebook/Instagram)",
      types: [
        { value: "catalog", label: "Catalog Feed" }
      ],
      format: ["csv", "xml"] 
    },
    { 
      value: "tiktok", 
      label: "TikTok",
      types: [
        { value: "commerce", label: "Commerce Feed" }
      ],
      format: ["csv"] 
    },
    { 
      value: "microsoft", 
      label: "Microsoft",
      types: [
        { value: "catalog", label: "Product Catalog" }
      ],
      format: ["tsv"] 
    },
    { 
      value: "pinterest", 
      label: "Pinterest",
      types: [
        { value: "catalog", label: "Product Catalog" }
      ],
      format: ["csv"] 
    },
    { 
      value: "snapchat", 
      label: "Snapchat",
      types: [
        { value: "catalog", label: "Product Catalog" }
      ],
      format: ["csv"] 
    },
    { 
      value: "website", 
      label: "Website Feed",
      types: [
        { value: "catalog", label: "Product Catalog" }
      ],
      format: ["csv", "json", "xml"] 
    }
  ],
  Property: [
    { 
      value: "meta", 
      label: "Meta (Facebook/Instagram)",
      types: [
        { value: "catalog", label: "Catalog Feed" }
      ],
      format: ["csv", "xml"] 
    },
    { 
      value: "tiktok", 
      label: "TikTok",
      types: [
        { value: "destination", label: "Destination Feed" }
      ],
      format: ["csv"] 
    },
    { 
      value: "website", 
      label: "Website Feed",
      types: [
        { value: "property", label: "Property Feed" }
      ],
      format: ["csv", "json", "xml"] 
    }
  ],
  Rentals: [
    { 
      value: "meta", 
      label: "Meta (Facebook/Instagram)",
      types: [
        { value: "catalog", label: "Catalog Feed" }
      ],
      format: ["csv", "xml"] 
    },
    { 
      value: "tiktok", 
      label: "TikTok",
      types: [
        { value: "destination", label: "Destination Feed" }
      ],
      format: ["csv"] 
    },
    { 
      value: "website", 
      label: "Website Feed",
      types: [
        { value: "rental", label: "Rental Feed" }
      ],
      format: ["csv", "json", "xml"] 
    }
  ],
  Accomodation: [
    { 
      value: "meta", 
      label: "Meta (Facebook/Instagram)",
      types: [
        { value: "catalog", label: "Catalog Feed" }
      ],
      format: ["csv", "xml"] 
    },
    { 
      value: "tiktok", 
      label: "TikTok",
      types: [
        { value: "hotel", label: "Hotel Feed" }
      ],
      format: ["csv"] 
    },
    { 
      value: "website", 
      label: "Website Feed",
      types: [
        { value: "accommodation", label: "Accommodation Feed" }
      ],
      format: ["csv", "json", "xml"] 
    }
  ]
};

const baseUrl = "http://localhost:3001";

const DealershipInventory = ({ selectedFilters = {}, onFilterChange, errors = {}, onCancel }) => {
  // State for tracking the min/max selections to update corresponding max/min options
  const [minMaxSelections, setMinMaxSelections] = useState({
    yearMin: null,
    priceMin: null,
    mileageMin: null,
    hoursMin: null
  });
  
  // Check if filters are defined/applied
  const hasAppliedFilters = Object.keys(selectedFilters || {}).length > 0;
  
  // Update minMaxSelections when selectedFilters change (for loading existing data)
  useEffect(() => {
    const newMinMaxSelections = {
      yearMin: selectedFilters.yearMin || null,
      priceMin: selectedFilters.priceMin || null,
      mileageMin: selectedFilters.mileageMin || null,
      hoursMin: selectedFilters.hoursMin || null
    };
    
    setMinMaxSelections(newMinMaxSelections);
  }, [selectedFilters]);
  
  // Generate year options - from current year back to 1970
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 55 }, (_, i) => currentYear - i);
  
  // Shared range options
  const rangeOptions = {
    // Price range options - combined for both min and max
    price: [
      0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 
      400000, 450000, 500000, 550000, 600000, 650000, 700000, 
      750000, 800000, 850000, 900000, 950000, 1000000, 
      1100000, 1200000, 1300000, 1400000, 1500000, 
      1600000, 1700000, 1800000, 1900000, 2000000, 
      2500000, 3000000, 3500000, 4000000, 4500000, 5000000
    ],
    
    // Mileage range options - combined for both min and max
    mileage: [
      0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 
      80000, 90000, 100000, 110000, 120000, 130000, 140000, 
      150000, 160000, 170000, 180000, 190000, 200000, 
      250000, 300000, 350000, 400000, 450000, 500000, 
      600000, 700000, 800000, 900000, 1000000
    ],
    
    // Hours range options - combined for both min and max
    hours: [
      0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 
      10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 
      18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 
      26000, 27000, 28000, 29000, 30000
    ]
  };
  
  // Handle min selection change for any range field
  const handleMinChange = (field, value) => {
    const numValue = value ? parseInt(value) : null;
    setMinMaxSelections(prev => ({
      ...prev,
      [field]: numValue
    }));
    onFilterChange(field, numValue);
    
    // If max is less than or equal to min, reset it
    const maxField = field.replace('Min', 'Max');
    if (selectedFilters[maxField] && numValue && parseInt(selectedFilters[maxField]) <= numValue) {
      onFilterChange(maxField, null);
    }
  };
  
  // Handle max selection change for any range field
  const handleMaxChange = (field, value) => {
    const numValue = value ? parseInt(value) : null;
    onFilterChange(field, numValue);
    
    // If min is greater than or equal to max, reset it
    const minField = field.replace('Max', 'Min');
    if (selectedFilters[minField] && numValue && parseInt(selectedFilters[minField]) >= numValue) {
      setMinMaxSelections(prev => ({
        ...prev,
        [minField]: null
      }));
      onFilterChange(minField, null);
    }
  };
  
  // Format value for display based on type
  const formatRangeValue = (type, value) => {
    if (value === null || value === undefined || value === "") return "";
    
    switch (type) {
      case 'price':
        return value === 0 ? 'R0' : 
               value >= 1000000 ? `R${(value/1000000).toFixed(1)}M` : 
               `R${value.toLocaleString()}`;
      case 'mileage':
        return value === 0 ? '0 KM' : 
               value >= 1000 ? `${(value/1000).toFixed(0)}K KM` : 
               `${value} KM`;
      case 'hours':
        return value === 0 ? '0 Hours' : `${value.toLocaleString()} Hours`;
      default:
        return value.toString();
    }
  };
  
  return (
    <div>
      <Alert variant="info" className="mb-4">
        <strong>Dealership Inventory Filter</strong>
        <p className="mb-0">Select filters to determine which vehicles will be included in your feed export.</p>
      </Alert>
      
      {/* Inventory filters section */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">Inventory Filters</h6>
        </Card.Header>
        <Card.Body>
          {/* Description Search */}
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description Match</Form.Label>
                <Form.Control
                  type="text"
                  name="descriptionMatch"
                  placeholder="Match description (e.g., Toyota Corolla)"
                  value={(selectedFilters && selectedFilters.descriptionMatch) || ""}
                  onChange={(e) => onFilterChange('descriptionMatch', e.target.value)}
                  isInvalid={!!errors.descriptionMatch}
                />
                <Form.Text className="text-muted">
                  This will search for vehicles matching these keywords in make, model, variant and description fields
                </Form.Text>
                {errors.descriptionMatch && (
                  <Form.Control.Feedback type="invalid">
                    {errors.descriptionMatch}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          {/* Range Filters Row */}
          <Row className="mb-3">
            {/* Price Range */}
            <Col md={6} className="mb-3">
              <Form.Label>Price Range</Form.Label>
              <Row>
                <Col>
                  <Form.Select
                    name="priceMin"
                    value={(selectedFilters && selectedFilters.priceMin) || ""}
                    onChange={(e) => handleMinChange('priceMin', e.target.value)}
                    isInvalid={!!errors.priceMin}
                  >
                    <option value="">From Price</option>
                    {rangeOptions.price.map((price) => (
                      <option key={`min-${price}`} value={price}>
                        {formatRangeValue('price', price)}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.priceMin && (
                    <Form.Control.Feedback type="invalid">
                      {errors.priceMin}
                    </Form.Control.Feedback>
                  )}
                </Col>
                <Col>
                  <Form.Select
                    name="priceMax"
                    value={(selectedFilters && selectedFilters.priceMax) || ""}
                    onChange={(e) => handleMaxChange('priceMax', e.target.value)}
                    isInvalid={!!errors.priceMax}
                    disabled={!minMaxSelections.priceMin}
                  >
                    <option value="">To Price</option>
                    {rangeOptions.price
                      .filter(price => !minMaxSelections.priceMin || price > minMaxSelections.priceMin)
                      .map((price) => (
                        <option key={`max-${price}`} value={price}>
                          {formatRangeValue('price', price)}
                        </option>
                      ))}
                    <option value="5000001">R5M+</option>
                  </Form.Select>
                  {errors.priceMax && (
                    <Form.Control.Feedback type="invalid">
                      {errors.priceMax}
                    </Form.Control.Feedback>
                  )}
                </Col>
              </Row>
            </Col>
            
            {/* Year Range */}
            <Col md={6} className="mb-3">
              <Form.Label>Year Range</Form.Label>
              <Row>
                <Col>
                  <Form.Select
                    name="yearMin"
                    value={(selectedFilters && selectedFilters.yearMin) || ""}
                    onChange={(e) => handleMinChange('yearMin', e.target.value)}
                    isInvalid={!!errors.yearMin}
                  >
                    <option value="">From Year</option>
                    {yearOptions.map((year) => (
                      <option key={`min-${year}`} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                  {errors.yearMin && (
                    <Form.Control.Feedback type="invalid">
                      {errors.yearMin}
                    </Form.Control.Feedback>
                  )}
                </Col>
                <Col>
                  <Form.Select
                    name="yearMax"
                    value={(selectedFilters && selectedFilters.yearMax) || ""}
                    onChange={(e) => handleMaxChange('yearMax', e.target.value)}
                    isInvalid={!!errors.yearMax}
                    disabled={!minMaxSelections.yearMin}
                  >
                    <option value="">To Year</option>
                    {yearOptions
                      .filter(year => !minMaxSelections.yearMin || year > minMaxSelections.yearMin)
                      .map((year) => (
                        <option key={`max-${year}`} value={year}>{year}</option>
                      ))}
                  </Form.Select>
                  {errors.yearMax && (
                    <Form.Control.Feedback type="invalid">
                      {errors.yearMax}
                    </Form.Control.Feedback>
                  )}
                </Col>
              </Row>
            </Col>
            
            {/* Mileage Range */}
            <Col md={6} className="mb-3">
              <Form.Label>Mileage Range</Form.Label>
              <Row>
                <Col>
                  <Form.Select
                    name="mileageMin"
                    value={(selectedFilters && selectedFilters.mileageMin) || ""}
                    onChange={(e) => handleMinChange('mileageMin', e.target.value)}
                    isInvalid={!!errors.mileageMin}
                  >
                    <option value="">From KM</option>
                    {rangeOptions.mileage.map((km) => (
                      <option key={`min-${km}`} value={km}>
                        {formatRangeValue('mileage', km)}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.mileageMin && (
                    <Form.Control.Feedback type="invalid">
                      {errors.mileageMin}
                    </Form.Control.Feedback>
                  )}
                </Col>
                <Col>
                  <Form.Select
                    name="mileageMax"
                    value={(selectedFilters && selectedFilters.mileageMax) || ""}
                    onChange={(e) => handleMaxChange('mileageMax', e.target.value)}
                    isInvalid={!!errors.mileageMax}
                    disabled={!minMaxSelections.mileageMin}
                  >
                    <option value="">To KM</option>
                    {rangeOptions.mileage
                      .filter(km => !minMaxSelections.mileageMin || km > minMaxSelections.mileageMin)
                      .map((km) => (
                        <option key={`max-${km}`} value={km}>
                          {formatRangeValue('mileage', km)}
                        </option>
                      ))}
                    <option value="1000001">1000K+ KM</option>
                  </Form.Select>
                  {errors.mileageMax && (
                    <Form.Control.Feedback type="invalid">
                      {errors.mileageMax}
                    </Form.Control.Feedback>
                  )}
                </Col>
              </Row>
            </Col>
            
            {/* Hours Range */}
            <Col md={6} className="mb-3">
              <Form.Label>Hours Range</Form.Label>
              <Row>
                <Col>
                  <Form.Select
                    name="hoursMin"
                    value={(selectedFilters && selectedFilters.hoursMin) || ""}
                    onChange={(e) => handleMinChange('hoursMin', e.target.value)}
                    isInvalid={!!errors.hoursMin}
                  >
                    <option value="">From Hours</option>
                    {rangeOptions.hours.map((hours) => (
                      <option key={`min-${hours}`} value={hours}>
                        {formatRangeValue('hours', hours)}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.hoursMin && (
                    <Form.Control.Feedback type="invalid">
                      {errors.hoursMin}
                    </Form.Control.Feedback>
                  )}
                </Col>
                <Col>
                  <Form.Select
                    name="hoursMax"
                    value={(selectedFilters && selectedFilters.hoursMax) || ""}
                    onChange={(e) => handleMaxChange('hoursMax', e.target.value)}
                    isInvalid={!!errors.hoursMax}
                    disabled={!minMaxSelections.hoursMin}
                  >
                    <option value="">To Hours</option>
                    {rangeOptions.hours
                      .filter(hours => !minMaxSelections.hoursMin || hours > minMaxSelections.hoursMin)
                      .map((hours) => (
                        <option key={`max-${hours}`} value={hours}>
                          {formatRangeValue('hours', hours)}
                        </option>
                      ))}
                    <option value="30001">30K+ Hours</option>
                  </Form.Select>
                  {errors.hoursMax && (
                    <Form.Control.Feedback type="invalid">
                      {errors.hoursMax}
                    </Form.Control.Feedback>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          
          {/* Select Filters Row */}
          <Row className="mb-3">
            {/* Condition */}
            <Col md={6} className="mb-3">
              <Form.Label>Condition</Form.Label>
              <Form.Select
                name="condition"
                value={selectedFilters.condition || ""}
                onChange={(e) => onFilterChange('condition', e.target.value)}
                isInvalid={!!errors.condition}
              >
                <option value="">Select Condition</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="demo">Demo</option>
              </Form.Select>
              {errors.condition && (
                <Form.Control.Feedback type="invalid">
                  {errors.condition}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Transmission */}
            <Col md={6} className="mb-3">
              <Form.Label>Transmission</Form.Label>
              <Form.Select
                name="transmission"
                value={selectedFilters.transmission || ""}
                onChange={(e) => onFilterChange('transmission', e.target.value)}
                isInvalid={!!errors.transmission}
              >
                <option value="">Select Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="semi_auto">Semi-Automatic</option>
              </Form.Select>
              {errors.transmission && (
                <Form.Control.Feedback type="invalid">
                  {errors.transmission}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Fuel Type */}
            <Col md={6} className="mb-3">
              <Form.Label>Fuel Type</Form.Label>
              <Form.Select
                name="fuelType"
                value={selectedFilters.fuelType || ""}
                onChange={(e) => onFilterChange('fuelType', e.target.value)}
                isInvalid={!!errors.fuelType}
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </Form.Select>
              {errors.fuelType && (
                <Form.Control.Feedback type="invalid">
                  {errors.fuelType}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Body Type */}
            <Col md={6} className="mb-3">
              <Form.Label>Body Type</Form.Label>
              <Form.Select
                name="bodyType"
                value={selectedFilters.bodyType || ""}
                onChange={(e) => onFilterChange('bodyType', e.target.value)}
                isInvalid={!!errors.bodyType}
              >
                <option value="">Select Body Type</option>
                {bodyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
              {errors.bodyType && (
                <Form.Control.Feedback type="invalid">
                  {errors.bodyType}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          
          {/* Checkbox Filters Row - Changed to Selects */}
          <Row className="mb-3">
            {/* Finance Available */}
            <Col md={6} className="mb-3">
              <Form.Label>Finance Available</Form.Label>
              <Form.Select
                name="isFinanceAvailable"
                value={selectedFilters.isFinanceAvailable || ""}
                onChange={(e) => onFilterChange('isFinanceAvailable', e.target.value === "" ? "" : e.target.value === "true")}
                isInvalid={!!errors.isFinanceAvailable}
              >
                <option value="">Not Specified</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Form.Select>
              {errors.isFinanceAvailable && (
                <Form.Control.Feedback type="invalid">
                  {errors.isFinanceAvailable}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* On Special */}
            <Col md={6} className="mb-3">
              <Form.Label>On Special</Form.Label>
              <Form.Select
                name="onSpecial"
                value={selectedFilters.onSpecial || ""}
                onChange={(e) => onFilterChange('onSpecial', e.target.value === "" ? "" : e.target.value === "true")}
                isInvalid={!!errors.onSpecial}
              >
                <option value="">Not Specified</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Form.Select>
              {errors.onSpecial && (
                <Form.Control.Feedback type="invalid">
                  {errors.onSpecial}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Show Previous Price */}
            <Col md={6} className="mb-3">
              <Form.Label>Show Previous Price</Form.Label>
              <Form.Select
                name="showPreviousPrice"
                value={selectedFilters.showPreviousPrice || ""}
                onChange={(e) => onFilterChange('showPreviousPrice', e.target.value === "" ? "" : e.target.value === "true")}
                isInvalid={!!errors.showPreviousPrice}
              >
                <option value="">Not Specified</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Form.Select>
              {errors.showPreviousPrice && (
                <Form.Control.Feedback type="invalid">
                  {errors.showPreviousPrice}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Service History Book */}
            <Col md={6} className="mb-3">
              <Form.Label>Service History Book</Form.Label>
              <Form.Select
                name="serviceHistoryBook"
                value={selectedFilters.serviceHistoryBook || ""}
                onChange={(e) => onFilterChange('serviceHistoryBook', e.target.value === "" ? "" : e.target.value === "true")}
                isInvalid={!!errors.serviceHistoryBook}
              >
                <option value="">Not Specified</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Form.Select>
              {errors.serviceHistoryBook && (
                <Form.Control.Feedback type="invalid">
                  {errors.serviceHistoryBook}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Spare Key */}
            <Col md={6} className="mb-3">
              <Form.Label>Spare Key</Form.Label>
              <Form.Select
                name="spareKey"
                value={selectedFilters.spareKey || ""}
                onChange={(e) => onFilterChange('spareKey', e.target.value === "" ? "" : e.target.value === "true")}
                isInvalid={!!errors.spareKey}
              >
                <option value="">Not Specified</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Form.Select>
              {errors.spareKey && (
                <Form.Control.Feedback type="invalid">
                  {errors.spareKey}
                </Form.Control.Feedback>
              )}
            </Col>
            
            {/* Owner's Manual */}
            <Col md={6} className="mb-3">
              <Form.Label>Owner's Manual</Form.Label>
              <Form.Select
                name="ownersManual"
                value={selectedFilters.ownersManual || ""}
                onChange={(e) => onFilterChange('ownersManual', e.target.value === "" ? "" : e.target.value === "true")}
                isInvalid={!!errors.ownersManual}
              >
                <option value="">Not Specified</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Form.Select>
              {errors.ownersManual && (
                <Form.Control.Feedback type="invalid">
                  {errors.ownersManual}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Action buttons for the filter section */}
      <div className="d-flex justify-content-end mt-3">
        {hasAppliedFilters ? (
          <Button 
            variant="outline-danger" 
            onClick={() => {
              // Clear all filters
              Object.keys(selectedFilters).forEach(key => {
                onFilterChange(key, null);
              });
              setMinMaxSelections({
                yearMin: null,
                priceMin: null,
                mileageMin: null,
                hoursMin: null
              });
            }}
          >
            Clear Filters
          </Button>
        ) : (
          <Button 
            variant="outline-secondary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
      
      {/* Applied filters summary */}
      {Object.keys(selectedFilters).length > 0 && (
        <div className="mt-4">
          <h6>Applied Filters:</h6>
          <div>
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (value !== null && value !== undefined && value !== '') {
                // Format values for display
                let displayValue = value.toString();
                
                // Price formatting
                if (key === 'priceMin' || key === 'priceMax') {
                  const price = parseInt(value);
                  displayValue = price > 5000000 ? "R5M+" : 
                                 price >= 1000000 ? `R${(price/1000000).toFixed(1)}M` : 
                                 `R${price.toLocaleString()}`;
                }
                
                // Mileage formatting
                if (key === 'mileageMin' || key === 'mileageMax') {
                  const mileage = parseInt(value);
                  displayValue = mileage > 1000000 ? "1000K+ KM" : 
                                mileage >= 1000 ? `${(mileage/1000).toFixed(0)}K KM` : 
                                `${mileage.toLocaleString()} KM`;
                }
                
                // Hours formatting
                if (key === 'hoursMin' || key === 'hoursMax') {
                  const hours = parseInt(value);
                  displayValue = hours > 30000 ? "30K+ Hours" : 
                               `${hours.toLocaleString()} Hours`;
                }
                
                // Boolean values formatting
                if (typeof value === 'boolean') {
                  displayValue = value ? "Yes" : "No";
                }
                
                // Format key for display
                const displayKey = key
                  .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                  .replace(/Min$/, ' From') // Replace Min with From
                  .replace(/Max$/, ' To'); // Replace Max with To
                
                return (
                  <Badge bg="primary" className="me-2 mb-2" key={key}>
                    {displayKey}: {displayValue}
                  </Badge>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyInventory = ({ selectedFilters, onFilterChange, errors = {}, onCancel }) => {
  return (
    <div>
      <Alert variant="info">Property Inventory Filter Component</Alert>
    </div>
  );
};

const GoodsInventory = ({ selectedFilters, onFilterChange, errors = {}, onCancel }) => {
  return (
    <div>
      <Alert variant="info">Goods Inventory Filter Component</Alert>
    </div>
  );
};

const RentalsInventory = ({ selectedFilters, onFilterChange, errors = {}, onCancel }) => {
  return (
    <div>
      <Alert variant="info">Rentals Inventory Filter Component</Alert>
    </div>
  );
};

const AccommodationInventory = ({ selectedFilters, onFilterChange, errors = {}, onCancel }) => {
  return (
    <div>
      <Alert variant="info">Accommodation Inventory Filter Component</Alert>
    </div>
  );
};

// Main component
const AdvertisingItem = () => {
  
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  
  const { loading, error, success, item } = useSelector(state => state.advertising);
  const { templates } = useSelector(state => state.advertisingTemplate || { templates: [] });
  const organization = useSelector(state => state.organization?.organization);
  const organizationType = organization?.type || "Unavailable";
  
  const [errors, setErrors] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedConfig, setFeedConfig] = useState({
    name: '',
    platform: '',
    platformType: '',
    format: '',
    template: '',
    feedUrl: '',
    status: 'active',
    filters: {},
    inventory: [],
    fetchHistory: []
  });

  // Available platforms based on organization type
  const availablePlatforms = useMemo(() => {
    return feedPlatforms[organizationType] || [];
  }, [organizationType]);
  
  // Get available platform types based on selected platform
  const availablePlatformTypes = useMemo(() => {
    if (!feedConfig.platform) return [];
    const platform = availablePlatforms.find(p => p.value === feedConfig.platform);
    return platform ? platform.types || [] : [];
  }, [feedConfig.platform, availablePlatforms]);
  
  // Get the selected platform details
  const selectedPlatform = useMemo(() => {
    if (!feedConfig.platform) return null;
    return availablePlatforms.find(p => p.value === feedConfig.platform);
  }, [feedConfig.platform, availablePlatforms]);

  // Fetch templates when component mounts
  useEffect(() => {
    dispatch(fetchAdvertisingTemplates({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Fetch item when id changes and it's not 'new'
  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchAdvertisingItem(id));
    } else {
      dispatch(clearItem());
    }
  }, [id, dispatch]);
  
  // Set feed configuration when item is loaded
  useEffect(() => {
    if (item && id !== 'new') { 
      setFeedConfig(item);
      if (item.filters && Object.keys(item.filters).length > 0) setShowFilters(true);
    }
  }, [item, id]);

  useEffect(() => {
    if (error && id && id !== 'new') router.push('/manage/advertising');
  }, [error, id, router]);

  // Set default format when platform changes
  useEffect(() => {
    if (selectedPlatform && selectedPlatform.format && selectedPlatform.format.length > 0) {
      setFeedConfig(prev => ({
        ...prev,
        format: selectedPlatform.format[0]
      }));
    }
  }, [selectedPlatform]);

  // Handle input change
  const handleInputChange = (field, value) => {
    // Convert name field to Title Case
    if (field === 'name') {
      value = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    setFeedConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for the field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle platform change
  const handlePlatformChange = (selected) => {
    if (selected) {
      const platform = availablePlatforms.find(p => p.value === selected.value);
      // Get first available type if available
      const firstType = platform && platform.types && platform.types.length > 0 
        ? platform.types[0].value 
        : '';
      
      setFeedConfig(prev => ({
        ...prev,
        platform: selected.value,
        platformType: firstType, // Set default platform type
        // Reset filters when platform changes
        filters: {}
      }));
      
      // Reset show filters when platform changes
      setShowFilters(false);
    }
  };

  // Handle platform type change
  const handlePlatformTypeChange = (selected) => {
    if (selected) {
      setFeedConfig(prev => ({
        ...prev,
        platformType: selected.value,
      }));
    }
  };  

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFeedConfig(prev => ({
      ...prev,
      status: newStatus
    }));
  };  

  const handleInventoryFilterChange = (fieldId, value) => {
    // Simplified filter handling
    if (value === null || value === undefined || value === '') {
      // For null, undefined, or empty string values, remove the field
      setFeedConfig(prev => {
        const newFilters = { ...prev.filters || {} };
        delete newFilters[fieldId];
        
        return {
          ...prev,
          filters: newFilters
        };
      });
    } else {
      // For all other values, set them normally
      setFeedConfig(prev => ({
        ...prev,
        filters: {
          ...(prev.filters || {}),
          [fieldId]: value
        }
      }));
    }
  };

  const toggleShowFilters = (shouldClear = false) => {
    if (shouldClear) {
      // Clear all filters
      setFeedConfig(prev => ({
        ...prev,
        filters: {}
      }));
    }
    
    setShowFilters(prev => !prev);
  };     

  const handleCopyUrl = () => {
    const fullUrl = `${baseUrl}${feedConfig.feedUrl}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        alert("Feed URL copied to clipboard!");
      })
      .catch(err => {
        console.error('Could not copy URL: ', err);
      });
  };  

  const validateForm = () => {
    const newErrors = {};
    
    if (!feedConfig.name.trim()) {
      newErrors.name = "Feed name is required";
    }
    
    if (!feedConfig.platform) {
      newErrors.platform = "Advertising platform is required";
    }
    
    if (feedConfig.platform && !feedConfig.platformType) {
      newErrors.platformType = "Platform type is required";
    }
    
    if (feedConfig.platform && feedConfig.platform !== 'website' && !feedConfig.template) {
      newErrors.template = "Template selection is required";
    }
    
    // Validate filters if they are shown
    if (showFilters) {
      const filters = feedConfig.filters;
      
      // Price validation
      if (filters.priceMin && filters.priceMax && Number(filters.priceMin) > Number(filters.priceMax)) {
        newErrors.priceMax = "Maximum price must be greater than minimum price";
      }
      
      // Year validation
      if (filters.yearMin && filters.yearMax && Number(filters.yearMin) > Number(filters.yearMax)) {
        newErrors.yearMax = "Maximum year must be greater than minimum year";
      }
      
      // Mileage validation
      if (filters.mileageMin && filters.mileageMax && Number(filters.mileageMin) > Number(filters.mileageMax)) {
        newErrors.mileageMax = "Maximum mileage must be greater than minimum mileage";
      }
      
      // Hours validation
      if (filters.hoursMin && filters.hoursMax && Number(filters.hoursMin) > Number(filters.hoursMax)) {
        newErrors.hoursMax = "Maximum hours must be greater than minimum hours";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      // Create base data object without template field
      const data = {
        name: feedConfig.name,
        platform: feedConfig.platform,
        platformType: feedConfig.platformType,
        format: feedConfig.format,
        status: feedConfig.status,
        filters: feedConfig.filters || {},
      };
      
      // Only add template field if it's not a website platform and has a valid template id
      if (feedConfig.platform !== 'website' && feedConfig.template) {
        data.template = feedConfig.template;
      }
      
      if (id === 'new') {
        const result = await dispatch(createAdvertising(data)).unwrap();
        if (result && result.item && result.item._id) router.push(`/manage/advertising/${result.item._id}`);
      } else {
        await dispatch(updateAdvertising({ id, data })).unwrap();
        router.push('/manage/advertising');
      }
    } catch (error) {
      console.error("Error saving feed:", error);
    }
  }; 

  const handleDelete = async () => {
    try {
      await dispatch(deleteAdvertising(id)).unwrap();
      router.push('/manage/advertising');
    } catch (error) {
      console.error("Error deleting feed:", error);
    }
  };
  
  // Add a function to open/close the delete modal
  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'info';
      case 'inactive': return 'danger';
      default: return 'secondary';
    }
  };  

  const renderInventoryComponent = () => {
    if (!feedConfig.platform) {
      return <Alert variant="info">Please select an advertising platform first</Alert>;
    }
    
    switch (organizationType) {
      case "Dealership":
        return <DealershipInventory 
          selectedFilters={feedConfig.filters} 
          onFilterChange={handleInventoryFilterChange}
          errors={errors}
          onCancel={() => toggleShowFilters(true)}
        />;
      case "Property":
        return <PropertyInventory 
          selectedFilters={feedConfig.filters} 
          onFilterChange={handleInventoryFilterChange}
          errors={errors}
          onCancel={() => toggleShowFilters(true)}
        />;
      case "Goods":
        return <GoodsInventory 
          selectedFilters={feedConfig.filters} 
          onFilterChange={handleInventoryFilterChange}
          errors={errors}
          onCancel={() => toggleShowFilters(true)}
        />;
      case "Rentals":
        return <RentalsInventory 
          selectedFilters={feedConfig.filters} 
          onFilterChange={handleInventoryFilterChange}
          errors={errors}
          onCancel={() => toggleShowFilters(true)}
        />;
      case "Accomodation":
        return <AccommodationInventory 
          selectedFilters={feedConfig.filters} 
          onFilterChange={handleInventoryFilterChange}
          errors={errors}
          onCancel={() => toggleShowFilters(true)}
        />;
      default:
        return <Alert variant="warning">Unsupported organization type</Alert>;
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <StateHandler slice="advertising">
      <Pageheader title={id === 'new' ? "Create Advertising Feed" : "Edit Advertising Feed"} heading="Advertising" active={id === 'new' ? "New Feed" : "Edit Feed"} />

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={12}>
            <Card className="custom-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title>Feed Configuration</Card.Title>
                {id !== 'new' && (
                  <div className="d-flex align-items-center">
                    <Badge 
                      bg={getStatusBadgeColor(feedConfig.status)}
                    >
                      {feedConfig.status}
                    </Badge>
                  </div>
                )}
              </Card.Header>
              <Card.Body>
                <Row>
                  {/* Feed Name Column */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Feed Name<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={feedConfig.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter feed name (e.g., Meta Vehicle Inventory)"
                        isInvalid={!!errors.name}
                      />
                      {errors.name && (
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  
                  {/* Advertising Platform Column */}
                  <Col md={6}>                    
                    <Form.Group className="mb-3">
                      <Form.Label>Platform<span className="text-danger">*</span></Form.Label>
                      <Select
                        options={availablePlatforms}
                        className={`basic-select ${errors.platform ? 'is-invalid' : ''}`}
                        classNamePrefix="select"
                        onChange={handlePlatformChange}
                        placeholder={`Select a platform for ${organizationType}`}
                        value={feedConfig.platform ? availablePlatforms.find(p => p.value === feedConfig.platform) : null}
                        getOptionLabel={option => option.label}
                        getOptionValue={option => option.value}
                      />
                      {errors.platform && (
                        <div className="invalid-feedback d-block">
                          {errors.platform}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  
                  {/* Platform Type Column - only shown when platform is selected */}
                  {feedConfig.platform && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Feed Type<span className="text-danger">*</span></Form.Label>
                        <Select
                          options={availablePlatformTypes}
                          className={`basic-select ${errors.platformType ? 'is-invalid' : ''}`}
                          classNamePrefix="select"
                          onChange={handlePlatformTypeChange}
                          placeholder="Select feed type"
                          value={feedConfig.platformType ? availablePlatformTypes.find(t => t.value === feedConfig.platformType) : null}
                          getOptionLabel={option => option.label}
                          getOptionValue={option => option.value}
                        />
                        {errors.platformType && (
                          <div className="invalid-feedback d-block">
                            {errors.platformType}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  )}

                  {/* Feed Format Column */}
                  {selectedPlatform && selectedPlatform.format && selectedPlatform.format.length > 1 && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Feed Format</Form.Label>
                        <Form.Select
                          name="format"
                          value={feedConfig.format}
                          onChange={(e) => handleInputChange('format', e.target.value)}
                        >
                          {selectedPlatform.format.map(format => (
                            <option key={format} value={format}>{format.toUpperCase()}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  )}

                  {/* Template Selection Column */}
                  {selectedPlatform && selectedPlatform.value !== 'website' && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Select Product Feed Template</Form.Label>
                        <Select
                          options={templates?.map(template => ({
                            value: template._id,
                            label: template.name
                          }))}
                          className={`basic-select ${errors.template ? 'is-invalid' : ''}`}
                          classNamePrefix="select"
                          onChange={(selected) => handleInputChange('template', selected?.value)}
                          placeholder="Select a template"
                          isSearchable={true}
                          value={templates?.map(template => ({
                            value: template._id,
                            label: template.name
                          })).find(t => t.value === feedConfig.template)}
                        />
                        {errors.template ? (
                          <div className="invalid-feedback d-block">
                            {errors.template}
                          </div>
                        ) : (
                          <Form.Text className="text-muted">
                            Choose a template for your product feed ads
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  )}
                  
                  {/* Status Selection - only shown when editing existing feed and status is not inactive */}
                  {id !== 'new' && feedConfig.status !== 'inactive' && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Feed Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={feedConfig.status}
                          onChange={handleStatusChange}
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Control whether this feed is active and available for platforms to fetch
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {id !== 'new' && feedConfig.status === 'inactive' && (
          <Alert variant="warning" className="mt-3">
          <div className="d-flex align-items-center">
            <Database className="me-2" size={20} />
            <strong>Feed Status: Inactive</strong>
          </div>
          <p className="mb-0 mt-2">
            This feed has been inactive for over 30 days. A request must be made to this feed URL to activate it again.
          </p>
          </Alert>
        )}
        
        {feedConfig.platform && (
          <Row className="mt-4">
            <Col lg={12}>
              <Card className="custom-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Card.Title>
                    <Filter className="me-2" size={20} />
                    Inventory Filters
                  </Card.Title>
                  <Badge bg="info">
                    {organizationType} Inventory
                  </Badge>
                </Card.Header>
                <Card.Body>
                  {!showFilters ? (
                    <Alert variant="primary" className="alert custom-alert1">
                      <div className="text-center px-5 pb-0">
                        <svg className="custom-alert-icon svg-primary" xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="0 0 24 24" width="1.5rem" fill="#000000">
                          <path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                        <h6>Most advertisers prefer to include all inventory in their feeds and let the advertising platform's AI determine how to best display ads.</h6>
                        <p>However, if you need to filter your inventory, you can set up specific filters.</p>
                        <div className="mt-3 mb-3">                   
                          <Button variant="primary" onClick={() => toggleShowFilters(false)}>Set Up Filters</Button>
                        </div>
                      </div>
                    </Alert>
                  ) : (
                    renderInventoryComponent()
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        {/* Feed Generated Results */}
        {id !== 'new' && (
          <Row className="mt-4">
            <Col lg={12}>
              <Card className="custom-card border-success">
                <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                  <Card.Title>Feed URL</Card.Title>
                  {feedConfig.fetchHistory && feedConfig.fetchHistory.length > 0 && (
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      onClick={() => document.getElementById('feedInfoAlert').classList.remove('d-none')}
                      title="Show Feed Information"
                    >
                      <i className="fa fa-question-circle me-1"></i> Help
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  {/* Responsive Feed URL section - modified for better small screen display */}
                  <Row className="mb-3">
                    <Col xs={12} className="mb-2">
                      <div className="d-flex align-items-center">
                        <strong className="me-2">Feed URL:</strong>
                        <code className="me-2 flex-grow-1 overflow-auto p-2 bg-light">{baseUrl}{feedConfig.feedUrl}</code>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="d-flex flex-wrap">
                        <Button variant="outline-primary" size="sm" onClick={handleCopyUrl} className="me-2 mb-2">
                          <Copy size={16} className="me-1"/> Copy
                        </Button>
                        <Button variant="outline-secondary" size="sm" href={`${baseUrl}${feedConfig.feedUrl}`} target="_blank" className="me-2 mb-2">
                          <ExternalLink size={16} className="me-1"/> Open
                        </Button>
                        <Button variant="outline-success" size="sm" href={`${baseUrl}${feedConfig.feedUrl}`} download className="mb-2">
                          <Download size={16} className="me-1"/> Download
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  
                  {/* Feed Info Alert - Only show when fetch history is zero, or when help button is clicked */}
                  <Alert 
                    variant="primary" 
                    id="feedInfoAlert" 
                    className={feedConfig.fetchHistory && feedConfig.fetchHistory.length > 0 ? 'd-none' : ''}
                    dismissible
                    onClose={() => document.getElementById('feedInfoAlert').classList.add('d-none')}
                  >
                    <p className="mb-1"><strong>Feed Inventory:</strong></p>
                    {feedConfig.inventory && feedConfig.inventory.length > 0 ? (
                      <p>This feed contains {feedConfig.inventory.length} items matching your filter criteria.</p>
                    ) : (
                      <p>No inventory items match your current filter criteria. Try adjusting your filters.</p>
                    )}
                    <p className="mb-1"><strong>Next Steps:</strong></p>
                    <ol className="mb-0">
                      <li>Copy this feed URL and use it when setting up your product/inventory feed in {selectedPlatform?.label}.</li>
                      <li>The feed will update automatically when the platform requests it.</li>
                      <li>You can also manually refresh the feed or test it by clicking the buttons above.</li>
                    </ol>
                  </Alert>
                  
                  {/* Fetch History Accordion */}
                  <Accordion className="mt-3" defaultActiveKey="">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <div className="d-flex align-items-center flex-grow-1">
                          <Clock size={18} className="me-2" />
                          <div className="d-flex flex-column flex-md-row align-items-md-center">
                            <span>Feed Request History</span>
                            <Badge bg="secondary" className="ms-md-2 mt-1 mt-md-0">
                              {feedConfig.fetchHistory?.length || 0}
                            </Badge>
                            {feedConfig.fetchHistory && feedConfig.fetchHistory.length > 0 && (
                              <span className="ms-auto ms-md-3 text-muted small">
                                Last request: {moment(feedConfig.fetchHistory.sort((a, b) => 
                                  new Date(b.fetchedAt) - new Date(a.fetchedAt))[0].fetchedAt).fromNow()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        {feedConfig.fetchHistory && feedConfig.fetchHistory.length > 0 ? (
                          <div className="table-responsive">
                            <Table hover responsive>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Requester</th>
                                  <th className="d-none d-md-table-cell">IP Address</th>
                                  <th className="text-center">Status</th>
                                  <th className="text-end">Size</th>
                                </tr>
                              </thead>
                              <tbody>
                                {feedConfig.fetchHistory.sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt)).map((history, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <span className="d-none d-md-inline">{moment(history.fetchedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                                      <span className="d-inline d-md-none">{moment(history.fetchedAt).format('MM-DD HH:mm')}</span>
                                    </td>
                                    <td>
                                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                        {history.requester || 'Unknown'}
                                      </div>
                                    </td>
                                    <td className="d-none d-md-table-cell">{history.ip || 'N/A'}</td>
                                    <td className="text-center">
                                      <Badge bg={history.statusCode === 200 ? 'success' : history.statusCode === 304 ? 'info' : 'danger'}>
                                        {history.statusCode || 'N/A'}
                                      </Badge>
                                    </td>
                                    <td className="text-end">{history.bytesSent ? formatBytes(history.bytesSent) : 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        ) : (
                          <Alert variant="info" className="mb-0">
                            <div className="text-center">
                              <p className="mb-0">No feed request history available yet.</p>
                              <p className="mb-0 text-muted small">
                                When advertising platforms or users fetch this feed, the requests will be logged here.
                              </p>
                            </div>
                          </Alert>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}      

        {/* Action Buttons */}
        <Row className="mt-4 mb-5">
          <Col lg={12} className="d-flex justify-content-between">
            <div>              
              {id !== 'new' && (
                <Button 
                  variant="danger" 
                  onClick={toggleDeleteModal}
                  disabled={loading}
                >
                  Delete Feed
                </Button>
              )}
            </div>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : id === 'new' ? 'Create Feed' : 'Save Changes'}
            </Button>
          </Col>
        </Row>
      </Form>
      <Modal show={showDeleteModal} onHide={toggleDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the feed "{feedConfig.name}"?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Feed'}
          </Button>
        </Modal.Footer>
    </Modal>
    </StateHandler>
  );
};

AdvertisingItem.layout = "ManageLayout";

export default AdvertisingItem;