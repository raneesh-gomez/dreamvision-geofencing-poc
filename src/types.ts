type LatLngCoord = { lat: number; lng: number };
type PolygonCompleteCallback = (coordinates: LatLngCoord[]) => void;

export const GeofenceTypes = {
  COUNTRY: "country",
  BRANCH: "branch",
  SUBBRANCH: "subbranch",
  FIELD_OFFICER: "field_officer",
} as const;

type GeofenceType = typeof GeofenceTypes[keyof typeof GeofenceTypes];

export const GeofenceColors: Record<string, string> = {
  country: "#1D4ED8",      // blue
  branch: "#10B981",       // green
  subbranch: "#F59E0B",    // amber
  field_officer: "#EF4444", // red
};

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
  metadata: GeofenceData;
}

export type {
    LatLngCoord,
    PolygonCompleteCallback,
    GeofenceType
};