import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="about-hero" style={{ backgroundImage: 'url(/assets/bg.png)' }}>
        <h1>Contact Us</h1>
        <p>Get in touch with us for any questions, suggestions, or support regarding campus events.</p>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <div className="contact-left" style={{ backgroundImage: 'url(/assets/bg1.png)' }}>
          <h2>Get in Touch</h2>
          <p>We're here to help you with any questions about campus events, registration issues, or general inquiries.</p>

          <div className="info-line">
            <img src="/assets/location.png" alt="Location Icon" />
            <span>123 College Road, University Campus, State 12345</span>
          </div>

          <div className="info-line">
            <img src="/assets/phone.png" alt="Phone Icon" />
            <span>(123) 456-7890</span>
          </div>

          <div className="info-line">
            <img src="/assets/mail.png" alt="Email Icon" />
            <span>info@vibra.edu</span>
          </div>

          <div className="office-hours">
            <h3>Office Hours</h3>
            <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
            <p>Saturday: 10:00 AM - 2:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div className="contact-right">
          <h2>Send us a Message</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Message Subject"
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
