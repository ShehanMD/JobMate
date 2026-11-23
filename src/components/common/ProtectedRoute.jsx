
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userData, isAdmin, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!adminOnly && !userData) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
