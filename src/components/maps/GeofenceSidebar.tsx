import { useState } from "react";
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type GeofenceData } from "@/types";
import { Separator } from "../ui/separator";
import GeofenceHierarchy from "./GeofenceHierarchy";
import { GeofenceColors, GeofenceTypes, InitialGeofenceData, RequiredParent } from "@/constants";
import { GeofenceTypeLabels } from '../../constants';
import { useGeofenceContext } from "@/hooks/use-geofence-context";

const GeofenceSidebar = () => {
    const {
        geofences,
        startDrawing,
    } = useGeofenceContext();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<GeofenceData>(InitialGeofenceData);
    const [metaKey, setMetaKey] = useState("");
    const [metaValue, setMetaValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Determines the valid parent geofences based on the selected type.
     * This is used to filter the available parent geofences in the dropdown.
     */
    const allowedParentType = RequiredParent[formData.type];
    const validParentGeofences = allowedParentType
        ? geofences.filter((g) => g.data.type === allowedParentType)
        : [];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value === "none" ? null : value,
        }));
    };

    const addMetadata = () => {
        if (metaKey && metaValue) {
            setFormData(prev => ({
                ...prev,
                metadata: { ...prev.metadata, [metaKey]: metaValue }
            }));
            setMetaKey("");
            setMetaValue("");
        }
    };

    const handleSubmit = () => {
        if (formData.type !== GeofenceTypes.COUNTRY && !formData.parentId) {
            setError("Please select a parent geofence.");
            return;
        }

        setError(null);
        startDrawing(formData);
        setOpen(false);
        setFormData(InitialGeofenceData);
    };

    return (
        <div className="flex flex-col p-4 h-screen w-full border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-800">🛰️ DreamVision Geofencing POC</h2>
                <p className="text-sm text-gray-500">A lightweight playground to create and organize geofences</p>
            </div>

            <Separator className="my-4" />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer">
                        <Plus className="w-5 h-5" />Create Geofence
                    </Button>
                </DialogTrigger>
                <DialogContent className="space-y-2 max-h-[90vh] overflow-y-auto">
                    <DialogTitle>
                        <span>Create Geofence</span>
                    </DialogTitle>
                    <div>
                        <div className="pb-4 space-y-1">
                            <Label className="pb-2">Name</Label>
                            <Input name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="pb-4 space-y-3">
                            <Label>Type</Label>
                            <Select onValueChange={(value) => handleSelectChange(value, "type")} defaultValue={formData.type}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <Select onValueChange={(value) => handleSelectChange(value, "parentId")}>
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
                                    <li key={key}>{key}: {value}</li>
                                ))}
                            </ul>
                            </ScrollArea>
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    
                    <Button 
                        className="bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
                        onClick={handleSubmit}>
                            Draw Service Area
                    </Button>
                </DialogContent>
            </Dialog>

            <div className="mt-6 px-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">🗺️ Existing Geofences</h3>
                <ScrollArea className="h-75 border rounded p-2">
                    <ul className="space-y-1 text-sm text-gray-700">
                        {geofences.map((g) => (
                            <div
                                key={g.id}
                                className="flex items-center justify-between px-3 py-3 mb-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: GeofenceColors[g.data.type] }}
                                    />
                                    <span className="text-sm font-medium text-gray-800">{g.data.name}</span>
                                </div>

                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-300 text-gray-600 capitalize">
                                    {GeofenceTypeLabels[g.data.type]}
                                </span>
                            </div>
                        ))}
                    </ul>
                </ScrollArea>
            </div>

            <div className="mt-6 px-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">🏢 Organization Hierarchy</h3>
                <GeofenceHierarchy geofences={geofences} />
            </div>

            <div className="mt-auto px-2 py-3 text-xs text-center text-gray-400">
                Dreamstart Labs · 2025
            </div>
        </div>
    );
};

export default GeofenceSidebar;
