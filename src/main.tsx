import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import GeofenceProvider from './contexts/GeofenceProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GeofenceProvider>
      <App />
    </GeofenceProvider>
  </StrictMode>,
)
