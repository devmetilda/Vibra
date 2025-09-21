import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, PlusCircle, Users, Settings, LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

// FIX: Define the base URL for your backend API using environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newUrl = tab === 'overview' ? '/admin/dashboard' : `/admin/dashboard?tab=${tab}`;
    navigate(newUrl, { replace: true });
  };

  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0, totalRegistrations: 0, recentEvents: [] });
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Could not load dashboard stats.');
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/admin/registrations`);
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch user registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchStats();
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'registrations') {
      fetchUsers();
    }
  }, [activeTab, fetchStats, fetchEvents, fetchUsers]);

  useEffect(() => {
    refreshData();
  }, [activeTab, refreshData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} onNavigate={handleTabChange} />;
      case 'events':
        return <ManageEvents events={events} loading={loading} onNavigate={handleTabChange} onDataChange={refreshData} />;
      case 'create':
        return <CreateEvent onEventCreated={() => handleTabChange('events')} />;
      case 'registrations':
        return <StudentRegistrations users={users} loading={loading} onDataChange={refreshData} />;
      case 'settings':
        return <AdminSettings user={user} />;
      default:
        return <DashboardOverview stats={stats} onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="sidebar">
          <div className="sidebar-header">
            <img src={user?.profileImage || "/assets/Profile.png"} alt="Admin" />
            <h3>{user?.fullName || 'System Administrator'}</h3>
            <p>Event Coordinator</p>
          </div>
          <div className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>
            <LayoutDashboard size={20} /> Dashboard Overview
          </div>
          <div className={`menu-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => handleTabChange('events')}>
            <Calendar size={20} /> Manage Events
          </div>
          <div className={`menu-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => handleTabChange('create')}>
            <PlusCircle size={20} /> Create New Event
          </div>
          <div className={`menu-item ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => handleTabChange('registrations')}>
            <Users size={20} /> Student Registrations
          </div>
          <div className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}>
            <Settings size={20} /> Admin Settings
          </div>
          <div className="menu-item logout" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </div>
        </div>
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// --- Child Components ---

