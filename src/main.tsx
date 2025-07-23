import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import GeofenceProvider from './contexts/geofence-context/GeofenceProvider.tsx'
import AppProvider from './contexts/app-context/AppProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <GeofenceProvider>
        <App />
      </GeofenceProvider>
    </AppProvider>
  </StrictMode>,
)
