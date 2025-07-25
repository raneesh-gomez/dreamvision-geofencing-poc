import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { GeofenceTypeLabels } from '../../constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MapPin } from "lucide-react";

const GeofenceOnFocus = () => {
  const { focusedGeofence, geofences } = useGeofenceContext();

  const parentName = geofences.find(g => g.id === focusedGeofence?.data.parentId)?.data.name || "None";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <MapPin className="w-5 h-5 text-muted-foreground" />
        <div>
          <CardTitle className="text-sm font-medium">
            Focused Geofence
          </CardTitle>
          <CardDescription>
            Overview of the selected geofence, including attributes and hierarchical context
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        {focusedGeofence ? (
          <>
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium">{focusedGeofence.data.name}</span>
            </div>

            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span>{GeofenceTypeLabels[focusedGeofence.data.type]}</span>
            </div>

            <div>
              <span className="text-muted-foreground">Parent:</span>{" "}
              <span>{parentName}</span>
            </div>

            <div>
              <span className="text-muted-foreground">Horizontal Priority:</span>{" "}
              <span>{focusedGeofence.data.priority}</span>
            </div>

            {focusedGeofence.data.countryISO && (
              <div>
                <span className="text-muted-foreground">Country Code:</span>{" "}
                <span>{focusedGeofence.data.countryISO}</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Click on a geofence in the list to view its details.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GeofenceOnFocus;
