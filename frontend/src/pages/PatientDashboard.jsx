import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appointmentsAPI } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import VideoCall from '../components/VideoCall';
import './Dashboard.css';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLink, setVideoLink] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getPatientAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentsAPI.cancel(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleJoinVideo = (link) => {
    setVideoLink(link);
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Patient Dashboard</h1>
          <Link to="/patient/book-appointment" className="btn btn-primary">
            📅 Book New Appointment
          </Link>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.scheduled}</div>
              <div className="stat-label">Scheduled</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-value">{stats.cancelled}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments yet</h3>
              <p>Book your first appointment with our expert doctors</p>
              <Link to="/patient/book-appointment" className="btn btn-primary">
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="appointment-card">
                  <AppointmentCard
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    onJoinVideo={handleJoinVideo}
                    userRole="patient"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {videoLink && (
        <VideoCall videoLink={videoLink} onClose={() => setVideoLink(null)} />
      )}
    </div>
  );
};

export default PatientDashboard;
