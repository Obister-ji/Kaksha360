
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Megaphone,
  ClipboardList,
  CalendarPlus,
  Video,
  BookOpen,
  ShieldAlert,
  LayoutDashboard,
  Home
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isMobile } = useSidebar();

  // List of default admin emails
  const DEFAULT_ADMIN_EMAILS = [
    "obistergaming@gmail.com",
    "kshitiz6000@gmail.com",
    "gaurav.attri8@gmail.com",
    "gauravattriji@gmail.com"
  ];

  // Check if user email is in the admin list or has admin role in metadata
  const isAdmin = user?.email && (
    DEFAULT_ADMIN_EMAILS.includes(user.email.toLowerCase()) ||
    (user.app_metadata && user.app_metadata.role === "ADMIN")
  );

  return (
    <Sidebar className={`${isMobile ? 'bg-navy' : 'bg-gradient-to-br from-primary to-secondary'} text-white`}>
      <SidebarHeader className={`border-b border-white/10 pb-4 ${isMobile ? 'pt-6 px-6' : ''}`}>
        <div className="flex items-center gap-2">
          <img src="/Logo.png" alt="Kaksha360 Logo" className="h-8 w-auto" />
          <h1 className={`font-playfair font-bold gold-gradient ${isMobile ? 'text-3xl' : 'text-2xl'}`}>Kaksha360</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className={isMobile ? 'p-4' : ''}>
        <SidebarMenu className={isMobile ? 'space-y-3' : ''}>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/"}
              tooltip="Home"
              className={isMobile ? 'py-3 text-base' : ''}
            >
              <Link to="/">
                <Home className={`${location.pathname === "/" ? "text-gold" : ""} ${isMobile ? 'h-5 w-5 text-white' : ''}`} />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/dashboard"}
              tooltip="Dashboard"
              className={isMobile ? 'py-3 text-base' : ''}
            >
              <Link to="/dashboard">
                <LayoutDashboard className={`${location.pathname === "/dashboard" ? "text-gold" : ""} ${isMobile ? 'h-5 w-5 text-white' : ''}`} />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/tests"}
              tooltip="Tests"
              className={isMobile ? 'py-3 text-base' : ''}
            >
              <Link to="/tests">
                <ClipboardList className={`${location.pathname === "/tests" ? "text-gold" : ""} ${isMobile ? 'h-5 w-5 text-white' : ''}`} />
                <span>Tests</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/test-management"}
                tooltip="Test Management"
                className={isMobile ? 'py-3 text-base' : ''}
              >
                <Link to="/test-management">
                  <CalendarPlus className={`${location.pathname === "/test-management" ? "text-gold" : ""} ${isMobile ? 'h-5 w-5 text-white' : ''}`} />
                  <span>Test Management</span>
                  <div className={`ml-2 p-1 bg-amber-100 rounded-full ${isMobile ? 'p-1.5' : ''}`}>
                    <ShieldAlert className={`text-amber-600 ${isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3'}`} />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/announcements"}
              tooltip="Announcements"
              className={isMobile ? 'py-3 text-base' : ''}
            >
              <Link to="/announcements">
                <Megaphone className={isMobile ? 'h-5 w-5 text-white' : ''} />
                <span>Announcements</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/videos"}
              tooltip="Videos"
              className={isMobile ? 'py-3 text-base' : ''}
            >
              <Link to="/videos">
                <Video className={isMobile ? 'h-5 w-5 text-white' : ''} />
                <span>Videos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/study-material"}
              tooltip="Study Material"
              className={isMobile ? 'py-3 text-base' : ''}
            >
              <Link to="/study-material">
                <BookOpen className={isMobile ? 'h-5 w-5 text-white' : ''} />
                <span>Study Material</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
