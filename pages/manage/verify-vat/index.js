import { Container, Row, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useState } from 'react';
import db from '@/utils/db';
import Organization from '@/models/Organization';

const VerificationForm = ({ token, accountantName, accountantEmail, vatNumber, registeredName, registrationNumber }) => {

 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState(null);
 const [formData, setFormData] = useState({
   name: accountantName,
   email: accountantEmail,
   vatNumber: vatNumber,
   registeredName: registeredName,
   registrationNumber: registrationNumber
 });

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);

   try {
     const res = await fetch('/api/manage/verify-vat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ token, vatNumber: formData.vatNumber })
     });

     const data = await res.json();
     
     if (res.ok) {
       setMessage({type: 'success', text: data.message});
     } else {
       setMessage({type: 'error', text: data.message});
     }
   } catch (error) {
     setMessage({type: 'error', text: 'Verification failed'});
   } finally {
     setLoading(false);
   }
 };

 return (
   <Form onSubmit={handleSubmit}>
     <Form.Group className="mb-3">
       <Form.Label>Accountant Name</Form.Label>
       <Form.Control value={formData.name} disabled />
     </Form.Group>

     <Form.Group className="mb-3">
       <Form.Label>Accountant Email</Form.Label>
       <Form.Control type="email" value={formData.email} disabled />
     </Form.Group>

     <Form.Group className="mb-3">
       <Form.Label>Company Name</Form.Label>
       <Form.Control type="text" value={formData.registeredName} disabled />
     </Form.Group>

     <Form.Group className="mb-3">
       <Form.Label>Company Registration Nr</Form.Label>
       <Form.Control type="text" value={formData.registrationNumber} disabled />
     </Form.Group>

     <Form.Group className="mb-4">
       <Form.Label>Confirm VAT Number</Form.Label>
       <Form.Control
         value={formData.vatNumber}
         onChange={e => setFormData({...formData, vatNumber: e.target.value})}
       />
       <Form.Text className="text-primary">This vat number will be displayed on all invoices issued to clients.</Form.Text>
     </Form.Group>

     {message && (
       <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
         {message.text}
       </Alert>
     )}

     <Button type="submit" variant="primary" className="btn-block" disabled={loading}>
       {loading ? 'Verifying...' : 'Verify VAT Number'}
     </Button>
   </Form>
 );
};

export async function getServerSideProps(context) {

 const { token } = context.query;
 
 try {
   await db.connect();
   const org = await Organization.findOne({ vatNumberVerifyToken: token });

   if (!org) return { props: { status: 'invalid' }};
   if (org.vatNumberVerified) return { props: { status: 'already_verified' }};
   if (org.vatNumberVerifyTokenExpires < Date.now()) return { props: { status: 'expired' }};

   return {
     props: {
       status: 'valid',
       token,
       accountantName: org.vatNumberVerifiedByName || '',
       accountantEmail: org.vatNumberVerifiedByEmail || '',
       registeredName: org.registeredName || '',
       registrationNumber: org.registrationNumber || '',
       vatNumber: org.vatNumber || ''
     }
   };
 } catch (error) {
   return { props: { status: 'error' }};
 }

}

const VerifyVat = ({ status, ...props }) => {

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

 const getContent = () => {
   switch(status) {
     case 'valid':
       return <VerificationForm {...props} />;
     case 'already_verified':
       return (
         <div className="text-center">
           <i className="bi bi-check-circle fs-50 text-primary lh-1"></i>
           <h3 className="mt-3 text-primary">Already Verified</h3>
           <p className="mt-3 mb-0">This VAT number has already been verified</p>
         </div>
       );
     case 'expired':
     case 'invalid':
       return (
         <div className="text-center">
           <i className="bi bi-info-circle fs-50 text-primary lh-1"></i>
           <h3 className="mt-3 text-primary">Invalid or Expired Link</h3>
           <p className="mt-3 mb-0">This verification link is no longer valid</p>
         </div>
       );
     default:
       return (
         <div className="text-center">
           <i className="bi bi-info-circle fs-50 text-primary lh-1"></i>
           <h3 className="mt-3 text-primary">Error</h3>
           <p className="mt-3 mb-0">An error occurred. Please try again later</p>
         </div>
       );
   }
 };

 return (
   <div style={{ height: '100vh', overflow: 'hidden', background: 'rgb(var(--primary-rgb))' }}>
     <div className="square-box">
       {[...Array(15)].map((_, i) => <div key={i}></div>)}
     </div>

     <Container>
       <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
         <motion.div
           className="col-xl-5 col-lg-6 col-md-8 col-sm-8 col-xs-10 card-sigin-main mx-auto my-auto py-4"
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
                     {getContent()}
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

VerifyVat.layout = "ManageLayout";

export default VerifyVat;