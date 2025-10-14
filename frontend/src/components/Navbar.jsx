import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Omkar Hospital
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <span className="navbar-user">
                👤 {user.name} ({user.role})
              </span>
              <Link
                to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="navbar-link"
              >
                Dashboard
              </Link>
              {user.role === 'patient' && (
                <Link to="/patient/book-appointment" className="navbar-link">
                  Book Appointment
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;