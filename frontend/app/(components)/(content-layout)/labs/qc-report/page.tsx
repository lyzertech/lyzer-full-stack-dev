"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface QcReport {
  id: number;
  sample_id: string;
  test_name: string;
  result: "pass" | "fail" | "pending";
  notes: string | null;
  tested_at: string;
}

interface PaginatedResponse {
  data: QcReport[];
  total: number;
}

const resultColor = {
  pass: "success",
  fail: "danger",
  pending: "warning",
} as const;

const QcReportPage = () => {
  const [reports, setReports] = useState<QcReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse>("qc-reports")
      .then((res) => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          <nav>
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">Labs</li>
              <li className="breadcrumb-item active">QC Reports</li>
            </ol>
          </nav>
          <h1 className="page-title fw-medium fs-18 mb-0">QC Reports</h1>
        </div>
        <button className="btn btn-primary">
          <i className="ri-add-line me-1" /> New Report
        </button>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card custom-card">
            <div className="card-header">
              <h6 className="card-title mb-0">QC Report List</h6>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover text-nowrap">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Sample ID</th>
                        <th>Test Name</th>
                        <th>Result</th>
                        <th>Tested At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No QC reports found.
                          </td>
                        </tr>
                      ) : (
                        reports.map((rpt) => (
                          <tr key={rpt.id}>
                            <td>{rpt.id}</td>
                            <td>{rpt.sample_id}</td>
                            <td>{rpt.test_name}</td>
                            <td>
                              <span className={`badge bg-${resultColor[rpt.result]}-transparent text-${resultColor[rpt.result]}`}>
                                {rpt.result}
                              </span>
                            </td>
                            <td>{new Date(rpt.tested_at).toLocaleString()}</td>
                            <td>
                              <button className="btn btn-sm btn-primary-light me-1">
                                <i className="ri-edit-line" />
                              </button>
                              <button className="btn btn-sm btn-danger-light">
                                <i className="ri-delete-bin-line" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QcReportPage;
