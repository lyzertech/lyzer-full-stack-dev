"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Student {
  id: number;
  name: string;
  student_id: string;
  gender: "male" | "female";
  date_of_birth: string;
  class: string;
  email: string | null;
  phone: string | null;
}

interface PaginatedResponse {
  data: Student[];
  total: number;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse>("students")
      .then((res) => setStudents(res.data))
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
              <li className="breadcrumb-item active">Students</li>
            </ol>
          </nav>
          <h1 className="page-title fw-medium fs-18 mb-0">Students</h1>
        </div>
        <button className="btn btn-primary">
          <i className="ri-user-add-line me-1" /> Add Student
        </button>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card custom-card">
            <div className="card-header">
              <h6 className="card-title mb-0">Student List</h6>
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
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Class</th>
                        <th>Date of Birth</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        students.map((s) => (
                          <tr key={s.id}>
                            <td>{s.student_id}</td>
                            <td>{s.name}</td>
                            <td>
                              <span className={`badge bg-${s.gender === "male" ? "info" : "pink"}-transparent`}>
                                {s.gender}
                              </span>
                            </td>
                            <td>{s.class}</td>
                            <td>{s.date_of_birth}</td>
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

export default StudentsPage;
