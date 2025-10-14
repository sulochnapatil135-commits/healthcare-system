import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import './BookAppointment.css';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.data.doctors);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleChange = (e) => {
    setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);

    try {
      await appointmentsAPI.book({
        doctor_id: selectedDoctor.doctor_id,
        ...appointmentData,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="book-appointment">
      <div className="container">
        <h1 className="page-title">Book an Appointment</h1>

        {!selectedDoctor ? (
          <div className="doctors-section">
            <h2>Select a Doctor</h2>
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.doctor_id}
                  doctor={doctor}
                  onBook={handleDoctorSelect}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="booking-section">
            <div className="booking-grid">
              <div className="selected-doctor">
                <h2>Selected Doctor</h2>
                <DoctorCard doctor={selectedDoctor} />
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="btn btn-secondary"
                >
                  Change Doctor
                </button>
              </div>

              <div className="booking-form-container">
                <h2>Appointment Details</h2>
                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="form-group">
                    <label>Appointment Date</label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={appointmentData.appointment_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Appointment Time</label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={appointmentData.appointment_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={appointmentData.notes}
                      onChange={handleChange}
                      placeholder="Describe your symptoms or concerns..."
                      rows="4"
                    />
                  </div>

                  <div className="booking-summary">
                    <div className="summary-row">
                      <span>Consultation Fee:</span>
                      <span className="fee">₹{selectedDoctor.consultation_fee}</span>
                    </div>
                    <div className="summary-row">
                      <span>Video Call:</span>
                      <span className="included">✓ Included</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={booking}
                  >
                    {booking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;