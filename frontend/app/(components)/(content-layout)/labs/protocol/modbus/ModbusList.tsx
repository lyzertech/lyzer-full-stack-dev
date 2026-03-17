'use client'

import SpkAccordions from '@/shared/@spk-reusable-components/general-reusable/reusable-advancedui/spk-accordions'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import { Basicdata, Customdata, Flushdata } from './modbusaccordionsdata'
import {
  accordion1,
  accordion10,
  accordion11,
  accordion12,
  accordion13,
  accordion14,
  accordion15,
  accordion16,
  accordion2,
  accordion3,
  accordion4,
  accordion5,
  accordion6,
  accordion7,
  accordion8,
  accordion9,
  reusableaccordion1,
  reusableaccordion10,
  reusableaccordion11,
  reusableaccordion12,
  reusableaccordion13,
  reusableaccordion2,
  reusableaccordion3,
  reusableaccordion4,
  reusableaccordion5,
  reusableaccordion6,
  reusableaccordion7,
  reusableaccordion8,
  reusableaccordion9,
} from '@/shared/data/prism-code/advanced-ui-prism'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import ShowCode from '@/shared/layouts-components/showcode/showcode'
import Link from 'next/link'
import React, { Fragment } from 'react'
import {
  Card,
  Col,
  Nav,
  Dropdown,
  NavDropdown,
  Row,
  Tab,
} from 'react-bootstrap'

import AcuvimIIV3BasicList from './AcuvimIIV3BasicList'

interface ModbusListProps {}

