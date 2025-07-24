import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { GeofenceTypeLabels } from '../../constants';

const GeofenceOnFocus = () => {
  const { focusedGeofence, geofences } = useGeofenceContext();

  const parentName = geofences.find(g => g.id === focusedGeofence?.data.parentId)?.data.name || "N/A";

  return (
    <div className="mt-4 border rounded bg-white p-4 shadow-sm">
        {focusedGeofence ? (
            <>
                <p><strong>Name:</strong> {focusedGeofence.data.name}</p>
                <p><strong>Type:</strong> {GeofenceTypeLabels[focusedGeofence.data.type]}</p>
                <p><strong>Parent:</strong> {parentName}</p>
                <p><strong>Horizontal Priority:</strong> {focusedGeofence.data.priority}</p>
                {focusedGeofence.data.countryISO && (
                    <p><strong>Country Code:</strong> {focusedGeofence.data.countryISO}</p>
                )}
            </>
        ): (<p><small>Click on a geofence on the list below to view more information on it.</small></p>)}
    </div>
  );
};

export default GeofenceOnFocus;
