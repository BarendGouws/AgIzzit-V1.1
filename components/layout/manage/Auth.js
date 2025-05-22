import { Container, Row, Form, Button, Alert } from 'react-bootstrap';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { validatePassword, validateEmail } from '@/utils/validateAuth';

const Auth = () => {

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

  const [errorMessage, setErrorMessage] = useState(null)
  const [error, setError] = useState(null)
  const [signin, setSignIn] = useState({ email: '', password: '' })

  const handleLogin = async (event) => {

    event.preventDefault();
   
    try {
      const errors = {};
      
      const emailError = validateEmail(signin.email);
      if (emailError) errors.email = emailError;
   
      const passwordError = validatePassword(signin.password);
      if (passwordError) errors.password = passwordError;
      
      if (Object.keys(errors).length > 0) {
        setErrorMessage(errors);
        return;
      }
   
      setErrorMessage(null);
   
      try {
        const authRes = await signIn('credentials', {
          redirect: false,           
          email: signin.email,
          password: signin.password
        });

        console.log('authRes', authRes);
        
        if (authRes?.error) setError(authRes.error);
   
      } catch (error) {
        setError(error.message);
      }
   
    } catch (error) {
      setError(error.message); 
    }
  }

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
                      <h2>Welcome back!</h2>
                      <h6 className="font-weight-semibold mb-4">Please sign in to continue.</h6>
                      <div className="panel panel-primary">
                        <div className="panel-body tabs-menu-body border-0 p-0 pt-3">
                         
                          <Form.Group controlId='email' className='mb-4'>
                            <Form.Label >Email address</Form.Label>
                            <Form.Control
                                type='email'
                                placeholder='Enter your email'
                                className='form-control-light'
                                value={signin?.email}
                                isInvalid={errorMessage?.email}
                                onChange={(e) =>
                                    setSignIn((signin) => ({
                                      ...signin,
                                      email: e.target.value.toString().toLowerCase(),
                                    }))
                                  }
                                />   
                                {errorMessage?.email && (
                                  <Form.Control.Feedback type='invalid'>
                                  {errorMessage.email}
                                  </Form.Control.Feedback>)}               
                           </Form.Group>
                           <Form.Group controlId='password' className='mb-4'>
                        
                        <Form.Label className='mb-0'>Password</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder='Enter your password'
                            className='form-control-light'
                            value={signin?.password}
                            isInvalid={errorMessage?.password}
                            onChange={(e) =>
                                setSignIn((signin) => ({
                                  ...signin,
                                  password: e.target.value,
                                }))}
                          /> 
                           {errorMessage?.password && (
                          <Form.Control.Feedback type='invalid'>
                           {errorMessage.password}
                          </Form.Control.Feedback>)}  
                  
                           </Form.Group>

                           {error && <Alert variant='danger'>{error}</Alert>}

                           <Button variant='primary' className="btn btn-primary btn-block" type="button" onClick={handleLogin}><i className="fas fa-sign-in-alt me-2"></i> Login</Button>  

                        </div>
                      </div>
                      <div className="main-signin-footer text-center mt-3">
                        <p>
                          <Link href="/manage/forgot-password" className="mb-3">
                            Forgot password?
                          </Link>
                        </p>
                      </div>
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

export default Auth;
