import React, { useState, useCallback, useEffect } from 'react';

import { toast } from 'sonner';

import { GeofenceContext } from './GeofenceContext';
import type { GeofenceData, GeofencePolygon, LatLngCoord } from '@/types';
import { createGeofence, updateGeofencePath as applyGeofencePathUpdate, updateGeofenceData as applyGeofenceDataUpdate, deleteGeofences, retrieveGeofences } from '@/services/geofence.service';
import { useAppContext } from '@/hooks/use-app-context';
import type { User } from '@supabase/supabase-js';

const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user }: { user: User | null } = useAppContext();
    const [geofences, setGeofences] = useState<GeofencePolygon[]>([]);
    const [activeForm, setActiveForm] = useState<GeofenceData | null>(null);
    const [drawingEnabled, setDrawingEnabled] = useState(false);
    const [focusedGeofence, setFocusedGeofence] = useState<GeofencePolygon | null>(null);

    const refreshGeofences = useCallback(async () => {
        if (!user) return;

        const { data, error } = await retrieveGeofences(user.id);
        if (error) {
            toast.error(error);
            return;
        }
        if (data) setGeofences(data);
    }, [user]);

    useEffect(() => {
        refreshGeofences();
    }, [refreshGeofences]);

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
        async (path: LatLngCoord[], formData?: GeofenceData) => {
            const data = formData || activeForm;
            if (!data) return;
            if (!user) return;

            const result = await createGeofence(path, data, geofences, user);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.geofence) {
                await refreshGeofences();
                setDrawingEnabled(false);
                setActiveForm(null);
                toast.success("Geofence created successfully!");
            }
        },
        [activeForm, geofences, user]
    );

    /**
     * Updates the path of an existing geofence polygon.
     * This is used when the user edits the polygon on the map.
     */
    const updateGeofencePath = async (id: string, newPath: LatLngCoord[]) => {
        const result = await applyGeofencePathUpdate(id, newPath, geofences);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        if (result.updatedList) {
            await refreshGeofences();
            toast.success("Geofence updated successfully!");
        }
    };

    /**
     * Updates a geofence's data.
     */
    const updateGeofenceData = async (id: string, updatedData: GeofenceData) => {
        const error = await applyGeofenceDataUpdate(id, updatedData);

        if (error) {
            toast.error(error);
            return;
        }
        await refreshGeofences();
    };

    /**
     * Deletes a geofence.
     */
    const deleteGeofence = useCallback(
        async (id: string) => {
            const collectAllChildren = (targetId: string): string[] => {
                const directChildren = geofences.filter(g => g.data.parentId === targetId);
                const nestedChildren = directChildren.flatMap(child => collectAllChildren(child.id));
                return [targetId, ...nestedChildren];
            };

            const idsToDelete = collectAllChildren(id);

            const error = await deleteGeofences(idsToDelete);

            if (error) {
                toast.error(error);
                return;
            }

            await refreshGeofences();
            toast.success("Geofence(s) deleted successfully!");
        },
        [geofences, refreshGeofences]);

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
            updateGeofenceData,
            deleteGeofence,
            refreshGeofences,
            setGeofences
        }}
        >
            {children}
        </GeofenceContext.Provider>
    );
};

export default GeofenceProvider;
