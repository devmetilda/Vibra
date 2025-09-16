import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Campus Events Info */}
        <div className="footer-col">
          <h4>Campus Events</h4>
          <p>Your one-stop platform for college events, workshops, and activities.</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src="/assets/facebook.png" alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <img src="/assets/twitter.png" alt="Twitter" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="/assets/instagram.png" alt="Instagram" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/events">Events Calendar</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        {/* Event Categories */}
        <div className="footer-col">
          <h4>Event Categories</h4>
          <ul>
            <li><Link to="/events?category=academic">Academic</Link></li>
            <li><Link to="/events?category=cultural">Cultural</Link></li>
            <li><Link to="/events?category=sports">Sports</Link></li>
            <li><Link to="/events?category=workshop">Workshops</Link></li>
            <li><Link to="/events?category=seminar">Seminars</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="contact-info">
            <li>
              <img src="/assets/location.png" alt="Location" />
              123 College Road, University Campus, State 12345
            </li>
            <li>
              <img src="/assets/phone.png" alt="Phone" />
              (123) 456-7890
            </li>
            <li>
              <img src="/assets/mail.png" alt="Email" />
              info@vibra.edu
            </li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2025 <strong>Vibra</strong> All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
