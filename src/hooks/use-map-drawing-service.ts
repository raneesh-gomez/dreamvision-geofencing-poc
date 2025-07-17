import { GeofenceColors, GeofenceTypes } from "@/constants";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useGeofenceContext } from "./use-geofence-context";
import { getPathCoordinates } from "@/lib/geofence-utils/map-utils";
import type { GeofencePolygon } from "@/types";

const useMapDrawingService = () => {
    const { 
        geofences, 
        drawingEnabled, 
        activeForm,
        effectiveAreas,
        showEffectiveAreas,
        setFocusedGeofence,
        completeDrawing, 
        updateGeofencePath 
    } = useGeofenceContext();
    const map = useMap();
    const mapDrawingLibrary = useMapsLibrary('drawing');
    
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
    const drawingListenersRef = useRef<google.maps.MapsEventListener[]>([]);
    const polygonListenersRef = useRef<google.maps.MapsEventListener[]>([]);
    const drawnPolygonsRef = useRef<google.maps.Polygon[]>([]);
    const effectiveAreaPolygonsRef = useRef<google.maps.Polygon[]>([]);

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

    const attachPolygonClickListener = useCallback(
        (polygon: google.maps.Polygon, geofence: GeofencePolygon) => {
            const handleClick = () => {
                setFocusedGeofence(geofence);
            };

            polygonListenersRef.current.push(google.maps.event.addListener(polygon, "click", handleClick));
    }, [setFocusedGeofence]);

    const clearListeners = (ref: RefObject<google.maps.MapsEventListener[]>) => {
        ref.current.forEach((l) => google.maps.event.removeListener(l));
        ref.current = [];
    };

    const clearPolygons = (ref: RefObject<google.maps.Polygon[]>) => {
        ref.current.forEach((polygon) => polygon.setMap(null));
        ref.current = [];
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
        clearPolygons(drawnPolygonsRef);

        geofences.forEach((g) => {
            const polygon = new google.maps.Polygon({
                paths: g.path,
                map,
                editable: g.data.type !== GeofenceTypes.COUNTRY,
                draggable: g.data.type !== GeofenceTypes.COUNTRY,
                strokeColor: GeofenceColors[g.data.type],
                fillColor: GeofenceColors[g.data.type],
                fillOpacity: 0.2,
            });

            attachPolygonChangeListeners(polygon, g.id);
            attachPolygonClickListener(polygon, g);
            drawnPolygonsRef.current.push(polygon);
        });

        return () => {
            clearListeners(polygonListenersRef);
            clearPolygons(drawnPolygonsRef);
        };
    }, [map, geofences, attachPolygonChangeListeners, attachPolygonClickListener]);

    /**
     * This effect handles the display of effective areas on the map.
     * It clears any previously displayed effective area polygons and adds new ones based on the effectiveAreas state.
     */
    useEffect(() => {
        if (!map || !showEffectiveAreas) return;

        // Clear previous effective area polygons
        clearPolygons(effectiveAreaPolygonsRef);

        effectiveAreas.features.forEach((feature) => {
            if (feature.geometry.type === "Polygon") {
                const coords = feature.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));

                const polygon = new google.maps.Polygon({
                    paths: coords,
                    map,
                    strokeColor: "#000000",
                    fillColor: "#8B5CF6",
                    fillOpacity: 0.8,
                    strokeOpacity: 1,
                    strokeWeight: 4,
                    clickable: false,
                    zIndex: 1,
                });

                effectiveAreaPolygonsRef.current.push(polygon);
            }
        });

        return () => {
            clearPolygons(effectiveAreaPolygonsRef);
        };
    }, [map, effectiveAreas, showEffectiveAreas]);

    return drawingManagerRef.current;
}

export default useMapDrawingService;