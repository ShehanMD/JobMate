
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

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import JobDetails from "./pages/admin/JobDetails";
import CreateJob from "./pages/admin/CreateJob";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageWorkers from "./pages/admin/ManageWorkers";
import WorkerProfile from "./pages/admin/WorkerProfile";

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
          {/* Public Pages */}
          <Route path="/" element={<Home />} />

          <Route
            path="/jobs"
            element={<h1>Find Jobs Page</h1>}
          />

          <Route
            path="/workers"
            element={<h1>Skilled Workers Page</h1>}
          />

          <Route
            path="/about"
            element={<h1>About Page</h1>}
          />

          <Route
            path="/contact"
            element={<h1>Contact Page</h1>}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker-dashboard"
            element={
              <ProtectedRoute allowedRole="worker">
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* Admin Layout and Nested Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Navigate to="/admin/dashboard" replace />
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            {/* Manage Jobs */}
            <Route
              path="jobs"
              element={<ManageJobs />}
            />

            {/* View Complete Job Details */}
            <Route
              path="jobs/:id"
              element={<JobDetails />}
            />

            {/* Create Job */}
            <Route
              path="create-job"
              element={<CreateJob />}
            />

            {/* Manage Users - Job Seekers */}
            <Route
              path="users"
              element={<ManageUsers />}
            />

            {/* Manage Workers - Skilled Workers */}
            <Route
              path="workers"
              element={<ManageWorkers />}
            />

            {/* View Complete Worker Profile */}
            <Route
              path="workers/:id"
              element={<WorkerProfile />}
            />
          </Route>

          {/* Owner Control */}
          <Route
            path="/owner-control"
            element={<AdminLogin />}
          />

          {/* Invalid Routes */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
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
