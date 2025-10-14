import React from 'react';
import { format } from 'date-fns';
import './AppointmentCard.css';

const AppointmentCard = ({ appointment, onCancel, onComplete, onJoinVideo, onUploadPrescription, userRole }) => {
  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge-scheduled',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return `badge ${badges[status] || ''}`;
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="appointment-info">
          <h3>
            {userRole === 'patient' ? appointment.doctor_name : appointment.patient_name}
          </h3>
          {userRole === 'patient' && (
            <p className="appointment-specialization">{appointment.specialization}</p>
          )}
        </div>
        <span className={getStatusBadge(appointment.status)}>
          {appointment.status}
        </span>
      </div>

      <div className="appointment-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <span>{formatDate(appointment.appointment_date)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">🕐</span>
          <span>{appointment.appointment_time}</span>
        </div>
        {userRole === 'patient' && appointment.consultation_fee && (
          <div className="detail-row">
            <span className="detail-icon">💰</span>
            <span>₹{appointment.consultation_fee}</span>
          </div>
        )}
        {userRole === 'doctor' && appointment.patient_phone && (
          <div className="detail-row">
            <span className="detail-icon">📞</span>
            <span>{appointment.patient_phone}</span>
          </div>
        )}
        {appointment.notes && (
          <div className="detail-row">
            <span className="detail-icon">📝</span>
            <span>{appointment.notes}</span>
          </div>
        )}
      </div>

      <div className="appointment-actions">
        {appointment.status === 'scheduled' && appointment.video_link && (
          <button onClick={() => onJoinVideo(appointment.video_link)} className="btn btn-success">
            📹 Join Video Call
          </button>
        )}

        {userRole === 'patient' && appointment.status === 'scheduled' && onCancel && (
          <button onClick={() => onCancel(appointment.appointment_id)} className="btn btn-danger">
            Cancel
          </button>
        )}

        {userRole === 'doctor' && appointment.status === 'scheduled' && onUploadPrescription && (
          <button onClick={() => onUploadPrescription(appointment.appointment_id)} className="btn btn-primary">
            📄 Upload Prescription
          </button>
        )}

        {userRole === 'doctor' && appointment.status === 'scheduled' && onComplete && (
          <button onClick={() => onComplete(appointment.appointment_id)} className="btn btn-success">
            ✓ Mark Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;