
import { useState } from "react";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/admin/dashboard");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck size={35} />
        </div>

        <h1>Admin Login</h1>
        <p className="admin-login-subtitle">
          Welcome back! Please sign in to your admin account.
        </p>

        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label htmlFor="admin-email">Email Address</label>
            <input
              type="email"
              id="admin-email"
              placeholder="Enter your admin email"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="admin-password"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-button">
            Sign In
          </button>
        </form>

        <Link to="/" className="admin-back-home">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AdminLogin;
