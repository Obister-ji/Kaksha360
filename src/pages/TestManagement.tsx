
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import TestManagementContent from "@/components/TestManagementContent";

const TestManagement = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <TestManagementContent />
      </div>
    </SidebarProvider>
  );
};

export default TestManagement;
