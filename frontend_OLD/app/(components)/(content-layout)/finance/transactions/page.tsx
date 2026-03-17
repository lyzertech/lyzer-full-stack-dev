"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Transaction {
  id: number;
  title: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  date: string;
}

interface PaginatedResponse {
  data: Transaction[];
  current_page: number;
  last_page: number;
  total: number;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse>("transactions")
      .then((res) => setTransactions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatIDR = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          <nav>
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">Finance</li>
              <li className="breadcrumb-item active">Transactions</li>
            </ol>
          </nav>
          <h1 className="page-title fw-medium fs-18 mb-0">Transactions</h1>
        </div>
        <button className="btn btn-primary">
          <i className="ri-add-line me-1" /> New Transaction
        </button>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card custom-card">
            <div className="card-header">
              <h6 className="card-title mb-0">All Transactions</h6>
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
                        <th>Title</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.id}</td>
                            <td>{tx.title}</td>
                            <td>
                              <span className={`badge bg-${tx.type === "income" ? "success" : "danger"}-transparent text-${tx.type === "income" ? "success" : "danger"}`}>
                                {tx.type}
                              </span>
                            </td>
                            <td>{formatIDR(tx.amount)}</td>
                            <td>{tx.date}</td>
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

export default TransactionsPage;
