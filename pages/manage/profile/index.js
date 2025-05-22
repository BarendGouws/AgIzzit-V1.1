import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Card, Col, Nav, Row, Tab, FormGroup, Form, Button, Alert, Table, Badge, InputGroup, Dropdown } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { fetchProfile, updateProfile, verifyProfile } from "@/redux/manage/slices/profile";
import { banks } from "@/utils/config";

const Profile = ({ }) => {

	const router = useRouter(); 
    const dispatch = useDispatch();

    const { profile , timeline } = useSelector(state => state.profile);
	const [details, setDetails] = useState({});	

	const [profileErrors, setProfileErrors] = useState({});

	const handleUpload = async (e) => {

		const file = e.target.files[0];
		console.log('file', file)

	};

	const getProfileErrors = () => {

		const errors = {};
	   
		// User Profile validation
		if (!details?.knownAs?.trim()) errors.knownAs = 'Please enter your preferred name';
		if (!details?.privatePhoneNr?.toString()?.trim()) {
		  errors.privatePhoneNr = 'Phone number is required';
		} else if (!/^\d{9}$/.test(details.privatePhoneNr)) {
		  errors.privatePhoneNr = 'Please enter a valid 9-digit phone number';
		}
		
		if (!details?.privateEmail?.trim()) {
		  errors.privateEmail = 'Email address is required'; 
		} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(details.privateEmail)) {
		  errors.privateEmail = 'Please enter a valid email address';
		}
	   
		// Address validation
		if (!details?.addressLine1?.trim()) errors.addressLine1 = 'Street address is required';
		if (!details?.suburb?.trim()) errors.suburb = 'Suburb is required';
		if (!details?.city?.trim()) errors.city = 'City is required';
		if (!details?.zip?.toString().trim()) {
		  errors.zip = 'Postal code is required';
		} else if (!/^\d{4}$/.test(details.zip)) {
		  errors.zip = 'Please enter a valid 4-digit postal code';
		}
		if (!details?.province?.trim()) errors.province = 'Please select your province';
		if (!details?.country?.trim()) errors.country = 'Please select your country';
	   
		// Next of Kin validation
		if (!details?.nextOfkinName?.trim()) errors.nextOfkinName = 'Next of kin name is required';
		if (!details?.nextOfkinCellNr?.toString()?.trim()) {
		  errors.nextOfkinCellNr = 'Next of kin contact number is required';
		} else if (!/^\d{9}$/.test(details.nextOfkinCellNr)) {
		  errors.nextOfkinCellNr = 'Please enter a valid 9-digit phone number';
		}
		if (!details?.nextOfKinRelationship?.trim()) errors.nextOfKinRelationship = 'Please select your relationship';
		if (!details?.nextOfKinAddress?.trim()) errors.nextOfKinAddress = 'Next of kin address is required';
	   
		// Medical Aid validation (optional fields)
		if (details?.medicalAidProvider?.trim() && !details?.medicalAidNr?.trim()) {
		  errors.medicalAidNr = 'Please enter medical aid number if provider is specified';
		}
		if (details?.medicalAidNr?.trim() && !details?.medicalAidProvider?.trim()) {
		  errors.medicalAidProvider = 'Please select medical aid provider if number is specified';
		}
	   
		// Allergies validation
		if (details?.allergiesOrMedicalConditions?.length > 0) {
			const allergyErrors = details.allergiesOrMedicalConditions.map(item => 
			!item.trim() ? 'Please enter allergy/condition or remove this field' : null
			);
			if (allergyErrors.some(error => error)) {
			errors.allergiesOrMedicalConditions = allergyErrors;
			}
		}
	   
		// Banking validation
		if (!details?.bankName?.trim()) errors.bankName = 'Please select your bank';
		if (!details?.bankAccountHolderName?.trim()) {
		  errors.bankAccountHolderName = 'Account holder name is required';
		} else if (!/^[A-Za-z\s]{2,}$/.test(details.bankAccountHolderName)) {
		  errors.bankAccountHolderName = 'Please enter a valid account holder name';
		}
		
		if (!details?.bankAccountNr?.toString()?.trim()) {
		  errors.bankAccountNr = 'Account number is required';
		} else if (!/^\d{5,}$/.test(details.bankAccountNr)) {
		  errors.bankAccountNr = 'Please enter a valid account number';
		}
		
		if (!details?.bankAccountType?.trim()) errors.bankAccountType = 'Please select account type';
		if (!details?.branchCode?.toString()?.trim()) errors.branchCode = 'Branch code is required';
	   
		return Object.keys(errors).length ? errors : null;
	};  
	   
	const handleSave = async (e) => {

		e.preventDefault();
		const errors = getProfileErrors();
		
		if (errors) {
		  setProfileErrors(errors);
		  const firstError = document.querySelector('.is-invalid');
		  if (firstError) {
			firstError.scrollIntoView({ 
				behavior: 'smooth',
				block: 'center'
			});
		  }
		  return;
		}

		setProfileErrors({});
	    console.log('submit', details)
		dispatch(updateProfile(details));

	};

	const verificationMessage = ({ type }) => {

		const handleResend = async () => { dispatch(verifyProfile({ type }));};
	   
		const getMessage = () => {
		  switch(type) {
			case 'privateEmail': return 'email - verification link has been sent';
			case 'email': return 'work email - verification link has been sent'; 
			case 'privatePhoneNr': return 'phone number - verification code has been sent via SMS';
			case 'phone': return 'phone number - verification code has been sent via SMS';
			default: return 'verification required';
		  }
		};
	   
		return (
		  <div className="form-text text-danger">
			<p>
			  Please verify your {getMessage()}
			  <u 
				className="text-primary ms-1" 
				style={{ cursor: 'pointer' }}
				onClick={handleResend}
			  >
				Resend
			  </u>
			</p>
		  </div>
		);
	};   

    useEffect(() => {
      dispatch(fetchProfile());
    }, [dispatch]); 

	useEffect(() => {
		if(profile) setDetails({...profile});	
	}, [profile]);

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

	const countryData = [
		{ code: 'ZA', name: 'South Africa', ext: '+27' },
		{ code: 'GB', name: 'United Kingdom', ext: '+44' },
		{ code: 'US', name: 'United States', ext: '+1' },
		{ code: 'AU', name: 'Australia', ext: '+61' }
	]

	console.log('details', details)

	return (
		<StateHandler slice="profile">
     
            <Pageheader title="Profile" heading="Manage" active="Profile" />

            <Row>
				<Col lg={12} md={12}>
					<Tab.Container id="left-tabs-example" defaultActiveKey="Profile">

						<Card className="custom-card ">
						<Card.Body className=" d-md-flex bg-white">        
							{details?.profileImage && 
							  <span className="profile-image pos-relative">
							  <img 
								src={details?.profileImage}
								alt="details logo"
								style={{ 
								width: "200px", 
								height: "200px",
								objectFit: 'contain'
								}}
								/>
							</span>}
							
							<div className="my-md-auto mt-4 prof-details">

								<h5 className="font-weight-semibold ms-md-4 ms-0 mb-1 pb-0 mb-3">
							      {details?.fullNames}{!details?.isComplete &&<Badge bg="primary" className="ms-2">Profile Incomplete</Badge>}
								</h5>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
									<i className="fas fa-id-card me-2"></i>
									</span>
									<span className="font-weight-semibold me-2 d-none d-md-inline">
										Identification Nr:
									</span>									
							    	<span>{details?.idOrPassportNr}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
									<i className="fas fa-venus-mars me-2"></i>
									</span>
									<span className="font-weight-semibold me-2 d-none d-md-inline">
										Gender:
									</span>									
							    	<span>{details?.gender ? details?.gender : 'Unknown'}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
									<i className="fas fa-birthday-cake me-2"></i>
									</span>
									<span className="font-weight-semibold me-2 d-none d-md-inline">
										Date of Birth:
									</span>									
							    	<span>{details?.dateOfBirth ? moment(details?.dateOfBirth).format('YYYY-MM-DD'): "Unknown"}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
								   <i className="fas fa-globe me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">
									Nasionality:
								</span>
							    	<span>{details?.nasionality ? details?.nasionality: "Unknown"}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fas fa-university me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">
									Employee Nr:
								</span>
							    	<span>{details?.employeeNr}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
							     	<i className="fa fa-briefcase me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Occupation:</span>
								  <span>{details?.occupation}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
							     	<i className="fa fa-briefcase me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Department:</span>
								  <span>{details?.department}</span>
								</p>
								
								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fa fa-phone me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Phone:</span>
								<span>{`${details?.phoneNrExt || '+27'}${details?.phoneNr}`}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
								<i className="fa fa-envelope me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Email</span>
								<span>{details?.email}</span>
								</p>
								
							</div>
							</Card.Body>
							<Card.Footer className="py-0">
								<div className="profile-tab tab-menu-heading border-bottom-0">
									<Nav variant="pills" className="nav main-nav-line p-0 tabs-menu profile-nav-line border-0 br-5 mb-0	">
										<Nav.Item className="me-1">
											<Nav.Link className=" mb-2 mt-2" eventKey="Timeline" disabled={!details.isComplete}>
										     	Timeline
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Profile">
											     Profile
											</Nav.Link>
										</Nav.Item>																				
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Changes" disabled={!details.isComplete}>
											  Changes
											</Nav.Link>
										</Nav.Item>							
									</Nav>
								</div>
							</Card.Footer>
						</Card>						
						
						{!details.isComplete ? 						
						<Alert variant="primary" className="alert shadow fade show d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center">
							<i className="fas fa-shield-alt fa-lg me-2 text-primary"></i>
							<span>Your staff profile is incomplete, please complete your profile.</span>
						</div>						
						</Alert> :
						!details?.emailVerified && 						
						<Alert variant="primary" className="alert shadow fade show d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center">
							<i className="fas fa-shield-alt fa-lg me-2 text-primary"></i>
							<span>Please verify your email to explore all the benefits of our platform.</span>
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
											<Tab.Content className="">

												<Tab.Pane eventKey="Timeline" className="main-content-body  p-0 border-0">
													<Card className="">

														{timeline?.length == 0 ? 

														<Card.Body className=" border border-primary text-center rounded">
														<div className="success-widget">
															<i className="bi bi-check-circle mg-b-20 fs-50 text-primary lh-1"></i>
															<h3 className="mt-3 text-primary">No events as yet!</h3>
															<p className="mt-3 mb-0">Your events will show here</p>
														</div>
														</Card.Body>
														:
														<Card.Body className=" p-0 border-0 p-0 rounded-10">
															
															<div className="container">															
																<ul className="notification">
																	{timeline?.map((event, index) => (
																	<li>
																		<div className="notification-time">
																			<span className="date">{formatDate(event.date)}</span>
																			<span className="time">{moment(event.date).format('HH:mm')}</span>
																		</div>
																		<div className="notification-icon">
																			<Link href="#!"></Link>
																		</div>
																		<div className="notification-body">
																			<div className="media mt-0">
																				<div className="avatar avatar-md avatar-rounded main-avatar online me-3 shadow">
																					<Link className="" href={"/components/pages/profile/"}>
																						<img
																							alt="avatar"
																							className="rounded-circle"
																							src={"../../../assets/images/faces/6.jpg"}
																						/>
																					</Link>
																				</div>
																				<div className="media-body">
																					<div className="d-flex align-items-center">
																						<div className="mt-0">
																							<h5 className="mb-1 fs-15 fw-semibold text-dark">
																								Emperio
																							</h5>
																							<p className="mb-0 tx-13 mb-0 text-muted">
																									Project assigned by the manager all{" "}
																								<Badge
																									bg=""
																									className=" bg-primary-transparent tx-12 font-weight-semibold text-primiary ms-1 me-1"
																								>
																			files
																								</Badge>{" "}
																		and{" "}
																								<Badge
																									bg=""
																									className=" bg-primary-transparent text-primary tx-12 font-weight-semibold ms-1 me-1"
																								>
																			folders
																								</Badge>
																		were included
																							</p>
																						</div>
																						<div className="ms-auto">
																							<Badge bg="" className="float-end badge notification-badge">
																								<span className="tx-11 font-weight-semibold">
																			24, oct 2021
																								</span>
																							</Badge>
																						</div>
																					</div>
																				</div>
																			</div>
																		</div>
																	</li>))}																
																</ul>
																<div className="text-center mb-4">
																	<Button className="btn btn-primary">Load more</Button>
																</div>
															</div>

														</Card.Body>}
													</Card>
												</Tab.Pane>
												<Tab.Pane eventKey="Profile" className="main-content-body  p-0 border-0">													
														<Card>
															<Card.Body className=" border-0">
															
																<div className="mb-4 main-content-label text-primary">
																	User Profile
																</div>

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Known As
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"		
																		isInvalid={profileErrors?.knownAs}																
																		value={details?.knownAs	|| ''}
																		onChange={(e) => {
																			setDetails((details) => {
																			details.knownAs = e.target.value;
																			return { ...details };
																		})}}
																		/>
																		{profileErrors?.knownAs && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.knownAs}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>	
																
																<FormGroup className="form-group">
																<Row className="row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">Private Cellphone Nr</Form.Label>
																</Col>
																<Col md={9}>
																	<InputGroup>
																	<Dropdown>
																		<Dropdown.Toggle variant="light" id="country-dropdown">
																		{details?.privatePhoneNrExt || '+27'}
																		</Dropdown.Toggle>
																		<Dropdown.Menu>
																		{countryData.map(country => (
																			<Dropdown.Item 
																			key={country.code}
																			onClick={() => setDetails(prev => ({
																				...prev,
																				countryCode: country.code,
																				privatePhoneNrExt: country.ext
																			}))}
																			>
																			{country.name} ({country.ext})
																			</Dropdown.Item>
																		))}
																		</Dropdown.Menu>
																	</Dropdown>
																	<Form.Control
																			type="number"
																			className="form-control"   
																			isInvalid={profileErrors?.privatePhoneNr}                              
																			value={details?.privatePhoneNr || ''}   																		
																			onChange={(e) => {
																				setDetails((details) => {
																				details.privatePhoneNr = e.target.value;
																				return { ...details };
																			})}}                                     
																			
																		/>
																		{profileErrors?.privatePhoneNr && (
																			<Form.Control.Feedback type='invalid'>
																			{profileErrors.privatePhoneNr}
																			</Form.Control.Feedback>
																		)}	
																	</InputGroup>
																	{!details?.privatePhoneNrVerified && (															
																	  verificationMessage({ type: 'privatePhoneNr' })
																	)}																	
																	{details?.privatePhoneNrVerifiedAt && (
																	<div className="form-text">
																		Verified on: {moment(details.privatePhoneNrVerifiedAt).format('MMMM Do YYYY, h:mm a')}
																	</div>)}
																</Col>
																</Row>
																</FormGroup>																

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Private Email
																		</Form.Label>
																	</Col>
																	<Col md={9}>																
																	      <Form.Control
																			type="text"
																			className="form-control"   
																			isInvalid={profileErrors?.privateEmail}                              
																			value={details?.privateEmail || ''}																			
																			onChange={(e) => {
																				setDetails((details) => {
																				details.privateEmail = e.target.value;
																				return { ...details };
																				})}}
																			/>																				
																			{profileErrors?.privateEmail && (
																			<Form.Control.Feedback type='invalid'>
																				{profileErrors.privateEmail}
																			</Form.Control.Feedback>)}	
																			{!details?.privateEmailVerified && (
																			verificationMessage({ type: 'privatePhoneNr' })
																			)}	
																			{details?.privateEmailVerifiedAt && (
																			<div className="form-text">
																				Verified on: {moment(details.privateEmailVerifiedAt).format('MMMM Do YYYY, h:mm a')}
																			</div>
																			)}																
																		
																	</Col>
																	</Row>
																</FormGroup>  														
															
																{/* Address Section */}
																<div className="mb-4 main-content-label text-primary">Address Details</div>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Address Line 1</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				isInvalid={profileErrors?.addressLine1}
																				value={details?.addressLine1 || ''}
																				onChange={(e) => setDetails({ ...details, addressLine1: e.target.value })}
																			/>
																			{profileErrors?.addressLine1 && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.addressLine1}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Address Line 2</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				isInvalid={profileErrors?.addressLine2}
																				value={details?.addressLine2 || ''}
																				onChange={(e) => setDetails({ ...details, addressLine2: e.target.value })}
																			/>
																			{profileErrors?.addressLine2 && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.addressLine2}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Suburb</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				isInvalid={profileErrors?.suburb}
																				value={details?.suburb || ''}
																				onChange={(e) => setDetails({ ...details, suburb: e.target.value })}
																			/>
																			{profileErrors?.suburb && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.suburb}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">City</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				isInvalid={profileErrors?.city}
																				value={details?.city || ''}
																				onChange={(e) => setDetails({ ...details, city: e.target.value })}
																			/>
																			{profileErrors?.city && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.city}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Zip Code</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				isInvalid={profileErrors?.zip}
																				value={details?.zip || ''}
																				onChange={(e) => setDetails({ ...details, zip: e.target.value })}
																			/>
																			{profileErrors?.zip && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.zip}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Province</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={profileErrors?.province}
																				value={details?.province || ''}
																				onChange={(e) => setDetails({ ...details, province: e.target.value })}
																			>
																				<option value="" disabled>Select Province</option>
																				<option value="Eastern Cape">Eastern Cape</option>
																				<option value="Free State">Free State</option>
																				<option value="Gauteng">Gauteng</option>
																				<option value="KwaZulu-Natal">KwaZulu-Natal</option>
																				<option value="Limpopo">Limpopo</option>
																				<option value="Mpumalanga">Mpumalanga</option>
																				<option value="Northern Cape">Northern Cape</option>
																				<option value="North West">North West</option>
																				<option value="Western Cape">Western Cape</option>
																			</Form.Select>
																			{profileErrors?.province && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.province}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Country</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={profileErrors?.country}
																				value={details?.country || 'South Africa'}
																				onChange={(e) => setDetails({ ...details, country: e.target.value })}
																			>
																				<option value="South Africa">South Africa</option>
																				{/* Add more countries */}
																				<option value="USA">USA</option>
																				<option value="UK">UK</option>
																				<option value="Australia">Australia</option>
																			</Form.Select>
																			{profileErrors?.country && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.country}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>																

																<div className="mb-4 main-content-label text-primary">
																	Next of Kin
																</div>

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Name and Surname
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control"	
																			isInvalid={profileErrors?.nextOfkinName}																	
																			value={details?.nextOfkinName || ''}
																			onChange={(e) => {
																				setDetails((details) => {
																				details.nextOfkinName = e.target.value;
																				return { ...details };
																			})}}
																		/>
																		{profileErrors?.nextOfkinName && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.nextOfkinName}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Cellphone Nr
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																	<InputGroup>
																	<Dropdown>
																		<Dropdown.Toggle variant="light" id="country-dropdown">
																		{details?.nextOfkinCellNrExt || '+27'}
																		</Dropdown.Toggle>
																		<Dropdown.Menu>
																		{countryData.map(country => (
																			<Dropdown.Item 
																			key={country.code}
																			onClick={() => setDetails(prev => ({
																				...prev,
																				countryCode: country.code,
																				nextOfkinCellNrExt: country.ext
																			}))}
																			>
																			{country.name} ({country.ext})
																			</Dropdown.Item>
																		))}
																		</Dropdown.Menu>
																	</Dropdown>
																		<Form.Control
																			type="number"
																			className="form-control"   
																			isInvalid={profileErrors?.nextOfkinCellNr}                              
																			value={details?.nextOfkinCellNr || ''}                                          
																			onChange={(e) => {
																				setDetails((details) => {
																				details.nextOfkinCellNr = e.target.value;
																				return { ...details };
																				})}}
																			/>
																			{profileErrors?.nextOfkinCellNr && (
																			<Form.Control.Feedback type='invalid'>
																				{profileErrors.nextOfkinCellNr}
																			</Form.Control.Feedback>)}
																		</InputGroup>
																		
																	</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Relationship</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={profileErrors?.nextOfKinRelationship}
																				value={details?.nextOfKinRelationship || ''}
																				onChange={(e) => {
																					setDetails((details) => {
																						details.nextOfKinRelationship = e.target.value;
																						return { ...details };
																					});
																				}}
																			>
																				<option value="" disabled>
																					Select Relationship
																				</option>
																				<option value="Parent">Parent</option>
																				<option value="Sibling">Sibling</option>
																				<option value="Spouse">Spouse</option>
																				<option value="Child">Child</option>
																				<option value="Friend">Friend</option>
																				<option value="Other">Other</option>
																			</Form.Select>
																			{profileErrors?.nextOfKinRelationship && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.nextOfKinRelationship}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		 Address
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"   
																		isInvalid={profileErrors?.nextOfKinAddress}                              
																		value={details?.nextOfKinAddress || ''}
																		onChange={(e) => {
																			setDetails((details) => {
																			details.nextOfKinAddress = e.target.value;
																			return { ...details };
																			})}}
																		/>
																		{profileErrors?.nextOfKinAddress && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.nextOfKinAddress}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 

																<div className="mb-4 main-content-label text-primary">
																	Medical Aid Details
																</div>

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Medical Aid Provider
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																			type="text"
																			className="form-control"																		
																			value={details?.medicalAidProvider}
																			onChange={(e) => {
																				setDetails((details) => {
																				details.medicalAidProvider = e.target.value;
																				return { ...details };
																			})}}
																		/>
																		{profileErrors?.medicalAidProvider && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.medicalAidProvider}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																	    	Medical Aid Nr
																		</Form.Label>
																	</Col>
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"   
																		isInvalid={profileErrors?.medicalAidNr}                              
																		value={details?.medicalAidNr}                                          
																		onChange={(e) => {
																			setDetails((details) => {
																			details.medicalAidNr = e.target.value;
																			return { ...details };
																			})}}
																		/>
																		{profileErrors?.medicalAidNr && (
																		<Form.Control.Feedback type='invalid'>
																			{profileErrors.medicalAidNr}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
															
																<div>
																	<div className="mb-4 main-content-label text-primary">
																		Allergies and Medical Conditions
																	</div>

																	{details?.allergiesOrMedicalConditions?.length > 0 ? (
																		details.allergiesOrMedicalConditions.map((condition, index) => (
																			<FormGroup key={index} className="form-group">
																			<Row className="row-sm">
																				<Col md={3}>
																				<Form.Label className="form-label">
																					Allergy/Condition {index + 1}
																				</Form.Label>
																				</Col>
																				<Col md={9}>
																				<InputGroup>
																					<Form.Control
																					type="text"
																					className="form-control"
																					value={condition}
																					isInvalid={profileErrors?.allergiesOrMedicalConditions?.[index]}
																					onChange={(e) => {
																						const updatedConditions = [...details.allergiesOrMedicalConditions];
																						updatedConditions[index] = e.target.value;
																						setDetails({ ...details, allergiesOrMedicalConditions: updatedConditions });
																					}}
																					/>
																					<Button
																					variant="primary"
																					type="button"
																					onClick={() => {
																						const updatedConditions = details.allergiesOrMedicalConditions.filter((_, i) => i !== index);
																						setDetails({ ...details, allergiesOrMedicalConditions: updatedConditions });
																					}}
																					>
																					X
																					</Button>
																				</InputGroup>
																				{profileErrors?.allergiesOrMedicalConditions?.[index] && (
																					<Form.Control.Feedback type="invalid">
																					{profileErrors.allergiesOrMedicalConditions[index]}
																					</Form.Control.Feedback>
																				)}
																				</Col>
																			</Row>
																			</FormGroup>
																		))
																	) : (
																	<div className="text-center mt-4">
																		<h5 className="text-muted">No allergies or medical conditions listed.</h5>
																	</div>
																	)}


																	{/* Add new condition button */}
																	<FormGroup className="form-group float-end">
																		<Row className="row-sm">
																			<Col md={12}>
																				<Button
																					onClick={(e) => {
																						e.preventDefault();
																						setDetails((details) => ({
																							...details,
																							allergiesOrMedicalConditions: [
																								...(details.allergiesOrMedicalConditions || []),
																								""
																							]
																						}));
																					}}
																					className="btn btn-primary mb-1"
																				>
																					Add Allergy/Condition
																				</Button>
																			</Col>
																		</Row>
																	</FormGroup>
																</div>

																{/* Banking Section */}
																<div className="mb-4 mt-5 main-content-label text-primary">Banking Details</div>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Bank Name</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={profileErrors?.bankName}
																				value={details?.bankName || ''}
																				onChange={(e) => {
																					const bank = banks.find(b => b.name === e.target.value);
																					setDetails(prev => ({
																					  ...prev,
																					  bankName: bank.name || '',
																					  branchCode: bank?.code || ''
																					}));
																				   }}
																			    >
																				<option value="">Please choose bank</option>
                                                                                {banks.map(bank => (
                                                                                <option key={bank.name} value={bank.name}>
                                                                                    {bank.name}
                                                                                </option>
                                                                                ))}
																			</Form.Select>
																			{profileErrors?.bankName && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.bankName}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Account Holder Name</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="text"
																				className="form-control"
																				isInvalid={profileErrors?.bankAccountHolderName}
																				value={details?.bankAccountHolderName || ''}
																				onChange={(e) => setDetails({ ...details, bankAccountHolderName: e.target.value })}
																			/>
																			{profileErrors?.bankAccountHolderName && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.bankAccountHolderName}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Account Number</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="number"
																				className="form-control"
																				isInvalid={profileErrors?.bankAccountNr}
																				value={details?.bankAccountNr || ''}
																				onChange={(e) => setDetails({ ...details, bankAccountNr: e.target.value })}
																			/>
																			{profileErrors?.bankAccountNr && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.bankAccountNr}
																				</Form.Control.Feedback>
																			)}
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
																				isInvalid={profileErrors?.bankAccountType}
																				value={details?.bankAccountType || ''}
																				onChange={(e) => setDetails({ ...details, bankAccountType: e.target.value })}
																			>
																				<option value="" disabled>Select Account Type</option>
																				<option value="Cheque">Cheque</option>
																				<option value="Savings">Savings</option>
																				<option value="Transmission">Transmission</option>
																			</Form.Select>
																			{profileErrors?.bankAccountType && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.bankAccountType}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Branch Code</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Control
																				type="number"
																				className="form-control"
																				isInvalid={profileErrors?.branchCode}
																				value={details?.branchCode || ''}
																				onChange={(e) => setDetails({ ...details, branchCode: e.target.value })}
																			/>
																			{profileErrors?.branchCode && (
																				<Form.Control.Feedback type="invalid">
																					{profileErrors.branchCode}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
																<FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Verified</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				{details?.bankAccountVerified ? <div className="fw-bold text-success">Verified</div> : <div className="fw-bold text-danger">Not Verified</div>}                                 
																			</div>
																		</Col>
																	</Row>
																</FormGroup>													
																{!details?.bankAccountVerified && details?.bankName && details?.bankAccountNr && details?.bankAccountType && details?.branchCode && (			
																<Row className="mb-4">
																<Col md={6}>                          
																	<Form.Label
																	htmlFor="formFile"
																	className="form-label"
																	>
																	Upload Proof of banking details to verify
																	</Form.Label>
																	<Form.Control
																	className="form-control"
																	type="file"
																	accept="image/*"
																	id="logoFile"
																	onChange={handleUpload}
																	/>
																	<Form.Text muted>
																	{details?.bankAccountVerifiedOn ? moment(details.bankAccountVerifiedOn).format('LLL') : 'Never uploaded'}
																	</Form.Text>                         
																</Col>																
																</Row>)}

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
												<Tab.Pane eventKey="Changes" className="main-content-body  p-0 border-0">
													
														<Card>
														{details?.changes?.length == 0 ? 

														<Card.Body className=" border border-primary text-center rounded">
															<div className="success-widget">
																<i className="bi bi-check-circle mg-b-20 fs-50 text-primary lh-1"></i>
																<h3 className="mt-3 text-primary">No history as yet!</h3>
																<p className="mt-3 mb-0">Your change history will show here</p>
															</div>
														</Card.Body>
														:
														<Card.Body className=" border-0">
															<Form className="form-horizontal">
															<div className="mb-4 main-content-label">
																Change History
															</div>
															<div className="table-responsive">
															<Table className="table mg-b-0 text-md-nowrap">
																<thead>
																<tr>
																	<th>Timestamp</th>
																	<th>Field</th>
																	<th>Change</th>   
																	<th>User</th>                                    
																</tr>
																</thead>
																<tbody>
																{details?.changes?.map((change) => (
																	<tr key={change._id}>
																	<th scope="row">{moment(change.timestamp).utcOffset('+0200').format('DD MMM YYYY HH:mm')}</th>
																	<td>{change.fieldName}</td>                                  
																	<td>{`From ${change.from == 'true' ? 'Yes' : change.from == 'false' ? 'No' : change.from == undefined ? "Empty" : change.from == "" ? "Empty" : change.from} to ${change.to == 'true' ? 'Yes' : change.to == 'false' ? 'No' : change.to == undefined ? "Empty" : change.to == "" ? "Empty" : change.to}`}</td>    
																	<td>{change?.user?.fullNames}</td>                                  
																	</tr>
																))}
																</tbody>
															</Table>
															</div>                                 
													
															</Form>
														</Card.Body>}
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

Profile.layout = "ManageLayout"

export default Profile;