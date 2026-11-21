
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";

import "./Login.css";

function Login() {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await login(email, password);

      const token = await result.user.getIdTokenResult(true);

      if (token.claims.admin === true) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    try {
      setError("");
      setLoading(true);

      const user = await socialLogin(provider);

      const token = await user.getIdTokenResult(true);

      if (token.claims.admin === true) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.message === "ACCOUNT_NOT_REGISTERED"
          ? "Account not found. Please register first."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-brand">
          <span>Patta<span>Jobs</span></span>
          <p>Connecting People, Creating Opportunities.</p>
        </div>

        <div className="login-card">

          <div className="login-heading">
            <h1>Welcome Back!</h1>
            <p>Sign in to continue to your account.</p>
          </div>

          <form onSubmit={handleLogin}>

            <label>Email Address</label>

            <div className="login-input">
              <Mail size={18}/>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>

            <div className="login-input">
              <Lock size={18}/>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <div className="login-options">
              <span></span>
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-buttons">

            <button
              onClick={() => handleSocial("google")}
              disabled={loading}
              type="button"
            >
              <Globe size={19}/> Google
            </button>

            <button
              onClick={() => handleSocial("facebook")}
              disabled={loading}
              type="button"
            >
              <span className="facebook-letter">f</span> Facebook
            </button>

          </div>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/register"> Create Account</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
