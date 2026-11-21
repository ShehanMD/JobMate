
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function WorkerDashboard() {
  const { userData } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Welcome, {userData?.name}!</h1>

      <p>Manage your professional presence on PattaJobs.</p>

      <div className="worker-dashboard-actions">
        <Link to="/profile">
          Manage Your Profile
        </Link>
      </div>

      <h2>Your Professional Dashboard</h2>
      <p>
        Showcase your skills, build your portfolio
        and connect with potential clients.
      </p>
    </div>
  );
}

export default WorkerDashboard;
