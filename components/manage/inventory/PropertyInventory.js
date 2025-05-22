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
import { Info } from 'lucide-react';
import Holidays from 'date-holidays';

const PropertyInventory = ({ id, type, router }) => {

  const dispatch = useDispatch();

  const { item, loading } = useSelector((state) => state.inventory);
  const { organization } = useSelector((state) => state.organization);

  console.log('type',organization?.type);

  const [inventoryErrors, setInventoryErrors] = useState({});
  const [inventoryItem, setInventoryItem] = useState({});

  useEffect(() => {
     id !== 'new' && dispatch(fetchInventoryItem(id));
  }, [id]);

  useEffect(() => {
    item && setInventoryItem(item);
  }, [item]);

  // Handle input changes for form fields
  const handleInputChange = (field, value) => {
    // Get the complete category structure
    const categoryPath = categories[organization?.type]?.subcategories
      .find(cat => (cat.label || cat) === inventoryItem.subcategory);
  
    // Get attributes from current level
    let allAttributes = [];
    
    // Add main category attributes
    if (categoryPath?.attributes) {
      allAttributes = [...allAttributes, ...categoryPath.attributes];
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

    // Validate price based on listing type
    if (id === "new") {
      if (inventoryItem.listingType === "Buy" || inventoryItem.listingType === "Buy & Rent") {
        if (!inventoryItem.price || inventoryItem.price <= 0) {
          errors.price = 'Price is required and must be greater than 0';
        }
      }
      if (inventoryItem.listingType === "Rent" || inventoryItem.listingType === "Buy & Rent") {
        if (!inventoryItem.rental || inventoryItem.rental <= 0) {
          errors.rental = 'Rental price is required and must be greater than 0';
        }
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
    }
  };

  const getAttributes = () => {

    if (!categories.Property) return [];

    const categoryPath = categories.Property.subcategories.find(cat => (cat.label || cat) === inventoryItem.subcategory);

    if (!categoryPath?.attributes) return [];
    
    return categoryPath.attributes;
  };

  const renderAttributeField = (attribute) => {
    const { key, type, label, placeholder, disabled, options } = attribute;

    const commonProps = {
      className: "form-control",
      placeholder,
      value: inventoryItem[key] || '',
      onChange: (e) => handleInputChange(key, type === 'checkbox' ? e.target.checked : e.target.value),
      isInvalid: inventoryErrors?.[key],
      disabled: disabled || !inventoryItem.subcategory
    };

    if (type === 'select') {
      return (
        <Form.Select {...commonProps}>
          <option value="">{placeholder}</option>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </Form.Select>
      );
    }

    if (type === 'checkbox') {
      return (
        <Form.Check
          type="switch"
          id={key}
          label={label}
          checked={inventoryItem[key] || false}
          onChange={(e) => handleInputChange(key, e.target.checked)}
        />
      );
    }

    if (type === 'hidden') {
      return null;
    }

    return <Form.Control type={type} {...commonProps} />;
  };

  const handleConditionSave = async () => {}

  const handleMarketSave = async () => {
    const errors = {};
  
    // If onSpecial, ensure onSpecialName is non-empty
    if (inventoryItem.onSpecial) {
      if (!inventoryItem.onSpecialName || !inventoryItem.onSpecialName.trim()) {
        errors.onSpecialName = 'Please provide a valid name for the special.';
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
  
    setInventoryErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      try {
        await dispatch(saveInventoryItem({ inventoryItem, id })).unwrap();
      } catch (error) {
        console.error('Error saving market details:', error);
      }
    } else {
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

  //AUCTION 
  const [showAuctionModal, setShowAuctionModal] = useState(false);
 
  function BookAuctionModal({show,onHide,inventoryItem, id }) {
    // -------------------------------
    // State
    // -------------------------------
    const [auctionData, setAuctionData] = useState({
      openingBid: '',
      auctionType: 'Regular', // Default to Regular
      auctionDate: null,
    });
    const [auctionErrors, setAuctionErrors] = useState({ openingBid: '' });
    const [warning, setWarning] = useState('');
  
    // Redux
    const dispatch = useDispatch();
  
    // date-holidays for ZA
    const hd = new Holidays('ZA');
  
    useEffect(() => {
      if (show) {
        setAuctionData({ openingBid: '', auctionType: 'Regular', auctionDate: null });
        setAuctionErrors({ openingBid: '' });
        setWarning('');
      }
    }, [show]);
  
    // ------------------------------------------------------------------
    // 1) Build a custom holiday list: second Monday for Xmas, Jan 2 for NY
    //    *Memoized* so it only recalculates when `show` changes
    //    (i.e. each time the modal opens), rather than on every keystroke.
    // ------------------------------------------------------------------
    const holidaysList = useMemo(() => {
      // Same function as before, just embedded here
      function getCustomHolidays(year) {
        const raw = hd.getHolidays(year).map((h) => ({
          date: moment(h.date).format('YYYY-MM-DD'),
          name: h.name,
          type: h.type,
        }));
  
        // remove standard Xmas, Goodwill, NewYear
        let filtered = raw.filter(
          (h) =>
            !['Christmas Day', 'Day of Goodwill', "New Year's Day"].includes(h.name)
        );
  
        // Xmas => 2nd Monday in Dec
        let decDay = moment(`${year}-12-01`);
        while (decDay.day() !== 1) {
          decDay.add(1, 'day');
        }
        decDay.add(7, 'days'); // now second Monday
        filtered.push({
          date: decDay.format('YYYY-MM-DD'),
          name: 'Christmas Day',
          type: 'holiday',
        });
  
        // New Year => Jan 2
        filtered.push({
          date: moment(`${year}-01-02`).format('YYYY-MM-DD'),
          name: "New Year's Day",
          type: 'holiday',
        });
  
        // shift Sunday => Monday
        const final = filtered.map((hol) => {
          const d = moment(hol.date, 'YYYY-MM-DD');
          if (d.day() === 0) {
            d.add(1, 'day');
          }
          return { ...hol, date: d.format('YYYY-MM-DD') };
        });
        return final;
      }
  
      const currentYear = moment().year();
      const nextYear = currentYear + 1;
  
      const thisYear = getCustomHolidays(currentYear);
      const nextYearHols = getCustomHolidays(nextYear);
      const combined = [...thisYear, ...nextYearHols];
  
      // remove duplicates
      const unique = combined.reduce((acc, h) => {
        if (!acc.find((x) => x.date === h.date)) acc.push(h);
        return acc;
      }, []);
  
      // filter out past, sort ascending
      const futureOrToday = unique.filter((h) =>
        moment(h.date).isSameOrAfter(moment(), 'day')
      );
      futureOrToday.sort((a, b) => moment(a.date).diff(moment(b.date)));
      return futureOrToday;
    }, [show]); 
    // Recompute each time the modal opens; 
    // you can adjust if you want it more/less frequent.
  
    // Check if a Date is in that holiday list
    function isPublicHoliday(date) {
      const dateStr = moment(date).format('YYYY-MM-DD');
      return !!holidaysList.find((h) => h.date === dateStr);
    }
  
    // ------------------------------------------------------------------
    // 2) Black Friday (4th Friday in Nov). Memoize it the same way
    // ------------------------------------------------------------------
    const blackFridayDate = useMemo(() => {
      function findBF(year) {
        let d = moment(`${year}-11-01`);
        let count = 0;
        while (d.month() === 10) {
          if (d.day() === 5) {
            count++;
            if (count === 4) return d;
          }
          d.add(1, 'day');
        }
        return null;
      }
  
      const now = moment();
      const bfThisYear = findBF(now.year());
      if (bfThisYear && bfThisYear.isSameOrAfter(now, 'day')) {
        if (bfThisYear.day() === 0) bfThisYear.add(1, 'day');
        return bfThisYear;
      } else {
        const bfNextYear = findBF(now.year() + 1);
        if (bfNextYear) {
          if (bfNextYear.day() === 0) bfNextYear.add(1, 'day');
          return bfNextYear;
        }
        return null;
      }
    }, [show]);
  
    // Are we dealing with Xmas or New Year specifically
    function isXmasOrNewYear(name) {
      return name === 'Christmas Day' || name === "New Year's Day";
    }
  
    // ------------------------------------------------------------------
    // 3) calculateAuctionTimes (unchanged logic)
    // ------------------------------------------------------------------
    function calculateAuctionTimes(auctionDate, auctionType, config) {
      if (!auctionDate || !config) return '';
  
      let startMoment, endMoment;
      let holidayAdjusted = false;
      const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
      ];
  
      if (auctionType === 'Holiday') {
        const holidayObj = holidaysList.find((h) => h.date === auctionDate);
        const holidayName = holidayObj ? holidayObj.name : '';
        const holidayDate = moment(auctionDate);
        const dow = holidayDate.day();
  
        if (isXmasOrNewYear(holidayName)) {
          startMoment = holidayDate.set({
            hour: parseInt(config.Dealership.startTime.split(':')[0], 10),
            minute: parseInt(config.Dealership.startTime.split(':')[1], 10),
            second: 0,
          });
          endMoment = moment(startMoment).add(config.Dealership.holidayDurationHours, 'hours');
        } else if (dow === 1) {
          endMoment = holidayDate
            .add(1, 'days')
            .set({
              hour: parseInt(config.Dealership.holidayEndTime.split(':')[0], 10),
              minute: parseInt(config.Dealership.holidayEndTime.split(':')[1], 10),
              second: 0,
            });
          startMoment = moment(endMoment).subtract(config.Dealership.holidayDurationHours, 'hours');
        } else {
          endMoment = holidayDate.set({
            hour: parseInt(config.Dealership.holidayEndTime.split(':')[0], 10),
            minute: parseInt(config.Dealership.holidayEndTime.split(':')[1], 10),
            second: 0,
          });
          startMoment = moment(endMoment).subtract(config.Dealership.holidayDurationHours, 'hours');
        }
      } else if (auctionType === 'Black Friday') {
        const bf = moment(auctionDate).set({
          hour: parseInt(config.Dealership.startTime.split(':')[0], 10),
          minute: parseInt(config.Dealership.startTime.split(':')[1], 10),
          second: 0,
        });
        startMoment = bf;
        endMoment = moment(bf).add(config.Dealership.durationHours, 'hours');
      } else {
        // Non-holiday
        startMoment = moment(auctionDate).set({
          hour: parseInt(config.Dealership.startTime.split(':')[0], 10),
          minute: parseInt(config.Dealership.startTime.split(':')[1], 10),
          second: 0,
        });
        endMoment = moment(startMoment).add(config.Dealership.durationHours, 'hours');
  
        while (isPublicHoliday(startMoment.toDate()) || isPublicHoliday(endMoment.toDate())) {
          startMoment = startMoment.subtract(1, 'days');
          endMoment = moment(startMoment).add(config.Dealership.durationHours, 'hours');
          holidayAdjusted = true;
        }
      }
  
      return {
        startDay: days[startMoment.day()],
        startTime: startMoment.format('HH:mm'),
        endDay: days[endMoment.day()],
        endTime: endMoment.format('HH:mm'),
        startDate: startMoment.toDate(),
        endDate: endMoment.toDate(),
        error: holidayAdjusted
          ? 'Holiday auctions are available, but the times have been adjusted to avoid public holidays.'
          : ''
      };
    }
  
    // ------------------------------------------------------------------
    // 4) getFirstAvailableDateByType (unchanged, just references blackFridayDate)
    // ------------------------------------------------------------------
    function getFirstAvailableDateByType(type) {
      const createdAt = moment(inventoryItem?.createdAt || undefined);
  
      function getNextValidStartDate() {
        const [h, m] = auction.Dealership.startTime.split(':').map(Number);
        let d = moment().add(1, 'day').hour(h).minute(m).second(0);
        while (d.day() === 0 || d.day() === 6) {
          d.add(1, 'day');
        }
        return d;
      }
  
      if (type === 'Black Friday') {
        return blackFridayDate || null;
      }
  
      let firstDate;
      switch (type) {
        case 'New Arrival': {
          firstDate = moment(createdAt);
          if (moment().diff(firstDate, 'days') > 30) {
            firstDate = null;
          }
          break;
        }
        case 'Clearance': {
          firstDate = moment(createdAt).add(60, 'days');
          if (moment().isAfter(firstDate)) {
            firstDate = moment();
          }
          break;
        }
        case 'Holiday':
          return null; // We'll pick earliest holiday in the dropdown
        default:
          // e.g. Regular, Dealers Only
          firstDate = getNextValidStartDate();
      }
  
      if (!firstDate || firstDate.isBefore(moment(), 'day')) {
        firstDate = getNextValidStartDate();
      }
      while (firstDate.day() === 0 || firstDate.day() === 6) {
        firstDate.add(1, 'day');
      }
      return firstDate;
    }
  
    // ------------------------------------------------------------------
    // AuctionTypeSelect
    // ------------------------------------------------------------------
    function AuctionTypeSelect() {
      // main type changes
      function handleMainTypeChange(newType) {
        if (!newType) {
          setAuctionData({ ...auctionData, auctionType: 'Regular', auctionDate: null });
          setWarning('');
          return;
        }
  
        if (newType === 'Holiday') {
          if (holidaysList.length > 0) {
            const firstHol = holidaysList[0];
            const times = calculateAuctionTimes(firstHol.date, 'Holiday', auction);
            setAuctionData({
              ...auctionData,
              auctionType: 'Holiday',
              auctionDate: firstHol.date,
              startDate: times.startDate,
              endDate: times.endDate,
            });
            setWarning(times.error || '');
          } else {
            setAuctionData({
              ...auctionData,
              auctionType: 'Holiday',
              auctionDate: null,
            });
            setWarning('');
          }
        } else if (newType === 'Black Friday') {
          if (blackFridayDate) {
            const bfStr = blackFridayDate.format('YYYY-MM-DD');
            const times = calculateAuctionTimes(bfStr, 'Black Friday', auction);
            setAuctionData({
              ...auctionData,
              auctionType: 'Black Friday',
              auctionDate: bfStr,
              startDate: times.startDate,
              endDate: times.endDate,
            });
            setWarning(times.error || '');
          } else {
            setAuctionData({
              ...auctionData,
              auctionType: 'Black Friday',
              auctionDate: null,
            });
            setWarning('');
          }
        } else {
          const firstDate = getFirstAvailableDateByType(newType);
          if (firstDate) {
            const dateStr = firstDate.format('YYYY-MM-DD');
            const times = calculateAuctionTimes(dateStr, newType, auction);
            setAuctionData({
              ...auctionData,
              auctionType: newType,
              auctionDate: dateStr,
              startDate: times.startDate,
              endDate: times.endDate,
            });
            setWarning(times.error || '');
          } else {
            setAuctionData({
              ...auctionData,
              auctionType: newType,
              auctionDate: null,
            });
            setWarning('');
          }
        }
      }
  
      // If user picks a different holiday from the dropdown
      function handleHolidaySelect(dateStr) {
        const times = calculateAuctionTimes(dateStr, 'Holiday', auction);
        setAuctionData((prev) => ({
          ...prev,
          auctionType: 'Holiday',
          auctionDate: dateStr,
          startDate: times.startDate,
          endDate: times.endDate,
        }));
        setWarning(times.error || '');
      }
  
      return (
        <>
          <Form.Select
            value={auctionData.auctionType}
            onChange={(e) => handleMainTypeChange(e.target.value)}
            className="mb-3"
          >
            {auction.Dealership.types
              .filter((t) => t.enabled)
              .map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
          </Form.Select>
  
          {auctionData.auctionType === 'Holiday' && holidaysList.length > 0 && (
            <Form.Select
              className="mt-2"
              value={auctionData.auctionDate || ''}
              onChange={(e) => handleHolidaySelect(e.target.value)}
            >
              {holidaysList.map((h) => (
                <option key={h.date} value={h.date}>
                  {h.name} ({moment(h.date).format('DD MMM YYYY')})
                </option>
              ))}
            </Form.Select>
          )}
        </>
      );
    }
  
    // ------------------------------------------------------------------
    // AuctionDateRange
    //   * We memoize building the disabledDates array to reduce re-renders
    // ------------------------------------------------------------------
    function AuctionDateRange() {
      // Determine start/end for the DateRange
      let startDate, endDate;
      if (auctionData.auctionType && auctionData.auctionDate) {
        const times = calculateAuctionTimes(
          auctionData.auctionDate,
          auctionData.auctionType,
          auction
        );
        startDate = times.startDate;
        endDate = times.endDate;
      } else {
        const firstAvail = getFirstAvailableDateByType(auctionData.auctionType);
        if (firstAvail) {
          startDate = firstAvail.toDate();
          endDate = moment(firstAvail).add(1, 'day').toDate();
        } else {
          startDate = moment().toDate();
          endDate = moment().add(1, 'day').toDate();
        }
      }
  
      // We'll define the function but memoize the result
      const disabledDates = useMemo(() => {
        const createdAt = moment(inventoryItem?.createdAt || undefined);
        const list = [];
        let currentDate = moment();
        const oneYearFromNow = moment().add(1, 'year');
  
        while (currentDate.isSameOrBefore(oneYearFromNow, 'day')) {
          const check = currentDate.clone();
  
          // skip weekends if not holiday or BF
          if (
            auctionData.auctionType !== 'Holiday' &&
            auctionData.auctionType !== 'Black Friday' &&
            (check.day() === 0 || check.day() === 6)
          ) {
            list.push(check.toDate());
            currentDate.add(1, 'day');
            continue;
          }
  
          const holiday = isPublicHoliday(check.toDate());
          switch (auctionData.auctionType) {
            case 'Holiday':
              if (!holiday || check.day() === 0) {
                list.push(check.toDate());
              }
              break;
            case 'Black Friday': {
              const bfStr = blackFridayDate
                ? blackFridayDate.format('YYYY-MM-DD')
                : null;
              if (!bfStr || bfStr !== check.format('YYYY-MM-DD')) {
                list.push(check.toDate());
              }
              break;
            }
            case 'New Arrival': {
              if (moment(createdAt).add(30, 'days').isBefore(check)) {
                list.push(check.toDate());
              }
              if (holiday) {
                list.push(check.toDate());
              }
              break;
            }
            case 'Clearance': {
              const earliest = moment(createdAt).add(60, 'days');
              if (
                check.isBefore(earliest, 'day') ||
                check.day() === 0 ||
                check.day() === 6 ||
                holiday
              ) {
                list.push(check.toDate());
              }
              break;
            }
            default:
              // e.g. Regular, Dealers Only
              if (holiday) {
                list.push(check.toDate());
              }
          }
          currentDate.add(1, 'day');
        }
  
        return list;
      }, [
        auctionData.auctionType,
        inventoryItem,
        blackFridayDate,
        isPublicHoliday,
      ]);
  
      // If user clicks in the calendar
      function handleCalendarChange(item) {
        const clicked = moment(item.selection.startDate).startOf('day');
        const clickedStr = clicked.format('YYYY-MM-DD');
  
        const times = calculateAuctionTimes(clickedStr, auctionData.auctionType, auction);
        setWarning(times.error);
  
        if (auctionData.auctionType === 'Holiday') {
          // must be a holiday to be valid, but we won't block user from selecting
          setAuctionData((prev) => ({ ...prev, auctionDate: clickedStr }));
        } else if (auctionData.auctionType === 'Black Friday') {
          // if user picks the BF date
          if (
            blackFridayDate &&
            blackFridayDate.format('YYYY-MM-DD') === clickedStr
          ) {
            setAuctionData((prev) => ({ ...prev, auctionDate: clickedStr }));
          } else {
            setAuctionData((prev) => ({ ...prev, auctionDate: clickedStr }));
          }
        } else {
          setAuctionData((prev) => ({ ...prev, auctionDate: clickedStr }));
        }
      }
  
      return (
        <div className="d-flex flex-column align-items-center">
          <div className="auction-date-range">
            <DateRange
              onChange={(item) => handleCalendarChange(item)}
              ranges={[
                {
                  startDate,
                  endDate,
                  key: 'selection',
                },
              ]}
              minDate={moment().add(1, 'day').toDate()}
              maxDate={moment().add(1, 'year').toDate()}
              disabledDates={disabledDates}
              months={1}
              direction="horizontal"
              rangeColors={['#0051ff']}
              showDateDisplay={true}
              staticRanges={[]}
              inputRanges={[]}
              showPreview={false}
              // color holiday text in red
              dayContentRenderer={(date) => {
                const holiday = isPublicHoliday(date);
                return (
                  <div style={{ color: holiday ? 'red' : 'black' }}>
                    {date.getDate()}
                  </div>
                );
              }}
            />
          </div>
          {warning && (
            <div className="text-danger mt-2 text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {warning}
            </div>
          )}
        </div>
      );
    }
  
    // ------------------------------------------------------------------
    // 5) Book Auction => also dispatch Redux (bookAuction)
    // ------------------------------------------------------------------
    async function handleBookAuction() {
      // Basic validation
      if (!auctionData.openingBid) {
        setAuctionErrors((prev) => ({
          ...prev,
          openingBid: 'Opening bid required.',
        }));
        return;
      }
      if (!auctionData.auctionType) {
        alert('Please select an event type.');
        return;
      }
      if (!auctionData.auctionDate) {
        alert('Please select an auction date.');
        return;
      }

      // 1) Calculate the actual start/end from your existing logic
      const times = calculateAuctionTimes(
        auctionData.auctionDate,
        auctionData.auctionType,
        auction
      );

      // 2) Build a descriptive title
      let customTitle = '';

      if (auctionData.auctionType === 'Holiday') {
        // Find the holiday's name from your holiday list
        // e.g. if you have a function or a list you can do:
        const holidayObj = holidaysList.find(
          (h) => h.date === moment(auctionData.auctionDate).format('YYYY-MM-DD')
        );
        // If found, use holiday name; else fallback
        customTitle = holidayObj ? holidayObj.name : 'Holiday';
      } else {
        // Non-holiday => do a date range
        const startDayMonth = moment(times.startDate).format('D MMM');
        const endDayMonth = moment(times.endDate).format('D MMM');

        if (startDayMonth === endDayMonth) {
          // single day
          customTitle = `${startDayMonth}`;
        } else {
          // range
          customTitle = `${startDayMonth} - ${endDayMonth}`;
        }
      }

      // 3) Build the payload (only one item)
      const payload = {
        title: customTitle,
        auctionType: auctionData.auctionType,
        startDate: times.startDate,
        endDate: times.endDate,
        item: {       
          openingBid: parseInt(auctionData.openingBid, 10),
          currentBid: 0,
        },
      };

      // 4) Dispatch and only close the modal if success
      try {
        await dispatch(bookAuction({ payload, id })).unwrap();
        onHide();
      } catch (error) {  
        console.error('Booking auction failed:', error);
      }
    }
  
    // ------------------------------------------------------------------
    // Help text
    // ------------------------------------------------------------------
    function getHelpTextForType(type) {
      switch (type) {
        case 'Regular':
          return 'Select from available dates (excluding Sundays and public holidays).';
        case 'New Arrival':
          return 'Within the first 30 days of creation, excluding Sundays and public holidays.';
        case 'Clearance':
          return 'Only available after 60 days from creation, excluding Sundays and public holidays.';
        case 'Black Friday':
          return 'A single event each year on the fourth Friday of November.';
        case 'Dealers Only':
          return 'Exclusively for dealers, excluding Sundays and public holidays.';
        case 'Holiday':
          return 'Pick from upcoming public holidays for a holiday-specific auction.';
        default:
          return 'Select from available dates excluding Sundays and public holidays.';
      }
    }
  
    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
      <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Book Auction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Opening Bid */}
            <Form.Group className="mb-3">
              <Form.Label>Opening Bid</Form.Label>
              <InputGroup>
                <InputGroup.Text>R</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Enter opening bid"
                  value={auctionData.openingBid}
                  onChange={(e) =>
                    setAuctionData((prev) => ({
                      ...prev,
                      openingBid: e.target.value,
                    }))
                  }
                  isInvalid={!!auctionErrors.openingBid}
                />
                <Form.Control.Feedback type="invalid">
                  {auctionErrors.openingBid}
                </Form.Control.Feedback>
              </InputGroup>
              {inventoryItem?.price && (
                <small className="text-muted d-block mt-1">
                  Selling Price: <strong>R {inventoryItem.price.toLocaleString()}</strong>
                </small>
              )}
            </Form.Group>
  
            {/* Event Type */}
            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <AuctionTypeSelect />
              <Form.Text className="text-muted">
                {getHelpTextForType(auctionData.auctionType)}
              </Form.Text>
            </Form.Group>
  
            {/* Auction Date */}
            <Form.Group className="mb-3">
              <Form.Label>Auction Date</Form.Label>
              <AuctionDateRange />
              {auctionData.auctionDate && (
                <Form.Text className="text-muted">
                  {(() => {
                    const times = calculateAuctionTimes(
                      auctionData.auctionDate,
                      auctionData.auctionType,
                      auction
                    );
                    if (times.error) return times.error;
  
                    const daysUntil = moment(auctionData.auctionDate)
                      .startOf('day')
                      .diff(moment().startOf('day'), 'days');
                    return `Auction will start in ${daysUntil} day${
                      daysUntil === 1 ? '' : 's'
                    } on ${times.startDay} at ${times.startTime} and end on ${
                      times.endDay
                    } at ${times.endTime}.`;
                  })()}
                </Form.Text>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBookAuction}>
            Book Auction
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function AuctionHistoryTable({ inventoryItem, loading, id }) {
    
    const dispatch = useDispatch();
  
    // Handle the delete
    const handleDelete = async (auctionId) => {
      if (!auctionId) return;  
      try {
        await dispatch(deleteAuction({ auctionId, id })).unwrap();  
      } catch (err) {
        console.error(err);
        alert("Failed to delete auction.");
      }
    };
  
    if (!inventoryItem?.auctions?.length) {
      return (
        <Alert variant="info">
          No auctions booked for this item.
        </Alert>
      );
    }
  
    return (
      <div className="table-responsive">
         <Table className="table border text-nowrap">
          <thead>
            <tr>
              <th>Title</th>
              <th className="d-none d-md-table-cell text-center">Type</th>
              <th className="d-none d-md-table-cell text-center">Starting At</th>
              <th className="d-none d-md-table-cell text-center">Ending At</th>
              <th className="d-none d-lg-table-cell text-center">Opening Bid</th>
              <th className="d-none d-lg-table-cell text-center">Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItem.auctions.map((auction, index) => {
              const openingBid = auction.openingBid;
              const start = moment(auction.startDate).local().format("HH:mm");
              const end = moment(auction.endDate).local().format("HH:mm");

              let statusBadge = <Badge bg="warning">Scheduled</Badge>;
              if (auction.auctionEnded) {
                statusBadge = <Badge bg="danger">Ended</Badge>;
              } else if (auction.auctionStarted) {
                statusBadge = <Badge bg="success">Active</Badge>;
              }

              const tooltipContent = (
                <div>
                  <div>Type: {auction.auctionType}</div>
                  <div>Start: {start}</div>
                  <div>End: {end}</div>
                  <div>Opening Bid: R {openingBid?.toLocaleString() || "0"}</div>
                  <div>Status: {statusBadge}</div>                  
                </div>
              );

              return (
                <tr key={index}>
                  <td>{auction.title}</td>
                  <td className="d-none d-md-table-cell text-center">{auction.auctionType}</td>
                  <td className="d-none d-md-table-cell text-center">{start}</td>
                  <td className="d-none d-md-table-cell text-center">{end}</td>
                  <td className="d-none d-lg-table-cell text-center">
                    R {openingBid?.toLocaleString() || "0"}
                  </td>
                  <td className="d-none d-lg-table-cell text-center">{statusBadge}</td>
                  <td className="text-center">
                    <div className="d-flex gap-2">
                      <OverlayTrigger
                        placement="left"
                        overlay={<Tooltip id={`tooltip-${index}`}>{tooltipContent}</Tooltip>}
                        className="d-md-none"
                      >
                        <Button 
                          variant="secondary"
                          size="sm"
                          className="d-block d-md-none"
                        >
                          <Info size={16} />
                        </Button>
                      </OverlayTrigger>
                      
                      <Button 
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(auction._id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
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
      <Pageheader title={id == 'new' ? "Load New Property": inventoryItem.fullDescription} heading="Manage" active="Inventory" />
      
      <Row>
        <Col lg={12} md={12}>
          <Tab.Container id="left-tabs-example" defaultActiveKey={ id == "new" ? 'details' : 'market' }>
            
          {id !== "new1" && (<>
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
    
                            <Tab.Pane eventKey="details" className="main-content-body p-0 border-0">
                                <Card>
                                    <Card.Body className="border-0">
                                    <div className="mb-4 main-content-label text-primary">
                                        Details
                                    </div>

                                    <Row className="gy-3">
                                        {/* First subcategory dropdown */}                            
                                        <Col xs={12} sm={12} md={6}>
                                        <FormGroup className="form-group">
                                            <Form.Label>Listing Type</Form.Label>
                                            <Form.Select
                                            className="form-control"
                                            value={inventoryItem.subcategory || ""}
                                            onChange={(e) => {
                                                // Reset all dependent fields when listing type changes
                                                setInventoryItem(prev => ({
                                                ...prev,
                                                subcategory: e.target.value,
                                                propertyType: "",
                                                price: "",
                                                rental: "",
                                                rentalDeposit: "",
                                                leasePeriod: "",
                                                bedrooms: "",
                                                bathrooms: "",
                                                garages: "",
                                                parkingSpaces: "",
                                                floorSize: "",
                                                erfSize: "",
                                                isPetFriendly: false,
                                                furnished: false,
                                                developmentName: "",
                                                developmentType: "",
                                                developmentStatus: "",
                                                fromPrice: "",
                                                toPrice: "",
                                                units: "",
                                                formattedAddress: ""
                                                }));
                                            }}
                                            isInvalid={inventoryErrors?.subcategory}
                                            >
                                            <option value="">Select Listing Type</option>
                                            {categories.Property.subcategories.map((subcat) => (
                                                <option key={subcat.label} value={subcat.label}>
                                                {subcat.label}
                                                </option>
                                            ))}
                                            </Form.Select>
                                            {inventoryErrors?.subcategory && (
                                            <Form.Control.Feedback type="invalid">
                                                {inventoryErrors.subcategory}
                                            </Form.Control.Feedback>
                                            )}
                                        </FormGroup>
                                        </Col>

                                        {/* Render all other attributes based on selected listing type */}
                                        {getAttributes().map((attribute, index) => ( 
                                        <Col xs={12} sm={12} md={6} key={index}>
                                            <FormGroup className="form-group">
                                            {attribute.type !== 'hidden' && <Form.Label>{attribute.label}</Form.Label>}
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

                                        {/* Features Section */}
                                        {inventoryItem.subcategory && inventoryItem.subcategory !== 'Development' && (
                                        <>
                                            <div className="col-12">
                                            <div className="mb-4 main-content-label text-primary">Features</div>
                                            </div>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="pool"
                                                label="Swimming Pool"
                                                checked={inventoryItem.pool || false}
                                                onChange={(e) => handleInputChange('pool', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="garden"
                                                label="Garden"
                                                checked={inventoryItem.garden || false}
                                                onChange={(e) => handleInputChange('garden', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="patio"
                                                label="Patio"
                                                checked={inventoryItem.patio || false}
                                                onChange={(e) => handleInputChange('patio', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="balcony"
                                                label="Balcony"
                                                checked={inventoryItem.balcony || false}
                                                onChange={(e) => handleInputChange('balcony', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="braai"
                                                label="Braai"
                                                checked={inventoryItem.braai || false}
                                                onChange={(e) => handleInputChange('braai', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="study"
                                                label="Study"
                                                checked={inventoryItem.study || false}
                                                onChange={(e) => handleInputChange('study', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="flatlet"
                                                label="Flatlet"
                                                checked={inventoryItem.flatlet || false}
                                                onChange={(e) => handleInputChange('flatlet', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="laundry"
                                                label="Laundry"
                                                checked={inventoryItem.laundry || false}
                                                onChange={(e) => handleInputChange('laundry', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="fireplace"
                                                label="Fireplace"
                                                checked={inventoryItem.fireplace || false}
                                                onChange={(e) => handleInputChange('fireplace', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <div className="col-12">
                                            <div className="mb-4 main-content-label text-primary">Power & Water Solutions</div>
                                            </div>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="solarPanels"
                                                label="Solar Panels"
                                                checked={inventoryItem.solarPanels || false}
                                                onChange={(e) => handleInputChange('solarPanels', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="solarGeyser"
                                                label="Solar Geyser"
                                                checked={inventoryItem.solarGeyser || false}
                                                onChange={(e) => handleInputChange('solarGeyser', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="borehole"
                                                label="Borehole"
                                                checked={inventoryItem.borehole || false}
                                                onChange={(e) => handleInputChange('borehole', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="batteryBackup"
                                                label="Battery Backup"
                                                checked={inventoryItem.batteryBackup || false}
                                                onChange={(e) => handleInputChange('batteryBackup', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="generator"
                                                label="Generator"
                                                checked={inventoryItem.generator || false}
                                                onChange={(e) => handleInputChange('generator', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="waterTank"
                                                label="Water Tank"
                                                checked={inventoryItem.waterTank || false}
                                                onChange={(e) => handleInputChange('waterTank', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <div className="col-12">
                                            <div className="mb-4 main-content-label text-primary">Additional Features</div>
                                            </div>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="security"
                                                label="Security"
                                                checked={inventoryItem.security || false}
                                                onChange={(e) => handleInputChange('security', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="aircon"
                                                label="Air Conditioning"
                                                checked={inventoryItem.aircon || false}
                                                onChange={(e) => handleInputChange('aircon', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>

                                            <Col xs={12} sm={6} md={4}>
                                            <FormGroup className="form-group">
                                                <Form.Check
                                                type="switch"
                                                id="underfloorHeating"
                                                label="Underfloor Heating"
                                                checked={inventoryItem.underfloorHeating || false}
                                                onChange={(e) => handleInputChange('underfloorHeating', e.target.checked)}
                                                />
                                            </FormGroup>
                                            </Col>
                                        </>
                                        )}
                                    </Row>

                                    <FormGroup className="form-group mt-4">
                                        <Row className="row-sm justify-content-end">
                                        <Col xs={12} sm={12} md={12} lg="auto" className="text-md-end">
                                            <Button 
                                            className="btn btn-primary mb-1 w-100 w-lg-auto" 
                                            onClick={handleDetailsSave}
                                            >
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
                                            <Button className="btn btn-primary mb-1 w-100 w-lg-auto" onClick={handleConditionSave}>
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

                                {organization?.allowToSellOnAuction && (
                                  <>
                                   <div className="mb-4 main-content-label text-primary">Auction</div>  
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

                                      <AuctionHistoryTable inventoryItem={inventoryItem} loading={loading} id={id} />                                     

                                      <BookAuctionModal show={showAuctionModal} onHide={() => setShowAuctionModal(false)} inventoryItem={inventoryItem} id={id} />

                                    </div>
                                  </>
                                )}

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

PropertyInventory.layout = "ManageLayout";

export default PropertyInventory;