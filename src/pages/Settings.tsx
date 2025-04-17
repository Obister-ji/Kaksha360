import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UserCircle2, Save } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const { userProfile, updateDisplayName, isLoading } = useUser();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      await updateDisplayName(displayName.trim());
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-light">
          <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-primary" />
              <h1 className="text-2xl font-playfair text-primary">Settings</h1>
            </div>
            <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
              <UserCircle2 className="text-gold h-5 w-5" />
              <span className="text-primary font-semibold text-sm">
                {userProfile?.displayName || user?.email?.split('@')[0] || "User"}
              </span>
            </div>
          </header>

          <main className="px-8 py-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                      <p className="text-sm text-gray-500">
                        This name will be displayed throughout the application
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500">
                        Your email address cannot be changed
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-gold hover:bg-gold/90 text-white"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
