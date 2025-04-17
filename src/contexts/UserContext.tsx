import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  displayName: string;
  initials: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  updateDisplayName: (displayName: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate initials from display name
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Load user profile from local storage or create default
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);

      if (!user) {
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        // Try to get profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is fine for new users
          console.error("Error fetching user profile:", error);
        }

        if (data) {
          // Profile exists in database
          setUserProfile({
            id: user.id,
            displayName: data.display_name || user.email?.split('@')[0] || 'User',
            initials: getInitials(data.display_name) || user.email?.charAt(0).toUpperCase() || 'U'
          });
        } else {
          // No profile yet, check local storage
          const storedProfile = localStorage.getItem(`user_profile_${user.id}`);

          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          } else {
            // Create default profile
            const defaultName = user.email?.split('@')[0] || 'User';
            const newProfile = {
              id: user.id,
              displayName: defaultName,
              initials: getInitials(defaultName)
            };

            setUserProfile(newProfile);
            localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(newProfile));

            // Try to save to Supabase
            await supabase.from('profiles').upsert({
              id: user.id,
              display_name: defaultName,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error("Error in user profile setup:", error);
        // Fallback to default profile
        const defaultName = user.email?.split('@')[0] || 'User';
        setUserProfile({
          id: user.id,
          displayName: defaultName,
          initials: getInitials(defaultName)
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Update display name
  const updateDisplayName = async (displayName: string) => {
    if (!user || !userProfile) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    try {
      setIsLoading(true);

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      const updatedProfile = {
        ...userProfile,
        displayName,
        initials: getInitials(displayName)
      };

      setUserProfile(updatedProfile);

      // Update local storage
      localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(updatedProfile));

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        isLoading,
        updateDisplayName
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
