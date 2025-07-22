import type { GeofenceTypes } from "./constants";

type LatLngCoord = { lat: number; lng: number };

type GeofenceType = typeof GeofenceTypes[keyof typeof GeofenceTypes];

export interface GeofenceData {
  name: string;
  type: GeofenceType;
  priority: number;
  parentId: string | null;
  metadata: Record<string, string>;
  countryISO?: string;
}

export interface GeofencePolygon {
  id: string;
  originalPath: LatLngCoord[];
  clippedPath: LatLngCoord[];
  data: GeofenceData;
}

export interface GeofenceContextType {
  geofences: GeofencePolygon[];
  activeForm: GeofenceData | null;
  drawingEnabled: boolean;
  focusedGeofence: GeofencePolygon | null;
  setFocusedGeofence: React.Dispatch<React.SetStateAction<GeofencePolygon | null>>;
  startDrawing: (formData: GeofenceData) => void;
  completeDrawing: (path: LatLngCoord[], formData?: GeofenceData) => void;
  updateGeofencePath: (id: string, newPath: LatLngCoord[]) => void;
  updateGeofence: (id: string, updatedData: GeofenceData) => void;
  deleteGeofence: (id: string) => void;
}

export type {
    LatLngCoord,
    GeofenceType
};