
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import PerformanceContent from "@/components/PerformanceContent";

const Performance = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <PerformanceContent />
      </div>
    </SidebarProvider>
  );
};

export default Performance;
