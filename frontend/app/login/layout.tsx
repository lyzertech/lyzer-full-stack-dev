"use client";

import React, { Fragment, useEffect } from "react";

/**
 * Layout for the /login route.
 * Applies authentication-background body class and removes it on unmount.
 * Does NOT render html/body/head — those come from the root layout.
 */
const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.body.classList.add("authentication-background");
    return () => {
      document.body.classList.remove("authentication-background");
    };
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default LoginLayout;
