import { v4 as uuidv4 } from 'uuid';
import type { GeofenceData, GeofencePolygon, LatLngCoord } from '@/types';
import {
  clipToParent,
  clipToHigherPrioritySiblings,
  hasSamePriorityOverlapWithSibling,
  resolveDownstreamClippingRecursive,
} from '@/lib/geofence-utils/turf-utils';

/**
 * Validates geofence overlaps based on same-priority sibling rules.
 */
const validateSiblingOverlap = (newGeofence: GeofencePolygon, siblings: GeofencePolygon[]): string | null => {
  if (hasSamePriorityOverlapWithSibling(newGeofence, siblings)) {
    return "Polygons with the same priority cannot overlap. Please adjust the priority or shape.";
  }
  return null;
}

/**
 * Handles complete creation logic of a geofence.
 */
export const createGeofence = (
  path: LatLngCoord[],
  formData: GeofenceData,
  existingGeofences: GeofencePolygon[]
): { geofence?: GeofencePolygon; error?: string } => {
  const parent = existingGeofences.find((g) => g.id === formData.parentId);
  const siblings = existingGeofences.filter(
    (g) => g.data.parentId === formData.parentId && g.data.type === formData.type
  );

  let newGeofence: GeofencePolygon = {
    id: uuidv4(),
    originalPath: path,
    clippedPath: path,
    data: { ...formData },
  };

  // ⚠️ Step 1: Validate sibling priority
  const siblingError = validateSiblingOverlap(newGeofence, siblings);
  if (siblingError) return { error: siblingError };

  // 🧱 Step 2: Clip to parent if exists
  if (parent) {
    const clipped = clipToParent(newGeofence, parent);
    if (!clipped) return { error: "The drawn polygon must be completely within its parent geofence." };
    newGeofence = clipped;
  }

  // 🔁 Step 3: Clip to higher-priority siblings
  newGeofence = clipToHigherPrioritySiblings(newGeofence, siblings);

  // TODO: Insert new geofence to Supabase

  return { geofence: newGeofence };
}

/**
 * Handles updating a geofence’s shape.
 */
export const updateGeofencePath = (
  id: string,
  newPath: LatLngCoord[],
  existingGeofences: GeofencePolygon[]
): { updatedList?: GeofencePolygon[]; error?: string } => {
    const target = existingGeofences.find((g) => g.id === id);
    if (!target) return { error: "Geofence not found." };

    const parent = existingGeofences.find((g) => g.id === target.data.parentId);
    const siblings = existingGeofences.filter(
        (g) =>
        g.id !== id &&
        g.data.parentId === target.data.parentId &&
        g.data.type === target.data.type
    );

    let updated: GeofencePolygon = {
        ...target,
        originalPath: newPath,
        clippedPath: newPath,
    };

    // ⚠️ Step 1: Validate sibling priority
    const siblingError = validateSiblingOverlap(updated, siblings);
    if (siblingError) return { error: siblingError };

    // 🧱 Step 2: Clip to parent if exists
    if (parent) {
        const clipped = clipToParent(updated, parent);
        if (!clipped) return { error: "The updated polygon must be completely within its parent geofence." };
        updated = clipped;
    }

    // 🔁 Step 3: Clip to higher-priority siblings
    updated = clipToHigherPrioritySiblings(updated, siblings);

    const updatedList = existingGeofences.map((g) => (g.id === id ? updated : g));

    // 🧬 Step 4: Recalculate downstream geofences affected by this update
    const resolved = resolveDownstreamClippingRecursive(updated, updatedList);

    // TODO: Update entire geofence list to Supabase

    return { updatedList: resolved };
}
