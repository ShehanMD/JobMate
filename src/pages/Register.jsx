
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserRound,
  BriefcaseBusiness,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";

import "./Register.css";

function Register() {
  const { register, socialRegister } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

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
      await register(name, email, password, role);
      navigate(role === "worker" ? "/worker-dashboard" : "/dashboard");
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
      await socialRegister(provider, role);
      navigate(role === "worker" ? "/worker-dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-brand">
          <span>Patta<span>Jobs</span></span>
          <p>Connecting People, Creating Opportunities.</p>
        </div>

        <div className="register-card">

          <div className="register-heading">
            <h1>Create Account</h1>
            <p>Join PattaJobs and discover new opportunities.</p>
          </div>

          <form onSubmit={handleRegister}>

            <label>Account Type</label>

            <div className="account-type-selection">

              <button
                type="button"
                className={role === "user" ? "type-option selected" : "type-option"}
                onClick={() => setRole("user")}
              >
                <UserRound size={23} />
                <strong>Job Seeker</strong>
                <small>Find job opportunities</small>
              </button>

              <button
                type="button"
                className={role === "worker" ? "type-option selected" : "type-option"}
                onClick={() => setRole("worker")}
              >
                <BriefcaseBusiness size={23} />
                <strong>Skilled Worker</strong>
                <small>Showcase your skills</small>
              </button>

            </div>

            <label>Full Name</label>
            <div className="register-input">
              <User size={18} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <label>Email Address</label>
            <div className="register-input">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="register-input">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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

            <label>Confirm Password</label>
            <div className="register-input">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
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
              <Globe size={19} /> Google
            </button>

            <button
              type="button"
              onClick={() => handleSocial("facebook")}
              disabled={loading}
            >
              <span className="facebook-letter">f</span> Facebook
            </button>

          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;
