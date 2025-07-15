import type { LatLngCoord } from "@/types";

export const getPathCoordinates = (path: google.maps.MVCArray<google.maps.LatLng>) => {
  const coords: LatLngCoord[] = [];
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    coords.push({ lat: point.lat(), lng: point.lng() });
  }
  return coords;
};