import booleanContains from "@turf/boolean-contains";
import { polygon as turfPolygon } from "@turf/helpers";
import type { GeofencePolygon, LatLngCoord } from "@/types";

/**
 * Converts a geofence polygon path to a Turf.js polygon.
 */
const toTurfPolygon = (path: LatLngCoord[]) => {
  const coordinates = path.map(({ lng, lat }) => [lng, lat]);
  
  // Ensure the polygon is closed (first and last point must match)
  if (
    coordinates.length > 0 &&
    (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1])
  ) {
    coordinates.push(coordinates[0]);
  }
  return turfPolygon([coordinates]);
};

/**
 * Validates if the given child geofence is entirely contained within its parent.
 */
export const validateContainment = (
  child: GeofencePolygon,
  parent: GeofencePolygon | undefined
): boolean => {
  if (!parent) return false;

  const childPoly = toTurfPolygon(child.path);
  const parentPoly = toTurfPolygon(parent.path);

  return booleanContains(parentPoly, childPoly);
};
