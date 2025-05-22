import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Modal, Row, Badge, Alert, Tab, Nav, Form, Table, FormGroup, InputGroup, Dropdown, ListGroup, ListGroupItem } from "react-bootstrap";
import { useRouter } from 'next/router';
import Link from "next/link";
import moment from 'moment';
import Pageheader from "@/components/partials/Pageheader";
import StateHandler from "@/components/partials/StateHandler";
import { fetchStaffMember, saveStaffMember, verifyProfile } from "@/redux/manage/slices/staff";
import { countries, banks } from "@/utils/config";

const StaffDetailsPage = ({ }) => { 

    const router = useRouter();
    const { staffId } = router.query;
  
    const dispatch = useDispatch();
    const { staffMember } = useSelector(state => state.staff);

    const [staff, setStaff] = useState({});	
    const [staffErrors, setStaffErrors] = useState({});

    const [addLeave, setAddLeave] = useState(false);
    const [newLeave, setNewLeave] = useState({});
    const [leaveErrors, setLeaveErrors] = useState({});

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

    const handleUpload = async (e) => {

		const file = e.target.files[0];
		console.log('file', file)

	};

	const getStaffErrors = () => {

		const errors = {};
	   
		// User Profile validation
		if (!staff?.knownAs?.trim()) errors.knownAs = 'Please enter your preferred name';
		if (!staff?.privatePhoneNr?.toString()?.trim()) {
		  errors.privatePhoneNr = 'Phone number is required';
		} else if (!/^\d{9}$/.test(staff.privatePhoneNr)) {
		  errors.privatePhoneNr = 'Please enter a valid 9-digit phone number';
		}
		
		if (!staff?.privateEmail?.trim()) {
		  errors.privateEmail = 'Email address is required'; 
		} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(staff.privateEmail)) {
		  errors.privateEmail = 'Please enter a valid email address';
		}
	   
		// Address validation
		if (!staff?.addressLine1?.trim()) errors.addressLine1 = 'Street address is required';
		if (!staff?.suburb?.trim()) errors.suburb = 'Suburb is required';
		if (!staff?.city?.trim()) errors.city = 'City is required';
		if (!staff?.zip?.toString().trim()) {
		  errors.zip = 'Postal code is required';
		} else if (!/^\d{4}$/.test(staff.zip)) {
		  errors.zip = 'Please enter a valid 4-digit postal code';
		}
		if (!staff?.province?.trim()) errors.province = 'Please select your province';
		if (!staff?.country?.trim()) errors.country = 'Please select your country';
	   
		// Next of Kin validation
		if (!staff?.nextOfkinName?.trim()) errors.nextOfkinName = 'Next of kin name is required';
		if (!staff?.nextOfkinCellNr?.toString()?.trim()) {
		  errors.nextOfkinCellNr = 'Next of kin contact number is required';
		} else if (!/^\d{9}$/.test(staff.nextOfkinCellNr)) {
		  errors.nextOfkinCellNr = 'Please enter a valid 9-digit phone number';
		}
		if (!staff?.nextOfKinRelationship?.trim()) errors.nextOfKinRelationship = 'Please select your relationship';
		if (!staff?.nextOfKinAddress?.trim()) errors.nextOfKinAddress = 'Next of kin address is required';
	   
		// Medical Aid validation (optional fields)
		if (staff?.medicalAidProvider?.trim() && !staff?.medicalAidNr?.trim()) {
		  errors.medicalAidNr = 'Please enter medical aid number if provider is specified';
		}
		if (staff?.medicalAidNr?.trim() && !staff?.medicalAidProvider?.trim()) {
		  errors.medicalAidProvider = 'Please select medical aid provider if number is specified';
		}
	   
		// Allergies validation
		if (staff?.allergiesOrMedicalConditions?.length > 0) {
			const allergyErrors = staff.allergiesOrMedicalConditions.map(item => 
			!item.trim() ? 'Please enter allergy/condition or remove this field' : null
			);
			if (allergyErrors.some(error => error)) {
			errors.allergiesOrMedicalConditions = allergyErrors;
			}
		}
	   
		// Banking validation
		if (!staff?.bankName?.trim()) errors.bankName = 'Please select your bank';
		if (!staff?.bankAccountHolderName?.trim()) {
		  errors.bankAccountHolderName = 'Account holder name is required';
		} else if (!/^[A-Za-z\s]{2,}$/.test(staff.bankAccountHolderName)) {
		  errors.bankAccountHolderName = 'Please enter a valid account holder name';
		}
		
		if (!staff?.bankAccountNr?.toString()?.trim()) {
		  errors.bankAccountNr = 'Account number is required';
		} else if (!/^\d{5,}$/.test(staff.bankAccountNr)) {
		  errors.bankAccountNr = 'Please enter a valid account number';
		}
		
		if (!staff?.bankAccountType?.trim()) errors.bankAccountType = 'Please select account type';
		if (!staff?.branchCode?.toString()?.trim()) errors.branchCode = 'Branch code is required';
	   
		return Object.keys(errors).length ? errors : null;

	};  
	   
	const handleSave = async (e) => {

		e.preventDefault();

		const errors = getStaffErrors();

		console.log('errors', errors)
		
		if (errors) {
		  setStaffErrors(errors);
		  const firstError = document.querySelector('.is-invalid');
		  if (firstError) {
			firstError.scrollIntoView({ 
				behavior: 'smooth',
				block: 'center'
			});
		  }
		  return;
		}

		setStaffErrors({});
	    console.log('submit', staff)
		dispatch(saveStaffMember({ staffId, staff }));

	};

    const handleAddNewLeave = async (e) => {

        e.preventDefault();

    }

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

    function toBoolean(value) {
        return value === "true";
    }
  
    useEffect(() => {
      staffId && dispatch(fetchStaffMember({ staffId }))
    }, [dispatch]);  

    useEffect(() => {
	 if(staffMember) setStaff({...staffMember});	
	}, [staffMember]);

    console.log('staff',staff);
  
      return (
        <StateHandler slice="staff">  
          <Pageheader title="Staff" heading="Manage" active="Staff" />       
             <Row>
				<Col lg={12} md={12}>
					<Tab.Container id="left-tabs-example" defaultActiveKey="Profile">

						<Card className="custom-card ">
						<Card.Body className=" d-md-flex bg-white">        
							{staff?.profileImage && 
							  <span className="profile-image pos-relative">
							  <img 
								src={staff?.profileImage}
								alt="staff logo"
								style={{ 
								width: "200px", 
								height: "200px",
								objectFit: 'contain'
								}}
								/>
							</span>}
							
							<div className="my-md-auto mt-4 prof-staff">

								<h5 className="font-weight-semibold ms-md-4 ms-0 mb-1 pb-0 mb-3">
							      {staff?.fullNames}{!staff?.isComplete &&<Badge bg="primary" className="ms-2">Profile Incomplete</Badge>}
								</h5>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
									<i className="fas fa-id-card me-2"></i>
									</span>
									<span className="font-weight-semibold me-2 d-none d-md-inline">
										Identification Nr:
									</span>									
							    	<span>{staff?.idOrPassportNr}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
									<i className="fas fa-venus-mars me-2"></i>
									</span>
									<span className="font-weight-semibold me-2 d-none d-md-inline">
										Gender:
									</span>									
							    	<span>{staff?.gender ? staff?.gender : 'Unknown'}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
									<span>
									<i className="fas fa-birthday-cake me-2"></i>
									</span>
									<span className="font-weight-semibold me-2 d-none d-md-inline">
										Date of Birth:
									</span>									
							    	<span>{staff?.dateOfBirth ? moment(staff?.dateOfBirth).format('YYYY-MM-DD'): "Unknown"}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
								   <i className="fas fa-globe me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">
									Nasionality:
								</span>
							    	<span>{staff?.nasionality ? staff?.nasionality: "Unknown"}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fas fa-university me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">
									Employee Nr:
								</span>
							    	<span>{staff?.employeeNr}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
							     	<i className="fa fa-briefcase me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Occupation:</span>
								  <span>{staff?.occupation}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
							     	<i className="fa fa-briefcase me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Department:</span>
								  <span>{staff?.department}</span>
								</p>
								
								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
									<i className="fa fa-phone me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Phone:</span>
								<span>{`${staff?.phoneNrExt || '+27'}${staff?.phoneNr}`}</span>
								</p>

								<p className="text-muted ms-md-4 ms-0 mb-2">
								<span>
								<i className="fa fa-envelope me-2"></i>
								</span>
								<span className="font-weight-semibold me-2 d-none d-md-inline">Email</span>
								<span>{staff?.email}</span>
								</p>
								
							</div>
							</Card.Body>
							<Card.Footer className="py-0">
								<div className="profile-tab tab-menu-heading border-bottom-0">
									<Nav variant="pills" className="nav main-nav-line p-0 tabs-menu profile-nav-line border-0 br-5 mb-0	">
										<Nav.Item className="me-1">
											<Nav.Link className=" mb-2 mt-2" eventKey="Timeline" disabled={!staff.isComplete}>
										     	Timeline
											</Nav.Link>
										</Nav.Item>
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Profile">
											     Profile
											</Nav.Link>
										</Nav.Item>																																		
										<Nav.Item className="me-1">
											<Nav.Link className="mb-2 mt-2" eventKey="Changes" disabled={!staff.isComplete}>
											  Changes
											</Nav.Link>
										</Nav.Item>							
									</Nav>
								</div>
							</Card.Footer>
						</Card>						
						
						{!staff.isComplete ? 						
						<Alert variant="primary" className="alert shadow fade show d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center">
							<i className="fas fa-shield-alt fa-lg me-2 text-primary"></i>
							<span>Your staff profile is incomplete, please complete your profile.</span>
						</div>						
						</Alert> :
						!staff?.emailVerified && 						
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

														{staff?.timeline?.length == 0 ? 

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
																	{staff?.timeline?.map((event, index) => (
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
																	Personal Information (if not verified)
																</div>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  First Name
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"		
																		isInvalid={staffErrors?.firstName}																
																		value={staff?.firstName	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.firstName = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.firstName && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.firstName}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Middle Name
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"		
																		isInvalid={staffErrors?.middleName}																
																		value={staff?.middleName	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.middleName = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.middleName && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.middleName}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Surname
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"		
																		isInvalid={staffErrors?.surname}																
																		value={staff?.surname	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.surname = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.surname && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.surname}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Initials</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				<div className="fw-bold text-muted">{staff?.initials}</div>                                
																			</div>
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">
																			Nasionality
																			</Form.Label>
																		</Col>
																		<Col md={9}>
																		<Form.Select
																			className="form-control"
																			isInvalid={staffErrors?.nasionality}
																			value={staff?.nasionality || ''}
																			onChange={(e) => {

																			const selectedCountry = countries.find((country) => country.name === e.target.value);

                                                                            setStaff((staff) => {
                                                                                staff.nasionality = selectedCountry.name
                                                                                staff.nasionalityCode = selectedCountry.code
                                                                                return { ...staff };
                                                                            });
																			
																			}}
																		    >
																			<option value="" disabled>Please choose a country</option>
																			{countries.map((country) => (
																			<option key={country.code} value={country.name}>
																				{country.name}
																			</option>
																			))}
																		</Form.Select>
																	     	{staffErrors?.country && (
																			<Form.Control.Feedback type="invalid">
																			  {staffErrors.country}
																			</Form.Control.Feedback>)}
																		</Col>
																	</Row>
																</FormGroup>      
                                                                
                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Nasionality</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.gender}
																				value={staff?.gender || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.gender = e.target.value;
																						return { ...staff };
																					});
																				}}>																				
																				<option value="" disabled>Select Gender</option>
																				<option value="Male">Male</option>	
                                                                                <option value="Female">Female</option>																				
																			</Form.Select>
																			{staffErrors?.gender && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.gender}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>                                                  

                                                                <FormGroup className="form-group ">
																	<Row className="row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
                                                                          {staff?.nasionality === 'South Africa' ? "RSA ID Number" : "Passport Number"}
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type={staff?.nasionality === 'South Africa' ? "number" : "text"}
																		className="form-control"		
																		isInvalid={staffErrors?.idOrPassportNr}																
																		value={staff?.idOrPassportNr	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.idOrPassportNr = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.idOrPassportNr && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.idOrPassportNr}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Gender</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.gender}
																				value={staff?.gender || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.gender = e.target.value;
																						return { ...staff };
																					});
																				}}>																				
																				<option value="" disabled>Select Gender</option>
																				<option value="Male">Male</option>	
                                                                                <option value="Female">Female</option>																				
																			</Form.Select>
																			{staffErrors?.gender && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.gender}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Date Of Birth
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="date"
																		className="form-control"		
																		isInvalid={staffErrors?.dateOfBirth}																
																		value={staff?.dateOfBirth	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.dateOfBirth = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.dateOfBirth && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.dateOfBirth}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Is Profile Complete</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				{staff?.isComplete ? <div className="fw-bold text-success">Complete</div> : <div className="fw-bold text-danger">Not Complete</div>}                                 
																			</div>
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Is Info Verified</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				{staff?.isInfoVerified ? <div className="fw-bold text-success">Verified</div> : <div className="fw-bold text-danger">Not Verified</div>}                                 
																			</div>
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Start Date
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="date"
																		className="form-control"		
																		isInvalid={staffErrors?.startDate}																
																		value={staff?.startDate	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.startDate = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.startDate && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.startDate}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  End Date
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="date"
																		className="form-control"		
																		isInvalid={staffErrors?.endDate}																
																		value={staff?.endDate	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.endDate = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.endDate && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.endDate}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <div className="mb-4 main-content-label text-primary">
																	Payroll
																</div>

                                                                <FormGroup className="form-group" type='Is Salary Earner'>
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Is Salary Earner</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.isSalaryEarner}
																				value={staff?.isSalaryEarner || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.isSalaryEarner = Boolean(e.target.value);
																						return { ...staff };
																					});
																				}}>																				
																				<option value="" disabled>Select isSalaryEarner</option>
																				<option value="true">Enable</option>	
                                                                                <option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.isSalaryEarner && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.isSalaryEarner}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group" type='Employment Type'>
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Employment Type</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.employmentType}
																				value={staff?.employmentType || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.employmentType = e.target.value;
																						return { ...staff };
																					});
																				}}>																				
																				<option value="" disabled>Select Type</option>
                                                                                <option value="Permanent">Permanent</option>	
                                                                                <option value="Fixed Term">Fixed Term</option>
                                                                                <option value="Temporary">Temporary</option>
                                                                                <option value="Casual">Casual</option>
                                                                                <option value="Part-time">Part-time</option>
                                                                                <option value="Seasonal">Seasonal</option>
                                                                                <option value="Intern">Intern</option>                                                                                																			
																			</Form.Select>
																			{staffErrors?.employmentType && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.employmentType}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group" type='Pay Frequency'>
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Pay Frequency</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.payFrequency}
																				value={staff?.payFrequency || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.payFrequency = e.target.value;
																						return { ...staff };
																					});
																				}}>																				
																				<option value="" disabled>Select Type</option>
																				<option value="Monthly">Monthly</option>	
                                                                                <option value="Fortnight">Fortnight</option>	
                                                                                <option value="Weekly">Weekly</option>																			
																			</Form.Select>
																			{staffErrors?.payFrequency && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.payFrequency}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group" type='Pay Day'>
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Pay Day</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.payDay}
																				value={staff?.payDay || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.payDay = e.target.value;
																						return { ...staff };
																					});
																				}}>		
                                                                                {staff?.payFrequency === 'Monthly' ? 
                                                                                <>																		
																				<option value="" disabled>Select Type</option>
                                                                                <option value="1">1</option>	
                                                                                <option value="2">2</option>
                                                                                <option value="Last">Last</option>   
                                                                                </>:<>
                                                                                <option value="" disabled>Select Type</option>
                                                                                <option value="Monday">Monday</option>	
                                                                                <option value="Tuesday">Tuesday</option>
                                                                                <option value="Sunday">Sunday</option>                                                                                
                                                                                </>}                                                                             																			
																			</Form.Select>
																			{staffErrors?.payDay && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.payDay}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group" type='Basic'>
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
                                                                        {staff?.payFrequency} Basic
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="number"
																		className="form-control"		
																		isInvalid={staffErrors?.firstName}																
																		value={staff?.firstName	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.firstName = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.firstName && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.firstName}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group" type='Hourly Rate'>
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
                                                                        Hourly Rate
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="number"
																		className="form-control"		
																		isInvalid={staffErrors?.hourlyRate}																
																		value={staff?.hourlyRate	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.hourlyRate = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.hourlyRate && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.hourlyRate}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group" type='Is Comission Earner'>
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Is Comission Earner</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.getComission}
																				value={staff?.getComission || false}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.getComission = toBoolean(e.target.value);
																						return { ...staff };
																					});
																				}}>																				
																				<option value="" disabled>Select getComission</option>
																				<option value="true">Enable</option>	
                                                                                <option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.getComission && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.getComission}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                {staff?.getComission &&
                                                                <FormGroup className="form-group" type='Current Comission'>
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Current Comission</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				<div className="fw-bold text-muted">{staff?.currentComission || 0.00}</div>                                
																			</div>
																		</Col>
																	</Row>
																</FormGroup>}

                                                                <FormGroup className="form-group" type='Income Tax Nr'>
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
                                                                          Income Tax Nr
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="number"
																		className="form-control"		
																		isInvalid={staffErrors?.incomeTaxNr}																
																		value={staff?.incomeTaxNr	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.incomeTaxNr = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.incomeTaxNr && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.incomeTaxNr}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 

                                                               

                                                                

                                                                
                                                                <div className="mb-4 main-content-label text-primary">
																	Other
																</div>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Internal Account Nr
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"		
																		isInvalid={staffErrors?.accountNr}																
																		value={staff?.accountNr	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.accountNr = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.accountNr && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.accountNr}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																<Row className="row-sm">
																<Col md={3}>
																	<Form.Label className="form-label">Work Cellphone Nr</Form.Label>
																</Col>
																<Col md={9}>
																	<InputGroup>
																	<Dropdown>
																		<Dropdown.Toggle variant="light" id="country-dropdown">
																		{staff?.phoneNrExt || '+27'}
																		</Dropdown.Toggle>
																		<Dropdown.Menu>
																		{countries.map(country => (
																			<Dropdown.Item 
																			key={country.code}
																			onClick={() => setStaff(prev => ({
																				...prev,
																				countryCode: country.code,
																				phoneNrExt: country.ext
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
																			isInvalid={staffErrors?.phoneNr}                              
																			value={staff?.phoneNr || ''}   																		
																			onChange={(e) => {
																				setStaff((staff) => {
                                                                                    staff.phoneNr = e.target.value;
																				return { ...staff };
																			})}}
																		/>
																		{staffErrors?.phoneNr && (
																			<Form.Control.Feedback type='invalid'>
																			{staffErrors.phoneNr}
																			</Form.Control.Feedback>)}	
																	</InputGroup>
																	{!staff?.phoneVerified && (verificationMessage({ type: 'phoneNr' }))}																	
																	{staff?.phoneVerifiedAt && (
																	<div className="form-text">
																		Verified on: {moment(staff.phoneVerifiedAt).format('MMMM Do YYYY, h:mm a')}
																	</div>)}
																</Col>
																</Row>
																</FormGroup>																

																<FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		Work Email
																		</Form.Label>
																	</Col>
																	<Col md={9}>																
																	      <Form.Control
																			type="text"
																			className="form-control"   
																			isInvalid={staffErrors?.email}                              
																			value={staff?.email || ''}																			
																			onChange={(e) => {
																				setStaff((staff) => {
																				staff.email = e.target.value;
																				return { ...staff };
																				})}}
																			/>																				
																			{staffErrors?.email && (
																			<Form.Control.Feedback type='invalid'>
																				{staffErrors.email}
																			</Form.Control.Feedback>)}	
																			{!staff?.emailVerified && !staffErrors?.email && (verificationMessage({ type: 'privatePhoneNr' }))}	
																			{staff?.emailVerifiedAt && (
																			<div className="form-text">
																				Verified on: {moment(staff.emailVerifiedAt).format('MMMM Do YYYY, h:mm a')}
																			</div>)}															
																		
																	</Col>
																	</Row>
																</FormGroup>  

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Suspended</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.isSuspended}
																				value={staff?.isSuspended || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.isSuspended = Boolean(e.target.value);
																						return { ...staff };
																					});
																				}}>																				
																				<option value="true">Enable</option>
																				<option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.isSuspended && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.isSuspended}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Active</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.isActive}
																				value={staff?.isActive || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.isActive = Boolean(e.target.value);
																						return { ...staff };
																					});
																				}}>																				
																				<option value="true">Enable</option>
																				<option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.isActive && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.isActive}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Public</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.isPublic}
																				value={staff?.isPublic || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.isPublic = Boolean(e.target.value);
																						return { ...staff };
																					});
																				}}>																				
																				<option value="true">Enable</option>
																				<option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.isPublic && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.isPublic}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>

                                                                <FormGroup className="form-group ">
																	<Row className=" row-sm">
																	<Col md={3}>
																		<Form.Label className="form-label">
																		  Employee Nr
																		</Form.Label>
																	</Col>                                      
																	<Col md={9}>
																		<Form.Control
																		type="text"
																		className="form-control"		
																		isInvalid={staffErrors?.employeeNr}																
																		value={staff?.employeeNr	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.employeeNr = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.employeeNr && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.employeeNr}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup> 

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Department</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.department}
																				value={staff?.department || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.department = e.target.value;
																						return { ...staff };
																					});
																				}}>																				
																				<option value="">Select Department</option>
																				<option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.department && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.department}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>   

                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Occupation</Form.Label>
																		</Col>
																		<Col md={9}>
																			<Form.Select
																				className="form-control"
																				isInvalid={staffErrors?.occupation}
																				value={staff?.occupation || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.occupation = e.target.value;
																						return { ...staff };
																					});
																				}}>																				
																				<option value="">Select occupation</option>
																				<option value="false">Disable</option>																				
																			</Form.Select>
																			{staffErrors?.occupation && (
																			<Form.Control.Feedback type="invalid">
																				{staffErrors.occupation}
																			</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>                                                                                                                                        
															
																<div className="mb-4 main-content-label text-primary">
																	Staff Profile
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
																		isInvalid={staffErrors?.knownAs}																
																		value={staff?.knownAs	|| ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.knownAs = e.target.value;
																			return { ...staff };
																		})}}
																		/>
																		{staffErrors?.knownAs && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.knownAs}
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
																		{staff?.privatePhoneNrExt || '+27'}
																		</Dropdown.Toggle>
																		<Dropdown.Menu>
																		{countries.map(country => (
																			<Dropdown.Item 
																			key={country.code}
																			onClick={() => setStaff(prev => ({
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
																			isInvalid={staffErrors?.privatePhoneNr}                              
																			value={staff?.privatePhoneNr || ''}   																		
																			onChange={(e) => {
																				setStaff((staff) => {
                                                                                    staff.privatePhoneNr = e.target.value;
																				return { ...staff };
																			})}}
																		/>
																		{staffErrors?.privatePhoneNr && (
																			<Form.Control.Feedback type='invalid'>
																			{staffErrors.privatePhoneNr}
																			</Form.Control.Feedback>)}	
																	</InputGroup>
																	{!staff?.privatePhoneNrVerified && (															
																	  verificationMessage({ type: 'privatePhoneNr' })
																	)}																	
																	{staff?.privatePhoneNrVerifiedAt && (
																	<div className="form-text">
																		Verified on: {moment(staff.privatePhoneNrVerifiedAt).format('MMMM Do YYYY, h:mm a')}
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
																			isInvalid={staffErrors?.privateEmail}                              
																			value={staff?.privateEmail || ''}																			
																			onChange={(e) => {
																				setStaff((staff) => {
																				staff.privateEmail = e.target.value;
																				return { ...staff };
																				})}}
																			/>																				
																			{staffErrors?.privateEmail && (
																			<Form.Control.Feedback type='invalid'>
																				{staffErrors.privateEmail}
																			</Form.Control.Feedback>)}	
																			{!staff?.privateEmailVerified && !staffErrors?.privateEmail && (verificationMessage({ type: 'privatePhoneNr' }))}	
																			{staff?.privateEmailVerifiedAt && (
																			<div className="form-text">
																				Verified on: {moment(staff.privateEmailVerifiedAt).format('MMMM Do YYYY, h:mm a')}
																			</div>)}															
																		
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
																				isInvalid={staffErrors?.addressLine1}
																				value={staff?.addressLine1 || ''}
																				onChange={(e) => setStaff({ ...staff, addressLine1: e.target.value })}
																			/>
																			{staffErrors?.addressLine1 && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.addressLine1}
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
																				isInvalid={staffErrors?.addressLine2}
																				value={staff?.addressLine2 || ''}
																				onChange={(e) => setStaff({ ...staff, addressLine2: e.target.value })}
																			/>
																			{staffErrors?.addressLine2 && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.addressLine2}
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
																				isInvalid={staffErrors?.suburb}
																				value={staff?.suburb || ''}
																				onChange={(e) => setStaff({ ...staff, suburb: e.target.value })}
																			/>
																			{staffErrors?.suburb && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.suburb}
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
																				isInvalid={staffErrors?.city}
																				value={staff?.city || ''}
																				onChange={(e) => setStaff({ ...staff, city: e.target.value })}
																			/>
																			{staffErrors?.city && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.city}
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
																				isInvalid={staffErrors?.zip}
																				value={staff?.zip || ''}
																				onChange={(e) => setStaff({ ...staff, zip: e.target.value })}
																			/>
																			{staffErrors?.zip && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.zip}
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
																				isInvalid={staffErrors?.province}
																				value={staff?.province || ''}
																				onChange={(e) => setStaff({ ...staff, province: e.target.value })}
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
																			{staffErrors?.province && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.province}
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
																				isInvalid={staffErrors?.country}
																				value={staff?.country || 'South Africa'}
																				onChange={(e) => setStaff({ ...staff, country: e.target.value })}
																			>
																				<option value="South Africa">South Africa</option>
																				{/* Add more countries */}
																				<option value="USA">USA</option>
																				<option value="UK">UK</option>
																				<option value="Australia">Australia</option>
																			</Form.Select>
																			{staffErrors?.country && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.country}
																				</Form.Control.Feedback>
																			)}
																		</Col>
																	</Row>
																</FormGroup>
                                                                <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Full Address</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				<div className="fw-bold text-muted">{staff?.fullAddress}</div>                                
																			</div>
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
																			isInvalid={staffErrors?.nextOfkinName}																	
																			value={staff?.nextOfkinName || ''}
																			onChange={(e) => {
																				setStaff((staff) => {
                                                                                staff.nextOfkinName = e.target.value;
																				return { ...staff };
																			})}}
																		/>
																		{staffErrors?.nextOfkinName && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.nextOfkinName}
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
																		{staff?.nextOfkinCellNrExt || '+27'}
																		</Dropdown.Toggle>
																		<Dropdown.Menu>
																		{countries.map(country => (
																			<Dropdown.Item 
																			key={country.code}
																			onClick={() => setStaff(prev => ({
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
																			isInvalid={staffErrors?.nextOfkinCellNr}                              
																			value={staff?.nextOfkinCellNr || ''}                                          
																			onChange={(e) => {
																				setStaff((staff) => {
                                                                                staff.nextOfkinCellNr = e.target.value;
																				return { ...staff };
																				})}}
																			/>
																			{staffErrors?.nextOfkinCellNr && (
																			<Form.Control.Feedback type='invalid'>
																				{staffErrors.nextOfkinCellNr}
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
																				isInvalid={staffErrors?.nextOfKinRelationship}
																				value={staff?.nextOfKinRelationship || ''}
																				onChange={(e) => {
																					setStaff((staff) => {
																						staff.nextOfKinRelationship = e.target.value;
																						return { ...staff };
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
																			{staffErrors?.nextOfKinRelationship && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.nextOfKinRelationship}
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
																		isInvalid={staffErrors?.nextOfKinAddress}                              
																		value={staff?.nextOfKinAddress || ''}
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.nextOfKinAddress = e.target.value;
																			return { ...staff };
																			})}}
																		/>
																		{staffErrors?.nextOfKinAddress && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.nextOfKinAddress}
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
																			value={staff?.medicalAidProvider}
																			onChange={(e) => {
																				setStaff((staff) => {
																				staff.medicalAidProvider = e.target.value;
																				return { ...staff };
																			})}}
																		/>
																		{staffErrors?.medicalAidProvider && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.medicalAidProvider}
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
																		isInvalid={staffErrors?.medicalAidNr}                              
																		value={staff?.medicalAidNr}                                          
																		onChange={(e) => {
																			setStaff((staff) => {
																			staff.medicalAidNr = e.target.value;
																			return { ...staff };
																			})}}
																		/>
																		{staffErrors?.medicalAidNr && (
																		<Form.Control.Feedback type='invalid'>
																			{staffErrors.medicalAidNr}
																		</Form.Control.Feedback>)}
																	</Col>
																	</Row>
																</FormGroup>
															
																<div>
																	<div className="mb-4 main-content-label text-primary">
																		Allergies and Medical Conditions
																	</div>

																	{staff?.allergiesOrMedicalConditions?.length > 0 ? (
																		staff.allergiesOrMedicalConditions.map((condition, index) => (
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
																					isInvalid={staffErrors?.allergiesOrMedicalConditions?.[index]}
																					onChange={(e) => {
																						const updatedConditions = [...staff.allergiesOrMedicalConditions];
																						updatedConditions[index] = e.target.value;
																						setStaff({ ...staff, allergiesOrMedicalConditions: updatedConditions });
																					}}
																					/>
																					<Button
																					variant="primary"
																					type="button"
																					onClick={() => {
																						const updatedConditions = staff.allergiesOrMedicalConditions.filter((_, i) => i !== index);
																						setStaff({ ...staff, allergiesOrMedicalConditions: updatedConditions });
																					}}
																					>
																					X
																					</Button>
																				</InputGroup>
																				{staffErrors?.allergiesOrMedicalConditions?.[index] && (
																					<Form.Control.Feedback type="invalid">
																					{staffErrors.allergiesOrMedicalConditions[index]}
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
																						setStaff((staff) => ({
																							...staff,
																							allergiesOrMedicalConditions: [
																								...(staff.allergiesOrMedicalConditions || []),
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
																				isInvalid={staffErrors?.bankName}
																				value={staff?.bankName || ''}
																				onChange={(e) => {																				
                                                                                    const bank = banks.find(b => b.name === e.target.value);		                                                                           
																					setStaff(prev => ({
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
																			{staffErrors?.bankName && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.bankName}
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
																				isInvalid={staffErrors?.bankAccountHolderName}
																				value={staff?.bankAccountHolderName || ''}
																				onChange={(e) => setStaff({ ...staff, bankAccountHolderName: e.target.value })}
																			/>
																			{staffErrors?.bankAccountHolderName && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.bankAccountHolderName}
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
																				isInvalid={staffErrors?.bankAccountNr}
																				value={staff?.bankAccountNr || ''}
																				onChange={(e) => setStaff({ ...staff, bankAccountNr: e.target.value })}
																			/>
																			{staffErrors?.bankAccountNr && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.bankAccountNr}
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
																				isInvalid={staffErrors?.bankAccountType}
																				value={staff?.bankAccountType || ''}
																				onChange={(e) => setStaff({ ...staff, bankAccountType: e.target.value })}
																			>
																				<option value="" disabled>Select Account Type</option>
																				<option value="Cheque">Cheque</option>
																				<option value="Savings">Savings</option>
																				<option value="Transmission">Transmission</option>
																			</Form.Select>
																			{staffErrors?.bankAccountType && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.bankAccountType}
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
																				isInvalid={staffErrors?.branchCode}
																				value={staff?.branchCode || ''}
																				onChange={(e) => setStaff({ ...staff, branchCode: e.target.value })}
																			/>
																			{staffErrors?.branchCode && (
																				<Form.Control.Feedback type="invalid">
																					{staffErrors.branchCode}
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
																				{staff?.bankAccountVerified ? <div className="fw-bold text-success">Verified</div> : <div className="fw-bold text-danger">Not Verified</div>}                                 
																			</div>
																		</Col>
																	</Row>
																</FormGroup>													
																{!staff?.bankAccountVerified && staff?.bankName && staff?.bankAccountNr && staff?.bankAccountType && staff?.branchCode && (			
																<Row className="mb-4">
																<Col md={6}>                          
																	<Form.Label
																	htmlFor="formFile"
																	className="form-label"
																	>
																	Upload Proof of banking staff to verify
																	</Form.Label>
																	<Form.Control
																	className="form-control"
																	type="file"
																	accept="image/*"
																	id="logoFile"
																	onChange={handleUpload}
																	/>
																	<Form.Text muted>
																	{staff?.bankAccountVerifiedOn ? moment(staff.bankAccountVerifiedOn).format('LLL') : 'Never uploaded'}
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
												<Tab.Pane eventKey="Payslips" className="main-content-body  p-0 border-0">
												
													<Card>

														{staff?.organization?.payslip == undefined ? 
														<Card.Body className=" border border-primary text-center rounded">
															<div className="text-center">
																<i className="bi bi-info-circle fs-50 text-primary"></i>
																<h3 className="mt-3 text-primary">Payroll is not set up yet!</h3>
																<p className="mt-3 mb-0">
																	Your payslips will appear here once your employer decides to enable this service.
																</p>																
															</div>

														</Card.Body>
														: staff?.organization?.payslip == true &&

														<Card.Body className=" p-0 border-0 p-0 rounded-10">
															<h1>Payslips</h1>
														</Card.Body>}
														      
													</Card>
												
												</Tab.Pane>											
												<Tab.Pane eventKey="Leave" className="main-content-body  p-0 border-0">
												
                                                <Card>
                                                    {addLeave ? (
                                                        <Card.Body className="border-0">                                                       
                                                        <Form className="form-horizontal">
                                                            <div className="mb-4 main-content-label">New Leave Application</div>

                                                            <FormGroup className="form-group">
                                                            <Row className="row-sm">
                                                                <Col md={3}>
                                                                <Form.Label className="form-label">Leave Type</Form.Label>
                                                                </Col>
                                                                <Col md={9}>
                                                                <Form.Select
                                                                    className="form-control"
                                                                    isInvalid={leaveErrors?.type}
                                                                    value={newLeave.type}
                                                                    onChange={(e) => {
                                                                    setNewLeave((prev) => {
                                                                        prev.type = e.target.value;
                                                                        prev.balance = staff?.leaveCalculations.find(
                                                                        (leave) => leave.type === e.target.value
                                                                        ).balance;
                                                                        return { ...prev };
                                                                    });
                                                                    }}
                                                                >
                                                                    <option value="">Select Leave Type</option>
                                                                    {staff?.leaveCalculations?.map((leave) => (
                                                                    <option key={leave._id} value={leave.type}>
                                                                        {leave.type}
                                                                    </option>
                                                                    ))}
                                                                </Form.Select>
                                                                 {leaveErrors?.type && (
                                                                  <Form.Control.Feedback type="invalid">
                                                                    {leaveErrors.type}
                                                                  </Form.Control.Feedback>)} 
                                                                </Col>
                                                            </Row>
                                                            </FormGroup>

                                                            <FormGroup className="form-group">
																	<Row className="row-sm">
																		<Col md={3}>
																			<Form.Label className="form-label">Leave Balance</Form.Label>
																		</Col>
																		<Col md={9}>
																		<div className="ms-2 mx-2">
																				<div className={`fw-bold text-${Number(newLeave.balance) > 0 ? 'success' : 'danger'}`}>{newLeave.balance}</div>                                
																			</div>
																		</Col>
																	</Row>
															</FormGroup>

                                                            <FormGroup className="form-group">
                                                            <Row className="row-sm">
                                                                <Col md={3}>
                                                                <Form.Label className="form-label">Start Date</Form.Label>
                                                                </Col>
                                                                <Col md={9}>
                                                                <Form.Control
                                                                    type="date"
                                                                    className="form-control"
                                                                    isInvalid={leaveErrors?.startDate}
                                                                    value={newLeave.startDate}
                                                                    onChange={(e) => {
                                                                    setNewLeave((prev) => {
                                                                        prev.startDate = e.target.value;
                                                                        return { ...prev };
                                                                    });
                                                                    }}
                                                                />
                                                                {leaveErrors?.startDate && (
                                                                 <Form.Control.Feedback type="invalid">
                                                                  {leaveErrors.startDate}
                                                                  </Form.Control.Feedback>)}
                                                                </Col>
                                                            </Row>
                                                            </FormGroup>

                                                            <FormGroup className="form-group">
                                                            <Row className="row-sm">
                                                                <Col md={3}>
                                                                <Form.Label className="form-label">End Date</Form.Label>
                                                                </Col>
                                                                <Col md={9}>
                                                                <Form.Control
                                                                    type="date"
                                                                    className="form-control"
                                                                    isInvalid={leaveErrors?.endDate}
                                                                    value={newLeave.endDate}
                                                                    onChange={(e) => {
                                                                    setNewLeave((prev) => {
                                                                        prev.endDate = e.target.value;
                                                                        return { ...prev };
                                                                    });
                                                                    }}
                                                                />
                                                               {leaveErrors?.endDate && (
                                                                <Form.Control.Feedback type="invalid">
                                                                    {leaveErrors.endDate}
                                                                 </Form.Control.Feedback>)}

                                                                </Col>
                                                            </Row>
                                                            </FormGroup>

                                                            <FormGroup className="form-group">
                                                            <Row className="row-sm">
                                                                <Col md={3}>
                                                                <Form.Label className="form-label">Reason (Optional)</Form.Label>
                                                                </Col>
                                                                <Col md={9}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control"
                                                                    isInvalid={leaveErrors?.reason}
                                                                    value={newLeave.reason}
                                                                    onChange={(e) => {
                                                                    setNewLeave((prev) => {
                                                                        prev.reason = e.target.value;
                                                                        return { ...prev };
                                                                    });
                                                                    }}
                                                                />
                                                                {leaveErrors?.reason && (
                                                                 <Form.Control.Feedback type="invalid">
                                                                    {leaveErrors.reason}
                                                                </Form.Control.Feedback>)}
                                                                </Col>
                                                            </Row>
                                                            </FormGroup>

                                                            <FormGroup className="form-group float-end">
                                                            <Row className="row-sm">
                                                                <Col md={12}>
                                                                <Button
                                                                    onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setAddLeave(false);
                                                                    }}
                                                                    className="btn btn-secondary me-2"
                                                                >
                                                                    Cancel
                                                                </Button>

                                                                <Button onClick={handleAddNewLeave} className="btn btn-primary">
                                                                    Submit
                                                                </Button>
                                                                </Col>
                                                            </Row>
                                                            </FormGroup>
                                                        </Form>
                                                        </Card.Body>
                                                    ) : staff?.leaveHistory?.length == 0 ? (
                                                        <Card.Body className="border border-primary text-center rounded">
                                                        <div className="text-center">
                                                            <i className="bi bi-info-circle fs-50 text-primary"></i>
                                                            <h3 className="mt-3 text-primary">No leave history as yet!</h3>
                                                            <p className="mt-3 mb-0">
                                                            Apply for leave, check application status, view your leave history, and
                                                            monitor your leave balances.
                                                            </p>
                                                            <Button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setAddLeave(true);
                                                            }}
                                                            className="btn btn-primary mt-3"
                                                            >
                                                            New Application
                                                            </Button>
                                                        </div>
                                                        </Card.Body>
                                                    ) : (
                                                        <Card.Body className="border-0">
                                                        {staff?.leaveHistory?.map((item, index) => (
                                                            <Card className="mb-3" key={index}>
                                                            <Card.Body>
                                                                <h5 className="fw-semibold text-primary">{`Type: ${item.type}`}</h5>
                                                                <p className="fs-6 font-weight-semibold text-dark mb-1">{`Start Date: ${moment(item.startDate).format('DD MMM YYYY')}`}</p>
                                                                <p className="fs-6 font-weight-semibold text-dark mb-1">{`End Date: ${moment(item.endDate).format('DD MMM YYYY')}`}</p>
                                                                <p className="fs-6 font-weight-semibold text-dark mb-1">{`Days: ${item.days}`}</p>
                                                                <p className="fs-6 font-weight-semibold text-dark mb-1">{`Status: ${item.status}`}</p>
                                                                {item.reason && (
                                                                <p className="fs-6 font-weight-semibold text-dark mb-1">{`Reason: ${item.reason}`}</p>
                                                                )}

                                                                {item.status === "Pending" && (
                                                                <div>
                                                                    <Button
                                                                    variant="success"
                                                                    className="me-2"
                                                                    onClick={() => onApprove(item)}
                                                                    >
                                                                    Approve
                                                                    </Button>
                                                                    <Button variant="danger" onClick={() => onReject(item)}>
                                                                    Reject
                                                                    </Button>
                                                                </div>
                                                                )}
                                                            </Card.Body>
                                                            </Card>
                                                        ))}
                                                        <Form className="my-5">
                                                            <FormGroup className="form-group float-end">
                                                            <Row className="row-sm">
                                                                <Col md={12}>
                                                                <Button
                                                                    onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setAddLeave(true);
                                                                    }}
                                                                    className="btn btn-primary mb-1"
                                                                >
                                                                    New Application
                                                                </Button>
                                                                </Col>
                                                            </Row>
                                                            </FormGroup>
                                                        </Form>
                                                        </Card.Body>
                                                    )}
                                                    </Card>

												
												</Tab.Pane>
												<Tab.Pane eventKey="Loans" className="main-content-body  p-0 border-0">
												
													<Card>

														{staff?.organization?.loans == undefined ? 
														<Card.Body className=" border border-primary text-center rounded">
															<div className="text-center">
																<i className="bi bi-info-circle fs-50 text-primary"></i>
																<h3 className="mt-3 text-primary">Staff management is not set up yet!</h3>
																<p className="mt-3 mb-0">
																	Once enabled, you'll be able to apply for loans, check application status, view your loans history, and monitor your loan balances.
																</p>
															</div>
														</Card.Body>
														: staff?.organization?.loans == true &&

														<Card.Body className=" p-0 border-0 p-0 rounded-10">
															<h1>TODO: loans</h1>
														</Card.Body>}
														
													</Card>
												
												</Tab.Pane>											
												<Tab.Pane eventKey="Changes" className="main-content-body  p-0 border-0">
													
														<Card>
														{staff?.changes?.length == 0 ? 

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
																{staff?.changes?.map((change) => (
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
  
};

StaffDetailsPage.layout = "ManageLayout";

export default StaffDetailsPage;