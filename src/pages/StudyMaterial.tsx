
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import StudyMaterialContent from "@/components/StudyMaterialContent";
import { UserRole } from "@/types/test";
import { useAuth } from "@/contexts/AuthContext";

const StudyMaterial = () => {
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
        <StudyMaterialContent userRole={userRole} />
      </div>
    </SidebarProvider>
  );
};

export default StudyMaterial;
