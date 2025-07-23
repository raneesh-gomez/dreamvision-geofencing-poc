import type { GeofenceData, GeofenceType } from "./types";

export const GeofenceTypes = {
  COUNTRY: "country",
  BRANCH: "branch",
  SUBBRANCH: "sub_branch",
  FIELD_OFFICER: "field_officer",
};

export const GeofenceTypeLabels: Record<GeofenceType, string> = {
  [GeofenceTypes.COUNTRY]: "Country",
  [GeofenceTypes.BRANCH]: "Branch",
  [GeofenceTypes.SUBBRANCH]: "Sub-branch",
  [GeofenceTypes.FIELD_OFFICER]: "Field Officer",
};

export const GeofenceColors: Record<GeofenceType, string> = {
  [GeofenceTypes.COUNTRY]: "#3B82F6",       // blue
  [GeofenceTypes.BRANCH]: "#FB923C",        // orange
  [GeofenceTypes.SUBBRANCH]: "#84CC16",     // lime
  [GeofenceTypes.FIELD_OFFICER]: "#EC4899", // pink
};

export const RequiredParent: Record<GeofenceType, string | null> = {
  [GeofenceTypes.COUNTRY]: null,
  [GeofenceTypes.BRANCH]: GeofenceTypes.COUNTRY,
  [GeofenceTypes.SUBBRANCH]: GeofenceTypes.BRANCH,
  [GeofenceTypes.FIELD_OFFICER]: GeofenceTypes.SUBBRANCH,
};

export const InitialGeofenceData: GeofenceData = {
    name: "",
    type: GeofenceTypes.BRANCH,
    priority: 0,
    parentId: null,
    metadata: {},
};

export const ActiveDashboardTab = {
  GEOFENCES: "geofences",
  ORGANIZATION: "organization"
};