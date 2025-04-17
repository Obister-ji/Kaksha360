import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  UserCircle2,
  CheckCircle,
  XCircle,
  Filter,
  Bookmark,
  BookmarkCheck,
  Printer,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { fetchTestQuestions, fetchTests, getTestTimeTaken, getTestSubmission } from "@/services/testService";
import { fetchSubjects } from "@/services/subjectService";
import { TestSchedule } from "@/types/test";
import { Question } from "@/components/TestQuestionForm";
import { cn, formatTimeObject } from "@/lib/utils";
import { getSubjectDisplayName } from "@/utils/subjectUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import { Subject } from "@/components/AddSubjectModal";

interface TestSolutionProps {}

const TestSolution = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<TestSchedule | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Define the interface for test results
  interface TestResultsType {
    score: number;
    totalScore: number;
    accuracy: number;
    timeTaken: { minutes: number; seconds: number };
    correctAnswers: number;
    incorrectAnswers: number;
    unattemptedQuestions: number;
    subjectPerformance: Record<string, { correct: number; total: number }>;
  }

  // Test results summary
  const [testResults, setTestResults] = useState<TestResultsType>({
    score: 0,
    totalScore: 0,
    accuracy: 0,
    timeTaken: { minutes: 0, seconds: 0 },
    correctAnswers: 0,
    incorrectAnswers: 0,
    unattemptedQuestions: 0,
    subjectPerformance: {} // Will be populated based on actual questions
  });

  useEffect(() => {
    // Mark test as completed when viewing solutions
    if (id) {
      const completedTests = localStorage.getItem('completed_tests');
      let testsArray = completedTests ? JSON.parse(completedTests) : [];
      if (!testsArray.includes(id)) {
        testsArray.push(id);
        localStorage.setItem('completed_tests', JSON.stringify(testsArray));
      }
    }

    const loadTestAndResults = async () => {
      if (!id) {
        setError("Test ID is missing");
        setIsLoading(false);
        return;
      }

      // Load subjects
      try {
        const allSubjects = await fetchSubjects();
        setSubjects(allSubjects);
      } catch (error) {
        console.error("Error loading subjects:", error);
      }

      try {
        // Load test data
        const allTests = await fetchTests();
        const foundTest = allTests.find(test => test.id === id);

        if (foundTest) {
          setTest(foundTest);
        } else {
          // Fallback to mock test
          const mockTest: TestSchedule = {
            id: id,
            title: "JEE Mock Test - 1",
            instructor: "LAKSHYA",
            date: "2025/01/20",
            time: "02:00 PM - 05:00 PM",
            duration: "3 hours",
            status: "ONLINE",
            participants: ["Class 12 - Science"]
          };
          setTest(mockTest);
        }

        // Load questions
        const testQuestions = await fetchTestQuestions(id);
        setQuestions(testQuestions);

        // Load user answers from localStorage
        const savedAnswers = localStorage.getItem(`test_${id}_answers`);
        if (savedAnswers) {
          setUserAnswers(JSON.parse(savedAnswers));
        } else {
          // Mock user answers for demonstration
          const mockAnswers = testQuestions.map((_, index) => {
            // Randomly generate answers for demo purposes
            if (index % 5 === 0) return null; // Unattempted
            const options = ["A", "B", "C", "D"];
            return options[Math.floor(Math.random() * options.length)];
          });
          setUserAnswers(mockAnswers);
          localStorage.setItem(`test_${id}_answers`, JSON.stringify(mockAnswers));
        }

        // Load bookmarked questions
        const savedBookmarks = localStorage.getItem(`test_${id}_bookmarks`);
        if (savedBookmarks) {
          setBookmarkedQuestions(JSON.parse(savedBookmarks));
        }

        // Try to get the saved test submission data first
        const savedSubmission = getTestSubmission(id);

        if (savedSubmission && savedSubmission.score !== undefined && savedSubmission.totalScore !== undefined) {
          // Use the saved scores if available
          console.log("Using saved test submission data:", savedSubmission);

          // Calculate other metrics but use the saved score and totalScore
          calculateTestResultsWithSavedScores(
            testQuestions,
            savedAnswers ? JSON.parse(savedAnswers) : [],
            savedSubmission.score,
            savedSubmission.totalScore
          );
        } else {
          // Fall back to calculating everything
          console.log("No saved test submission data found, calculating results");
          calculateTestResults(testQuestions, savedAnswers ? JSON.parse(savedAnswers) : []);
        }
      } catch (error) {
        console.error("Error loading test solution:", error);
        setError("Failed to load test solution. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTestAndResults();
  }, [id]);

  const calculateTestResultsWithSavedScores = (
    questions: Question[],
    answers: (string | null)[],
    savedScore: number,
    savedTotalScore: number
  ) => {
    const totalQuestions = questions.length;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    // Initialize an empty object for subject performance - will be populated based on actual questions
    const subjectPerformance: Record<string, { correct: number, total: number }> = {};

    questions.forEach((question, index) => {
      // Update subject totals
      if (question.subject) {
        // Initialize the subject if it doesn't exist
        if (!subjectPerformance[question.subject]) {
          subjectPerformance[question.subject] = { correct: 0, total: 0 };
        }
        subjectPerformance[question.subject].total++;
      }

      const selectedAnswer = answers[index];
      if (!selectedAnswer) {
        unattemptedCount++;
      } else {
        // Check if answer is correct
        const optionIndex = selectedAnswer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
        if (question.options[optionIndex]?.isCorrect) {
          correctCount++;
          if (question.subject) {
            // Initialize the subject if it doesn't exist
            if (!subjectPerformance[question.subject]) {
              subjectPerformance[question.subject] = { correct: 0, total: 0 };
            }
            subjectPerformance[question.subject].correct++;
          }
        } else {
          incorrectCount++;
        }
      }
    });

    // Use the saved score and totalScore values
    const score = savedScore;
    const totalScore = savedTotalScore;
    const accuracy = Math.round((correctCount / (correctCount + incorrectCount)) * 100) || 0;

    // Get the actual time taken from storage
    const savedTimeTaken = id ? getTestTimeTaken(id) : null;
    const timeTaken = savedTimeTaken || { minutes: 120, seconds: 45 }; // Fallback to mock time if not found

    setTestResults({
      score,
      totalScore,
      accuracy,
      timeTaken,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unattemptedQuestions: unattemptedCount,
      subjectPerformance
    });
  };

  const calculateTestResults = (questions: Question[], answers: (string | null)[]) => {
    const totalQuestions = questions.length;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    // Initialize an empty object for subject performance - will be populated based on actual questions
    const subjectPerformance: Record<string, { correct: number, total: number }> = {};

    questions.forEach((question, index) => {
      // Update subject totals
      if (question.subject) {
        // Initialize the subject if it doesn't exist
        if (!subjectPerformance[question.subject]) {
          subjectPerformance[question.subject] = { correct: 0, total: 0 };
        }
        subjectPerformance[question.subject].total++;
      }

      const selectedAnswer = answers[index];
      if (!selectedAnswer) {
        unattemptedCount++;
      } else {
        // Check if answer is correct
        const optionIndex = selectedAnswer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
        if (question.options[optionIndex]?.isCorrect) {
          correctCount++;
          if (question.subject) {
            // Initialize the subject if it doesn't exist
            if (!subjectPerformance[question.subject]) {
              subjectPerformance[question.subject] = { correct: 0, total: 0 };
            }
            subjectPerformance[question.subject].correct++;
          }
        } else {
          incorrectCount++;
        }
      }
    });

    // Calculate score and accuracy
    let score = 0;
    let totalPossibleScore = 0;

    // Recalculate score using marks and negativeMarks
    questions.forEach((question, index) => {
      // Get marks and negative marks for this question (default to 4 and 1 if not specified)
      const marks = question.marks !== undefined ? question.marks : 4;
      const negativeMarks = question.negativeMarks !== undefined ? question.negativeMarks : 1;

      // Add to total possible score
      totalPossibleScore += marks;

      const userAnswer = userAnswers[index];
      if (userAnswer) {
        const optionIndex = userAnswer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
        if (question.options[optionIndex]?.isCorrect) {
          score += marks; // Add marks for correct answer
        } else {
          score -= negativeMarks; // Subtract negative marks for incorrect answer
        }
      }
    });

    // Make sure totalScore is always a positive integer representing the maximum possible score
    const totalScore = Math.abs(totalPossibleScore);
    const accuracy = Math.round((correctCount / (correctCount + incorrectCount)) * 100) || 0;

    // Get the actual time taken from storage
    const savedTimeTaken = id ? getTestTimeTaken(id) : null;
    const timeTaken = savedTimeTaken || { minutes: 120, seconds: 45 }; // Fallback to mock time if not found

    setTestResults({
      score: score,
      totalScore,
      accuracy,
      timeTaken,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unattemptedQuestions: unattemptedCount,
      subjectPerformance
    });
  };

  const toggleBookmark = (questionId: string) => {
    let updatedBookmarks: string[];

    if (bookmarkedQuestions.includes(questionId)) {
      updatedBookmarks = bookmarkedQuestions.filter(id => id !== questionId);
    } else {
      updatedBookmarks = [...bookmarkedQuestions, questionId];
    }

    setBookmarkedQuestions(updatedBookmarks);
    localStorage.setItem(`test_${id}_bookmarks`, JSON.stringify(updatedBookmarks));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert("PDF download functionality would be implemented here");
  };

  // Filter questions based on user selections
  const filteredQuestions = questions.filter(question => {
    // Filter by correctness
    if (showOnlyIncorrect) {
      const index = questions.findIndex(q => q.id === question.id);
      const answer = userAnswers[index];
      if (!answer) return false; // Skip unattempted

      const optionIndex = answer.charCodeAt(0) - 65;
      const isCorrect = question.options[optionIndex]?.isCorrect;
      if (isCorrect) return false;
    }

    // Filter by subject
    if (selectedSubject !== "all" && question.subject !== selectedSubject) {
      return false;
    }

    // Filter by difficulty (mock implementation)
    if (selectedDifficulty !== "all") {
      // In a real implementation, questions would have a difficulty property
      const mockDifficulty = question.id.length % 3 === 0 ? "easy" :
                            question.id.length % 3 === 1 ? "medium" : "hard";
      if (mockDifficulty !== selectedDifficulty) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test solutions...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Test not found"}</AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate("/tests")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 mb-6 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tests")}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-800">{test.title} - Solutions</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
              <UserCircle2 className="text-gold h-5 w-5" />
              <span className="text-primary font-semibold text-sm">
                {userProfile?.displayName || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Score</div>
              <div className="text-3xl font-bold" style={{ color: testResults.score < 0 ? '#ef4444' : '#3b82f6' }}>
                {testResults.score}
                <span className="text-sm text-gray-500 font-normal">
                  / {Math.abs(testResults.totalScore)}
                </span>
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-1">
                  Raw score: {testResults.score}, Raw total: {testResults.totalScore}
                </div>
              </div>
              <div className="text-xs text-gray-500 italic mt-2">
                Scoring: Marks for correct, negative marks for incorrect answers
                {testResults.score < 0 && <div className="mt-1 text-red-500">Your score is negative because you had more incorrect answers than correct ones.</div>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Accuracy</div>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-blue-600 mr-2">{testResults.accuracy}%</div>
                <Progress value={testResults.accuracy} className="h-2 flex-1" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Time Taken</div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <div className="text-xl font-semibold">{formatTimeObject(testResults.timeTaken)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Subject-wise Performance</h3>
              <div className="space-y-4">
                {/* Dynamically render only subjects that have questions */}
                {Object.entries(testResults.subjectPerformance)
                  .filter(([_, performance]) => performance.total > 0) // Only show subjects with questions
                  .map(([subjectId, performance]) => (
                  <div key={subjectId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {/* Map subject IDs to proper names */}
                        {getSubjectDisplayName(subjectId, subjects)}
                      </span>
                      <span className="text-sm font-medium">
                        {performance.correct} / {performance.total}
                      </span>
                    </div>
                    <Progress
                      value={performance.total > 0
                        ? (performance.correct / performance.total) * 100
                        : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Question Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Correct</span>
                  </div>
                  <span className="font-medium">{testResults.correctAnswers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Incorrect</span>
                  </div>
                  <span className="font-medium">{testResults.incorrectAnswers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-gray-300 mr-2"></div>
                    <span className="text-sm">Unattempted</span>
                  </div>
                  <span className="font-medium">{testResults.unattemptedQuestions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-incorrect"
                  checked={showOnlyIncorrect}
                  onCheckedChange={(checked) => setShowOnlyIncorrect(checked as boolean)}
                />
                <Label htmlFor="show-incorrect" className="text-sm font-medium cursor-pointer">
                  Show incorrect only
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {/* Default subjects */}
                    <SelectItem value="1">General Intelligence & Reasoning</SelectItem>
                    <SelectItem value="2">General Awareness</SelectItem>
                    <SelectItem value="3">Quantitative Aptitude</SelectItem>
                    <SelectItem value="4">English Comprehension</SelectItem>
                    <SelectItem value="5">Quantitative Aptitude & Reasoning</SelectItem>
                    <SelectItem value="6">General Awareness & English Comprehension</SelectItem>

                    {/* Custom subjects */}
                    {subjects
                      .filter(s => !['1', '2', '3', '4', '5', '6'].includes(s.id))
                      .map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Save PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Questions and Solutions */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 mb-2">No questions match your filters</div>
              <Button variant="outline" onClick={() => {
                setShowOnlyIncorrect(false);
                setSelectedSubject("all");
                setSelectedDifficulty("all");
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredQuestions.map((question, index) => {
              const questionIndex = questions.findIndex(q => q.id === question.id);
              const userAnswer = userAnswers[questionIndex];
              const userAnswerIndex = userAnswer ? userAnswer.charCodeAt(0) - 65 : -1;
              const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
              const isCorrect = userAnswerIndex >= 0 && question.options[userAnswerIndex]?.isCorrect;
              const isBookmarked = bookmarkedQuestions.includes(question.id);

              return (
                <div key={question.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Question Header */}
                  <div className={cn(
                    "p-4 flex justify-between items-center",
                    isCorrect ? "bg-green-50" : userAnswer ? "bg-red-50" : "bg-gray-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isCorrect ? "bg-green-100 text-green-600" :
                        userAnswer ? "bg-red-100 text-red-600" :
                        "bg-gray-200 text-gray-600"
                      )}>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : userAnswer ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">?</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Question {questionIndex + 1}</div>
                        <div className="text-sm font-medium capitalize">{question.subject}</div>
                      </div>
                      <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md flex items-center gap-1 text-xs" title="Marks for correct / negative marks for incorrect">
                        <span className="text-green-600 font-medium">+{question.marks || 4}</span> /
                        <span className="text-red-600 font-medium">-{question.negativeMarks || 1}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(question.id)}
                        className={cn(
                          "h-8 w-8 p-0",
                          isBookmarked ? "text-amber-500" : "text-gray-400"
                        )}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-6">
                    <div className="text-lg font-medium mb-4">{question.text}</div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                      {question.options.map((option, optIndex) => {
                        const optionLetter = String.fromCharCode(65 + optIndex);
                        const isUserSelected = userAnswerIndex === optIndex;
                        const isCorrectOption = option.isCorrect;

                        return (
                          <div
                            key={optIndex}
                            className={cn(
                              "p-3 border rounded-md flex items-start gap-3",
                              isUserSelected && isCorrectOption ? "bg-green-50 border-green-200" :
                              isUserSelected && !isCorrectOption ? "bg-red-50 border-red-200" :
                              isCorrectOption ? "bg-green-50 border-green-200" :
                              "border-gray-200"
                            )}
                            title={isUserSelected && isCorrectOption ? `+${question.marks || 4} marks` :
                                  isUserSelected && !isCorrectOption ? `-${question.negativeMarks || 1} marks` :
                                  ""}
                          >
                            <div className={cn(
                                "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium",
                                isUserSelected && isCorrectOption ? "bg-green-100 text-green-600" :
                                isUserSelected && !isCorrectOption ? "bg-red-100 text-red-600" :
                                isCorrectOption ? "bg-green-100 text-green-600" :
                                "bg-gray-100 text-gray-600"
                              )}
                            >
                              {optionLetter}
                            </div>

                            {/* Score indicator */}
                            {isUserSelected && (
                              <div className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded",
                                isCorrectOption ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              )}>
                                {isCorrectOption ?
                                  `+${question.marks || 4}` :
                                  `-${question.negativeMarks || 1}`}
                              </div>
                            )}

                            <div className="flex-1">
                              <div className={cn(
                                isUserSelected && isCorrectOption ? "text-green-700" :
                                isUserSelected && !isCorrectOption ? "text-red-700" :
                                isCorrectOption ? "text-green-700" :
                                "text-gray-700"
                              )}>
                                {option.text}
                              </div>

                              {/* Indicators for user selection and correct answer */}
                              {isUserSelected && (
                                <div className="mt-1 text-sm font-medium text-red-600">
                                  {isCorrectOption ? (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Your answer (Correct)
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Your answer (Incorrect)
                                    </div>
                                  )}
                                </div>
                              )}

                              {!isUserSelected && isCorrectOption && (
                                <div className="mt-1 text-sm font-medium text-green-600 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Correct answer
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solution */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-semibold mb-2">Solution</h3>
                      <div className="text-gray-700">
                        {question.solution || "The correct answer is option " +
                          String.fromCharCode(65 + correctOptionIndex) + "."}
                      </div>


                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSolution;
