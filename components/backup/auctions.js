import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Row, Badge, Alert, Form, FormGroup, InputGroup, Tab, Nav, OverlayTrigger, Tooltip, Accordion, Modal } from "react-bootstrap";
import { useRouter } from "next/router";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import Pagination from "@/components/partials/Pagination";
import StateHandler from "@/components/partials/StateHandler";
import { fetchInventoryItem, saveInventoryItem, createInventory, bookAuction } from "@/redux/manage/slices/inventory";
import { colors, categories, auction } from "@/utils/config";
import ImageGallery from '@/components/partials/ImageGallery';
import DocumentGallery from '@/components/partials/DocumentGallery';
import VideoGallery from '@/components/partials/VideoGallery';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const InventoryItem = ({}) => {

  const router = useRouter();
  const dispatch = useDispatch();

  const { id, type } = router.query;

  const { item, extras } = useSelector((state) => state.inventory);
  const { organization } = useSelector((state) => state.organization);

  const [inventoryErrors, setInventoryErrors] = useState({});
  const [inventoryItem, setInventoryItem] = useState({});

  // State for dependent dropdown options
  const [mmcodeMakes, setMmcodeMakes] = useState([]);
  const [mmcodeModels, setMmcodeModels] = useState([]);
  const [mmcodeVariants, setMmcodeVariants] = useState([]);

  useEffect(() => {
    id !== 'new' && dispatch(fetchInventoryItem(id));    
  },[id]);

  useEffect(() => {    
    if (item) {
      setInventoryItem(item);
      item.category == 'Dealership' && loadDropdownOptions(item);
    }
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

  const handleDealershipDetailsSave = async () => {

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

    if (key === 'year' && inventoryItem.subcategory === 'Cars & Bakkies') {
      return (
        <Form.Select 
          className="form-control"
          placeholder={placeholder}
          value={inventoryItem.year || ''}
          onChange={(e) => handleYear(e.target.value)}
          isInvalid={inventoryErrors?.[key]}
          disabled={!inventoryItem.subcategory}
        >
          <option value="">{placeholder}</option>
          {Array.from({ length: 54 }, (_, i) => 2024 - i).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      );
    }

    // Special handling for make in Cars & Bakkies
    if (key === 'make' && inventoryItem.subcategory === 'Cars & Bakkies') {
      return (
        <Form.Select 
          className="form-control"
          placeholder={placeholder}
          value={inventoryItem.make || ''}
          onChange={(e) => handleMake(e.target.value)}
          isInvalid={inventoryErrors?.[key]}
          disabled={!mmcodeMakes.length}
        >
          <option value="">{placeholder}</option>
          {mmcodeMakes.map((make, index) => (
            <option key={index} value={make}>{make}</option>
          ))}
        </Form.Select>
      );
    }

    // Special handling for model in Cars & Bakkies
    if (key === 'model' && inventoryItem.subcategory === 'Cars & Bakkies') {
      return (
        <Form.Select 
          className="form-control"
          placeholder={placeholder}
          value={inventoryItem.model || ''}
          onChange={(e) => handleModel(e.target.value)}
          isInvalid={inventoryErrors?.[key]}
          disabled={!mmcodeModels.length}
        >
          <option value="">{placeholder}</option>
          {mmcodeModels.map((model, index) => (
            <option key={index} value={model}>{model}</option>
          ))}
        </Form.Select>
      );
    }
    
    // Special handling for variant in Cars & Bakkies
    if (key === 'variant' && inventoryItem.subcategory === 'Cars & Bakkies') {
      return (
        <Form.Select 
          className="form-control"
          placeholder={placeholder}
          value={mmcodeVariants.find(v => v.varient === inventoryItem.variant)?._id || ''}
          onChange={(e) => handleVariant(e.target.value)}
          isInvalid={inventoryErrors?.[key]}
          disabled={!mmcodeVariants.length}
        >
          <option value="">{placeholder}</option>
          {mmcodeVariants.map((variant) => (
            <option key={variant._id} value={variant._id}>
              {variant.varient}
            </option>
          ))}
        </Form.Select>
      );
    }

    // Special handling for transmission and fuel type in Cars & Bakkies
    if ((key === 'transmission' || key === 'fuelType') && inventoryItem.subcategory === 'Cars & Bakkies') {
      const commonProps = {
        className: "form-control",
        placeholder,
        value: inventoryItem[key] || '',
        onChange: (e) => handleInputChange(key, e.target.value),
        isInvalid: inventoryErrors?.[key],
        disabled: disabled || !inventoryItem.subcategory || !!inventoryItem.variant
      };

      return (
        <Form.Select {...commonProps}>
          <option value="">{placeholder}</option>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </Form.Select>
      );
    }

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

  const handleYear = async (selectedYear) => { console.log(selectedYear)

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
 
    if (inventoryItem.subcategory === 'Cars & Bakkies') {
      // When loading a saved listing, find the variant by matching the variant name
      if (!variantId && inventoryItem.variant) {
        const foundVariant = mmcodeVariants.find(v => v.varient === inventoryItem.variant);
        if (foundVariant) { console.log(foundVariant)
          setInventoryItem(prev => ({
            ...prev,          
            variant: foundVariant.varient,
            mmCode: foundVariant.mmCode,
            fuelType: foundVariant.fuelType || "",
            transmission: foundVariant.transmission || "",        
            fullDescription: `${prev.year} ${prev.make} ${prev.model} ${foundVariant.varient}`
          }));
        }
        return;
      }
  
      // Normal variant selection from dropdown
      if (variantId) {
        const selectedVariant = mmcodeVariants.find((item) => item._id === variantId);
        if (selectedVariant) {
          // Add fuelType and transmission to update
          setInventoryItem(prev => ({
            ...prev,          
            variant: selectedVariant.varient,
            mmCode: selectedVariant.mmCode,
            fuelType: selectedVariant.fuelType || "",
            transmission: selectedVariant.transmission || "",        
            fullDescription: `${prev.year} ${prev.make} ${prev.model} ${selectedVariant.varient}`
          }));
        }
      }
    } else {
      // For other vehicle types, just update the variant directly
      setInventoryItem(prev => ({
        ...prev,
        variant: variantId
      }));
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

  const handleDealershipCostingSave = async () => {

    const errors = {};
   
    // Validate price
    if (!inventoryItem.price || inventoryItem.price < 1000) {
      errors.price = 'Price must be at least R1,000';
    }
   
    // Validate specific conditions - check if any are empty
    if (inventoryItem.specificConditions?.length > 0) {
      const emptyConditions = inventoryItem.specificConditions.some(
        condition => !condition.trim()
      );
      if (emptyConditions) {
        errors.specificConditions = 'Sale conditions cannot be empty. Please remove or fill in all conditions.';
      }
    }
   
    // Update validation errors state
    setInventoryErrors(errors);
   
    // If no errors, save changes
    if (Object.keys(errors).length === 0) {
      try {
        await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();
      } catch (error) {
        console.error('Error saving costing details:', error);
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

  const handleDealershipMarketSave = async () => {};

  const handleDealershipMediaSave = async () => {
    try {       
      await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();              
    } catch (error) {
      console.error('Error saving media updates:', error);
    }
  };

  //AUCTION
  const calculateAuctionTimes = (auctionDate) => {
    if (!auctionDate) return '';

    console.log(auction.Dealership.startTime);  
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startTime = auction.Dealership.startTime || '08:00';
    const durationHours = parseInt(auction.Dealership.durationHours, 10);
  
    // Parse the auction start date and apply the start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMoment = moment(auctionDate).set({
      hour: startHour,
      minute: startMinute,
      second: 0
    });
  
    // Compute end time
    const endMoment = moment(startMoment).add(durationHours, 'hours');
  
    return {
      startDay: days[startMoment.day()],
      startTime: startMoment.format('HH:mm'),
      endDay: days[endMoment.day()],
      endTime: endMoment.format('HH:mm')
    };
  };    

  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionErrors, setAuctionErrors] = useState({}); 
  const [auctionData, setAuctionData] = useState({
    openingBid: '',
    auctionEventType: 'Regular',
    auctionDate: moment().add(1, 'days').format('YYYY-MM-DD'),
    auctionType: 'Public'
  }); 

  // Add this useEffect to set initial auction event type
  useEffect(() => {
    if (showAuctionModal) {
      // Set next valid auction date (skip Sunday)
      let nextDate = moment().add(1, 'days');
      if (nextDate.day() === 0) {
        nextDate.add(1, 'days');
      }
      
      setAuctionData(prev => ({
        ...prev,
        auctionEventType: 'Regular', // Always default to Regular
        auctionDate: nextDate.format('YYYY-MM-DD')
      }));
    }
  }, [showAuctionModal]);

  // Add the auction booking handler
  const handleBookAuction = async () => {

    const errors = {};
    
    if (!auctionData.openingBid || auctionData.openingBid <= 0) {
      errors.openingBid = 'Opening bid is required and must be greater than 0';
    }
  
    if (!auctionData.auctionDate) {
      errors.auctionDate = 'Auction date is required';
    }
  
    setAuctionErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      try {

        const startTime = auction.Dealership.startTime || '08:00';
        const [hours, minutes] = startTime.split(':');
        
        const startDate = moment(auctionData.auctionDate)
          .set({ hours: parseInt(hours), minutes: parseInt(minutes), seconds: 0 });
        
        const durationHours = parseInt(auction.Dealership.durationHours, 10);
        const endDate = moment(startDate).add(durationHours, 'hours');
        
        const result = await dispatch(bookAuction({
          listingId: id,
          ...auctionData,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })).unwrap();
  
        if (result) {
          dispatch(fetchInventoryItem(id)); // Refresh the inventory item data
          setShowAuctionModal(false);
        }
      } catch (error) {
        console.error('Error booking auction:', error);
        setAuctionErrors({ submit: 'Failed to book auction. Please try again.' });
      }
    }
  };

  const AuctionDateRange = ({ selectedDate, onChange, auctionEventType, createdAt }) => {

    const today = moment().startOf('day');
    const [warning, setWarning] = useState('');
   
    // Get next valid start date considering auction start time
    const getNextValidStartDate = () => {
     
      const auctionStartTime = auction.Dealership.startTime || '08:00';
      const [hours, minutes] = auctionStartTime.split(':').map(Number);
      
      let nextDate = moment().add(1, 'day').hours(hours).minutes(minutes).seconds(0);
      
      // Ensure it doesn't fall on a weekend
      while (nextDate.day() === 0 || nextDate.day() === 6) {
        nextDate.add(1, 'day');
      }
    
      return nextDate;
    };    
  
    // Get the first available date based on auction type
    const getFirstAvailableDate = () => {
      let firstDate;
    
      switch (auctionEventType) {
        case 'Clearance': {
          firstDate = moment(createdAt).add(60, 'days').startOf('day');
          break;
        }
        case 'Black Friday': {
          firstDate = moment().month(10).startOf('month').startOf('day'); // November 1st
          break;
        }
        default: {
          firstDate = getNextValidStartDate();
          break;
        }
      }
    
      // Ensure the date does not start on a weekend
      while (firstDate.day() === 0 || firstDate.day() === 6) {
        firstDate.add(1, 'day');
      }
    
      return firstDate;
    };    
  
    // Get disabled dates with all restrictions
    const getDisabledDates = () => {
      const disabledDates = [];
      let currentDate = moment(today);
      const oneYearFromNow = moment(today).add(1, 'year');
    
      while (currentDate.isSameOrBefore(oneYearFromNow)) {
        // Disable weekends
        if (currentDate.day() === 0 || currentDate.day() === 6) {
          disabledDates.push(currentDate.toDate());
          currentDate.add(1, 'day');
          continue;
        }
    
        // Type-specific restrictions
        switch (auctionEventType) {
          case 'New Arrival': {
            const thirtyDaysFromCreation = moment(createdAt).add(30, 'days');
            if (currentDate.isAfter(thirtyDaysFromCreation)) {
              disabledDates.push(currentDate.toDate());
            }
            break;
          }
          case 'Clearance': {
            const sixtyDaysFromCreation = moment(createdAt).add(60, 'days');
            if (currentDate.isBefore(sixtyDaysFromCreation)) {
              disabledDates.push(currentDate.toDate());
            }
            break;
          }
          case 'Black Friday': {
            if (currentDate.month() !== 10) { // Ensure November only
              disabledDates.push(currentDate.toDate());
            }
            break;
          }
        }
    
        // Disable dates before next valid start
        if (currentDate.isBefore(getNextValidStartDate())) {
          disabledDates.push(currentDate.toDate());
        }
    
        currentDate.add(1, 'day');
      }
    
      return disabledDates;
    };    
  
    return (
      <div className="d-flex flex-column align-items-center">
        <div className={`auction-date-range`}>
          <DateRange
            onChange={item => {
              // Get the actual clicked date and ensure it's start of day
              const clickedDate = moment(item.selection.startDate).startOf('day');
              // Create the end date as the next day at start of day
              const nextDate = moment(clickedDate).add(1, 'day').startOf('day');
  
              // Check if end date would be Sunday
              if (nextDate.day() === 0) {
                setWarning('Cannot select this date as auction would end on Sunday');
                return;
              }
  
              onChange({
                startDate: clickedDate.toDate(),
                endDate: nextDate.toDate()
              });
              setWarning('');
            }}
            ranges={[{
              startDate: selectedDate ? moment(selectedDate).toDate() : getFirstAvailableDate().toDate(),
              endDate: selectedDate ? 
                moment(selectedDate).add(1, 'day').toDate() : 
                getFirstAvailableDate().add(1, 'day').toDate(),
              key: 'selection'
            }]}
            minDate={getNextValidStartDate().toDate()}
            maxDate={moment().add(1, 'year').toDate()}
            disabledDates={getDisabledDates()}
            months={1}
            direction="horizontal"
            rangeColors={['#0051ff']}
            showDateDisplay={true}
            staticRanges={[]}
            inputRanges={[]}
            showPreview={false}
          />
        </div>
        {warning && (
          <div className="text-danger mt-2">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {warning}
          </div>
        )}
      </div>
    );
  };
 
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
                                      </Col>)} 

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


                                    {id == "new" && ( <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Selling Price (R)</Form.Label>
                                        <InputGroup>
                                          <InputGroup.Text>R</InputGroup.Text>
                                          <Form.Control
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter price"
                                            value={inventoryItem.price || ""}
                                            isInvalid={inventoryErrors?.price}
                                            onChange={(e) => handleInputChange("price", e.target.value)}
                                            min="0"
                                          />
                                          {inventoryErrors?.price && (
                                        <Form.Control.Feedback type="invalid">
                                          {inventoryErrors.price}
                                        </Form.Control.Feedback>
                                        )}
                                        </InputGroup>                                        
                                      </FormGroup>
                                    </Col>)}

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
                                          checked={inventoryItem.manufacturerMaintenanceActive || false}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              // If turning on maintenance plan, turn off service plan
                                              handleInputChange('manufacturerServicePlanActive', false);
                                              handleInputChange('manufacturerServicePlanDes', '');
                                            }
                                            handleInputChange('manufacturerMaintenanceActive', e.target.checked);
                                          }}
                                        />
                                      </FormGroup>
                                      {inventoryItem.manufacturerMaintenanceActive && (
                                        <FormGroup className="form-group mt-2">
                                          <Form.Control
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 5 Years 100 000km"
                                            value={inventoryItem.manufacturerMaintenanceDes || ''}
                                            onChange={(e) => handleInputChange('manufacturerMaintenanceDes', e.target.value)}
                                            isInvalid={inventoryErrors?.manufacturerMaintenanceDes}
                                          />
                                          {inventoryErrors?.manufacturerMaintenanceDes && (
                                            <Form.Control.Feedback type="invalid">
                                              {inventoryErrors.manufacturerMaintenanceDes}
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
                                            isInvalid={inventoryErrors?.price}
                                            onChange={(e) => handleInputChange("price", e.target.value)}
                                            min="0"
                                          />
                                          {inventoryErrors?.price && (
                                        <Form.Control.Feedback type="invalid">
                                          {inventoryErrors.price}
                                        </Form.Control.Feedback>
                                        )}
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
                                          {!inventoryItem.price ? (
                                            <Alert variant="danger" className="mb-0">
                                              <i className="fa fa-info-circle me-2"></i>
                                              Cash charges will be available once a selling price is set
                                            </Alert>
                                          ) : extras?.filter(extra => extra.saleType === 'Cash').length > 0 ? (
                                            extras
                                              .filter(extra => extra.saleType === 'Cash')
                                              .map((extra) => (
                                                <div key={extra._id} className="mb-2">
                                                  <div className="custom-form-check form-check">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      id={`extra-${extra._id}`}
                                                      checked={extra.required || inventoryItem.cashExtras?.includes(extra._id)}
                                                      onChange={(e) => {
                                                        if (extra.required) return;
                                                        const updatedExtras = e.target.checked
                                                          ? [...(inventoryItem.cashExtras || []), extra._id]
                                                          : inventoryItem.cashExtras.filter(id => id !== extra._id);
                                                        handleInputChange('cashExtras', updatedExtras);
                                                      }}
                                                      disabled={extra.required}
                                                      style={{ marginTop: '3px' }}
                                                    />
                                                    <label 
                                                      className="form-check-label ms-2 d-flex justify-content-between align-items-center w-100" 
                                                      htmlFor={`extra-${extra._id}`}
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
                                              ))
                                          ) : (
                                            <div className="text-muted">No Cash charges available</div>
                                          )}
                                        </div>
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
                                      <FormGroup className="form-group">
                                        <Form.Label>Finance Charges</Form.Label>
                                        <div className="border rounded p-3">
                                          {!inventoryItem.price ? (
                                            <Alert variant="danger" className="mb-0">
                                              <i className="fa fa-info-circle me-2"></i>
                                              Finance charges will be available once a selling price is set
                                            </Alert>
                                          ) : extras?.filter(extra => extra.saleType === 'Finance').length > 0 ? (
                                            extras
                                              .filter(extra => extra.saleType === 'Finance')
                                              .map((extra) => (
                                                <div key={extra._id} className="mb-2">
                                                  <div className="custom-form-check form-check">
                                                    <input
                                                      type="checkbox"
                                                      className="form-check-input"
                                                      id={`extra-${extra._id}`}
                                                      checked={extra.required || inventoryItem.financeExtras?.includes(extra._id)}
                                                      onChange={(e) => {
                                                        if (extra.required) return;
                                                        const updatedExtras = e.target.checked
                                                          ? [...(inventoryItem.financeExtras || []), extra._id]
                                                          : inventoryItem.financeExtras.filter(id => id !== extra._id);
                                                        handleInputChange('financeExtras', updatedExtras);
                                                      }}
                                                      disabled={extra.required}
                                                      style={{ marginTop: '3px' }}
                                                    />
                                                    <label 
                                                      className="form-check-label ms-2 d-flex justify-content-between align-items-center w-100" 
                                                      htmlFor={`extra-${extra._id}`}
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
                                              ))
                                          ) : (
                                            <div className="text-muted">No Finance charges available</div>
                                          )}
                                        </div>
                                      </FormGroup>
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
                                          <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipCostingSave}>
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
                                <div className="mb-4 main-content-label text-primary">Status & Flags</div>

                                <Row className="mb-4">
                                  <Col xs={12}>
                                    <FormGroup className="form-group">
                                      <Form.Label>Current Status</Form.Label>
                                      <div className="border rounded p-3">
                                        <div className="d-flex flex-column gap-2">
                                          <Form.Check
                                            type="radio"
                                            id="status-available"
                                            name="status"
                                            label="Available"
                                            checked={!inventoryItem.isSold && 
                                                   !inventoryItem.isReserved && 
                                                   !inventoryItem.saleInProgress && 
                                                   !inventoryItem.isPreApproved}
                                            onChange={() => {
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                isSold: false,
                                                soldAt: null,
                                                isReserved: false,
                                                saleInProgress: false,
                                                isPreApproved: false,
                                                flagExpire: null
                                              }));
                                            }}
                                          />
                                          <Form.Check
                                            type="radio"
                                            id="status-sold"
                                            name="status"
                                            label="Sold"
                                            checked={inventoryItem.isSold}
                                            onChange={() => {
                                              const now = moment().format();
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                isSold: true,
                                                soldAt: now,
                                                isReserved: false,
                                                saleInProgress: false,
                                                isPreApproved: false,
                                                flagExpire: null
                                              }));
                                            }}
                                          />
                                          {inventoryItem.isSold && (
                                            <div className="ms-4 mt-2">
                                              <Form.Group>
                                                <Form.Label>Sold Date</Form.Label>
                                                <Form.Control
                                                  type="datetime-local"
                                                  value={inventoryItem.soldAt ? 
                                                    moment(inventoryItem.soldAt).format('YYYY-MM-DDTHH:mm') : 
                                                    moment().format('YYYY-MM-DDTHH:mm')}
                                                  onChange={(e) => {
                                                    const date = moment(e.target.value).format();
                                                    handleInputChange('soldAt', date);
                                                  }}
                                                />
                                              </Form.Group>
                                            </div>
                                          )}
                                          <Form.Check
                                            type="radio"
                                            id="status-reserved"
                                            name="status"
                                            label="Reserved"
                                            checked={inventoryItem.isReserved}
                                            onChange={() => {
                                              const expiryDate = moment().utc().add(organization?.flagExpireIn || 2, 'days').format();
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                isSold: false,
                                                soldAt: null,
                                                isReserved: true,
                                                saleInProgress: false,
                                                isPreApproved: false,
                                                flagExpire: expiryDate
                                              }));
                                            }}
                                          />
                                          <Form.Check
                                            type="radio"
                                            id="status-sale-in-progress"
                                            name="status"
                                            label="Sale in Progress"
                                            checked={inventoryItem.saleInProgress}
                                            onChange={() => {
                                              const expiryDate = new Date();
                                              expiryDate.setDate(expiryDate.getDate() + (organization?.flagExpireIn || 2));
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                isSold: false,
                                                soldAt: null,
                                                isReserved: false,
                                                saleInProgress: true,
                                                isPreApproved: false,
                                                flagExpire: expiryDate
                                              }));
                                            }}
                                          />
                                          <Form.Check
                                            type="radio"
                                            id="status-pre-approved"
                                            name="status"
                                            label="Pre-Approved"
                                            checked={inventoryItem.isPreApproved}
                                            onChange={() => {
                                              const expiryDate = new Date();
                                              expiryDate.setDate(expiryDate.getDate() + (organization?.flagExpireIn || 2));
                                              setInventoryItem(prev => ({
                                                ...prev,
                                                isSold: false,
                                                soldAt: null,
                                                isReserved: false,
                                                saleInProgress: false,
                                                isPreApproved: true,
                                                flagExpire: expiryDate
                                              }));
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </FormGroup>
                                  </Col>

                                  {/* Flag Expiry Date Override */}
                                  {(inventoryItem.isReserved || 
                                    inventoryItem.saleInProgress || 
                                    inventoryItem.isPreApproved) && (
                                    <Col xs={12} sm={12} md={6}>
                                      <FormGroup className="form-group">
                                        <Form.Label>Status Expiry Date</Form.Label>
                                        <Form.Control
                                          type="datetime-local"
                                          value={inventoryItem.flagExpire ? 
                                            moment(inventoryItem.flagExpire).utcOffset('+0200').format('YYYY-MM-DDTHH:mm') : 
                                            ''}
                                          onChange={(e) => {
                                            // Convert local time to UTC for storage
                                            const utcDate = moment(e.target.value).utc().format();
                                            handleInputChange('flagExpire', utcDate);
                                          }}
                                        />
                                        <small className="text-muted">
                                          Default expiry is {organization?.flagExpireIn || 2} days from now
                                        </small>
                                      </FormGroup>
                                    </Col>
                                  )}
                                </Row>

                                {/* Special Flags Section */}
                                <div className="mb-4">
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">
                                      Special Flags
                                      <OverlayTrigger placement="top" overlay={
                                        <Tooltip id="flags-tooltip">
                                          Add promotional flags like "Black Friday", "Special Offer", etc.
                                        </Tooltip>
                                      }>
                                        <i className="fa fa-info-circle text-muted ms-1" style={{ cursor: 'pointer' }}></i>
                                      </OverlayTrigger>
                                    </h6>
                                    <Button
                                      onClick={() => {
                                        const currentFlags = inventoryItem.flags || [];
                                        handleInputChange('flags', [...currentFlags, { text: '', colour: '#000000' }]);
                                      }}
                                      className="btn btn-primary btn-sm"
                                    >
                                      Add Flag
                                    </Button>
                                  </div>

                                  {inventoryItem?.flags?.length > 0 ? (
                                    inventoryItem.flags.map((flag, index) => (
                                      <Row key={index} className="mb-3 align-items-center">
                                        <Col xs={12} md={2} className="mb-2 mb-md-0">
                                          <span className="text-dark d-block d-md-none mb-1">Flag {index + 1}</span>
                                          <span className="text-dark d-none d-md-block">Flag {index + 1}</span>
                                        </Col>
                                        <Col xs={12} md={7} lg={8} className="mb-2 mb-md-0">
                                          <Form.Control
                                            type="text"
                                            placeholder="Enter flag text (e.g., Black Friday)"
                                            value={flag.text || ''}
                                            onChange={(e) => {
                                              const updatedFlags = [...inventoryItem.flags];
                                              updatedFlags[index] = {
                                                ...updatedFlags[index],
                                                text: e.target.value
                                                  .split(' ')
                                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                  .join(' ')
                                              };
                                              handleInputChange('flags', updatedFlags);
                                            }}
                                          />
                                        </Col>
                                        <Col xs={12} md={2} lg={1} className="mb-2 mb-md-0">
                                          <Form.Label className="d-block d-md-none mb-1">Color</Form.Label>
                                          <div className="d-flex align-items-center h-100">
                                            <Form.Control
                                              type="color"
                                              value={flag.colour || '#000000'}
                                              onChange={(e) => {
                                                const updatedFlags = [...inventoryItem.flags];
                                                updatedFlags[index] = {
                                                  ...updatedFlags[index],
                                                  colour: e.target.value
                                                };
                                                handleInputChange('flags', updatedFlags);
                                              }}
                                              className="form-control w-100"
                                              style={{ minHeight: '38px' }}
                                            />
                                          </div>
                                        </Col>
                                        <Col xs={12} md={1}>
                                          <Button
                                            variant="danger"
                                            onClick={() => {
                                              const updatedFlags = inventoryItem.flags.filter((_, i) => i !== index);
                                              handleInputChange('flags', updatedFlags);
                                            }}
                                            className="w-100 mt-2 mt-md-0"
                                          >
                                            <i className="fas fa-times"></i>
                                          </Button>
                                        </Col>
                                      </Row>
                                    ))
                                  ) : (
                                    <div className="text-muted">No special flags added.</div>
                                  )}
                                </div> 
                          
                                <div className="mb-4 main-content-label text-primary">Auction</div>

                                {/* Auction Section */}
                                <FormGroup className="form-group">
                                  <Form.Check
                                    type="switch"
                                    id="allowToSellOnAuction"
                                    label="Allow Auction"
                                    checked={inventoryItem.allowToSellOnAuction}
                                    onChange={(e) => handleInputChange('allowToSellOnAuction', e.target.checked)}
                                  />
                                </FormGroup>

                                {inventoryItem.allowToSellOnAuction && (
                                  <>
                                    <div className="mb-4">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">
                                          Auction Settings
                                          <OverlayTrigger placement="top" overlay={
                                            <Tooltip id="auction-tooltip">
                                              Book this item for an upcoming auction event
                                            </Tooltip>
                                          }>
                                            <i className="fa fa-info-circle text-muted ms-1" style={{ cursor: 'pointer' }}></i>
                                          </OverlayTrigger>
                                        </h6>
                                        <Button
                                          onClick={() => setShowAuctionModal(true)}
                                          className="btn btn-primary btn-sm"
                                        >
                                          Book Auction
                                        </Button>
                                      </div>

                                      {/* Auction History Table */}
                                      {inventoryItem.auctions?.length > 0 ? (
                                        <div className="table-responsive">
                                          <table className="table border text-nowrap">
                                            <thead>
                                              <tr>
                                                <th className="border-bottom-0">Event Type</th>
                                                <th className="border-bottom-0">Type</th>
                                                <th className="border-bottom-0">Start Date</th>
                                                <th className="border-bottom-0">End Date</th>
                                                <th className="border-bottom-0 text-end">Opening Bid</th>
                                                <th className="border-bottom-0 text-end">Current Bid</th>
                                                <th className="border-bottom-0 text-center">Status</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {inventoryItem.auctions.map((auction, index) => (
                                                <tr key={index}>
                                                  <td>{auction.title}</td>
                                                  <td>{auction.auctionType}</td>
                                                  <td>{moment(auction.startDate).format('DD MMM YYYY HH:mm')}</td>
                                                  <td>{moment(auction.endDate).format('DD MMM YYYY HH:mm')}</td>
                                                  <td className="text-end">R {auction.openingBid?.toLocaleString()}</td>
                                                  <td className="text-end">
                                                    {auction.currentBid ? `R ${auction.currentBid?.toLocaleString()}` : '-'}
                                                  </td>
                                                  <td className="text-center">
                                                    {auction.auctionEnded ? (
                                                      <Badge bg="danger">Ended</Badge>
                                                    ) : auction.auctionStarted ? (
                                                      <Badge bg="success">Active</Badge>
                                                    ) : (
                                                      <Badge bg="warning">Scheduled</Badge>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      ) : (
                                        <Alert variant="info">
                                          No auction history available for this item.
                                        </Alert>
                                      )}

                                      {/* Auction Booking Modal */}
                                      <Modal
                                        show={showAuctionModal}
                                        onHide={() => setShowAuctionModal(false)}
                                        backdrop="static"
                                        keyboard={false}
                                      >
                                        <Modal.Header closeButton>
                                          <Modal.Title>Book Auction</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                          <Form>
                                          <Form.Group className="mb-3">
                                              <Form.Label>Opening Bid</Form.Label>
                                                <InputGroup>
                                                  <InputGroup.Text>R</InputGroup.Text>
                                                  <Form.Control
                                                    type="number"
                                                    placeholder="Enter opening bid"
                                                    value={auctionData.openingBid}
                                                    onChange={(e) => setAuctionData(prev => ({
                                                      ...prev,
                                                      openingBid: e.target.value
                                                    }))}
                                                    isInvalid={auctionErrors.openingBid}
                                                  />
                                                  <Form.Control.Feedback type="invalid">
                                                    {auctionErrors.openingBid}
                                                  </Form.Control.Feedback>                                                  
                                                </InputGroup>
                                                <small className="text-muted d-block mt-1">                                                  
                                                      Selling Price: <strong>R {inventoryItem.price.toLocaleString()}</strong>
                                                    </small>
                                              </Form.Group>

                                              <Form.Group className="mb-3">
  <Form.Label>Event Type</Form.Label>
  <Form.Select
    value={auctionData.auctionEventType}
    onChange={(e) => {
      setAuctionData(prev => ({
        ...prev,
        auctionEventType: e.target.value,
        auctionDate: null // Reset date when type changes
      }));
    }}
    isInvalid={auctionErrors.auctionEventType}
  >
    {auction.Dealership
      .filter(type => type.enabled)
      .map((type, index) => (
        <option key={index} value={type.name}>{type.name}</option>
    ))}
  </Form.Select>
  <Form.Text className="text-muted">
    {(() => {
      const createdDate = new Date(inventoryItem.createdAt);
      const daysSinceCreation = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
      
      switch (auctionData.auctionEventType) {
        case 'New Arrival':
          return `Available within first 30 days (${30 - daysSinceCreation} days remaining)`;
        case 'Clearance':
          return `Available after 60 days (${Math.max(0, 60 - daysSinceCreation)} days until available)`;
        case 'Black Friday':
          return 'Only available in November';
        case 'Easter':
          return 'Only available during Easter period';
        case 'Holiday':
          return 'Only available during holiday periods';
        default:
          return 'Available on configured days';
      }
    })()}
  </Form.Text>

</Form.Group>

                                              <Form.Group className="mb-3">
                                                <Form.Label>Event Type</Form.Label>
                                                <Form.Select
                                                  value={auctionData.auctionEventType}
                                                  onChange={(e) => {
                                                    setAuctionData(prev => ({
                                                      ...prev,
                                                      auctionEventType: e.target.value,
                                                      auctionDate: null // Reset date when type changes
                                                    }));
                                                  }}
                                                  isInvalid={auctionErrors.auctionEventType}
                                                >
                                                  <option value="Regular">Regular Auction</option>
                                                  <option value="New Arrival">New Arrival</option>
                                                  <option value="Clearance">Clearance</option>
                                                  <option value="Black Friday">Black Friday</option>
                                                </Form.Select>
                                                <Form.Text className="text-muted">
                                                  {(() => {
                                                    const createdDate = new Date(inventoryItem.createdAt);
                                                    const daysSinceCreation = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
                                                    
                                                    switch (auctionData.auctionEventType) {
                                                      case 'New Arrival':
                                                        return `Available within first 30 days (${30 - daysSinceCreation} days remaining)`;
                                                      case 'Clearance':
                                                        return `Available after 60 days (${Math.max(0, 60 - daysSinceCreation)} days until available)`;
                                                      case 'Black Friday':
                                                        return 'Only available in November';
                                                      default:
                                                        return 'Available on all dates except weekends';
                                                    }
                                                  })()}
                                                </Form.Text>
                                              </Form.Group>

                                              <Form.Group className="mb-3">
                                              <Form.Label>Auction Date</Form.Label>
                                              <AuctionDateRange
                                                selectedDate={auctionData.auctionDate ? moment(auctionData.auctionDate).toDate() : null}
                                                onChange={(dateRange) => {
                                                  setAuctionData(prev => ({
                                                    ...prev,
                                                    auctionDate: moment(dateRange.startDate).format('YYYY-MM-DD')
                                                  }));
                                                }}
                                                auctionEventType={auctionData.auctionEventType}
                                                createdAt={moment(inventoryItem.createdAt).toDate()}
                                              />
                                              <Form.Text className="text-muted">
                                                {auctionData.auctionDate && (() => {
                                                  const { startDay, startTime, endDay, endTime } = calculateAuctionTimes(auctionData.auctionDate);
                                                  const daysUntil = moment(auctionData.auctionDate).startOf('day').diff(moment().startOf('day'), 'days');

                                                  return `Auction will start in ${daysUntil} days on ${startDay} at ${startTime} and end on ${endDay} at ${endTime}`;
                                                })()}
                                              </Form.Text>
                                              {auctionErrors?.auctionDate && (
                                                <div className="invalid-feedback d-block">
                                                  {auctionErrors.auctionDate}
                                                </div>
                                              )}
                                            </Form.Group>


                                            <Form.Group className="mb-3">
                                              <Form.Label>Auction Type</Form.Label>
                                              <Form.Select
                                                value={auctionData.auctionType}
                                                onChange={(e) => setAuctionData(prev => ({
                                                  ...prev,
                                                  auctionType: e.target.value
                                                }))}
                                                isInvalid={auctionErrors.auctionType}
                                              >
                                                <option value="Public">Public Auction</option>
                                                <option value="Dealers">Dealers Only</option>
                                              </Form.Select>
                                              <Form.Control.Feedback type="invalid">
                                                {auctionErrors.auctionType}
                                              </Form.Control.Feedback>
                                            </Form.Group>
                                          </Form>
                                        </Modal.Body>
                                        <Modal.Footer>
                                          <Button variant="secondary" onClick={() => setShowAuctionModal(false)}>
                                            Cancel
                                          </Button>
                                          <Button variant="primary" onClick={handleBookAuction}>
                                            Book Auction
                                          </Button>
                                        </Modal.Footer>
                                      </Modal>
                                    </div>
                                  </>
                                )}

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
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter minimum offer to auto-reject"
                                        value={inventoryItem.autoRejectMinOffer || ''}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/[^\d]/g, '');
                                          handleInputChange('autoRejectMinOffer', value ? parseInt(value) : '');
                                        }}
                                        disabled={!inventoryItem.price || inventoryItem.price <= 0}
                                      />
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
                                      <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipMarketSave}>
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
                                    <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleDealershipMediaSave}>
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
