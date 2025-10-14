import React from 'react';
import './DoctorCard.css';

const DoctorCard = ({ doctor, onBook }) => {
  return (
    <div className="doctor-card">
      <div className="doctor-header">
        <div className="doctor-avatar">
          {doctor.name.charAt(0)}
        </div>
        <div className="doctor-info">
          <h3>{doctor.name}</h3>
          <p className="doctor-specialization">{doctor.specialization}</p>
        </div>
      </div>
      
      <div className="doctor-details">
        <div className="detail-item">
          <span className="detail-label">📚 Qualification:</span>
          <span className="detail-value">{doctor.qualification}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">⏰ Experience:</span>
          <span className="detail-value">{doctor.experience} years</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">🕐 Availability:</span>
          <span className="detail-value">{doctor.availability}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">💰 Fee:</span>
          <span className="detail-value">₹{doctor.consultation_fee}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">⭐ Rating:</span>
          <span className="detail-value">{doctor.rating}/5.0</span>
        </div>
      </div>
      
      {onBook && (
        <button onClick={() => onBook(doctor)} className="btn btn-primary book-btn">
          Book Appointment
        </button>
      )}
    </div>
  );
};

export default DoctorCard;