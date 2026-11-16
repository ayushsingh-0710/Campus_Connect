
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "./Router";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // Wait until backend verifies the JWT cookie
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render protected content for guests
  if (!isAuthenticated) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
