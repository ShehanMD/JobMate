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
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-symbol">
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L9.5 22L14 11L18.5 22L26 2" stroke="#059669" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11L11.5 5" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-text">Workora</span>
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