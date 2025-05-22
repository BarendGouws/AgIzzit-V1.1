import React, { useEffect } from "react";
import moment from "moment";
import Pageheader from "@/components/partials/Pageheader";
import { useRouter } from "next/router";
import { Card, Col, Row, Badge, ListGroup, ListGroupItem } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocument, setActiveUser } from '@/redux/manage/slices/documents';
import StateHandler from "@/components/partials/StateHandler";

const DocumentsDetailsPage = ({ }) => { 

  const router = useRouter();
  const { docId } = router.query;

  const dispatch = useDispatch();
  const { document, signatures, status, activeUser } = useSelector(state => state.documents);

  useEffect(() => {
    docId && dispatch(fetchDocument(docId))
  }, [docId]);  

    return (
      <StateHandler slice="documents">   
        <Pageheader title="Signing" heading="Manage" active="Documents" />       
        <Row className=" row-sm">
            <Col sm={12} lg={6} xl={4} xxl={3}>            
                <Card className="custom-card card-bg-primary">                    
                    <Card.Body>
                        <div className="mb-2">
                        <i className="fas fa-hourglass-half me-2"></i>
                        {status?.waiting ? `Waiting for: ` : `Status: `}
                        </div>
                        <div className="d-flex align-items-center w-100">
                        <div className="">
                            <div className="fs-15 fw-semibold">
                            {status?.waiting ? status.user : 'Completed'}
                            </div>
                            <p className="mb-0 text-fixed-white op-7 fs-11">
                            {status?.message}
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
                                <div key={_id} className={`main-contact-item ${activeUser._id == _id ? "selected" : ""}`} onClick={() => dispatch(setActiveUser(_id))}>
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
                        <img alt="avatar" src={activeUser?.profileImage} />
                    </div>
                    <div className="media-body">
                        {activeUser?.fullNames && (
                        <h5>{activeUser.fullNames}</h5>)}
                        <Col xs={12} className="mt-1">
                        <span className="pt-3">{activeUser?.email}</span>
                        </Col>
                        {activeUser?.phoneNr && (
                        <Col xs={12} className="mt-1">
                        <span className="phone">{activeUser?.phoneNr}</span>
                        </Col>)}
                        {activeUser?.isVerified && (
                        <Col xs={12} className="mt-1">
                            <Badge bg="primary text-light">
                            Verified
                            </Badge>
                        </Col>)}
                        {activeUser?.isComplete && (
                        <Col xs={12} className="mt-1">
                            <Badge bg="primary text-light">
                            Profile Completed
                            </Badge>
                        </Col>)}                        
                        {!activeUser?.isComplete && (
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
                        {audit.user?.email}
                    </Col>
                    <Col xs={12} md={4} className="mt-1 mt-md-0 text-muted">
                        {audit?.action}
                    </Col>
                    </Row>
                </Card.Body>
                </Card>
            ))}
            </Col>
        </Row>
      </StateHandler>
    );

};

DocumentsDetailsPage.layout = "ManageLayout";

export default DocumentsDetailsPage;