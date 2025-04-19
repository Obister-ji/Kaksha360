
import { useState, useEffect } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Home, Search, AlertCircle, RefreshCw } from "lucide-react";
import TestCard from "./TestCard";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { fetchTests } from "@/services/testService";
import { TestSchedule } from "@/types/test";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";

const TestsContent = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  const [tests, setTests] = useState<TestSchedule[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tests on component mount
  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTests(tests);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTests(tests.filter(test =>
        test.title.toLowerCase().includes(query) ||
        test.instructor.toLowerCase().includes(query) ||
        test.date.includes(query) ||
        test.status.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, tests]);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTests = await fetchTests();
      setTests(fetchedTests);
      setFilteredTests(fetchedTests);
    } catch (err) {
      console.error("Error loading tests:", err);
      setError("Failed to load tests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-3 sm:py-5 px-4 sm:px-8 flex flex-wrap sm:flex-nowrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-primary" />
            <h1 className="text-xl sm:text-2xl font-playfair text-primary">Tests</h1>
          </div>
          <div className="flex sm:hidden items-center">
            <Button asChild variant="outline" size="sm" className="flex items-center w-9 h-9 p-0 justify-center">
              <Link to="/" aria-label="Home">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between">
          <Button asChild variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2 bg-gold/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full truncate max-w-[200px] sm:max-w-none">
            <UserCircle2 className="text-gold h-5 w-5 flex-shrink-0" />
            <span className="text-primary font-semibold text-xs sm:text-sm truncate">
              {userProfile?.displayName || user?.user_metadata?.full_name || "Student"}
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-full overflow-hidden">
        {/* Search and filter bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Button
            onClick={loadTests}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs sm:text-sm h-9 w-full sm:w-auto justify-center"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchQuery ? "No tests match your search criteria." : "No tests available."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                id={test.id}
                title={test.title}
                instructor={test.instructor}
                date={test.date}
                time={test.time}
                duration={test.duration}
                status={test.status}
                startDateTime={test.startDateTime}
                endDateTime={test.endDateTime}
              />
            ))}
          </div>
        )}
      </main>
    </SidebarInset>
  );
};

export default TestsContent;
