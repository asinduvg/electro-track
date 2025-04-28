import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeDemoUsers } from './lib/auth';

// Initialize demo users
// initializeDemoUsers().catch(console.error);

createRoot(document.getElementById('root')!).render(
   //<StrictMode>
    <App />
   //</StrictMode>
);