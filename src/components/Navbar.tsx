
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Home, LayoutDashboard, ClipboardList, CalendarPlus, Megaphone } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAuthClick = () => {
    if (user) {
      // If user is logged in, show dropdown
      return;
    } else {
      // If user is not logged in, navigate to auth page
      navigate("/auth");
    }
  };

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary shadow-md border-b border-white/10 w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/Logo.png" alt="Kaksha360 Logo" className="h-10 w-auto" />
              <span className="font-playfair text-2xl md:text-3xl font-bold gold-gradient">Kaksha360</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex space-x-8">
            {/* Only show Dashboard link when user is logged in */}
            {user && (
              <li>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-gold transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                >
                  Dashboard
                </Link>
              </li>
            )}
            {/* Only show Test Management link for admins */}
            {isAdmin && (
              <li>
                <Link
                  to="/test-management"
                  className="text-white hover:text-gold transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                >
                  Test Management
                </Link>
              </li>
            )}
          </ul>

          {/* Login/User Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden md:flex border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-300 px-6 rounded-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              onClick={handleAuthClick}
              className="hidden md:flex border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-300 px-6 rounded-full"
            >
              Login
            </Button>
          )}

          {/* Mobile Profile Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="md:hidden flex items-center gap-2 bg-white/5 border border-gold/30 text-gold hover:bg-gold/10 transition-all duration-300 px-5 py-2 rounded-full"
                >
                  <User className="w-5 h-5 text-gold" />
                  <span className="text-gold font-medium">Profile</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 p-0 bg-white rounded-lg overflow-hidden">
                <Link to="/dashboard" className="block">
                  <div className="flex items-center gap-2 p-3 bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="md:hidden flex items-center gap-2 bg-white/5 border border-gold/30 text-gold hover:bg-gold/10 transition-all duration-300 px-5 py-2 rounded-full"
            >
              <User className="w-5 h-5 text-gold" />
              <span className="text-gold font-medium">Login</span>
            </Button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
