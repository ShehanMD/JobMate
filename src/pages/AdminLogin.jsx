
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);

      const token = await getIdTokenResult(
        result.user,
        true
      );

      if (token.claims.admin !== true) {
        setError("Unauthorized access.");
        await signOut(auth);
        return;
      }

      navigate("/admin/dashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>PattaJobs Admin</h1>
        <p>Authorized administrators only.</p>

        <form onSubmit={handleAdminLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="login-submit">
            Admin Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
