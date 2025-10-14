import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Render your App component (wrapped in StrictMode, standard for React dev)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);