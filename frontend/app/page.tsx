"use client"

import { basePath } from '@/next.config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useState, useEffect } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import Seo from '@/shared/layouts-components/seo/seo';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import ParticleCard from '@/shared/data/authentication/particles';
import { useAuth } from '@/shared/auth/AuthContext';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';

const SignIn = () => {
  const [values, setValues] = useState({
    email: '',
    password: '',
    rememberMe: true,
    showPassword: false
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const router = useRouter();

  const changeHandler = (e: any) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic client-side validation
    if (!values.email || !values.password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const user = await login(values.email, values.password);

      toast.success('Login successful', {
        position: 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect handled by ProtectedRoute, but explicit push is safer for UX delay
      setTimeout(() => {
        if (user && user.role === 'finance') {
          router.push('/finance/dashboard');
        } else if (user && user.role === 'school') {
          router.push('/school/dashboard');
        } else if (user && user.role === 'monitoring') {
          router.push('/monitoring/analysis');
        } else {
          router.push('/monitoring/analysis');
        }
      }, 1000);

    } catch (err: any) {
      const errorMessage = err.message || 'Invalid login credentials';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const user = await loginWithGoogle();
      toast.success('Login successful', {
        position: 'top-right',
        autoClose: 1500,
      });
      setTimeout(() => {
        if (user && user.role === 'finance') {
          router.push('/finance/dashboard');
        } else if (user && user.role === 'school') {
          router.push('/school/dashboard');
        } else {
          router.push('/dashboards/sales');
        }
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Google', {
        position: 'top-right',
        autoClose: 1500,
      });
      setLoading(false);
    }
  };

  // Handle Facebook login
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      const user = await loginWithFacebook();
      toast.success('Login successful', {
        position: 'top-right',
        autoClose: 1500,
      });
      setTimeout(() => {
        if (user && user.role === 'finance') {
          router.push('/finance/dashboard');
        } else if (user && user.role === 'school') {
          router.push('/school/dashboard');
        } else {
          router.push('/dashboards/sales');
        }
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Facebook', {
        position: 'top-right',
        autoClose: 1500,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const body = document.body
    body.classList.add("authentication-background");
    return () => {
      body.classList.remove("authentication-background");
    };
  }, []);

  return (
    <ProtectedRoute requireAuth={false}>
      <Fragment>
        <Seo title={"Sign In"} />
        <ParticleCard />
        <div className="container">
          <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
            <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
              <Card className="custom-card border-0 my-4">
                <Card.Body className="p-5">
                  <div className="mb-4">
                    <Link scroll={false} href="/dashboards/sales" style={{ position: 'relative', display: 'block' }}>
                      <Image fill src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/brand-logos/toggle-logo.png`} alt="logo" className="desktop-dark" />
                    </Link>
                  </div>
                  <div>
                    <h4 className="mb-1 fw-semibold">Hi, Welcome back!</h4>
                    <p className="mb-4 text-muted fw-normal">Please enter your credentials to sign in.</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                      {error}
                    </div>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Row className="gy-3">
                      <Col xl={12}>
                        <Form.Label htmlFor="signin-email" className="text-default">Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          className="form-control"
                          id="signin-email"
                          placeholder="Enter your email"
                          value={values.email}
                          onChange={changeHandler}
                          required
                        />
                      </Col>
                      <Col xl={12} className="mb-2">
                        <Form.Label htmlFor="signin-password" className="text-default d-block">Password</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            name="password"
                            type={values.showPassword ? 'text' : 'password'}
                            value={values.password}
                            onChange={changeHandler}
                            className="form-control"
                            id="signin-password"
                            placeholder="password"
                            required
                          />
                          <Link scroll={false} href="#!" onClick={togglePasswordVisibility} className="show-password-button text-muted" id="button-addon2">
                            <i className={`${values.showPassword ? 'ri-eye-line' : 'ri-eye-off-line'} align-middle`}></i>
                          </Link>
                        </div>
                        <div className="mt-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="defaultCheck1"
                              checked={values.rememberMe}
                              onChange={(e) => setValues({ ...values, rememberMe: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="defaultCheck1">
                              Remember me
                            </label>
                            <Link scroll={false} href="/authentication/reset-password/basic" className="float-end link-danger fw-medium fs-12">Forgot password ?</Link>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div className="d-grid mt-3">
                      <SpkButton
                        Buttontype="submit"
                        Customclass={`btn btn-primary ${loading ? 'disabled' : ''}`}
                        Disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className="fa fa-spinner fa-spin me-2"></i> Signing In...
                          </>
                        ) : (
                          <>
                            <i className="ri-login-circle-line me-2"></i> Sign In
                          </>
                        )}
                      </SpkButton>
                    </div>
                  </Form>

                  {/* <div className="text-center my-3 authentication-barrier">
                    <span className="op-4 fs-13">OR</span>
                  </div>

                  <div className="d-grid mb-3">
                    <SpkButton Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3" onClickfunc={handleGoogleLogin}>
                      <span className="avatar avatar-xs" style={{ position: 'relative' }}>
                        <Image fill src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/apps/google.png`} alt="" />
                      </span>
                      <span className="lh-1 ms-2 fs-13 text-default fw-medium">Sign in with Google</span>
                    </SpkButton>
                    <SpkButton Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill" onClickfunc={handleFacebookLogin}>
                      <span className="avatar avatar-xs" style={{ position: 'relative' }}>
                        <Image fill src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/apps/facebook.png`} alt="" />
                      </span>
                      <span className="lh-1 ms-2 fs-13 text-default fw-medium">Sign in with Facebook</span>
                    </SpkButton>
                  </div>

                  <div className="text-center mt-3 fw-medium">
                    Dont have an account? <Link scroll={false} href="/authentication/sign-up" className="text-primary">Sign up</Link>
                  </div> */}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Fragment>
    </ProtectedRoute>
  )
}

export default SignIn;