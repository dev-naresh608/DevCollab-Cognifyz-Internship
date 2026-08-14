import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "./LoadingSpinner.jsx";

export const ProtectedRoute = () => {
  const { user, authLoading } = useSelector((state) => state.auth);

  if (authLoading) {
    return <LoadingSpinner label="Authenticating session..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
