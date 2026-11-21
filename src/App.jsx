
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/dashboard/UserDashboard";
import WorkerDashboard from "./pages/dashboard/WorkerDashboard";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">

          <Navbar />

          <main className="main-content">
            <Routes>

              <Route path="/" element={<Home />} />

              <Route path="/jobs" element={<h1>Find Jobs Page</h1>} />

              <Route path="/workers" element={<h1>Skilled Workers Page</h1>} />

              <Route path="/about" element={<h1>About Page</h1>} />

              <Route path="/contact" element={<h1>Contact Page</h1>} />

              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />

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

              {/* Private Admin URL */}
              <Route path="/owner-control" element={<AdminLogin />} />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </main>

          <Footer />

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
