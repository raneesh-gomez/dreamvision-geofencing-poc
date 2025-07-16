import type { GeofenceTypes } from "./constants";

type LatLngCoord = { lat: number; lng: number };

type GeofenceType = typeof GeofenceTypes[keyof typeof GeofenceTypes];

export interface GeofenceData {
  name: string;
  type: GeofenceType;
  priority: number;
  parentId: string | null;
  metadata: Record<string, string>;
}

export interface GeofencePolygon {
  id: string;
  path: LatLngCoord[];
  data: GeofenceData;
}

export interface GeofenceContextType {
  geofences: GeofencePolygon[];
  activeForm: GeofenceData | null;
  drawingEnabled: boolean;
  startDrawing: (formData: GeofenceData) => void;
  completeDrawing: (path: { lat: number; lng: number }[]) => void;
  updateGeofencePath: (id: string, newPath: LatLngCoord[]) => void;
}

export type {
    LatLngCoord,
    GeofenceType
};