
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import TestsContent from "@/components/TestsContent";

const Tests = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <TestsContent />
      </div>
    </SidebarProvider>
  );
};

export default Tests;
