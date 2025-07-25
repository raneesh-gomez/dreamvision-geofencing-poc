import { Download, Upload } from "lucide-react";
import { Button } from "../ui/button";
import GeofenceCreateDialog from "./GeofenceCreateDialog";
import GeofenceList from "./GeofenceList";
import { retrieveGeofences } from "@/services/geofence.service";
import { useAppContext } from "@/hooks/use-app-context";
import { convertGeofencesToGeoJSON } from "@/lib/geofence-utils/geojson-utils";

const GeofenceManager = () => {
    const { user } = useAppContext();

    const handleExport = async () => {
        if (!user) return;
        const { data: geofences } = await retrieveGeofences(user.id)
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
                <Button variant="outline" className="w-1/4 hover:cursor-pointer" onClick={handleExport}>
                    <Download className="w-3 h-3" />Export
                </Button>
                <Button variant="outline" className="w-1/4 hover:cursor-pointer">
                    <Upload className="w-3 h-3" />Import
                </Button>
                {/* TODO Add GeoJSON import functionality */}
                <GeofenceCreateDialog />
            </div>
            

            <div className="mt-6 flex-1 flex flex-col overflow-hidden">
                <GeofenceList />
            </div>
        </div>
    );
};

export default GeofenceManager;
