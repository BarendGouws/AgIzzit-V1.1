import React from 'react'
import Link from "next/link";
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from 'moment';

const AccountsCard = ({ item }) => {

  return (
    <Link href={`/manage/accounts/${item._id}`}>
      <Row className='py-3 m-2 m-sm-2 p-sm-3 bd-y'> 
        <Col sm={12} md={6} lg={6}> 

          <OverlayTrigger placement="left" overlay={<Tooltip>Timestamp</Tooltip>}>
           <p className="fs-6 font-weight-semibold text-dark mb-1"><i className="fas fa-clock me-2"></i>{moment(item.timestamp).format('DD MMM HH:MM')}</p>
          </OverlayTrigger>                 

          <OverlayTrigger placement="left" overlay={<Tooltip>Email</Tooltip>}>
           <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fas fa-envelope me-2"></i>{item.email}</p>
          </OverlayTrigger>	

          <OverlayTrigger placement="left" overlay={<Tooltip>Known As</Tooltip>}>
           <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fas fa-user me-2"></i>{item.knownAs}</p>
          </OverlayTrigger>                             

        </Col>
        <Col sm={12} md={6} lg={6}>	

          <OverlayTrigger placement="left" overlay={<Tooltip>Balance</Tooltip>}>
            <p className="fs-6 font-weight-semibold text-dark mb-2"><i className="fa fa-cart-plus me-2"></i>{item?.balance ? 'R '+Number(item.balance).toFixed(2) : 'R0.00'}</p>
          </OverlayTrigger>	 
        
          <div className='my-2'>
          <OverlayTrigger placement="left" overlay={<Tooltip>Profile</Tooltip>}>
          <span className={`badge font-weight-semibold  ${item.isProfileComplete ? 'bg-success' : 'bg-warning' } tx-12`}>{item.isProfileComplete ? 'Completed' : 'Not Completed' }</span>
          </OverlayTrigger>  
          </div>
          <div className='my-1'>
          <OverlayTrigger placement="left" overlay={<Tooltip>Status</Tooltip>}>
          <span className={`badge font-weight-semibold bg-primary tx-12`}>{item.isActive ? 'Active': 'Not Active'}</span>
          </OverlayTrigger>  
          </div> 

        </Col>
      </Row>
  </Link>
  )
}

export default AccountsCard
