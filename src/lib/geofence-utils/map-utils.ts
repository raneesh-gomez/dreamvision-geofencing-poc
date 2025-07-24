import type { LatLngCoord } from "@/types";
import type { GeofenceData, GeofencePolygon } from "@/types";
import { GeofenceTypeLabels, GeofenceTypes, AllowedParents } from "@/constants";

/**
 * Validates the structure of a geofence based on hierarchy rules.
 * Ensures required parent exists and is of correct type.
 */
export function validateStructure(
  geofence: GeofenceData,
  allGeofences: GeofencePolygon[]
): string | null {
    // Country does not require a parent
    if (geofence.type === GeofenceTypes.COUNTRY) return null;

    // For other types, check if a parent is required
    const allowedParentTypes = AllowedParents[geofence.type];
    if (!allowedParentTypes) {
      return `No hierarchy rule defined for ${geofence.type}.`;
    }

    // If a parent is required, check if it exists and is of the correct type
    if (!geofence.parentId) {
        return `Please select a parent geofence for ${geofence.type}.`;
    }

    const parent = allGeofences.find(g => g.id === geofence.parentId);

    if (!parent) {
        return `The selected parent geofence does not exist.`;
    }

    if (!allowedParentTypes.includes(parent.data.type)) {
      const expectedTypes = allowedParentTypes
        .map(type => `"${GeofenceTypeLabels[type]}"`)
        .join(" or ");
      return `The selected parent must be of type ${expectedTypes}, but is a "${GeofenceTypeLabels[parent.data.type]}".`;
    }

    return null;
}

/**
 * Converts a Google Maps path to an array of LatLngCoord objects.
 * This is useful for extracting coordinates from a polygon path.
 */
export const getPathCoordinates = (path: google.maps.MVCArray<google.maps.LatLng>) => {
  const coords: LatLngCoord[] = [];
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    coords.push({ lat: point.lat(), lng: point.lng() });
  }
  return coords;
};