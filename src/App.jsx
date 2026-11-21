
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/common/NavBar";
import Footer from "./components/common/Footer";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!isAdminPage && <Navbar />}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<h1 style={{ padding: "40px" }}>Home Page</h1>} />
          <Route path="/jobs" element={<h1 style={{ padding: "40px" }}>Find Jobs Page</h1>} />
          <Route path="/workers" element={<h1 style={{ padding: "40px" }}>Skilled Workers Page</h1>} />
          <Route path="/about" element={<h1 style={{ padding: "40px" }}>About Page</h1>} />
          <Route path="/contact" element={<h1 style={{ padding: "40px" }}>Contact Page</h1>} />
          <Route path="/login" element={<h1 style={{ padding: "40px" }}>Sign In Page</h1>} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
