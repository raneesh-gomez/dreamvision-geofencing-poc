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
 * Checks if a geofence polygon overlaps with any of its siblings that have the same priority.
 */
export const hasSamePriorityOverlapWithSibling = (
  geofence: GeofencePolygon,
  siblings: GeofencePolygon[]
): boolean =>{
  const geofencePoly = toTurfPolygon(geofence.originalPath);
  return siblings.some(sibling =>
    sibling.data.priority === geofence.data.priority &&
    booleanIntersects(geofencePoly, toTurfPolygon(sibling.originalPath))
  );
}

/**
 * Clipping function to ensure child polygon fits inside parent.
 */
export const clipToParent = (
  child: GeofencePolygon,
  parent: GeofencePolygon
): GeofencePolygon | null => {
  const childPoly = toTurfPolygon(child.originalPath);
  const parentPoly = toTurfPolygon(parent.clippedPath);

  const clipped = intersect(featureCollection([parentPoly, childPoly]));
  if (!clipped || clipped.geometry.type !== "Polygon") return null;

  return {
    ...child,
    clippedPath: clipped.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }))
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
  let geofencePoly = toTurfPolygon(geofence.clippedPath);

  siblings
    .filter(sibling => sibling.data.priority < geofence.data.priority)
    .forEach(higher => {
      const higherFeature = toTurfPolygon(higher.clippedPath);
      const diff = difference(featureCollection([geofencePoly, higherFeature]));
      if (diff && diff.geometry.type === "Polygon") {
        geofencePoly = diff as Feature<Polygon, GeoJsonProperties>;
      }
    });

  return {
    ...geofence,
    clippedPath: geofencePoly.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }))
  };
};

/**
 * Re-clips all affected child and lower-priority sibling geofences when a parent or sibling is edited.
 */
export const resolveDownstreamClipping = (
  updatedGeofence: GeofencePolygon,
  allGeofences: GeofencePolygon[]
): GeofencePolygon[] => {
  const updatedPoly = toTurfPolygon(updatedGeofence.clippedPath);

  return allGeofences.map((g) => {
    // Skip the updated one
    if (g.id === updatedGeofence.id) return g;

    // ✂️ Child geofences affected by updated parent
    if (g.data.parentId === updatedGeofence.id) {
      const clipped = intersect(featureCollection([updatedPoly, toTurfPolygon(g.originalPath)]));
      if (clipped && clipped.geometry.type === "Polygon") {
        return {
          ...g,
          clippedPath: clipped.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng })),
        };
      }
    }

    // ✂️ Lower-priority siblings
    if (
      g.data.parentId === updatedGeofence.data.parentId &&
      g.data.type === updatedGeofence.data.type &&
      g.data.priority > updatedGeofence.data.priority
    ) {
      const diff = difference(featureCollection([toTurfPolygon(g.originalPath), updatedPoly]));
      if (diff && diff.geometry.type === "Polygon") {
        return {
          ...g,
          clippedPath: diff.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng })),
        };
      }
    }

    return g;
  });
};