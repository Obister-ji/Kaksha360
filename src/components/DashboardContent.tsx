
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2 } from "lucide-react";
import TestCard from "./TestCard";
import { useUser } from "@/contexts/UserContext";

const DashboardContent = () => {
  const { userProfile } = useUser();
  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Tests</h1>
        </div>
        <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
          <UserCircle2 className="text-gold h-5 w-5" />
          <span className="text-primary font-semibold text-sm">{userProfile?.displayName || "User"}</span>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="space-y-5">
          <TestCard
            id="test-1"
            title="JEE Main Test Series - 6 Test Paper (Full Syllabus Test) 20/01/2025"
            instructor="LAKSHYA"
            date="2025/01/20"
            time="02:00 PM - 05:00 PM"
            duration="3 hours"
            status="ONLINE"
            startDateTime={new Date(2025, 0, 20, 14, 0).toISOString()}
            endDateTime={new Date(2025, 0, 20, 17, 0).toISOString()}
          />

          <TestCard
            id="test-2"
            title="12th Class Online Test (P Block Elements) 09/01/2025 Chemistry"
            instructor="LAKSHYA"
            date="2025/01/09"
            time="07:30 PM - 08:30 PM"
            duration="1 hour"
            status="ONLINE"
            startDateTime={new Date(2025, 0, 9, 19, 30).toISOString()}
            endDateTime={new Date(2025, 0, 9, 20, 30).toISOString()}
          />

          <TestCard
            id="test-3"
            title="12th Class Online Test (Organic Chemistry) 08/01/2025 Chemistry"
            instructor="LAKSHYA"
            date="2025/01/08"
            time="07:30 PM - 08:30 PM"
            duration="1 hour"
            status="ONLINE"
            startDateTime={new Date(2025, 0, 8, 19, 30).toISOString()}
            endDateTime={new Date(2025, 0, 8, 20, 30).toISOString()}
          />
        </div>
      </main>
    </SidebarInset>
  );
};

export default DashboardContent;
