import React from 'react';
import './VideoCall.css';

const VideoCall = ({ videoLink, onClose }) => {
  return (
    <div className="video-modal">
      <div className="video-modal-content">
        <div className="video-modal-header">
          <h2>Video Consultation</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="video-container">
          <iframe
            src={videoLink}
            title="Video Call"
            allow="camera; microphone; fullscreen; display-capture"
            className="video-iframe"
          />
        </div>
        <div className="video-modal-footer">
          <p>💡 Make sure to allow camera and microphone access</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;