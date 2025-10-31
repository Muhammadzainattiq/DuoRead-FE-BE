import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, LogOut, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  nativeLanguage: z.string().min(2, "Language must be at least 2 characters").max(50, "Language name too long")
});

const Profile = () => {
  const { user, logout, updateProfile, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    nativeLanguage: user?.native_language || ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    try {
      profileSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const success = await updateProfile(formData.name, formData.nativeLanguage);
    setLoading(false);
    
    if (success) {
      navigate("/app");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRestartTour = () => {
    localStorage.removeItem("onboarding_completed");
    toast.success("Tour will restart when you go back to the app");
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/app")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted cursor-not-allowed"
                placeholder="Your email address"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Email address cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="nativeLanguage">Native Language</Label>
              <LanguageSelector
                value={formData.nativeLanguage}
                onValueChange={(value) => setFormData({ ...formData, nativeLanguage: value })}
                placeholder="Select your native language"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This will be used for translations and AI features
              </p>
              {errors.nativeLanguage && <p className="text-sm text-destructive mt-1">{errors.nativeLanguage}</p>}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold mb-4">Account Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold mb-4">Help & Support</h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleRestartTour}
                className="w-full gap-2"
              >
                <Play className="w-4 h-4" />
                {hasCompletedOnboarding() ? "Restart" : "Start"} Onboarding Tour
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
