import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section - Exact Design Match */}
      <section
        className="about-hero"
        style={{
          backgroundImage: 'url(/assets/college.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <h1>About Our College</h1>
        <p>Dedicated to excellence in education, research, and fostering a vibrant campus community.</p>
      </section>

      {/* About Section - Exact Design Match */}
      <section className="about-section">
        <div className="about-text">
          <h2>Our College</h2>
          <p>Founded in 1985, our college has been at the forefront of academic excellence and innovation. We pride ourselves on providing a supportive and inclusive environment where students can thrive intellectually, socially, and personally.</p>
          <p>With state-of-the-art facilities, dedicated faculty, and a diverse student body, we offer a comprehensive educational experience that prepares students for success in their chosen fields and as responsible global citizens.</p>
          <p>Our commitment to research, community engagement, and cultural activities creates a dynamic campus life that enriches the educational journey of every student.</p>
        </div>
        <div className="about-image">
          <img src="/assets/college2.png" alt="College Campus" />
        </div>
      </section>

      {/* Stats Section - Exact Design Match */}
      <section
        className="stats-section"
        style={{
          backgroundImage: 'url(/assets/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-icon">
              <img src="/assets/students.png" alt="Students Icon" />
            </div>
            <h2>10,000+</h2>
            <p>Students</p>
          </div>
          <div className="stat-box">
            <div className="stat-icon">
              <img src="/assets/programs.png" alt="Programs Icon" />
            </div>
            <h2>50+</h2>
            <p>Programs</p>
          </div>
          <div className="stat-box">
            <div className="stat-icon">
              <img src="/assets/awards.png" alt="Awards Icon" />
            </div>
            <h2>200+</h2>
            <p>Awards</p>
          </div>
          <div className="stat-box">
            <div className="stat-icon">
              <img src="/assets/Annual.png" alt="Events Icon" />
            </div>
            <h2>100+</h2>
            <p>Annual Events</p>
          </div>
        </div>
      </section>

      {/* Event System Section - Exact Design Match */}
      <section className="event-system-section">
        <h2>About Our Event Management System</h2>
        <div className="event-system">
          <img src="/assets/container.png" alt="Event Presentation Image" />
          <div className="event-text">
            <h3>Streamlining Campus Events</h3>
            <p>Our college event management system was developed to enhance the campus experience by making it easier for students to discover, register for, and participate in the wide range of events happening across the college.</p>

            <div className="event-point">
              <img src="/assets/icon1.png" alt="Discovery Icon" />
              <p><strong>Event Discovery</strong> – Browse and search for events by category, date, or department.</p>
            </div>

            <div className="event-point">
              <img src="/assets/icon2.png" alt="Registration Icon" />
              <p><strong>Easy Registration</strong> – Register for events with just a few clicks and manage all your registrations.</p>
            </div>

            <div className="event-point">
              <img src="/assets/icon3.png" alt="Management Icon" />
              <p><strong>Event Management</strong> – For organizers, create and manage events efficiently.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
