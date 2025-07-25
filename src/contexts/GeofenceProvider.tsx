import React, { useState, useCallback } from 'react';

import { toast } from 'sonner';

import { GeofenceContext } from './GeofenceContext';
import type { GeofenceData, GeofencePolygon, LatLngCoord } from '@/types';
import { createGeofence, updateGeofencePath as applyGeofenceUpdate } from '@/services/geofence.service';

export const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geofences, setGeofences] = useState<GeofencePolygon[]>([]);
  const [activeForm, setActiveForm] = useState<GeofenceData | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [focusedGeofence, setFocusedGeofence] = useState<GeofencePolygon | null>(null);

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
  const completeDrawing = useCallback(
    (path: LatLngCoord[], formData?: GeofenceData) => {
      const data = formData || activeForm;
      if (!data) return;

      const result = createGeofence(path, data, geofences);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.geofence) {
        const newGeofence = result.geofence;
        setGeofences((prev) => [...prev, newGeofence]);
        setDrawingEnabled(false);
        setActiveForm(null);
        toast.success("Geofence created successfully!");
      }
    },
    [activeForm, geofences]
  );

  /**
   * Updates the path of an existing geofence polygon.
   * This is used when the user edits the polygon on the map.
   */
  const updateGeofencePath = (id: string, newPath: LatLngCoord[]) => {
    const result = applyGeofenceUpdate(id, newPath, geofences);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.updatedList) {
      setGeofences(result.updatedList);
      toast.success("Geofence updated successfully!");
    }
  };

  const updateGeofenceData = (id: string, updatedData: GeofenceData) => {
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
        focusedGeofence,
        setFocusedGeofence,
        startDrawing, 
        completeDrawing,
        updateGeofencePath,
        updateGeofenceData,
        deleteGeofence
      }}
    >
      {children}
    </GeofenceContext.Provider>
  );
};

export default GeofenceProvider;
