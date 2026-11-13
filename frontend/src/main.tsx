import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Progressive Web App (PWA) Service Worker & Purge Stale Caches
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== 'cyberguard-pwa-v5-fresh') {
        caches.delete(key);
      }
    });
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('🛡️ CyberGuard PWA Service Worker active:', reg.scope);
        reg.update();
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration notice:', err);
      });
  });
}
