import type { User } from "@supabase/supabase-js";
import type { ActiveDashboardTab, GeofenceTypes } from "./constants";

type SignUpOptions = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    ngoId: string | null;
    fspId: string | null;
};

type LatLngCoord = { lat: number; lng: number };

type GeofenceType = typeof GeofenceTypes[keyof typeof GeofenceTypes];

type ActiveDashboardTabType = typeof ActiveDashboardTab[keyof typeof ActiveDashboardTab];

type GeoFenceRow = {
  id: string;
  created_by: string;
  original_path: LatLngCoord[];
  clipped_path: LatLngCoord[];
  name: string;
  type: string;
  priority: number;
  parent_id?: string | null;
  metadata?: Record<string, string>;
  country_iso?: string | null;
  created_date: string;
  updated_date: string;
};

type DbOperator = "eq" | "ilike";

type DbFetchFilter = {
  column: string;
  operator: DbOperator;
  value: unknown
};

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
  updateGeofenceData: (id: string, updatedData: GeofenceData) => void;
  deleteGeofence: (id: string) => void;
  refreshGeofences: () => Promise<void>;
  setGeofences: React.Dispatch<React.SetStateAction<GeofencePolygon[]>>;
}

export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NGO {
  id: string;
  name: string;
}

export interface FSP {
  id: string;
  name: string;
}

export type {
    SignUpOptions,
    LatLngCoord,
    GeofenceType,
    ActiveDashboardTabType,
    GeoFenceRow,
    DbOperator,
    DbFetchFilter
};