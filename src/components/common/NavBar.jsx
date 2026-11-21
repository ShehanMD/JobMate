import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - Text Only */}
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-text">
            Patta<span className="logo-accent">Jobs</span>
          </span>
        </NavLink>

        {/* Navigation Links */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Home
          </NavLink>
          <NavLink to="/jobs" onClick={closeMenu} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Find Jobs <ChevronDown size={14} className="dropdown-chevron" />
          </NavLink>
          <NavLink to="/workers" onClick={closeMenu} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Skilled Workers <ChevronDown size={14} className="dropdown-chevron" />
          </NavLink>
          <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            Contact
          </NavLink>

          {/* Mobile Sign In */}
          <div className="mobile-actions">
            <NavLink to="/login" className="mobile-signin-btn" onClick={closeMenu}>
              Sign In
            </NavLink>
          </div>
        </div>

        {/* Desktop Right Actions */}
        <div className="navbar-actions">
          <button
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <NavLink to="/login" className="signin-btn">
            Sign In
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;