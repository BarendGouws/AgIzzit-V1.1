import React, { useState } from "react";
import { Button, Card, Form, InputGroup, Alert, Container, Row, Col } from "react-bootstrap";
import { useRouter } from 'next/router';
import axios from 'axios';

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundImage: 'url("/images/register.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        paddingTop: '2rem',
        paddingBottom: '2rem',
    },
    formContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    cardWrapper: {
        width: '100%',
        maxWidth: '500px',
    },
};

const Register = () => {
    
    const router = useRouter();
    const [formData, setFormData] = useState({
        registeredName: "",
        tradingName: "",
        regNumber1: "",
        regNumber2: "",
        regNumber3: "",
        registrationDate: "",
        isVatRegistered: false,
        vatNumber: "",
        websiteUrl: "",
        landlineNr: "",
        consent: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.registeredName) newErrors.registeredName = "Registered name is required";
        if (!formData.tradingName) newErrors.tradingName = "Trading name is required";
        if (!/^\d{4}$/.test(formData.regNumber1)) newErrors.regNumber1 = "Must be exactly 4 digits";
        if (!/^\d{6}$/.test(formData.regNumber2)) newErrors.regNumber2 = "Must be exactly 6 digits";
        if (!/^\d{2}$/.test(formData.regNumber3)) newErrors.regNumber3 = "Must be exactly 2 digits";
        if (!formData.registrationDate) newErrors.registrationDate = "Registration date is required";
        if (formData.isVatRegistered && !formData.vatNumber) newErrors.vatNumber = "VAT number is required if VAT registered";
        if (!formData.consent) newErrors.consent = "You must confirm that you are a representative of the company";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            setApiError(null);
            try {
                const registrationNumber = `${formData.regNumber1}/${formData.regNumber2}/${formData.regNumber3}`;
                const response = await axios.post('/api/register', {
                    ...formData,
                    registrationNumber,
                });
                
                if (response.data.success) {
                    router.push('/manage/organization');
                } else {
                    setApiError(response.data.message || "An error occurred during registration.");
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                setApiError("An error occurred while processing your request. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={styles.pageContainer}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <div style={styles.formContainer}>
                            <div style={styles.cardWrapper}>
                                <Card className="shadow-lg">
                                    <Card.Body className="p-3 p-sm-4">
                                        <div className="text-center mb-4">
                                            <i className="fa fa-building fa-3x text-primary"></i>
                                            <h2 className="mt-3">Company Registration</h2>
                                        </div>
                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Registered Company Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="registeredName"
                                                    value={formData.registeredName}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.registeredName}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.registeredName}</Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Trading Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="tradingName"
                                                    value={formData.tradingName}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.tradingName}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.tradingName}</Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Registration Number (CIPC)</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="YYYY"
                                                        name="regNumber1"
                                                        value={formData.regNumber1}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.regNumber1}
                                                        maxLength={4}
                                                    />
                                                    <InputGroup.Text className="px-1">/</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="NNNNNN"
                                                        name="regNumber2"
                                                        value={formData.regNumber2}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.regNumber2}
                                                        maxLength={6}
                                                    />
                                                    <InputGroup.Text className="px-1">/</InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="UU"
                                                        name="regNumber3"
                                                        value={formData.regNumber3}
                                                        onChange={handleChange}
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

                                            <Form.Group className="mb-3">
                                                <Form.Label>Registration Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="registrationDate"
                                                    value={formData.registrationDate}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.registrationDate}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.registrationDate}</Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Check 
                                                    type="checkbox"
                                                    label="VAT Registered"
                                                    name="isVatRegistered"
                                                    checked={formData.isVatRegistered}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>

                                            {formData.isVatRegistered && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label>VAT Number</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="vatNumber"
                                                        value={formData.vatNumber}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.vatNumber}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.vatNumber}</Form.Control.Feedback>
                                                </Form.Group>
                                            )}

                                            <Form.Group className="mb-3">
                                                <Form.Label>Website URL</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="websiteUrl"
                                                    value={formData.websiteUrl}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Landline Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="landlineNr"
                                                    value={formData.landlineNr}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Check 
                                                    type="checkbox"
                                                    label="I confirm that I am a representative of this company and have the authority to register it."
                                                    name="consent"
                                                    checked={formData.consent}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.consent}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.consent}</Form.Control.Feedback>
                                            </Form.Group>

                                            <Button 
                                                variant="primary" 
                                                type="submit" 
                                                className="w-100 mt-3"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Submitting...' : 'Register Company'}
                                            </Button>
                                        </Form>

                                        {apiError && (
                                            <Alert variant="danger" className="mt-3">
                                                {apiError}
                                            </Alert>
                                        )}                                        
                                       
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

Register.layout = "AgIzzitLayout";

export default Register;