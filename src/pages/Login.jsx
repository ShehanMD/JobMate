
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

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


  // ======================================
  // ERROR MESSAGES
  // ======================================

  const getErrorMessage = (err) => {

    if (err.message === "ACCOUNT_PROFILE_NOT_FOUND") {
      return "Your account profile could not be found. Please register first or contact the administrator.";
    }

    if (err.message === "ACCOUNT_INACTIVE") {
      return "Your account is inactive. Please contact the administrator.";
    }

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


  // ======================================
  // REDIRECT ACCORDING TO ACCOUNT TYPE
  // ======================================

  const redirectUser = async (user) => {

    const token = await user.getIdTokenResult(true);


    // Admin Dashboard.
    if (token.claims.admin === true) {

      navigate("/admin/dashboard", {
        replace: true,
      });

      return;
    }


    // Load normal user profile.
    const profileSnapshot = await getDoc(
      doc(db, "users", user.uid)
    );


    if (!profileSnapshot.exists()) {
      throw new Error("ACCOUNT_PROFILE_NOT_FOUND");
    }


    const profile = profileSnapshot.data();


    // Block inactive accounts.
    if (profile.status === "Inactive") {
      throw new Error("ACCOUNT_INACTIVE");
    }


    // Worker Dashboard.
    if (profile.role === "worker") {

      navigate("/worker-dashboard", {
        replace: true,
      });

    } else {

      // Job Seeker Dashboard.
      navigate("/dashboard", {
        replace: true,
      });

    }
  };


  // ======================================
  // EMAIL / PASSWORD LOGIN
  // ======================================

  const handleLogin = async (event) => {

    event.preventDefault();

    if (loading) return;

    setError("");

    try {

      setLoading(true);

      const user = await login(
        email.trim(),
        password
      );

      await redirectUser(user);

    } catch (err) {

      console.error(
        "Login error:",
        err
      );

      setError(getErrorMessage(err));

    } finally {

      setLoading(false);

    }
  };


  // ======================================
  // GOOGLE / FACEBOOK LOGIN
  // ======================================

  const handleSocial = async (provider) => {

    if (loading) return;

    setError("");

    try {

      setLoading(true);

      const user = await socialLogin(provider);

      await redirectUser(user);

    } catch (err) {

      console.error(
        "Social login error:",
        err
      );

      setError(getErrorMessage(err));

    } finally {

      setLoading(false);

    }
  };


  // ======================================
  // UI
  // ======================================

  return (
    <div className="login-page">

      <div className="login-container">

        {/* BRAND */}

        <div className="login-brand">

          <span>
            Patta<span>Jobs</span>
          </span>

          <p>
            Connecting People, Creating Opportunities.
          </p>

        </div>


        <div className="login-card">

          {/* HEADING */}

          <div className="login-heading">

            <h1>Welcome Back!</h1>

            <p>
              Sign in to continue to your account.
            </p>

          </div>


          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>

            <label htmlFor="login-email">
              Email Address
            </label>

            <div className="login-input">

              <Mail size={18} />

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
                disabled={loading}
              />

            </div>


            <label htmlFor="login-password">
              Password
            </label>

            <div className="login-input">

              <Lock size={18} />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }

              </button>

            </div>


            {/* FORGOT PASSWORD */}

            <div className="login-options">

              <span />

              <Link to="/forgot-password">
                Forgot Password?
              </Link>

            </div>


            {/* ERROR */}

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Sign In"
              }
            </button>

          </form>


          {/* DIVIDER */}

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>


          {/* SOCIAL LOGIN */}

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

              <span className="facebook-letter">
                f
              </span>

              Facebook

            </button>

          </div>


          {/* REGISTER LINK */}

          <p className="auth-switch">

            Don't have an account?

            <Link to="/register">
              {" "}Create Account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
