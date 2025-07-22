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
 * Recursively resolves clipping for downstream geofences.
 * This ensures that all child geofences are properly clipped to their parents and siblings.
 */
export const resolveDownstreamClippingRecursive = (
  updated: GeofencePolygon,
  allGeofences: GeofencePolygon[]
): GeofencePolygon[] => {
  const updatedMap = new Map<string, GeofencePolygon>();
  allGeofences.forEach((g) => updatedMap.set(g.id, { ...g }));

  updatedMap.set(updated.id, { ...updated });

  const recursivelyClipChildren = (parent: GeofencePolygon) => {
    const children = Array.from(updatedMap.values()).filter(
      (g) => g.data.parentId === parent.id
    );

    for (const child of children) {
      // ✂️ Step 1: Clip to new parent
      const clippedToParent = clipToParent(child, parent);
      if (!clippedToParent) continue;

      // 🔁 Step 2: Clip to higher priority siblings
      const siblings = Array.from(updatedMap.values()).filter(
        (g) =>
          g.data.parentId === clippedToParent.data.parentId &&
          g.data.type === clippedToParent.data.type &&
          g.id !== clippedToParent.id
      );

      const fullyClipped = clipToHigherPrioritySiblings(clippedToParent, siblings);
      updatedMap.set(child.id, fullyClipped);

      // 🧬 Step 3: Recurse into children
      recursivelyClipChildren(fullyClipped);
    }
  };

  recursivelyClipChildren(updatedMap.get(updated.id)!);
  return Array.from(updatedMap.values());
};