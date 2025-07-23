import { GeofenceContext } from '@/contexts/geofence-context/GeofenceContext';
import { useContext } from 'react';

export const useGeofenceContext = () => {
  const context = useContext(GeofenceContext);
  if (!context) throw new Error('useGeofenceContext must be used within a GeofenceProvider');
  return context;
};