import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { GeofencePolygon } from '@/types';

export const convertGeofencesToGeoJSON = (
  geofences: GeofencePolygon[]
): FeatureCollection => {
  const features: Feature<Polygon>[] = geofences.map((geofence) => {
    const coordinates = [
      geofence.path.map((coord) => [coord.lng, coord.lat])
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
