import { Container, Row, Form, Button, Alert } from 'react-bootstrap';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { validatePassword, validateEmail } from '@/utils/validateAuth';

const AuthReset = ({ session }) => {

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

  const [signin, setSignIn] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errorMessage, setErrorMessage] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
   
    try {
      const errors = {};
   
      if (!signin.currentPassword) {
        errors.currentPassword = 'Please enter your current password';
      }
   
      const passwordError = validatePassword(signin.newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }
   
      if (!signin.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (signin.newPassword !== signin.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
   
      if (signin.currentPassword === signin.newPassword) {
        errors.newPassword = 'New password must be different from current password';
      }
   
      if (Object.keys(errors).length > 0) {
        setErrorMessage(errors);
        return;
      }
   
      setErrorMessage(null);
      setIsLoading(true);
   
      try {
        const authRes = await signIn('credentials', {
          redirect: false,
          email: session?.user?.email,
          currentPassword: signin.currentPassword,
          newPassword: signin.newPassword,
          isPasswordReset: true
        });
   
        if (authRes?.error) {
          setError(authRes.error);
        } else if (authRes?.passwordChanged) {
          router.push('/manage/setup');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
   
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
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
                      <h5 className="font-weight-normal mb-4">Secure your account with a password you will remember</h5>
                      <div className="panel panel-primary">
                        <div className="panel-body tabs-menu-body border-0 p-0 pt-3">
                          
                          <div className="mb-4">
                            <h4 className="text-muted">{session?.user?.name}</h4>
                            <h5 className="font-weight-semibold">{session?.user?.email}</h5>
                          </div>

                          <Form.Group controlId='currentPassword' className='mb-4'>
                          <Form.Label className='mb-0'>Current Password</Form.Label>
                          <Form.Control
                            type='password'
                            placeholder='Enter your current password'
                            className='form-control-light'
                            value={signin.currentPassword}
                            isInvalid={errorMessage?.currentPassword}
                            onChange={(e) =>
                              setSignIn((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                          />
                          {errorMessage?.currentPassword && (
                            <Form.Control.Feedback type='invalid'>
                              {errorMessage.currentPassword}
                            </Form.Control.Feedback>
                          )}
                          </Form.Group>

                          <Form.Group controlId='newPassword' className='mb-4'>
                            <Form.Label className='mb-0'>New Password</Form.Label>
                            <Form.Control
                              type='password'
                              placeholder='Enter your new password'
                              className='form-control-light'
                              value={signin.newPassword}
                              isInvalid={errorMessage?.newPassword}
                              onChange={(e) =>
                                setSignIn((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                            {errorMessage?.newPassword && (
                              <Form.Control.Feedback type='invalid'>
                                {errorMessage.newPassword}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>

                          <Form.Group controlId='confirmPassword' className='mb-4'>
                            <Form.Label className='mb-0'>Confirm New Password</Form.Label>
                            <Form.Control
                              type='password'
                              placeholder='Confirm your new password'
                              className='form-control-light'
                              value={signin.confirmPassword}
                              isInvalid={errorMessage?.confirmPassword}
                              onChange={(e) =>
                                setSignIn((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                            {errorMessage?.confirmPassword && (
                              <Form.Control.Feedback type='invalid'>
                                {errorMessage.confirmPassword}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>

                          {error && <Alert variant='danger'>{error}</Alert>}

                          <Button 
                            variant='primary' 
                            className={`btn btn-primary btn-block ${isLoading ? 'btn-loader' : ''}`} 
                            type="button" 
                            onClick={handlePasswordReset}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="me-2">Loading</span>
                                    <span className="loading">
                                        <i className="ri-loader-2-fill fs-16"></i>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-key me-2"></i> Reset Password
                                </>
                            )}
                          </Button>

                        </div>
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

export default AuthReset;
