# UI Templates — Dashboard Pages Reference

This document provides **complete code templates** for creating new dashboard pages based on existing patterns in [`app/(components)/(content-layout)/dashboards`](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards).

> **Purpose**: Use these templates as a starting point when building new dashboard pages, list views, or form pages to ensure consistency across the application.

---

## 📚 Table of Contents

1. [Dashboard Page Template](#dashboard-page-template)
2. [List/Table Page Template](#listtable-page-template)
3. [Form/Add Page Template](#formadd-page-template)
4. [Common Patterns](#common-patterns)
5. [Component Reference](#component-reference)

---

## Dashboard Page Template

**Use Case**: Main dashboard overview with cards, charts, and tables

**Reference Files**:
- [ecommerce/dashboard/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards/ecommerce/dashboard/page.tsx)
- [crm/dashboard/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards/crm/dashboard/page.tsx)
- [jobs/dashboard/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards/jobs/dashboard/page.tsx)

### Template Structure

```tsx
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

interface DashboardProps { }

const Dashboard: React.FC<DashboardProps> = () => {

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Your-Dashboard-Title" />

            <Pageheader 
                title="Dashboards" 
                subtitle="Your Module" 
                currentpage="Dashboard" 
                activepage="Dashboard" 
            />

            {/* <!-- Page Header Close --> */}

            {/* <!-- Start:: row-1 --> */}

            <Row>
                <Col xxl={6}>
                    {/* Stat Cards Section */}
                    <Row>
                        {/* Map through stat cards */}
                    </Row>
                </Col>
                
                <Col xxl={6}>
                    {/* Charts or Additional Cards */}
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">
                                Chart Title
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {/* Chart component */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End:: row-1 --> */}

            {/* <!-- Start:: row-2 --> */}

            <Row>
                <Col xl={12}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header className="justify-content-between">
                            <div className="card-title">
                                Data Table Title
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {/* Filters and search */}
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <SpkTables 
                                    tableClass="text-nowrap" 
                                    header={[
                                        { title: 'Column 1' }, 
                                        { title: 'Column 2' }
                                    ]}
                                >
                                    {/* Table rows */}
                                </SpkTables>
                            </div>
                        </Card.Body>
                        <Card.Footer className="border-top-0">
                            <div className="d-flex align-items-center flex-wrap">
                                <div> Showing 6 Entries <i className="bi bi-arrow-right ms-2 fw-semibold"></i> </div>
                                <div className="ms-auto">
                                    <nav aria-label="Page navigation" className="pagination-style-2">
                                        <Pagination className="mb-0 flex-wrap">
                                            <Pagination.Prev disabled>Prev</Pagination.Prev>
                                            <Pagination.Item active>1</Pagination.Item>
                                            <Pagination.Item>2</Pagination.Item>
                                            <Pagination.Next className="text-primary">Next</Pagination.Next>
                                        </Pagination>
                                    </nav>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End:: row-2 --> */}

        </Fragment>
    )
};

export default Dashboard;
```

### Key Patterns

1. **Always "use client" directive** - All dashboard pages are client components
2. **SEO + Pageheader** - Must be first elements in Fragment
3. **Fragment wrapper** - Wrap entire page content
4. **Row/Col grid system** - Use Bootstrap grid (xxl, xl, lg, md, sm)
5. **Card structure** - `Card > Card.Header > Card.Body > Card.Footer`
6. **Pagination** - Standard pattern in Footer for tables

---

## List/Table Page Template

**Use Case**: Product lists, customer lists, inventory pages with filters

**Reference**: [ecommerce/products/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards/ecommerce/products/page.tsx)

### Template Structure

```tsx
"use client"

import SpkListCard from "@/shared/@spk-reusable-components/application-reusable/spk-listcard";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";

interface ListPageProps { }

const ListPage: React.FC<ListPageProps> = () => {

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Your-List-Title" />

            <Pageheader 
                title="Your Module" 
                subtitle="List" 
                currentpage="Items" 
                activepage="Items" 
            />

            {/* <!-- Page Header Close --> */}

            {/* <!-- Start::row-1 --> */}

            <Row className="row-cols-xxl-5 row-cols-md-3 row-cols-1">
                {/* Stat cards if needed */}
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
                                    placeholder="Search..." 
                                    aria-label="search-item" 
                                />
                            </div>

                            {/* <!-- Filters Section --> */}

                            <Row className="gy-2 w-sm-50">
                                
                                {/* <!-- Filter 1 --> */}
                                <div className="col custom-products-select">
                                    <SpkSelect 
                                        option={FilterOptions} 
                                        placeholder="Filter 1" 
                                        name="filter-1" 
                                        id="filter-1" 
                                        classNameprefix="Select2" 
                                    />
                                </div>

                                {/* <!-- Filter 2 --> */}
                                <div className="col custom-products-select">
                                    <SpkSelect 
                                        option={FilterOptions2} 
                                        placeholder="Filter 2" 
                                        name="filter-2" 
                                        id="filter-2" 
                                        classNameprefix="Select2" 
                                    />
                                </div>

                            </Row>
                        </Card.Header>

                        {/* <!-- Table inside the card-body --> */}

                        <Card.Body className="p-0">
                            <div id="data-table" className="grid-card-table">
                                {/* Your table component or data grid */}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End::row-2 --> */}

        </Fragment>
    )
};

export default ListPage;
```

### Key Patterns

1. **Search + Filters in Header** - Standard layout with search left, filters right
2. **w-sm-25 / w-sm-50** - Responsive width classes for layout
3. **SpkSelect for dropdowns** - Use custom select component
4. **border-bottom-0** - Remove border when body has table
5. **p-0 on Card.Body** - When containing full-width tables

---

## Form/Add Page Template

**Use Case**: Add new items, edit forms, multi-step forms

**Reference**: [ecommerce/add-product/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards/ecommerce/add-product/page.tsx)

### Template Structure

```tsx
"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDatepickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-datepicker";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { FilePond } from "react-filepond";

interface AddFormProps { }

const AddForm: React.FC<AddFormProps> = () => {

    const [files, setFiles] = useState<any>([]);
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

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Add-New-Item" />

            <Pageheader 
                title="Your Module" 
                subtitle="Form" 
                currentpage="Add Item" 
                activepage="Add Item" 
            />

            {/* <!-- Page Header Close --> */}

            {/* <!-- Start:: row-1 --> */}

            <Row>
                {/* Sidebar Section - Metadata, Images, etc. */}
                <Col xl={3}>
                    <Row>
                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header>
                                    <div className="card-title">
                                        Upload Images
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <FilePond 
                                        className="multiple-filepond" 
                                        files={files} 
                                        onupdatefiles={setFiles} 
                                        allowMultiple={true} 
                                        maxFiles={6} 
                                        server="/api" 
                                        name="files" 
                                        labelIdle='Drag & Drop your file here or click' 
                                    />
                                    <label className="form-label text-muted mt-1 fs-13 mb-0 fw-normal">
                                        Upload instructions here
                                    </label>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header>
                                    <div className="card-title">
                                        Additional Details
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="gy-2">
                                        <Col xl={12} className="custom-picker">
                                            <Form.Label htmlFor="date-field">Date</Form.Label>
                                            <SpkDatepickr 
                                                className="form-control flatpickr-input" 
                                                selected={dates["startDate"] ? new Date(dates["startDate"]) : null} 
                                                onChange={(date: Date | null) => handleDateChange("startDate", date)} 
                                            />
                                        </Col>
                                        
                                        <Col xl={12}>
                                            <Form.Label htmlFor="select-field">Status</Form.Label>
                                            <SpkSelect 
                                                name="status" 
                                                option={StatusOptions} 
                                                mainClass="basic-multi-select" 
                                                menuplacement='auto' 
                                                classNameprefix="Select2" 
                                                placeholder="Select" 
                                            />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Main Form Section */}
                <Col xl={9}>
                    <Card className="custom-card shadow-none mb-0 border-0">
                        <Card.Body className="p-0">
                            <Row className="gy-3">
                                <Col xl={12}>
                                    <Form.Label htmlFor="item-name">Item Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        className="" 
                                        id="item-name" 
                                        placeholder="Name" 
                                    />
                                    <Form.Label htmlFor="item-name" className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Name should not exceed 30 characters
                                    </Form.Label>
                                </Col>

                                <Col xl={6}>
                                    <Form.Label htmlFor="category">Category</Form.Label>
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
                                    <Form.Label htmlFor="price">Price</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        className="" 
                                        id="price" 
                                        placeholder="Price" 
                                    />
                                </Col>

                                <Col xl={12}>
                                    <Form.Label htmlFor="description">Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        className="" 
                                        id="description" 
                                        rows={3} 
                                    />
                                    <Form.Label htmlFor="description" className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Description should not exceed 500 characters
                                    </Form.Label>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Action Buttons */}
                <div className="px-4 py-3 border-top border-block-start-dashed d-sm-flex justify-content-end mt-3">
                    <SpkButton 
                        Buttonvariant="primary-light" 
                        Customclass="me-2 mb-2 mb-sm-0"
                    >
                        Save Draft<i className="bi bi-save ms-2"></i>
                    </SpkButton>
                    <SpkButton 
                        Buttonvariant="success-light" 
                        Customclass="mb-2 mb-sm-0"
                    >
                        Submit<i className="bi bi-check-lg ms-2"></i>
                    </SpkButton>
                </div>
            </Row>

            {/* <!-- End:: row-1 --> */}

        </Fragment>
    )
};

export default AddForm;
```

### Key Patterns

1. **3-9 Column Layout** - Sidebar (xl={3}) for metadata, main form (xl={9})
2. **State Management** - Use useState for files, dates, form data
3. **FilePond for uploads** - Standard file upload component
4. **SpkDatepickr** - For date/time selection
5. **Helper text** - Use `fs-12 text-muted` for field hints
6. **Action buttons sticky footer** - Outside Row, at bottom
7. **shadow-none mb-0 border-0** - For main form card when it's borderless

---

## Form/Add Page Template (Projects Pattern) ⭐ NEW

**Use Case**: Premium single-card form with rich text editors and Card.Footer action buttons

**Reference Files**:
- [projects/create-project/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards/projects/create-project/page.tsx)
- [testing/add-test/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/testing/add-test/page.tsx)

**Best For**: Creating high-quality forms with complex content (test cases, project creation, detailed documentation)

### Complete Template

```tsx
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

interface CreateFormProps { }

const CreateForm: React.FC<CreateFormProps> = () => {

    // Date state management
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

    // File upload state management
    const [files, setFiles] = useState<{ [key: string]: File[] }>({});
    const handleFileUpdate = (fileItems: any, pondName: string) => {
        setFiles((prevFiles) => ({
            ...prevFiles,
            [pondName]: fileItems.map((fileItem: any) => fileItem.file),
        }));
    };

    // Dropdown options
    const CategoryOptions = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    const StatusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'inactive', label: 'Inactive' },
    ];

    // Default content for rich text editor (optional)
    const defaultContent = `<ol>
        <li>First step</li>
        <li>Second step</li>
        <li>Third step</li>
    </ol>`;

    return (
        <Fragment>

            {/* <!-- Page Header --> */}

            <Seo title="Create-Item" />

            <Pageheader
                title="Your Module"
                subtitle="Create"
                currentpage="Create Item"
                activepage="Module"
            />

            {/* <!-- Page Header Close --> */}

            {/* Header with Back Button */}
            <Row className="mb-3">
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-0">📝 Create New Item</h4>
                            <p className="text-muted mb-0">Fill in the details below</p>
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
                                Create Item
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="row gy-3">
                                {/* Basic Fields */}
                                <Col xl={12}>
                                    <Form.Label htmlFor="item-name">Item Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="item-name"
                                        placeholder="Enter item name"
                                    />
                                    <Form.Label htmlFor="item-name" className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Name should be descriptive and clear
                                    </Form.Label>
                                </Col>

                                {/* Dropdowns in 6-6 columns */}
                                <Col xl={6}>
                                    <Form.Label>Category</Form.Label>
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

                                {/* Textarea for description */}
                                <Col xl={12}>
                                    <Form.Label htmlFor="description">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        id="description"
                                        rows={3}
                                        placeholder="Enter description..."
                                    />
                                </Col>

                                {/* Rich Text Editor */}
                                <Col xl={12}>
                                    <Form.Label>Detailed Content</Form.Label>
                                    <div id="content-editor">
                                        <SpkSunEditor
                                            height="300px"
                                            defaulContent={defaultContent}
                                        />
                                    </div>
                                    <Form.Label className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        *Use the editor to format your content
                                    </Form.Label>
                                </Col>

                                {/* Date picker */}
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
                                    <Form.Label htmlFor="other-field">Other Field</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="other-field"
                                        placeholder="Enter value"
                                    />
                                </Col>

                                {/* File Upload */}
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
                                        labelIdle='Drag & Drop files here or <span class="filepond--label-action">Browse</span>'
                                    />
                                    <Form.Label className="mt-1 fs-12 fw-normal text-muted mb-0">
                                        Upload supporting files (max 6 files)
                                    </Form.Label>
                                </Col>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <SpkButton
                                Buttonvariant=""
                                Customclass="btn btn-primary-light btn-wave ms-auto float-end"
                            >
                                Create Item
                            </SpkButton>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* <!-- End:: row-1 --> */}

        </Fragment>
    )
};

export default CreateForm;
```

### Key Features of Projects Pattern ✨

1. **Engineering-Task Header with Back Button**
   - Title + description on left
   - Back button on right
   - Uses `window.history.back()`
   - `Button variant="outline-secondary"`

2. **Single Full-Width Card**
   - No sidebar clutter
   - Better readability
   - Professional appearance
   - All content in one cohesive unit

3. **Rich Text Editor Integration**
   - `SpkSunEditor` for complex content
   - Default content for guidance
   - 300px height recommendation
   - Helpful hints below

4. **Card.Footer for Actions**
   - Clean separation from form
   - Right-aligned button with `ms-auto float-end`
   - `btn-primary-light btn-wave` styling
   - Professional look matching high-quality dashboards

5. **Logical Field Organization**
   - Basic info first (name, category, status)
   - Descriptive fields next (description, rich content)
   - Metadata fields (dates, other fields)
   - Attachments last
   - Use `gy-3` for consistent vertical spacing

6. **State Management Patterns**
   - Date state with `handleDateChange` function
   - File state with `handleFileUpdate` function
   - Reusable state handlers

### When to Use This Pattern

✅ **Use Projects Pattern when:**
- Creating items with rich content (projects, test cases, documentation)
- Need professional, high-quality UI
- Want to match premium dashboard pages
- Form has complex fields requiring rich text editors
- Single-card layout provides better UX than sidebar

❌ **Don't use when:**
- You need heavy image/file uploads (use Ecommerce pattern instead)
- You want a preview sidebar (use NFT pattern instead)
- Form is very simple (use basic form template)

### Comparison with Other Patterns

| Pattern | Layout | Best For | Example |
|---------|--------|----------|---------|
| **Projects** ⭐ | Single card + footer | Rich content forms | Test cases, projects |
| **Ecommerce** | 3-9 sidebar | Heavy uploads + metadata | Products, inventory |
| **NFT** | 9-3 preview | Forms needing preview | NFTs, visual items |

---

## Common Patterns

### 1. **Stat Cards Pattern**

```tsx
<Row>
    {StatCards.map((item, index) => (
        <Col lg={6} md={6} sm={12} key={index}>
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
```

### 2. **Chart Card Pattern**

```tsx
<Card className="custom-card">
    <Card.Header>
        <div className="card-title">Chart Title</div>
    </Card.Header>
    <Card.Body>
        <div id="chart-container">
            <Spkapexcharts 
                height={320} 
                type="line" 
                width="100%" 
                chartOptions={ChartOptions} 
                chartSeries={ChartSeries} 
            />
        </div>
    </Card.Body>
</Card>
```

### 3. **Table with Avatar + Badge Pattern**

```tsx
<SpkTables 
    tableClass="text-nowrap" 
    header={[
        { title: 'User' }, 
        { title: 'Status' }, 
        { title: 'Actions' }
    ]}
>
    {items.map((item, index) => (
        <tr key={index}>
            <td>
                <div className="d-flex align-items-center gap-2">
                    <div className="lh-1">
                        <span className="avatar avatar-sm avatar-rounded">
                            <Image width={28} height={28} src={item.avatar} alt={item.name} />
                        </span>
                    </div>
                    <div>
                        <span className="fw-semibold">{item.name}</span>
                    </div>
                </div>
            </td>
            <td>
                <SpkBadge 
                    variant="" 
                    Customclass={`${item.statusClass}`}
                >
                    {item.status}
                </SpkBadge>
            </td>
            <td>
                <div className="btn-list">
                    <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-primary-light">
                        <i className="ti ti-edit"></i>
                    </SpkButton>
                    <SpkButton Buttonvariant="" Customclass="btn btn-icon btn-sm btn-danger-light">
                        <i className="ti ti-trash"></i>
                    </SpkButton>
                </div>
            </td>
        </tr>
    ))}
</SpkTables>
```

### 4. **Tab Pattern (Tasks/Activity)**

```tsx
<Tab.Container defaultActiveKey="tab1">
    <Card.Header className="justify-content-between">
        <div className="card-title">Tasks List</div>
        <Nav className="nav-tabs justify-content-end nav-tabs-header card-headertabs" role="tablist">
            <Nav.Item role="presentation">
                <Nav.Link eventKey="tab1">Today</Nav.Link>
            </Nav.Item>
            <Nav.Item role="presentation">
                <Nav.Link eventKey="tab2">Upcoming</Nav.Link>
            </Nav.Item>
        </Nav>
    </Card.Header>
    <Card.Body className="p-0">
        <Tab.Content>
            <Tab.Pane eventKey="tab1">
                {/* Tab 1 content */}
            </Tab.Pane>
            <Tab.Pane eventKey="tab2">
                {/* Tab 2 content */}
            </Tab.Pane>
        </Tab.Content>
    </Card.Body>
</Tab.Container>
```

### 5. **Dropdown Actions Pattern**

```tsx
<SpkDropdown 
    Id="dropdownMenuButton1" 
    Togglevariant="light" 
    Menulabel="dropdownMenuButton1" 
    Icon={true} 
    IconClass="fe fe-more-vertical" 
    Customtoggleclass="btn btn-icon btn-sm btn-light border no-caret"
>
    <Dropdown.Item as="li" href="#!">
        <i className="ri-eye-line me-2"></i>View
    </Dropdown.Item>
    <Dropdown.Item as="li" href="#!">
        <i className="ri-pencil-line me-2"></i>Edit
    </Dropdown.Item>
    <Dropdown.Item as="li" href="#!">
        <i className="ri-delete-bin-line me-2"></i>Delete
    </Dropdown.Item>
</SpkDropdown>
```

---

## Navigation Patterns

### **Back Button Pattern (Header Style)**

**Reference**: [labs/engineering-task/planning/page.tsx](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/labs/engineering-task/planning/page.tsx) (lines 183-211)

Back buttons should be integrated into a header section with page title and description, placed on the same row for a clean, professional look.

### **Standard Pattern - List/Table Pages**

**Use Case**: List pages, browse pages, kanban boards

```tsx
"use client"

import { Button, Card, Col, Form, Row } from "react-bootstrap";
import Link from "next/link";

const ListPage = () => {
    return (
        <Fragment>
            <Seo title="Your-Page-Title" />
            <Pageheader 
                title="Module" 
                subtitle="Page" 
                currentpage="Current" 
                activepage="Module" 
            />

            {/* Header with Back Button */}
            <Row className="mb-3">
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-0">🧪 Page Title</h4>
                            <p className="text-muted mb-0">Page description or subtitle</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Link href="/module/add">
                                <Button variant="primary">
                                    <i className="ri-add-line me-1"></i>
                                    Add New
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

            {/* Rest of page content */}
            <Row>
                {/* Your content here */}
            </Row>
        </Fragment>
    );
};
```

### **Standard Pattern - Add/Create/Edit Pages**

**Use Case**: Form pages, create pages, edit pages

```tsx
"use client"

import { Button, Card, Col, Form, Row } from "react-bootstrap";

const AddPage = () => {
    return (
        <Fragment>
            <Seo title="Add-New-Item" />
            <Pageheader 
                title="Module" 
                subtitle="Add Item" 
                currentpage="Add" 
                activepage="Module" 
            />

            {/* Header with Back Button */}
            <Row className="mb-3">
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-0">📝 Create New Item</h4>
                            <p className="text-muted mb-0">Fill in the details below</p>
                        </div>
                        <Button variant="outline-secondary" onClick={() => window.history.back()}>
                            <i className="ri-arrow-left-line me-1"></i>
                            Back
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Form Content */}
            <Row>
                {/* Your form here */}
            </Row>
        </Fragment>
    );
};
```

### **Key Patterns**

1. **Header Structure**
   - Always wrap in `<Row className="mb-3">` with `<Col xl={12}>`
   - Use `d-flex justify-content-between align-items-center` for layout
   - Left side: title + description
   - Right side: action buttons (primary actions + back button)

2. **Title & Description**
   - Title: `<h4 className="fw-bold mb-0">` with emoji for visual interest
   - Description: `<p className="text-muted mb-0">` for context

3. **Back Button Styling**
   - Always use `Button variant="outline-secondary"`
   - Use `window.history.back()` for navigation
   - Icon: `<i className="ri-arrow-left-line me-1"></i>`
   - Text: "Back" (simple and clear)

4. **Action Button Layout**
   - Use `d-flex gap-2` for consistent spacing
   - Primary actions (Add, Save, etc.) use `variant="primary"`
   - Back button always uses `variant="outline-secondary"`
   - Back button positioned last (rightmost)

### **With Filters Pattern**

**Use Case**: Pages with filters, search, and multiple actions

```tsx
{/* Header with Filters and Back Button */}
<Row className="mb-3">
    <Col xl={12}>
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h4 className="fw-bold mb-0">📊 Data Board</h4>
                <p className="text-muted mb-0">Manage and filter data</p>
            </div>
            <div className="d-flex gap-2">
                <Form.Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="all">All Items</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </Form.Select>
                <Button variant="primary" onClick={handleCreate}>
                    <i className="ri-add-line me-1"></i>
                    New Item
                </Button>
                <Button variant="outline-secondary" onClick={() => window.history.back()}>
                    <i className="ri-arrow-left-line me-1"></i>
                    Back
                </Button>
            </div>
        </div>
    </Col>
</Row>
```

### **Import Requirements**

```tsx
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import Link from "next/link"; // Only if using Link for buttons
```

### **Icon Options**

- **Back**: `ri-arrow-left-line`
- **Add**: `ri-add-line`
- **Save**: `ri-save-line`
- **Checkbox**: `ri-checkbox-circle-fill`

### **Do NOT Use**

❌ `router.back()` with `useRouter` from next/navigation  
❌ `SpkButton` with `onClick` prop (doesn't support onClick)  
❌ Standalone back button outside of header section  
❌ `btn-light` or `btn-sm` classes for back button

### **DO Use**

✅ `window.history.back()` for navigation  
✅ Native React Bootstrap `Button` component  
✅ `variant="outline-secondary"` for back buttons  
✅ Header section with title + description + actions

---

## Component Reference

### Essential SPK Components

| Component | Usage | Import Path |
|-----------|-------|-------------|
| **SpkBadge** | Status indicators, labels | `@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge` |
| **SpkButton** | All buttons | `@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons` |
| **SpkDropdown** | Dropdown menus | `@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown` |
| **SpkTables** | Data tables | `@/shared/@spk-reusable-components/reusable-tables/spk-tables` |
| **Spkapexcharts** | Charts/graphs | `@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts` |
| **SpkSelect** | Dropdown selects | `@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect` |
| **SpkDatepickr** | Date/time picker | `@/shared/@spk-reusable-components/reusable-plugins/spk-datepicker` |
| **SpkListCard** | List item cards | `@/shared/@spk-reusable-components/application-reusable/spk-listcard` |

### Layout Components

| Component | Usage | Import Path |
|-----------|-------|-------------|
| **Seo** | Page SEO metadata | `@/shared/layouts-components/seo/seo` |
| **Pageheader** | Page header breadcrumbs | `@/shared/layouts-components/pageheader/pageheader` |

### Bootstrap Components

Import from `react-bootstrap`:
- `Card`, `Col`, `Row`
- `Form`, `Button`
- `Dropdown`, `Nav`, `Tab`
- `Pagination`, `ListGroup`
- `Modal`, `Offcanvas`

---

## Standard CSS Classes

### Card Classes
- `custom-card` - Standard card styling
- `dashboard-main-card` - Dashboard stat card
- `custom-card overflow-hidden` - Card with hidden overflow

### Typography
- `card-title` - Card header title
- `fw-semibold` - Semi-bold font weight
- `text-muted` - Muted text color
- `fs-12`, `fs-13`, `fs-14` - Font sizes

### Layout
- `d-flex align-items-center gap-2` - Flex with centered alignment
- `justify-content-between` - Space between flex items
- `flex-fill` - Fill available flex space
- `lh-1` - Line height 1
- `mb-0`, `mt-2`, `py-3` - Margin/padding utilities

### Buttons
- `btn-wave` - Button wave animation
- `btn-primary-light` - Light primary button
- `btn-icon btn-sm` - Small icon button
- `btn-list` - Button group container

### Tables
- `text-nowrap` - Prevent text wrapping
- `table-responsive` - Responsive table wrapper
- `custom-data-table` - Custom table styling

---

## Quick Reference Checklist

When creating a new dashboard page, ensure:

- [ ] `"use client"` directive at top
- [ ] `<Seo title="..." />` with appropriate title
- [ ] `<Pageheader />` with title, subtitle, breadcrumbs
- [ ] `<Fragment>` wrapper around all content
- [ ] Proper imports from SPK components
- [ ] TypeScript interface for props (`interface YourPageProps { }`)
- [ ] Default export of component
- [ ] Comment sections with `{/* <!-- Section --> */}`
- [ ] Consistent spacing and formatting
- [ ] Use of custom-card class for all Card components
- [ ] Pagination for tables with many rows

---

## Related Documentation

- [NAMING_CONVENTIONS.md](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/docs/NAMING_CONVENTIONS.md) - File and component naming rules
- [UI_RULES.md](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/docs/UI_RULES.md) - UI rules for School pages
- **Example Dashboards**: Browse [`dashboards/`](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/app/(components)/(content-layout)/dashboards) for real implementations

---

**Last Updated**: 2026-02-07

**Maintainer**: Development Team
