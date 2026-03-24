import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// --- ADD THIS BLOCK FOR ANDROID INSTALLATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Titan SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('Titan SW registration failed: ', registrationError);
      });
  });
}
