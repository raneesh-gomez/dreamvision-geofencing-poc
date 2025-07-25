import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeofenceTypeLabels } from "@/constants";
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { GeofenceColors } from "@/constants";
import { GeofenceTypeIcons } from "../geofences/GeofenceIcons";

const OrganizationalWidgets = () => {
  const { geofences } = useGeofenceContext();

  const counts = geofences.reduce(
    (acc, g) => {
      acc[g.data.type] = (acc[g.data.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div
      className="w-full md:w-1/4 xl:w-1/5 flex flex-col gap-4 pl-0 md:pl-4 overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 4rem)" }}
    >
      {Object.keys(GeofenceTypeLabels).map((type) => (
        <Card key={type} className="flex-1 min-h-[160px]">
          <CardHeader className="flex items-center gap-3">
            <div
              className="min-w-8 min-h-8 aspect-square flex items-center justify-center rounded-md"
              style={{ backgroundColor: GeofenceColors[type] }}
            >
              {GeofenceTypeIcons[type]}
            </div>
            <CardTitle className="text-md font-medium">
              {GeofenceTypeLabels[type]}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full">
            <p className="text-6xl font-bold text-gray-800">
              {counts[type] || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Active Units</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrganizationalWidgets;
