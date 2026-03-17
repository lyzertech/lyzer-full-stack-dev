"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDatepickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-datepicker";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import SpkSunEditor from "@/shared/@spk-reusable-components/reusable-plugins/spk-suneditor";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { FilePond } from "react-filepond";

interface AddTestProps { }

const AddTest: React.FC<AddTestProps> = () => {

    const [dates, setDates] = useState<{ [key: string]: Date | string | null }>({});
    const handleDateChange = (key: string, date: Date | null) => {
        if (date) {
            setDates((prevDates) => ({
                ...prevDates,
                [key]: date,
            }));
        } else {
            setDates((prevDates) => {
                const { [key]: removedKey, ...rest } = prevDates;
                return rest;
            });
        }
    };

    const [files, setFiles] = useState<{ [key: string]: File[] }>({});
    const handleFileUpdate = (fileItems: any, pondName: string) => {
        setFiles((prevFiles) => ({
            ...prevFiles,
            [pondName]: fileItems.map((fileItem: any) => fileItem.file),
        }));
    };

    // Dropdown options
    const CategoryOptions = [
        { value: 'unit', label: 'Unit Test' },
        { value: 'integration', label: 'Integration Test' },
        { value: 'e2e', label: 'E2E Test' },
        { value: 'performance', label: 'Performance Test' },
        { value: 'security', label: 'Security Test' },
        { value: 'regression', label: 'Regression Test' },
    ];

    const PriorityOptions = [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
        { value: 'critical', label: 'Critical' },
    ];

    const StatusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'draft', label: 'Draft' },
    ];

    const AssigneeOptions = [
        { value: 'john', label: 'John Doe - QA Lead' },
        { value: 'jane', label: 'Jane Smith - QA Engineer' },
        { value: 'alex', label: 'Alex Johnson - Senior Tester' },
        { value: 'maria', label: 'Maria Garcia - Automation Engineer' },
    ];

    // Default content for rich text editor
    const defaultTestSteps = `<ol>
        <li>Navigate to the login page</li>
        <li>Enter valid username and password</li>
        <li>Click the "Login" button</li>
        <li>Verify successful login and redirection to dashboard</li>
    </ol>`;

    const defaultExpectedResults = `<ul>
        <li>User successfully logs in without errors</li>
        <li>Dashboard loads with correct user information</li>
        <li>All dashboard widgets display properly</li>
    </ul>`;

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Add-New-Test" />

            <Pageheader
                title="Testing"
                subtitle="Add Test"
                currentpage="Add Test Case"
                activepage="Testing"
            />

            {/* <!-- Page Header Close --> */}

            {/* Header with Back Button */}
            <Row className="mb-3">
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-0">📝 Create New Test Case</h4>
                            <p className="text-muted mb-0">Fill in the test case details below</p>
                        </div>
                        <Button variant="outline-secondary" onClick={() => window.history.back()}>
                            <i className="ri-arrow-left-line me-1"></i>
                            Back
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* <!-- Start:: row-1 --> */}

            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">
                                Create Test Case
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="row gy-3">
                                {/* Test Case Name */}
                                <Col xl={12}>
                                    <Form.Label htmlFor="test-name">Test Case Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="test-name"
                                        placeholder="Enter test case name (e.g., User Login Validation)"
                                    />
                                    <Form.Label htmlFor="test-name" className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Name should be descriptive and clear
                                    </Form.Label>
                                </Col>

                                {/* Category & Priority */}
                                <Col xl={6}>
                                    <Form.Label>Test Category</Form.Label>
                                    <SpkSelect
                                        name="category"
                                        option={CategoryOptions}
                                        mainClass="basic-multi-select"
                                        menuplacement='auto'
                                        classNameprefix="Select2"
                                        placeholder="Select Category"
                                    />
                                </Col>
                                <Col xl={6}>
                                    <Form.Label>Priority</Form.Label>
                                    <SpkSelect
                                        name="priority"
                                        option={PriorityOptions}
                                        mainClass="basic-multi-select"
                                        menuplacement='auto'
                                        classNameprefix="Select2"
                                        placeholder="Select Priority"
                                    />
                                </Col>

                                {/* Test ID & Duration */}
                                <Col xl={6}>
                                    <Form.Label htmlFor="test-id">Test ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="test-id"
                                        placeholder="TC001"
                                    />
                                </Col>
                                <Col xl={6}>
                                    <Form.Label htmlFor="estimated-duration">Estimated Duration (minutes)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="estimated-duration"
                                        placeholder="5"
                                    />
                                </Col>

                                {/* Test Objective */}
                                <Col xl={12}>
                                    <Form.Label htmlFor="test-objective">Test Objective</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        id="test-objective"
                                        rows={2}
                                        placeholder="What is this test trying to verify?"
                                    />
                                </Col>

                                {/* Pre-conditions */}
                                <Col xl={12}>
                                    <Form.Label htmlFor="preconditions">Pre-conditions</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        id="preconditions"
                                        rows={2}
                                        placeholder="What needs to be set up before running this test?"
                                    />
                                </Col>

                                {/* Test Steps - Rich Text Editor */}
                                <Col xl={12}>
                                    <Form.Label>Test Steps</Form.Label>
                                    <div id="test-steps-editor">
                                        <SpkSunEditor
                                            height="250px"
                                            defaulContent={defaultTestSteps}
                                        />
                                    </div>
                                    <Form.Label className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Provide detailed step-by-step instructions
                                    </Form.Label>
                                </Col>

                                {/* Expected Results - Rich Text Editor */}
                                <Col xl={12}>
                                    <Form.Label>Expected Results</Form.Label>
                                    <div id="expected-results-editor">
                                        <SpkSunEditor
                                            height="200px"
                                            defaulContent={defaultExpectedResults}
                                        />
                                    </div>
                                </Col>

                                {/* Additional Notes */}
                                <Col xl={12}>
                                    <Form.Label htmlFor="notes">Additional Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        id="notes"
                                        rows={3}
                                        placeholder="Any additional information, edge cases, or dependencies..."
                                    />
                                </Col>

                                {/* Created Date & Status */}
                                <Col xl={6} className="custom-picker">
                                    <Form.Label>Created Date</Form.Label>
                                    <SpkDatepickr
                                        className="form-control flatpickr-input"
                                        selected={dates["createdDate"] ? new Date(dates["createdDate"]) : null}
                                        onChange={(date: Date | null) => handleDateChange("createdDate", date)}
                                        placeholderText="Select date"
                                    />
                                </Col>
                                <Col xl={6}>
                                    <Form.Label>Status</Form.Label>
                                    <SpkSelect
                                        name="status"
                                        option={StatusOptions}
                                        mainClass="basic-multi-select"
                                        menuplacement='auto'
                                        classNameprefix="Select2"
                                        placeholder="Select Status"
                                    />
                                </Col>

                                {/* Assignee & Tags */}
                                <Col xl={6}>
                                    <Form.Label>Assignee</Form.Label>
                                    <SpkSelect
                                        name="assignee"
                                        option={AssigneeOptions}
                                        mainClass="basic-multi-select"
                                        menuplacement='auto'
                                        classNameprefix="Select2"
                                        placeholder="Assign To"
                                    />
                                </Col>
                                <Col xl={6}>
                                    <Form.Label htmlFor="tags">Tags</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="tags"
                                        placeholder="login, authentication, critical"
                                    />
                                    <Form.Label htmlFor="tags" className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Separate tags with commas
                                    </Form.Label>
                                </Col>

                                {/* Attachments */}
                                <Col xl={12}>
                                    <Form.Label>Attachments</Form.Label>
                                    <FilePond
                                        className="multiple-filepond"
                                        files={files['attachments'] || []}
                                        onupdatefiles={(fileItems) => handleFileUpdate(fileItems, 'attachments')}
                                        allowMultiple={true}
                                        maxFiles={6}
                                        server="/api"
                                        name="files"
                                        labelIdle='Drag & Drop screenshots, logs, or test data files here or <span class="filepond--label-action">Browse</span>'
                                    />
                                    <Form.Label className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        Upload screenshots, logs, or test data files (max 6 files)
                                    </Form.Label>
                                </Col>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <SpkButton
                                Buttonvariant=""
                                Customclass="btn btn-primary-light btn-wave ms-auto float-end"
                            >
                                Create Test Case
                            </SpkButton>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End:: row-1 --> */}

        </Fragment>
    )
};

export default AddTest;
