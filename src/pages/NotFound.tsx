
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-primary font-playfair">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
        <p className="text-gray-500 mb-8">The page might have been moved or deleted, or you might have mistyped the URL.</p>
        <Link to="/">
          <Button className="bg-primary hover:bg-secondary text-white px-6">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
