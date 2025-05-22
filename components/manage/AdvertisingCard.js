import React from 'react'
import Link from "next/link";
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from 'moment';

const AdvertisingCard = ({ href, item }) => {

  return (
    <Link href={href}>
    <Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y'> 
      <Col xs={12} lg={9} xl={10}>

                <OverlayTrigger placement="left" overlay={<Tooltip>Vehicle Details</Tooltip>}>
                  <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-car me-2"></i>{item.description}</p>
                </OverlayTrigger>  

                <Row className='mt-3'>
                  <Col sm={12} md={6} lg={6}> 

                     <OverlayTrigger placement="left" overlay={<Tooltip>Timestamp</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="far fa-clock me-2"></i>{moment(item.timestamp).format('DD MMM HH:MM')}</p>
                      </OverlayTrigger>                 

                      <OverlayTrigger placement="left" overlay={<Tooltip>Source</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fas fa-external-link-alt me-2"></i>{item.platform}</p>
                      </OverlayTrigger>	

                      <OverlayTrigger placement="left" overlay={<Tooltip>Event</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fas fa-mouse-pointer me-3"></i>{item.action}</p>
                      </OverlayTrigger>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Cost</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-tag me-2"></i>{item?.cost ? '  R'+Number(item.cost).toFixed(2): '   Not Priced'}</p>
                      </OverlayTrigger>                      

                  </Col>
                  <Col sm={12} md={6} lg={6}>	
                    
                      <OverlayTrigger placement="left" overlay={<Tooltip>City</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-building me-2"></i>{item.city}</p>
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Operating System</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-cogs me-2"></i>{item.os}</p>
                      </OverlayTrigger>	
                      <OverlayTrigger placement="left" overlay={<Tooltip>Device</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-laptop me-2"></i>{item.device}</p> 
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Browser</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fab fa-internet-explorer me-2"></i>{item.browser}</p> 
                      </OverlayTrigger>

                  </Col>
               </Row>

      </Col>
    </Row>
  </Link>
  )
}

export default AdvertisingCard
