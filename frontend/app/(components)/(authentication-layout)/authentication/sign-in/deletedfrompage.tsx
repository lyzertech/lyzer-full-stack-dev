<div className="text-center my-3 authentication-barrier">
                    <span className="op-4 fs-13">OR</span>
                  </div>
                  <div className="d-grid mb-3">
                    <SpkButton
                      Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3"
                      onClickfunc={handleGoogleLogin}
                      Disabled={loading}
                    >
                      <span
                        className="avatar avatar-xs"
                        style={{ position: 'relative' }}
                      >
                        <Image
                          fill
                          src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/apps/google.png`}
                          alt=""
                        />
                      </span>
                      <span className="lh-1 ms-2 fs-13 text-default fw-medium">
                        Sign in with Google
                      </span>
                    </SpkButton>
                    <SpkButton
                      Customclass="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill"
                      onClickfunc={handleFacebookLogin}
                      Disabled={loading}
                    >
                      <span
                        className="avatar avatar-xs"
                        style={{ position: 'relative' }}
                      >
                        <Image
                          fill
                          src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/media/apps/facebook.png`}
                          alt=""
                        />
                      </span>
                      <span className="lh-1 ms-2 fs-13 text-default fw-medium">
                        Sign in with Facebook
                      </span>
                    </SpkButton>
                  </div>
                  <div className="text-center mt-3 fw-medium">
                    Don't have an account?{' '}
                    <Link
                      scroll={false}
                      href="/authentication/sign-up"
                      className="text-primary"
                    >
                      Sign Up
                    </Link>
                  </div>