import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the custom service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// Silence the benign Vite WebSocket connection error
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    (typeof event.reason === 'string' && event.reason.includes('WebSocket closed without opened')) ||
    (event.reason.message && event.reason.message.includes('WebSocket closed without opened'))
  )) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
