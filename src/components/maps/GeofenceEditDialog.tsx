import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { GeofenceTypeLabels, GeofenceTypes, RequiredParent } from "@/constants";
import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import type { GeofenceData, GeofencePolygon } from "@/types";
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { validateStructure } from "@/lib/geofence-utils/validate-structure";

const GeofenceEditDialog = ({ geofence }: { geofence: GeofencePolygon }) => {
    const {
        geofences,
        updateGeofence,
        deleteGeofence
    } = useGeofenceContext();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<GeofenceData>({ ...geofence.data });
    const [metaKey, setMetaKey] = useState("");
    const [metaValue, setMetaValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [childrenToDelete, setChildrenToDelete] = useState<GeofencePolygon[]>([]);

    const allowedParentType = RequiredParent[formData.type];
    const validParentGeofences = allowedParentType
        ? geofences.filter(
            (g) => g.data.type === allowedParentType && g.id !== geofence.id
        )
        : [];

    const handleDeleteClick = () => {
        const collectChildren = (targetId: string): GeofencePolygon[] => {
            const directChildren = geofences.filter(g => g.data.parentId === targetId);
            const nestedChildren = directChildren.flatMap(child => collectChildren(child.id));
            return [...directChildren, ...nestedChildren];
        };

        const children = collectChildren(geofence.id);
        setChildrenToDelete(children);
        setConfirmDeleteOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value === "none" ? null : value,
        }));
    };

    const addMetadata = () => {
        if (metaKey && metaValue) {
            setFormData((prev) => ({
                ...prev,
                metadata: { ...prev.metadata, [metaKey]: metaValue },
            }));
            setMetaKey("");
            setMetaValue("");
        }
    };

    const handleSubmit = () => {
        const structureError = validateStructure(formData, geofences);
        if (structureError) {
            setError(structureError);
            return;
        }

        setError(null);
        updateGeofence(geofence.id, formData);
        setOpen(false);
    };

    const handleDelete = () => {
        deleteGeofence(geofence.id);
        setOpen(false);
        setConfirmDeleteOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="text-xs p-2 bg-gray-100 hover:bg-gray-200 border"
                        variant="ghost"
                    >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                </DialogTrigger>
                <DialogContent className="space-y-2 max-h-[90vh] overflow-y-auto">
                    <DialogTitle>
                        <span>Edit Geofence</span>
                    </DialogTitle>
                    <div>
                        <div className="pb-4 space-y-1">
                            <Label className="pb-2">Name</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="pb-4 space-y-3">
                            <Label>Type</Label>
                            <Select
                                onValueChange={(value) => {
                                    handleSelectChange(value, "type");
                                    setFormData((prev) => ({ ...prev, parentId: null }));
                                }}
                                defaultValue={formData.type}
                            >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(GeofenceTypes).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {GeofenceTypeLabels[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="pb-4 space-y-3">
                            <Label>Horizontal Priority</Label>
                            <Input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                            />
                        </div>
                        {formData.type !== GeofenceTypes.COUNTRY && (
                            <div className="pb-4 space-y-3">
                            <Label>Parent Geofence</Label>
                            <Select
                                onValueChange={(value) => handleSelectChange(value, "parentId")}
                                defaultValue={formData.parentId || undefined}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent (required)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {validParentGeofences.map((g) => (
                                        <SelectItem key={g.id} value={g.id}>
                                            {g.data.name} ({GeofenceTypeLabels[g.data.type]})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                        )}
                        <div className="pb-4 space-y-3">
                            <Label>Metadata</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Key"
                                    value={metaKey}
                                    onChange={(e) => setMetaKey(e.target.value)}
                                />
                                <Input
                                    placeholder="Value"
                                    value={metaValue}
                                    onChange={(e) => setMetaValue(e.target.value)}
                                />
                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 hover:cursor-pointer"
                                    onClick={addMetadata}
                                >
                                    +
                                </Button>
                            </div>
                            <ScrollArea className="mt-2 h-24 border rounded p-2">
                                <ul className="text-sm text-gray-600">
                                    {Object.entries(formData.metadata).map(([key, value]) => (
                                        <li key={key}>
                                            {key}: {value}
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex justify-between">
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer"
                            onClick={handleDeleteClick}
                        >
                            <Trash className="w-4 h-4 mr-1" /> Delete
                        </Button>
                        <Button
                            className="bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
                            onClick={handleSubmit}
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent className="space-y-4">
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    {childrenToDelete.length > 0 ? (
                        <>
                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete <strong>{geofence.data.name}</strong>?<br />
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
                            Are you sure you want to delete <strong>{geofence.data.name}</strong>? This action cannot be undone.
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
        </>
    );
};

export default GeofenceEditDialog;
