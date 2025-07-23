import { useGeofenceContext } from "@/hooks/use-geofence-context"
import GeofenceHierarchy from "./GeofenceHierarchy";

const OrganizationalHierarchy = () => {
    const { geofences } = useGeofenceContext();
    
    return (
        <GeofenceHierarchy geofences={geofences} />
    );
};

export default OrganizationalHierarchy;