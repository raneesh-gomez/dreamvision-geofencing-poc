import booleanContains from "@turf/boolean-contains";
import booleanIntersects from "@turf/boolean-intersects";
import difference from "@turf/difference";
import intersect from "@turf/intersect";
import { polygon as turfPolygon, featureCollection } from "@turf/helpers";
import type { GeofencePolygon, LatLngCoord } from "@/types";
import type { Feature, GeoJsonProperties, Polygon } from "geojson";

/**
 * Converts a geofence polygon path to a Turf.js polygon.
 */
export const toTurfPolygon = (path: LatLngCoord[]): Feature<Polygon> => {
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

/**
 * Checks if a geofence polygon overlaps with any of its siblings that have the same priority.
 */
export const hasSamePriorityOverlapWithSibling = (
  geofence: GeofencePolygon,
  siblings: GeofencePolygon[]
): boolean =>{
  const geofencePoly = toTurfPolygon(geofence.path);

  for (const sibling of siblings) {
    const siblingPoly = toTurfPolygon(sibling.path);

    const isSamePriority = sibling.data.priority === geofence.data.priority;
    const isOverlapping = booleanIntersects(geofencePoly, siblingPoly);

    if (isSamePriority && isOverlapping) {
      return true; // Found an overlapping sibling with the same priority
    }
  }

  return false; // No overlapping siblings found
  
}

/**
 * Clipping function to ensure child polygon fits inside parent.
 */
export const clipToParent = (
  child: GeofencePolygon,
  parent: GeofencePolygon
): GeofencePolygon | null => {
  const childPoly = toTurfPolygon(child.path);
  const parentPoly = toTurfPolygon(parent.path);

  const clipped = intersect(featureCollection([parentPoly, childPoly]));
  if (!clipped || clipped.geometry.type !== "Polygon") return null;

  return {
    ...child,
    path: clipped.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }))
  };
};

/**
 * Clips a geofence polygon to higher priority siblings.
 * This ensures that the geofence does not overlap with any sibling geofences of higher priority.
 */
export const clipToHigherPrioritySiblings = (
  geofence: GeofencePolygon,
  siblings: GeofencePolygon[]
): GeofencePolygon => {
  let geofencePoly = toTurfPolygon(geofence.path);

  siblings
    .filter(sibling => sibling.data.priority < geofence.data.priority)
    .forEach(higher => {
      const higherFeature = toTurfPolygon(higher.path);
      const diff = difference(featureCollection([geofencePoly, higherFeature]));
      if (diff && diff.geometry.type === "Polygon") {
        geofencePoly = diff as Feature<Polygon, GeoJsonProperties>;
      }
    });

  return {
    ...geofence,
    path: geofencePoly.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }))
  };
};

/**
 * Re-clips all affected child and lower-priority sibling geofences when a parent or sibling is edited.
 */
export const resolveDownstreamClipping = (
  updatedGeofence: GeofencePolygon,
  allGeofences: GeofencePolygon[]
): GeofencePolygon[] => {
  const updatedPoly = toTurfPolygon(updatedGeofence.path);

  return allGeofences.map((g) => {
    // Skip the updated one
    if (g.id === updatedGeofence.id) return g;

    // ✂️ Child geofences affected by updated parent
    if (g.data.parentId === updatedGeofence.id) {
      const clipped = intersect(featureCollection([updatedPoly, toTurfPolygon(g.path)]));
      if (clipped && clipped.geometry.type === "Polygon") {
        return {
          ...g,
          path: clipped.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng })),
        };
      }
    }

    // ✂️ Lower-priority siblings
    if (
      g.data.parentId === updatedGeofence.data.parentId &&
      g.data.type === updatedGeofence.data.type &&
      g.data.priority > updatedGeofence.data.priority
    ) {
      const diff = difference(featureCollection([toTurfPolygon(g.path), updatedPoly]));
      if (diff && diff.geometry.type === "Polygon") {
        return {
          ...g,
          path: diff.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng })),
        };
      }
    }

    return g;
  });
};