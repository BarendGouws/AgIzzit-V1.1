
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { validatePassword } from '@/utils/validateAuth';
import Link from 'next/link';

const ResetPassword = () => {
        
    const router = useRouter();
    const { token } = router.query;
    const [passwords, setPasswords] = useState({
      password: '',
      confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
   
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
   
    useEffect(() => {
      if (!token) router.push('/manage/forgot-password');
    }, [token]);
   
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (passwords.password !== passwords.confirmPassword) {
        setMessage({type: 'error', text: 'Passwords do not match'});
        return;
      }
   
      const errorMsg = validatePassword(passwords.password);
      if (errorMsg) {
        setMessage({type: 'error', text: errorMsg});
        return;
      }
        
      try {
        const res = await fetch('/api/manage/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: passwords.password })
        });
   
        const data = await res.json();
        
        if (res.ok) {
          setMessage({type: 'success', text: data.message});
          setTimeout(() => router.push('/manage/dashboard'), 2000);
        } else {
          setMessage({type: 'error', text: data.message});
        }
      } catch (error) {
        setMessage({type: 'error', text: 'Failed to reset password'});
      }
    };
   
    return (
      <div style={{ height: '100vh', overflow: 'hidden', background: 'rgb(var(--primary-rgb))' }}>
        <div className="square-box">
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div>
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
                        <h6 className="font-weight-semibold mb-4">Enter your new password</h6>
   
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={passwords.password}
                              onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                            />
                          </Form.Group>
   
                          <Form.Group className="mb-4">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={passwords.confirmPassword}
                              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            />
                          </Form.Group>
   
                          {message && (
                            <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                              {message.text}
                            </Alert>
                          )}
   
                          <Button type="submit" variant="primary" className="btn-block">
                            <i className="fas fa-key me-2"></i>Reset Password
                          </Button>
                        </Form>
   
                      </div>
                      <div className="main-signin-footer text-center mt-3">
                        <p>
                          <Link href="/manage/forgot-password" className="mb-3">
                            Forgot password?
                          </Link>
                        </p>
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
   
ResetPassword.layout = "ManageLayout";

export default ResetPassword;