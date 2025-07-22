import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GeofenceContext } from './GeofenceContext';
import type { GeofenceData, GeofencePolygon, LatLngCoord } from '@/types';
import { clipToHigherPrioritySiblings, clipToParent, hasSamePriorityOverlapWithSibling, resolveDownstreamClippingRecursive } from '@/lib/geofence-utils/turf-utils';
import { toast } from 'sonner';

export const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geofences, setGeofences] = useState<GeofencePolygon[]>([]);
  const [activeForm, setActiveForm] = useState<GeofenceData | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [focusedGeofence, setFocusedGeofence] = useState<GeofencePolygon | null>(null);

  /**
   * Starts the drawing process by setting the active form data.
   * This enables the drawing mode in the map.
   */
  const startDrawing = useCallback((formData: GeofenceData) => {
    setActiveForm(formData);
    setDrawingEnabled(true);
  }, []);

  /**
   * Completes the drawing process by creating a new geofence polygon
   * with the provided path and active form data.
   */
  const completeDrawing = useCallback(
    (path: LatLngCoord[], formData?: GeofenceData) => {
      const data = formData || activeForm;
      if (!data) return;

      let newGeofence: GeofencePolygon = {
        id: uuidv4(),
        originalPath: path,
        clippedPath: path,
        data: { ...data },
      };

      const parent = geofences.find((g) => g.id === data.parentId);
      const siblings = geofences.filter((g) => g.data.parentId === data.parentId && g.data.type === data.type);

      // ⚠️ Step 1: Validate sibling priority
      if (hasSamePriorityOverlapWithSibling(newGeofence, siblings)) {
        toast.error("Polygons with the same priority cannot overlap. Please adjust the priority or shape.");
        return;
      }

      // 🧱 Step 2: Clip to parent if exists
      if (parent) {
        // Clip the drawn polygon to fit inside the parent geofence
        const clipped = clipToParent(newGeofence, parent);
        if (!clipped) {
          toast.error("The drawn polygon must be completely within its parent geofence.");
          return;
        }
        newGeofence = clipped;
      }

      // 🔁 Step 3: Clip to higher-priority siblings
      newGeofence = clipToHigherPrioritySiblings(newGeofence, siblings);

      setGeofences((prev) => [...prev, newGeofence]);
      setDrawingEnabled(false);
      setActiveForm(null);
      toast.success("Geofence created successfully!");
    },
    [activeForm, geofences]
  );

  /**
   * Updates the path of an existing geofence polygon.
   * This is used when the user edits the polygon on the map.
   */
  const updateGeofencePath = (id: string, newPath: LatLngCoord[]) => {
    setGeofences((prev) => {
      const target = prev.find((g) => g.id === id);
      if (!target) return prev;

      const parent = prev.find((g) => g.id === target.data.parentId);
      const siblings = prev.filter((g) =>
        g.id !== id && g.data.parentId === target.data.parentId && g.data.type === target.data.type
      );

      let updated: GeofencePolygon = { 
        ...target, 
        originalPath: newPath, 
        clippedPath: newPath 
      };

      // ⚠️ Step 1: Validate sibling priority
      if (hasSamePriorityOverlapWithSibling(updated, siblings)) {
        toast.error("Polygons with the same priority cannot overlap. Please adjust the priority or shape.");
        return prev;
      }

      // 🧱 Step 2: Clip to parent if exists
      if (parent) {
        const clipped = clipToParent(updated, parent);
        if (!clipped) {
          toast.error("The updated polygon must be completely within its parent geofence.");
          return prev;
        }
        updated = clipped;
      }

      // 🔁 Step 3: Clip to higher-priority siblings
      updated = clipToHigherPrioritySiblings(updated, siblings);

      const updatedList = prev.map((g) => (g.id === id ? updated : g));

      // 🔁 Step 4: Recalculate downstream geofences affected by this update
      const resolved = resolveDownstreamClippingRecursive(updated, updatedList);

      toast.success("Geofence updated successfully!");
      return resolved;
    });
  };

  const updateGeofence = (id: string, updatedData: GeofenceData) => {
    setGeofences(prev =>
      prev.map(g =>
        g.id === id ? { ...g, data: { ...updatedData } } : g
      )
    );
  };

  const deleteGeofence = useCallback((id: string) => {
    const collectAllChildren = (targetId: string): string[] => {
      const directChildren = geofences.filter(g => g.data.parentId === targetId);
      const nestedChildren = directChildren.flatMap(child => collectAllChildren(child.id));
      return [targetId, ...nestedChildren];
    };

    const idsToDelete = collectAllChildren(id);

    setGeofences((prev) => prev.filter((g) => !idsToDelete.includes(g.id)));
  }, [geofences]);

  return (
    <GeofenceContext.Provider value={{ 
        geofences, 
        activeForm, 
        drawingEnabled,
        focusedGeofence,
        setFocusedGeofence,
        startDrawing, 
        completeDrawing,
        updateGeofencePath,
        updateGeofence,
        deleteGeofence
      }}
    >
      {children}
    </GeofenceContext.Provider>
  );
};

export default GeofenceProvider;
