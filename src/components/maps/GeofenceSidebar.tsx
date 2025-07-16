import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "../ui/separator";
import GeofenceHierarchy from "./GeofenceHierarchy";
import { GeofenceColors } from "@/constants";
import { GeofenceTypeLabels } from '../../constants';
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import GeofenceCreateDialog from "./GeofenceCreateDialog";
import GeofenceEditDialog from "./GeofenceEditDialog";

const GeofenceSidebar = () => {
    const {
        geofences,
    } = useGeofenceContext();

    return (
        <div className="flex flex-col p-4 h-screen w-full border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-800">🛰️ DreamVision Geofencing POC</h2>
                <p className="text-sm text-gray-500">A lightweight playground to create and organize geofences</p>
            </div>

            <Separator className="my-4" />

            <GeofenceCreateDialog />

            <div className="mt-6 px-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">🗺️ Existing Geofences</h3>
                <ScrollArea className="h-75 border rounded p-2">
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">🏢 Organization Hierarchy</h3>
                <GeofenceHierarchy geofences={geofences} />
            </div>

            <div className="mt-auto px-2 py-3 text-xs text-center text-gray-400">
                Dreamstart Labs · 2025
            </div>
        </div>
    );
};

export default GeofenceSidebar;
