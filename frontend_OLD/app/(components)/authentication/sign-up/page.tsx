"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/shared/auth/AuthContext";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";
import { basePath } from "@/next.config";

const SignUp: React.FC = () => {

    const [values, setValues] = useState<any>({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        showPassword: false,
        showConfirmPassword: false
    });

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
    const router = useRouter();

    const validate = () => {
        const newErrors: any = {};

        // Display name validation (optional)
        if (values.displayName && values.displayName.length < 2) {
            newErrors.displayName = "Display name must be at least 2 characters.";
        }

        // Email validation
        if (!values.email) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = "Invalid email format.";
        }

        // Password validation
        if (!values.password) {
            newErrors.password = "Password is required.";
        } else if (values.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        // Confirm password validation
        if (!values.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (values.password !== values.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await signup(values.email, values.password, values.displayName || undefined);

            toast.success('Account created successfully! Please log in with your credentials.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Redirect to login page - user needs to sign in with their credentials
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to create account';
            setErrors({ submit: errorMessage });
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setLoading(true);
            await loginWithGoogle();
            toast.success('Account created successfully! Please log in with your credentials.', {
                position: 'top-right',
                autoClose: 3000,
            });
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign up with Google', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignup = async () => {
        try {
            setLoading(true);
            await loginWithFacebook();
            toast.success('Account created successfully! Please log in with your credentials.', {
                position: 'top-right',
                autoClose: 3000,
            });
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign up with Facebook', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <ProtectedRoute requireAuth={false}>
            <Fragment>
                <Seo title="Sign Up" />

                {/* <div className="authentication-basic-background" style={{ position: 'relative' }}>
                    <Image fill src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/backgrounds/9.png`} alt="" />
                </div> */}

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
                                        <h4 className="mb-1 fw-semibold">Sign Up</h4>
                                        <p className="mb-4 text-muted fw-normal">Join us by creating a free account !</p>
                                    </div>
                                    {errors.submit && (
                                        <div className="alert alert-danger" role="alert">
                                            {errors.submit}
                                        </div>
                                    )}
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="gy-3">
                                            <Col xl={12}>
                                                <Form.Label htmlFor="signup-displayname" className="text-default">Display Name (Optional)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="form-control"
                                                    id="signup-displayname"
                                                    placeholder="Enter your name"
                                                    value={values.displayName}
                                                    onChange={(e) => setValues({ ...values, displayName: e.target.value })}
                                                    isInvalid={!!errors.displayName}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.displayName}</Form.Control.Feedback>
                                            </Col>
                                            <Col xl={12}>
                                                <Form.Label htmlFor="signup-email" className="text-default">Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    className="form-control"
                                                    id="signup-email"
                                                    placeholder="Enter Email ID"
                                                    value={values.email}
                                                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                                                    isInvalid={!!errors.email}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                            </Col>
                                            <Col xl={12}>
                                                <Form.Label htmlFor="signup-password" className="text-default d-block">Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={values.showPassword ? "text" : "password"}
                                                        className="form-control"
                                                        id="signup-password"
                                                        placeholder="Password"
                                                        value={values.password}
                                                        onChange={(e) => setValues({ ...values, password: e.target.value })}
                                                        isInvalid={!!errors.password}
                                                    />
                                                    <Link scroll={false} href="#!" className="show-password-button text-muted"
                                                        onClick={() => setValues((prev: any) => ({ ...prev, showPassword: !prev.showPassword }))}>
                                                        {values.showPassword ? (
                                                            <i className="ri-eye-line align-middle"></i>
                                                        ) : (
                                                            <i className="ri-eye-off-line align-middle"></i>
                                                        )}
                                                    </Link>
                                                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                                </div>
                                            </Col>
                                            <Col xl={12} className="mb-2">
                                                <Form.Label htmlFor="signup-confirm-password" className="text-default d-block">Confirm Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={values.showConfirmPassword ? "text" : "password"}
                                                        className="form-control"
                                                        id="signup-confirm-password"
                                                        placeholder="Confirm Password"
                                                        value={values.confirmPassword}
                                                        onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })}
                                                        isInvalid={!!errors.confirmPassword}
                                                    />
                                                    <Link scroll={false} href="#!" className="show-password-button text-muted"
                                                        onClick={() => setValues((prev: any) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}>
                                                        {values.showConfirmPassword ? (
                                                            <i className="ri-eye-line align-middle"></i>
                                                        ) : (
                                                            <i className="ri-eye-off-line align-middle"></i>
                                                        )}
                                                    </Link>
                                                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
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
                                                        <i className="fa fa-spinner fa-spin me-2"></i> Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-user-add-line me-2"></i> Sign Up
                                                    </>
                                                )}
                                            </SpkButton>
                                        </div>
                                    </Form>
                                    <div className="text-center my-3 authentication-barrier">
                                        <span className="op-4 fs-13">OR</span>
                                    </div>
                                    <div className="d-grid mb-3">
                                        <SpkButton
                                            Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3"
                                            onClickfunc={handleGoogleSignup}
                                            Disabled={loading}
                                        >
                                            <span className="avatar avatar-xs" style={{ position: 'relative' }}>
                                                <Image fill src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/apps/google.png`} alt="" />
                                            </span>
                                            <span className="lh-1 ms-2 fs-13 text-default fw-medium">Signup with Google</span>
                                        </SpkButton>
                                        <SpkButton
                                            Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill"
                                            onClickfunc={handleFacebookSignup}
                                            Disabled={loading}
                                        >
                                            <span className="avatar avatar-xs" style={{ position: 'relative' }}>
                                                <Image fill src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/apps/facebook.png`} alt="" />
                                            </span>
                                            <span className="lh-1 ms-2 fs-13 text-default fw-medium">Signup with Facebook</span>
                                        </SpkButton>
                                    </div>
                                    <div className="text-center mt-3 fw-medium">
                                        Already have an account? <Link scroll={false} href="/authentication/sign-in" className="text-primary">Sign In</Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <ToastContainer />
            </Fragment>
        </ProtectedRoute>
    )
};

export default SignUp;

