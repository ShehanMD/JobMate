import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Menu, X, Sun, Moon, ChevronDown,
  LayoutDashboard, UserRound, LogOut
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const findJobsMenu = [
  { label: "All Job Vacancies", path: "/jobs" },
  { label: "Internship Opportunities", path: "/jobs?type=internship" },
  { label: "Permanent", path: "/jobs?type=permanent" },
  { label: "Temporary", path: "/jobs?type=temporary" },
  { label: "On-contract", path: "/jobs?type=on-contract" },
];

const skilledWorkersMenu = [
  { label: "Electricians", path: "/workers?category=electricians" },
  { label: "Plumbers", path: "/workers?category=plumbers" },
  { label: "Carpenters", path: "/workers?category=carpenters" },
  { label: "Painters", path: "/workers?category=painters" },
  { label: "Technicians", path: "/workers?category=technicians" },
  { label: "Construction Workers", path: "/workers?category=construction-workers" },
  { label: "Others", path: "/workers?category=others" },
];


function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);

const toggleDropdown = (menuName) => {
  setOpenDropdown(openDropdown === menuName ? null : menuName);
};

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { currentUser, userData, isAdmin, logout } = useAuth();

  const navigate = useNavigate();
  const profileRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
      closeMenu();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const dashboardPath = isAdmin
    ? "/admin/dashboard"
    : userData?.role === "worker"
      ? "/worker-dashboard"
      : "/dashboard";

  const profilePath = isAdmin
    ? "/admin/dashboard"
    : "/profile";

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-text">
            Patta<span className="logo-accent">Jobs</span>
          </span>
        </NavLink>

        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>

          <NavLink to="/" end onClick={closeMenu}
            className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            Home
          </NavLink>

          <div className={`nav-dropdown ${openDropdown === "jobs" ? "open" : ""}`}>
            <NavLink
              to="/jobs"
              onClick={(e) => {
                if (window.innerWidth <= 900) {
                  e.preventDefault(); 
                  toggleDropdown("jobs");
                } else {
                  closeMenu();
                }
              }}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              Find Jobs <ChevronDown size={14} className="dropdown-arrow" />
            </NavLink>

            <div className="nav-dropdown-menu">
              {findJobsMenu.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => {
                    closeMenu();
                    setOpenDropdown(null);
                  }}
                  className="dropdown-item"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          

          <div className={`nav-dropdown ${openDropdown === "workers" ? "open" : ""}`}>
            <NavLink
              to="/workers"
              onClick={(e) => {
                if (window.innerWidth <= 900) {
                  e.preventDefault(); 
                  toggleDropdown("workers");
                } else {
                  closeMenu();
                }
              }}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              Skilled Workers <ChevronDown size={14} className="dropdown-arrow" />
            </NavLink>

            <div className="nav-dropdown-menu">
              {skilledWorkersMenu.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => {
                    closeMenu();
                    setOpenDropdown(null);
                  }}
                  className="dropdown-item"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/about" onClick={closeMenu} className="nav-item">
            About
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu} className="nav-item">
            Contact
          </NavLink>

          {!currentUser && (
            <div className="mobile-actions">
              <NavLink to="/login" onClick={closeMenu} className="signin-btn">
                Sign In
              </NavLink>
              <NavLink to="/register" onClick={closeMenu} className="signup-btn">
                Sign Up
              </NavLink>
            </div>
          )}
        </div>

        <div className="navbar-actions">

          <button
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}
          </button>

          {!currentUser ? (
            <>
              <NavLink to="/login" className="signin-btn">
                Sign In
              </NavLink>

              <NavLink to="/register" className="signup-btn">
                Sign Up
              </NavLink>
            </>
          ) : (
            <div className="profile-menu" ref={profileRef}>

              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="navbar-avatar"
                  />
                ) : (
                  <div className="navbar-avatar-placeholder">
                    <UserRound size={19}/>
                  </div>
                )}

                <span>{userData?.name || currentUser.displayName || "My Account"}</span>

                <ChevronDown size={15}/>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">

                  <div className="dropdown-user-info">
                    <strong>{userData?.name || "User"}</strong>
                    <small>{currentUser.email}</small>
                  </div>

                  <NavLink to={dashboardPath}
                    onClick={() => setProfileOpen(false)}>
                    <LayoutDashboard size={17}/>
                    Dashboard
                  </NavLink>

                  <NavLink to={profilePath}
                    onClick={() => setProfileOpen(false)}>
                    <UserRound size={17}/>
                    Your Profile
                  </NavLink>

                  <button onClick={handleLogout}>
                    <LogOut size={17}/>
                    Sign Out
                  </button>

                </div>
              )}
            </div>
          )}

        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;
