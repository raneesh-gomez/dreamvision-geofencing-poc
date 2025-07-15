import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeofenceFormValues {
  name: string;
  type: "country" | "branch" | "subbranch" | "field_officer";
  priority: number;
  parentId: string | null;
  metadata: Record<string, string>;
}

interface GeofenceSidebarProps {
  geofences: { id: string; name: string }[];
  onSubmit: (data: GeofenceFormValues) => void;
}

const GeofenceSidebar = ({ geofences, onSubmit }: GeofenceSidebarProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<GeofenceFormValues>({
    name: "",
    type: "branch",
    priority: 0,
    parentId: null,
    metadata: {},
  });
  const [metaKey, setMetaKey] = useState("");
  const [metaValue, setMetaValue] = useState("");

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
    onSubmit(formData);
    setOpen(false);
    setFormData({
      name: "",
      type: "branch",
      priority: 0,
      parentId: null,
      metadata: {},
    });
  };

  return (
    <div className="p-4 border-r border-gray-200 h-full bg-white shadow-sm">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Create Geofence</Button>
        </DialogTrigger>
        <DialogContent className="space-y-4 max-h-[90vh] overflow-y-auto">
            <DialogTitle>
                <span>Create Geofence</span>
            </DialogTitle>
          <div>
            <Label>Name</Label>
            <Input name="name" value={formData.name} onChange={handleInputChange} />
          </div>
          <div>
            <Label>Type</Label>
            <Select onValueChange={(value) => handleSelectChange(value, "type")} defaultValue={formData.type}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="subbranch">Subbranch</SelectItem>
                <SelectItem value="field_officer">Field Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Horizontal Priority</Label>
            <Input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Parent Geofence</Label>
            <Select onValueChange={(value) => handleSelectChange(value, "parentId")}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {geofences.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
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
              <Button onClick={addMetadata}>+</Button>
            </div>
            <ScrollArea className="mt-2 h-24 border rounded p-2">
              <ul className="text-sm text-gray-600">
                {Object.entries(formData.metadata).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </ScrollArea>
          </div>
          <Button onClick={handleSubmit}>Continue to Draw</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeofenceSidebar;
