import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "../ui/separator";
import GeofenceHierarchy from "./GeofenceHierarchy";
import { GeofenceColors } from "@/constants";
import { GeofenceTypeLabels } from '../../constants';
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import GeofenceCreateDialog from "./GeofenceCreateDialog";
import GeofenceEditDialog from "./GeofenceEditDialog";
import { convertGeofencesToGeoJSON } from "@/lib/geofence-utils/geojson-utils";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import GeofenceOnFocus from "./GeofenceOnFocus";

const GeofenceSidebar = () => {
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
        <div className="flex flex-col p-4 h-screen w-full border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-800">🛰️ DreamLink Geofencing POC</h2>
                <p className="text-sm text-gray-500">A lightweight proof-of-concept playground for the upcoming DreamLink platform.</p>
            </div>

            <Separator className="my-4" />

            <GeofenceCreateDialog />

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
                <ScrollArea className="h-75 border rounded p-2 shadow-sm">
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

            <div className="mt-6 px-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">📍 Focused Geofence</h3>
                <GeofenceOnFocus />
            </div>

            <div className="mt-6 px-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">🏢 Organizational Hierarchy</h3>
                <GeofenceHierarchy geofences={geofences} />
            </div>

            <div className="mt-auto px-2 py-3 text-xs text-center text-gray-400">
                Dreamstart Labs · 2025
            </div>
        </div>
    );
};

export default GeofenceSidebar;
