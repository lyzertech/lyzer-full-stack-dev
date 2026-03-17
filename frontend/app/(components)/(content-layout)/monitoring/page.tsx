"use client"

import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment } from "react";
import MonitoringDashboard from "./MonitoringDashboard";

interface MonitoringPageProps { }

const MonitoringPage: React.FC<MonitoringPageProps> = () => {
    return (
        <Fragment>
            {/* Page Header */}
            <Seo title="IIoT Monitoring Dashboard" />

            <Pageheader
                title="Monitoring"
                subtitle="IIoT Dashboard"
                currentpage="Real-time Electrical Monitoring"
                activepage="Monitoring"
            />
            {/* Page Header Close */}

            {/* Main Dashboard */}
            <MonitoringDashboard />
        </Fragment>
    );
};

export default MonitoringPage;
