import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated() && user) {
      const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      // Only use 'from' path if it's appropriate for the user role
      const from = location.state?.from?.pathname;
      let redirectPath = defaultPath;

      if (from) {
        // If user is admin and trying to access admin routes, allow it
        if (user.role === 'admin' && from.startsWith('/admin/')) {
          redirectPath = from;
        }
        // If user is student and trying to access student routes, allow it
        else if (user.role === 'student' && (from === '/dashboard' || from === '/profile')) {
          redirectPath = from;
        }
        // Otherwise use default path
      }

      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Get user data from the login result to determine redirect path
        const userData = result.user || user;
        const defaultPath = userData?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        const from = location.state?.from?.pathname;
        let redirectPath = defaultPath;

        if (from) {
          // If user is admin and trying to access admin routes, allow it
          if (userData?.role === 'admin' && from.startsWith('/admin/')) {
            redirectPath = from;
          }
          // If user is student and trying to access student routes, allow it
          else if (userData?.role === 'student' && (from === '/dashboard' || from === '/profile')) {
            redirectPath = from;
          }
          // Otherwise use default path
        }

        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: 'url(/assets/register.png)' }}>
      <div className="auth-container">
        <div className="auth-box">
          <div className="form-header">
            <h2>Login to your account</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
                <img src="/assets/Man.png" alt="User Icon" className="input-icon" />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  required
                />
                <img src="/assets/password.png" alt="Password Icon" className="input-icon" />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-link">
              Don't have an account? <Link to="/register">Register Now</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
