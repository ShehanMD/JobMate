
import { useLocation, useNavigate, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  HardHat,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Jobs",
      path: "/admin/jobs",
      icon: BriefcaseBusiness,
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Manage Workers",
      path: "/admin/workers",
      icon: HardHat,
    },
  ];

  const pageTitles = {
    "/admin/dashboard": "Dashboard",
    "/admin/jobs": "Manage Jobs",
    "/admin/create-job": "Create Job",
    "/admin/users": "Manage Users",
    "/admin/workers": "Manage Workers",
  };

  const isUserProfile = location.pathname.startsWith("/admin/users/");
  const isWorkerProfile = location.pathname.startsWith("/admin/workers/");

  const pageTitle = isUserProfile
    ? "User Profile"
    : isWorkerProfile
    ? "Worker Profile"
    : pageTitles[location.pathname] || "Admin Panel";

  const handleBack = () => {
    if (isUserProfile) {
      navigate("/admin/users");
    } else if (isWorkerProfile) {
      navigate("/admin/workers");
    } else {
      navigate("/admin/dashboard");
    }
  };

  const handleLogout = async () => {
    if (typeof logout === "function") {
      await logout();
    }
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">P</div>
          <div>
            <h2>PattaJobs</h2>
            <span>Admin Panel</span>
          </div>

          <button
            className="admin-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <div className="admin-sidebar-section">
          <p className="admin-sidebar-label">MAIN MENU</p>

          <nav className="admin-sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-admin">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={23} />
            </button>

            {(isUserProfile || isWorkerProfile) && (
              <button className="admin-back-btn" onClick={handleBack}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}

            <div>
              <h1>{pageTitle}</h1>
              <p>Welcome to PattaJobs Administration</p>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-header-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
