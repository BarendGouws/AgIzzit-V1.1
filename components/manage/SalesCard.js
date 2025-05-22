import React from 'react'
import Link from "next/link";
import Image from 'next/image'
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";

const SalesCard = ({ item }) => {
  return (
    <Link href={`/manage/sales/${item._id}`}>
    <Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y' >
  
      <Col xs={12} sm={10} lg={2} className='mb-2'>

                <Image
                    style={{objectFit: "contain"}}
                    width={150}
                    height={120}
                    priority={true}
                    alt="avatar"
                    className="rounded-50 img-thumbnail wd-100p wd-sm-200"
                    src={item?.url ? item.url : '/assets/img/system/no-image-available.png'}
                    />

      </Col>
      <Col xs={12} lg={8}>

                <OverlayTrigger placement="left" overlay={<Tooltip>Vehicle Details</Tooltip>}>
                  <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-car me-2"></i>{item.description}</p>
                </OverlayTrigger>  

                <Row className='mt-3'>
                  <Col sm={12} md={6} lg={6}>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Vehicle Price</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-tag me-2"></i>{item?.price ? ' R '+Number(item.price).toFixed(2) : ' Not Priced'}</p>
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Extras</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fas fa-folder-open me-2"></i>{item?.extras ? 'R '+Number(item.extras).toFixed(2) : ' No Extras'}</p>
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Total</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fa fa-shopping-cart me-2"></i>{item?.total ? 'R '+Number(item.total).toFixed(2) : 'R0.00'}</p>
                      </OverlayTrigger>	
                      <OverlayTrigger placement="left" overlay={<Tooltip>Account Balance</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fa fa-cart-plus me-2"></i>{item?.accountBalance ? 'R '+Number(item.accountBalance).toFixed(2) : 'R0.00'}</p>
                      </OverlayTrigger>	

                  </Col>
                  <Col sm={12} md={6} lg={6}>	                     
                         
                      <OverlayTrigger placement="left" overlay={<Tooltip>Sale Type</Tooltip>}>
                        <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fas fa-flag me-2"></i>{item.type ? item.type : 'Not Available'}</p>
                      </OverlayTrigger>

                      <OverlayTrigger placement="left" overlay={<Tooltip>RMCP Score</Tooltip>}>
                        <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-cogs me-2"></i>{item.rmcpScore}</p>
                      </OverlayTrigger>	   

                      <div className='my-2'>
                        <OverlayTrigger placement="left" overlay={<Tooltip>RMCP Outcome</Tooltip>}>
                         <span className={`badge font-weight-semibold  ${item.rmcpScore >= 25 ? 'bg-danger' : item.rmcpScore < 25 && item.rmcpScore >= 9 ? 'bg-warning' : 'bg-success'} tx-12`}>{item.rmcpScore >= 25 ? 'High Risk' : item.rmcpScore < 25 && item.rmcpScore >= 9 ? 'Medium Risk' : 'Low Risk' }</span>
                        </OverlayTrigger>  
                      </div>   

                      <div className='my-1'>
                        <OverlayTrigger placement="left" overlay={<Tooltip>Status</Tooltip>}>
                          <span className={`badge font-weight-semibold bg-primary tx-12`}>{item.status ? item.status: 'Not Available'}</span>
                        </OverlayTrigger>  
                      </div> 

                 </Col>
                </Row>                    
  
      </Col>									
      
    </Row>
  </Link>
  )
}

export default SalesCard