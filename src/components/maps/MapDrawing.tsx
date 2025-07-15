import useMapDrawingService from "@/hooks/use-map-drawing-service";
import type { PolygonCompleteCallback } from "@/types";

const MapDrawing = ({
  drawingEnabled,
  onPolygonComplete,
}: {
  drawingEnabled: boolean;
  onPolygonComplete: PolygonCompleteCallback;
}) => {
    useMapDrawingService(drawingEnabled, onPolygonComplete);

    return null;
}

export default MapDrawing;