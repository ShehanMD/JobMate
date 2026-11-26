
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DistrictDropdown from "../components/common/DistrictDropdown";

import {
  UserRound,
  BriefcaseBusiness,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe,
  Phone,
} from "lucide-react";

import "./Register.css";

function Register() {
  const { register, socialRegister } = useAuth();

  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ======================================
  // VALIDATE REGISTRATION DETAILS
  // ======================================

  const validateProfileDetails = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return false;
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");

    if (!/^\+?\d{9,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number.");
      return false;
    }

    if (!location) {
      setError("Please select your district.");
      return false;
    }

    return true;
  };


  // ======================================
  // ERROR MESSAGES
  // ======================================

  const getErrorMessage = (err) => {
    if (err.message === "ACCOUNT_ALREADY_REGISTERED") {
      return "This account is already registered. Please sign in.";
    }

    switch (err.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Password must contain at least 6 characters.";

      case "auth/network-request-failed":
        return "Network error. Please check your connection.";

      case "auth/popup-closed-by-user":
        return "Registration was cancelled.";

      case "auth/popup-blocked":
        return "The login popup was blocked by your browser.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with another sign-in method.";

      default:
        return "Unable to create account. Please try again.";
    }
  };


  // ======================================
  // GET DASHBOARD PATH
  // ======================================

  const getDashboardPath = () => {
    return role === "worker"
      ? "/worker-dashboard"
      : "/dashboard";
  };


  // ======================================
  // EMAIL REGISTRATION
  // ======================================

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    if (loading) return;

    if (!validateProfileDetails()) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await register(
        name.trim(),
        email.trim(),
        password,
        role,
        phone.trim(),
        location
      );

      // Account is already Active and logged in.
      navigate(getDashboardPath(), {
        replace: true,
      });

    } catch (err) {
      console.error("Registration error:", err);

      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };


  // ======================================
  // GOOGLE / FACEBOOK REGISTRATION
  // ======================================

  const handleSocial = async (provider) => {
    if (loading) return;

    setError("");

    try {
      setLoading(true);

      await socialRegister(provider, role);

      // Go directly to the selected account dashboard.
      navigate(getDashboardPath(), {
        replace: true,
      });

    } catch (err) {
      console.error("Social registration error:", err);

      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };


  // ======================================
  // UI
  // ======================================

  return (
    <div className="register-page">

      <div className="register-container">

        {/* BRAND */}

        <div className="register-brand">

          <span>
            Patta<span>Jobs</span>
          </span>

          <p>
            Connecting People, Creating Opportunities.
          </p>

        </div>


        <div className="register-card">

          {/* HEADING */}

          <div className="register-heading">

            <h1>Create Account</h1>

            <p>
              Join PattaJobs and discover new opportunities.
            </p>

          </div>


          <form onSubmit={handleRegister}>

            {/* ACCOUNT TYPE */}

            <label>Account Type</label>

            <div className="account-type-selection">

              <button
                type="button"
                className={
                  role === "user"
                    ? "type-option selected"
                    : "type-option"
                }
                onClick={() => setRole("user")}
                disabled={loading}
              >

                <UserRound size={23} />

                <strong>Job Seeker</strong>

                <small>
                  Find job opportunities
                </small>

              </button>


              <button
                type="button"
                className={
                  role === "worker"
                    ? "type-option selected"
                    : "type-option"
                }
                onClick={() => setRole("worker")}
                disabled={loading}
              >

                <BriefcaseBusiness size={23} />

                <strong>Skilled Worker</strong>

                <small>
                  Showcase your skills
                </small>

              </button>

            </div>


            {/* FULL NAME */}

            <label htmlFor="register-name">
              Full Name
            </label>

            <div className="register-input">

              <User size={18} />

              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
                disabled={loading}
              />

            </div>


            {/* EMAIL */}

            <label htmlFor="register-email">
              Email Address
            </label>

            <div className="register-input">

              <Mail size={18} />

              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />

            </div>


            {/* PHONE */}

            <label htmlFor="register-phone">
              Phone Number
            </label>

            <div className="register-input">

              <Phone size={18} />

              <input
                id="register-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                required
                disabled={loading}
              />

            </div>


            {/* DISTRICT */}

            <label>District</label>

            <div className="register-district-select">

              <DistrictDropdown
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Select your district"
                required
              />

            </div>


            {/* PASSWORD */}

            <label htmlFor="register-password">
              Password
            </label>

            <div className="register-input">

              <Lock size={18} />

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
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


            {/* CONFIRM PASSWORD */}

            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <div className="register-input">

              <Lock size={18} />

              <input
                id="register-confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
                disabled={loading}
              />

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
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"
              }
            </button>

          </form>


          {/* DIVIDER */}

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>


          {/* SOCIAL REGISTRATION */}

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


          {/* LOGIN LINK */}

          <p className="auth-switch">

            Already have an account?

            <Link to="/login">
              {" "}Sign In
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;
