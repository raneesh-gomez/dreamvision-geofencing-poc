import type { GeofenceType } from "./types";

export const GeofenceTypes = {
  COUNTRY: "country",
  BRANCH: "branch",
  SUBBRANCH: "subbranch",
  FIELD_OFFICER: "field_officer",
};

export const GeofenceTypeLabels: Record<GeofenceType, string> = {
  [GeofenceTypes.COUNTRY]: "Country",
  [GeofenceTypes.BRANCH]: "Branch",
  [GeofenceTypes.SUBBRANCH]: "Sub-branch",
  [GeofenceTypes.FIELD_OFFICER]: "Field Officer",
};

export const GeofenceColors: Record<GeofenceType, string> = {
  [GeofenceTypes.COUNTRY]: "#1D4ED8",      // blue
  [GeofenceTypes.BRANCH]: "#10B981",       // green
  [GeofenceTypes.SUBBRANCH]: "#F59E0B",    // amber
  [GeofenceTypes.FIELD_OFFICER]: "#EF4444", // red
};

export const RequiredParent: Record<GeofenceType, string | null> = {
  [GeofenceTypes.COUNTRY]: null,
  [GeofenceTypes.BRANCH]: GeofenceTypes.COUNTRY,
  [GeofenceTypes.SUBBRANCH]: GeofenceTypes.BRANCH,
  [GeofenceTypes.FIELD_OFFICER]: GeofenceTypes.SUBBRANCH,
};