"use client"

import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

interface TestCasesPageProps { }

const TestCasesPage: React.FC<TestCasesPageProps> = () => {

    // Filter options
    const CategoryOptions = [
        { value: 'all', label: 'All Categories' },
        { value: 'unit', label: 'Unit Tests' },
        { value: 'integration', label: 'Integration Tests' },
        { value: 'e2e', label: 'E2E Tests' },
        { value: 'performance', label: 'Performance Tests' },
    ];

    const StatusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'passed', label: 'Passed' },
        { value: 'failed', label: 'Failed' },
        { value: 'pending', label: 'Pending' },
        { value: 'skipped', label: 'Skipped' },
    ];

    const PriorityOptions = [
        { value: 'all', label: 'All Priority' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
    ];

    const SortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'status', label: 'Status' },
        { value: 'duration', label: 'Duration' },
    ];

    // Sample test cases data
    const testCases = [
        { id: 'TC001', name: 'User Login Validation', category: 'Unit', status: 'Passed', priority: 'High', lastRun: '2024-02-07', duration: '2.3s' },
        { id: 'TC002', name: 'Payment Processing', category: 'Integration', status: 'Passed', priority: 'High', lastRun: '2024-02-07', duration: '4.1s' },
        { id: 'TC003', name: 'Registration Flow', category: 'E2E', status: 'Failed', priority: 'High', lastRun: '2024-02-07', duration: '5.8s' },
        { id: 'TC004', name: 'Email Notification', category: 'Integration', status: 'Passed', priority: 'Medium', lastRun: '2024-02-06', duration: '3.2s' },
        { id: 'TC005', name: 'API Response Time', category: 'Performance', status: 'Passed', priority: 'Medium', lastRun: '2024-02-06', duration: '1.5s' },
        { id: 'TC006', name: 'Database Query', category: 'Performance', status: 'Failed', priority: 'Low', lastRun: '2024-02-05', duration: '8.2s' },
        { id: 'TC007', name: 'Form Validation', category: 'Unit', status: 'Passed', priority: 'Medium', lastRun: '2024-02-05', duration: '1.9s' },
    ];

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Test-Cases" />

            <Pageheader
                title="Testing"
                subtitle="Test Cases"
                currentpage="Test Cases"
                activepage="Testing"
            />

            {/* <!-- Page Header Close --> */}

            {/* Header with Back Button */}
            <Row className="mb-3">
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-0">🧪 Test Cases Library</h4>
                            <p className="text-muted mb-0">Browse and manage all test cases</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Link href="/testing/add-test">
                                <Button variant="primary">
                                    <i className="ri-add-line me-1"></i>
                                    Add New Test
                                </Button>
                            </Link>
                            <Button variant="outline-secondary" onClick={() => window.history.back()}>
                                <i className="ri-arrow-left-line me-1"></i>
                                Back
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* <!-- Start::row-1 --> */}

            <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
                <div className="col">
                    <Card className="custom-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <div className="fs-12 text-muted mb-1">Total Test Cases</div>
                                    <h5 className="fw-semibold mb-0">1,247</h5>
                                </div>
                                <div>
                                    <span className="avatar avatar-md bg-primary-transparent">
                                        <i className="ti ti-checklist fs-18"></i>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col">
                    <Card className="custom-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <div className="fs-12 text-muted mb-1">Passed</div>
                                    <h5 className="fw-semibold mb-0 text-success">1,089</h5>
                                </div>
                                <div>
                                    <span className="avatar avatar-md bg-success-transparent">
                                        <i className="ti ti-check fs-18"></i>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col">
                    <Card className="custom-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <div className="fs-12 text-muted mb-1">Failed</div>
                                    <h5 className="fw-semibold mb-0 text-danger">158</h5>
                                </div>
                                <div>
                                    <span className="avatar avatar-md bg-danger-transparent">
                                        <i className="ti ti-x fs-18"></i>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col">
                    <Card className="custom-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <div className="fs-12 text-muted mb-1">Success Rate</div>
                                    <h5 className="fw-semibold mb-0 text-info">87.3%</h5>
                                </div>
                                <div>
                                    <span className="avatar avatar-md bg-info-transparent">
                                        <i className="ti ti-trending-up fs-18"></i>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Row>

            {/* <!--End::row-1 --> */}

            {/* <!-- Start::row-2 --> */}

            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="justify-content-between border-bottom-0">

                            {/* <!-- Search Bar --> */}

                            <div className="w-sm-25">
                                <Form.Control
                                    className=""
                                    type="search"
                                    id="search-input"
                                    placeholder="Search test cases..."
                                    aria-label="search-item"
                                />
                            </div>

                            {/* <!-- Filters Section --> */}

                            <Row className="gy-2 w-sm-50">

                                {/* <!-- Filter 1: Category --> */}
                                <div className="col custom-products-select">
                                    <SpkSelect
                                        option={CategoryOptions}
                                        placeholder="Category"
                                        name="category-filter"
                                        id="category-filter"
                                        classNameprefix="Select2"
                                    />
                                </div>

                                {/* <!-- Filter 2: Status --> */}
                                <div className="col custom-products-select">
                                    <SpkSelect
                                        option={StatusOptions}
                                        placeholder="Status"
                                        name="status-filter"
                                        id="status-filter"
                                        classNameprefix="Select2"
                                    />
                                </div>

                                {/* <!-- Filter 3: Priority --> */}
                                <div className="col custom-products-select">
                                    <SpkSelect
                                        option={PriorityOptions}
                                        placeholder="Priority"
                                        name="priority-filter"
                                        id="priority-filter"
                                        classNameprefix="Select2"
                                    />
                                </div>

                                {/* <!-- Filter 4: Sort --> */}
                                <div className="col custom-products-select">
                                    <SpkSelect
                                        option={SortOptions}
                                        placeholder="Sort By"
                                        name="sort-filter"
                                        id="sort-filter"
                                        classNameprefix="Select2"
                                    />
                                </div>

                            </Row>
                        </Card.Header>

                        {/* <!-- Table inside the card-body --> */}

                        <Card.Body className="p-0">
                            <div id="test-cases-table" className="grid-card-table">
                                <div className="table-responsive">
                                    <SpkTables
                                        tableClass="text-nowrap"
                                        header={[
                                            { title: 'Test ID' },
                                            { title: 'Test Name' },
                                            { title: 'Category' },
                                            { title: 'Status' },
                                            { title: 'Priority' },
                                            { title: 'Last Run' },
                                            { title: 'Duration' },
                                            { title: 'Actions' }
                                        ]}
                                    >
                                        {testCases.map((test, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span className="fw-semibold">{test.id}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="lh-1">
                                                            <span className={`avatar avatar-sm avatar-rounded bg-${test.status === 'Passed' ? 'success' : 'danger'}-transparent`}>
                                                                <i className={`ti ti-${test.status === 'Passed' ? 'check' : 'x'}`}></i>
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="fw-semibold">{test.name}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <SpkBadge variant="" Customclass="badge bg-light text-dark">
                                                        {test.category}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <SpkBadge
                                                        variant=""
                                                        Customclass={`badge bg-${test.status === 'Passed' ? 'success' : 'danger'}-transparent`}
                                                    >
                                                        {test.status}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <SpkBadge
                                                        variant=""
                                                        Customclass={`badge bg-${test.priority === 'High' ? 'danger' : test.priority === 'Medium' ? 'warning' : 'info'}-transparent`}
                                                    >
                                                        {test.priority}
                                                    </SpkBadge>
                                                </td>
                                                <td>{test.lastRun}</td>
                                                <td>{test.duration}</td>
                                                <td>
                                                    <div className="btn-list">
                                                        <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-primary-light">
                                                            <i className="ti ti-eye"></i>
                                                        </SpkButton>
                                                        <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-success-light">
                                                            <i className="ti ti-refresh"></i>
                                                        </SpkButton>
                                                        <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-info-light">
                                                            <i className="ti ti-edit"></i>
                                                        </SpkButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </SpkTables>
                                </div>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted">
                                    Showing 7 of 1,247 test cases
                                </div>
                                <Link href="/testing/add-test">
                                    <SpkButton Buttonvariant="primary" Customclass="">
                                        <i className="ti ti-plus me-2"></i>Add New Test
                                    </SpkButton>
                                </Link>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End::row-2 --> */}

        </Fragment>
    )
};

export default TestCasesPage;
