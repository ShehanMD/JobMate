import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/dashboard/UserDashboard";
import WorkerDashboard from "./pages/dashboard/WorkerDashboard";
import Profile from "./pages/Profile";

import Navbar from "./components/common/NavBar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import CreateJob from "./pages/admin/CreateJob";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageWorkers from "./pages/admin/ManageWorkers";

import "./App.css";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {!isAdminPage && <Navbar />}

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Home />} />

          <Route path="/jobs" element={<h1>Find Jobs Page</h1>} />

          <Route path="/workers" element={<h1>Skilled Workers Page</h1>} />

          <Route path="/about" element={<h1>About Page</h1>} />

          <Route path="/contact" element={<h1>Contact Page</h1>} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Worker Dashboard */}
          <Route
            path="/worker-dashboard"
            element={
              <ProtectedRoute allowedRole="worker">
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute adminOnly>
                <ManageJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-job"
            element={
              <ProtectedRoute adminOnly>
                <CreateJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/workers"
            element={
              <ProtectedRoute adminOnly>
                <ManageWorkers />
              </ProtectedRoute>
            }
          />

          {/* Old Admin URL */}
          <Route path="/owner-control" element={<AdminLogin />} />

          {/* Invalid Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;