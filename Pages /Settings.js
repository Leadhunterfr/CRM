import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, User as UserIcon, Palette } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    department: "",
    preferences: {
      dark_mode: false,
    },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        department: userData.department || "",
        preferences: {
          dark_mode: userData.preferences?.dark_mode || false,
        },
      });
    } catch (error) {
      console.error("Erreur lors du chargement des informations utilisateur:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrefChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      // Note: `full_name` is a root property on the User model
      // and other custom fields like `phone` and `department` too.
      // `updateMyUserData` updates the custom fields defined in `entities/User.json`.
      // `full_name` is a built-in field, so it's handled separately.
      await User.update(user.id, { full_name: formData.full_name });
      await User.updateMyUserData({
        phone: formData.phone,
        department: formData.department,
        preferences: formData.preferences,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Reload to apply theme changes if any
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
    setSaving(false);
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          Réglages
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserIcon />Mon Profil</CardTitle>
                <CardDescription>Gérez vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Département</Label>
                        <Input
                            id="department"
                            value={formData.department}
                            onChange={(e) => handleInputChange("department", e.target.value)}
                        />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette />Préférences</CardTitle>
                <CardDescription>Personnalisez votre expérience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="dark_mode" className="font-medium">
                    Mode sombre
                  </Label>
                  <Switch
                    id="dark_mode"
                    checked={formData.preferences.dark_mode}
                    onCheckedChange={(checked) => handlePrefChange("dark_mode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end items-center gap-4">
                {saved && <span className="text-green-600 text-sm">Modifications enregistrées !</span>}
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
