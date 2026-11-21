import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L9.5 22L14 11L18.5 22L26 2" stroke="#10B981" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11L11.5 5" stroke="#34D399" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
            <span>Workora</span>
          </Link>
          <p className="footer-desc">
            Sri Lanka's modern platform connecting employers with job seekers
            and skilled professionals across the island.
          </p>
        </div>

        {/* Explore Links */}
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/jobs">Find Jobs</Link>
          <Link to="/workers">Skilled Workers</Link>
          <Link to="/about">About Us</Link>
        </div>

        {/* For Users */}
        <div className="footer-col">
          <h4>Get Started</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/contact">Contact Support</Link>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4>Contact</h4>
          <div className="contact-item">
            <MapPin size={16} />
            <span>Colombo, Sri Lanka</span>
          </div>
          <div className="contact-item">
            <Mail size={16} />
            <span>hel**@workora.lk</span>
          </div>
          <div className="contact-item">
            <Phone size={16} />
            <span>+94 11 *** ****</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 Workora. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;