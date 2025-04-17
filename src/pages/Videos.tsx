
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import VideosContent from "@/components/VideosContent";
import { UserRole } from "@/types/test";
import { useAuth } from "@/contexts/AuthContext";

const Videos = () => {
  const { user } = useAuth();

  // Determine user role based on authentication data
  const userRole: UserRole = user?.email && (
    ["obistergaming@gmail.com", "kshitiz6000@gmail.com", "gaurav.attri8@gmail.com", "gauravattriji@gmail.com"].includes(user.email.toLowerCase()) ||
    (user.app_metadata && user.app_metadata.role === "ADMIN")
  ) ? "ADMIN" : "USER";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <VideosContent userRole={userRole} />
      </div>
    </SidebarProvider>
  );
};

export default Videos;
