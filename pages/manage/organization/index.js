import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Card, Col, Nav, Row, Tab, FormGroup, Form, Button, OverlayTrigger, Tooltip, Alert, Table, Badge, Modal, Dropdown, ListGroup, ListGroupItem, InputGroup, Accordion } from "react-bootstrap";
import { useSession } from 'next-auth/react'
import Link from "next/link";
import dynamic from 'next/dynamic';
import moment from 'moment';
import timezone from 'moment-timezone';
import Image from 'next/image';
import Color from "color";
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import Pagination from "@/components/partials/Pagination";
import { updateOrganization, verifyVatNr, verifyBankDetails, deleteBankAccount, uploadLogo, updateLocation, createLocation, createExtra, updateExtra, deleteExtra  } from "@/redux/manage/slices/organization";
import { validateEmail } from "@/utils/validateAuth";
import { categories, banks, countries } from "@/utils/config";
import Holidays from "date-holidays";
import { Rating, Stack } from "@mui/material";
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Select = dynamic(() => import("react-select"), { ssr: false });

const Organization = ({ }) => {

	const { status, data: session } = useSession(); 

    const dispatch = useDispatch();

    const { organization, extras } = useSelector(state => state.organization);

	const [org, setOrg] = useState({});	
	const [validationErrors, setValidationErrors] = useState({});
  
	useEffect(() => {
		if(organization) setOrg({...organization})
	}, [organization]);

	//PROFILE
	const [profileErrors, setProfileErrors] = useState({});

	const validateSocialUrl = (url, domains) => {
		try {
		  const parsedUrl = new URL(url);
		  const hostname = parsedUrl.hostname.replace(/^www\./, '');
		  return domains.includes(hostname);
		} catch (e) {
		  return false;
		}
	};

	const getProfileErrors = () => {

		let errors = {};
	  
		// **CIPC Information Validation**
		if (!org.registeredName) errors.registeredName = 'Registered Name is required';
		if (!org.registrationNumber) errors.registrationNumber = 'Registration Number is required';
		if (!org.taxNo) errors.taxNo = 'Tax Number is required';
		if (!org.companyType) errors.companyType = 'Company Type is required';
		if (!org.registrationDate) errors.registrationDate = 'Registration Date is required';
		if (!org.businessStartDate) errors.businessStartDate = 'Business Start Date is required';
		if (!org.financialYearEnd) errors.financialYearEnd = 'Financial Year End is required';
		if (!org.operatingStatus) errors.operatingStatus = 'Operating Status is required';
		if (!org.directorCount) { errors.directorCount = 'Director Count is required';
		} else if (isNaN(org.directorCount)) { errors.directorCount = 'Director Count must be a number';
		}
	  
		// **VAT Validation**
		if (org.isVatRegistered && !org.vatNumberVerified) {
		  if (!org.vatNumber) {
			errors.vatNumber = 'VAT Number is required';
		  } else {
			if (!org.vatNumber.toString().startsWith('4'))
			  errors.vatNumber = 'VAT Number must start with 4';
			if (org.vatNumber.toString().length !== 10)
			  errors.vatNumber = 'VAT Number must be 10 digits long';
		  }
		}
	  
		// **Trading Name Validation**
		if (!org.tradingName) {
		  errors.tradingName = 'Trading Name is required';
		} else if (!org.tradingNameVerified) {
		  // Additional validation if needed
		}
	  
		// **Website Validation**
		if (!org.websiteUrl) {
			errors.websiteUrl = 'Website URL is required';
		} else {
			try {
			  const parsedUrl = new URL(org.websiteUrl); // Parse the URL
			  if (parsedUrl.protocol !== 'https:') {
				errors.websiteUrl = 'Website URL must start with https://';
			  }
			  if (!parsedUrl.hostname) {
				errors.websiteUrl = 'Website URL must include a valid domain';
			  }
			} catch (e) {
			  errors.websiteUrl = 'Please enter a valid website URL';
			}
		}	
	  
		// **Social Links Validation**
		if (org.facebookPageUrl && !validateSocialUrl(org.facebookPageUrl, ['facebook.com']))
			errors.facebookPageUrl = 'Please enter a valid Facebook URL starting with https://facebook.com/ or https://www.facebook.com/';
		  
		if (org.instagramPageUrl && !validateSocialUrl(org.instagramPageUrl, ['instagram.com']))
			errors.instagramPageUrl = 'Please enter a valid Instagram URL starting with https://instagram.com/ or https://www.instagram.com/';
		  
		if (org.twitterPageUrl && !validateSocialUrl(org.twitterPageUrl, ['x.com', 'twitter.com']))
			errors.twitterPageUrl = 'Please enter a valid X.com or Twitter URL starting with https://x.com/, https://www.x.com/, https://twitter.com/, or https://www.twitter.com/';
		  
		if (org.tiktokPageUrl && !validateSocialUrl(org.tiktokPageUrl, ['tiktok.com']))
			errors.tiktokPageUrl = 'Please enter a valid TikTok URL starting with https://tiktok.com/ or https://www.tiktok.com/';
		  
		if (org.youtubePageUrl && !validateSocialUrl(org.youtubePageUrl, ['youtube.com']))
			errors.youtubePageUrl = 'Please enter a valid YouTube URL starting with https://youtube.com/, https://www.youtube.com/';
	  
		// **Organization Statistics Validation**
		if (org.statistics && org.statistics.length > 0) {
		  org.statistics.forEach((stat, index) => {
			if (!stat.name) errors[`statistics[${index}].name`] = 'Statistic name is required';
			if (!stat.value) errors[`statistics[${index}].value`] = 'Statistic value is required';
			if (!stat.icon) errors[`statistics[${index}].icon`] = 'Statistic icon is required';
		  });
		}
	  
		// **Categories Validation**
		if (!org.categories || org.categories.length === 0) errors.categories = 'At least one category is required';
	  
		if (Object.keys(errors).length > 0) {
		  setProfileErrors(errors);	
		  return true; // Indicates validation errors exist
		} else {
		  setProfileErrors({});
		  return false; // No validation errors
		}
	};
	  
	const handleProfileSave = (e) => {
		e.preventDefault();
		if (!getProfileErrors()) {
		  dispatch(updateOrganization(org));
		}
	};

	//VAT NUMBER VERIFICATION
	const [showModal, setShowModal] = useState(false); //VAT MODAL

	const VatVerificationModal = ({ vatNumber, show, onHide, onSubmit }) => {

		const [accountant, setAccountant] = useState({
		  name: '',
		  email: '',
		  vatNumber: vatNumber
		});
		const [errors, setErrors] = useState({});
	   
		const handleVerify = () => {
		const errors = {};
		if (!accountant.name) errors.name = 'Name required';
		
		const emailError = validateEmail(accountant.email);
		if (emailError) errors.email = emailError;

		if (!accountant.vatNumber) errors.vatNumber = 'VAT number required';
		if(accountant.vatNumber.length !== 10) errors.vatNumber = 'VAT number must be 10 characters long';
		if(!accountant.vatNumber.toString().startsWith('4')) errors.vatNumber = 'VAT number must start with 4'
		
		if (Object.keys(errors).length === 0) {
			onSubmit(accountant);
			onHide();
		} else {
			setErrors(errors);
		}
		};
	   
		return (
		  <Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
			  <Modal.Title>VAT Verification</Modal.Title>
			</Modal.Header>
			<Modal.Body>
			  <p>Please provide your accountant's details to verify VAT number</p>
			  <Form.Group className="mb-3">
				<Form.Label>Accountant Name</Form.Label>
				<Form.Control
				  value={accountant.name}
				  isInvalid={errors.name}
				  onChange={e => setAccountant({...accountant, name: e.target.value})}
				/>
				<Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
			  </Form.Group>
			  <Form.Group className="mb-3">
				<Form.Label>Accountant Email</Form.Label>
				<Form.Control 
				  type="email"
				  value={accountant.email}
				  isInvalid={errors.email}
				  onChange={e => setAccountant({...accountant, email: e.target.value})}
				/>
				<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
			  </Form.Group>
			  <Form.Group>
				<Form.Label>Vat Number</Form.Label>
				<Form.Control 
				  type="number"
				  value={accountant.vatNumber}
				  isInvalid={errors.vatNumber}
				  onChange={e => setAccountant({...accountant, vatNumber: e.target.value})}
				/>
				<Form.Control.Feedback type="invalid">{errors.vatNumber}</Form.Control.Feedback>
			  </Form.Group>
			</Modal.Body>
			<Modal.Footer>
			  <Button variant="secondary" onClick={onHide}>Cancel</Button>
			  <Button variant="primary" onClick={handleVerify}>Send Verification</Button>
			</Modal.Footer>
		  </Modal>
		);
	};

	//STATISTICS
	const icons = [
		{ value: 'fa-user', label: 'User' },
		{ value: 'fa-chart-line', label: 'Chart' },
		{ value: 'fa-dollar-sign', label: 'Dollar' },
		{ value: 'fa-clock', label: 'Clock' }
	];
	 
	const addStatistic = () => {
		setOrg(prev => ({
		  ...prev,
		  statistics: [
			...(prev.statistics || []),
			{ name: '', value: '', icon: '', displayOrder: prev.statistics?.length || 0 }
		  ]
		}));
	};
	 
	const updateStatistic = (index, field, value) => {
		setOrg(prev => ({
		  ...prev,
		  statistics: prev.statistics.map((stat, i) => 
			i === index ? { ...stat, [field]: value } : stat
		  )
		}));
	};
	 
	const removeStatistic = (index) => {
		setOrg(prev => ({
		  ...prev,
		  statistics: prev.statistics.filter((_, i) => i !== index)
		}));
	};

	//LOCATIONS
	const [addLocation, setLocation] = useState(false)
	const [newLocation, setNewLocation] = useState({
	  name: '',
	  isHeadOffice: false, 
	  active: true,  		
	  activeDate: new Date(),		
	  closedDate: '',		
	  type: 'Store',				
	  formattedAddress: '',
	  addressLine1: '',
	  addressLine2: '',
	  suburb: '',
	  city: '',
	  zip: '',
	  province: '',
	  country: 'South Africa',
	  countryCode: 'ZA',
	  phoneNrPrefix: '+27',
	  phoneNr: '',
	  signioCode: '',	
	  displaySortOrder: 1,	  
	  locationPictures: [],
	  latitude: '',
	  longitude: '',
	  placesName: '',
	  placesId: '',
	  directionsUrl: '',
	  placeUrl: '',
	  operatingHours: {
		mondayOpening: "",
		mondayClosing: "",
		mondayIsOpen: false,
		thuesdayOpening: "",
		thuesdayClosing: "",
		thuesdayIsOpen: false,
		wednesdayOpening: "",
		wednesdayClosing: "",
		wednesdayIsOpen: false,
		thursdayOpening: "",
		thursdayClosing: "",
		thursdayIsOpen: false,
		fridayOpening: "",
		fridayClosing: "",
		fridayIsOpen: false,
		saterdayOpening: "",
		saterdayClosing: "",
		saterdayIsOpen: false,
		sundayOpening: "",
		sundayClosing: "",
		sundayIsOpen: false,
		publicHolidayOpening: "",
		publicHolidayClosing: "",
		publicHolidayIsOpen: false,
	  },
	  publicHolidays: [],    
  
	});

	const handleLocationClick = (location) => {

		setLocation(true);
		setNewLocation(location);
	  
		var hd = new Holidays();
		hd.init(location?.countryCode || 'ZA');
		var holidays = hd.getHolidays(new Date().getFullYear());
	  
		// Get the current date
		const today = new Date();
	  
		// Format the holidays and exclude those that have already passed
		const formattedHolidays = holidays
		.filter((holiday) => new Date(holiday.date) >= today) // Exclude past holidays
		.map((holiday) => ({
			holidayDate: holiday.date,
			holidayName: holiday.name,
			isOpen: false,
		}));
	  
		// Merge holidays without duplicating existing ones
		setNewLocation((prev) => {
		  const existingHolidays = prev.publicHolidays || [];
	  
		  const mergedHolidays = [
			...existingHolidays,
			...formattedHolidays.filter(
			  (newHoliday) =>
				!existingHolidays.some(
				  (existingHoliday) =>
					existingHoliday.holidayDate === newHoliday.holidayDate &&
					existingHoliday.holidayName === newHoliday.holidayName
				)
			),
		  ];
	  
		  return {
			...prev,
			publicHolidays: mergedHolidays,
		  };
		});
	  
		console.log('holidays', holidays);
		console.log('location', location);

	};

	const handleLocationCreate = (e) => {

		e.preventDefault();
																		
		setNewLocation({
			name: '',
			isHeadOffice: false, 
			active: true,  		
			activeDate: new Date(),		
			closedDate: '',		
			type: 'Store',				
			formattedAddress: '',
			addressLine1: '',
			addressLine2: '',
			suburb: '',
			city: '',
			zip: '',
			province: '',
			country: 'South Africa',
			countryCode: 'ZA',
			phoneNrPrefix: '+27',
			phoneNr: '',
			signioCode: '',	
			displaySortOrder: 1,	  
			locationPictures: [],
			latitude: '',
			longitude: '',
			placesName: '',
			placesId: '',
			directionsUrl: '',
			placeUrl: '',
			operatingHours: {
			  mondayOpening: "",
			  mondayClosing: "",
			  mondayIsOpen: false,
			  thuesdayOpening: "",
			  thuesdayClosing: "",
			  thuesdayIsOpen: false,
			  wednesdayOpening: "",
			  wednesdayClosing: "",
			  wednesdayIsOpen: false,
			  thursdayOpening: "",
			  thursdayClosing: "",
			  thursdayIsOpen: false,
			  fridayOpening: "",
			  fridayClosing: "",
			  fridayIsOpen: false,
			  saterdayOpening: "",
			  saterdayClosing: "",
			  saterdayIsOpen: false,
			  sundayOpening: "",
			  sundayClosing: "",
			  sundayIsOpen: false,
			  publicHolidayOpening: "",
			  publicHolidayClosing: "",
			  publicHolidayIsOpen: false,
			},
			publicHolidays: [],    
		
		});																

		setLocation(true);		
	  
		var hd = new Holidays();
		hd.init(location?.countryCode || 'ZA');
		var holidays = hd.getHolidays(new Date().getFullYear());
	  
		// Get the current date
		const today = new Date();
	  
		// Format the holidays and exclude those that have already passed
		const formattedHolidays = holidays
		.filter((holiday) => new Date(holiday.date) >= today) // Exclude past holidays
		.map((holiday) => ({
			holidayDate: holiday.date,
			holidayName: holiday.name,
			isOpen: false,
		}));
	  
		// Merge holidays without duplicating existing ones
		setNewLocation((prev) => {
		  const existingHolidays = prev.publicHolidays || [];
	  
		  const mergedHolidays = [
			...existingHolidays,
			...formattedHolidays.filter(
			  (newHoliday) =>
				!existingHolidays.some(
				  (existingHoliday) =>
					existingHoliday.holidayDate === newHoliday.holidayDate &&
					existingHoliday.holidayName === newHoliday.holidayName
				)
			),
		  ];
	  
		  return {
			...prev,
			publicHolidays: mergedHolidays,
		  };
		});
	  
		console.log('holidays', holidays);
		console.log('location', location);

	}

	const handleSaveLocation = (e) => {

		e.preventDefault();
	  
		let errors = {};
	  
		// Validate required fields
		if (!newLocation.name) errors.name = 'Name is required';
		if (!newLocation.addressLine1) errors.addressLine1 = 'Address Line 1 is required';
		if (!newLocation.suburb) errors.suburb = 'Suburb is required';
		if (!newLocation.city) errors.city = 'City is required';
		if (!newLocation.zip) errors.zip = 'Zip code is required';
		if (!newLocation.country) errors.country = 'Country is required';
		if (!newLocation.province) errors.province = 'Province/State is required';
		if (!newLocation.phoneNr) errors.phoneNr = 'Phone Number is required';	  
		// If not active, closedDate is required
		if (newLocation.active.toString() === 'false' && !newLocation.closedDate) errors.closedDate = 'Closed Date is required when location is inactive';
		
		// Validate operating hours for Monday
		const mondayIsOpen = newLocation?.operatingHours?.mondayIsOpen;
		const mondayOpening = newLocation?.operatingHours?.mondayOpening;
		const mondayClosing = newLocation?.operatingHours?.mondayClosing;
	  
		if (mondayIsOpen) {

		  if (!mondayOpening) errors.mondayOpening = 'Monday opening time is required';
		  if (!mondayClosing) errors.mondayClosing = 'Monday closing time is required';		  

		} else {			
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  mondayOpening: '',
			  mondayClosing: '',
			},
		  }));
		}

		// Validate operating hours for Tuesday
		const thuesdayIsOpen = newLocation?.operatingHours?.thuesdayIsOpen;
		const thuesdayOpening = newLocation?.operatingHours?.thuesdayOpening;
		const thuesdayClosing = newLocation?.operatingHours?.thuesdayClosing;
	  
		if (thuesdayIsOpen) {

		  if (!thuesdayOpening) errors.thuesdayOpening = 'Tuesday opening time is required';
		  if (!thuesdayClosing) errors.thuesdayClosing = 'Tuesday closing time is required';		 

		} else {		
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  thuesdayOpening: '',
			  thuesdayClosing: '',
			},
		  }));
		}

		// Validate operating hours for Wednesday
		const wednesdayIsOpen = newLocation?.operatingHours?.wednesdayIsOpen;
		const wednesdayOpening = newLocation?.operatingHours?.wednesdayOpening;
		const wednesdayClosing = newLocation?.operatingHours?.wednesdayClosing;
	  
		if (wednesdayIsOpen) {

		  if (!wednesdayOpening) errors.wednesdayOpening = 'Wednesday opening time is required';
		  if (!wednesdayClosing) errors.wednesdayClosing = 'Wednesday closing time is required';		  

		} else {			 
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  wednesdayOpening: '',
			  wednesdayClosing: '',
			},
		  }));
		}

		// Validate operating hours for Thursday
		const thursdayIsOpen = newLocation?.operatingHours?.thursdayIsOpen;
		const thursdayOpening = newLocation?.operatingHours?.thursdayOpening;
		const thursdayClosing = newLocation?.operatingHours?.thursdayClosing;
	  
		if (thursdayIsOpen) {

		  if (!thursdayOpening) errors.thursdayOpening = 'Thursday opening time is required';
		  if (!thursdayClosing) errors.thursdayClosing = 'Thursday closing time is required';		 

		} else {	
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  thursdayOpening: '',
			  thursdayClosing: '',
			},
		  }));
		}		

		// Validate operating hours for Friday
		const fridayIsOpen = newLocation?.operatingHours?.fridayIsOpen;
		const fridayOpening = newLocation?.operatingHours?.fridayOpening;
		const fridayClosing = newLocation?.operatingHours?.fridayClosing;
	  
		if (fridayIsOpen) {

		  if (!fridayOpening) errors.fridayOpening = 'Friday opening time is required';
		  if (!fridayClosing) errors.fridayClosing = 'Friday closing time is required';		 

		} else {		
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  fridayOpening: '',
			  fridayClosing: '',
			},
		  }));
		}

		// Validate operating hours for Saturday
		const saterdayIsOpen = newLocation?.operatingHours?.saterdayIsOpen;
		const saterdayOpening = newLocation?.operatingHours?.saterdayOpening;
		const saterdayClosing = newLocation?.operatingHours?.saterdayClosing;
	  
		if (saterdayIsOpen) {

		  if (!saterdayOpening) errors.saterdayOpening = 'Saterday opening time is required';
		  if (!saterdayClosing) errors.saterdayClosing = 'Saterday closing time is required';

		} else {
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  saterdayOpening: '',
			  saterdayClosing: '',
			},
		  }));
		}

		// Validate operating hours for Sunday
		const sundayIsOpen = newLocation?.operatingHours?.sundayIsOpen;
		const sundayOpening = newLocation?.operatingHours?.sundayOpening;
		const sundayClosing = newLocation?.operatingHours?.sundayClosing;
	  
		if (sundayIsOpen) {

		  if (!sundayOpening) errors.sundayOpening = 'Sunday opening time is required';
		  if (!sundayClosing) errors.sundayClosing = 'Sunday closing time is required';
		  
		} else {
		  setNewLocation((prevLocation) => ({
			...prevLocation,
			operatingHours: {
			  ...prevLocation.operatingHours,
			  sundayOpening: '',
			  sundayClosing: '',
			},
		  }));
		}

		// Validate operating hours for Public Holiday
		const publicHolidayIsOpen = newLocation?.operatingHours?.publicHolidayIsOpen;
		const publicHolidayOpening = newLocation?.operatingHours?.publicHolidayOpening;
		const publicHolidayClosing = newLocation?.operatingHours?.publicHolidayClosing;

		if (publicHolidayIsOpen) {

			if (!publicHolidayOpening) errors.publicHolidayOpening = 'Public holiday opening time is required';
			if (!publicHolidayClosing) errors.publicHolidayClosing = 'Public holiday closing time is required';			
  
		} else {				
			setNewLocation((prevLocation) => ({
				...prevLocation,
				operatingHours: {
				  ...prevLocation.operatingHours,
				  publicHolidayOpening: '',
				  publicHolidayClosing: '',
				},
			}));
		}

		console.log('errors', errors);	  

		if (Object.keys(errors).length > 0) {
		  setValidationErrors(errors);
		  return;
		}
		
		if (newLocation._id) {
			
			const updatedLocations = org.locations.map((loc) => loc._id === newLocation._id ? newLocation : loc);
			const updatedOrg = {
			  ...org,
			  locations: updatedLocations,
			};

	    	setOrg(updatedOrg);
			dispatch(updateLocation(newLocation));

		} else {
		
			const updatedOrg = {
			  ...org,
			  locations: [...(org.locations || []), newLocation],
			};
			setOrg(updatedOrg);

			dispatch(createLocation(newLocation));

		}
		
		setLocation(false);	
		setValidationErrors({});

	};

	//ACCOUNTS
	const [accountErrors, setAccountErrors] = useState({});
	const [addAccount, setAddAccount] = useState(false)
	const [newAccount, setNewAccount] = useState({	
		name: "",
		accountNr: "",
		accountType: "Cheque",
		branchCode: ""
	});

	const handleBankSelect = (bankName) => {
		const bank = banks.find(b => b.name === bankName);
		setNewAccount(prev => ({
		  ...prev,
		  name: bankName,
		  branchCode: bank?.code || ''
		}));
	};

	const handleAddNewAccount = async (e) => {		

		if(session?.user?.isDirector){

		e.preventDefault();
		
		const errors = {};
	   
		if (!newAccount.name) errors.name = 'Please select a bank';
		if (!newAccount.accountNr) {
		  errors.accountNr = 'Account number is required';
		} else {
			const bank = banks.find(b => b.name === newAccount.name);
			if (!bank?.accountRegex.test(newAccount.accountNr)) {
			  errors.accountNr = bank?.accountMessage || 'Invalid account number format';  
			}
		}
		if (!newAccount.accountType) errors.accountType = 'Please select account type';
		if (!newAccount.branchCode) errors.branchCode = 'Branch code is required';
	   
		if (Object.keys(errors).length > 0) {
		  setAccountErrors(errors);
		  return;
		}
	   
		try {
		  await dispatch(verifyBankDetails(newAccount)).unwrap();
		  setAddAccount(false);
		} catch (error) {
		  setAccountErrors({ submit: error });
		}

	    }
	};

	const handleDelete = async (accountId) => {
			  await dispatch(deleteBankAccount(accountId)).unwrap();		
	};

	function formatDate(date) {

		const today = moment().startOf('day');
		const yesterday = moment().subtract(1, 'days').startOf('day');
		const givenDate = moment(date).startOf('day');
	  
		if (givenDate.isSame(today)) {
		  return 'Today'
		} else if (givenDate.isSame(yesterday)) {
		  return 'Yesterday';
		} else {
		  return moment(date).format('DDD MMM YYYY');
		}
	}	

	//EXTRAS
	const DealershipExtras = ({ extras }) => {

		const dispatch = useDispatch();
		const { loading, error } = useSelector(state => state.organization);
	  
		const [showForm, setShowForm] = useState(false);
		const [editingExtra, setEditingExtra] = useState(null);
		const [validationErrors, setValidationErrors] = useState({});
	  
		const initialFormState = {
		  description: '',
		  amount: '',
		  required: false,
		  isVattable: true,
		  saleType: 'Cash',
		  salesManEditable: false,
		  conditions: []
		};
	  
		const [extraForm, setExtraForm] = useState(initialFormState);
		const [conditions, setConditions] = useState({
		  year: { operator: '$gte', value: '' },
		  mileage: { operator: '$lte', value: '' },
		  hours: { operator: '$lte', value: '' },
		  price: { operator: '$lte', value: '' }
		});

		const toTitleCase = (str) => {
			return str.toLowerCase().split(' ').map(word => 
			  word.charAt(0).toUpperCase() + word.slice(1)
			).join(' ');
		};
	  
		const validateForm = () => {

		  const errors = {};
		  if (!extraForm.description) errors.description = 'Description is required';
		  if (!extraForm.amount) {
			errors.amount = 'Amount is required';
		  } else if (isNaN(extraForm.amount) || extraForm.amount <= 0) {
			errors.amount = 'Amount must be a positive number';
		  }
		  if (!extraForm.saleType) errors.saleType = 'Sale type is required';
	  
		  // Validate numeric conditions
		  const conditionErrors = {};
		  if (conditions.year.value && !Number.isInteger(Number(conditions.year.value))) {
			conditionErrors.year = 'Year must be a valid number';
		  }
		  if (conditions.mileage.value && !Number.isInteger(Number(conditions.mileage.value))) {
			conditionErrors.mileage = 'Mileage must be a valid number';
		  }
		  if (conditions.hours.value && !Number.isInteger(Number(conditions.hours.value))) {
			conditionErrors.hours = 'Hours must be a valid number';
		  }
		  if (conditions.price.value && !Number.isInteger(Number(conditions.price.value))) {
			conditionErrors.price = 'Price must be a valid number';
		  }
		  if (Object.keys(conditionErrors).length > 0) {
			errors.conditions = conditionErrors;
		  }
	  
		  setValidationErrors(errors);
		  return Object.keys(errors).length === 0;
		};
	  
		  const handleSubmit = async (e) => {
			e.preventDefault();
			if (validateForm()) {
			  const formData = { ...extraForm };
			  
			  // Only add conditions if at least one condition has a value
			  const constraints = Object.entries(conditions).reduce((acc, [key, value]) => {
				if (value.value) {
				  acc[key] = { [value.operator]: Number(value.value) };
				}
				return acc;
			  }, {});
		  
			  // Only add conditions if there are any constraints
			  if (Object.keys(constraints).length > 0) {
				formData.conditions = [{ constraints }];
			  } else {
				formData.conditions = [];
			  }
		  
			  try {
				if (editingExtra) {
				  await dispatch(updateExtra(formData)).unwrap();
				} else {
				  await dispatch(createExtra(formData)).unwrap();
				}
				
				// Reset form on success
				setShowForm(false);
				setExtraForm(initialFormState);
				setEditingExtra(null);
				setConditions({
				  year: { operator: '$gte', value: '' },
				  mileage: { operator: '$lte', value: '' },
				  hours: { operator: '$lte', value: '' },
				  price: { operator: '$lte', value: '' }
				});
			  } catch (err) {
				console.error('Failed to save extra:', err);
			  }
			}
		};
	  
		const handleEdit = (extra) => {
			setEditingExtra(extra);
			setExtraForm(extra);
			
			if (extra.conditions?.length > 0 && extra.conditions[0].constraints) {
			  const newConditions = {
				year: { operator: '$gte', value: '' },
				mileage: { operator: '$lte', value: '' },
				hours: { operator: '$lte', value: '' },
				price: { operator: '$lte', value: '' }
			  };
			  
			  Object.entries(extra.conditions[0].constraints).forEach(([key, value]) => {
				const operator = Object.keys(value)[0];
				newConditions[key] = {
				  operator,
				  value: value[operator].toString()
				};
			  });
			  
			  setConditions(newConditions);
			}
			
			setShowForm(true);
		};
	  
		const handleDelete = async (extraId) => {		 
			try {
			  await dispatch(deleteExtra(extraId)).unwrap();
			} catch (err) {
			  console.error('Failed to delete extra:', err);
			}
		  
		};
	  
		const renderConditionField = (field, label, error) => (
		  <Row className="mb-3">
			<Col md={4}>
			  <Form.Label>{label}</Form.Label>
			</Col>
			<Col md={3}>
			  <Form.Select
				value={conditions[field].operator}
				onChange={(e) => setConditions({
				  ...conditions,
				  [field]: { ...conditions[field], operator: e.target.value }
				})}
			  >
				<option value="$gt">Greater than</option>
				<option value="$gte">Greater than or equal to</option>
				<option value="$lt">Less than</option>
				<option value="$lte">Less than or equal to</option>
				<option value="$eq">Equal to</option>
				<option value="$ne">Not equal to</option>
			  </Form.Select>
			</Col>
			<Col md={5}>
			  <Form.Control
				type="number"
				value={conditions[field].value}
				isInvalid={error}
				onChange={(e) => setConditions({
				  ...conditions,
				  [field]: { ...conditions[field], value: e.target.value }
				})}
			  />
			  {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
			</Col>
		  </Row>
		);
	  
		return (
		  <div className="dealership-extras">
			<Card className="mb-4">
			  <Card.Body>
				{error && <Alert variant="danger">{error}</Alert>}
	  
				<div className="d-flex justify-content-between align-items-center mb-4">
				  <div className="mb-0 main-content-label text-primary">
					Dealership Sale Extras
				  </div>
	  
				  {!showForm && (
					<Button 
					  variant="primary" 
					  className="d-flex align-items-center gap-2"
					  onClick={() => setShowForm(true)}
					>
					  <Plus size={18} />
					  Add Extra
					</Button>
				  )}
				</div>
	  
				{showForm ? (
				  <Form onSubmit={handleSubmit} className="mb-4">
					<Row>
					  <Col md={6} lg={6}>
						<Form.Group className="mb-3">
						  <Form.Label>Description</Form.Label>
						  <Form.Control
							type="text"
							value={extraForm.description}
							isInvalid={!!validationErrors.description}
							onChange={(e) => setExtraForm({ ...extraForm, description: toTitleCase(e.target.value) })}
						  />
						  <Form.Control.Feedback type="invalid">
							{validationErrors.description}
						  </Form.Control.Feedback>
						</Form.Group>
					  </Col>
					  <Col md={3} lg={3}>
						<Form.Group className="mb-3">
						  <Form.Label>Amount</Form.Label>
						  <Form.Control
							type="number"
							value={extraForm.amount}
							isInvalid={!!validationErrors.amount}
							onChange={(e) => setExtraForm({...extraForm, amount: e.target.value})}
						  />
						  <Form.Control.Feedback type="invalid">
							{validationErrors.amount}
						  </Form.Control.Feedback>
						</Form.Group>
					  </Col>
					  <Col md={3} lg={3}>
						<Form.Group className="mb-3">
						  <Form.Label>Sale Type</Form.Label>
						  <Form.Select
							value={extraForm.saleType}
							isInvalid={!!validationErrors.saleType}
							onChange={(e) => setExtraForm({...extraForm, saleType: e.target.value})}
						  >
							<option value="Finance">Finance</option>
							<option value="Cash">Cash</option>							
						  </Form.Select>
						  <Form.Control.Feedback type="invalid">
							{validationErrors.saleType}
						  </Form.Control.Feedback>
						</Form.Group>
					  </Col>
					</Row>
	  
					<Row>
					  <Col md={4}>
						<Form.Group className="mb-3">
						  <Form.Check
							type="checkbox"
							label="Compulsory"
							checked={extraForm.required}
							onChange={(e) => setExtraForm({...extraForm, required: e.target.checked})}
						  />
						</Form.Group>
					  </Col>
					  <Col md={4}>
						<Form.Group className="mb-3">
						  <Form.Check
							type="checkbox"
							label="VAT Applicable"
							checked={extraForm.isVattable}
							onChange={(e) => setExtraForm({...extraForm, isVattable: e.target.checked})}
						  />
						</Form.Group>
					  </Col>
					  <Col md={4}>
						<Form.Group className="mb-3">
						  <Form.Check
							type="checkbox"
							label="Salesman Editable"
							checked={extraForm.salesManEditable}
							onChange={(e) => setExtraForm({...extraForm, salesManEditable: e.target.checked})}
						  />
						</Form.Group>
					  </Col>
					</Row>
	  
					<Accordion className="mb-3" defaultActiveKey="0">
					  <Accordion.Item eventKey="0">
						<Accordion.Header>
						  Vehicle Conditions (Optional)
						</Accordion.Header>
						<Accordion.Body>
						  {renderConditionField('price', 'Price', validationErrors.conditions?.price)}
						  {renderConditionField('year', 'Year', validationErrors.conditions?.year)}
						  {renderConditionField('mileage', 'Mileage', validationErrors.conditions?.mileage)}
						  {renderConditionField('hours', 'Hours', validationErrors.conditions?.hours)}
						</Accordion.Body>
					  </Accordion.Item>
					</Accordion>
	  
					<div className="d-flex justify-content-end gap-2">
					  <Button 
						variant="secondary" 
						onClick={() => {
						  setShowForm(false);
						  setValidationErrors({});
						  setEditingExtra(null);
						}}
						disabled={loading}
					  >
						Cancel
					  </Button>
					  <Button variant="primary" type="submit" disabled={loading}>
						{loading ? 'Saving...' : editingExtra ? 'Update Extra' : 'Save Extra'}
					  </Button>
					</div>
				  </Form>
				) : (<>	  
					{extras?.length > 0 ? (
					<div className="table-responsive">
					<Table className="table-nowrap">
					  <thead>
						<tr>
						  {/* Always visible */}
						  <th>Description</th>
						  <th>Amount</th>
						  {/* Visible from tablet up */}
						  <th className="d-none d-md-table-cell">Sale Type</th>
						  <th className="d-none d-md-table-cell">Required</th>
						  {/* Visible only on large screens */}
						  <th className="d-none d-lg-table-cell">VAT</th>
						  <th className="d-none d-lg-table-cell">Salesman Edit</th>
						  <th className="d-none d-lg-table-cell">Conditions</th>
						  <th>Actions</th>
						</tr>
					  </thead>
					  <tbody>
						{extras.map((extra) => (
						  <tr key={extra._id}>
							{/* Always visible */}
							<td className="text-nowrap">{extra.description}</td>
							<td className="text-nowrap">R {extra.amount.toLocaleString()}</td>
							
							{/* Visible from tablet up */}
							<td className="d-none d-md-table-cell text-nowrap">
							  <Badge bg="info">
								{extra.saleType === 'finance' ? 'Finance' : 
								 extra.saleType === 'cash' ? 'Cash' : 'Both'}
							  </Badge>
							</td>
							<td className="d-none d-md-table-cell text-nowrap">
							  <Badge bg={extra.required ? "success" : "warning"}>
								{extra.required ? "Required" : "Optional"}
							  </Badge>
							</td>
							
							{/* Visible only on large screens */}
							<td className="d-none d-lg-table-cell text-nowrap">
							  <Badge bg={extra.isVattable ? "primary" : "secondary"}>
								{extra.isVattable ? "VAT Applicable" : "No VAT"}
							  </Badge>
							</td>
							<td className="d-none d-lg-table-cell text-nowrap">
							  <Badge bg={extra.salesManEditable ? "success" : "danger"}>
								{extra.salesManEditable ? "Yes" : "No"}
							  </Badge>
							</td>
							<td className="d-none d-lg-table-cell text-nowrap">
							  {extra.conditions?.length > 0 && extra.conditions[0]?.constraints ? (
								<Badge bg="dark">
								  {Object.keys(extra.conditions[0].constraints).length} Condition(s)
								</Badge>
							  ) : (
								<Badge bg="secondary">No Conditions</Badge>
							  )}
							</td>
							
							{/* Always visible */}
							<td className="text-nowrap">
							  <div className="d-flex gap-2">
								<Button 
								  variant="light"
								  size="sm"
								  onClick={() => handleEdit(extra)}
								  disabled={loading}
								>
								  <Edit2 size={16} />
								</Button>
								<Button 
								  variant="danger"
								  size="sm"
								  onClick={() => handleDelete(extra._id)}
								  disabled={loading}
								>
								  <Trash2 size={16} />
								</Button>
							  </div>
							</td>
						  </tr>
						))}
					  </tbody>
					</Table>
				  </div>
					) : !showForm && (
					<Alert variant="info" className="text-center mb-0">
						No extras have been added yet. Click the "Add Extra" button to create your first extra.
					</Alert>
					)}
				</>)}
			  </Card.Body>
			</Card>
		  </div>
		);
	};

	//CHANGES
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const itemsPerPage = 25;

	// Filter changes based on search term
	const filteredChanges = useMemo(() => {
		if (!org?.changes) return [];
		return org.changes.filter(change => {
		const searchLower = searchTerm.toLowerCase();
		const fromToText = `${change.from} ${change.to}`.toLowerCase();
		const fieldName = change.fieldName.toLowerCase();
		return fromToText.includes(searchLower) || fieldName.includes(searchLower);
		});
	}, [org?.changes, searchTerm]);

	// Calculate total pages based on filtered items
	const totalPages = useMemo(() => {
		return Math.ceil(filteredChanges.length / itemsPerPage);
	}, [filteredChanges.length]);

	// Get current items
	const currentChanges = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredChanges.slice(startIndex, endIndex);
	}, [filteredChanges, currentPage]);

	// Handle page change
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	// Handle search change
	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1); // Reset to first page when searching
	};

	//SAVE
	const handleSave = async (e) => { 
		e.preventDefault();	
		dispatch(updateOrganization(org))
	};

	const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	
	return (
		<StateHandler slice="organization">
     
            <Pageheader title="Organization" heading="Manage" active="Organization" />

            <Row>
				<Col lg={12} md={12}>
					<Tab.Container id="left-tabs-example" defaultActiveKey="Profile">

						<Card className="custom-card d-none d-lg-block">
					        <Card.Body className=" d-md-flex bg-white">        
							{org?.logoUrl && 
							  <span className="profile-image pos-relative">
							  <div style={{ width: "200px", height: "200px", position: 'relative' }}>
							  <Image
								src={org.logoUrl}
								alt="org logo"
								fill
								sizes="200px"
								priority
								style={{ objectFit: 'contain' }}
								/>
							  </div>
							 </span>}
							
							<div className="my-md-auto mt-4 prof-details">

								<h5 className="font-weight-semibold ms-md-4 ms-0 mb-1 pb-0 mb-3">
							      {org?.registeredName || '' }{!org?.isComplete &&<Badge bg="primary" className="ms-2">Profile Incomplete</Badge>}
								</h5>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fa fa-hotel me-2"></i>
								</span>
								<span className="font-weight-semibold me-2">Trading As:</span>
								<span>{org?.tradingName || '' }</span>
								</p>
								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fas fa-university me-2"></i>
								</span>
								<span className="font-weight-semibold me-2">
									Registration Nr:
								</span>
								<span>{org?.registrationNumber || '' }</span>
								</p>		

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fa fa-globe me-2"></i>
								</span>
								<span className="font-weight-semibold me-2">Website:</span>
								<span>{org?.websiteUrl}</span>
								</p>

                                <p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
										<i className="fa fa-globe me-2"></i>
									</span>
									<span className="font-weight-semibold me-2">Type:</span>
									<span>{org?.type}</span>
								</p>	

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
										<i className="fa fa-globe me-2"></i>
									</span>
									<span className="font-weight-semibold me-2">Created At:</span>
									<span>{org?.createdAt ? moment(org?.createdAt).format('YYYY-MM-DD') : 'Not available'}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
										<i className="fa fa-globe me-2"></i>
									</span>
									<span className="font-weight-semibold me-2">Edited At:</span>
									<span>{org?.updatedAt ? moment(org?.updatedAt).format('YYYY-MM-DD') : 'Not available'}</span>
								</p>								

								<p className="tx-13 text-muted ms-md-4 ms-0 my-2 pb-2 ">
								{org?.categories?.map((category, index) => (
									<span key={index} className="me-3">
									<i className={`fa fa-${category.icon} me-2`}></i>
									{category.name}
									</span>
								))}
								</p>
							</div>
							</Card.Body>
							<Card.Footer className="py-0">
								<div className="profile-tab tab-menu-heading border-bottom-0">
									<Nav variant="pills" className="nav main-nav-line p-0 tabs-menu profile-nav-line border-0 br-5 mb-0	">
										<Nav.Item className="me-1">
											<Nav.Link className=" mb-2 mt-2" eventKey="Timeline">
										     	Timeline
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Profile">
											     Profile
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Locations">
										    	Locations
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Settings">
											  Settings
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
										<Nav.Link className="mb-2 mt-2" eventKey="Extras">
											Sale Extras
										</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Banking">
										    	Banking
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Changes">
											  Changes
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Theme">
										      Theme
											</Nav.Link>
										</Nav.Item>
									</Nav>
								</div>
							</Card.Footer>
						</Card>

						<Accordion className="d-lg-none mb-3">
						<Accordion.Item eventKey="0">
						<Accordion.Header>Menu</Accordion.Header>
						<Accordion.Body>
						   <Nav variant="pills" className="nav main-nav-line p-0 tabs-menu profile-nav-line border-0 br-5 mb-0	">
										<Nav.Item className="me-1">
											<Nav.Link className=" mb-2 mt-2" eventKey="Timeline">
										     	Timeline
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Profile">
											     Profile
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Locations">
										    	Locations
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Settings">
											  Settings
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
										<Nav.Link className="mb-2 mt-2" eventKey="Extras">
											Sale Extras
										</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Banking">
										    	Banking
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Changes">
											  Changes
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Theme">
										      Theme
											</Nav.Link>
										</Nav.Item>
									</Nav>
						</Accordion.Body>
						</Accordion.Item>
				    	</Accordion>

						{!org?.companyVerified && 						
						<Alert variant="primary" className="alert shadow fade show d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center">
							<i className="fas fa-shield-alt fa-lg me-2 text-primary"></i>
							<span>Please verify your company to explore all the benefits of our platform.</span>
						</div>
						<Button variant="primary" className="btn custom-button rounded-pill ms-3">
							<span className="custom-btn-icons">
							<i className="fas fa-check-circle text-primary"></i>
							</span>
							Verify Now
						</Button>
						</Alert>}									

						<span className=" py-0 ">
							<div className="profile-tab tab-menu-heading border-bottom-0 ">

								<Row className=" row-sm ">
									<Col lg={12} md={12}>
										<div className="custom-card main-content-body-profile">
											<Tab.Content>
												<Tab.Pane eventKey="Timeline" className="main-content-body  p-0 border-0">
													
													   {org?.timeline?.length == 0 ? 
													   <Card className="">
														<Card.Body className=" border border-primary text-center rounded">
														<div>
															<i className="bi bi-check-circle mg-b-20 fs-50 text-primary lh-1"></i>
															<h3 className="mt-3 text-primary">No events as yet!</h3>
															<p className="mt-3 mb-0">Your events will show here</p>
														</div>
														</Card.Body>
														</Card>
														:
														
														<div className="container">
															
															<ul className="notification">
																{org?.timeline?.map((event, index) => (
																<li key={event._id}>
																	<div className="notification-time">
																		<span className="date">{formatDate(event.timestamp)}</span>
																		<span className="time">{moment(event.timestamp).format('HH:mm')}</span>
																	</div>
																	<div className="notification-icon">
																		<Link href="#!"></Link>
																	</div>
																	<div className="notification-body">
																		<div className="media mt-0">
																			<div className="avatar avatar-md avatar-rounded me-3 shadow d-none d-lg-block">
																					<img
																						alt="avatar"
																						className="rounded-circle"
																						src={event.staff.profileImage}
																					/>																				
																			</div>
																			<div className="media-body">
																				<div className="d-flex align-items-center">
																					<div className="mt-0">
																						<h5 className="mb-1 fs-15 fw-semibold text-dark">
																							{event.staff.fullNames}
																						</h5>
																						<p className="mb-0 tx-13 mb-0 text-muted">
																							{event.description}
																						</p>
																					</div>																					
																				</div>
																			</div>
																		</div>
																	</div>
																</li>))}																
															</ul>

															{org?.timeline?.length > 20 &&
															<div className="text-center mb-4">
																<Button className="btn btn-primary">Load more</Button>
															</div>}
														</div>
														}
													
												</Tab.Pane>
												<Tab.Pane eventKey="Profile" className="main-content-body  p-0 border-0">													
														<Card>
															<Card.Body className="border-0">
															
																<div className="mb-4 main-content-label text-primary">
																	CIPC Information
																</div>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Registered Name
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.registeredName || '' }
																		isInvalid={!!profileErrors?.registeredName}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.registeredName = e.target.value;
																			return { ...org };
																			})}}
																		/>
																		{profileErrors?.registeredName && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.registeredName}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>																
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Registration Nr
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.registrationNumber || '' }
																		isInvalid={!!profileErrors?.registrationNumber}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.registrationNumber = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.registrationNumber && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.registrationNumber}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
																{org?.registrationNumberConverted && 
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Registration Number Converted
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.registrationNumberConverted || '' }
																		isInvalid={!!profileErrors?.registrationNumberConverted}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.registrationNumberConverted = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.registrationNumberConverted && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.registrationNumberConverted}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>}																
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Tax Number
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.taxNo || '' }
																		isInvalid={!!profileErrors?.taxNo}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.taxNo = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.taxNo && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.taxNo}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Company Type
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.companyType || '' }
																		isInvalid={!!profileErrors?.companyType}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.companyType = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.companyType && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.companyType}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Registration Date
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="date"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.registrationDate ? moment(org?.registrationDate).format('YYYY-MM-DD') : '' }
																		isInvalid={!!profileErrors?.registrationDate}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.registrationDate = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.registrationDate && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.registrationDate}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>  
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Business Start Date
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="date"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.businessStartDate ? moment(org?.businessStartDate).format('YYYY-MM-DD') : '' }
																		isInvalid={!!profileErrors?.businessStartDate}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.businessStartDate = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.businessStartDate && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.businessStartDate}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Financial Year End
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.financialYearEnd || '' }
																		isInvalid={!!profileErrors?.financialYearEnd}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.financialYearEnd = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.financialYearEnd && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.financialYearEnd}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Operation Status
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.operatingStatus || '' }
																		isInvalid={!!profileErrors?.operatingStatus}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.operatingStatus = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.operatingStatus && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.operatingStatus}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Director Count
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		disabled={org?.companyVerified}
																		value={org?.directorCount || '' }
																		isInvalid={!!profileErrors?.directorCount}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.directorCount = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.directorCount && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.directorCount}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 
																<FormGroup className="form-group">
																<Row className="row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">VAT Registration</Form.Label>
																</Col>
																<Col md={9}>
																	<Form.Select
																	className="form-control"
																	disabled={org?.companyVerified}
																	value={org?.isVatRegistered || false}
																	isInvalid={!!profileErrors?.isVatRegistered}
																	onChange={(e) => {
																		setOrg(org => ({
																		...org,
																		isVatRegistered: e.target.value === 'true'
																		}));
																	}}
																	>
																	<option value={false}>Not VAT Registered</option>
																	<option value={true}>VAT Registered</option>
																	</Form.Select>
																	{profileErrors?.isVatRegistered && (
																	<Form.Control.Feedback type='invalid'>
																		{profileErrors.isVatRegistered}
																	</Form.Control.Feedback>)}
																</Col>
																</Row>
																</FormGroup>

																{org?.isVatRegistered && (
																<FormGroup className="form-group">
																<Row className="row-sm">
																	<Col md={3}>
																	<Form.Label>VAT Number</Form.Label>
																	</Col>
																	<Col md={9}>
																	<Form.Control
																		type="text"
																		value={org?.vatNumber || ''}
																		isInvalid={!!profileErrors?.vatNumberVerified}
																		disabled={org?.vatNumberVerified}
																		onChange={(e) => setOrg({...org, vatNumber: e.target.value})}
																	/>
																	{profileErrors?.vatNumberVerified && (
																	<Form.Control.Feedback type='invalid'>
																		{profileErrors.vatNumberVerified}
																	</Form.Control.Feedback>)}
																	
																	{!org?.vatNumberVerified && (
																	<>
																		<div className="form-text text-danger">
																			<p>VAT number requires verification by accountant<u className="text-primary ms-1" style={{cursor: 'pointer'}}onClick={() => setShowModal(true)}>Send Verification</u></p>
																		</div>

																		<VatVerificationModal
																		    vatNumber={org.vatNumber}
																			show={showModal}
																			onHide={() => setShowModal(false)}
																			onSubmit={(accountantDetails) => {
																			dispatch(verifyVatNr({
																				vatNumber: accountantDetails.vatNumber,
																				accountantEmail: accountantDetails.email,
																				accountantName: accountantDetails.name
																			}));
																			}}
																		/>
																	</>
																	)}
																	
																	{org?.vatNumberVerifiedAt && (
																		<div className="form-text">
																		Verified on: {moment(org.vatNumberVerifiedAt).format('MMMM Do YYYY, HH:mm')} by: {org.vatNumberVerifiedByName} with email: {org.vatNumberVerifiedByEmail}
																		</div>
																	)}
																	</Col>
																</Row>
																</FormGroup>)}  																

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Trading As
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"	
																		disabled={org?.tradingNameVerified}																	
																		value={org?.tradingName || '' }
																		isInvalid={!!profileErrors?.tradingName}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.tradingName = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.tradingName && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.tradingName}
																		</Form.Control.Feedback>)}
																		{!org?.tradingNameVerified && (
																		<div className="form-text text-danger">
																			Trading name not verified
																		</div>)}
																		{org?.tradingNameVerifiedAt && (
																		<div className="form-text">
																			Verified on: {moment(org.tradingNameVerifiedAt).format('MMMM Do YYYY, HH:mm')}
																		</div>)}
																	</Col>
																	</Row>
																</FormGroup>

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Website
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"  
																		disabled={org?.websiteUrlVerfied} 
																		isInvalid={profileErrors?.websiteUrl}                              
																		value={org?.websiteUrl || '' }                                          
																		onChange={(e) => {
																			setOrg((org) => {
																			org.websiteUrl = e.target.value;
																			return { ...org };
																			})}}
																		/>
																		{profileErrors?.websiteUrl && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.websiteUrl}
																		</Form.Control.Feedback>)}
																		{!org?.websiteUrlVerfied && (
																		<div className="form-text text-danger">
																			Website not verified
																		</div>)}
																		{org?.websiteUrlVerifiedAt && (
																		<div className="form-text">
																			Verified on: {moment(org.websiteUrlVerifiedAt).format('MMMM Do YYYY, HH:mm')}
																		</div>)}
																	</Col>
																	</Row>
																</FormGroup>															
																
															</Card.Body>
														</Card>

														<Card>
															<Card.Body className="border-0">
														    	<div className="mb-4 main-content-label text-primary">
																	Social Info
																</div>
																
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Facebook
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		isInvalid={profileErrors?.facebookPageUrl} 
																		placeholder="https://facebook.com/"
																		value={org?.facebookPageUrl || '' }
																		onChange={(e) => {
																			setOrg((org) => {
																			org.facebookPageUrl = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.facebookPageUrl && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.facebookPageUrl}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>                           
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Instagram
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		isInvalid={profileErrors?.instagramPageUrl} 
																		placeholder="https://instagram.com/"
																		value={org?.instagramPageUrl || '' }
																		onChange={(e) => {
																			setOrg((org) => {
																			org.instagramPageUrl = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.instagramPageUrl && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.instagramPageUrl}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>                                  
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		X.com
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		placeholder="https://x.com/"
																		isInvalid={profileErrors?.twitterPageUrl} 
																		value={org?.twitterPageUrl || '' }
																		onChange={(e) => {
																			setOrg((org) => {
																			org.twitterPageUrl = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.twitterPageUrl && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.twitterPageUrl}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Tiktok
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		isInvalid={profileErrors?.tiktokPageUrl} 
																		placeholder="https://tiktok.com/"
																		value={org?.tiktokPageUrl || '' }
																		onChange={(e) => {
																			setOrg((org) => {
																			org.tiktokPageUrl = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.tiktokPageUrl && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.tiktokPageUrl}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>																
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Youtube
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"
																		isInvalid={profileErrors?.youtubePageUrl} 
																		placeholder="https://youtube.com/"
																		value={org?.youtubePageUrl || '' }
																		onChange={(e) => {
																			setOrg((org) => {
																			org.youtubePageUrl = e.target.value;
																			return { ...org };
																		})}}
																		/>
																		{profileErrors?.youtubePageUrl && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.youtubePageUrl}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>  
															</Card.Body>
														</Card>	

														<Card>
															<Card.Body className="border-0">
															<div className="mb-4 main-content-label text-primary">
																	About Us
																</div>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Description
																		</Form.Label>
																	</Col>
																	<Col md={9}>																		
																		<textarea
																		className="form-control"
																		name="example-textarea-input"
																		rows="10"
																		style={{ minHeight: '100px' }}
																		value={org?.description || '' }
																		isInvalid={!!profileErrors?.description}
																		onChange={(e) => {
																			setOrg((org) => {
																			org.description = e.target.value;
																			return { ...org };
																		})}}
																		></textarea>
																	</Col>
																	</Row>
																</FormGroup>  
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		About
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<textarea
																		className="form-control"
																		name="example-textarea-input"
																		rows="10"
																		style={{ minHeight: '100px' }}
																		value={org?.aboutUs || '' }
																		onChange={(e) => {
																			setOrg((org) => {
																			org.aboutUs = e.target.value;
																			return { ...org };
																		})}}
																		></textarea>
																	</Col>
																	</Row>
																</FormGroup>  
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Why Choose Us
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																    	<textarea
																		className="form-control"
																		name="example-textarea-input"
																		rows="10"
																		style={{ minHeight: '100px' }}
																		value={org?.whyChooseUs || '' }
																		onChange={(e) => {
																		setOrg(org => ({...org, whyChooseUs: e.target.value}))
																		}}
																		></textarea>
																	</Col>
																	</Row>
																</FormGroup> 
															</Card.Body>
														</Card>		

														<Card>
															<Card.Body className="border-0">
															    <div className="mb-4 main-content-label text-primary">
																	Organization Statistics
																</div> 
																
																{org?.statistics?.length > 0 ? (
																<>
																	{org?.statistics?.map((stat, index) => (
																	<Row key={index} className="mb-2 align-items-center">
																		<Col md={4} className="mb-2 mb-md-0">
																		<Form.Control
																			placeholder="Name"
																			value={stat.name}
																			isInvalid={!!profileErrors[`statistics[${index}].name`]}
																			onChange={(e) => updateStatistic(index, 'name', e.target.value)}
																		/>
																		<Form.Control.Feedback type="invalid">
																			{profileErrors[`statistics[${index}].name`]}
																		</Form.Control.Feedback>
																		</Col>
																		<Col md={4} className="mb-2 mb-md-0">
																		<Form.Control
																			placeholder="Value"
																			value={stat.value}
																			isInvalid={!!profileErrors[`statistics[${index}].value`]}
																			onChange={(e) => updateStatistic(index, 'value', e.target.value)}
																		/>
																		<Form.Control.Feedback type="invalid">
																			{profileErrors[`statistics[${index}].value`]}
																		</Form.Control.Feedback>
																		</Col>
																		<Col md={3} className="mb-2 mb-md-0">
																		<Dropdown>
																			<Dropdown.Toggle
																			variant="outline-primary"
																			className={`form-control w-100 ${
																				profileErrors[`statistics[${index}].icon`] ? 'is-invalid' : ''
																			}`}
																			>
																			{stat.icon ? (
																				<>
																				<i className={`fas ${stat.icon} me-2`}></i>
																				{icons.find((icon) => icon.value === stat.icon)?.label}
																				</>
																			) : (
																				'Select Icon'
																			)}
																			</Dropdown.Toggle>
																			<Dropdown.Menu>
																			{icons.map((icon) => (
																				<Dropdown.Item
																				key={icon.value}
																				onClick={() => updateStatistic(index, 'icon', icon.value)}
																				>
																				<i className={`fas ${icon.value} me-2`}></i>
																				{icon.label}
																				</Dropdown.Item>
																			))}
																			</Dropdown.Menu>
																		</Dropdown>
																		{profileErrors[`statistics[${index}].icon`] && (
																			<div className="invalid-feedback d-block">
																			{profileErrors[`statistics[${index}].icon`]}
																			</div>
																		)}
																		</Col>
																		<Col md={1}>
																		<Button variant="danger" onClick={() => removeStatistic(index)} className="w-100">
																			<i className="fas fa-times"></i>
																		</Button>
																		{profileErrors[`statistics[${index}].icon`] && (
																			<div className="invalid-feedback d-block mt-4"></div>
																		)}
																		</Col>
																	</Row>
																	))}
																	<Row className="mt-3">
																		<Col className="text-end">
																			<Button variant="primary" onClick={addStatistic}>
																			<i className="fas fa-plus me-2"></i>Add Statistic
																			</Button>
																		</Col>
																	</Row>
																</>
																) : (
																<>
																	<div className="text-center mt-4">
																	<h5 className="text-muted">No organization statistics</h5>
																	</div>
																	<Row>
																	<Col className="text-end">
																		<Button variant="primary" onClick={addStatistic}>
																		<i className="fas fa-plus me-2"></i>Add Statistic
																		</Button>
																	</Col>
																	</Row>
																</>
																)}															
															</Card.Body>
														</Card>	

														<Card>
														<Card.Body>
															<div className="mb-4 main-content-label text-primary">
															Categories Limitations
															</div>
															<Select
															isMulti
															options={categories[org?.type]?.subcategories?.map(cat => ({
																value: cat.label || cat,
																label: cat.label || cat
															})) || []}
															value={org?.categories?.map(cat => ({ value: cat, label: cat }))}
															onChange={selected => setOrg({
																...org,
																categories: selected.map(opt => opt.value)
															})}
															name="state"
															className="js-example-placeholder-multiple w-full js-states"
															menuPlacement='auto' 
															classNamePrefix="Select2"
															placeholder="Select categories..."
															/>
															{profileErrors?.categories && (
															<div className="invalid-feedback d-block">{profileErrors.categories}</div>
															)}
														</Card.Body>
														</Card>
														
														<Card>
															<Card.Body className="border-0">
															<Row className="mb-4">
																<Col md={6}>                          
																	<Form.Label
																	htmlFor="formFile"
																	className="form-label"
																	>
																	Upload New Logo
																	</Form.Label>
																	<Form.Control
																	className="form-control"
																	type="file"
																	accept="image/*"
																	id="logoFile"
																	onChange={(e) => {
																		const file = e.target.files[0];		
																		if (!file) return;		
																		dispatch(uploadLogo(file));
																		e.target.value = ''}}
																	/>
																	<Form.Text muted>
																	{org?.logoLastUpdated ? moment(org.logoLastUpdated).format('LLL') : 'No logo uploaded'}
																	</Form.Text>                         
																</Col>																
																</Row>
																
															</Card.Body>
														</Card>		

														<FormGroup className="form-group float-end mb-5">
															<Row className="row-sm">
																	<Col md={12}>																		
																		<Button onClick={handleProfileSave} className="btn btn-primary mb-1">
																		  Save
																		</Button>
																	</Col>                                      
															</Row>
														</FormGroup> 									

												</Tab.Pane>
												<Tab.Pane eventKey="Locations" className="main-content-body p-0 border-0">												
														
															{addLocation && session?.user?.isDirector ?    
															<>
															<Card>                           
																<Card.Body className="border-0">
																																
																	<div className="mb-4 main-content-label text-primary">
																		Location Details
																	</div>
																	<FormGroup className="form-group">
																		<Row className="row-sm">
																			<Col md={3}>
																			<Form.Label className="form-label">Name</Form.Label>
																			</Col>
																			<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				value={newLocation.name}
																				isInvalid={!!validationErrors.name}
																				onChange={(e) => {
																				setNewLocation((newLocation) => {
																					newLocation.name = e.target.value;
																					return { ...newLocation };
																				});
																				}}
																			/>
																			{validationErrors?.name && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.name}
																			</Form.Control.Feedback>)}
																			</Col>
																		</Row>
																	</FormGroup> 
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Is Head Office
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																			<select className="form-control" 
																				value={newLocation.isHeadOffice} 
																				onChange={(e) => {
																				setNewLocation((newLocation) => {
																					newLocation.isHeadOffice = e.target.value;
																					return { ...newLocation };
																				})}} >																			
																				<option value="true">Yes</option>
																				<option value="false">No</option>																	                               
																			</select>
																		</Col>
																		</Row>
																	</FormGroup>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																			<Col md={3}>
																				<Form.Label className="form-label">
																				Active
																				</Form.Label>
																			</Col>
																			<Col md={9}>
																				<select className="form-control" 
																					value={newLocation.active} 
																					onChange={(e) => {
																					setNewLocation((newLocation) => {
																						newLocation.active = e.target.value;
																						return { ...newLocation };
																					})}} >																			
																					<option value="true">Yes</option>
																					<option value="false">No</option>																	                               
																				</select>
																			</Col>
																		</Row>
																	</FormGroup>

																	{newLocation?.active?.toString() == 'false' &&
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Closed Date
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="date"
																			className="form-control"   	
																			isInvalid={!!validationErrors.closedDate}														                                                
																			value={newLocation?.closedDate ? moment(newLocation?.closedDate).format('YYYY-MM-DD') : ''}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.closedDate = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.closedDate && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.closedDate}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>}
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Address Line 1
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control"   
																			isInvalid={!!validationErrors.addressLine1}															                                                
																			value={newLocation.addressLine1}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.addressLine1 = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.addressLine1 && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.addressLine1}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Address Line 2
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control" 
																			isInvalid={!!validationErrors.addressLine2}	                                                   
																			value={newLocation.addressLine2}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.addressLine2 = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.addressLine2 && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.addressLine2}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>
																	<FormGroup className="form-group ">																	
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Suburb
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control"  
																			isInvalid={!!validationErrors.suburb}                                                  
																			value={newLocation.suburb}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.suburb = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.suburb && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.suburb}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			City
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control" 
																			isInvalid={!!validationErrors.city}                                                    
																			value={newLocation.city}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.city = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.city && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.city}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Zip
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="number"
																			className="form-control"  
																			isInvalid={!!validationErrors.zip}                                                  
																			value={newLocation.zip}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.zip = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.zip && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.zip}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	 </FormGroup>
																	<FormGroup className="form-group ">
																	{newLocation?.country == 'South Africa' ?
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Province
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select 
																				className="form-control" 
																			    isInvalid={!!validationErrors.province}
																				value={newLocation.province} 
																				onChange={(e) => {
																				setNewLocation((newLocation) => {
																					newLocation.province = e.target.value;
																					return { ...newLocation };
																				})}} >
																				<option value="" disabled>Please choose province</option>
																				<option value="Gauteng">Gauteng</option>
																				<option value="Western Cape">Western Cape</option>
																				<option value="Eastern Cape">Eastern Cape</option>
																				<option value="Free State">Free State</option>   
																				<option value="Limpopo">Limpopo</option>  
																				<option value="Mpumalanga">Mpumalanga</option>    
																				<option value="Northern Cape">Northern Cape</option>      
																				<option value="North West">North West</option>                                  
																			</Form.Select>
																			{validationErrors?.province && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.province}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																		: 
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Province/State
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control"
																			isInvalid={!!validationErrors.province}                                                    
																			value={newLocation.province}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.province = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.province && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.province}
																			</Form.Control.Feedback>)}	
																		</Col>
																		</Row>}
																	</FormGroup>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Country
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Select
																			className="form-control"
																			isInvalid={!!validationErrors.country}
																			value={newLocation.country || ''}
																			onChange={(e) => {
																			const selectedCountry = countries.find(
																				(country) => country.name === e.target.value
																			);

																			setNewLocation((prevLocation) => ({
																				...prevLocation,
																				country: selectedCountry ? selectedCountry.name : '',
																				countryCode: selectedCountry ? selectedCountry.code : '',
																				province: '', // Reset province when country changes
																			}));
																			}}
																		>
																			<option value="" disabled>Please choose a country</option>
																			{countries.map((country) => (
																			<option key={country.code} value={country.name}>
																				{country.name}
																			</option>
																			))}
																		</Form.Select>
																	     	{validationErrors?.country && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.country}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>
																	<FormGroup className="form-group">
																	<Row className="row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">Phone Nr</Form.Label>
																	</Col>
																	<Col md={9}>
																		<InputGroup>
																		<Dropdown>
																			<Dropdown.Toggle variant="light" id="country-dropdown">
																			{newLocation?.phoneNrPrefix || '+27'}
																			</Dropdown.Toggle>
																			<Dropdown.Menu>
																			{countries.map(country => (
																				<Dropdown.Item 
																				key={country.code}
																				onClick={() => {
																					setNewLocation((newLocation) => {																					
																					newLocation.phoneNrPrefix = country.ext;
																					return { ...newLocation };
																				})}} 																			
																				>
																				{country.name} ({country.ext})
																				</Dropdown.Item>
																			))}
																			</Dropdown.Menu>
																		</Dropdown>
																		<Form.Control
																				type="number"
																				className="form-control"   
																				isInvalid={!!validationErrors.phoneNr}                              
																				value={newLocation.phoneNr || ''}   																		
																				onChange={(e) => {
																					setNewLocation((newLocation) => {
																					newLocation.phoneNr = e.target.value;
																					return { ...newLocation };
																				})}}                                     
																				
																			/>
																		   	{validationErrors?.phoneNr && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.phoneNr}
																			</Form.Control.Feedback>)}	
																		</InputGroup>																	
																	</Col>
																	</Row>
																	</FormGroup>															
																	{org?.type == 'Dealership' && org?.offerFinancialProducts &&																																
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label me-2">
																			Dealership Signio Code
																			</Form.Label>
																			<OverlayTrigger placement="right" overlay={<Tooltip>This allow agizzit to submit finance applications directly to Signio</Tooltip>}>
																				<i className="fa fa-info-circle"></i>
																			</OverlayTrigger>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control"  
																			isInvalid={!!validationErrors.signioCode}                                                     
																			value={newLocation.signioCode}    
																			onChange={(e) => {
																				setNewLocation((newLocation) => {
																				newLocation.signioCode = e.target.value;
																				return { ...newLocation };
																			})}}                                      
																			/>
																			{validationErrors?.signioCode && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.signioCode}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>}
																
																  </Card.Body>
															</Card>
															<Card>                           
																  <Card.Body className="border-0">																

																	<div className="mb-4 main-content-label text-primary">
																		Operating Hours
																	</div>

																	{/* MONDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Monday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox"																				
																				checked={newLocation?.operatingHours?.mondayIsOpen || false}                                               
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						mondayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.mondayIsOpen && (<>
																	<FormGroup className="form-group">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Monday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.mondayOpening}
																			value={newLocation?.operatingHours?.mondayOpening ? timezone(newLocation.operatingHours.mondayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					mondayOpening: time.format(),
																				},
																				}));
																			}}
																			/>
																		    {validationErrors?.mondayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.mondayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Monday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.mondayClosing}
																			value={newLocation?.operatingHours?.mondayClosing ? timezone(newLocation.operatingHours.mondayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					mondayClosing: time.format(),
																				},
																				}));
																			}}                                 
																			/>
																			{validationErrors?.mondayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.mondayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}
																	{/* THUESDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Thuesday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">																		
																			<input
																				type="checkbox"
																				checked={newLocation?.operatingHours?.thuesdayIsOpen || false} 
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						thuesdayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.thuesdayIsOpen && (<>
																	<FormGroup className="form-group">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Thuesday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.thuesdayOpening}
																			value={newLocation?.operatingHours?.thuesdayOpening ? timezone(newLocation.operatingHours.thuesdayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					thuesdayOpening: time.format(),
																				},
																				}));
																			}}																		                                    
																			/>
																			{validationErrors?.thuesdayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.thuesdayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Thuesday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.thuesdayClosing}
																			value={newLocation?.operatingHours?.thuesdayClosing ? timezone(newLocation.operatingHours.thuesdayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					thuesdayClosing: time.format(),
																				},
																				}));
																			}}                                   
																			/>
																			{validationErrors?.thuesdayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.thuesdayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}
																	{/* WEDNESDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Wednesday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox"
																				checked={newLocation?.operatingHours?.wednesdayIsOpen} 
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						wednesdayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.wednesdayIsOpen && (<>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Wednesday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.wednesdayOpening}
																			value={newLocation?.operatingHours?.wednesdayOpening ? timezone(newLocation.operatingHours.wednesdayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					wednesdayOpening: time.format(),
																				},
																				}));
																			}}																		                                 
																			/>
																			{validationErrors?.wednesdayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.wednesdayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Wednesday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.wednesdayClosing}
																			value={newLocation?.operatingHours?.wednesdayClosing ? timezone(newLocation.operatingHours.wednesdayClosing).tz(clientTimeZone).format('HH:mm') : '' }  
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					wednesdayClosing: time.format(),
																				},
																				}));
																			}}                              
																			/>
																			{validationErrors?.wednesdayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.wednesdayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}
																	{/* THURSDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Thursday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox"
																				checked={newLocation?.operatingHours?.thursdayIsOpen || false} 
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						thursdayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.thursdayIsOpen && (<>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Thursday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.thursdayOpening}
																			value={newLocation?.operatingHours?.thursdayOpening ? timezone(newLocation.operatingHours.thursdayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					thursdayOpening: time.format(),
																				},
																				}));
																			}}																		                                    
																			/>
																			{validationErrors?.thursdayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.thursdayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Thursday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.thursdayClosing}
																			value={newLocation?.operatingHours?.thursdayClosing ? timezone(newLocation.operatingHours.thursdayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					thursdayClosing: time.format(),
																				},
																				}));
																			}}                              
																			/>
																			{validationErrors?.thursdayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.thursdayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}
																	{/* FRIDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Friday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox"
																				checked={newLocation?.operatingHours?.fridayIsOpen || false}       
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						fridayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.fridayIsOpen && (<>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Friday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.fridayOpening}
																			value={newLocation?.operatingHours?.fridayOpening ? timezone(newLocation.operatingHours.fridayOpening).tz(clientTimeZone).format('HH:mm') : '' }  
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					fridayOpening: time.format(),
																				},
																				}));
																			}}																                                     
																			/>
																			{validationErrors?.fridayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.fridayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Friday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.fridayClosing}
																			value={newLocation?.operatingHours?.fridayClosing ? timezone(newLocation.operatingHours.fridayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					fridayClosing: time.format(),
																				},
																				}));
																			}}                                
																			/>
																			{validationErrors?.fridayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.fridayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}    
																	{/* SATERDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Saterday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox"
																				checked={newLocation?.operatingHours?.saterdayIsOpen}   
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						saterdayIsOpen: e.target.checked
																					}
																					}));
																				}}                                           
																				
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.saterdayIsOpen && (<>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Saterday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.saterdayOpening}
																			value={newLocation?.operatingHours?.saterdayOpening ? timezone(newLocation.operatingHours.saterdayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					saterdayOpening: time.format(),
																				},
																				}));
																			}}																		                            
																			/>
																			{validationErrors?.saterdayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.saterdayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Saterday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.saterdayClosing}
																			value={newLocation?.operatingHours?.saterdayClosing ? timezone(newLocation.operatingHours.saterdayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					saterdayClosing: time.format(),
																				},
																				}));
																			}}																		                                 
																			/>
																			{validationErrors?.saterdayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.saterdayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}    
																	{/* SUNDAY */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Sunday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox"
																				checked={newLocation?.operatingHours?.sundayIsOpen || false} 
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						sundayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.sundayIsOpen && (<>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Sunday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.sundayOpening}
																			value={newLocation?.operatingHours?.sundayOpening ? timezone(newLocation.operatingHours.sundayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					sundayOpening: time.format(),
																				},
																				}));
																			}}																		                                   
																			/>
																			{validationErrors?.sundayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.sundayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Sunday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.sundayClosing}
																			value={newLocation?.operatingHours?.sundayClosing ? timezone(newLocation.operatingHours.sundayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					sundayClosing: time.format(),
																				},
																				}));
																			}}                                  
																			/>
																			{validationErrors?.sundayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.sundayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup></>)}   
																	{/* PUBLIC HOLIDAYS */}       
																	<FormGroup className="form-group">
																	<Row className=" row-sm">
																		<Col md={3}>
																		<Form.Label className="form-label">
																			Open on Public Holiday
																		</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="custom-controls-stacked">                                     
																			<label className="ckbox">
																			<input
																				type="checkbox" 
																				checked={newLocation?.operatingHours?.publicHolidayIsOpen || false} 
																				onChange={(e) => {
																					setNewLocation(prev => ({
																					...prev,
																					operatingHours: {
																						...prev.operatingHours,
																						publicHolidayIsOpen: e.target.checked
																					}
																					}));
																				}}
																			/>
																			<span>
																				{" "}                                        
																			</span>
																			</label>
																		</div>
																		</Col>
																	</Row>
																	</FormGroup>                                        
																	{newLocation?.operatingHours?.publicHolidayIsOpen && (<>
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Public Holiday Open At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control"
																			isInvalid={!!validationErrors.publicHolidayOpening}
																			value={newLocation?.operatingHours?.publicHolidayOpening ? timezone(newLocation.operatingHours.publicHolidayOpening).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					publicHolidayOpening: time.format(),
																				},
																				}));
																			}}                                     
																			/>
																			{validationErrors?.publicHolidayOpening && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.publicHolidayOpening}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>  
																	<FormGroup className="form-group ">
																		<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																				Public Holiday Closing At
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Control
																			type="time"
																			className="form-control" 
																			isInvalid={!!validationErrors.publicHolidayClosing}
																			value={newLocation?.operatingHours?.publicHolidayClosing ? timezone(newLocation.operatingHours.publicHolidayClosing).tz(clientTimeZone).format('HH:mm') : '' }
																			onChange={(e) => {
																				const time = timezone.tz(e.target.value, 'HH:mm', clientTimeZone).utc();
																				setNewLocation((prev) => ({
																				...prev,
																				operatingHours: {
																					...prev.operatingHours,
																					publicHolidayClosing: time.format(),
																				},
																				}));
																			}}                                      
																			/>
																			{validationErrors?.publicHolidayClosing && (
																			<Form.Control.Feedback type="invalid">
																			  {validationErrors.publicHolidayClosing}
																			</Form.Control.Feedback>)}
																		</Col>
																		</Row>
																	</FormGroup>   

																	<div className="mb-4 main-content-label text-primary">
																		Public Holidays Open
																	</div>
																	{newLocation?.publicHolidays?.map((holiday, index) => (
																		<FormGroup key={index} className="form-group">
																			<Row className="row-sm">
																			<Col md={4}>
																				<Form.Label className="form-label">
																				{`${holiday.holidayName} (${moment(holiday.holidayDate).format('DD MMM YYYY')})`}
																				</Form.Label>
																			</Col>
																			<Col md={8}>
																				<div className="custom-controls-stacked">
																				<label className="ckbox">
																					<input
																					type="checkbox"
																					checked={holiday.isOpen}
																					onChange={(e) => {
																						setNewLocation((prev) => {
																						const updatedHolidays = prev.publicHolidays.map((h, i) =>
																							i === index ? { ...h, isOpen: e.target.checked } : h
																						);
																						return { ...prev, publicHolidays: updatedHolidays };
																						});
																					}}
																					/>
																					<span></span>
																				</label>
																				</div>
																			</Col>
																			</Row>
																		</FormGroup>
																		))}

																	</>)}																
																	                         
																</Card.Body>
															</Card>
															<FormGroup className="form-group float-end mb-5">
																		<Row className=" row-sm">                                      
																		<Col md={12}>
																			{" "}
																			<Button onClick={(e) => {
																				e.preventDefault();
																				setValidationErrors({});
																				setLocation(false)
																			}}
																			className="btn btn-secondary mb-1">
																			Cancel
																			</Button>{" "}
																			<Button onClick={handleSaveLocation}
																			className="btn btn-primary mb-1">
																			Submit
																			</Button>{" "}
																		</Col>                                      
																		</Row>
															</FormGroup>
															</>
															: 
														    org?.locations?.length == 0 ? 	
															<Card>											
																<Card.Body className=" border border-primary text-center rounded">															
																	<i className="bi bi-info-circle mg-b-20 fs-50 text-primary lh-1"></i>
																	<h3 className="mt-3 text-primary">No Location details as yet!</h3>
																	<p className="mt-3 mb-0">Please add your organization location details</p>	
																	{session?.user?.isDirector &&
																		<Button onClick={(e) => {e.preventDefault();setLocation(true)}} className="btn btn-primary mt-3">
																				Add Location
																		</Button>}														
																</Card.Body>
															</Card>	
															:
															<>			
															{org?.locations?.map((location, i) => (   
															<Card key={i} onClick={() => handleLocationClick(location)}>  	
															<Card.Body className="border-0">                              
																<Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y'>             
																<Col>
																	<ListGroup as="ol" className="list-group list-group-flush" key={'md'}>
																		<ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">            
																			<div className="ms-2 me-auto d-none d-md-block">
																			<div className="fw-bold">Name</div>                
																			</div>
																			<div className="ms-2 mx-2">
																			<div className="fw-bold">{location?.name}</div>                
																			</div>              
																		</ListGroupItem>
																		<ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">            
																			<div className="ms-2 me-auto d-none d-md-block">
																			<div className="fw-bold">Type</div>                
																			</div>
																			<div className="ms-2 mx-2">
																			<div className="fw-bold">{location?.type}</div>                
																			</div>              
																		</ListGroupItem> 
																		<ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																			<div className="ms-2 me-auto d-none d-md-block">
																				<div className="fw-bold">Added At</div>                
																			</div>
																			<div className="ms-2 mx-2">
																				<div className="fw-bold">{moment(location?.activeDate).format('DD MMM YYYY')}</div>                
																			</div>
																		</ListGroupItem>
																		<ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																			<div className="ms-2 me-auto d-none d-md-block">
																			<div className="fw-bold">Rating</div>                
																			</div>
																			<div className="ms-2 mx-2">
																			<div className="d-flex flex-wrap align-items-center justify-content-between">																				
																				<Stack spacing={1} className="rating-stars block my-rating-7 flex-wrap">
																					<Rating name="half-rating-read" value={location?.rating} max={5} size="large" readOnly />
																				</Stack>
																			</div>              
																			</div>
																		</ListGroupItem>
																		<ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																			<div className="ms-2 me-auto d-none d-md-block">
																			<div className="fw-bold">Active</div>                
																			</div>
																			<div className="ms-2 mx-2">
																				{location?.active ? <div className="fw-bold text-success">Yes</div> : <div className="fw-bold text-danger">No</div>}                                 
																			</div>
																		</ListGroupItem>  
																	</ListGroup>  
																</Col>
															</Row>  
															</Card.Body>
															</Card>                           
														     ))} 
															{session?.user?.isDirector &&
															<FormGroup className="form-group float-end">
																<Row className=" row-sm">
																<Col md={12}>
																	{" "}
																	<Button onClick={handleLocationCreate} className="btn btn-primary mb-1">
																	Add Location
																	</Button>{" "}
																</Col>                                      
																</Row>
															</FormGroup>}															
													    	</>}         
																											             
												</Tab.Pane>    
												<Tab.Pane eventKey="Settings" className="main-content-body  p-0 border-0">												
													<Card>
													<Card.Body className=" border-0" data-select2-id="12">														
														
														{org?.type == 'Dealership' ? 

														<>

                                                        <div className="main-content-label text-center mb-4">Dealership</div>

                                                         <FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Is IDA Member{"  "}
																<OverlayTrigger placement="right" overlay={<Tooltip>Indicates whether the organization is a member of the Independent Dealer Association (IDA). Being an IDA member ensures compliance with industry standards, enhances credibility, and provides access to exclusive benefits, including legal support, training, and financial services.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.isIdaMember} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.isIdaMember = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                     
																</select>
															</Col>
															</Row>
														</FormGroup>

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Is RMA Member{"  "}
																<OverlayTrigger placement="right" overlay={<Tooltip>Indicates whether the organization is a member of the Retail Motor Industry (RMI). RMI membership demonstrates adherence to industry standards, provides consumer trust through accredited services, and grants access to resources such as training, legal support, and industry representation.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.isRmiMember} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.isRmiMember = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                      
																</select>
															</Col>
															</Row>
														</FormGroup>
														
														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Accept Trade-in's{"  "}
																<OverlayTrigger placement="right" overlay={<Tooltip>Enable your clients to submit a trade-in for your review. You can then make an offer, which will be saved directly to the client's profile for easy reference</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.acceptTradeins} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.acceptTradeins = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                     
																</select>
															</Col>
															</Row>
														</FormGroup>														

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Provide Vehicle Finance{'  '}
																<OverlayTrigger placement="right" overlay={<Tooltip>Let your clients know that you offer vehicle financing and accept finance applications directly.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.provideFinance} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.provideFinance = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                   
																</select>
															</Col>
															</Row>
														</FormGroup>	

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Offer Financial Products{'  '}
																<OverlayTrigger placement="right" overlay={<Tooltip>Indicates whether the organization is authorized to offer financial products such as vehicle financing, insurance, or warranties. This requires compliance with financial regulations and accreditation, ensuring reliable and secure services for customers.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.offerFinancialProducts} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.offerFinancialProducts = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                      
																</select>
															</Col>
															</Row>
														</FormGroup>

														{org?.offerFinancialProducts?.toString() == "true" && 
														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Lock Finacial Products{'  '}
																<OverlayTrigger placement="right" overlay={<Tooltip>Indicates that financial products are locked, meaning clients cannot select their own financial products. The dealership will choose and manage these options on behalf of the client, ensuring a streamlined and controlled process.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.financialProductsLock} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.financialProductsLock = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                     
																</select>
															</Col>
															</Row>
														</FormGroup>}		

														<div className="main-content-label text-center mb-4">Secure Testdrive</div>																								

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Secure TestDrive{"  "}
																<OverlayTrigger placement="right" overlay={<Tooltip>This option uses facial recognition to ensure secure test drives at a designated location and time. It's designed for off-premises test drives.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.doTestDrives} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.doTestDrives = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                      
																</select>
															</Col>
															</Row>
														</FormGroup>														
																
														{org?.doTestDrives?.toString() == "true" && (
														<FormGroup className="form-group ">
														<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
															<Form.Label className="form-label">
																Test Drive Range (Km)
															</Form.Label>
															</Col>
															<Col md={3}>
															<Form.Control
																type="number"
																className="form-control"
																value={org?.testDriveRange} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.testDriveRange = e.target.value;
																	return { ...org };
																	})}}
															/>
															</Col>
														</Row>
														</FormGroup>)}

														</>														

														: null }
														{/* TODO AND OTHER TYPES */}
														{/* TODO ADD VEHICLES LIKE GOMES TO WORK OUT RATES BASED ON VEHICLE */}

														{/*GENERAL FOR ALL TYPES*/}
														
														<>

														<div className="main-content-label text-center mb-4">Deliveries</div>

														<FormGroup className="form-group">
														<Row className="row-sm">
														<Col md={3}/>
														<Col md={3}>
															<Form.Label className="form-label">
															Enable Deliveries{"  "}
															<OverlayTrigger placement="right" overlay={<Tooltip>Offer vehicle delivery service to your clients within specified range</Tooltip>}>
																<i className="fa fa-info-circle"></i>
															</OverlayTrigger>
															</Form.Label>
														</Col>
														<Col md={3}>
															<select className="form-control"
															value={org?.doDeliveries}
															onChange={(e) => {
																setOrg((org) => ({
																...org,
																doDeliveries: e.target.value
																}));
															}}>
															<option value='true'>Enabled</option>
															<option value='false'>Disabled</option>
															</select>
														</Col>
														</Row>
														</FormGroup>

														{org?.doDeliveries?.toString() == "true" && (
														<>
														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">Maximum Delivery Range (Km)</Form.Label>
															</Col>
															<Col md={3}>
																<Form.Control
																type="number"
																className="form-control"
																value={org?.deliveryRange}
																onChange={(e) => {
																	setOrg((org) => ({
																	...org,
																	deliveryRange: e.target.value
																	}));
																}}
																/>
															</Col>
															</Row>
														</FormGroup>

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">Free Delivery Range (Km)</Form.Label>
															</Col>
															<Col md={3}>
																<Form.Control
																type="number"
																className="form-control"
																value={org?.freeDeliveryRange}
																onChange={(e) => {
																	setOrg((org) => ({
																	...org,
																	freeDeliveryRange: e.target.value
																	}));
																}}
																/>
															</Col>
															</Row>
														</FormGroup>

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">Rate per Km</Form.Label>
															</Col>
															<Col md={3}>
																<Form.Control
																type="number"
																className="form-control"
																value={org?.ratePerKm}
																onChange={(e) => {
																	setOrg((org) => ({
																	...org,
																	ratePerKm: e.target.value
																	}));
																}}
																/>
															</Col>
															</Row>
														</FormGroup>
														</>
														)}

                                                        <div className="main-content-label text-center mb-4">Listings</div>
														
														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Show Previous Price{"  "}
																<OverlayTrigger placement="right" overlay={<Tooltip>Allow your clients to view the original &apos;Was&apos; price alongside the current price with price drops. Each listing remains adjustable for custom pricing</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.showPreviousPrice} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.showPreviousPrice = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                      
																</select>
															</Col>
															</Row>
														</FormGroup>														

														<div className="main-content-label text-center mb-4">Staff & Comissions</div>

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Show Purchase Price to Salesman{'  '}
																<OverlayTrigger placement="right" overlay={<Tooltip>This option allows the salesman to view the purchase price of the vehicle.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.showSalesmanPaidPrice} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.showSalesmanPaidPrice = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                    
																</select>
															</Col>
															</Row>
														</FormGroup>

														<FormGroup className="form-group">
															<Row className="row-sm">
															<Col md={3}/>
															<Col md={3}>
																<Form.Label className="form-label">
																Calculate Comissions{'  '}
																<OverlayTrigger placement="right" overlay={<Tooltip>This option requires the purchase price when loading a vehicle. It will be used to calculate custom commissions for each salesman based on their individual commission settings.</Tooltip>}>
																	<i className="fa fa-info-circle"></i>
																</OverlayTrigger>
																</Form.Label>                                        
															</Col>
															<Col md={3}>
																<select className="form-control" 
																value={org?.calComm} 
																onChange={(e) => {
																	setOrg((org) => {
																	org.calComm = e.target.value;
																	return { ...org };
																	})}}>
																<option value='true'>Enabled</option>
																<option value='false'>Disabled</option>                                     
																</select>
															</Col>
															</Row>
														</FormGroup>
														
														</>

														<FormGroup className="form-group float-end">
															<Row className=" row-sm">
															<Col md={12}>
																{" "}
																<Button
																onClick={handleSave}
																className="btn btn-primary mb-1"
																>
																Save
																</Button>{" "}
															</Col>                                      
															</Row>
														</FormGroup>
													
													</Card.Body>
													</Card>												
												</Tab.Pane>
												
												<Tab.Pane eventKey="Extras" className="main-content-body p-0 border-0">

												{org?.type === 'Dealership' && (<DealershipExtras extras={extras}/>)}
													
												</Tab.Pane>	
												<Tab.Pane eventKey="Banking" className="main-content-body  p-0 border-0">
												
												 <Card>
													{addAccount && session?.user?.isDirector ?                               
													<Card.Body className="border-0">  
														<Alert variant="" className="alert fade show alert-dismissible alert-solid-info mb-4">
														{" "}                               
														<span className="alert-inner--icon">
														<i className="fe fe-info"></i>
													</span>{" "}
													<span className="alert-inner--text">
														<strong>Heads up!</strong> All banking details gets verified and <strong>must</strong> belong to the company above!
													</span>
														</Alert>
														<Form className="form-horizontal">
														<div className="mb-4 main-content-label">
															Add new Bank
														</div>
														<FormGroup className="form-group ">
															<Row className=" row-sm">
															<Col md={3}>
																<Form.Label className="form-label">
																 Title Holder
																</Form.Label>
															</Col>
															<Col md={9}>
																<Form.Control
																type="text"
																className="form-control"  
																isInvalid={accountErrors?.name}
																disabled                                                  
																value={org?.registeredName || ''}      
																/>  
																{accountErrors?.name && (
																<Form.Control.Feedback type="invalid">
																	{accountErrors.name}
																</Form.Control.Feedback>)}                                
															</Col>
															</Row>
														</FormGroup> 
												
														<FormGroup className="form-group ">
															<Row className=" row-sm">
															<Col md={3}>
																<Form.Label className="form-label">
																Bank
																</Form.Label>
															</Col>
															<Col md={9}>
															<Form.Select
															className="form-control" 
															isInvalid={accountErrors?.name}
															value={newAccount.name}
															onChange={(e) => handleBankSelect(e.target.value)}
															>
															<option value="">Please choose bank</option>
															{banks.map(bank => (
															<option key={bank.name} value={bank.name}>
																{bank.name}
															</option>
															))}
															</Form.Select>
															   {accountErrors?.name && (
																<Form.Control.Feedback type="invalid">
																	{accountErrors.name}
																</Form.Control.Feedback>)}
															</Col>
															</Row>
														</FormGroup>
														<FormGroup className="form-group ">
															<Row className=" row-sm">
															<Col md={3}>
																<Form.Label className="form-label">
																Account Nr
																</Form.Label>
															</Col>
															<Col md={9}>
																<Form.Control
																type="number"
																className="form-control"   
																isInvalid={accountErrors?.accountNr}                                                 
																value={newAccount.accountNr}    
																onChange={(e) => {
																	setNewAccount((newAccount) => {
																	newAccount.accountNr = e.target.value;
																	return { ...newAccount };
																})}}                                      
																/>   
																{accountErrors?.accountNr && (
																<Form.Control.Feedback type="invalid">
																	{accountErrors.accountNr}
																</Form.Control.Feedback>)}                               
															</Col>
															</Row>
														</FormGroup>   
														<FormGroup className="form-group">
															<Row className="row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">Account Type</Form.Label>
																</Col>
																<Col md={9}>
																	<Form.Select
																	className="form-control"	
																	isInvalid={accountErrors?.accountType}																
																	value={newAccount.accountType}    
																	onChange={(e) => {
																		setNewAccount((newAccount) => {
																		newAccount.accountType = e.target.value;
																		return { ...newAccount };
																	})}}  
																	>
																	<option value='' disabled>Please select type</option>
																	<option value='Cheque'>Cheque</option>
																	<option value='Savings'>Savings</option>
																	</Form.Select>
																	{accountErrors?.accountType && (
																	<Form.Control.Feedback type="invalid">
																		{accountErrors.accountType}
																	</Form.Control.Feedback>)} 
																</Col>
															</Row>
														</FormGroup>  
														<FormGroup className="form-group ">
															<Row className=" row-sm">
															<Col md={3}>
																<Form.Label className="form-label">
																 Branch Code
																</Form.Label>
															</Col>
															<Col md={9}>
																<Form.Control
																type="number"
																className="form-control"   
																isInvalid={accountErrors?.branchCode}                                                 
																value={newAccount.branchCode}    
																onChange={(e) => {
																	setNewAccount((newAccount) => {
																	newAccount.branchCode = e.target.value;
																	return { ...newAccount };
																})}}                                      
																/>                                  
															</Col>
															</Row>
														</FormGroup>                       
														<FormGroup className="form-group float-end">
															<Row className="row-sm">
															<Col md={12}>															
																<Button onClick={(e) => {e.preventDefault();setAddAccount(false)}} className="btn btn-secondary me-2">
																  Cancel
																</Button>

																<Button onClick={handleAddNewAccount}
																className="btn btn-primary">
																Submit
																</Button>
															</Col>                                      
															</Row>
														</FormGroup>
														</Form>  

													</Card.Body>
														: org?.bankAccounts?.length == 0 ? 													
													<Card.Body className=" border border-primary text-center rounded">															
														<i className="bi bi-info-circle mg-b-20 fs-50 text-primary lh-1"></i>
														<h3 className="mt-3 text-primary">No Banking details as yet!</h3>
														<p className="mt-3 mb-0">Please add your organization banking details</p>	
														{session?.user?.isDirector &&
															<Button onClick={(e) => {e.preventDefault();setAddAccount(true)}} className="btn btn-primary mt-3">
																	Add Account
															</Button>}														
													</Card.Body>													 
														:
													<Card.Body className="border-0">
														{org?.bankAccounts?.map((account) => 
														 <Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y'>  
														 <Col xs={12} lg={2} className='mb-2 d-none d-lg-block'>   
												   
																   <Image
																	   style={{objectFit: "contain"}}
																	   width={150}
																	   height={150}
																	   priority={true}
																	   alt="avatar"
																	   className="rounded-50 img-thumbnail wd-100p wd-md-200"
																	   src={ account?.bankLogo ? account.bankLogo : '/assets/internal/no-image-available.png'}
																	   />
																	
																	{session?.user?.isDirector &&
                                                                    <div className="mt-4 d-none d-md-block w-100">
																		<Button
																		variant="danger"
																		className="w-100" // Full width button
																		onClick={() => handleDelete(account._id)} // Replace with your delete function
																		>
																		<i className="fas fa-trash"></i> Delete
																		</Button>
																	</div>}
												   
														 </Col>      
														 <Col xs={12} lg={10}>
															   <ListGroup as="ol" className="list-group list-group-flush" key={'md'}>
																   <ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">            
																	   <div className="ms-2 me-auto d-none d-md-block">
																	   <div className="fw-bold">Bank Name</div>                
																	   </div>
																	   <div className="ms-2 mx-2">
																	   <div className="fw-bold">{account?.name}</div>                
																	   </div>              
																   </ListGroupItem>
																   <ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																	   <div className="ms-2 me-auto d-none d-sm-block">
																	   <div className="fw-bold">Title Holder</div>                
																	   </div>
																	   <div className="ms-2 mx-2">
																	   <div className="fw-bold">{account?.titleHolder}</div>                
																	   </div>
																   </ListGroupItem>
																   <ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																	   <div className="ms-2 me-auto d-none d-sm-block">
																	   <div className="fw-bold">Account Nr</div>                
																	   </div>
																	   <div className="ms-2 mx-2">
																	   <div className="fw-bold">{account?.accountNr}</div>                
																	   </div>
																   </ListGroupItem>
																   <ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																	   <div className="ms-2 me-auto d-none d-sm-block">
																	   <div className="fw-bold">Account Type</div>                
																	   </div>
																	   <div className="ms-2 mx-2">
																	   <div className="fw-bold">{account?.accountType}</div>                
																	   </div>
																   </ListGroupItem>   
																   <ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																	   <div className="ms-2 me-auto d-none d-sm-block">
																	   <div className="fw-bold">Branch Code</div>                
																	   </div>
																	   <div className="ms-2 mx-2">
																	   <div className="fw-bold">{account?.branchCode}</div>                
																	   </div>
																   </ListGroupItem>
																   <ListGroupItem as="li" className="list-group-item d-flex justify-content-between align-items-start">
																	   <div className="ms-2 me-auto d-none d-sm-block">
																	   <div className="fw-bold">Verification</div>                
																	   </div>
																	   <div className="ms-2 mx-2">
																		   {account?.isVerified ? <div className="fw-bold text-success">Verified</div> : <div className="fw-bold text-danger">Not Verified</div>}                                 
																	   </div>
																   </ListGroupItem> 
																   {session?.user?.isDirector &&   
																   <ListGroupItem
																	as="li"
																	className="list-group-item d-flex justify-content-between align-items-end"
																	>
																	<div className="d-block d-md-none w-100">
																		<Button
																		variant="danger"
																		className="w-100" // Full width button
																		onClick={() => handleDelete(account._id)} // Replace with your delete function
																		>
																		<i className="fas fa-trash"></i> Delete
																		</Button>
																	</div>
																	</ListGroupItem>}
															   </ListGroup>  
														 </Col>
														</Row>)} 
														<Form className="my-5">
														<FormGroup className="form-group float-end">
															<Row className="row-sm">
															<Col md={12}>															
																<Button onClick={(e) => {e.preventDefault();setAddAccount(true)}} className="btn btn-primary mb-1">
																   Add Account
																</Button>
															</Col>                                      
															</Row>
														</FormGroup>
														</Form>                            
													</Card.Body>}         
												 </Card>
												
												</Tab.Pane>
												<Tab.Pane eventKey="Changes" className="main-content-body p-0 border-0">
											
													{org?.changes?.length === 0 ? (
													<Card>	
														<Card.Body className="border border-primary text-center rounded">
															<div>
															<i className="bi bi-check-circle mg-b-20 fs-50 text-primary lh-1"></i>
															<h3 className="mt-3 text-primary">No history as yet!</h3>
															<p className="mt-3 mb-0">Your change history will show here</p>
															</div>
														</Card.Body>
													</Card>
													) : (
													
														<>
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
																<InputGroup.Text className="cursor-pointer" onClick={() => setSearchTerm('')}>×</InputGroup.Text>
																)}
															</InputGroup>
															</div>
														</div>
													
														{currentChanges.map((change, index) => (														
														<Card key={index}>
														  <Card.Body className="border-0">
															<h5 className="fw-semibold text-primary">{`Field: ${change.fieldName}`}</h5>
															<p className="fs-6 font-weight-semibold text-dark mb-1">{`Timestamp: ${moment(change.timestamp).utcOffset('+0200').format('DD MMM YYYY HH:mm')}`}</p>
															<p className="fs-6 font-weight-semibold text-dark mb-2">{`Changed by: ${change.changedBy?.fullNames}`}</p>
															<p className="fs-6 font-weight-semibold text-dark mb-1">{`From: ${change.from}`}</p>														
															<p className="fs-6 font-weight-semibold text-dark mb-1">{`To: ${change.to}`}</p>
														   </Card.Body>
														</Card>														
														))}

														{totalPages > 1 && (
															<div className="d-flex justify-content-center my-4">
															<Pagination
																currentPage={currentPage}
																totalPages={totalPages}
																onPageChange={handlePageChange}
																maxVisiblePages={5}
																className="mb-0"
															/>
															</div>
														)}
													</>
													)}
												
												</Tab.Pane>
												<Tab.Pane eventKey="Theme" className="main-content-body  p-0 border-0">
													
														<Card>
														<Card.Body className=" border-0" data-select2-id="12">
															<Form className="form-horizontal" data-select2-id="11">
															<div className="mb-4 main-content-label">Theme</div>
													
															<FormGroup className="form-group">
																<Row className=" row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">
																	Theme Style
																	</Form.Label>
																</Col>
																<Col md={8}>
																	<select
																	className="form-control"
																	tabIndex="-1"
																	value={
																		org?.theme?.themeStyle
																	}
																	onChange={(e) => {
																		setOrg((org) => {
																		org.theme.themeStyle = e.target.value;
																		org.theme.headerStyle = "";
																		org.theme.menuStyle = "";
																		return { ...org };
																		});

																		if (e.target.value == "Light Theme") {
																		setOrg((org) => {
																			org.theme.menuStyle = "Light Menu";
																			org.theme.headerStyle = "Light Header";
																			return { ...org };
																		});

																		document.querySelector("body").classList.add("light-theme");
																		document.querySelector("body").classList.remove("transparent-theme");
																		document.querySelector("body").classList.remove("dark-theme");
																		document.querySelector("body")?.classList.remove("dark-header");
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"color-header"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"gradient-header"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove("dark-menu");
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"color-menu"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"gradient-menu"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove("bg-img1");
																		document
																			.querySelector("body")
																			?.classList.remove("bg-img2");
																		document
																			.querySelector("body")
																			?.classList.remove("bg-img3");
																		document
																			.querySelector("body")
																			?.classList.remove("bg-img4");
																		} else if (
																		e.target.value == "Dark Theme"
																		) {
																		setOrg(
																			(org) => {
																			org.theme.menuStyle =
																				"Dark Menu";
																			org.theme.headerStyle =
																				"Dark Header";
																			return { ...org };
																			}
																		);

																		document
																			.querySelector("body")
																			.classList.add("dark-theme");
																		document
																			.querySelector("body")
																			.classList.remove(
																			"transparent-theme"
																			);
																		document
																			.querySelector("body")
																			.classList.remove(
																			"light-theme"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"light-header"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"color-header"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"gradient-header"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"light-menu"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"color-menu"
																			);
																		document
																			.querySelector("body")
																			?.classList.remove(
																			"gradient-menu"
																			);
																		} else if (
																		e.target.value ==
																			"Transparent Theme" ||
																		e.target.value ==
																			"Transparent Background Theme"
																		) {
																		setOrg(
																			(org) => {
																			org.theme.menuStyle =
																				"";
																			org.theme.headerStyle =
																				"";
																			return { ...org };
																			}
																		);

																		document
																			.querySelector(".app")
																			.classList.add(
																			"transparent-theme"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"light-theme"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove("dark-theme");
																		document
																			.querySelector(".app")
																			.classList.remove("bg-img1");
																		document
																			.querySelector(".app")
																			.classList.remove("bg-img2");
																		document
																			.querySelector(".app")
																			.classList.remove("bg-img3");
																		document
																			.querySelector(".app")
																			.classList.remove("bg-img4");
																		document
																			.querySelector(".app")
																			.classList.remove("light-menu");
																		document
																			.querySelector(".app")
																			.classList.remove("color-menu");
																		document
																			.querySelector(".app")
																			.classList.remove("dark-menu");
																		document.querySelector(".app").classList.remove(
																			"gradient-menu"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"color-header"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"gradient-header"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"light-header"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"dark-header"
																			);
																		}
																	}}
																	>
																	<option value="Light Theme">
																		Light Theme
																	</option>
																	<option value="Dark Theme">
																		Dark Theme
																	</option>
																	<option value="Transparent Theme">
																		Transparent Theme
																	</option>
																	<option value="Transparent Background Theme">
																		Transparent Background Theme
																	</option>
																	</select>
																</Col>
																</Row>
															</FormGroup>
												
															{(org?.theme?.themeStyle == "Light Theme" || org?.theme?.themeStyle == "Dark Theme") && (
																<FormGroup className="form-group">
																<Row className=" row-sm">
																	<Col md={3}>
																	<Form.Label className="form-label">
																		Menu Style
																	</Form.Label>
																	</Col>
																	<Col md={8}>
																	<select
																		className="form-control"
																		tabIndex="-1"
																		value={
																		org?.theme?.menuStyle
																		}
																		onChange={(e) => {
																		setOrg(
																			(org) => {
																			org.theme.menuStyle =
																				e.target.value;
																			return { ...org };
																			}
																		);

																		if (
																			e.target.value == "Light Menu"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"color-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"dark-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"gradient-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.add("light-menu");
																		} else if (
																			e.target.value == "Dark Menu"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"light-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"color-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"gradient-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.add("dark-menu");
																		} else if (
																			e.target.value == "Colour Menu"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"light-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"dark-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"gradient-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.add("color-menu");
																		} else if (
																			e.target.value ==
																			"Gradient Menu"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"light-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"color-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"dark-menu"
																			);
																			document
																			.querySelector(".app")
																			.classList.add(
																				"gradient-menu"
																			);
																		}
																		}}
																	>
																		<option value="Light Menu">
																		Light Menu
																		</option>
																		<option value="Dark Menu">
																		Dark Menu
																		</option>
																		<option value="Colour Menu">
																		Colour Menu
																		</option>
																		<option value="Gradient Menu">
																		Gradient Menu
																		</option>
																	</select>
																	</Col>
																</Row>
																</FormGroup>)}
													
															{(org?.theme?.themeStyle == "Light Theme" || org?.theme?.themeStyle =="Dark Theme") && (
																<FormGroup className="form-group">
																<Row className=" row-sm">
																	<Col md={3}>
																	<Form.Label className="form-label">
																		Header Style
																	</Form.Label>
																	</Col>
																	<Col md={8}>
																	<select
																		className="form-control"
																		tabIndex="-1"
																		value={
																		org?.theme?.headerStyle
																		}
																		onChange={(e) => {
																		setOrg(
																			(org) => {
																			org.theme.headerStyle =
																				e.target.value;
																			return { ...org };
																			}
																		);

																		if (
																			e.target.value == "Light Header"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"color-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"gradient-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"dark-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.add(
																				"light-header"
																			);
																		} else if (
																			e.target.value == "Dark Header"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"color-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"gradient-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"light-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.add("dark-header");
																		} else if (
																			e.target.value ==
																			"Colour Header"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"gradient-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"dark-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"light-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.add(
																				"color-header"
																			);
																		} else if (
																			e.target.value ==
																			"Gradient Header"
																		) {
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"color-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"dark-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.remove(
																				"light-header"
																			);
																			document
																			.querySelector(".app")
																			.classList.add(
																				"gradient-header"
																			);
																		}
																		}}
																	>
																		<option value="Light Header">
																		Light Header
																		</option>
																		<option value="Dark Header">
																		Dark Header
																		</option>
																		<option value="Colour Header">
																		Colour Header
																		</option>
																		<option value="Gradient Header">
																		Gradient Header
																		</option>
																	</select>
																	</Col>
																</Row>
																</FormGroup>
															)}

															
															<FormGroup className="form-group">
																<Row className=" row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">
																	Navigation Style
																	</Form.Label>
																</Col>
																<Col md={8}>
																	<select
																	className="form-control"
																	tabIndex="-1"
																	value={
																		org?.theme?.navigationStyle
																	}
																	onChange={(e) => {
																		setOrg((org) => {
																		org.theme.navigationStyle =
																			e.target.value;
																		return { ...org };
																		});

																		if (
																		e.target.value == "Vertical Menu"
																		) {
																		document
																			.querySelector(".main-header")
																			.classList.add("side-header"); //ADD SIDE HEADER
																		document
																			.querySelector(".app")
																			.classList.add("sidebar-mini"); //ADD SIDEBAR
																		document
																			.querySelector(".main-content")
																			.classList.add("app-content");
																		document
																			.querySelector(
																			".main-container"
																			)
																			.classList.add(
																			"container-fluid"
																			);
																		document
																			.querySelector(".side-app")
																			.classList.remove("container");
																		document
																			.querySelector(".app")
																			.classList.remove("horizontal");

																		document
																			.querySelector(".app")
																			.classList.remove(
																			"horizontal-hover"
																			);
																		document
																			.querySelector(".app-sidebar")
																			.classList.remove(
																			"horizontal-main"
																			);
																		document
																			.querySelector(".main-header")
																			.classList.remove("hor-header");
																		document
																			.querySelector(".main-sidemenu")
																			.classList.remove("container");
																		document
																			.querySelector(
																			".main-container"
																			)
																			.classList.remove("container");
																		document
																			.querySelector(".main-content")
																			.classList.remove(
																			"horizontal-content"
																			);
																		} else if (
																		e.target.value ==
																		"Horizontal Click Menu"
																		) {
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"sidebar-mini"
																			); //REMOVE SIDEBAR
																		document
																			.querySelector(".main-header")
																			.classList.remove(
																			"side-header"
																			); //REMOVE SIDE HEADER
																		document
																			.querySelector(".main-header")
																			?.classList.add("hor-header");
																		document
																			.querySelector(".main-content")
																			.classList.remove(
																			"app-content"
																			);
																		document
																			.querySelector(
																			".main-container"
																			)
																			.classList.remove(
																			"container-fluid"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"sidenav-toggled"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"horizontal-hover"
																			);
																		document
																			.querySelector(".app")
																			.classList.add("horizontal");
																		document
																			.querySelector(
																			".main-container"
																			)
																			.classList.add("container");
																		document
																			.querySelector(".main-sidemenu")
																			.classList.add("container");
																		document
																			.querySelector(".main-content")
																			.classList.add(
																			"horizontal-content"
																			);
																		document
																			.querySelector(".app-sidebar")
																			.classList.add(
																			"horizontal-main"
																			);
																		document
																			.querySelector(".side-app")
																			.classList.add("container");
																		document.querySelector(
																			".horizontal .side-menu"
																		).style.flexWrap = "nowrap";

																		checkHoriMenu();
																		switcherArrowFn();
																		} else if (
																		e.target.value ==
																		"Horizontal Hover Menu"
																		) {
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"sidebar-mini"
																			); //REMOVE SIDEBAR
																		document
																			.querySelector(".app")
																			.classList.add(
																			"horizontal-hover"
																			);
																		document
																			.querySelector(".app")
																			.classList.add("horizontal");
																		document
																			.querySelector(".main-content")
																			.classList.add(
																			"horizontal-content"
																			);
																		document
																			.querySelector(
																			".main-container"
																			)
																			.classList.add("container");
																		document
																			.querySelector(".main-header")
																			.classList.add("hor-header");
																		document
																			.querySelector(".app-sidebar")
																			.classList.add(
																			"horizontal-main"
																			);
																		document
																			.querySelector(".main-sidemenu")
																			.classList.add("container");
																		document
																			.querySelector(".side-app")
																			.classList.add("container");

																		document
																			.querySelector("#slide-left")
																			.classList.remove("d-none");
																		document
																			.querySelector("#slide-right")
																			.classList.remove("d-none");
																		document
																			.querySelector(".main-content")
																			.classList.remove(
																			"app-content"
																			);
																		document
																			.querySelector(
																			".main-container"
																			)
																			.classList.remove(
																			"container-fluid"
																			);
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"sidenav-toggled"
																			);

																		document
																			.querySelector(
																			".horizontal-hover .side-menu"
																			)
																			?.classList.add("flex-nowrap");

																		let li =
																			document.querySelectorAll(
																			".side-menu",
																			"li"
																			);
																		li.forEach((e, i) => {
																			if (
																			e.classList.contains(
																				"is-expaned"
																			)
																			) {
																			[...e.children].forEach(
																				(el, i) => {
																				el.classList.remove(
																					"active"
																				);
																				if (
																					el.classList.contains(
																					"slide-menu"
																					)
																				) {
																					el.style = "";
																					el.style.display =
																					"none";
																				}
																				}
																			);
																			e.classList.remove(
																				"is-expaned"
																			);
																			}
																		});

																		checkHoriMenu();
																		switcherArrowFn();
																		}
																	}}
																	>
																	<option value="Vertical Menu">
																		Vertical Menu
																	</option>
																	<option value="Horizontal Click Menu">
																		Horizontal Click Menu
																	</option>
																	<option value="Horizontal Hover Menu">
																		Horizontal Hover Menu
																	</option>
																	</select>
																</Col>
																</Row>
															</FormGroup>
													
															<FormGroup className="form-group">
																<Row className=" row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">
																	Layout Positions
																	</Form.Label>
																</Col>
																<Col md={8}>
																	<select
																	className="form-control"
																	tabIndex="-1"
																	value={
																		org?.theme?.layoutPosition
																	}
																	onChange={(e) => {
																		setOrg((org) => {
																		org.theme.layoutPosition =
																			e.target.value;
																		return { ...org };
																		});

																		if (e.target.value == "Fixed") {
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"scrollable-layout"
																			);
																		document
																			.querySelector(".app")
																			.classList.add("fixed-layout");
																		} else if (
																		e.target.value == "Scrollable"
																		) {
																		document
																			.querySelector(".app")
																			.classList.remove(
																			"fixed-layout"
																			);
																		document
																			.querySelector(".app")
																			.classList.add(
																			"scrollable-layout"
																			);
																		}
																	}}
																	>
																	<option value="Fixed">
																		Fixed (Recommended)
																	</option>
																	<option value="Scrollable">
																		Scrollable
																	</option>
																	</select>
																</Col>
																</Row>
															</FormGroup>
													
															<FormGroup className="form-group">
																<Row className=" row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">
																	Primary Color
																	</Form.Label>
																</Col>
																<Col md={8}>
																	<input
																	className="wd-30 ht-30 wd-150 "
																	value={org?.primaryBgColor}
																	type="color"                           
																	onChange={(e) => {                                            
																		setOrg((org) => {
																		console.log(e.target.value);
																		org.primaryColor = e.target.value;
																		org.primaryHover = Color(e.target.value).lighten(0.4).hexa().slice(0, 7);
																		org.primaryBorder = Color(e.target.value).darken(0.2).hexa().slice(0, 7);
																		if (org?.themeStyle == "Transparent Theme") {
																			org.transparentColor = Color(e.target.value).lighten(0.8).hexa().slice(0, 7);
																		} else {
																			org.transparentColor = "";
																		}                              
																		return { ...org };
																		});                                            
																	}}
																	/>
																</Col>
																</Row>
															</FormGroup>
													
															<FormGroup className="form-group">
																<Row className=" row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">
																	Border Color
																	</Form.Label>
																</Col>
																<Col md={8}>
																	<input
																	className="wd-30 ht-30 wd-150 "
																	value={org?.primaryBgBorder}
																	type="color"
																	onChange={(e) => {
																		setOrg((org) => {
																		org.primaryBgBorder = e.target.value;																		
																		return { ...org };
																		});                                            
																	}}
																	/>
																</Col>
																</Row>
															</FormGroup>
													
															<FormGroup className="form-group">
																<Row className=" row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">
																	Hover Color
																	</Form.Label>
																</Col>
																<Col md={8}>
																	<input
																	className="wd-30 ht-30 wd-150 "
																	value={org?.primaryBgHover}
																	type="color"
																	onChange={(e) => {
																		setOrg((org) => {
																		org.primaryBgHover = e.target.value;																		
																		return { ...org };
																		});                                            
																	}}
																	/>
																</Col>
																</Row>
															</FormGroup> 
															
															{org?.theme?.themeStyle == "Transparent Theme" && (
																<FormGroup className="form-group">
																<Row className=" row-sm">
																	<Col md={3}>
																	<Form.Label className="form-label">
																		Transparent Background Color
																	</Form.Label>
																	</Col>
																	<Col md={8}>
																	<input
																		className="wd-30 ht-30 wd-150 "
																		value={org?.transparentBgColor}
																		id="transparentPrimaryColorID"
																		type="color"
																		onChange={(e) => {
																		setOrg(
																			(org) => {
																			org.transparentBgColor = e.target.value;																			
																			return { ...org };
																			}
																		);                                              
																		}}
																	/>
																	</Col>
																</Row>
																</FormGroup>
															)} 
														
															{org?.theme?.themeStyle == "Transparent Background Theme" && (
																<FormGroup className="form-group">
																<Row className=" row-sm">
																	<Col md={3}>
																	<Form.Label className="form-label">
																		Transparent Background Color
																	</Form.Label>
																	</Col>
																	<Col md={8}>
																	<div className="switch-toggle d-flex">
																		<div className="bd bd-4 mx-2">
																		<Link className="bg-img1" onClick={() => {}} href="#!">
																			<img
																			src="/assets/img/media/bg-img1.jpg"
																			id="bgimage1"
																			alt="switch-img"
																			/>
																		</Link>
																		</div>
																		<div className="bd bd-4 mx-2">
																		<Link
																			className="bg-img2"
																			onClick={() => {}}
																			href="#!"
																		>
																			<img
																			src="/assets/img/media/bg-img2.jpg"
																			id="bgimage2"
																			alt="switch-img"
																			/>
																		</Link>
																		</div>
																		<div className="bd bd-4 mx-2">
																		<Link
																			className="bg-img3"
																			onClick={() => {}}
																			href="#!"
																		>
																			<img
																			src="/assets/img/media/bg-img3.jpg"
																			id="bgimage3"
																			alt="switch-img"
																			/>
																		</Link>
																		</div>
																		<div className="bd bd-4 mx-2">
																		<Link
																			className="bg-img4"
																			onClick={() => {}}
																			href="#!"
																		>
																			<img
																			src="/assets/img/media/bg-img4.jpg"
																			id="bgimage4"
																			alt="switch-img"
																			/>
																		</Link>
																		</div>
																	</div>
																	</Col>
																</Row>
																</FormGroup>
															)}

															<FormGroup className="form-group float-end">
																<Row className=" row-sm">
																<Col md={12}>
																	{" "}
																	<Button
																	onClick={handleSave}
																	className="btn btn-primary mb-1"
																	>
																	Save
																	</Button>{" "}
																</Col>                                      
																</Row>
															</FormGroup>
															</Form>
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
   
}

Organization.layout = "ManageLayout"

export default Organization;