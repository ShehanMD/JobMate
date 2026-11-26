
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
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

  // Friendly Firebase error messages
  const getErrorMessage = (err) => {
    if (err.message === "ACCOUNT_NOT_REGISTERED") {
      return "Account not found. Please register first.";
    }

    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      case "auth/network-request-failed":
        return "Network error. Please check your connection.";

      case "auth/popup-closed-by-user":
        return "Login was cancelled.";

      case "auth/popup-blocked":
        return "The login popup was blocked by your browser.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with another sign-in method.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      default:
        return "Unable to sign in. Please try again.";
    }
  };

  // Navigate according to account permissions
  const redirectUser = async (user) => {
    const token = await user.getIdTokenResult(true);

    if (token.claims.admin === true) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Email and Password Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    try {
      setLoading(true);

      const result = await login(
        email.trim(),
        password
      );

      await redirectUser(result.user);

    } catch (err) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  // Google / Facebook Login
  const handleSocial = async (provider) => {
    if (loading) return;

    try {
      setError("");
      setLoading(true);

      const user = await socialLogin(provider);

      await redirectUser(user);

    } catch (err) {
      console.error("Social login error:", err);
      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-brand">
          <span>
            Patta<span>Jobs</span>
          </span>

          <p>
            Connecting People, Creating Opportunities.
          </p>
        </div>

        <div className="login-card">

          <div className="login-heading">
            <h1>Welcome Back!</h1>
            <p>Sign in to continue to your account.</p>
          </div>

          <form onSubmit={handleLogin}>

            <label>Email Address</label>

            <div className="login-input">
              <Mail size={18} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label>Password</label>

            <div className="login-input">
              <Lock size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }
              </button>
            </div>

            <div className="login-options">
              <span></span>

              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

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
              type="button"
              onClick={() => handleSocial("google")}
              disabled={loading}
            >
              <Globe size={19} />
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocial("facebook")}
              disabled={loading}
            >
              <span className="facebook-letter">f</span>
              Facebook
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
