import useMapDrawingService from "@/hooks/use-map-drawing-service";
import type { GeofenceData, PolygonCompleteCallback } from "@/types";

const MapDrawing = ({
  drawingEnabled,
  activeForm,
  onPolygonComplete,
}: {
  drawingEnabled: boolean;
  activeForm: GeofenceData | null;
  onPolygonComplete: PolygonCompleteCallback;
}) => {
    useMapDrawingService(drawingEnabled, activeForm, onPolygonComplete);

    return null;
}

export default MapDrawing;