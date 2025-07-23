import { ScrollArea } from "@/components/ui/scroll-area";
import { GeofenceColors } from "@/constants";
import { GeofenceTypeLabels } from '../../constants';
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { convertGeofencesToGeoJSON } from "@/lib/geofence-utils/geojson-utils";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import GeofenceCreateDialog from "./GeofenceCreateDialog";
import GeofenceEditDialog from "./GeofenceEditDialog";
import GeofenceOnFocus from "./GeofenceOnFocus";

const GeofenceManager = () => {
    const { geofences } = useGeofenceContext();

    const handleExport = () => {
        const geojson = convertGeofencesToGeoJSON(geofences);
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'geofences.geojson';
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col px-4 h-fi w-full bg-white overflow-y-auto">
            <GeofenceCreateDialog />

            <div className="mt-6 px-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">📍 Focused Geofence</h3>
                <GeofenceOnFocus />
            </div>

            <div className="mt-6 px-2">
                <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="text-sm font-medium text-gray-700">🗺️ Geofences</h3>
                    <Button
                        disabled={geofences.length <= 0}
                        onClick={handleExport}
                        variant="outline"
                        className="text-xs px-3 py-1 flex items-center gap-1"
                    >
                        <Download className="w-3 h-3" />
                        Export
                    </Button>
                </div>
                <ScrollArea className="h-200 border rounded p-2 shadow-sm">
                    <ul className="space-y-1 text-sm text-gray-700">
                        {geofences.map((g) => (
                            <div
                                key={g.id}
                                className="flex items-center justify-between px-3 py-3 mb-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: GeofenceColors[g.data.type] }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800">{g.data.name}</span>
                                        <span className="text-xs px-2 py-0.5 mt-2 rounded-full bg-gray-200 text-gray-600 w-fit">
                                            {GeofenceTypeLabels[g.data.type]}
                                        </span>
                                    </div>
                                </div>

                                <GeofenceEditDialog geofence={g} />
                            </div>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
        </div>
    );
};

export default GeofenceManager;
