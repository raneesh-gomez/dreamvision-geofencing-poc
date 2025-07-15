import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type GeofenceType = "country" | "branch" | "subbranch" | "field_officer";

export interface GeofenceMetadata {
  name: string;
  type: GeofenceType;
  priority: number;
  parentId: string | null;
  metadata: Record<string, string>;
}

export interface GeofencePolygon {
  id: string;
  path: { lat: number; lng: number }[];
  metadata: GeofenceMetadata;
}

export const useGeofenceStore = () => {
  const [geofences, setGeofences] = useState<GeofencePolygon[]>([]);
  const [activeForm, setActiveForm] = useState<GeofenceMetadata | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const startDrawing = useCallback((formData: GeofenceMetadata) => {
    setActiveForm(formData);
    setDrawingEnabled(true);
  }, []);

  const completeDrawing = useCallback((path: { lat: number; lng: number }[]) => {
    if (!activeForm) return;
    const id = uuidv4();
    const newGeofence: GeofencePolygon = {
      id,
      path,
      metadata: { ...activeForm },
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
