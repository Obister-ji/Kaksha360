
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import Index from "./pages/Index";
import Tests from "./pages/Tests";
import TestManagement from "./pages/TestManagement";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Announcements from "./pages/Announcements";
import Videos from "./pages/Videos";
import StudyMaterial from "./pages/StudyMaterial";
import Doubts from "./pages/Doubts";
import Performance from "./pages/Performance";
import TakeTest from "./pages/TakeTest";
import TestSolution from "./pages/TestSolution";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Redirect /dashboard to /tests */}
              <Route path="/dashboard" element={<Navigate to="/tests" replace />} />
              <Route
              path="/tests"
              element={
                <ProtectedRoute>
                  <Tests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-management"
              element={
                <AdminRoute>
                  <TestManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-material"
              element={
                <ProtectedRoute>
                  <StudyMaterial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doubts"
              element={
                <ProtectedRoute>
                  <Doubts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <Performance />
                </ProtectedRoute>
              }
            />
              <Route
                path="/take-test/:id"
                element={
                  <ProtectedRoute>
                    <TakeTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-solution/:id"
                element={
                  <ProtectedRoute>
                    <TestSolution />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
