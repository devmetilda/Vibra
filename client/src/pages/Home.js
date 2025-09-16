import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('/api/events?limit=4');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(/assets/vase.png)' }}>
        <div className="hero-text">
          <h1>Discover & Join <br /> Campus Events</h1>
          <p>Your gateway to workshops, seminars, cultural festivals, and more happening across the campus.</p>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="events-section">
        <div className="events-header">
          <h2>Upcoming Events</h2>
          <Link to="/events" className="view-all">
            View All Events ➜
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : (
          <div className="events-grid">
            {events.length > 0 ? (
              events.map(event => (
                <EventCard key={event._id} event={event} />
              ))
            ) : (
              <div className="no-events">
                <p>No upcoming events at the moment.</p>
                <p>Check back soon for exciting events!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Calendar Section */}
      <section className="calendar-section" style={{ backgroundImage: 'url(/assets/calender-flower.png)' }}>
        <div className="calendar-container">
          <div className="calendar-header">
            <h3>Event Calendar</h3>
            <p>July 2025</p>
          </div>
          <div className="calendar-grid">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>

            {/* Calendar Days */}
            <div className="empty"></div>
            <div className="empty"></div>
            <div className="empty"></div>
            <div className="empty"></div>
            <div className="empty"></div>
            <div className="empty"></div>
            <div className="highlight">5</div>

            <div>6</div>
            <div>7</div>
            <div>8</div>
            <div>9</div>
            <div>10</div>
            <div>11</div>
            <div className="highlight">12</div>

            <div>13</div>
            <div>14</div>
            <div className="highlight">15</div>
            <div>16</div>
            <div>17</div>
            <div>18</div>
            <div>19</div>

            <div className="highlight">20</div>
            <div>21</div>
            <div className="highlight">22</div>
            <div>23</div>
            <div>24</div>
            <div>25</div>
            <div>26</div>

            <div>27</div>
            <div className="highlight">28</div>
            <div>29</div>
            <div>30</div>
            <div>31</div>
          </div>

          <div className="calendar-footer">
            <Link to="/events">View Full Calendar</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Use Campus Events?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <img src="/assets/event-icon.png" alt="Event Icon" className="feature-icon" />
            <h3>Never Miss an Event</h3>
            <p>Stay updated with all campus events and get reminders for events you've registered for.</p>
          </div>

          <div className="feature-card">
            <img src="/assets/reg-icon.png" alt="Registration Icon" className="feature-icon" />
            <h3>Easy Registration</h3>
            <p>Register for events with just a few clicks and manage all your event registrations in one place.</p>
          </div>

          <div className="feature-card">
            <img src="/assets/certificates-icon.png" alt="Certificate Icon" className="feature-icon" />
            <h3>Event Certificates</h3>
            <p>Access and download certificates for events you've participated in directly from your dashboard.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
