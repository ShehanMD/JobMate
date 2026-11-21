
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { currentUser, userData } = useAuth();

  if (!userData) return <p>Loading profile...</p>;

  const isWorker = userData.role === "skilledWorker";

  return (
    <div style={{ maxWidth: "1100px", margin: "50px auto", padding: "20px" }}>
      <h1>Welcome, {userData.name}!</h1>

      <p>
        {isWorker
          ? "Manage your professional profile and showcase your skills."
          : "Discover opportunities and find your next job."}
      </p>

      <div style={{
        background: "#f0fdf4",
        padding: "25px",
        borderRadius: "12px",
        marginTop: "25px"
      }}>
        <h2>
          {isWorker ? "Skilled Worker Dashboard" : "Job Seeker Dashboard"}
        </h2>

        <p>Email: {currentUser.email}</p>
        <p>Account Type: {userData.role}</p>

        <Link to="/profile">
          Manage Your Profile →
        </Link>
      </div>

      {isWorker ? (
        <div style={{ marginTop: "25px" }}>
          <h3>Your Professional Profile</h3>
          <p>Skills: {userData.skills?.join(", ") || "Add your skills"}</p>
          <p>Experience: {userData.experience || "Not added yet"}</p>
        </div>
      ) : (
        <div style={{ marginTop: "25px" }}>
          <h3>Find Your Next Opportunity</h3>
          <Link to="/jobs">Explore Jobs →</Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
