import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Omkar Hospital
          </h1>
          <p className="hero-subtitle">
            Book appointments with top doctors, consult online, and manage your health records - all in one place
          </p>
          
          {!user && (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
          )}

          {user && (
            <div className="hero-actions">
              <Link
                to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="btn btn-primary btn-large"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍⚕️</div>
              <h3>Expert Doctors</h3>
              <p>Consult with certified and experienced healthcare professionals</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Booking</h3>
              <p>Book appointments online with just a few clicks</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📹</div>
              <h3>Video Consultation</h3>
              <p>Secure video calls with doctors from anywhere</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Digital Prescriptions</h3>
              <p>Get and store your prescriptions digitally</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your health data is encrypted and protected</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>24/7 Access</h3>
              <p>Access your health records anytime, anywhere</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Expert Doctors</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Happy Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Specializations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;