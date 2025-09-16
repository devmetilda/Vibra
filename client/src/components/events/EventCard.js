import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EventCard.css';

const EventCard = ({ event }) => {
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Date TBD';
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }

    if (user.role === 'admin') {
      toast.error('Admins cannot register for events');
      return;
    }

    setIsRegistering(true);
    try {
      await axios.post(`/api/events/${event._id}/register`);
      toast.success('Successfully registered for event!');
      setIsRegistered(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setIsRegistering(true);
    try {
      await axios.delete(`/api/events/${event._id}/unregister`);
      toast.success('Successfully unregistered from event');
      setIsRegistered(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unregister from event');
    } finally {
      setIsRegistering(false);
    }
  };

  const getCategoryClass = (category) => {
    const categoryMap = {
      academic: 'academic',
      cultural: 'cultural',
      workshop: 'workshop',
      sports: 'sports',
      seminar: 'seminar'
    };
    return categoryMap[category?.toLowerCase()] || 'academic';
  };

  const getDefaultImage = (category) => {
    const imageMap = {
      academic: '/assets/annual-tech.png',
      cultural: '/assets/spring-fest.png',
      workshop: '/assets/career-dev.png',
      sports: '/assets/inter-clg.png',
      seminar: '/assets/annual-tech.png'
    };
    return imageMap[category?.toLowerCase()] || '/assets/annual-tech.png';
  };

  return (
    <div className="event-card">
      <span className={`tag ${getCategoryClass(event.category)}`}>
        {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
      </span>

      <img
        src={event.image || getDefaultImage(event.category)}
        alt={event.title}
        onError={(e) => {
          e.target.src = getDefaultImage(event.category);
        }}
      />

      <div className="content">
        <h3>{event.title}</h3>
        <p>{event.description}</p>

        <ul className="event-details">
          <li>📅 {formatDate(event.date)}</li>
          <li>🕙 {event.startTime} - {event.endTime}</li>
          <li>📍 {event.location}</li>
          <li>👥 {event.registrationCount || 0} registered</li>
        </ul>

        <div className="event-actions">
          <Link to={`/events/${event._id}`} className="btn btn-secondary">
            View Details
          </Link>

          {user && user.role === 'student' && (
            <button
              className={`btn ${isRegistered ? 'btn-danger' : 'btn-primary'}`}
              onClick={isRegistered ? handleUnregister : handleRegister}
              disabled={isRegistering}
            >
              {isRegistering
                ? 'Processing...'
                : isRegistered
                  ? 'Unregister'
                  : 'Register'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
