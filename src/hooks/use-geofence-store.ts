import type { GeofenceData, GeofencePolygon, LatLngCoord } from "@/types";
import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useGeofenceStore = () => {
  const [geofences, setGeofences] = useState<GeofencePolygon[]>([]);
  const [activeForm, setActiveForm] = useState<GeofenceData | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const startDrawing = useCallback((formData: GeofenceData) => {
    setActiveForm(formData);
    setDrawingEnabled(true);
  }, []);

  const completeDrawing = useCallback((path: LatLngCoord[]) => {
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

  return {
    geofences,
    activeForm,
    drawingEnabled,
    startDrawing,
    completeDrawing,
  };
};
