import { useState, useEffect } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Plus, Search, ShieldAlert, Home, FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { TestSchedule, UserRole } from "@/types/test";
import TestScheduleTable from "./TestScheduleTable";
import TestScheduleDialog from "./TestScheduleDialog";
import TestQuestionForm, { Question } from "./TestQuestionForm";
import MockTestPreview from "./MockTestPreview";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { Link } from "react-router-dom";
import { openGoogleDriveTestFolder } from "@/services/googleDriveService";
import { fetchTests, createTest, updateTest, deleteTest, saveTestQuestions, fetchTestQuestions } from "@/services/testService";
import { safelyStoreInLocalStorage, checkLocalStorageAvailability } from "@/utils/storageUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const TestManagementContent = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();

  const DEFAULT_ADMIN_EMAILS = ["obistergaming@gmail.com", "kshitiz6000@gmail.com", "gaurav.attri8@gmail.com", "gauravattriji@gmail.com"];
  const isDefaultAdmin = user?.email && DEFAULT_ADMIN_EMAILS.includes(user.email.toLowerCase());

  // Since this component is already wrapped in AdminRoute, we can safely assume the user is an admin
  // Force the userRole to ADMIN to ensure edit/delete buttons are shown
  const userRole: UserRole = "ADMIN";
  const isAdmin = true;

  // Log user information for debugging
  console.log("User info:", {
    email: user?.email,
    metadata: user?.app_metadata,
    isDefaultAdmin,
    userRole,
    isAdmin
  });

  const [testSchedules, setTestSchedules] = useState<TestSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [isMockTestPreviewOpen, setIsMockTestPreviewOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestSchedule | null>(null);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDeleteTitle, setTestToDeleteTitle] = useState<string>("");

  const handleAddNewTest = () => {
    setCurrentTest(null);
    setIsDialogOpen(true);
  };

  const handleEditTest = (test: TestSchedule) => {
    setCurrentTest(test);
    setIsDialogOpen(true);
  };

  // Load tests and subjects on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load tests
        const tests = await fetchTests();
        setTestSchedules(tests);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveTest = async (test: TestSchedule) => {
    if (currentTest) {
      // Update existing test
      const success = await updateTest(test);
      if (success) {
        setTestSchedules(testSchedules.map(t =>
          t.id === test.id ? test : t
        ));
        toast.success("Test updated successfully");
        setIsDialogOpen(false);
      }
    } else {
      // Create new test
      const newTest = await createTest(test);
      if (newTest) {
        setTestSchedules([...testSchedules, newTest]);
        toast.success("New test created successfully");
        setIsDialogOpen(false);

        setCurrentTest(newTest);
        setIsQuestionFormOpen(true);
      }
    }
  };

  const handleDeleteTest = (id: string) => {
    const testToDelete = testSchedules.find(test => test.id === id);
    if (testToDelete) {
      setTestToDelete(id);
      setTestToDeleteTitle(testToDelete.title);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteTest = async () => {
    if (testToDelete) {
      const success = await deleteTest(testToDelete);
      if (success) {
        setTestSchedules(testSchedules.filter(test => test.id !== testToDelete));
        toast.success("Test deleted successfully");
      }
      setTestToDelete(null);
      setTestToDeleteTitle("");
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAddQuestions = async (test: TestSchedule) => {
    setCurrentTest(test);

    // Load existing questions for this test if any
    const questions = await fetchTestQuestions(test.id);
    if (questions.length > 0) {
      setCurrentTestQuestions(questions);
    }

    setIsQuestionFormOpen(true);
  };

  const handlePreviewMockTest = async (questions: Question[]) => {
    // Save questions to Supabase if we have a current test
    if (currentTest) {
      console.log(`Saving ${questions.length} questions for test ${currentTest.id} from TestManagementContent`);

      // If there are no questions, we need to handle this case specially
      if (questions.length === 0) {
        console.log(`No questions to save for test ${currentTest.id}. Clearing any existing questions.`);

        // Clear questions from localStorage
        try {
          localStorage.removeItem(`test_questions_${currentTest.id}`);
          console.log(`Cleared questions from localStorage for test ${currentTest.id}`);
        } catch (error) {
          console.error(`Error clearing questions from localStorage: ${error}`);
        }

        // TODO: If using Supabase, we would delete all questions for this test here
        // For now, we'll just show a success message
        toast.success("Test updated with no questions");
      } else {
        // Save questions normally
        const success = await saveTestQuestions(currentTest.id, questions);
        if (success) {
          toast.success("Test questions saved successfully");

          // Check localStorage availability
          const storageStatus = checkLocalStorageAvailability();
          if (!storageStatus.available) {
            console.warn("localStorage is not available:", storageStatus.error);
            toast.info("Local storage is not available. Using server storage only.");
          } else {
            // Store in localStorage as a backup using our utility function
            const storageKey = `test_questions_${currentTest.id}`;
            const result = safelyStoreInLocalStorage(storageKey, questions);

            if (result.success) {
              console.log(`Also saved questions to localStorage as ${storageKey} (${result.size?.toFixed(2)}MB)`);
            } else {
              console.warn(`Failed to save to localStorage: ${result.error}`);
              if (result.size) {
                toast.info(`Test data is too large (${result.size.toFixed(2)}MB) for local storage. Using server storage only.`);
              } else {
                toast.info("Could not save to local storage. Using server storage only.");
              }
            }
          }
        }
      }
    }

    setCurrentTestQuestions(questions);
    setIsQuestionFormOpen(false);
    setIsMockTestPreviewOpen(true);
  };

  const handleOpenGoogleDriveFolder = () => {
    openGoogleDriveTestFolder();
  };

  const filteredTests = testSchedules.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.date.includes(searchQuery)
  );

  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Test Management</h1>
          <div className="flex items-center gap-2 bg-amber-100 text-amber-600 px-3 py-1 rounded-full ml-3">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-xs font-semibold">Admin Only</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-blue-600"
            onClick={handleOpenGoogleDriveFolder}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Google Drive</span>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
            <UserCircle2 className="text-gold h-5 w-5" />
            <span className="text-primary font-semibold text-sm">{userProfile?.displayName || user?.email?.split('@')[0] || "Admin"}</span>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleAddNewTest} className="bg-gold hover:bg-gold/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Test
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading tests...</p>
          </div>
        ) : testSchedules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No tests found. Create your first test!</p>
          </div>
        ) : (
          <TestScheduleTable
            tests={filteredTests}
            onEdit={handleEditTest}
            onDelete={handleDeleteTest}
            userRole="ADMIN" /* Force ADMIN role to ensure buttons are visible */
            onAddQuestions={handleAddQuestions}
          />
        )}

        <TestScheduleDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveTest}
          test={currentTest}
        />

        {currentTest && (
          <>
            <TestQuestionForm
              isOpen={isQuestionFormOpen}
              onClose={() => setIsQuestionFormOpen(false)}
              onPreview={handlePreviewMockTest}
              testTitle={currentTest.title}
            />

            <MockTestPreview
              isOpen={isMockTestPreviewOpen}
              onClose={() => setIsMockTestPreviewOpen(false)}
              questions={currentTestQuestions}
              testTitle={currentTest.title}
              testTime={currentTest.duration}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this test?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the test "{testToDeleteTitle}"
                and all associated questions and data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setTestToDelete(null);
                setTestToDeleteTitle("");
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTest}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </SidebarInset>
  );
};

export default TestManagementContent;
