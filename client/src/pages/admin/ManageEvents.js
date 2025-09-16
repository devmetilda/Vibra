import React from 'react';

const ManageEvents = () => {
  return (
    <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Manage Events</h1>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Event management interface will be implemented here with:
        </p>
        <ul style={{ color: '#666', marginLeft: '20px' }}>
          <li>List of all events created by admin</li>
          <li>Edit event functionality</li>
          <li>Delete event functionality</li>
          <li>View registrations for each event</li>
          <li>Event status management</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageEvents;
