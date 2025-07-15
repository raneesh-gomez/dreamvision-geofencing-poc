import useMapDrawingService from "@/hooks/use-map-drawing-service";
import type { PolygonCompleteCallback } from "@/types";

const MapDrawing = ({
  drawingEnabled,
  onPolygonComplete,
}: {
  drawingEnabled: boolean;
  onPolygonComplete: PolygonCompleteCallback;
}) => {
    // const handlePolygonComplete = (coords: { lat: number; lng: number }[]) => {
    //     console.log("Polygon drawn:", coords);
    // };

    useMapDrawingService(drawingEnabled, onPolygonComplete);

    return null;
}

export default MapDrawing;