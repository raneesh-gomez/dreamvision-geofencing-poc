type LatLngCoord = { lat: number; lng: number };
type PolygonCompleteCallback = (coordinates: LatLngCoord[]) => void;

export type {
    LatLngCoord,
    PolygonCompleteCallback
};