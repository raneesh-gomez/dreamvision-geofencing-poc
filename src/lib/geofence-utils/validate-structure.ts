import type { GeofenceData, GeofencePolygon } from "@/types";
import { GeofenceTypeLabels, GeofenceTypes, RequiredParent } from "@/constants";

/**
 * Validates the structure of a geofence based on hierarchy rules.
 * Ensures required parent exists and is of correct type.
 */
export function validateStructure(
  geofence: GeofenceData,
  allGeofences: GeofencePolygon[]
): string | null {
    // Country does not require a parent
    if (geofence.type === GeofenceTypes.COUNTRY) return null;

    // For other types, check if a parent is required
    const requiredParentType = RequiredParent[geofence.type];
    if (!requiredParentType) {
        return `No hierarchy rule defined for ${geofence.type}`;
    }

    // If a parent is required, check if it exists and is of the correct type
    if (!geofence.parentId) {
        return `Please select a parent geofence for ${geofence.type}.`;
    }

    const parent = allGeofences.find(g => g.id === geofence.parentId);

    if (!parent) {
        return `The selected parent geofence does not exist.`;
    }

    if (parent.data.type !== requiredParentType) {
        return `The selected parent must be of type "${GeofenceTypeLabels[requiredParentType]}", but is a "${GeofenceTypeLabels[parent.data.type]}".`;
    }

    return null;
}
