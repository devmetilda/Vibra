import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const getDashboardLink = () => {
    if (isAdmin()) {
      return '/admin/dashboard';
    }
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/assets/logo.png" alt="Vibra Logo" />
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={location.pathname === '/about' ? 'active' : ''}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/events" 
              className={location.pathname === '/events' ? 'active' : ''}
            >
              Events
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className={location.pathname === '/contact' ? 'active' : ''}
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="navbar-auth">
          {isAuthenticated() ? (
            <div className="profile-dropdown">
              <button 
                className="profile-link"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img 
                  src="/assets/Profile.png" 
                  alt="Profile" 
                  className="profile-icon"
                />
              </button>
              
              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-info">
                    <p className="profile-name">{user.fullName}</p>
                    <p className="profile-role">{user.role}</p>
                  </div>
                  <hr />
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={isAdmin() ? "/admin/dashboard?tab=settings" : "/dashboard?tab=profile"}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin() && (
                    <>
                      <Link
                        to="/admin/dashboard?tab=create"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Create Event
                      </Link>
                      <Link
                        to="/admin/dashboard?tab=events"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Manage Events
                      </Link>
                    </>
                  )}
                  <hr />
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="btn-login">Login / Signup</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
