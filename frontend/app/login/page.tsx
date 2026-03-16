"use client";

import React, { useState } from "react";
import { authApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      // Redirect to module dashboard based on user role
      const role = data.user.role;
      if (role === "superadmin") {
        router.push("/finance/dashboard");
      } else {
        router.push(`/${role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Login — Lyzer</title>
      </head>
      <body className="authentication-background">
        <div className="container">
          <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
            <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-6 col-sm-8 col-12">
              <div className="my-5 d-flex justify-content-center">
                <a href="/">
                  <span className="fw-bold fs-22 text-primary">Lyzer</span>
                </a>
              </div>
              <div className="card custom-card">
                <div className="card-body p-5">
                  <p className="h5 fw-semibold mb-2 text-center">Sign In</p>
                  <p className="mb-4 text-muted text-center op-7 fw-normal">
                    Welcome back! Please enter your credentials.
                  </p>

                  {error && (
                    <div className="alert alert-danger py-2 fs-13">{error}</div>
                  )}

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@lyzer.test"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label d-flex justify-content-between">
                        <span>Password</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary d-grid w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : null}
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default LoginPage;
