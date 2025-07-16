import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
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
  effectiveAreas: FeatureCollection<Polygon | MultiPolygon>;
  showEffectiveAreas: boolean;
  setShowEffectiveAreas: React.Dispatch<React.SetStateAction<boolean>>;
  setEffectiveAreas: React.Dispatch<React.SetStateAction<FeatureCollection<Polygon | MultiPolygon>>>;
  startDrawing: (formData: GeofenceData) => void;
  completeDrawing: (path: LatLngCoord[]) => void;
  updateGeofencePath: (id: string, newPath: LatLngCoord[]) => void;
  updateGeofence: (id: string, updatedData: GeofenceData) => void;
  deleteGeofence: (id: string) => void;
}

export type {
    LatLngCoord,
    GeofenceType
};