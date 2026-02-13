import React from "react";
import { Navigate, Outlet } from "react-router";
import AppLayout from "../layout/AppLayout";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <AppLayout>
      <Outlet /> {/*childeren routes of ProtectedRoute in app.jsx will render*/}
    </AppLayout>
  ) : (
    <Navigate to={"/login"} replace />
  );
};

export default ProtectedRoute;