import React from "react";
import { Fragment } from "react";
import Pageheader from "@/components/partials/Pageheader";
import { Button, Card, Col, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import Link from "next/link";
import * as Dashboard2data from "@/components/manage/dashboard2data";

const Dashboard = () => {
	return (
		<Fragment>
			<Pageheader title="DASHBOARD" heading="Dashboard" active="Sales" />
			{/* <!-- row --> */}
			<Row>
				<Col xxl={9} xl={12} lg={12} md={12} sm={12}>
					<Col xl={12} lg={12} md={12} sm={12} className="px-0">
						<Card className=" px-3 ps-4">
							<Row className="index1">
								<Col xl={6}
									lg={6}
									md={6}
									sm={6}
									xxl={3}
								>
									<Row className=" border-end bd-xs-e-0 p-3">
										<div className="col-2 d-flex align-items-center justify-content-center">
											<div className="circle-icon bg-primary text-center align-self-center overflow-hidden shadow">
												<i className="fe fe-shopping-bag tx-15 text-white"></i>
											</div>
										</div>
										<div className="col-10 py-0">
											<div className="pt-4 pb-3">
												<div className="d-flex">
													<h6 className="mb-2 fs-12 d-block">Today Orders</h6>
													<span className="badge bg-success-transparent text-success fw-semibold ms-auto rounded-pill lh-maincard px-2 my-auto">
														<i className="bx bx-caret-up me-1"></i>0.11%
													</span>
												</div>
												<div className="pb-0 mt-0">
													<div className="d-flex">
														<h4 className="fs-18 fw-semibold mb-0">
															5,472
														</h4>
													</div>
												</div>
											</div>
										</div>
									</Row>
								</Col>
								<Col xl={6}
									lg={6}
									md={6}
									sm={6}
									xxl={3}
								>
									<Row className=" border-end bd-md-e-0 bd-xs-e-0 bd-lg-e-0 bd-xl-e-0  p-3">
										<div className="col-2 d-flex align-items-center justify-content-center">
											<div className="circle-icon bg-warning text-center align-self-center overflow-hidden shadow">
												<i className="fe fe-dollar-sign tx-15 text-white"></i>
											</div>
										</div>
										<div className="col-10">
											<div className="pt-4 pb-3">
												<div className="d-flex">
													<h6 className="mb-2 tx-12">Today Earnings</h6>
													<span className="badge bg-danger-transparent text-danger fw-semibold ms-auto rounded-pill lh-maincard px-2 my-auto">
														<i className="fa fa-caret-up me-1"></i>0.23%
													</span>
												</div>
												<div className="pb-0 mt-0">
													<div className="d-flex">
														<h4 className="fs-18 font-weight-semibold mb-0">
															$47,589
														</h4>
													</div>
												</div>
											</div>
										</div>
									</Row>
								</Col>
								<Col xl={6}
									lg={6}
									md={6}
									sm={6}
									xxl={3}
								>
									<Row className=" border-end bd-xs-e-0  p-3">
										<div className="col-2 d-flex align-items-center justify-content-center">
											<div className="circle-icon bg-secondary text-center align-self-center overflow-hidden shadow">
												<i className="fe fe-external-link tx-15 text-white"></i>
											</div>
										</div>
										<div className="col-10">
											<div className="pt-4 pb-3">
												<div className="d-flex">
													<h6 className="mb-2 tx-12">Profit Gain</h6>
													<span className="badge bg-success-transparent text-success fw-semibold ms-auto rounded-pill lh-maincard px-2 my-auto">
														<i className="fa fa-caret-up me-1"></i>1.57%
													</span>
												</div>
												<div className="pb-0 mt-0">
													<div className="d-flex">
														<h4 className="tx-18 font-weight-semibold mb-0">
															$8,943
														</h4>
													</div>
												</div>
											</div>
										</div>
									</Row>
								</Col>

								<Col xl={6}
									lg={6}
									md={6}
									sm={6}
									xxl={3}
								>
									<Row className="p-3">
										<div className="col-2 d-flex align-items-center justify-content-center">
											<div className="circle-icon bg-info text-center align-self-center overflow-hidden shadow">
												<i className="fe fe-credit-card tx-15 text-white"></i>
											</div>
										</div>
										<div className="col-10">
											<div className="pt-4 pb-3">
												<div className="d-flex	">
													<h6 className="mb-2 fs-12 d-block">Total Earnings</h6>
													<span className="badge bg-danger-transparent text-danger fw-semibold ms-auto rounded-pill lh-maincard px-2 my-auto">
														<i className="fa fa-caret-up me-1"></i>0.45%
													</span>
												</div>
												<div className="pb-0 mt-0">
													<div className="d-flex">
														<h4 className="tx-18 font-weight-semibold mb-0">
															$57.12M
														</h4>
													</div>
												</div>
											</div>
										</div>
									</Row>
								</Col>
							</Row>
						</Card>
					</Col>
					<Col xl={12} lg={12} md={12} sm={12} className="px-0">
						<Row>
							<Col sm={12} lg={12} xl={8}>
								<Card className="custom-card overflow-hidden">
									<Card.Header className=" border-bottom-0 d-flex">
										<h3 className="card-title mb-2 ">Sales Activity</h3>
										<div className="card-options ms-auto">
											<div className="btn-group p-0">
												<Button
													className="btn btn-outline-light btn-sm"
													type="button"
													variant=""
												>
													Week
												</Button>
												<Button
													className="btn btn-light btn-sm"
													type="button"
													variant=""
												>
													Month
												</Button>
												<Button
													className="btn btn-outline-light btn-sm"
													type="button"
													variant=""
												>
													Year
												</Button>
											</div>
										</div>
									</Card.Header>
									<Card.Body>
										<Row className=" mb-2 ps-lg-5">
											<Col xl={4} lg={4} md={4} sm={4}>
												<p className="mb-1">Total Sales</p>
												<h5 className="mb-1">$52,618</h5>
												<p className="tx-11 text-muted">
													This month
													<span className="text-success ms-2">
														<i className="fa fa-caret-up me-2"></i>
														<span className="badge bg-success text-white tx-11">
															0.9%
														</span>
													</span>
												</p>
											</Col>
											<Col xl={4} lg={4} md={4} sm={4}>
												<p className=" mb-1">Total Sales</p>
												<h5 className="mb-1">$11,197</h5>
												<p className="tx-11 text-muted">
													This Week
													<span className="text-danger ms-2">
														<i className="fa fa-caret-down me-2"></i>
														<span className="badge bg-danger text-white tx-11">
															0.15%
														</span>
													</span>
												</p>
											</Col>
											<Col xl={4} lg={4} md={4} sm={4}>
												<p className=" mb-1">Total Sales</p>
												<h5 className="mb-1">$1,143</h5>
												<p className="tx-11 text-muted">
													Today
													<span className="text-success ms-2">
														<i className="fa fa-caret-up me-2"></i>
														<span className="badge bg-success text-white tx-11">
															0.11%
														</span>
													</span>
												</p>
											</Col>
										</Row>
										<div id="statistics2"><Dashboard2data.Statistics2 /></div>
									</Card.Body>
								</Card>
							</Col>
							<Col sm={12} lg={12} xl={4}>

								<Card className="card">
									<Card.Header className="card-header bg-transparent pb-0">
										<div>
											<h3 className="card-title mb-2">Timeline</h3>
										</div>
									</Card.Header>
									<Card.Body className="card-body mt-0">
										<div className="latest-timelines mt-4">
											<ul className="timelines mb-0">
												<li>
													<div className="featured_icon1 danger">
													</div>
												</li>
												<li className="mt-0 activity">
													<div><span className="fs-11 text-muted float-end">11.43 pm</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark fs-13">Anita Letterback</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt . </p>
												</li>
												<li>
													<div className="featured_icon1 success">
													</div>
												</li>
												<li className="mt-0 activity">
													<div><span className="fs-11 text-muted float-end">12.22 am</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark fs-13">Paddy O'Furniture</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt . </p>
												</li>
												<li>
													<div className="featured_icon1 primary">
													</div>
												</li>
												<li className="mt-0 activity">
													<div><span className="fs-11 text-muted float-end">08.11 pm</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark">Olive Yew</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt . </p>
												</li>
												<li>
													<div className="featured_icon1 warning">
													</div>
												</li>
												<li className="mt-0 activity">
													<div><span className="fs-11 text-muted float-end">9.45 pm</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark fs-13">Maureen Biologist</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt. </p>
												</li>
												<li>
													<div className="featured_icon1 teal">
													</div>
												</li>
												<li className="mt-0 activity">
													<div><span className="fs-11 text-muted float-end">12.09 am</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark fs-13">Peg Legge</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt . </p>
												</li>
												<li>
													<div className="featured_icon1 secondary">
													</div>
												</li>
												<li className="mt-0 activity">
													<div><span className="fs-11 text-muted float-end">05.28 pm</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark fs-13">Letterbac</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt . </p>
												</li>
												<li>
													<div className="featured_icon1 info">
													</div>
												</li>
												<li className="mt-0 activity pb-4">
													<div><span className="fs-11 text-muted float-end">9.10 pm</span></div>
													<a href="#!" className="fs-12 text-dark">
														<p className="mb-1 fw-semibold text-dark fs-13">Anita Letterback</p>
													</a>
													<p className="text-muted mt-0 mb-0 fs-12">Lorem ipsum dolor tempor incididunt . </p>
												</li>
											</ul>
										</div>
									</Card.Body>
								</Card>

							</Col>
						</Row>
					</Col>

					<Col xl={12} lg={12} md={12} sm={12} className="px-0">
						<Row>
							<Col sm={12} lg={12} xl={4}>
								<Card>
									<Card.Header className=" pb-3">
										<h3 className="card-title mb-2">COUNTRY STATISTICS</h3>
									</Card.Header>
									<Card.Body className=" p-0 customers mt-1">
										<div className="country-card pt-0">
											<div className="mb-4">
												<div className="d-flex">
													<span className="fs-13 fw-semibold">
														India
													</span>
													<div className="ms-auto">
														<span className="text-danger mx-1">
															<i className="fe fe-trending-down"></i>
														</span>
														<span className="number-font">$32,879</span> (65%)
													</div>
												</div>
												<div className="progress progress-style ht-5 mt-2 mb-4">
													<div
														className="progress-bar bg-primary wd-60p"
														role="progressbar"
														aria-valuenow="60"
														aria-valuemin="0"
														aria-valuemax="60"
													></div>
												</div>
											</div>
											<div className="mb-4">
												<div className="d-flex mb-1">
													<span className="fs-13 fw-semibold">
														Russia
													</span>
													<div className="ms-auto">
														<span className="text-info mx-1">
															<i className="fe fe-trending-up"></i>
														</span>
														<span className="number-font">$22,710</span> (55%)
													</div>
												</div>
												<div className="progress progress-style ht-5 mt-2 mb-4">
													<div
														className="progress-bar bg-info wd-50p"
														role="progressbar"
														aria-valuenow="60"
														aria-valuemin="0"
														aria-valuemax="60"
													></div>
												</div>
											</div>
											<div className="mb-4">
												<div className="d-flex">
													<span className="fs-13 fw-semibold">
														Canada
													</span>
													<div className="ms-auto">
														<span className="text-danger mx-1">
															<i className="fe fe-trending-down"></i>
														</span>
														<span className="number-font">$56,291</span> (69%)
													</div>
												</div>
												<div className="progress progress-style ht-5 mt-2 mb-4">
													<div
														className="progress-bar bg-secondary wd-80p"
														role="progressbar"
														aria-valuenow="60"
														aria-valuemin="0"
														aria-valuemax="60"
													></div>
												</div>
											</div>
											<div className="mb-4">
												<div className="d-flex">
													<span className="fs-13 fw-semibold">
														Brazil
													</span>
													<div className="ms-auto">
														<span className="text-success mx-1">
															<i className="fe fe-trending-up"></i>
														</span>
														<span className="number-font">$34,209</span> (60%)
													</div>
												</div>
												<div className="progress progress-style ht-5 mt-2 mb-4">
													<div
														className="progress-bar bg-warning wd-60p"
														role="progressbar"
														aria-valuenow="60"
														aria-valuemin="0"
														aria-valuemax="60"
													></div>
												</div>
											</div>
											<div className="mb-4">
												<div className="d-flex">
													<span className="fs-13 fw-semibold">
														United States
													</span>
													<div className="ms-auto">
														<span className="text-success mx-1">
															<i className="fe fe-trending-up"></i>
														</span>
														<span className="number-font">$45,870</span> (86%)
													</div>
												</div>
												<div className="progress progress-style ht-5 mt-2 mb-4">
													<div
														className="progress-bar bg-teal wd-80p"
														role="progressbar"
														aria-valuenow="60"
														aria-valuemin="0"
														aria-valuemax="60"
													></div>
												</div>
											</div>
											<div className="mb-3 pb-1">
												<div className="d-flex">
													<span className="fs-13 fw-semibold">
														Germany
													</span>
													<div className="ms-auto">
														<span className="text-success mx-1">
															<i className="fe fe-trending-up"></i>
														</span>
														<span className="number-font">$67,357</span> (73%)
													</div>
												</div>
												<div className="progress progress-style ht-5 mt-2 mb-4">
													<div
														className="progress-bar bg-success wd-70p"
														role="progressbar"
														aria-valuenow="60"
														aria-valuemin="0"
														aria-valuemax="60"
													></div>
												</div>
											</div>
										</div>
									</Card.Body>
								</Card>
							</Col>
							<Col lg={12} xl={4} md={12}>
								<Card>
									<Card.Header className=" pb-0">
										<h3 className="card-title mb-2">Weekly Visitors</h3>
									</Card.Header>
									<Card.Body className=" pb-0">
										<Row className="mb-4">
											<div className="col-6">
												<div className="text-muted fs-12 text-center mb-2">
													Average Male Visitors
												</div>
												<div className="d-flex justify-content-center align-items-center">
													<span className="me-3 fs-26 fw-semibold">
														2,132
													</span>
													<span className="text-success font-weight-semibold">
														<i className="fa fa-caret-up me-2"></i>0.23%
													</span>
												</div>
											</div>
											<div className="col-6">
												<div className="text-muted fs-12 text-center mb-2">
													Average Female Visitors
												</div>
												<div className="d-flex justify-content-center align-items-center">
													<span className="me-3 fs-26 fw-semibold">
														1,053
													</span>
													<span className="text-danger font-weight-semibold">
														<i className="fa fa-caret-down me-2"></i>0.11%
													</span>
												</div>
											</div>
										</Row>
										<div id="Viewers1"><Dashboard2data.Viewers1 /></div>
									</Card.Body>
								</Card>
							</Col>

							<Col xl={4} lg={12} md={12} >
								<Card >
									<Card.Header className=" pb-3">
										<h3 className="card-title mb-2">MAIN TASKS</h3>
									</Card.Header>
									<Card.Body className=" p-0 customers mt-1">
										<div className="">
											<label className="p-2 d-flex">
												<span className="form-check mb-0 ms-2">
													<input className="form-check-input" type="checkbox" value="" id="flexCheckChecked1" />
												</span>
												<span className="mx-3 my-auto">
													accurate information at any given point.
												</span>
												<span className="ms-auto flex-shrink-0"><span className="badge bg-primary fw-semibold px-2 py-1 fs-11 me-2">Today</span></span>
											</label>
											<label className="p-2 mt-2 d-flex">
												<span className="form-check mb-0 ms-2">
													<input className="form-check-input" type="checkbox" value="" id="flexCheckChecked2" />
												</span>
												<span className="mx-3 my-auto">
													sharing the information with clients or stakeholders.
												</span>
												<span className="ms-auto flex-shrink-0"><span className="badge bg-primary fw-semibold px-2 py-1 fs-11 me-2">Today</span></span>
											</label>
											<label className="p-2 mt-2 d-flex">
												<span className="form-check mb-0 ms-2">
													<input className="form-check-input" type="checkbox" value="" id="flexCheckChecked3" />
												</span>
												<span className="mx-3 my-auto">
													Hearing the information and responding .
												</span>
												<span className="ms-auto flex-shrink-0"><span className="badge bg-primary fw-semibold px-2 py-1 fs-11 me-2 float-end">22 hrs</span></span>
											</label>
											<label className="p-2 mt-2 d-flex">
												<span className="form-check mb-0 ms-2">
													<input className="form-check-input" type="checkbox" value="" id="flexCheckChecked4" />
												</span>
												<span className="mx-3 my-auto">
													Setting up and customizing your own sales.
												</span>
												<span className="ms-auto flex-shrink-0"><span className="badge bg-light-transparent fw-semibold px-2 py-1 fs-11 me-2">1 Day</span></span>
											</label>
											<label className="p-2 mt-2 d-flex">
												<span className="form-check mb-0 ms-2">
													<input className="form-check-input" type="checkbox" value="" id="flexCheckChecked5" defaultChecked />
												</span>
												<span className="mx-3 my-auto">
													To have a complete 360° overview of sales information, having.
												</span>
												<span className="ms-auto flex-shrink-0"><span className="badge bg-light-transparent fw-semibold px-2 py-1 fs-11 me-2">2 Days</span></span>
											</label>
											<label className="p-2 mt-2 d-flex mb-4">
												<span className="form-check mb-0 ms-2">
													<input className="form-check-input" type="checkbox" value="" id="flexCheckChecked6" defaultChecked />
												</span>
												<span className="mx-3 my-auto">
													New Admin Launched.
												</span>
											</label>
										</div>
									</Card.Body>
								</Card>
							</Col>

						</Row>
					</Col>
				</Col>
				<Col xs={12} lg={12} md={12} xl={12} xxl={3}>
					<Card className="overflow-hidden">
						<Card.Header className=" pb-1">
							<h3 className="card-title mb-2">Recent Transactions</h3>
						</Card.Header>
						<Card.Body className=" p-0 customers mt-1">
							<ListGroup className="list-lg-group list-group-flush">
								<Link href="#!" className="border-0">
									<ListGroupItem className="list-group-item-action border-0">
										<div className="media mt-0">
											<span className="me-3 bg-primary-transparent text-primary transaction-icon">
												<i className="fe fe-chevrons-right"></i>
											</span>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-0">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															<span className="me-3">montha.K</span>
														</h5>
														<p className="mb-0 tx-12 text-muted">24-08-2021</p>
													</div>
													<span className="ms-auto wd-25p tx-12">
														<span className="text-primary tx-11 text-end d-block">
															Processing
														</span>
														<span className="float-end text-success font-weight-semibold">
															$256,347
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<span className="me-3 bg-secondary-transparent text-secondary transaction-icon">
												<i className="fe fe-bookmark"></i>
											</span>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															Allie Grater
														</h5>
														<p className="mb-0 tx-12 text-muted">31-12-2021</p>
													</div>
													<span className="ms-auto wd-45p tx-12">
														<span className="float-end text-danger font-weight-semibold">
															$12,345
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<span className="me-3 bg-info-transparent text-info transaction-icon">
												<i className="fe fe-more-horizontal"></i>
											</span>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															<span className="me-3">Gabel</span>
														</h5>
														<p className="mb-0 tx-12 text-muted">15-09-2021</p>
													</div>
													<span className="ms-auto wd-45p  tx-12">
														<span className="text-primary tx-11 text-end d-block">
															Processing
														</span>
														<span className="float-end text-success font-weight-semibold">
															$34,567
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<span className="me-3 bg-success-transparent text-success transaction-icon">
												<i className="fe fe-chevrons-right"></i>
											</span>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															<span className="me-3">Emmanuel</span>
														</h5>
														<p className="mb-0 tx-12 text-muted">30-11-2021</p>
													</div>
													<span className="ms-auto wd-45p tx-12">
														<span className="text-primary tx-11 text-end d-block">
															Processing
														</span>
														<span className="float-end text-danger font-weight-semibold">
															$16,746
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<span className="me-3 bg-warning-transparent text-warning transaction-icon">
												<i className="fe fe-file-text"></i>
											</span>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															Manuel Labor
														</h5>
														<p className="mb-0 tx-12 text-muted">20-10-2021</p>
													</div>
													<span className="ms-auto wd-45p tx-12">
														<span className="float-end text-success font-weight-semibold">
															$45,900
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
							</ListGroup>
						</Card.Body>
					</Card>
					<Card className="custom-card overflow-hidden">
						<Card.Header className="border-bottom-0">
							<div>
								<h3 className="card-title mb-0">Weekly Budget</h3>{" "}
								<span className="d-block fs-12 mb-0 text-muted"></span>
							</div>
						</Card.Header>
						<Card.Body className=" p-0">
							<div id="budget"><Dashboard2data.Budget /></div>
						</Card.Body>
					</Card>

					<Card className=" overflow-hidden">
						<Card.Header className=" pb-1">
							<h3 className="card-title mb-2">Recent Customers</h3>
						</Card.Header>
						<Card.Body className=" p-0 customers mt-1">
							<ListGroup className="list-lg-group list-group-flush">
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<img
												className="avatar-lg rounded-circle me-3 my-auto shadow"
												src={"../../../assets/images/faces/2.jpg"}
												alt=""
											/>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-0">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															Samantha Melon
														</h5>
														<p className="mb-0 tx-12 text-muted">
															User ID: #1234
														</p>
													</div>
													<span className="ms-auto wd-45p tx-14">
														<span className="float-end badge bg-success">
															<span className="font-weight-semibold">paid </span>
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<img
												className="avatar-lg rounded-circle me-3 my-auto shadow"
												src={"../../../assets/images/faces/5.jpg"}
												alt=""
											/>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															Allie Grater
														</h5>
														<p className="mb-0 tx-12 text-muted">
															User ID: #1234
														</p>
													</div>
													<span className="ms-auto wd-45p tx-14">
														<span className="float-end badge bg-danger">
															<span className="font-weight-semibold">
																Pending
															</span>
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<img
												className="avatar-lg rounded-circle me-3 my-auto shadow"
												src={"../../../assets/images/faces/1.jpg"}
												alt=""
											/>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															Gabe Lackmen
														</h5>
														<p className="mb-0 tx-12 text-muted">
															User ID: #1234
														</p>
													</div>
													<span className="ms-auto wd-45p  tx-14">
														<span className="float-end badge bg-danger">
															<span className="font-weight-semibold">
																Pending
															</span>
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
								<Link href="#!" className="border-0 mb-3">
									<ListGroupItem className=" list-group-item-action border-0">
										<div className="media mt-0">
											<img
												className="avatar-lg rounded-circle me-3 my-auto shadow"
												src={"../../../assets/images/faces/7.jpg"}
												alt=""
											/>
											<div className="media-body">
												<div className="d-flex align-items-center">
													<div className="mt-1">
														<h5 className="mb-1 fs-13 font-weight-sembold text-dark">
															Manuel Labor
														</h5>
														<p className="mb-0 tx-12 text-muted">
															User ID: #1234
														</p>
													</div>
													<span className="ms-auto wd-45p tx-14">
														<span className="float-end badge bg-success">
															<span className="font-weight-semibold">Paid</span>
														</span>
													</span>
												</div>
											</div>
										</div>
									</ListGroupItem>
								</Link>
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			{/* <!-- row closed --> */}
			{/* <!-- row  --> */}
			<Row>
				<Col sm={12} className="col-12">
					<Card>
						<Card.Header>
							<h4 className="card-title">Product Summary</h4>
						</Card.Header>
						<Card.Body className=" pt-0">
							<Dashboard2data.Tabledata />
						</Card.Body>
					</Card>
				</Col>
			</Row>
			{/* <!-- row closed --> */}

		</Fragment>
	);
};

Dashboard.layout = "Contentlayout";

export default Dashboard;
