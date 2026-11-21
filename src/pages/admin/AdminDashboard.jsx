
import { LayoutDashboard, BriefcaseBusiness, Users, UserCheck, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <LayoutDashboard size={25} />
          <span>Workora Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <Link to="/admin/dashboard" className="admin-sidebar-link active">
            <LayoutDashboard size={19} />
            Dashboard
          </Link>
          <Link to="/admin/jobs" className="admin-sidebar-link">
            <BriefcaseBusiness size={19} />
            Manage Jobs
          </Link>
          <Link to="/admin/users" className="admin-sidebar-link">
            <Users size={19} />
            Manage Users
          </Link>
          <Link to="/admin/workers" className="admin-sidebar-link">
            <UserCheck size={19} />
            Manage Workers
          </Link>
        </nav>

        <Link to="/" className="admin-logout-link">
          <LogOut size={19} />
          Back to Website
        </Link>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to the Workora Admin Panel</p>
          </div>
          <span className="admin-profile">Admin</span>
        </header>

        <section className="admin-stat-grid">
          <div className="admin-stat-card">
            <BriefcaseBusiness size={25} />
            <h3>Total Jobs</h3>
            <strong>0</strong>
          </div>

          <div className="admin-stat-card">
            <Users size={25} />
            <h3>Total Users</h3>
            <strong>0</strong>
          </div>

          <div className="admin-stat-card">
            <UserCheck size={25} />
            <h3>Total Workers</h3>
            <strong>0</strong>
          </div>
        </section>

        <section className="admin-welcome-card">
          <h2>Welcome to Workora!</h2>
          <p>
            Manage job listings, users and skilled workers from your
            administration dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
