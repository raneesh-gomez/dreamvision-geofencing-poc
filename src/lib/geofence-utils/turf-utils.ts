import booleanContains from "@turf/boolean-contains";
import difference from "@turf/difference";
import { polygon as turfPolygon, featureCollection } from "@turf/helpers";
import type { GeofencePolygon, LatLngCoord } from "@/types";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import groupBy from "lodash/groupBy";

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
 * Computes the effective areas for each geofence after resolving overlaps
 * by priority. Lower priority geofences lose overlapping areas to higher ones.
 */
export const computeEffectiveAreas = (
  geofences: GeofencePolygon[]
): FeatureCollection<Polygon | MultiPolygon> => {
  const byType = groupBy(geofences, (g) => g.data.type);
  const effectiveFeatures: Feature<Polygon | MultiPolygon>[] = [];

  for (const type in byType) {
    const sameTypeGeofences = byType[type].sort(
      (a, b) => a.data.priority - b.data.priority // lower number = higher priority
    );

    const assigned: Feature<Polygon | MultiPolygon>[] = [];

    for (const g of sameTypeGeofences) {
      const isCountry = g.data.type === "country";

      const current: Feature<Polygon> = toTurfPolygon(g.path);

      // Skip non-country geofences if not contained in parent
      if (!isCountry && g.data.parentId) {
        const parent = geofences.find((p) => p.id === g.data.parentId);
        if (!validateContainment(g, parent)) continue;
      }

      if (isCountry) {
        // Do not include country in effective output
        assigned.push(current);
        continue;
      }

      let effective: Feature<Polygon | MultiPolygon> | null = current;

      for (const higher of assigned) {
        if (!effective) break;

        const diff = difference(featureCollection([effective, higher]));

        if (!diff) {
          effective = null;
          break;
        }

        effective = diff;
      }

      if (effective) {
        assigned.push(effective);
        effectiveFeatures.push(effective);
      }
    }
  }

  return featureCollection(effectiveFeatures);
};