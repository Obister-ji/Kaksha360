
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
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Tests</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
            <UserCircle2 className="text-gold h-5 w-5" />
            <span className="text-primary font-semibold text-sm">
              {userProfile?.displayName || user?.user_metadata?.full_name || "Student"}
            </span>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        {/* Search and filter bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={loadTests}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
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
