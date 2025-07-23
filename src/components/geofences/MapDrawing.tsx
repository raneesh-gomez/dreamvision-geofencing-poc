import useMapDrawingService from "@/hooks/use-map-drawing-service";

/**
 * NOTE: This component is only used to make sure that the map drawing service is initialized after the map is loaded.
 * It does not render anything on the UI. 
 */
const MapDrawing = () => {
    useMapDrawingService();

    return null;
}

export default MapDrawing;