import { Download, Upload } from "lucide-react";
import { Button } from "../ui/button";
import GeofenceCreateDialog from "./GeofenceCreateDialog";
import GeofenceList from "./GeofenceList";
import { retrieveGeofences } from "@/services/geofence.service";
import { useAppContext } from "@/hooks/use-app-context";
import { convertGeofencesToGeoJSON } from "@/lib/geofence-utils/geojson-utils";
import { useGeofenceContext } from "@/hooks/use-geofence-context";

const GeofenceManager = () => {
    const { drawingEnabled } = useGeofenceContext();
    const { user } = useAppContext();

    const handleExport = async () => {
        if (!user) return;
        const { fsp_id, ngo_id } = user.user_metadata
        const { data: geofences } = await retrieveGeofences(fsp_id, ngo_id);

        if (geofences) {
            const geojson = convertGeofencesToGeoJSON(geofences);
            const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'geofences.geojson';
            link.click();

            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-row items-center justify-start gap-4 w-full">
                    <Button variant="outline" className="w-1/3 hover:cursor-pointer" onClick={handleExport} disabled={drawingEnabled}>
                        <Download className="w-3 h-3" />Export
                    </Button>
                    {/* TODO Add GeoJSON import functionality */}
                    <Button variant="outline" className="w-1/3 hover:cursor-pointer" disabled={drawingEnabled}>
                        <Upload className="w-3 h-3" />Import
                    </Button>
                </div>
                <GeofenceCreateDialog />
            </div>

            <div className="mt-6 flex-1 flex flex-col overflow-hidden">
                <GeofenceList />
            </div>
        </div>
    );
};

export default GeofenceManager;
