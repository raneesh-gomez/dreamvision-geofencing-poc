import { GeofenceColors } from "@/constants";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useGeofenceContext } from "./use-geofence-context";
import { getPathCoordinates } from "@/lib/geofence-utils/map-utils";

const useMapDrawingService = () => {
    const { 
        geofences, 
        drawingEnabled, 
        activeForm, 
        completeDrawing, 
        updateGeofencePath 
    } = useGeofenceContext();
    const map = useMap();
    const mapDrawingLibrary = useMapsLibrary('drawing');
    
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
    const drawingListenersRef = useRef<google.maps.MapsEventListener[]>([]);
    const polygonListenersRef = useRef<google.maps.MapsEventListener[]>([]);
    const drawnPolygonsRef = useRef<google.maps.Polygon[]>([]);

    /**
     * Utility function to attach change listeners to a polygon.
     * This allows us to update the geofence path in real-time as the polygon is edited
     */
    const attachPolygonChangeListeners = useCallback(
        (polygon: google.maps.Polygon, geofenceId: string | null) => {
            const path = polygon.getPath();
            const update = () => {
                const updatedCoords = getPathCoordinates(path);
                if (geofenceId) {
                    updateGeofencePath(geofenceId, updatedCoords);
                } else {
                    completeDrawing(updatedCoords);
                }
            };

            polygonListenersRef.current.push(path.addListener("set_at", update));
            polygonListenersRef.current.push(path.addListener("insert_at", update));
            polygonListenersRef.current.push(path.addListener("remove_at", update));
        },
        [updateGeofencePath, completeDrawing]
    );

    const clearListeners = (ref: RefObject<google.maps.MapsEventListener[]>) => {
        ref.current.forEach((l) => google.maps.event.removeListener(l));
        ref.current = [];
    };

    const clearPolygons = () => {
        drawnPolygonsRef.current.forEach((polygon) => polygon.setMap(null));
        drawnPolygonsRef.current = [];
    };

    /**
     * This effect sets up the drawing manager when the map is available.
     * It creates a new DrawingManager instance and attaches it to the map.
     */
    useEffect(() => {
        if (!map || !mapDrawingLibrary || drawingManagerRef.current) return;

        const manager = new mapDrawingLibrary.DrawingManager({
            drawingControl: false,
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

    /**
     * This effect manages the drawing state and updates the DrawingManager options
     * based on the active form and drawingEnabled state.
     */
    useEffect(() => {
        const drawingManager = drawingManagerRef.current;
        if (!drawingManager) return;

        // Clean up any old listeners
        clearListeners(drawingListenersRef);

        if (drawingEnabled) {
            const polygonColor = activeForm?.type
                ? GeofenceColors[activeForm.type]
                : "#000000";

            drawingManager.setOptions({
                drawingControl: false,
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                polygonOptions: {
                    fillColor: polygonColor,
                    strokeColor: polygonColor,
                    fillOpacity: 0.5,
                    strokeWeight: 2,
                    editable: true,
                    draggable: false,
                    clickable: true
                },
            });

            const onOverlayComplete = (event: google.maps.drawing.OverlayCompleteEvent) => {
                if (
                    event.type === google.maps.drawing.OverlayType.POLYGON &&
                    event.overlay instanceof google.maps.Polygon
                ) {
                    const polygon = event.overlay;
                    const coords = getPathCoordinates(polygon.getPath());

                    completeDrawing(coords);
                    polygon.setMap(null);
                }
            };

            const listener = google.maps.event.addListener(drawingManager, "overlaycomplete", onOverlayComplete);
            drawingListenersRef.current.push(listener);
        } else {
            drawingManager.setDrawingMode(null);
        }

        return () => {
            clearListeners(drawingListenersRef);
        };
    }, [activeForm, drawingEnabled, completeDrawing]);

    /**
     * This effect updates the map with existing geofences.
     * It clears any previously drawn polygons and sets up new ones based on the geofences data.
     * It also attaches change listeners to each polygon to handle live edits.
     */
    useEffect(() => {
        if (!map) return;

        // Clean up previously drawn polygons and old listeners
        clearListeners(polygonListenersRef);
        clearPolygons();

        geofences.forEach((g) => {
            const polygon = new google.maps.Polygon({
                paths: g.path,
                map,
                editable: true,
                draggable: false,
                strokeColor: GeofenceColors[g.data.type],
                fillColor: GeofenceColors[g.data.type],
                fillOpacity: 0.2,
            });

            attachPolygonChangeListeners(polygon, g.id);
            drawnPolygonsRef.current.push(polygon);
        });

        return () => {
            clearListeners(polygonListenersRef);
            clearPolygons();
        };
    }, [map, geofences, attachPolygonChangeListeners]);

    return drawingManagerRef.current;
}

export default useMapDrawingService;