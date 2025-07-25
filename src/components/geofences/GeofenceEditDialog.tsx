import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { GeofenceTypeLabels, GeofenceTypes, AllowedParents } from "@/constants";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import type { GeofenceData, GeofencePolygon } from "@/types";
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { getCountryOptions, type CountryOption } from "@/lib/geofence-utils/country-utils";
import { validateStructure } from "@/lib/geofence-utils/map-utils";

const GeofenceEditDialog = ({ geofence }: { geofence: GeofencePolygon }) => {
    const {
        geofences,
        drawingEnabled,
        updateGeofenceData
    } = useGeofenceContext();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<GeofenceData>({ ...geofence.data });
    const [metaKey, setMetaKey] = useState("");
    const [metaValue, setMetaValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

    useEffect(() => {
        if (formData.type === GeofenceTypes.COUNTRY) {
            getCountryOptions().then(setCountryOptions);
        }
    }, [formData.type]);

    const allowedParentTypes = AllowedParents[formData.type];
    const validParentGeofences = allowedParentTypes
        ? geofences.filter(
            (g) => allowedParentTypes.includes(g.data.type) && g.id !== geofence.id
        )
        : [];

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
        updateGeofenceData(geofence.id, formData);
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 border-gray-300 hover:border-gray-400 hover:cursor-pointer"
                        disabled={drawingEnabled}
                    >
                        <Pencil className="w-4 h-4" />
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
                                disabled
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
                        {formData.type === GeofenceTypes.COUNTRY && (
                            <div className="pb-4 space-y-3">
                                <Label>Country</Label>
                                <Select
                                    value={formData.countryISO || ""}
                                    disabled
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countryOptions.map((c) => (
                                            <SelectItem key={c.iso} value={c.iso}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="pb-4 space-y-3">
                            <Label>Horizontal Priority</Label>
                            <Input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                disabled
                            />
                        </div>
                        {formData.type !== GeofenceTypes.COUNTRY && (
                            <div className="pb-4 space-y-3">
                            <Label>Parent Geofence</Label>
                            <Select
                                onValueChange={(value) => handleSelectChange(value, "parentId")}
                                defaultValue={formData.parentId || undefined}
                                disabled
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

                    <Button
                        className="bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
                        onClick={handleSubmit}
                        disabled={drawingEnabled}
                    >
                        Save Changes
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GeofenceEditDialog;