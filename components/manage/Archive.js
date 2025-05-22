import React from 'react'
import Link from "next/link";
import Image from 'next/image'
import { Card, Row, Col, ButtonGroup, Button} from "react-bootstrap";
import moment from 'moment';

const ArchiveCard = ({ item }) => {

  return (
    <Card className="custom-card">
          <Card.Header className=" border-bottom-0">
            <div>
              <h3 className="card-title mb-2 text-dark ">
                <Link href="#!" className="text-dark">
                  SALE FILE - 1999 TOYOTA HILUX 2700i 4x4 SRX
                </Link>
              </h3>
            </div>
          </Card.Header>
          <Card.Body className=" pt-0">

             <h6 className="p-2 tx-18">
              Matched <Link href="#!" className="text-primary">Inventory</Link> loaded on 2021-10-01 and Purchased by <Link href="#!" className="text-primary">Piet Pompies</Link> on 2022-01-31, that was sold by <Link href="#!" className="text-primary">John Doe</Link>
            </h6>   

             <div className="mt-3">
              {item?.documents?.map((doc, index) => (
                <Link href={doc.url} key={index} passHref>
                  <ButtonGroup className="btn-group file-attach m-2" role="group" aria-label="Basic example">
                    <Button variant="" type="button" className="btn btn-lg btn-outline-primary">
                      <i className="mdi mdi-file-pdf fs-20 me-2"></i>{doc.name}
                    </Button>              
                  </ButtonGroup>
                </Link>
                ))}
             </div>

             <Row className="mb-2">
                  {item?.images?.map((img, index) => (
                  <Col lg={2} sm={6} key={index}>
                    <div className="">
                      <div className="border  br-5 p-0 text-center m-1">          
                          <img src={img} alt="img" className="mx-auto br-5"/> 
                      </div>
                    </div>
                  </Col>))}                 
             </Row>    

          </Card.Body>
        </Card>
  )
}

export default ArchiveCard