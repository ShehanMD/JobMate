import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Column - Text Only Logo */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.8px", lineHeight: 1 }}>
              Patta<span style={{ fontSize: "28px", color: "#10B981", fontWeight: 900 }}>Jobs</span>
            </span>
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
            <span>hello@pattajobs.lk</span>
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
          <p>© 2026 PattaJobs. All rights reserved.</p>
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