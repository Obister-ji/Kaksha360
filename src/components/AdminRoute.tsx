
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactNode;
}

// List of default admin emails
const DEFAULT_ADMIN_EMAILS = [
  "obistergaming@gmail.com",
  "kshitiz6000@gmail.com",
  "gaurav.attri8@gmail.com",
  "gauravattriji@gmail.com"
];

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();

  // Check if user email is in the admin list
  const isAdmin = user?.email && (
    DEFAULT_ADMIN_EMAILS.includes(user.email.toLowerCase()) ||
    (user.app_metadata && user.app_metadata.role === "ADMIN")
  );

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect if not authenticated
  if (!user) {
    toast.error("Please log in to access this page");
    return <Navigate to="/auth" replace />;
  }

  // Redirect if authenticated but not an admin
  if (!isAdmin) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
