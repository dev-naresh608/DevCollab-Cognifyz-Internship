import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { LoadingSpinner } from "./LoadingSpinner.jsx";
import { WorkspaceProvider } from "../../contexts/WorkspaceContext.jsx";

export const ProtectedRoute = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner label="Authenticating session..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
};
