
function AdminDashboard() {
  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>
      <p>Welcome to PattaJobs Administration.</p>

      <div className="admin-sections">
        <div>
          <h3>Manage Users</h3>
          <p>View and manage registered users.</p>
        </div>

        <div>
          <h3>Manage Skilled Workers</h3>
          <p>Review worker profiles.</p>
        </div>

        <div>
          <h3>Manage Jobs</h3>
          <p>Manage published vacancies.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
