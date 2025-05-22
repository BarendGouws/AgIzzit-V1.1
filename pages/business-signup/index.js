import React, { Fragment, useEffect, useState } from "react";
import { Button, Card, Col, Form, Nav, Row, Tab, InputGroup, Container, Alert, Modal } from "react-bootstrap";
import NextImage from "next/image";
import Pageheader from "@/components/partials/Pageheader";
import serverAuth from "@/utils/serverAuth";
import { useSession } from 'next-auth/react'
import { Car, Home, Package, Wrench } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBusinessSignUp, createBusinessSignUp, updateBusinessSignUp, showVerification, hideVerification } from '@/redux/agizzit/slices/business-signup';

const BusinessSignUp = ({ isLoggedIn, user }) => { 

    const { status } = useSession(); 

    const dispatch = useDispatch();

    const { organization, loading, showModal } = useSelector(state => state.businessSignup);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchBusinessSignUp());
    }, [dispatch]);

    //PART 1 == COMPANY
    const [companyInfo, setCompanyInfo] = useState({
        registeredName: "",
        tradingName: "",
        regNumber1: "",
        regNumber2: "",
        regNumber3: "",
        landlineNr: "",
        mobileNr: "",
        websiteUrl: "",
        isVatRegistered: false,
        vatNumber: "",
        consent: false
    });    

    const handleChangeCompany = (e) => {

        const { name, value, type, checked } = e.target;  

        setCompanyInfo(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmitCompany = async (e) => {

        e.preventDefault();
        let newErrors = {};
    
        if (!companyInfo.registeredName) newErrors.registeredName = "Registered name is required";
        if (!companyInfo.tradingName) newErrors.tradingName = "Trading name is required";
        if (!/^\d{4}$/.test(companyInfo.regNumber1)) newErrors.regNumber1 = "Must be exactly 4 digits";
        if (!/^\d{6}$/.test(companyInfo.regNumber2)) newErrors.regNumber2 = "Must be exactly 6 digits";
        if (!/^\d{2}$/.test(companyInfo.regNumber3)) newErrors.regNumber3 = "Must be exactly 2 digits";
    
        if (!companyInfo.landlineNr) newErrors.landlineNr = "Landline number is required";
        if (companyInfo.landlineNr && !companyInfo.landlineNr.toString().startsWith('0')) newErrors.landlineNr = "Landline number must start with 0";
        if (companyInfo.landlineNr && companyInfo.landlineNr.length !== 10) newErrors.landlineNr = "Landline number must be 10 digits";
    
        if (!companyInfo.mobileNr) newErrors.mobileNr = "Mobile number is required";
        if (companyInfo.mobileNr && !companyInfo.mobileNr.startsWith('0')) newErrors.mobileNr = "Mobile number must start with 0";
        if (companyInfo.mobileNr && companyInfo.mobileNr.length !== 10) newErrors.mobileNr = "Mobile number must be exactly 10";        
    
        if (!companyInfo.websiteUrl) newErrors.websiteUrl = "Website is required";
        if (companyInfo.websiteUrl && !/^https?:\/\/\S+$/.test(companyInfo.websiteUrl)) newErrors.websiteUrl = "Invalid URL, must start with https://";
        if (companyInfo.isVatRegistered && !companyInfo.vatNumber) newErrors.vatNumber = "VAT number is required if VAT registered";
        if (companyInfo.isVatRegistered && companyInfo.vatNumber && !/^\d{10}$/.test(companyInfo.vatNumber)) newErrors.vatNumber = "VAT number must be exactly 10 digits";
        if (companyInfo.isVatRegistered && companyInfo.vatNumber && !companyInfo.vatNumber.startsWith('4')) newErrors.vatNumber = "VAT number must start with 4";
        if (!companyInfo.consent) newErrors.consent = "You must confirm that you are a representative of the company";
    
        setErrors(newErrors);
    
        console.log("Errors:", newErrors);
    
        if (Object.keys(newErrors).length === 0) { 
            console.log("Company info:", companyInfo);
            console.log(user)
    
            dispatch(createBusinessSignUp(companyInfo));
        }
    };

    //PART 2 == PRODUCTS & SERVICES
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryAlert, setCategoryAlert] = useState(null);
    
    const handleSubmitCategory = (e) => {
        
        e.preventDefault();
        if (selectedCategory === null) {

            setCategoryAlert("Please select a category");

        } else {

            setCategoryAlert(null);

            dispatch(updateBusinessSignUp({ category: selectedCategory, verification: null, _id: organization._id }));

        }
    };

    //PART 3 == VERIFICATION
    const handleVerification = () => {        
       dispatch(updateBusinessSignUp({ category: null, verification: true, _id: organization._id })); 
    };

    if(status == 'unauthenticated' || !isLoggedIn) {

        return (
            <Fragment>
	
			<Pageheader title="Business Sign Up" heading="Business" active="Sign Up" />			
		
					<Card className="custom-card">
						<Card.Body className=" p-0 product-checkout">
							<Tab.Container id="left-tabs-example" activeKey='company'>

								<Nav variant="pills" className="nav-tabs tab-style-2 d-sm-flex d-block border-bottom border-block-end-dashed justify-content-center text-center" id="myTab1" role="tablist">
									<Nav.Item>
										<Nav.Link eventKey="first" active>											
											<i className="ri-number-1 me-2 align-middle"></i>
											<span className="mt-2">Company</span>											
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="second">										
											<i className="ri-number-2 me-2 align-middle"></i>
											<span className="mt-2">Industry Category</span>											
										</Nav.Link>
									</Nav.Item>
                                    <Nav.Item>
										<Nav.Link eventKey="third">										
											<i className="ri-number-3 me-2 align-middle"></i>
											<span className="mt-2">Verification</span>											
										</Nav.Link>
									</Nav.Item>                                    								
								</Nav>
								<Row>
									<Col xl={8} className="mx-auto">
										<Tab.Content className="m-4">
											<Tab.Pane className="fade border-0 p-0" eventKey="company">
												
                                            <Form onSubmit={handleSubmitCompany}>
                                                <Row>
                                                <Col xs={12}>
                                                    <div className="text-center mb-4">
                                                    <i className="fa fa-building fa-3x text-primary"></i>
                                                    <h2 className="mt-3">Company Details</h2>
                                                    </div>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Registered Company Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="registeredName"
                                                        value={companyInfo.registeredName}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.registeredName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.registeredName}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Trading Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="tradingName"
                                                        value={companyInfo.tradingName}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.tradingName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.tradingName}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Registration Number (CIPC)</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                        type="text"
                                                        placeholder="YYYY"
                                                        name="regNumber1"
                                                        value={companyInfo.regNumber1}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.regNumber1}
                                                        maxLength={4}
                                                        />
                                                        <InputGroup.Text className="px-1">/</InputGroup.Text>
                                                        <Form.Control
                                                        type="text"
                                                        placeholder="NNNNNN"
                                                        name="regNumber2"
                                                        value={companyInfo.regNumber2}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.regNumber2}
                                                        maxLength={6}
                                                        />
                                                        <InputGroup.Text className="px-1">/</InputGroup.Text>
                                                        <Form.Control
                                                        type="text"
                                                        placeholder="UU"
                                                        name="regNumber3"
                                                        value={companyInfo.regNumber3}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.regNumber3}
                                                        maxLength={2}
                                                        />
                                                    </InputGroup>
                                                    {(errors.regNumber1 || errors.regNumber2 || errors.regNumber3) && (
                                                        <div className="text-danger mt-1 small">
                                                        {errors.regNumber1 || errors.regNumber2 || errors.regNumber3}
                                                        </div>
                                                    )}
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Website URL</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="websiteUrl"
                                                        value={companyInfo.websiteUrl}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.websiteUrl}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.websiteUrl}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col> 

                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Landline Number</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="landlineNr"                                                  
                                                        value={companyInfo.landlineNr}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.landlineNr}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.landlineNr}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Mobile Number</Form.Label>
                                                    <Form.Control
                                                        type="cell"
                                                        name="mobileNr"                                                
                                                        value={companyInfo.mobileNr}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.mobileNr}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.mobileNr}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        label="VAT Registered"
                                                        name="isVatRegistered"
                                                        checked={companyInfo.isVatRegistered}
                                                        onChange={handleChangeCompany}
                                                    />
                                                    </Form.Group>
                                                    {companyInfo.isVatRegistered && (
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>VAT Number</Form.Label>
                                                        <Form.Control
                                                        type="text"
                                                        name="vatNumber"
                                                        value={companyInfo.vatNumber}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.vatNumber}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.vatNumber}</Form.Control.Feedback>
                                                    </Form.Group>
                                                    )}
                                                </Col>                                                                                                                                                                                              
                                                
                                                <Col xs={12}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        label="I confirm that I am a active director of this company and have the authority to register it."
                                                        name="consent"
                                                        checked={companyInfo.consent}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.consent}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.consent}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col xs={12} className="text-end">
                                                    <Button variant="primary" type="submit" className="mt-3" >
                                                      Next
                                                    </Button>
                                                </Col>

                                                </Row>
                                            </Form>

											</Tab.Pane>
                                          
										</Tab.Content>
									</Col>
								</Row>

							</Tab.Container>
						</Card.Body>
					</Card>		
                                             
		    </Fragment>
        );

    }

    if (organization?.registrationStatus === "complete") {
        return (
          <Row className="mt-5">
            <Col xl={8} className="mx-auto">
              <Card className="text-center p-4 shadow">
                <Card.Body>
                <div className="success-widget">
				   <i className="bi bi-check-circle mg-b-20 fs-50 text-success lh-1"></i>
				    <h3 className="mt-3 text-success">Registration Complete!</h3>
					<p className="mt-3 mb-0">Thank you for registering your business with us. All directors have been <strong>SMSed their login details</strong>.</p>
				</div>
                  
                  <hr />
                  <h4>Directors</h4>
                  <ul className="list-group">
                    {organization?.directors.map((director) => { console.log(director);
                      const maskedPhone = `**** **** ${director.phoneNr?.toString().slice(-4)}`;
                      const loginStatus = director.loginHistory?.length > 0 ? "Logged In" : "Not Logged In";
    
                      return (
                        <li key={director._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{`${director.initials} ${director.surname}`}</span>
                          <span>{maskedPhone}</span>
                          <span className={`badge ${loginStatus === "Logged In" ? "bg-success" : "bg-secondary"}`}>
                            {loginStatus}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4">
                    <p>
                      Directors can now add administrative staff and personnel from the dashboard. Access your account to get
                      started!
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
    }

	return (

		<Fragment>
	
			<Pageheader title="Business Sign Up" heading="Business" active="Sign Up" />			
		
					<Card className="custom-card">
						<Card.Body className=" p-0 product-checkout">
							<Tab.Container id="left-tabs-example" activeKey={organization?.registrationStatus ? organization.registrationStatus : 'company'}>

								<Nav variant="pills" className="nav-tabs tab-style-2 d-sm-flex d-block border-bottom border-block-end-dashed justify-content-center text-center" id="myTab1" role="tablist">
									<Nav.Item>
										<Nav.Link eventKey="company">											
											<i className="ri-number-1 me-2 align-middle"></i>
											<span className="mt-2">Company</span>											
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="category">										
											<i className="ri-number-2 me-2 align-middle"></i>
											<span className="mt-2">Industry Category</span>											
										</Nav.Link>
									</Nav.Item>
                                    <Nav.Item>
										<Nav.Link eventKey="verification">										
											<i className="ri-number-3 me-2 align-middle"></i>
											<span className="mt-2">Verification</span>											
										</Nav.Link>
									</Nav.Item>                                    								
								</Nav>
								<Row>
									<Col xl={8} className="mx-auto">
										<Tab.Content className="m-4">
											<Tab.Pane className="fade border-0 p-0" eventKey="company">
												
                                            <Form onSubmit={handleSubmitCompany}>
                                                <Row>
                                                <Col xs={12}>
                                                    <div className="text-center mb-4">
                                                    <i className="fa fa-building fa-3x text-primary"></i>
                                                    <h2 className="mt-3">Company Details</h2>
                                                    </div>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Registered Company Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="registeredName"
                                                        value={companyInfo.registeredName}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.registeredName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.registeredName}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Trading Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="tradingName"
                                                        value={companyInfo.tradingName}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.tradingName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.tradingName}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Registration Number (CIPC)</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                        type="text"
                                                        placeholder="YYYY"
                                                        name="regNumber1"
                                                        value={companyInfo.regNumber1}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.regNumber1}
                                                        maxLength={4}
                                                        />
                                                        <InputGroup.Text className="px-1">/</InputGroup.Text>
                                                        <Form.Control
                                                        type="text"
                                                        placeholder="NNNNNN"
                                                        name="regNumber2"
                                                        value={companyInfo.regNumber2}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.regNumber2}
                                                        maxLength={6}
                                                        />
                                                        <InputGroup.Text className="px-1">/</InputGroup.Text>
                                                        <Form.Control
                                                        type="text"
                                                        placeholder="UU"
                                                        name="regNumber3"
                                                        value={companyInfo.regNumber3}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.regNumber3}
                                                        maxLength={2}
                                                        />
                                                    </InputGroup>
                                                    {(errors.regNumber1 || errors.regNumber2 || errors.regNumber3) && (
                                                        <div className="text-danger mt-1 small">
                                                        {errors.regNumber1 || errors.regNumber2 || errors.regNumber3}
                                                        </div>
                                                    )}
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Website URL</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="websiteUrl"
                                                        value={companyInfo.websiteUrl}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.websiteUrl}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.websiteUrl}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col> 

                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Landline Number</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="landlineNr"                                                  
                                                        value={companyInfo.landlineNr}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.landlineNr}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.landlineNr}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Label>Mobile Number</Form.Label>
                                                    <Form.Control
                                                        type="cell"
                                                        name="mobileNr"                                                
                                                        value={companyInfo.mobileNr}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.mobileNr}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.mobileNr}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col lg={6}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        label="VAT Registered"
                                                        name="isVatRegistered"
                                                        checked={companyInfo.isVatRegistered}
                                                        onChange={handleChangeCompany}
                                                    />
                                                    </Form.Group>
                                                    {companyInfo.isVatRegistered && (
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>VAT Number</Form.Label>
                                                        <Form.Control
                                                        type="text"
                                                        name="vatNumber"
                                                        value={companyInfo.vatNumber}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.vatNumber}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.vatNumber}</Form.Control.Feedback>
                                                    </Form.Group>
                                                    )}
                                                </Col>                                                                                                                                                                                              
                                                
                                                <Col xs={12}>
                                                    <Form.Group className="mb-3">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        label="I confirm that I am a active director of this company and have the authority to register it."
                                                        name="consent"
                                                        checked={companyInfo.consent}
                                                        onChange={handleChangeCompany}
                                                        isInvalid={!!errors.consent}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.consent}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col xs={12} className="text-end">
                                                    {loading ? (
                                                    <Button variant="primary" className="mt-3" disabled>
                                                      Loading...
                                                    </Button>
                                                    ) : (
                                                    <Button variant="primary" type="submit" className="mt-3">
                                                        Next
                                                    </Button>
                                                    )}                                                     
                                                </Col>

                                                </Row>
                                            </Form>

											</Tab.Pane>
                                            <Tab.Pane className=" fade border-0 p-0" eventKey="category">
                                            <Row>

                                                <Col xs={12}>
                                                  <div className="text-center mb-4">
                                                    <i className="fa fa-briefcase fa-3x text-primary"></i>
                                                    <h2 className="mt-3">Products & Services</h2>
                                                    <p>We offer a wide range of products, please select what services you interested in</p>
                                                  </div>
                                                </Col>

                                                <Container fluid className="mb-1 p-4">
                                                <h4 className="text-center mb-4">Our Free Services</h4>
                                                <Row className="justify-content-center">
                                                    <Col xs={12} sm={6} md={4} lg={3} className="mb-3 text-center">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <i className="ri-file-text-line mb-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                        <div>Invoicing & Accounts</div>
                                                    </div>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={4} lg={3} className="mb-3 text-center">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <i className="ri-team-line mb-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                        <div>Staff Management System</div>
                                                    </div>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={4} lg={3} className="mb-3 text-center">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <i className="ri-archive-line mb-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                        <div>Inventory Management</div>
                                                    </div>
                                                    </Col>                                                    
                                                    <Col xs={12} sm={6} md={4} lg={3} className="mb-3 text-center">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <i className="ri-contacts-book-line mb-2 text-primary" style={{ fontSize: '24px' }}></i>
                                                        <div>Contacts</div>
                                                    </div>
                                                    </Col>                                                    
                                                </Row>
                                                </Container>

                                                <Col xs={12}>
                                                    <div className="text-center mb-4">
                                                        <h5>Choose a category</h5>
                                                    </div>
                                                </Col>

                                                <Row className="g-2">
                                                    <Col xs={12} sm={6} md={3}>
                                                        <Card 
                                                            className={`h-100 text-center`}
                                                            style={{ 
                                                                cursor: 'pointer', 
                                                                backgroundColor: "#8BC34A",
                                                                color: 'white',
                                                                borderWidth: selectedCategory === 1 ? '2px' : '1px',
                                                                borderRadius: '0.5rem',
                                                                borderColor: selectedCategory === 1 ? '#5e35a9' : 'transparent',
                                                            }}
                                                            onClick={() => setSelectedCategory(selectedCategory === 1 ? null : 1)}
                                                        >
                                                        <Card.Body className="d-flex flex-column justify-content-center align-items-center py-3 position-relative">
                                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={selectedCategory === 1}
                                                                onChange={() => setSelectedCategory(selectedCategory === 1 ? null : 1)}
                                                                className="custom-checkbox"
                                                            />
                                                            </div>
                                                            <Car size={24} className="mb-2" />
                                                            <Card.Text className="mb-0" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DEALERSHIP</Card.Text>
                                                        </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={3}>
                                                        <Card 
                                                        className={`h-100 text-center`}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            backgroundColor: "#FF9800",
                                                            color: 'white',
                                                            borderWidth: selectedCategory === 2 ? '2px' : '1px',
                                                            borderRadius: '0.5rem',
                                                            borderColor: selectedCategory === 2 ? '#5e35a9' : 'transparent',
                                                        }}
                                                        onClick={() => setSelectedCategory(selectedCategory === 2 ? null : 2)}
                                                        >
                                                        <Card.Body className="d-flex flex-column justify-content-center align-items-center py-3 position-relative">
                                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={selectedCategory === 2}
                                                                onChange={() => setSelectedCategory(selectedCategory === 2 ? null : 2)}
                                                                className="custom-checkbox"
                                                            />
                                                            </div>
                                                            <Home size={24} className="mb-2" />
                                                            <Card.Text className="mb-0" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PROPERTY</Card.Text>
                                                        </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={3}>
                                                        <Card 
                                                        className={`h-100 text-center`}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            backgroundColor: "#03A9F4",
                                                            color: 'white',
                                                            borderWidth: selectedCategory === 3 ? '2px' : '1px',
                                                            borderRadius: '0.5rem',
                                                            borderColor: selectedCategory === 3 ? '#5e35a9' : 'transparent',
                                                        }}
                                                        onClick={() => setSelectedCategory(selectedCategory === 3 ? null : 3)}
                                                        >
                                                        <Card.Body className="d-flex flex-column justify-content-center align-items-center py-3 position-relative">
                                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={selectedCategory === 3}
                                                                onChange={() => setSelectedCategory(selectedCategory === 3 ? null : 3)}
                                                                className="custom-checkbox"
                                                            />
                                                            </div>
                                                            <Package size={24} className="mb-2" />
                                                            <Card.Text className="mb-0" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>GOODS</Card.Text>
                                                        </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={3}>
                                                        <Card 
                                                        className={`h-100 text-center`}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            backgroundColor: "#FFC107",
                                                            color: 'white',
                                                            borderWidth: selectedCategory === 4 ? '2px' : '1px',
                                                            borderRadius: '0.5rem',
                                                            borderColor: selectedCategory === 4 ? '#5e35a9' : 'transparent',
                                                        }}
                                                        onClick={() => setSelectedCategory(selectedCategory === 4 ? null : 4)}
                                                        >
                                                        <Card.Body className="d-flex flex-column justify-content-center align-items-center py-3 position-relative">
                                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={selectedCategory === 4}
                                                                onChange={() => setSelectedCategory(selectedCategory === 4 ? null : 4)}
                                                                className="custom-checkbox"
                                                            />
                                                            </div>
                                                            <Wrench size={24} className="mb-2" />
                                                            <Card.Text className="mb-0" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SERVICES</Card.Text>
                                                        </Card.Body>
                                                        </Card>
                                                    </Col>                                                    
                                                </Row>

                                                {categoryAlert && 
                                                    <Col xs={12}>
                                                        <Alert variant="danger" className="mt-3">{categoryAlert}</Alert>
                                                    </Col>}

                                                <Col xs={12} className="text-end mt-5">
                                                   {loading ? (
                                                    <Button variant="primary" className="mt-3" disabled>
                                                      Loading...
                                                    </Button>
                                                    ) : (
                                                    <Button variant="primary" type="submit" className="mt-3" onClick={handleSubmitCategory}>
                                                       Next
                                                    </Button>
                                                    )}                                                   
                                                </Col>

                                            </Row>

											</Tab.Pane>
											<Tab.Pane className="fade border-0 p-0" eventKey="verification">

                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className="text-center mb-3">
                                                                <i className="fas fa-check-circle fa-3x text-primary"></i>
                                                                <h2 className="mt-3">Business Verification</h2>                                                    
                                                                <h4 className="text-primary mt-4">Ensure Your Business Stands Out with</h4>
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    <Row className="justify-content-center mb-4">
                                                        <Col xs={12} md={8} lg={6} className="text-center">                                                        
                                                            <NextImage src="/images/transunion.png" alt="Verified Badge" width={200} height={100} className="img-fluid mb-3" />
                                                        </Col>
                                                    </Row>

                                                    <p className="fs-5 mb-3 text-center">
                                                        <i className="fas fa-user-check text-warning me-2"></i>
                                                        Verifying your business helps protect both clients and businesses from <span className="text-primary fw-bold">fraud</span>, creating a trusted marketplace where everyone feels secure.
                                                    </p>

                                                    <Row className="justify-content-center mb-4">
                                                        <Col xs={12} md={8} lg={6}>
                                                            <ul className="list-unstyled text-center">
                                                                <li className="mb-2"><i className="fas fa-star text-warning me-2"></i> Boost credibility and trust with verified status</li>
                                                                <li className="mb-2"><i className="fas fa-chart-line text-primary me-2"></i> Improve your chances of sales success</li>
                                                                <li className="mb-2"><i className="fas fa-lock text-success me-2"></i> Protect your business from fraud</li>
                                                            </ul>
                                                        </Col>
                                                    </Row>

                                                    <p className="fs-6 mb-4 text-center">
                                                        <i className="fas fa-coins text-primary me-2"></i>
                                                        Please pay a <span className="text-primary fw-bold">onceoff</span> fee of <strong>R49.00</strong> to verify your business and complete your registration. This small fee helps us maintain a secure environment for all users and ensures your business enjoys maximum visibility and security.
                                                    </p>

                                                    <div className="text-center">
                                                        <Button className="btn btn-primary btn-lg" onClick={() => dispatch(showVerification())}>
                                                            <i className="fas fa-credit-card me-2"></i>Pay Now to Complete Verification
                                                        </Button>
                                                        <div className="mt-3">
                                                            <NextImage src="/images/ozow.png" alt="Payment Methods" width={200} height={50} className="img-fluid" />
                                                        </div>
                                                    </div>

                                            </Tab.Pane>
										</Tab.Content>
									</Col>
								</Row>

							</Tab.Container>
						</Card.Body>
					</Card>			
                    <Modal show={showModal}>

                            <Modal.Header>
                                <Modal.Title>Ozow Secure Payments</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>       

                                <Row className="justify-content-center">
                                  <NextImage src="/images/ozow.png" alt="Payment Methods" width={200} height={50} className="img-fluid" />
                                </Row>          

                                <p className="fs-6 mb-4 text-center">   
                                    <i className="fas fa-coins text-primary me-2"></i>
                                    Please pay a <span className="text-primary fw-bold">onceoff</span> fee of <strong>R49.00</strong> to verify your business and complete your registration. This small fee helps us maintain a secure environment for all users and ensures your business enjoys maximum visibility and security.
                                </p>                          
                                                
                            </Modal.Body>
                            <Modal.Footer>
                               <Button variant="secondary" disabled={loading} onClick={() => dispatch(hideVerification())}>
                                    Cancel
                               </Button>
                               {loading ? (
                                 <Button variant="primary" disabled>
                                   Loading...
                                 </Button>) : 
                                 (<Button variant="primary" type="submit" onClick={handleVerification}>
                                     Pay
                                  </Button>)}                                                         
                            </Modal.Footer>
                    </Modal>                                
		</Fragment>
	);
};

export async function getServerSideProps(context) { return serverAuth(context);}

BusinessSignUp.layout = "AgIzzitLayout";

export default BusinessSignUp;
