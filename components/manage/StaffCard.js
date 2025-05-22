import React from 'react'
import Link from "next/link";
import Image from 'next/image'
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from 'moment';

const StaffCard = ({ item }) => {
  return (
    <Link href={`/manage/staff/${item._id}`}>
    <Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y' >
  
      <Col xs={12} sm={10} lg={2} className='mb-2'>

                <Image
                    style={{objectFit: "object-fit"}}
                    width={150}
                    height={150}
                    priority={true}
                    alt="avatar"
                    className="rounded-50 img-thumbnail wd-100p wd-sm-200"
                    src={item?.profileImage ? item.profileImage : '/assets/internal/no-image-available.png'}
                    />

      </Col>
      <Col xs={12} lg={8}>

                <OverlayTrigger placement="left" overlay={<Tooltip>Names</Tooltip>}>
                  <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-user me-2"></i>{`${item.firstName} ${item.middleName} ${item.surname}`}</p>
                </OverlayTrigger>  

                <Row className='mt-4'>
                  <Col sm={12} md={6} lg={6}>

                     <OverlayTrigger placement="left" overlay={<Tooltip>Last Login</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fa fa-check me-2"></i>{'Today at 13h45'}</p>
                      </OverlayTrigger>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Branch</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-building me-2"></i>{item?.branch}</p>
                      </OverlayTrigger>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Position</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fas fa-user-tie me-2"></i>{item?.position}</p>
                      </OverlayTrigger>
                     
                      <OverlayTrigger placement="left" overlay={<Tooltip>Employed Since</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fas fa-calendar-check me-2"></i>{moment(item.createdAt).format('Do MMM YYYY')}</p>
                      </OverlayTrigger>

                  </Col>
                  <Col sm={12} md={6} lg={6}>	                     
                         
                     <OverlayTrigger placement="left" overlay={<Tooltip>Phone</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fas fa-phone-alt me-2"></i>{item?.phoneNr}</p>
                      </OverlayTrigger>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Leave Balance</Tooltip>}>
                        <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fas fa-umbrella-beach me-2"></i>{item?.leaveBalance}</p>
                      </OverlayTrigger>	   

                      <div className='my-2'>
                        <OverlayTrigger placement="left" overlay={<Tooltip>Is Active</Tooltip>}>
                          <span className={`badge font-weight-semibold  ${item.isActive ? 'bg-success' : 'bg-warning' } tx-12`}>{item.isActive ? 'Active' : 'Not Active' }</span>
                        </OverlayTrigger>  
                      </div>   
                
                      <div className='my-1'>
                        <OverlayTrigger placement="left" overlay={<Tooltip>Verified</Tooltip>}>
                          <span className={`badge font-weight-semibold bg-primary tx-12`}>{item.verified ? 'Verified' : 'Not Verified'}</span>
                        </OverlayTrigger>  
                      </div> 

                 </Col>
                </Row>                    
  
      </Col>									
      
    </Row>
  </Link>
  )
}

export default StaffCard