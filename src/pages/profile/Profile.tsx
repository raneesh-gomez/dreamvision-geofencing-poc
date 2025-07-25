import { useState } from "react";
import { ArrowLeft, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ngo: string;
  fsp: string;
}

const Profile = () => {
  console.log("Profile rendering")
  const navigate = useNavigate();


  // Mock user data - replace with actual data from your API
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    ngo: "Tech for Good Foundation",
    fsp: "Financial Services Partner ABC"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData>(profileData);
  const [isSaving, setIsSaving] = useState(false);

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>

        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details below. Some fields cannot be edited.
            </CardDescription>
          </CardHeader>
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
                value={isEditing ? editedData.phone : profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ngo">NGO</Label>
              <Input
                id="ngo"
                value={profileData.ngo}
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
                value={profileData.fsp}
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
                  <Button onClick={handleEdit}>
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePasswordChange}
                    className="gap-2"
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
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
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