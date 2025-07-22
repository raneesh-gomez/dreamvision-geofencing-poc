import { Loader2, Plus } from "lucide-react";
import area from "@turf/area";
import { polygon as turfPolygon } from "@turf/helpers";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { GeofenceTypeLabels, GeofenceTypes, InitialGeofenceData, RequiredParent } from "@/constants";
import { useEffect, useState } from "react";
import type { GeofenceData } from "@/types";
import { useGeofenceContext } from "@/hooks/use-geofence-context";
import { validateStructure } from "@/lib/geofence-utils/validate-structure";
import { fetchCountryBoundary, getCountryOptions, type CountryOption } from "@/lib/geofence-utils/country-utils";

const GeofenceCreateDialog = () => {
    const {
        geofences,
        startDrawing,
        completeDrawing,
    } = useGeofenceContext();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<GeofenceData>(InitialGeofenceData);
    const [metaKey, setMetaKey] = useState("");
    const [metaValue, setMetaValue] = useState("");
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
    const [selectedCountryISO, setSelectedCountryISO] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (formData.type === GeofenceTypes.COUNTRY) {
            getCountryOptions().then(setCountryOptions);
        }
    }, [formData.type]);

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

    const handleSubmit = async () => {
        const structureError = validateStructure(formData, geofences);
        if (structureError) {
            setError(structureError);
            return;
        }

        setError(null);

        if (formData.type === GeofenceTypes.COUNTRY) {
            setLoading(true);

            const geometry = await fetchCountryBoundary(selectedCountryISO);
            if (!geometry) {
                setError("Could not load country boundary.");
                setLoading(false);
                return;
            }

            if (geometry.type === "Polygon") {
                // Single polygon with one path
                const path = geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));

                completeDrawing(path, {
                    ...formData,
                    countryISO: selectedCountryISO,
                });
            } else if (geometry.type === "MultiPolygon") {
                // Multiple polygons – each one might be an island, for example
                const polygons = geometry.coordinates;

                // Sort by area (descending) to identify the "mainland"
                const sorted = polygons.map((coords, i) => ({
                    coords,
                    area: area(turfPolygon(coords)),
                    index: i,
                })).sort((a, b) => b.area - a.area);

                // Now iterate and draw each
                sorted.forEach((part, idx) => {
                    const name =
                        idx === 0 ? `${formData.name} - Mainland` : `${formData.name} - Region ${idx}`;

                    const path = part.coords[0].map(([lng, lat]) => ({ lat, lng }));

                    completeDrawing(path, {
                        ...formData,
                        name,
                        countryISO: selectedCountryISO,
                    });
                });
            }

            setLoading(false);
        } else {
            startDrawing(formData);
        }

        setOpen(false);
        setFormData(InitialGeofenceData);
        setSelectedCountryISO("");
    };

    return (
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
                    {formData.type === GeofenceTypes.COUNTRY && (
                        <div className="pb-4 space-y-3">
                            <Label>Country</Label>
                            <Select
                                onValueChange={(iso) => setSelectedCountryISO(iso)}
                                value={selectedCountryISO}
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
                    {formData.type !== GeofenceTypes.COUNTRY && (
                        <div className="pb-4 space-y-3">
                            <Label>Horizontal Priority</Label>
                            <Input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
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
                    onClick={handleSubmit}
                    disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            formData.type === GeofenceTypes.COUNTRY
                                ? "Create Country Geofence"
                                : "Draw Service Area"
                        )}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default GeofenceCreateDialog;