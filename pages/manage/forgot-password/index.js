import { Container, Row, Form, Button, Alert } from 'react-bootstrap';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

const ForgotPassword = () => {

  const [animationType] = useState(() => {
    const animations = ['fadeIn', 'slideIn', 'zoomIn'];
    return animations[Math.floor(Math.random() * animations.length)];
  });

  const containerVariants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 1 } },
    },
    slideIn: {
      hidden: { x: -1000, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration: 1 } },
    },
    zoomIn: {
      hidden: { scale: 0.5, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration: 1 } },
    },
  };

  const [message, setMessage] = useState(null);
  const [email, setEmail] = useState('');
  
  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({type: 'error', text: 'Please enter a valid email address'});
      return;
    }
 
    try {
      const res = await fetch('/api/manage/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
 
      const data = await res.json();
      setMessage({
        type: res.ok ? 'success' : 'error', 
        text: data.message
      });
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to process request'});
    }
  };

  return (
   
    <div style={{ height: '100vh', overflow: 'hidden', background: 'rgb(var(--primary-rgb))' }}>
    
    <div className="square-box">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
		</div>
      <Container>
        <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
          <motion.div
            className="col-xl-5 col-lg-6 col-md-8 col-sm-8 col-xs-10 card-sigin-main mx-auto my-auto py-4 justify-content-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants[animationType]}
          >
            <div className="card-sigin shadow-lg border border-primary">
              <div className="main-card-signin d-md-flex">
                <div className="ms-3 wd-100p">
                  <motion.div
                    className="d-flex justify-content-center align-items-center mb-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                  >
                    <img src="/images/main-logo.png" alt="Logo" />
                  </motion.div>
              
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                  >
                    <div className="main-signup-header">
                    <h2>Reset Password</h2>
                    <h6 className="font-weight-semibold mb-4">Enter your email to reset your password</h6>
                    
                    <Form.Group controlId='email' className='mb-4'>
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type='email'  
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      />
                    </Form.Group>

                    {message && (
                      <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                        {message.text}
                      </Alert>
                    )}

                    <Button onClick={handleReset} variant='primary' className="btn-block">
                      <i className="fas fa-key me-2"></i> Reset Password
                    </Button>
                  </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </Row>
      </Container>
    </div>
  
  );
};

ForgotPassword.layout = "ManageLayout";

export default ForgotPassword;
