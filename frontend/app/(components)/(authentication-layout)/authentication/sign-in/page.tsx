'use client'

import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import Seo from '@/shared/layouts-components/seo/seo'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Fragment, useState } from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { toast, ToastContainer } from 'react-toastify'
import { useAuth } from '@/shared/auth/AuthContext'
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute'
import { basePath } from '@/next.config'

const SignIn: React.FC = () => {
  const [values, setValues] = useState<any>({
    email: '',
    password: '',
    showPassword: false,
    rememberMe: false,
  })

  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle, loginWithFacebook } = useAuth()
  const router = useRouter()

  const validate = () => {
    const newErrors: any = {}

    // Email validation
    if (!values.email) {
      newErrors.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Invalid email format.'
    }

    // Password validation
    if (!values.password) {
      newErrors.password = 'Password is required.'
    } else if (values.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await login(values.email, values.password)

      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/school/dashboard/')
      }, 1500)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
      })
      setTimeout(() => {
        router.push('/school/dashboard/')
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      setLoading(true)
      await loginWithFacebook()
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
      })
      setTimeout(() => {
        router.push('/school/dashboard/')
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Facebook', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <Fragment>
        <Seo title="Sign In" />

        <div
          className="authentication-basic-background"
          style={{ position: 'relative' }}
        >
          <Image
            fill
            src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/backgrounds/9.png`}
            alt=""
          />
        </div>

        <div className="container">
          <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
            <Col xxl={4} xl={5} lg={6} md={6} sm={8} className="col-12">
              <Card className="custom-card border-0 my-4">
                <Card.Body className="p-5">
                  <div className="mb-4">
                    <Link
                      scroll={false}
                      href="/dashboards/sales"
                      style={{ position: 'relative', display: 'block' }}
                    >
                      <Image
                        fill
                        src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/brand-logos/toggle-logo.png`}
                        alt="logo"
                        className="desktop-dark"
                      />
                    </Link>
                  </div>
                  <div>
                    <h4 className="mb-1 fw-semibold">Hi, Welcome back!</h4>
                    <p className="mb-4 text-muted fw-normal">
                      Please enter your credentials
                    </p>
                  </div>
                  {errors.submit && (
                    <div className="alert alert-danger" role="alert">
                      {errors.submit}
                    </div>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                      <Col xl={12}>
                        <Form.Label
                          htmlFor="signin-email"
                          className="text-default"
                        >
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          className="form-control"
                          id="signin-email"
                          placeholder="Enter Email ID"
                          value={values.email}
                          onChange={(e) =>
                            setValues({ ...values, email: e.target.value })
                          }
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Col>
                      <Col xl={12} className="mb-2">
                        <Form.Label
                          htmlFor="signin-password"
                          className="text-default d-block"
                        >
                          Password
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={values.showPassword ? 'text' : 'password'}
                            className="form-control"
                            id="signin-password"
                            placeholder="Password"
                            value={values.password}
                            onChange={(e) =>
                              setValues({ ...values, password: e.target.value })
                            }
                            isInvalid={!!errors.password}
                          />
                          <Link
                            scroll={false}
                            href="#!"
                            className="show-password-button text-muted"
                            onClick={() =>
                              setValues((prev: any) => ({
                                ...prev,
                                showPassword: !prev.showPassword,
                              }))
                            }
                          >
                            {values.showPassword ? (
                              <i className="ri-eye-line align-middle"></i>
                            ) : (
                              <i className="ri-eye-off-line align-middle"></i>
                            )}
                          </Link>
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </div>
                        <div className="mt-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="rememberMe"
                              checked={values.rememberMe}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  rememberMe: e.target.checked,
                                })
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="rememberMe"
                            >
                              Remember me
                            </label>
                            <Link
                              scroll={false}
                              href="/authentication/reset-password"
                              className="float-end link-danger fw-medium fs-12"
                            >
                              Forget password ?
                            </Link>
                          </div>
                        </div>
                      </Col>
                    </div>
                    <div className="d-grid mt-3">
                      <SpkButton
                        Buttontype="submit"
                        Customclass={`btn btn-primary ${loading ? 'disabled' : ''}`}
                        Disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className="fa fa-spinner fa-spin me-2"></i>{' '}
                            Signing In...
                          </>
                        ) : (
                          <>
                            <i className="ri-login-circle-line me-2"></i> Sign
                            In
                          </>
                        )}
                      </SpkButton>
                    </div>
                  </Form>
                  
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
        <ToastContainer />
      </Fragment>
    </ProtectedRoute>
  )
}

export default SignIn
