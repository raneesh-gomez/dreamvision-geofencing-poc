import { v4 as uuidv4 } from 'uuid';
import type { GeofenceData, GeofencePolygon, LatLngCoord } from '@/types';
import {
  clipToParent,
  clipToHigherPrioritySiblings,
  hasSamePriorityOverlapWithSibling,
  resolveDownstreamClippingRecursive,
} from '@/lib/geofence-utils/turf-utils';
import type { User } from '@supabase/supabase-js';
import { deleteRow, insertRow, updateRow } from "@/services/database.service";
import { SUPABASE_GEOFENCE_TABLE } from '@/constants';
import type { GeoFenceRow } from "@/types";

/**
 * Validates geofence overlaps based on same-priority sibling rules.
 */
const validateSiblingOverlap = (newGeofence: GeofencePolygon, siblings: GeofencePolygon[]): string | null => {
  if (hasSamePriorityOverlapWithSibling(newGeofence, siblings)) {
    return "Polygons with the same priority cannot overlap. Please adjust the priority or shape.";
  }
  return null;
};

/**
 * Handles complete creation logic of a geofence.
 */
export const createGeofence = async (
  path: LatLngCoord[],
  formData: GeofenceData,
  existingGeofences: GeofencePolygon[],
  user: User
): Promise<{ geofence?: GeofencePolygon; error?: string }> => {
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

  // Step 4: Insert to Supabase
  const { id, originalPath, clippedPath, data } = newGeofence
  const currentTimestamp = new Date().toISOString()

  const { error } = await insertRow(SUPABASE_GEOFENCE_TABLE, {
    id,
    created_by: user.id,
    original_path: originalPath,
    clipped_path: clippedPath,
    name: data.name,
    type: data.type,
    priority: data.priority,
    parent_id: data.parentId,
    metadata: data.metadata,
    country_iso: data.countryISO ?? null,
    created_date: currentTimestamp,
    updated_date: currentTimestamp,
  });

  if (error) return { error: "There was an error when creating the geofence" }
  
  return { geofence: newGeofence };
};

/**
 * Handles updating a geofence’s shape.
 */
export const updateGeofencePath = async (
  id: string,
  newPath: LatLngCoord[],
  existingGeofences: GeofencePolygon[]
): Promise<{ updatedList?: GeofencePolygon[]; error?: string }> => {
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

    // Step 5: Update entire geofence list to Supabase
  for (const geo of resolved) {
    const { error } = await updateRow<GeoFenceRow>(SUPABASE_GEOFENCE_TABLE, { id: geo.id }, {
      original_path: geo.originalPath,
      clipped_path: geo.clippedPath,
      name: geo.data.name,
      type: geo.data.type,
      priority: geo.data.priority,
      parent_id: geo.data.parentId,
      metadata: geo.data.metadata,
      country_iso: geo.data.countryISO ?? null,
      updated_date: new Date().toISOString(),
    });

    if (error) return { error: `There was an error when updating the geofence with ${geo.id}` }
  }

  return { updatedList: resolved };
};

/**
 * Handles updating a geofence's data
 */
export const updateGeofenceData = async (id: string, updatedData: GeofenceData): Promise<string | null> => {
  const { error } = await updateRow<GeoFenceRow>(SUPABASE_GEOFENCE_TABLE, { id }, {
    name: updatedData.name,
    type: updatedData.type,
    priority: updatedData.priority,
    parent_id: updatedData.parentId,
    metadata: updatedData.metadata,
    country_iso: updatedData.countryISO ?? null,
    updated_date: new Date().toISOString(),
  });

  if (error) return `There was an error when updating the geofence "${updatedData.name}"`;

  return null;
};

/**
 * Handles deleting a given list of geofences
 */
export const deleteGeofences = async (deletableIds: Array<string>): Promise<string | null> => {
  for (const id of deletableIds) {
    const { error } = await deleteRow<GeoFenceRow>(SUPABASE_GEOFENCE_TABLE, { id });
    if (error) return `There was an error when deleting the geofence with ID ${id}`;
  }

  return null;
};