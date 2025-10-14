import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { appointmentsAPI, prescriptionsAPI } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import VideoCall from '../components/VideoCall';
import './Dashboard.css';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLink, setVideoLink] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getDoctorAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, 'completed');
      toast.success('Appointment marked as completed');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const handleUploadPrescription = (appointmentId) => {
    setUploadingFor(appointmentId);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('prescription', file);
    formData.append('appointment_id', uploadingFor);

    try {
      await prescriptionsAPI.upload(formData);
      toast.success('Prescription uploaded successfully');
      setUploadingFor(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to upload prescription');
    }
  };

  const handleJoinVideo = (link) => {
    setVideoLink(link);
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    today: appointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.appointment_date.split('T')[0] === today;
    }).length,
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
          <h1>Doctor Dashboard</h1>
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
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Today's Appointments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
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
        </div>

        <div className="dashboard-section">
          <h2>My Appointments</h2>
          
          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments yet</h3>
              <p>Your appointments will appear here</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.appointment_id}
                  appointment={appointment}
                  onComplete={handleCompleteAppointment}
                  onJoinVideo={handleJoinVideo}
                  onUploadPrescription={handleUploadPrescription}
                  userRole="doctor"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {uploadingFor && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <h3>Upload Prescription</h3>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="file-input"
            />
            <button onClick={() => setUploadingFor(null)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {videoLink && (
        <VideoCall videoLink={videoLink} onClose={() => setVideoLink(null)} />
      )}
    </div>
  );
};

export default DoctorDashboard;