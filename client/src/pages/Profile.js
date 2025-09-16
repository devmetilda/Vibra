import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, BookOpen, Bell, User, LogOut } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    year: '',
    studentId: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || '',
        studentId: user.studentId || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
      const response = await axios.put('/api/users/profile', formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = () => {
    toast.info('Profile picture upload will be implemented soon!');
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <img src="/assets/Profile.png" alt="User" />
            <h3>{user?.fullName}</h3>
            <p>{user?.role === 'admin' ? 'Administrator' : 'Student'}</p>
          </div>

          <Link className="menu-item" to={isAdmin() ? "/admin/dashboard" : "/dashboard"}>
            <Calendar size={16} /> Dashboard Overview
          </Link>
          {!isAdmin() && (
            <Link className="menu-item" to="/dashboard">
              <BookOpen size={16} /> My Registered Events
            </Link>
          )}
          <Link className="menu-item" to="/dashboard">
            <Bell size={16} /> Notifications
            <span className="badge">1</span>
          </Link>
          <Link className="menu-item active" to="/profile">
            <User size={16} /> Profile Settings
          </Link>
          <Link className="menu-item" to="/" onClick={() => {}}>
            <LogOut size={16} /> Logout
          </Link>
        </div>

        {/* Profile Settings Content */}
        <div className="main-content">
          <div className="profile-settings-box">
            <h2>Profile Settings</h2>

            <div className="profile-header">
              <img src={user?.profileImage || "/assets/Profile.png"} alt="User Avatar" />
              <div className="info">
                <h3>{user?.fullName}</h3>
                <p>{formData.department} • {formData.year}</p>
                <button type="button" onClick={handleProfilePictureChange} className="change-picture-btn">
                  Change Avatar
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 3rd Year"
                  />
                </div>

                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="e.g., 2362180"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
