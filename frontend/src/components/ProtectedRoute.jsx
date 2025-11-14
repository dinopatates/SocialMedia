import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { currentUser, isAuthenticate } = useAuth();

  if (!isAuthenticate) {
    return <Navigate to="/signin" />;
  }

  console.log(currentUser);

  return <div>{children}</div>;
}
