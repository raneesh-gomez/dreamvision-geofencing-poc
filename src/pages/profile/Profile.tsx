import { useEffect, useState } from "react";
import { ArrowLeft, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import type { ProfileData } from "@/types";
import { useAppContext } from "@/hooks/use-app-context";
import { getFspById, getNgoById } from "@/services/lookup.service";

const Profile = () => {

  const navigate = useNavigate();
  const { user } = useAppContext();

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.user_metadata.first_name,
    lastName: user?.user_metadata.last_name,
    email: user?.user_metadata.email,
    phone: user?.user_metadata.phone_number,
    ngoName: "",
    fspName: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData>(profileData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNames = async () => {
      const { ngo_id, fsp_id } = user?.user_metadata || {};

      const [ngoResult, fspResult] = await Promise.all([
        getNgoById(ngo_id),
        getFspById(fsp_id)
      ]);

      console.log(ngoResult)
      console.log(fspResult)
      setProfileData(prev => ({
        ...prev,
        ngoName: ngoResult?.data?.name || "",
        fspName: fspResult?.data?.name || ""
      }));
    }
    fetchNames();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // TODO: Replace with actual API call
      // await updateProfile(editedData);

      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));

      setProfileData(editedData);
      setIsEditing(false);


    } catch (error) {

    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = () => {
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2 hover:cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

         <div>
          <h1 className="text-3xl font-bold tracking-tight">👤 Profile</h1>
          <p className="text-muted-foreground">
            Manage your Personal Information
          </p>
        </div>

        <Card className="shadow-[var(--shadow-soft)]">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={isEditing ? editedData.firstName : profileData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={isEditing ? editedData.lastName : profileData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={isEditing ? (editedData.phone ?? '') : (profileData.phone ?? '')}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ngo">NGO</Label>
              <Input
                id="ngo"
                value={profileData.ngoName}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                NGO assignment cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fsp">FSP</Label>
              <Input
                id="fsp"
                value={profileData.fspName}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                FSP assignment cannot be changed
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              {!isEditing ? (
                <div className="flex gap-3">
                  <Button className="hover:cursor-pointer" onClick={handleEdit}>
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePasswordChange}
                    className="gap-2 hover:cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2 hover:cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:cursor-pointer"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ >
  );
};

export default Profile;