const ModbusList: React.FC<ModbusListProps> = () => {
  return (
    <Fragment>
      {/* Page Head */}
      <Seo title="Modbus List" />

      <Pageheader
        title="Labs"
        subtitle="Protocol"
        currentpage="Modbus List"
        activepage="Modbus List"
      />

      {/* Body */}
      <Row>
        <Col xxl={12} xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Accuenergy</div>
            </Card.Header>
            <Tab.Container defaultActiveKey="ordertab1">
              <Card.Body className="">
                <Nav
                  className=" nav-tabs tab-style-2 nav-justified mb-3 d-sm-flex d-block"
                  id="myTab1"
                  role="tablist"
                >
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab1"
                      className=""
                      id="order-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#order-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="home-tab-pane"
                      aria-selected="true"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Acuvim II V3
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab2"
                      className=""
                      id="confirmed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#confirm-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Acuvim L V4
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab3"
                      className=""
                      id="confirmed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#confirm-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Acuvim L V3
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab4"
                      className=""
                      id="confirmed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#confirm-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Acuvim 3
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="" id="myTabContent">
                  <Tab.Pane
                    eventKey="ordertab1"
                    className=" fade text-muted"
                    id="order-tab-pane"
                    role="tabpanel"
                    aria-labelledby="home-tab"
                    tabIndex={0}
                  >
                    <Row>
                      <Col xl={12}>
                        <SpkAccordions
                          items={Basicdata}
                          accordionClass="accordion-primary"
                          defaultActiveKey={10}
                        />
                      </Col>
                    </Row>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="ordertab2"
                    className=" fade text-muted"
                    id="confirm-tab-pane"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                    tabIndex={0}
                  >
                    <ul className="ps-3 mb-0">
                      <li>
                        As opposed to using 'Content here, content here', making
                        it look like readable English. Many desktop publishing
                        packages and web page editors now use Lorem Ipsum as
                        their default model text, and a search.
                      </li>
                    </ul>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="ordertab3"
                    className=" fade text-muted"
                    id="shipped-tab-pane"
                    role="tabpanel"
                    aria-labelledby="contact-tab"
                    tabIndex={0}
                  >
                    <ul className="ps-3 mb-0">
                      <li>
                        but also the leap into electronic typesetting, remaining
                        essentially unchanged. It was popularised in the 1960s
                        with the release of Letraset sheets containing Lorem
                        Ipsum passages, and more recently.
                      </li>
                    </ul>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="ordertab4"
                    className=" fade text-muted"
                    id="delivered-tab-pane"
                    role="tabpanel"
                    tabIndex={0}
                  >
                    <ul className="list-unstyled mb-0">
                      <li>
                        A Latin professor at Hampden-Sydney College in Virginia,
                        looked up one of the more obscure Latin words,
                        consectetur, from a Lorem Ipsum passage, and going
                        through the cites of the word in classical literature.
                      </li>
                    </ul>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Tab.Container>
          </Card>
        </Col>
        <Col xxl={12} xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Rishabh</div>
            </Card.Header>
            <Tab.Container defaultActiveKey="ordertab1">
              <Card.Body className="">
                <Nav
                  className=" nav-tabs tab-style-2 nav-justified mb-3 d-sm-flex d-block"
                  id="myTab1"
                  role="tablist"
                >
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab1"
                      className=""
                      id="order-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#order-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="home-tab-pane"
                      aria-selected="true"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      LM1340
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab2"
                      className=""
                      id="confirmed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#confirm-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Rish Con M+
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab3"
                      className=""
                      id="confirmed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#confirm-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Acuvim L V3
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="" role="presentation">
                    <Nav.Link
                      eventKey="ordertab4"
                      className=""
                      id="confirmed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#confirm-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      <i className="ri-check-double-line me-1 align-middle"></i>
                      Acuvim 3
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="" id="myTabContent">
                  <Tab.Pane
                    eventKey="ordertab1"
                    className=" fade text-muted"
                    id="order-tab-pane"
                    role="tabpanel"
                    aria-labelledby="home-tab"
                    tabIndex={0}
                  >
                    <Row>
                      <Col xl={12}>
                        <SpkAccordions
                          items={Basicdata}
                          accordionClass="accordion-primary"
                          defaultActiveKey={10}
                        />
                      </Col>
                    </Row>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="ordertab2"
                    className=" fade text-muted"
                    id="confirm-tab-pane"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                    tabIndex={0}
                  >
                    <ul className="ps-3 mb-0">
                      <li>
                        As opposed to using 'Content here, content here', making
                        it look like readable English. Many desktop publishing
                        packages and web page editors now use Lorem Ipsum as
                        their default model text, and a search.
                      </li>
                    </ul>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="ordertab3"
                    className=" fade text-muted"
                    id="shipped-tab-pane"
                    role="tabpanel"
                    aria-labelledby="contact-tab"
                    tabIndex={0}
                  >
                    <ul className="ps-3 mb-0">
                      <li>
                        but also the leap into electronic typesetting, remaining
                        essentially unchanged. It was popularised in the 1960s
                        with the release of Letraset sheets containing Lorem
                        Ipsum passages, and more recently.
                      </li>
                    </ul>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="ordertab4"
                    className=" fade text-muted"
                    id="delivered-tab-pane"
                    role="tabpanel"
                    tabIndex={0}
                  >
                    <ul className="list-unstyled mb-0">
                      <li>
                        A Latin professor at Hampden-Sydney College in Virginia,
                        looked up one of the more obscure Latin words,
                        consectetur, from a Lorem Ipsum passage, and going
                        through the cites of the word in classical literature.
                      </li>
                    </ul>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Tab.Container>
          </Card>
        </Col>
      </Row>

      {/* <h6 className="mb-3">Light Colors:</h6>
      <Row>
        <Col xl={12}>
          <ShowCode
            title="Primary"
            customCardClass="custom-card"
            customCardBodyClass=""
            reactCode={accordion6}
            reusableCode={reusableaccordion6}
          >
            <SpkAccordions
              items={Basicdata}
              accordionClass="accordion-primary"
              defaultActiveKey={1}
            />
          </ShowCode>
        </Col>
      </Row> */}
    </Fragment>
  )
}

export default ModbusList
