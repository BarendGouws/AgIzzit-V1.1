import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react'
import { Col, Row, Modal, Form, Button, CloseButton } from 'react-bootstrap';
import Link from 'next/link';
import Alert from '@/components/partials/Alert'

const Auth = ({}) => {

  const { status } = useSession();

  const [errorMessage, setErrorMessage] = useState(null)
  const [signin, setSignIn] = useState({ email: '', password: '' })
  const [signup, setSignup] = useState({ knownAs: '', email: '', password: '', confirmPassword: '', termsAgree: false })
  const [error, setError] = useState(false)
  const [showLogin, setShowLogin] = useState(true) //toggle between login and register
  const [showAuth, setShowAuth] = useState(false)  //show auth modal

  useEffect(() => {
    if(status == 'unauthenticated') {
      setShowAuth(true)
    }
  }, [status])

  const titleCase = (str) => {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
  }
 
  const handleLogin = async (event) => {

    event.preventDefault()

    try { 

      var letter = /[a-z]/;
      var upper  =/[A-Z]/;
      var number = /[0-9]/;
      var emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      const errors = {}

      !signin.email && (errors.email = 'Please enter your email address')
      signin.email && !emailRegex.test(signin.email) && (errors.email = 'Please provide a valid email address')
      signin.email && signin.email.toString().includes('@gmail.com') && (errors.email = 'Please login with your Gmail account above, Its faster,easier and safer!')

      !signin.password && (errors.password = 'Please enter a password')   
      signin.password && signin.password.length < 8 && (errors.password = 'Password must be at least 8 characters long')
      signin.password && !letter.test(signin.password) && (errors.password = 'Password must contain at least one lowercase letter')
      signin.password && !number.test(signin.password) && (errors.password = 'Password must contain at least one number')
      signin.password && !upper.test(signin.password) && (errors.password = 'Password must contain at least one uppercase letter')     
      
      if (Object.keys(errors).length > 0) {

        setErrorMessage(errors)
  
      } else {

        setErrorMessage(null)

      try {  
  
        const authRes = await signIn('credentials', {
          redirect: false,           
          email: signin.email,
          password: signin.password
        })        
        
        authRes?.error && setError(authRes.error)

        } catch (error) {
          setError(error.message)
        }

      }

    } catch (error) {
      setError(error.message)
    }
        
  }

  const handleRegister = async (event) => { 

        event.preventDefault()

        try {       
            

            var letter = /[a-z]/;
            var upper  =/[A-Z]/;
            var number = /[0-9]/;
            var emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        const errors = {}

        !signup.knownAs && (errors.knownAs = 'Please enter your name and surname')
        signup.knownAs && signup.knownAs.toString().length < 5 && !signup.knownAs.toString().includes(' ') && (errors.knownAs = 'Please enter a valid name and surname')
        !signup.email && (errors.email = 'Please enter your email address')
        signup.email && !emailRegex.test(signup.email) && (errors.email = 'Please provide a valid email address')
        signup.email && signup.email.toString().includes('@gmail.com') && (errors.email = 'Please login with your Gmail account above, Its faster,easier and safer!')
        
        !signup.password && (errors.password = 'Please enter a password')
        !signup.confirmPassword && (errors.password = 'Please confirm your password')
        signup.password && signup.password.length < 8 && (errors.password = 'Password must be at least 8 characters long')
        signup.password && !letter.test(signup.password) && (errors.password = 'Password must contain at least one lowercase letter')
        signup.password && !number.test(signup.password) && (errors.password = 'Password must contain at least one number')
        signup.password && !upper.test(signup.password) && (errors.password = 'Password must contain at least one uppercase letter')
        signup.password !== signup.confirmPassword && (errors.password = 'Passwords do not match')
        !signup.termsAgree && (errors.termsAgree = 'You must agree to the terms and conditions')

        if (Object.keys(errors).length > 0) {

            setErrorMessage(errors)

        } else {

            setErrorMessage(null)

            const responce = await fetch('/api/auth/signup', {

                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(signup)
            })

            if(responce.status === 201){

                const data = await responce.json()                   

                const result = await signIn('credentials', {            
                    redirect: false,
                    email: data.email,
                    password: data.password,            
                });
                
     

            }else{
                
                const data = await responce.json()      
                setErrorMessage({emailResponce: data.message})
            }

        }
            
        } catch (error) {
        console.log(error)
        setError(error)
        }
        
  }

  return (<Modal show={showAuth} size="lg" centered>    
            {showLogin ?       
            <Modal.Body>
              <CloseButton             
                onClick={() => setShowAuth(false)}          
                aria-label='Close modal'
                className='position-absolute top-0 end-0 mt-3 me-3'
              />
                 <Row>
                    <Col xs={12} md={6}> 

                        <div className='mt-4 mb-4 m-2 d-flex justify-content-center align-items-center d-block d-lg-none'>
                          <img src='/images/main-logo.png' alt="Logo"></img>
                        </div>
                        <h2 className='h2 mb-4 mb-sm-5 ms-5 mt-3'>Hey there!<br />Welcome back.</h2>
                        <div className='d-flex justify-content-center mb-3'>                      
                           <img src="/images/login.svg" alt="login" width={450} height={450} className="img-fluid"  />
                        </div>                     
                        <p className='d-none d-lg-block ms-4 mt-sm-5'>Don&apos;t have an account? <Link href='#' onClick={() => setShowLogin(false)}><ins>Sign up here</ins></Link></p>
                    </Col>
                    <Col xs={12} md={6}>
                    <div className='d-flex flex-column justify-content-center mb-3 mt-1'>   

                       <div className='ms-5 mt-4 mb-4 m-2 d-none d-lg-block'>
                          <img src='/images/main-logo.png' alt="Logo"></img>
                       </div>

                      <Button variant='outline-primary' className="btn btn-wave mb-2" type="button" onClick={() => signIn('google', { redirect: false })}> <i  className="ri-google-line me-2"></i> Login with Google</Button>
                      <Button variant='outline-primary' className="btn btn-wave" type="button" onClick={() => signIn('facebook', { redirect: false, callbackUrl:"/" })}><i className="ri-facebook-line me-2"></i> Login with Facebook</Button>
                
                      <div className='d-flex align-items-center py-3 mb-0'>
                        <hr className='bg-dark w-100' style={{ height: '2px', border: 'none' }} />
                          <div className='px-3'>Or</div>
                        <hr className='bg-dark w-100' style={{ height: '2px', border: 'none' }}/>
                      </div>
                     
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
                  
                            <p className='mb-0'><Link href='/'><ins>Forgot password?</ins></Link></p>
                    
                    </Form.Group>

                     {error && <Alert message={error} variant='danger'/>}

                    <Button variant='primary' className="btn btn-wave" type="button" onClick={handleLogin}><i className="fas fa-sign-in-alt me-2"></i> Login</Button>                   
                      <p className='d-block d-lg-none ms-0 mt-4'>Don&apos;t have an account? <Link href='#' onClick={() => setShowLogin(false)}><ins>Sign up here</ins></Link></p>
                    </div>    
                    </Col>
                </Row>                   
            </Modal.Body>       
            : 
            <Modal.Body>
              <CloseButton              
                onClick={() => setShowAuth(false)}          
                aria-label='Close modal'
                className='position-absolute top-0 end-0 mt-3 me-3'
              />
              <Row>
               <Col xs={12} md={6}> 

                   <div className='mt-4 mb-4 m-2 d-flex justify-content-center align-items-center d-block d-lg-none'>
                     <img src='/images/main-logo.png' alt="Logo"></img>
                   </div>
                   <h2 className='h2 mb-4 mb-sm-5 ms-5 mt-3'>Join AgIzzit<br /><span className='h4'>Experience Higher Standards</span></h2>
                   
                   <div className='d-flex justify-content-center mb-3'>                      
                      <img src="/images/signup.svg" alt="login" width={450} height={450} className="img-fluid" />
                   </div> 
                   <p className='d-none d-lg-block ms-4 mt-sm-5'>Already have an account? <Link href='#' onClick={() => setShowLogin(true)}><ins>Login here</ins></Link></p>
               </Col>
               <Col xs={12} md={6}>
               <div className='d-flex flex-column justify-content-center mb-3 mt-1'>   

                  <div className='ms-5 mt-4 mb-4 m-2 d-none d-lg-block'>
                     <img src='/images/main-logo.png' alt="Logo"></img>
                  </div>

                 <Button variant='outline-primary' className="btn btn-wave mb-2" type="button" onClick={() => signIn('google', { redirect: false })}><i  className="ri-google-line me-2"></i> Login with Google</Button>
                 <Button variant='outline-primary' className="btn btn-wave" type="button" onClick={() => signIn('facebook', { redirect: false, callbackUrl:"/" })}><i className="ri-facebook-line me-2"></i> Login with Facebook</Button>
           
                 <div className='d-flex align-items-center py-3 mb-0'>
                   <hr className='bg-dark w-100' style={{ height: '2px', border: 'none' }} />
                     <div className='px-3'>Or</div>
                   <hr className='bg-dark w-100' style={{ height: '2px', border: 'none' }}/>
                 </div>

                <Form.Group controlId='name' className='mb-4'>
                    <Form.Label>Full name and surname</Form.Label>
                    <Form.Control
                    placeholder='Enter your full name and surname'
                    className='form-control-light'                  
                    value={signup?.knownAs}
                    isInvalid={errorMessage?.knownAs}
                    onChange={(e) =>
                        setSignup((signup) => ({
                        ...signup,
                        knownAs: titleCase(e.target.value),
                        }))
                    }
                    />
                    {errorMessage?.knownAs && (
                    <Form.Control.Feedback type='invalid'>
                        {errorMessage.knownAs}
                    </Form.Control.Feedback>
                    )}
                </Form.Group>
                    
                <Form.Group controlId='email' className='mb-4'>
                    <Form.Label >Email address</Form.Label>
                    <Form.Control
                        type='email'
                        placeholder='Enter your email'
                        className='form-control-light'
                        value={signup?.email}
                        isInvalid={errorMessage?.email}
                        onChange={(e) =>
                            setSignup((signup) => ({
                            ...signup,
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
                            value={signup?.password}                   
                            onChange={(e) =>
                                setSignup((signup) => ({
                                ...signup,
                                password: e.target.value,
                                }))
                            }
                            />                  
                
                </Form.Group>

                <Form.Group controlId='confirmPassword' className='mb-4'>
                    
                        <Form.Label className='mb-0'>Confirm password</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder='Enter your password'
                            className='form-control-light'
                            value={signup?.confirmPassword}
                            isInvalid={errorMessage?.password}
                            onChange={(e) =>
                                setSignup((signup) => ({
                                ...signup,
                                confirmPassword: e.target.value,
                                }))
                            }
                            /> 
                            {errorMessage?.password && (
                            <Form.Control.Feedback type='invalid'>
                            {errorMessage.password}
                            </Form.Control.Feedback>)}                         
                
                </Form.Group>

                <Form.Check 
                  type='checkbox'
                  id='terms-agree'
                  label={[
                    <span key='terms_1' className='opacity-70'>By joining, I agree to the </span>,
                    <a key='terms_2' className=''>Terms of use</a>,
                    <span key='terms_3' className='opacity-70'> and </span>,
                    <a key='terms_4' className=''>Privacy policy</a>
                  ]}
                  isInvalid={errorMessage?.termsAgree}
                  className='form-check-light mb-4'
                  onChange={(e) =>
                    setSignup((signup) => ({
                      ...signup,
                      termsAgree: e.target.checked,
                    }))
                  }
                />
                {errorMessage?.termsAgree && (
                    <Alert variant='danger' className='mb-4'>
                    {errorMessage.termsAgree}
                    </Alert>
                )}

                {error && <Alert message={error} variant='danger'/>}

               <Button variant='primary' className="btn btn-wave" type="button" onClick={handleRegister}><i className="fas fa-sign-in-alt me-2"></i>Register</Button>             
                 <p className='d-block d-lg-none ms-0 mt-4'>Already have an account? <Link href='#' onClick={() => setShowLogin(true)}><ins>Login here</ins></Link></p>
               </div>    
               </Col>
              </Row>                   
            </Modal.Body>}   
        </Modal>)
}

export default Auth