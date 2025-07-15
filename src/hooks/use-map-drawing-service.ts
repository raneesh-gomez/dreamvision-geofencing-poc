import type { LatLngCoord, PolygonCompleteCallback } from "@/types";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef } from "react";

const useMapDrawingService = (drawingEnabled: boolean, onPolygonComplete: PolygonCompleteCallback) => {
    const map = useMap();
    const mapDrawingLibrary = useMapsLibrary('drawing');
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
    const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

    // Extract polygon path and convert to coordinate array
    const getPathCoordinates = (path: google.maps.MVCArray<google.maps.LatLng>): LatLngCoord[] => {
        console.log("Path: ", path);
        const coords: LatLngCoord[] = [];
        for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coords.push({ lat: point.lat(), lng: point.lng() });
        }
        return coords;
    };

    // Attach live-edit listeners to a polygon
    const addPolygonChangeListeners = useCallback(
        (polygon: google.maps.Polygon, callback: PolygonCompleteCallback) => {
            const path = polygon.getPath();
            const update = () => callback(getPathCoordinates(path));

            listenersRef.current.push(path.addListener("set_at", update));
            listenersRef.current.push(path.addListener("insert_at", update));
            listenersRef.current.push(path.addListener("remove_at", update));
        },
        []
    );

    useEffect(() => {
        if (!map || !mapDrawingLibrary || drawingManagerRef.current) return;

        const manager = new mapDrawingLibrary.DrawingManager({
            drawingControl: false, // Hide default UI control
            polygonOptions: {
                editable: true,
                draggable: false,
            },
            map
        });

        drawingManagerRef.current = manager;

        return () => {
            manager.setMap(null);
            drawingManagerRef.current = null;
        };
    }, [map, mapDrawingLibrary]);

    useEffect(() => {
        const drawingManager = drawingManagerRef.current;
        console.log("Drawing enabled:", drawingEnabled);
        console.log("Drawing manager:", drawingManager);
        if (!drawingManager) return;

        // Clean up any old listeners
        listenersRef.current.forEach((l) => google.maps.event.removeListener(l));
        listenersRef.current = [];

        if (drawingEnabled) {
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

            const onOverlayComplete = (event: google.maps.drawing.OverlayCompleteEvent) => {
                if (
                    event.type === google.maps.drawing.OverlayType.POLYGON &&
                    event.overlay instanceof google.maps.Polygon
                ) {
                    const polygon = event.overlay;
                    const coords = getPathCoordinates(polygon.getPath());

                    onPolygonComplete(coords);
                    addPolygonChangeListeners(polygon, onPolygonComplete);
                }
            };

            const listener = google.maps.event.addListener(drawingManager, "overlaycomplete", onOverlayComplete);
            listenersRef.current.push(listener);
        } else {
            drawingManager.setDrawingMode(null);
        }

        return () => {
            listenersRef.current.forEach((l) => google.maps.event.removeListener(l));
            listenersRef.current = [];
        };
    }, [drawingEnabled, onPolygonComplete, addPolygonChangeListeners]);

    return drawingManagerRef.current;
}

export default useMapDrawingService;