const DashboardOverview = ({ stats, onNavigate }) => (
  <div className="dashboard-overview">
    <div className="welcome-box">
      <p>Welcome to the event management admin panel. Here you can manage events, track registrations, and more.</p>
      <div className="stats-boxes">
        <div className="stat-card" onClick={() => onNavigate && onNavigate('events')}>
          <h1>{stats.totalEvents || 0}</h1>
          <p>Total Events</p>
        </div>
        <div className="stat-card" onClick={() => onNavigate && onNavigate('registrations')}>
          <h1>{stats.totalRegistrations || 0}</h1>
          <p>Total Registrations</p>
        </div>
        <div className="stat-card">
          <h1>{stats.selectedStudents || 0}</h1>
          <p>Selected Students</p>
        </div>
      </div>
    </div>
    <div className="dashboard-actions">
      <button className="dashboard-action-btn" onClick={() => onNavigate && onNavigate('registrations')}>
        View Student Registrations
      </button>
    </div>
    <div className="recent-events">
      <div className="recent-events-header">
        <h3>Recent Events</h3>
        <button className="view-all-btn" onClick={() => onNavigate && onNavigate('events')}>
          View All
        </button>
      </div>
      <table className="events-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Category</th>
            <th>Date</th>
            <th>Registrations</th>
          </tr>
        </thead>
        <tbody>
          {stats.recentEvents && stats.recentEvents.length > 0 ? (
            stats.recentEvents.map(event => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td><span className={`badge-label ${event.category?.toLowerCase()}`}>{event.category}</span></td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.registeredParticipants?.length || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No events created yet. Create your first event!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const EditEventModal = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    category: event?.category || '',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    time: `${event?.startTime || ''} – ${event?.endTime || ''}`,
    location: event?.location || '',
    imageUrl: event?.image || '',
    selectionRequired: event?.selectionRequired || false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h) return '09:00';
    if (/^\d{1,2}:\d{2}$/.test(time12h.trim())) return time12h.trim();
    const [time, modifier] = time12h.trim().split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier && modifier.toUpperCase() === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let startTime, endTime;
      if (formData.time.includes('–') || formData.time.includes('-')) {
        const timeRange = formData.time.split(/[–-]/).map(t => t.trim());
        startTime = convertTo24Hour(timeRange[0]);
        endTime = convertTo24Hour(timeRange[1] || timeRange[0]);
      } else {
        startTime = convertTo24Hour(formData.time);
        endTime = startTime;
      }
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category.toLowerCase(),
        date: formData.date,
        startTime: startTime,
        endTime: endTime,
        location: formData.location,
        image: formData.imageUrl,
        selectionRequired: formData.selectionRequired
      };
      await axios.put(`${API_BASE_URL}/api/events/${event._id}`, eventData);
      toast.success('Event updated successfully!');
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Event</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
           <div>
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>
          <div>
            <label>Event Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div>
              <label>Event Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Event Time *</label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g., 10:00 AM – 2:00 PM"
                required
              />
            </div>
          </div>
          <div>
            <label>Event Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
            />
          </div>
          <div>
            <label>Event Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshops</option>
              <option value="seminar">Seminars</option>
            </select>
          </div>
          <div>
            <label>Event Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="edit-selection-required"
              name="selectionRequired"
              checked={formData.selectionRequired}
              onChange={handleChange}
            />
            <label htmlFor="edit-selection-required">Selection required from registered students</label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageEvents = ({ events, loading, onNavigate, onDataChange }) => {
  const [editingEvent, setEditingEvent] = useState(null);

  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
        toast.success('Event deleted successfully');
        onDataChange();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handleView = (event) => {
    const eventDate = new Date(event.date).toLocaleDateString();
    const registrations = event.registeredParticipants?.length || 0;
    toast.info(
      `${event.title}\nDate: ${eventDate}\nLocation: ${event.location}\nRegistrations: ${registrations}`,
      { autoClose: 5000 }
    );
  };

  const handleSaveEdit = () => {
    setEditingEvent(null);
    onDataChange();
  };

  return (
    <div className="manage-events">
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEdit}
        />
      )}
      <div className="recent-events">
        <div className="recent-events-header">
          <h3>Manage Events</h3>
          <button className="create-event-btn" onClick={() => onNavigate('create')}>
            <PlusCircle size={18} /> Create New Event
          </button>
        </div>
        {loading ? (<div className="loading">Loading events...</div>) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Category</th>
                <th>Registrations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? events.map(event => (
                <tr key={event._id}>
                  <td className="event-info">
                    <img src={event.image || "/assets/image.png"} alt="Event" />
                    <div><strong>{event.title}</strong></div>
                  </td>
                  <td>
                    {new Date(event.date).toLocaleDateString()}<br />
                    <small>{event.startTime} – {event.endTime}</small>
                  </td>
                  <td>{event.location}</td>
                  <td><span className={`badge-label ${event.category?.toLowerCase()}`}>{event.category}</span></td>
                  <td>{event.registeredParticipants?.length || 0}</td>
                  <td className="action-icons">
                    <span className="view" onClick={() => handleView(event)}>View</span>
                    <span className="edit" onClick={() => setEditingEvent(event)}>Edit</span>
                    <span className="delete" onClick={() => handleDelete(event._id, event.title)}>Delete</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No events found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const CreateEvent = ({ onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', date: '',
    time: '', location: '', imageUrl: '', selectionRequired: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h) return '09:00';
    if (/^\d{1,2}:\d{2}$/.test(time12h.trim())) return time12h.trim();
    const [time, modifier] = time12h.trim().split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier && modifier.toUpperCase() === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let startTime, endTime;
      if (formData.time.includes('–') || formData.time.includes('-')) {
        const timeRange = formData.time.split(/[–-]/).map(t => t.trim());
        startTime = convertTo24Hour(timeRange[0]);
        endTime = convertTo24Hour(timeRange[1] || timeRange[0]);
      } else {
        startTime = convertTo24Hour(formData.time);
        endTime = startTime;
      }
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category.toLowerCase(),
        date: formData.date,
        startTime: startTime,
        endTime: endTime,
        location: formData.location,
        image: formData.imageUrl,
        maxParticipants: 100,
        selectionRequired: formData.selectionRequired
      };
      await axios.post(`${API_BASE_URL}/api/events`, eventData);
      toast.success('Event created successfully!');
      onEventCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };
  
  return (
      <div className="create-event">
       <div className="recent-events">
        <div className="recent-events-header">
          <h3>Create New Event</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>
          <div>
            <label>Event Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div>
              <label>Event Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Event Time *</label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g., 10:00 AM – 2:00 PM"
                required
              />
            </div>
          </div>
          <div>
            <label>Event Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
            />
          </div>
          <div>
            <label>Event Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshops</option>
              <option value="seminar">Seminars</option>
            </select>
          </div>
          <div>
            <label>Event Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="selection-required"
              name="selectionRequired"
              checked={formData.selectionRequired}
              onChange={handleChange}
            />
            <label htmlFor="selection-required">Selection required from registered students</label>
          </div>

          <div className="form-actions">
            <button type="reset" className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentRegistrations = ({ users, loading, onDataChange }) => {
    const [filterEvent, setFilterEvent] = useState('All Events');
    const [events, setEvents] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchEventsForFilter = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/events`);
                setEvents(response.data.events || []);
            } catch (error) {
                console.error('Error fetching events for filter:', error);
            }
        };
        fetchEventsForFilter();
    }, []);

    const handleRemove = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to remove ${userName} from all events?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/api/users/${userId}/registrations`);
                toast.success(`${userName} removed from all events successfully`);
                onDataChange();
            } catch (error) {
                toast.error('Failed to remove user registrations');
            }
        }
    };

    const handleSelect = async (userId, eventId, userName) => {
        try {
            await axios.post(`${API_BASE_URL}/api/events/admin/select-student`, { userId, eventId });
            toast.success(`${userName} has been selected for the event!`);
            onDataChange();
        } catch (error) {
            toast.error('Failed to select student');
        }
    };
  const getStatusBadge = (user, registration) => {
    if (!user.registeredEvents || user.registeredEvents.length === 0) return 'No Events';

    // Check if this specific registration is selected
    if (registration.selected) return 'Selected';

    // Check if the event requires selection
    const event = events.find(event => event._id === registration.event?._id);
    if (event?.selectionRequired) return 'Pending';

    return 'Registered';
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Selected': return 'status-selected';
      case 'Registered': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Pending': return 'status-pending';
      default: return 'status-none';
    }
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = [];
      users.forEach(user => {
        if (user.registeredEvents && user.registeredEvents.length > 0) {
          user.registeredEvents.forEach(registration => {
            const event = registration.event;
            exportData.push({
              'Name': user.fullName,
              'Email': user.email,
              'Event': event?.title || 'Event Deleted',
              'Department': user.department || 'Computer Science',
              'Registered On': new Date(registration.registeredAt || user.createdAt).toLocaleDateString(),
              'Status': getStatusBadge(user)
            });
          });
        }
      });

      if (exportData.length === 0) {
        toast.warning('No registration data to export');
        return;
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Student Registrations');

      // Save file
      XLSX.writeFile(wb, `Student_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Export to Excel error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToPDF = async () => {
    try {
      // Import jsPDF
      const jsPDF = (await import('jspdf')).default;

      // Prepare data for export
      const exportData = [];
      users.forEach(user => {
        if (user.registeredEvents && user.registeredEvents.length > 0) {
          user.registeredEvents.forEach(registration => {
            const event = registration.event;
            exportData.push({
              name: user.fullName || 'N/A',
              email: user.email || 'N/A',
              event: event?.title || 'Event Deleted',
              department: user.department || 'Computer Science',
              registeredOn: new Date(registration.registeredAt || user.createdAt).toLocaleDateString(),
              status: getStatusBadge(user, registration)
            });
          });
        }
      });

      if (exportData.length === 0) {
        toast.warning('No user data to export');
        return;
      }

      // Create PDF
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(139, 106, 58);
      doc.text('Student Registrations Report', 20, 20);

      // Add metadata
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Total Records: ${exportData.length}`, 20, 45);

      // Add table headers
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(139, 106, 58);
      doc.rect(20, 60, 170, 10, 'F');
      doc.text('Name', 25, 67);
      doc.text('Email', 65, 67);
      doc.text('Event', 105, 67);
      doc.text('Department', 135, 67);
      doc.text('Status', 165, 67);

      // Add table data
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      let yPosition = 75;

      exportData.forEach((row, index) => {
        if (yPosition > 270) { // Start new page if needed
          doc.addPage();
          yPosition = 20;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 246, 243);
          doc.rect(20, yPosition - 5, 170, 8, 'F');
        }

        doc.text(row.name.substring(0, 15), 25, yPosition);
        doc.text(row.email.substring(0, 20), 65, yPosition);
        doc.text(row.event.substring(0, 15), 105, yPosition);
        doc.text(row.department.substring(0, 12), 135, yPosition);
        doc.text(row.status, 165, yPosition);

        yPosition += 8;
      });

      // Save file
      const fileName = `Student_Registrations_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success(`PDF exported successfully!`);
    } catch (error) {
      console.error('Export to PDF error:', error);
      toast.error('Failed to export to PDF. Please try again.');
    }
  };

    return (
        <div className="student-registrations">
            {/* Table and filter JSX... */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={() => {
                        setEditingUser(null);
                        onDataChange();
                    }}
                />
            )}
        </div>
    );
};

const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        department: user?.department || '',
        phoneNumber: user?.phoneNumber || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/api/users/${user._id}`, formData);
            toast.success('User updated successfully!');
            onSave();
        } catch (error) {
            toast.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
        <div className="modal-header">
          <h3>Edit User - {user.fullName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
    );
};

