import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { initTouchUtils } from './touchUtils'

// Initialize touch utilities for better mobile experience
if (typeof window !== 'undefined') {
  // Only run on client-side
  initTouchUtils();
}

// Prevent browser bounce/zoom effects on double-tap
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)