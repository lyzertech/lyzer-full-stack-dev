"use client"

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Spkapexcharts from "@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment } from "react";
import { Card, Col, Row, Pagination } from "react-bootstrap";

interface TestingDashboardProps { }

const TestingDashboard: React.FC<TestingDashboardProps> = () => {

    // Sample data for stat cards
    const statCards = [
        { label: "Total Tests", value: "1,247", color: "primary", icon: "ti ti-checklist", percentage: "+12%", trendColor: "success", trendDirection: "up", trendText: "this month" },
        { label: "Passed Tests", value: "1,089", color: "success", icon: "ti ti-check", percentage: "+8%", trendColor: "success", trendDirection: "up", trendText: "vs last month" },
        { label: "Failed Tests", value: "158", color: "danger", icon: "ti ti-x", percentage: "-5%", trendColor: "success", trendDirection: "down", trendText: "improvement" },
        { label: "Success Rate", value: "87.3%", color: "info", icon: "ti ti-trending-up", percentage: "+2.1%", trendColor: "success", trendDirection: "up", trendText: "this week" },
    ];

    // Chart data
    const chartOptions = {
        chart: { height: 320, type: 'line', toolbar: { show: false } },
        xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        colors: ['#845adf', '#23b7e5'],
        stroke: { curve: 'smooth', width: 2 }
    };

    const chartSeries = [
        { name: 'Passed', data: [75, 82, 88, 91, 85, 89, 93] },
        { name: 'Failed', data: [25, 18, 12, 9, 15, 11, 7] }
    ];

    // Recent test results
    const recentTests = [
        { name: "Login Functionality", status: "Passed", date: "2024-02-07", duration: "2.3s" },
        { name: "Payment Gateway", status: "Passed", date: "2024-02-07", duration: "4.1s" },
        { name: "User Registration", status: "Failed", date: "2024-02-07", duration: "1.8s" },
        { name: "Email Verification", status: "Passed", date: "2024-02-07", duration: "3.2s" },
        { name: "API Integration", status: "Passed", date: "2024-02-06", duration: "2.7s" },
    ];

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Testing-Dashboard" />

            <Pageheader
                title="Testing"
                subtitle="Dashboard"
                currentpage="Dashboard"
                activepage="Testing"
            />

            {/* <!-- Page Header Close --> */}

            {/* <!-- Start:: row-1 --> */}

            <Row>
                {statCards.map((item, index) => (
                    <Col xxl={3} lg={6} md={6} sm={12} key={index}>
                        <Card className="custom-card dashboard-main-card">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="fs-12 text-muted mb-1">{item.label}</div>
                                        <h4 className="fw-semibold mb-0">{item.value}</h4>
                                    </div>
                                    <div>
                                        <span className={`avatar avatar-md bg-${item.color}-transparent`}>
                                            <i className={item.icon}></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className={`badge bg-${item.trendColor}-transparent`}>
                                        <i className={`ti ti-arrow-${item.trendDirection}`}></i>
                                        {item.percentage}
                                    </span>
                                    <span className="text-muted ms-2 fs-12">{item.trendText}</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* <!-- End:: row-1 --> */}

            {/* <!-- Start:: row-2 --> */}

            <Row>
                <Col xxl={8}>
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">
                                Test Results Analytics
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div id="test-analytics-chart">
                                <Spkapexcharts
                                    height={320}
                                    type="line"
                                    width="100%"
                                    chartOptions={chartOptions}
                                    chartSeries={chartSeries}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xxl={4}>
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Test Categories</div>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Unit Tests</span>
                                    <span className="fw-semibold">542</span>
                                </div>
                                <div className="progress progress-sm">
                                    <div className="progress-bar bg-primary" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Integration Tests</span>
                                    <span className="fw-semibold">385</span>
                                </div>
                                <div className="progress progress-sm">
                                    <div className="progress-bar bg-success" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>E2E Tests</span>
                                    <span className="fw-semibold">198</span>
                                </div>
                                <div className="progress progress-sm">
                                    <div className="progress-bar bg-info" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Performance Tests</span>
                                    <span className="fw-semibold">122</span>
                                </div>
                                <div className="progress progress-sm">
                                    <div className="progress-bar bg-warning" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End:: row-2 --> */}

            {/* <!-- Start:: row-3 --> */}

            <Row>
                <Col xl={12}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header className="justify-content-between">
                            <div className="card-title">
                                Recent Test Results
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                <Link href="/testing/test-cases">
                                    <SpkButton Buttonvariant="primary-light" Customclass="btn-sm">
                                        View All Tests
                                    </SpkButton>
                                </Link>
                                <Link href="/testing/add-test">
                                    <SpkButton Buttonvariant="success-light" Customclass="btn-sm">
                                        Add New Test
                                    </SpkButton>
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <SpkTables
                                    tableClass="text-nowrap"
                                    header={[
                                        { title: 'Test Name' },
                                        { title: 'Status' },
                                        { title: 'Date' },
                                        { title: 'Duration' },
                                        { title: 'Actions' }
                                    ]}
                                >
                                    {recentTests.map((test, index) => (
                                        <tr key={index}>
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
                                                <SpkBadge
                                                    variant=""
                                                    Customclass={`badge bg-${test.status === 'Passed' ? 'success' : 'danger'}-transparent`}
                                                >
                                                    {test.status}
                                                </SpkBadge>
                                            </td>
                                            <td>{test.date}</td>
                                            <td>{test.duration}</td>
                                            <td>
                                                <div className="btn-list">
                                                    <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-primary-light">
                                                        <i className="ti ti-eye"></i>
                                                    </SpkButton>
                                                    <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-info-light">
                                                        <i className="ti ti-refresh"></i>
                                                    </SpkButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </SpkTables>
                            </div>
                        </Card.Body>
                        <Card.Footer className="border-top-0">
                            <div className="d-flex align-items-center flex-wrap">
                                <div> Showing 5 Entries <i className="bi bi-arrow-right ms-2 fw-semibold"></i> </div>
                                <div className="ms-auto">
                                    <nav aria-label="Page navigation" className="pagination-style-2">
                                        <Pagination className="mb-0 flex-wrap">
                                            <Pagination.Prev disabled>Prev</Pagination.Prev>
                                            <Pagination.Item active>1</Pagination.Item>
                                            <Pagination.Item>2</Pagination.Item>
                                            <Pagination.Item>3</Pagination.Item>
                                            <Pagination.Next className="text-primary">Next</Pagination.Next>
                                        </Pagination>
                                    </nav>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End:: row-3 --> */}

        </Fragment>
    )
};

export default TestingDashboard;