const AdminSettings = ({ user }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
   fullName: user?.fullName || 'Admin User',
    email: user?.email || 'admin@college.edu',
    role: 'Event Coordinator',
    department: 'Student Affairs',
    phoneNumber: user?.phoneNumber || '(555) 987-6543',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '/assets/Profile.png');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        toast.success('Profile image updated! Click Save Changes to apply.');
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { ...formData, profileImage };
      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, updateData);
      updateUser(response.data.user);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className="admin-settings-page">
            <h2>Admin Settings</h2>

      <div className="admin-profile-section">
        <img src={profileImage} alt="Admin" className="admin-profile-image" />
        <div className="admin-info">
          <h3>{user?.fullName || 'Admin User'}</h3>
          <p>Event Coordinator</p>
          <label className="change-picture-btn">
            Change Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-settings-form">
        <div className="settings-form-grid">
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Admin User"
            />
          </div>
          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@college.edu"
            />
          </div>
          <div className="form-field">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Event Coordinator"
            />
          </div>
          <div className="form-field">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Student Affairs"
            />
          </div>
        </div>

        <div className="form-field phone-field">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="(555) 987-6543"
          />
        </div>

        <div className="password-section">
          <h4>Change Password</h4>
          <div className="password-grid">
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Current Password"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm New Password"
            />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New Password"
            />
          </div>
        </div>

        <div className="settings-form-actions">
          <button type="button" className="cancel-settings-btn">Cancel</button>
          <button type="submit" className="save-settings-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
        </div>
    );
};

export default AdminDashboard;
