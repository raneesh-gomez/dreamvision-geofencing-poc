import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { GeofencePolygon } from '@/types';

export const convertGeofencesToGeoJSON = (
  geofences: GeofencePolygon[]
): FeatureCollection => {
  const features: Feature<Polygon>[] = geofences.map((geofence) => {
    // Make sure to use the original path for GeoJSON conversion
    // This ensures that the GeoJSON reflects the original user input
    const coordinates = [
      geofence.originalPath.map((coord) => [coord.lng, coord.lat])
    ];

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates,
      },
      properties: {
        id: geofence.id,
        name: geofence.data.name,
        type: geofence.data.type,
        parentId: geofence.data.parentId,
        priority: geofence.data.priority,
        metadata: geofence.data.metadata,
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
};
