
import { useAuth } from "../../context/AuthContext";

function UserDashboard() {
  const { userData } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Welcome, {userData?.name}!</h1>
      <p>Welcome to your PattaJobs dashboard.</p>

      <h2>Explore Opportunities</h2>
      <p>Discover available jobs and find your next opportunity.</p>
    </div>
  );
}

export default UserDashboard;
