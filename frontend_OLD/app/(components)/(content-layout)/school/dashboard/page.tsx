"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface DashboardData {
  total_students: number;
  active_classes: number;
  teachers: number;
  attendance_rate: string;
}

const SchoolDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          <nav>
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">School</li>
              <li className="breadcrumb-item active">Dashboard</li>
            </ol>
          </nav>
          <h1 className="page-title fw-medium fs-18 mb-0">School Dashboard</h1>
        </div>
      </div>

      <div className="row mt-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : data ? (
          <>
            {[
              { label: "Total Students", value: data.total_students, icon: "ri-user-star-line", color: "primary" },
              { label: "Active Classes", value: data.active_classes, icon: "ri-book-open-line", color: "info" },
              { label: "Teachers", value: data.teachers, icon: "ri-team-line", color: "success" },
              { label: "Attendance Rate", value: data.attendance_rate, icon: "ri-calendar-check-line", color: "warning" },
            ].map((card) => (
              <div className="col-xxl-3 col-xl-3 col-lg-6 col-md-6 col-sm-6" key={card.label}>
                <div className="card custom-card">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <span className="text-muted fs-12">{card.label}</span>
                        <h4 className="fw-semibold mt-1 mb-0">{card.value}</h4>
                      </div>
                      <div className={`avatar avatar-md bg-${card.color}-transparent rounded`}>
                        <i className={`${card.icon} fs-20 text-${card.color}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="col-12">
            <div className="alert alert-danger">Failed to load dashboard data.</div>
          </div>
        )}
      </div>
    </>
  );
};

export default SchoolDashboard;
