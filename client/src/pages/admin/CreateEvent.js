import React from 'react';

const CreateEvent = () => {
  return (
    <div style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create New Event</h1>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Event creation form will be implemented here with fields for:
        </p>
        <ul style={{ color: '#666', marginLeft: '20px' }}>
          <li>Event title and description</li>
          <li>Date and time</li>
          <li>Location</li>
          <li>Category selection</li>
          <li>Maximum participants</li>
          <li>Event image upload</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateEvent;
