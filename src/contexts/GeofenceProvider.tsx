import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GeofenceContext } from './GeofenceContext';
import type { GeofenceData, GeofencePolygon, LatLngCoord } from '@/types';

export const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geofences, setGeofences] = useState<GeofencePolygon[]>([]);
  const [activeForm, setActiveForm] = useState<GeofenceData | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  useEffect(() => {
    console.log("Geofences updated:", geofences);
  }, [geofences]);

  /**
   * Starts the drawing process by setting the active form data.
   * This enables the drawing mode in the map.
   */
  const startDrawing = useCallback((formData: GeofenceData) => {
    setActiveForm(formData);
    setDrawingEnabled(true);
  }, []);

  /**
   * Completes the drawing process by creating a new geofence polygon
   * with the provided path and active form data.
   */
  const completeDrawing = useCallback((path: { lat: number; lng: number }[]) => {
    if (!activeForm) return;
    const id = uuidv4();
    const newGeofence: GeofencePolygon = {
      id,
      path,
      data: { ...activeForm },
    };
    setGeofences(prev => [...prev, newGeofence]);
    setDrawingEnabled(false);
    setActiveForm(null);
  }, [activeForm]);

  /**
   * Updates the path of an existing geofence polygon.
   * This is used when the user edits the polygon on the map.
   */
  const updateGeofencePath = (id: string, newPath: LatLngCoord[]) => {
    setGeofences((prev) =>
        prev.map((g) =>
            g.id === id ? { ...g, path: newPath } : g
        )
    );
  };

  const updateGeofence = (id: string, updatedData: GeofenceData) => {
    setGeofences(prev =>
      prev.map(g =>
        g.id === id ? { ...g, data: { ...updatedData } } : g
      )
    );
  };

  const deleteGeofence = useCallback((id: string) => {
    const collectAllChildren = (targetId: string): string[] => {
      const directChildren = geofences.filter(g => g.data.parentId === targetId);
      const nestedChildren = directChildren.flatMap(child => collectAllChildren(child.id));
      return [targetId, ...nestedChildren];
    };

    const idsToDelete = collectAllChildren(id);

    setGeofences((prev) => prev.filter((g) => !idsToDelete.includes(g.id)));
  }, [geofences]);

  return (
    <GeofenceContext.Provider value={{ 
        geofences, 
        activeForm, 
        drawingEnabled, 
        startDrawing, 
        completeDrawing,
        updateGeofencePath,
        updateGeofence,
        deleteGeofence
      }}
    >
      {children}
    </GeofenceContext.Provider>
  );
};

export default GeofenceProvider;
