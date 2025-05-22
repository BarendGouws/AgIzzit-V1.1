import React, { useState, useEffect } from "react";
import { Card, Col, Row, Badge, ListGroup, ListGroupItem } from "react-bootstrap";
import serverAuth from "@/utils/serverAuth";
import { useRouter } from "next/router";
import moment from "moment";

const DocumentsDetailsPage = ({ isLoggedIn, user }) => { 

  const router = useRouter();
  const { docId } = router.query;

  const [status, setStatus] = useState({});
  const [document, setDocument] = useState({});
  
  const [activeUser, setActiveUser] = useState(null);
  const [signatures, setSignatures] = useState([]);

  const analyzeDocumentStatus = (document) => {
    // Check if all fields are filled
    const allFieldsFilled = document.fields.every(field => field.value && field.value.trim() !== '');
  
    if (!allFieldsFilled) {
      // Find the role of the user who needs to fill the form
      const incompleteField = document.fields.find(field => !field.value || field.value.trim() === '');
      const recipientRole = incompleteField ? incompleteField.role : 'Recipient';
      return {
        waiting: true,
        user: recipientRole,
        action: 'Complete the document request',
        message: `Waiting for ${recipientRole} to complete the document request`
      };
    }
  
    // If all fields are filled, check for incomplete signatures
    const incompleteSignature = document.signatures.find(sig => !sig.completed);    
    if (incompleteSignature) {   
      const userName = incompleteSignature.user?.fullNames || incompleteSignature.user.email;
      return {
        waiting: true,
        user: userName,
        action: 'sign the document',
        message: `Waiting for ${userName} to view and sign the document`
      };
    }
  
    // If all signatures are complete
    return {
      waiting: false,
      user: null,
      action: null,
      message: 'Document is fully signed and completed'
    };
  };

  const uniqueOrderedSignatures = (document) => {
    if (!document || !document.signatures) return [];

    const userMap = new Map();

    // First pass: count signatures for each user and extract all user data
    document.signatures.forEach((sig) => {
      const userId = sig.user._id;
      if (!userMap.has(userId)) {
        // Extract all keys from the user object
        const userData = { ...sig.user };

        userMap.set(userId, {
          role: sig.role,
          user: userData,
          signatureCount: 1,
          order: sig.order,
        });
      } else {
        userMap.get(userId).signatureCount += 1;
        // Update the role if this signature has a lower order
        if (sig.order < userMap.get(userId).order) {
          userMap.get(userId).role = sig.role;
          userMap.get(userId).order = sig.order;
        }
      }
    });

    // Convert map to array and sort by order
    const uniqueArray = Array.from(userMap.values()).sort(
      (a, b) => a.order - b.order
    );

    // Remove the order property from the final output
    return uniqueArray.map(({ order, ...rest }) => rest);
  };

  const handleUserClick = (userId) => {

    const userActions = document.auditTrail.filter((action) => action.user._id === userId);
    const latestAction = userActions.length > 0 ? userActions[userActions.length - 1] : null;
    const userProfile = document.signatures.find((sig) => sig.user._id === userId)?.user || null;
    const signatureCount = document.signatures.filter((sig) => sig.user._id === userId).length;  
    const signaturesCompleted = document.signatures.filter((sig) => sig.user._id === userId && sig.completed).length;

    userProfile.latestAction = latestAction;
    userProfile.signatureCount = signatureCount;
    userProfile.signaturesCompleted = signaturesCompleted;

    setActiveUser({ ...userProfile });

  };

  useEffect(() => {

    const loadDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${docId}`);

        if (response.status === 200) {
          const data = await response.json();
          if (data) {
            setDocument(data);

            const status = analyzeDocumentStatus(data);
            setStatus(status);
          
            const signatures = uniqueOrderedSignatures(data);
            setSignatures(signatures);

            const userId = signatures[0]?.user._id;
            const userActions = data.auditTrail.filter(
              (action) => action.user._id === userId
            );
            const latestAction =
              userActions.length > 0
                ? userActions[userActions.length - 1]
                : null;
            const userProfile =
              data.signatures.find((sig) => sig.user._id === userId)?.user ||
              null;
            const signatureCount = data.signatures.filter(
              (sig) => sig.user._id === userId
            ).length;
            const signaturesCompleted = data.signatures.filter(
              (sig) => sig.user._id === userId && sig.completed
            ).length;

            userProfile.latestAction = latestAction;
            userProfile.signatureCount = signatureCount;
            userProfile.signaturesCompleted = signaturesCompleted;

            setActiveUser({ ...userProfile });
          }
        } else {
          router.push("/documents");
        }
      } catch (error) {
        console.error("Error loading template:", error);
      }
    };

    docId && isLoggedIn && loadDocument();

  }, [docId, isLoggedIn]);
  
  if(isLoggedIn){
    return (
        <>
        <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
            <span className="main-content-title mg-b-0 mg-b-lg-1">Signing</span>
            </div>
        </div>
        <Row className=" row-sm">
            <Col sm={12} lg={6} xl={4} xxl={3}>
                <Card className="custom-card card-bg-primary">
                    <Card.Body>
                        <div className="mb-2">
                        <i className="fas fa-hourglass-half me-2"></i>
                        {status.waiting ? `Waiting for: ` : `Status: `}
                        </div>
                        <div className="d-flex align-items-center w-100">
                        <div className="">
                            <div className="fs-15 fw-semibold">
                            {status.waiting ? status.user : 'Completed'}
                            </div>
                            <p className="mb-0 text-fixed-white op-7 fs-11">
                            {status.message}
                            </p>
                        </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="custom-card">
                    <div className="">
                    <div className="main-content-contacts pt-0">

                        <div className="main-content-left main-content-left-contacts slid1">
                        <div className="main-contact-label ms-0">Status</div>

                        <ListGroup as="ul" className="list-group-flush">
                            <ListGroupItem as="li">{`Status: ${document?.documentStatus}`}</ListGroupItem>
                            <ListGroupItem as="li">{`Restrict IP to SA: ${
                            document?.restrictIP ? "Yes" : "No"
                            }`}</ListGroupItem>
                            <ListGroupItem as="li">{`Facial Verify: ${
                            document?.restrictIP ? "Yes" : "No"
                            }`}</ListGroupItem>
                            <ListGroupItem as="li">{`Document Name: ${document?.documentName}`}</ListGroupItem>
                        </ListGroup>

                        <div>
                            {signatures?.map((signer) => {

                            const { _id,email,phoneNr,isComplete,profileImage,isVerified,fullNames,} = signer.user;                            
                           
                            return (
                                <div key={_id} className={`main-contact-item ${activeUser._id == _id ? "selected" : ""}`} onClick={() => handleUserClick(_id)}>
                                    <div className="avatar avatar-rounded">
                                      <img alt="avatar" src={profileImage} />
                                    </div>
                                    <div className="main-contact-body">
                                    <Row>
                                      <Col xs={12}>
                                        <h6 className="text-primary">{signer.role}</h6>
                                      </Col>
                                    {isComplete && fullNames && (
                                        <Col xs={12}>
                                        <h6>{fullNames}</h6>
                                        </Col>)}
                                        <Col xs={12} className="mt-1">
                                        <span className="pt-3">{email}</span>
                                        </Col>
                                        <Col xs={12} className="mt-1">
                                        <span className="phone">
                                            {isComplete && phoneNr}
                                        </span>
                                        </Col>
                                        {isVerified && (
                                        <Col xs={12} className="mt-1">
                                            <Badge bg="primary text-light">
                                            Verified
                                            </Badge>
                                        </Col>
                                        )}
                                        {isComplete && (
                                        <Col xs={12} className="mt-1">
                                            <Badge bg="primary text-light">
                                            Profile Completed
                                            </Badge>
                                        </Col>
                                        )}
                                        {!isComplete && (
                                        <Col xs={12} className="mt-1">
                                            <Badge bg="danger text-light">
                                            Profile Incomplete
                                            </Badge>
                                        </Col>
                                        )}
                                    </Row>
                                    </div>
                                </div>);
                            })}
                        </div>
                        </div>
                    </div>
                    </div>
                </Card>
            </Col>

            <Col sm={12} lg={6} xl={8} xxl={9}>
            {activeUser && (
                <div className="main-content-body main-content-body-contacts card custom-card">
                <div className="main-contact-info-header pt-3">
                    <div className="media">
                    <div className="avatar avatar-xxl avatar-rounded">
                        <img alt="avatar" src={activeUser.profileImage} />
                    </div>
                    <div className="media-body">
                        {activeUser.fullNames && (
                        <h5>{activeUser.fullNames}</h5>)}
                        <Col xs={12} className="mt-1">
                        <span className="pt-3">{activeUser.email}</span>
                        </Col>
                        {activeUser.phoneNr && (
                        <Col xs={12} className="mt-1">
                        <span className="phone">{activeUser.phoneNr}</span>
                        </Col>)}
                        {activeUser.isVerified && (
                        <Col xs={12} className="mt-1">
                            <Badge bg="primary text-light">
                            Verified
                            </Badge>
                        </Col>)}
                        {activeUser.isComplete && (
                        <Col xs={12} className="mt-1">
                            <Badge bg="primary text-light">
                            Profile Completed
                            </Badge>
                        </Col>)}                        
                        {!activeUser.isComplete && (
                        <Col xs={12} className="mt-1">
                            <Badge bg="danger text-light">
                            Profile Incomplete
                            </Badge>
                        </Col>)}
                    </div>
                    </div>
                </div>

                <div className="main-contact-info-body mb-2">
                    <div className="pt-3 ps-4 mb-0">
                    <h5>Signing Status :</h5>
                    </div>
                    <div className="media-list pb-2">
                    <div className="media">
                        <div className="media-body px-4">
                        <div>
                            <label>Last Active</label>{" "}
                            <span className="tx-medium">
                            {activeUser?.latestAction?.timestamp
                                ? moment(
                                    activeUser?.latestAction?.timestamp
                                ).fromNow()
                                : "No timestamps as yet"}
                            </span>
                        </div>
                        </div>
                    </div>
                    <div className="media">
                        <div className="media-body px-4">
                        <div>
                            <label>Last Action :</label>{" "}
                            <span className="tx-medium">
                            {activeUser?.latestAction?.action
                                ? activeUser?.latestAction?.action
                                : "No actions as yet"}
                            </span>
                        </div>
                        </div>
                    </div>
                    <div className="media">
                        <div className="media-body px-4">
                        <div>
                            <label>Signitures Completed</label>{" "}
                            <span className="tx-medium">{`${activeUser.signaturesCompleted} of ${activeUser.signatureCount}`}</span>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            )}

            {document?.auditTrail?.map((audit, index) => (
                <Card className="mb-2" key={index}>
                <Card.Body>
                    <Row className="align-items-center">
                    <Col xs={12} md={4} className="text-muted">
                        {moment(audit.timestamp).format("Do MMM YYYY, HH:mm:ss")}
                    </Col>
                    <Col xs={12} md={4} className="mt-1 mt-md-0 text-muted">
                        {audit.user.email}
                    </Col>
                    <Col xs={12} md={4} className="mt-1 mt-md-0 text-muted">
                        {audit.action}
                    </Col>
                    </Row>
                </Card.Body>
                </Card>
            ))}
            </Col>
        </Row>
        </>
    );
  }

  //TODO ADD SERVICES
  return (
    <div className="container">
      <h1>Document Details</h1>
      <p>Document ID: {docId}</p>
    </div>
  );

};

export async function getServerSideProps(context){return serverAuth(context)}

DocumentsDetailsPage.layout = "AgIzzitLayout";

export default DocumentsDetailsPage;