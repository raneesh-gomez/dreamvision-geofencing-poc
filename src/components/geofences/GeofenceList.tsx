import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Layers3, Trash } from "lucide-react";
import { GeofenceColors } from "@/constants";
import { GeofenceTypeLabels } from "../../constants";
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import GeofenceEditDialog from "./GeofenceEditDialog";
import type { GeofencePolygon } from "@/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

const GeofenceList = () => {
    const { geofences, setFocusedGeofence, deleteGeofence } = useGeofenceContext();
    const [search, setSearch] = useState<string>("");
    const [selectedToDelete, setSelectedToDelete] = useState<GeofencePolygon | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [childrenToDelete, setChildrenToDelete] = useState<GeofencePolygon[]>([]);

    const filteredGeofences = geofences.filter(g =>
        g.data.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteClick = (geofence: GeofencePolygon) => {
        const collectChildren = (targetId: string): GeofencePolygon[] => {
            const directChildren = geofences.filter(g => g.data.parentId === targetId);
            const nestedChildren = directChildren.flatMap(child => collectChildren(child.id));
            return [...directChildren, ...nestedChildren];
        };

        const children = collectChildren(geofence.id);
        setChildrenToDelete(children);
        setSelectedToDelete(geofence);
        setConfirmDeleteOpen(true);
    };

    const handleDelete = () => {
        if (selectedToDelete) {
            deleteGeofence(selectedToDelete.id);
            setConfirmDeleteOpen(false);
            setSelectedToDelete(null);
        }
    };

    const handleFocus = (focusedGeofence: GeofencePolygon) => {
        const geofence = geofences.find(g => g.id === focusedGeofence.id);
        if (geofence) setFocusedGeofence(geofence);
    };

    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3">
                <Layers3 className="w-5 h-5 text-muted-foreground" />
                <div>
                    <CardTitle className="text-sm font-medium">
                        Your Geofences
                    </CardTitle>
                    <CardDescription>
                        Manage and explore all your existing geofences across your organizational regions
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 overflow-hidden">
                <div className="pb-4">
                    <Input
                        placeholder="Search geofences by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <ScrollArea className="flex-1 overflow-y-auto pr-3">
                    <ul className="space-y-3">
                        {filteredGeofences.map((g) => (
                            <li
                                key={g.id}
                                className="flex items-center justify-between px-4 py-4 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: GeofenceColors[g.data.type] }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800">{g.data.name}</span>
                                        <span className="text-xs px-2 py-0.5 mt-2 rounded-full bg-muted text-muted-foreground border w-fit">
                                            {GeofenceTypeLabels[g.data.type]}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="w-8 h-8 border-gray-300 hover:border-gray-400 cursor-pointer"
                                        onClick={() => handleFocus(g)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <GeofenceEditDialog geofence={g} />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="w-8 h-8 border-gray-300 hover:border-gray-400 cursor-pointer"
                                        onClick={() => handleDeleteClick(g)}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
                {selectedToDelete && (
                    <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                        <DialogContent className="space-y-4">
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            {childrenToDelete.length > 0 ? (
                                <>
                                    <p className="text-sm text-gray-600">
                                        Are you sure you want to delete <strong>{selectedToDelete.data.name}</strong>?<br />
                                        This will also delete the following <strong>{childrenToDelete.length}</strong> child geofence{childrenToDelete.length > 1 ? 's' : ''}:
                                    </p>
                                    <ul className="list-disc pl-5 text-sm text-gray-700 max-h-40 overflow-auto">
                                        {childrenToDelete.map(child => (
                                            <li key={child.id}>
                                                {child.data.name} ({GeofenceTypeLabels[child.data.type]})
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to delete <strong>{selectedToDelete.data.name}</strong>? This action cannot be undone.
                                </p>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={handleDelete}
                                >
                                    Confirm Delete
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
};

export default GeofenceList;
