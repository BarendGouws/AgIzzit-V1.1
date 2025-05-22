import React from 'react'
import Link from "next/link";
import Image from 'next/image'
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";

const TableVehicleCard = ({ href, item }) => {
  return (
    <Link href={href}>
    <Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y' >
  
      <Col xs={12} sm={10} lg={3} xl={2} className='mb-2'>

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
      <Col xs={12} lg={9} xl={10}>

                <OverlayTrigger placement="left" overlay={<Tooltip>Vehicle Details</Tooltip>}>
                  <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-car me-2"></i>{item.year+' '+item.make+' '+item.model+' '+item.variant}</p>
                </OverlayTrigger>  

                <Row className='mt-3'>
                  <Col sm={12} md={6} lg={6}>

                      <OverlayTrigger placement="left" overlay={<Tooltip>Selling Price</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-tag me-2"></i>{item?.price ? '  R'+Number(item.price).toFixed(2): '   Not Priced'}</p>
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Listing Views</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fa fa-eye me-2"></i>{item.views}</p>
                      </OverlayTrigger>	
                      <OverlayTrigger placement="left" overlay={<Tooltip>Purchase events</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fa fa-cart-plus me-2"></i>{item.addToCartClicks}</p>
                      </OverlayTrigger>									
                      <OverlayTrigger placement="left" overlay={<Tooltip>Mileage</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fas fa-tachometer-alt me-2"></i>{item.mileage}</p>
                      </OverlayTrigger>

                  </Col>
                  <Col sm={12} md={6} lg={6}>		

                    
                      <OverlayTrigger placement="left" overlay={<Tooltip>Fuel Type</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-gas-pump me-2"></i>{item.fuelType}</p>
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Transmission</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-cogs me-2"></i>{item.transmission}</p>
                      </OverlayTrigger>	
                      <OverlayTrigger placement="left" overlay={<Tooltip>Colour</Tooltip>}>
                      <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fa fa-magic me-2"></i>{item.colour}</p> 
                      </OverlayTrigger>
                      <OverlayTrigger placement="left" overlay={<Tooltip>Is Advertised</Tooltip>}>
                      <span className={`badge font-weight-semibold  ${item.isActive ? 'bg-success' : 'bg-warning'} tx-12`}>{item.isActive ? 'Active':'Not Active' }</span>
                      </OverlayTrigger>
                      
                          

                </Col>
                </Row>
              
                                              

      </Col>								
      
    </Row>
  </Link>
  )
}

export default TableVehicleCard
