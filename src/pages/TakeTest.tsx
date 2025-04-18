import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Clock, UserCircle2, CalendarClock, Timer, Square, X, CheckSquare, HelpCircle, Search } from "lucide-react";
import { fetchTestQuestions, fetchTests, saveTestSubmission } from "@/services/testService";
import { fetchSubjects } from "@/services/subjectService";
import { TestSchedule } from "@/types/test";
import { Question } from "@/components/TestQuestionForm";
import { cn, parseDurationToSeconds, secondsToTimeObject } from "@/lib/utils";
import { getSubjectDisplayName } from "@/utils/subjectUtils";
import { toast } from "sonner";
import TestResultsSummary from "@/components/TestResultsSummary";

type QuestionStatus = "not-visited" | "unanswered" | "answered" | "review" | "review-with-answer";

const TakeTest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestSchedule | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTestAvailable, setIsTestAvailable] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<(string | null)[]>([]);
  const [tempSelectedOption, setTempSelectedOption] = useState<string | null>(null);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>([]);
  const [counters, setCounters] = useState({
    "not-visited": 0,
    "unanswered": 0,
    "answered": 0,
    "review": 0,
    "review-with-answer": 0
  });
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 174, seconds: 17 });
  const [timeTaken, setTimeTaken] = useState({ minutes: 0, seconds: 0 });
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [isStatusPanelMinimized, setIsStatusPanelMinimized] = useState(false);
  const [testResults, setTestResults] = useState({
    score: 0,
    totalScore: 0,
    accuracy: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    partiallyCorrectAnswers: 0,
    unattemptedQuestions: 0
  });
  const [subject, setSubject] = useState("1"); // Default to General Intelligence & Reasoning
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);

  // Get all available subjects that have questions
  const availableSubjects = questions.length > 0
    ? [...new Set(questions.map(q => q.subject))]
    : [];

  // If current subject has no questions but there are other subjects with questions,
  // automatically select the first available subject
  useEffect(() => {
    if (questions.length > 0 && !questions.some(q => q.subject === subject) && availableSubjects.length > 0) {
      console.log(`Current subject '${subject}' has no questions. Switching to '${availableSubjects[0]}'`);
      setSubject(availableSubjects[0]);
    }
  }, [questions, subject, availableSubjects]);

  // Get filtered questions based on selected subject
  const filteredQuestions = questions.length > 0
    ? questions.filter(q => q.subject === subject)
    : [];

  console.log(`Total questions: ${questions.length}, Available subjects: ${availableSubjects.join(', ')}, Filtered questions for subject '${subject}': ${filteredQuestions.length}`);

  // Get current question based on filtered list
  const currentQuestionData = filteredQuestions.length > 0 && currentQuestion <= filteredQuestions.length
    ? filteredQuestions[currentQuestion - 1]
    : null;

  // Get the actual index of the current question in the full questions array
  const currentQuestionIndex = currentQuestionData
    ? questions.findIndex(q => q.id === currentQuestionData.id)
    : -1;

  // Update tempSelectedOption when currentQuestion changes
  useEffect(() => {
    if (currentQuestionIndex !== -1) {
      // Set tempSelectedOption to the saved answer for this question (if any)
      setTempSelectedOption(selectedOptions[currentQuestionIndex]);
    }
  }, [currentQuestion, currentQuestionIndex, selectedOptions]);

  // Add scroll indicators to scrollable containers
  useEffect(() => {
    const addScrollIndicators = () => {
      // For question container
      const questionContainer = document.getElementById('question');
      if (questionContainer) {
        const hasScroll = questionContainer.scrollHeight > questionContainer.clientHeight;
        const indicator = questionContainer.querySelector('.scroll-indicator');
        if (indicator) {
          if (hasScroll) {
            indicator.classList.add('has-scroll');
          } else {
            indicator.classList.remove('has-scroll');
          }
        }
      }

      // For option containers
      const optionContainers = document.querySelectorAll('.option-container');
      optionContainers.forEach(container => {
        const hasScroll = container.scrollHeight > container.clientHeight;
        const indicator = container.querySelector('.scroll-indicator');
        if (indicator) {
          if (hasScroll) {
            indicator.classList.add('has-scroll');
          } else {
            indicator.classList.remove('has-scroll');
          }
        }
      });
    };

    // Run initially and on window resize
    addScrollIndicators();
    window.addEventListener('resize', addScrollIndicators);

    return () => {
      window.removeEventListener('resize', addScrollIndicators);
    };
  }, [currentQuestion, filteredQuestions.length]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Security measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.warning('You are not allowed to switch tabs or minimize the window during the test.');
        enterFullscreen();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return 'Are you sure you want to leave? Your progress will be lost.';
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 'r' || e.key === 'R')) ||
          (e.altKey && e.key === 'F4') ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Prevent console opening
    const devtools = function () {};
    devtools.toString = function () {
      toast.warning('Console opening is not allowed during the test.');
      return '';
    };
    console.log('%c ', devtools as any);

    // Enter fullscreen on load
    enterFullscreen();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  }

  // Fetch subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const fetchedSubjects = await fetchSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    loadSubjects();
  }, []);

  // Initialize test data
  useEffect(() => {
    const loadTest = async () => {
      if (!id) {
        setError("Test ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch the test from the API
        try {
          // First, try to get the test from the fetchTests function
          const allTests = await fetchTests();
          const foundTest = allTests.find(test => test.id === id);

          if (foundTest) {
            setTest(foundTest);

            // Check if the test is currently available
            const availability = checkTestAvailability(foundTest);
            if (!availability.isAvailable) {
              setIsTestAvailable(false);
              setError(availability.message);
            }
          } else {
            // Fallback to a mock test if not found
            const mockTest: TestSchedule = {
              id,
              title: "JEE Mock Test - 1",
              instructor: "LAKSHYA",
              date: "2025/01/20",
              time: "02:00 PM - 05:00 PM",
              duration: "3 hours",
              status: "ONLINE",
              participants: ["Class 12 - Science"]
            };
            setTest(mockTest);

            // Check if the mock test is currently available
            const availability = checkTestAvailability(mockTest);
            if (!availability.isAvailable) {
              setIsTestAvailable(false);
              setError(availability.message);
            }
          }
        } catch (err) {
          console.error("Error fetching test:", err);
          // Fallback to a mock test
          const mockTest: TestSchedule = {
            id,
            title: "JEE Mock Test - 1",
            instructor: "LAKSHYA",
            date: "2025/01/20",
            time: "02:00 PM - 05:00 PM",
            duration: "3 hours",
            status: "ONLINE",
            participants: ["Class 12 - Science"]
          };
          setTest(mockTest);

          // Check if the mock test is currently available
          const availability = checkTestAvailability(mockTest);
          if (!availability.isAvailable) {
            setIsTestAvailable(false);
            setError(availability.message);
          }
        }

        // Try to fetch questions for the test
        let testQuestions: Question[] = [];
        let mockQuestions: Question[] = [];

        try {
          console.log(`Fetching questions for test ID: ${id}`);
          testQuestions = await fetchTestQuestions(id);

          // If no questions are returned, create mock questions
          if (!testQuestions || testQuestions.length === 0) {
            console.log("No questions found for test, using mock questions");
            mockQuestions = Array(25).fill(null).map((_, i) => ({
              id: `q-${i + 1}`,
              text: `This is question ${i + 1} about ${i % 6 === 0 ? 'General Intelligence & Reasoning' :
                i % 6 === 1 ? 'General Awareness' :
                i % 6 === 2 ? 'Quantitative Aptitude' :
                i % 6 === 3 ? 'English Comprehension' :
                i % 6 === 4 ? 'Quantitative Aptitude & Reasoning' : 'General Awareness & English Comprehension'}`,
              subject: (i % 6 === 0 ? '1' : i % 6 === 1 ? '2' : i % 6 === 2 ? '3' : i % 6 === 3 ? '4' : i % 6 === 4 ? '5' : '6'),
              options: [
                { id: `q-${i + 1}-a`, text: `Option A for question ${i + 1}`, isCorrect: i % 4 === 0 },
                { id: `q-${i + 1}-b`, text: `Option B for question ${i + 1}`, isCorrect: i % 4 === 1 },
                { id: `q-${i + 1}-c`, text: `Option C for question ${i + 1}`, isCorrect: i % 4 === 2 },
                { id: `q-${i + 1}-d`, text: `Option D for question ${i + 1}`, isCorrect: i % 4 === 3 }
              ],
              marks: 4,
              negativeMarks: 1
            }));
            setQuestions(mockQuestions);
          } else {
            console.log("Found questions for test:", testQuestions.length);
            setQuestions(testQuestions);
          }
        } catch (error) {
          console.error("Error fetching test questions:", error);
          // Fallback to mock questions
          mockQuestions = Array(40).fill(null).map((_, i) => {
            // Determine subject based on index
            let subject: string;

            if (i % 6 === 0) {
              subject = '1'; // General Intelligence & Reasoning
            } else if (i % 6 === 1) {
              subject = '2'; // General Awareness
            } else if (i % 6 === 2) {
              subject = '3'; // Quantitative Aptitude
            } else if (i % 6 === 3) {
              subject = '4'; // English Comprehension
            } else if (i % 6 === 4) {
              subject = '5'; // Quantitative Aptitude & Reasoning
            } else {
              subject = '6'; // General Awareness & English Comprehension
            }

            return {
              id: `q-${i + 1}`,
              text: `This is question ${i + 1} about ${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
              subject: subject,
              options: [
                { id: `q-${i + 1}-a`, text: `Option A for question ${i + 1}`, isCorrect: i % 4 === 0 },
                { id: `q-${i + 1}-b`, text: `Option B for question ${i + 1}`, isCorrect: i % 4 === 1 },
                { id: `q-${i + 1}-c`, text: `Option C for question ${i + 1}`, isCorrect: i % 4 === 2 },
                { id: `q-${i + 1}-d`, text: `Option D for question ${i + 1}`, isCorrect: i % 4 === 3 }
              ],
              marks: 4,
              negativeMarks: 1
            };
          });
          setQuestions(mockQuestions);
        }

        // Initialize question status and selected options
        // Use the questions we've already loaded
        const questionsToInitialize = mockQuestions.length > 0 ? mockQuestions : testQuestions;
        const totalQuestions = questionsToInitialize.length;
        console.log(`Initializing status for ${totalQuestions} questions`);

        // Create arrays for status and options
        const initialStatus = Array(totalQuestions).fill("not-visited");
        const initialOptions = Array(totalQuestions).fill(null);

        // Set the state
        setQuestionStatus(initialStatus);
        setSelectedOptions(initialOptions);

        // Reset all counters and set not-visited to total questions
        setCounters({
          "not-visited": totalQuestions,
          "unanswered": 0,
          "answered": 0,
          "review": 0,
          "review-with-answer": 0
        });

        // Mark the first question as visited
        if (totalQuestions > 0) {
          setTimeout(() => {
            updateQuestionStatus(0, "unanswered");
          }, 100);
        }

      } catch (err) {
        console.error("Error loading test:", err);
        setError("Test unavailable. Please refresh or contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();

    // Start the timer
    startTimer();

    // Security measures
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]);

  // Security functions
  const handleVisibilityChange = () => {
    if (document.hidden) {
      alert('You are not allowed to switch tabs or minimize the window during the test.');
    }
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
    return 'Are you sure you want to leave? Your progress will be lost.';
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  const handleCopyPaste = (e: ClipboardEvent) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 'r' || e.key === 'R')) ||
        (e.altKey && e.key === 'F4') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
      e.preventDefault();
    }
  };

  // Timer function
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          if (timerRef.current) clearInterval(timerRef.current);

          // Automatically submit the test when time runs out
          if (!isTestSubmitted) {
            console.log('Time is up! Automatically submitting test...');
            // Use setTimeout to ensure state updates have completed
            setTimeout(() => {
              handleSubmitTest(true); // Pass true to indicate auto-submission
              toast.warning('Time is up! Your test has been automatically submitted.');
            }, 100);
          }

          return prev;
        }

        // Show warning when 5 minutes or less are remaining
        if (prev.minutes === 5 && prev.seconds === 0) {
          toast.warning('5 minutes remaining! Your test will be automatically submitted when time runs out.');
        }

        // Show warning when 1 minute is remaining
        if (prev.minutes === 1 && prev.seconds === 0) {
          toast.warning('1 minute remaining! Finish your test quickly.');
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return { minutes: prev.minutes, seconds: prev.seconds - 1 };
        }
      });
    }, 1000);
  };

  // Update question status
  const updateQuestionStatus = (questionIndex: number, newStatus: QuestionStatus) => {
    // Validate question index
    if (questionIndex < 0 || questionIndex >= questions.length) {
      console.error(`Invalid question index: ${questionIndex}`);
      return;
    }

    const oldStatus = questionStatus[questionIndex];

    // Don't update if status is the same
    if (oldStatus === newStatus) {
      console.log(`Question ${questionIndex + 1} status unchanged: ${oldStatus}`);
      return;
    }

    console.log(`Updating question ${questionIndex + 1} status from ${oldStatus} to ${newStatus}`);

    setQuestionStatus(prev => {
      const updated = [...prev];
      updated[questionIndex] = newStatus;
      return updated;
    });

    // Update counters
    setCounters(prev => {
      const updated = { ...prev };

      // Decrement old status counter
      if (oldStatus) {
        updated[oldStatus] = Math.max(0, updated[oldStatus] - 1);

        // Special handling for review-with-answer
        if (oldStatus === "review-with-answer") {
          updated["answered"] = Math.max(0, updated["answered"] - 1);
        }
      }

      // Increment new status counter
      updated[newStatus] = (updated[newStatus] || 0) + 1;

      // Special handling for review-with-answer
      if (newStatus === "review-with-answer") {
        updated["answered"] = (updated["answered"] || 0) + 1;
      }

      console.log("Updated counters:", updated);
      return updated;
    });
  };

  // Timer functionality
  useEffect(() => {
    // Only start the timer when we have the test data
    if (!test) return;

    // Parse the duration from the test schedule
    const durationSeconds = parseDurationToSeconds(test.duration);
    console.log(`Starting timer with duration: ${test.duration} (${durationSeconds} seconds)`);

    // Initialize the timer with the parsed duration
    let totalSeconds = durationSeconds;

    // Set initial time remaining
    const initialTimeObj = secondsToTimeObject(totalSeconds);
    setTimeRemaining(initialTimeObj);

    timerRef.current = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeRemaining({ minutes, seconds });
      } else {
        // Time's up - submit the test automatically
        if (timerRef.current) clearInterval(timerRef.current);
        toast.warning("Time's up! Your test is being submitted automatically.");
        setTimeout(() => handleSubmitTest(), 2000);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test]);

  // Function to check if a test is currently active based on its scheduled time
  const checkTestAvailability = (testData: TestSchedule): { isAvailable: boolean; message: string } => {
    const now = new Date();

    // If we have explicit startDateTime and endDateTime, use those
    if (testData.startDateTime && testData.endDateTime) {
      const startTime = new Date(testData.startDateTime);
      const endTime = new Date(testData.endDateTime);

      if (now < startTime) {
        // Test hasn't started yet
        const diffMs = startTime.getTime() - now.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        return {
          isAvailable: false,
          message: `This test is not yet available. It will start in ${diffHours} hour${diffHours !== 1 ? 's' : ''}.`
        };
      } else if (now > endTime) {
        // Test has ended
        return {
          isAvailable: false,
          message: "This test is no longer available. The scheduled time has passed."
        };
      }

      // Test is currently active
      return { isAvailable: true, message: "" };
    }

    // If we don't have explicit start/end times, try to parse from the date and time strings
    try {
      const [startTimeStr, endTimeStr] = testData.time.split(' - ');
      if (!startTimeStr || !endTimeStr) {
        return { isAvailable: true, message: "" }; // Default to available if we can't parse
      }

      const testDateObj = new Date(testData.date.replace(/\//g, "-"));
      const startTimeParts = startTimeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      const endTimeParts = endTimeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);

      if (!startTimeParts || !endTimeParts) {
        return { isAvailable: true, message: "" }; // Default to available if we can't parse
      }

      const startHour = parseInt(startTimeParts[1]) + (startTimeParts[3].toUpperCase() === 'PM' && parseInt(startTimeParts[1]) !== 12 ? 12 : 0);
      const startMinute = parseInt(startTimeParts[2]);
      const endHour = parseInt(endTimeParts[1]) + (endTimeParts[3].toUpperCase() === 'PM' && parseInt(endTimeParts[1]) !== 12 ? 12 : 0);
      const endMinute = parseInt(endTimeParts[2]);

      const startTime = new Date(testDateObj);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(testDateObj);
      endTime.setHours(endHour, endMinute, 0, 0);

      // If end time is earlier than start time, assume it's the next day
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      if (now < startTime) {
        // Test hasn't started yet
        const diffMs = startTime.getTime() - now.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        return {
          isAvailable: false,
          message: `This test is not yet available. It will start in ${diffHours} hour${diffHours !== 1 ? 's' : ''}.`
        };
      } else if (now > endTime) {
        // Test has ended
        return {
          isAvailable: false,
          message: "This test is no longer available. The scheduled time has passed."
        };
      }

      // Test is currently active
      return { isAvailable: true, message: "" };
    } catch (error) {
      console.error('Error checking test availability:', error);
      return { isAvailable: true, message: "" }; // Default to available if there's an error
    }
  };

  // Function to check if an element is scrollable
  const isScrollable = (element: HTMLElement) => {
    return element.scrollHeight > element.clientHeight;
  };

  // Add scroll detection for question and options
  useEffect(() => {
    // Check if question is scrollable
    const questionElement = document.getElementById('question');
    if (questionElement) {
      const questionScrollIndicator = questionElement.querySelector('.scroll-indicator');
      if (questionScrollIndicator) {
        if (isScrollable(questionElement)) {
          questionScrollIndicator.classList.add('has-scroll');
        } else {
          questionScrollIndicator.classList.remove('has-scroll');
        }
      }
    }

    // Check if options are scrollable
    const optionContainers = document.querySelectorAll('.option-container');
    optionContainers.forEach(container => {
      const scrollIndicator = container.querySelector('.scroll-indicator');
      if (scrollIndicator && container instanceof HTMLElement) {
        if (isScrollable(container)) {
          scrollIndicator.classList.add('has-scroll');
        } else {
          scrollIndicator.classList.remove('has-scroll');
        }
      }
    });
  }, [currentQuestionData, currentQuestionIndex]); // Depend on test so timer starts when test data is loaded

  // Handle option selection - only updates the temporary selection
  const handleOptionSelect = (option: string) => {
    if (!currentQuestionData || currentQuestionIndex === -1) {
      console.error("Cannot select option: No current question data");
      return;
    }

    console.log(`Temporarily selecting option ${option} for question at index ${currentQuestionIndex}`);

    // Only update the temporary selection, not the actual saved answer
    setTempSelectedOption(option);
  };

  // Handle mark for review
  const handleMarkReview = () => {
    if (!currentQuestionData || currentQuestionIndex === -1) {
      console.error("Cannot mark for review: No current question data");
      return;
    }

    console.log(`Marking question at index ${currentQuestionIndex} for review`);

    const selectedOption = selectedOptions[currentQuestionIndex];

    if (selectedOption) {
      updateQuestionStatus(currentQuestionIndex, "review-with-answer");
    } else {
      updateQuestionStatus(currentQuestionIndex, "review");
    }
  };

  // Handle clear selection
  const handleClearSelection = () => {
    if (!currentQuestionData || currentQuestionIndex === -1) {
      console.error("Cannot clear selection: No current question data");
      return;
    }

    console.log(`Clearing selection for question at index ${currentQuestionIndex}`);

    // Clear both the temporary selection and the saved selection
    setTempSelectedOption(null);

    setSelectedOptions(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = null;
      return updated;
    });

    if (questionStatus[currentQuestionIndex] === "answered" ||
        questionStatus[currentQuestionIndex] === "review-with-answer") {
      updateQuestionStatus(currentQuestionIndex, "unanswered");
    }
  };

  // Handle navigation
  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      // If there's a temporary selection, discard it when moving to previous question
      if (tempSelectedOption) {
        console.log(`Discarding temporary selection for question at index ${currentQuestionIndex}`);
        setTempSelectedOption(null);
      }

      if (currentQuestionData && currentQuestionIndex !== -1 && questionStatus[currentQuestionIndex] === "not-visited") {
        updateQuestionStatus(currentQuestionIndex, "unanswered");
      }
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (filteredQuestions.length > 0 && currentQuestion < filteredQuestions.length) {
      // Save the temporary selected option to the actual selectedOptions array
      if (tempSelectedOption && currentQuestionIndex !== -1) {
        console.log(`Saving option ${tempSelectedOption} for question at index ${currentQuestionIndex}`);

        setSelectedOptions(prev => {
          const updated = [...prev];
          updated[currentQuestionIndex] = tempSelectedOption;
          return updated;
        });

        // Update question status based on the saved answer
        if (questionStatus[currentQuestionIndex] === "review") {
          updateQuestionStatus(currentQuestionIndex, "review-with-answer");
        } else {
          updateQuestionStatus(currentQuestionIndex, "answered");
        }
      } else if (currentQuestionData && currentQuestionIndex !== -1 && questionStatus[currentQuestionIndex] === "not-visited") {
        updateQuestionStatus(currentQuestionIndex, "unanswered");
      }

      // Move to the next question
      setCurrentQuestion(prev => prev + 1);

      // Reset the temporary selection for the next question
      setTempSelectedOption(null);
    }
  };

  // Handle question selection from status list
  const handleQuestionSelect = (questionNumber: number) => {
    // If there's a temporary selection, discard it when jumping to another question
    if (tempSelectedOption) {
      console.log(`Discarding temporary selection for question at index ${currentQuestionIndex}`);
      setTempSelectedOption(null);
    }

    // Find the question in the full questions array
    const selectedQuestion = questions[questionNumber - 1];
    if (!selectedQuestion) {
      console.error(`Cannot select question ${questionNumber}: Question not found`);
      return;
    }

    console.log(`Selecting question ${questionNumber} (${selectedQuestion.subject})`);

    // If the question is from a different subject, switch to that subject
    if (selectedQuestion.subject !== subject) {
      console.log(`Switching subject from ${subject} to ${selectedQuestion.subject}`);
      setSubject(selectedQuestion.subject);

      // We need to wait for the filteredQuestions to update before setting currentQuestion
      setTimeout(() => {
        // Find the position of this question in the filtered list for the new subject
        const filteredIndex = questions
          .filter(q => q.subject === selectedQuestion.subject)
          .findIndex(q => q.id === selectedQuestion.id);

        if (filteredIndex !== -1) {
          setCurrentQuestion(filteredIndex + 1);
        }
      }, 0);
    } else {
      // Find the position of this question in the filtered list
      const filteredIndex = filteredQuestions.findIndex(q => q.id === selectedQuestion.id);

      if (filteredIndex !== -1) {
        // Update current question status if needed
        if (currentQuestionData && currentQuestionIndex !== -1 && questionStatus[currentQuestionIndex] === "not-visited") {
          updateQuestionStatus(currentQuestionIndex, "unanswered");
        }

        // Set the new current question
        setCurrentQuestion(filteredIndex + 1);
      }
    }
  };

  // Handle test submission
  const handleSubmitTest = (isAutoSubmit = false) => {
    // Save any pending temporary selection before submitting
    if (tempSelectedOption && currentQuestionIndex !== -1) {
      console.log(`Saving pending temporary selection ${tempSelectedOption} for question at index ${currentQuestionIndex} before submission`);

      setSelectedOptions(prev => {
        const updated = [...prev];
        updated[currentQuestionIndex] = tempSelectedOption;
        return updated;
      });

      // Clear the temporary selection
      setTempSelectedOption(null);
    }

    // Skip confirmation for auto-submissions when time runs out
    if (isAutoSubmit || window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      // Calculate time taken based on the test duration
      if (!test) {
        toast.error("Test data is missing");
        return;
      }

      // Parse the duration from the test schedule
      const durationSeconds = parseDurationToSeconds(test.duration);

      // Calculate time taken by subtracting remaining time from total duration
      const remainingSeconds = timeRemaining.minutes * 60 + timeRemaining.seconds;
      const totalSeconds = durationSeconds - remainingSeconds;

      const finalTimeTaken = secondsToTimeObject(totalSeconds);
      setTimeTaken(finalTimeTaken);

      // Calculate results
      const totalQuestions = questions.length;
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;
      let score = 0;
      let totalPossibleScore = 0;

      // Initialize an object for subject performance - will be populated based on actual questions
      const subjectPerformance: Record<string, { correct: number, total: number, attempted: number }> = {};

      // In a real app, you would compare with correct answers from the server
      // This is a simplified example where we're using the isCorrect property
      questions.forEach((question, index) => {
        // Get marks and negative marks for this question (default to 4 and 1 if not specified)
        const marks = question.marks !== undefined ? question.marks : 4;
        const negativeMarks = question.negativeMarks !== undefined ? question.negativeMarks : 1;

        // Add to total possible score
        totalPossibleScore += marks;

        // Update subject totals
        if (question.subject) {
          // Initialize the subject if it doesn't exist
          if (!subjectPerformance[question.subject]) {
            subjectPerformance[question.subject] = { correct: 0, total: 0, attempted: 0 };
          }
          subjectPerformance[question.subject].total++;
        }

        const selectedOption = selectedOptions[index];
        if (!selectedOption) {
          unattemptedCount++;
        } else {
          // This question was attempted
          if (question.subject && subjectPerformance[question.subject]) {
            subjectPerformance[question.subject].attempted++;
          }

          // Find if the selected option is correct
          // This is a simplified example - in a real app, you'd have proper answer checking
          const optionIndex = selectedOption.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
          if (question.options[optionIndex]?.isCorrect) {
            correctCount++;
            score += marks; // Add marks for correct answer

            // Update subject correct count
            if (question.subject && subjectPerformance[question.subject]) {
              subjectPerformance[question.subject].correct++;
            }
          } else {
            incorrectCount++;
            score -= negativeMarks; // Subtract negative marks for incorrect answer
          }
        }
      });

      // Calculate total score based on the sum of all question marks
      // Make sure totalScore is always a positive integer representing the maximum possible score
      const totalScore = Math.abs(totalPossibleScore);
      const accuracy = Math.round((correctCount / (correctCount + incorrectCount)) * 100) || 0;

      const finalResults = {
        score: score,
        totalScore,
        accuracy,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        partiallyCorrectAnswers: 0, // Not implemented in this example
        unattemptedQuestions: unattemptedCount
      };

      setTestResults(finalResults);

      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Save the test submission with the fixed time taken
      if (id) {
        // Convert selected options to the format expected by saveTestSubmission
        const formattedAnswers = selectedOptions.map(option => option || null);
        saveTestSubmission(
          id,
          formattedAnswers,
          finalTimeTaken,
          finalResults.score,
          finalResults.totalScore,
          subjectPerformance
        );
        console.log(`Test submission saved with time taken: ${finalTimeTaken.minutes}m ${finalTimeTaken.seconds}s, score: ${finalResults.score}, totalScore: ${finalResults.totalScore}`);
      }

      // Set test as submitted
      setIsTestSubmitted(true);
    }
  };

  // Handle view solutions
  const handleViewSolutions = () => {
    if (id) {
      // The time taken should already be saved by saveTestSubmission in handleSubmitTest
      // But we can ensure it's saved here as well
      if (!localStorage.getItem(`test_${id}_time_taken`)) {
        localStorage.setItem(`test_${id}_time_taken`, JSON.stringify(timeTaken));
      }

      // Save user answers to localStorage for the solution page to access
      localStorage.setItem(`test_${id}_answers`, JSON.stringify(selectedOptions));

      // Navigate to the solution page
      navigate(`/test-solution/${id}`);
    } else {
      toast.error("Test ID is missing");
    }
  };

  // Get status icon based on question status
  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case "not-visited":
        return <Square className="h-4 w-4 text-gray-400" />;
      case "unanswered":
        return <X className="h-4 w-4 text-red-500" />;
      case "answered":
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case "review":
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
      case "review-with-answer":
        return <Search className="h-4 w-4 text-purple-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status color based on question status
  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case "not-visited":
        return "bg-gray-200";
      case "unanswered":
        return "bg-red-100 border-red-500";
      case "answered":
        return "bg-green-100 border-green-500";
      case "review":
        return "bg-yellow-100 border-yellow-500";
      case "review-with-answer":
        return "bg-purple-100 border-purple-500";
      default:
        return "bg-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test || !isTestAvailable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Alert variant={!isTestAvailable ? "warning" : "destructive"} className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Test not found"}</AlertDescription>
        </Alert>
        {!isTestAvailable && test && (
          <div className="mb-6 text-center">
            <p className="text-gray-600 mb-2">Test Details:</p>
            <p className="font-medium">{test.title}</p>
            <p className="text-sm text-gray-500">Date: {test.date}</p>
            <p className="text-sm text-gray-500">Time: {test.time}</p>
            <p className="text-sm text-gray-500">Duration: {test.duration}</p>
          </div>
        )}
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
    <div className="bg-gray-100 text-gray-800 min-h-screen w-full">
      {isTestSubmitted ? (
        <>
          <TestResultsSummary
            score={testResults.score}
            totalScore={testResults.totalScore}
            accuracy={testResults.accuracy}
            timeTaken={timeTaken}
            totalQuestions={questions.length}
            correctAnswers={testResults.correctAnswers}
            incorrectAnswers={testResults.incorrectAnswers}
            partiallyCorrectAnswers={testResults.partiallyCorrectAnswers}
            unattemptedQuestions={testResults.unattemptedQuestions}
            onViewSolutions={handleViewSolutions}
            questions={questions.map((q, i) => ({
              ...q,
              userAnswer: selectedOptions[i]
            }))}
          />
        </>
      ) : (
        <>
        {/* Main content */}
        <div className={`main-content w-full max-w-7xl mx-auto mt-4 p-6 bg-white shadow-lg rounded-lg ${isStatusPanelMinimized ? 'panel-minimized' : ''}`}>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{test?.title}</h1>
          <div className="timer">
            <span
              id="timer"
              className={`font-bold ${timeRemaining.minutes <= 5 ?
                timeRemaining.minutes <= 1 ? 'text-red-600 animate-pulse' : 'text-amber-600' :
                'text-blue-600'}`}
            >
              {timeRemaining.minutes}:{timeRemaining.seconds < 10 ? '0' : ''}{timeRemaining.seconds}
            </span>
            <span className="ml-1 text-gray-600">MIN</span>
            {timeRemaining.minutes <= 5 && (
              <div className="text-xs text-red-500 mt-1">
                {timeRemaining.minutes <= 1 ? 'Almost out of time!' : 'Time running out!'}
              </div>
            )}
          </div>
          <Button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={handleSubmitTest}
          >
            Submit
          </Button>
        </header>

        <section className="mb-6">
          <div className="flex flex-col">
            {/* Section Info */}
            <div className="flex justify-between items-center p-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="font-medium text-blue-800">SECTIONS</span>
              </div>
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                {availableSubjects.length} {availableSubjects.length === 1 ? 'Section' : 'Sections'}
              </div>
            </div>

            {/* Subject Tabs */}
            {availableSubjects.length > 0 ? (
              <div className="flex w-full overflow-x-auto bg-gray-100 border border-gray-200" role="tablist">
              {/* Display all subjects with questions */}
              {availableSubjects
                .filter(subjectId => questions.some(q => q.subject === subjectId))
                .map((subjectId) => {
                  // Get the display name for the subject
                  const displayName = getSubjectDisplayName(subjectId, subjects);

                  return (
                    <button
                      key={subjectId}
                      className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${subject === subjectId ?
                        'text-white bg-blue-600' :
                        'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
                      onClick={() => {
                        setSubject(subjectId);
                        setCurrentQuestion(1);
                      }}
                      role="tab"
                      aria-selected={subject === subjectId}
                    >
                      {displayName}
                    </button>
                  );
                })}
            </div>
            ) : (
              <div className="bg-gray-100 border border-gray-200 p-4 text-center text-gray-500">
                No subjects available. This test doesn't have any questions yet.
              </div>
            )}
          </div>
        </section>

        <section id="question-container" className="mb-6">
          {/* Question number display */}
          <div className="question-number-display mt-2 mb-3 font-bold text-lg bg-blue-100 p-3 px-4 rounded-md w-full shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-blue-700">Question {currentQuestion}</span>
                <span className="text-gray-500 text-sm ml-2">of {filteredQuestions.length}</span>
              </div>
              {currentQuestionData && (
                <div className="ml-4 bg-white px-2 py-1 rounded text-sm flex items-center shadow-sm">
                  <span className="text-green-600 font-medium">+{currentQuestionData.marks || 4}</span>
                  <span className="mx-1">/</span>
                  <span className="text-red-600 font-medium">-{currentQuestionData.negativeMarks || 1}</span>
                </div>
              )}
            </div>
            {currentQuestionData && (
              <div className="text-xs text-blue-600 mt-1 relative z-10">
                {getSubjectDisplayName(currentQuestionData.subject, subjects)}
              </div>
            )}
          </div>

          {/* Question text container with scrolling */}
          <div id="question" className="mt-2 text-lg font-medium max-h-[300px] overflow-y-auto overflow-x-hidden p-6 border border-gray-100 rounded-lg relative scrollable-container bg-white">
            <div className="scroll-indicator"></div>
            <div className="question-text whitespace-pre-wrap break-words">
              {currentQuestionData?.text || "Question will appear here..."}
            </div>
          </div>

          {/* Question image container without scrolling */}
          {currentQuestionData?.imageUrl && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
              <img
                src={currentQuestionData.imageUrl}
                alt="Question image"
                className="max-w-full max-h-[300px] mx-auto rounded-md border border-gray-300 object-contain"
                onError={(e) => {
                  console.error("Error loading question image:", e);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div id="options" className="mt-4">
            {currentQuestionData?.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <div key={index}>
                  {/* Option text container with scrolling */}
                  <div
                    className={`option-container scrollable-container ${(tempSelectedOption === optionLetter || (!tempSelectedOption && selectedOptions[currentQuestionIndex] === optionLetter)) ? 'selected' : ''}`}
                    data-option={optionLetter}
                    onClick={() => handleOptionSelect(optionLetter)}
                  >
                    <div className="scroll-indicator"></div>
                    <div className="option-letter mr-2 flex-shrink-0">
                      {optionLetter})
                    </div>
                    <div className="option-text whitespace-pre-wrap break-words">
                      {option.text}
                    </div>
                  </div>

                  {/* Option image container without scrolling */}
                  {option.imageUrl && (
                    <div
                      className={`mt-1 p-3 border border-gray-200 rounded-lg bg-white ${(tempSelectedOption === optionLetter || (!tempSelectedOption && selectedOptions[currentQuestionIndex] === optionLetter)) ? 'option-image-selected' : ''}`}
                      onClick={() => handleOptionSelect(optionLetter)}
                    >
                      <img
                        src={option.imageUrl}
                        alt={`Option ${optionLetter} image`}
                        className="max-w-full max-h-[200px] mx-auto rounded-md object-contain"
                        onError={(e) => {
                          console.error(`Error loading option ${optionLetter} image:`, e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </section>

        <footer className="flex justify-between mt-8 gap-1 px-1 sm:gap-2 sm:px-2">
          <Button
            id="prev-btn"
            className="w-[23%] py-3 text-white rounded-md hover:opacity-90 text-sm sm:text-base sm:flex-1"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 1}
            style={{
              backgroundColor: currentQuestion === 1 ? '#d4ddf7' : '#3664ef',
              height: '48px',
              maxWidth: '250px'
            }}
          >
            Previous
          </Button>
          <Button
            id="clear-option-btn"
            className="w-[23%] py-3 text-white rounded-md hover:opacity-90 text-sm sm:text-base sm:flex-1"
            onClick={handleClearSelection}
            style={{
              backgroundColor: '#3664ef',
              height: '48px',
              maxWidth: '250px'
            }}
          >
            Clear Option
          </Button>
          <Button
            id="mark-review-btn"
            className="w-[23%] py-3 text-white rounded-md hover:opacity-90 text-sm sm:text-base sm:flex-1"
            onClick={handleMarkReview}
            style={{
              backgroundColor: '#3664ef',
              height: '48px',
              maxWidth: '250px'
            }}
          >
            Mark Review
          </Button>
          <Button
            id="next-btn"
            className="w-[23%] py-3 text-white rounded-md hover:opacity-90 text-sm sm:text-base sm:flex-1"
            onClick={handleNextQuestion}
            disabled={currentQuestion === filteredQuestions.length}
            style={{
              backgroundColor: currentQuestion === filteredQuestions.length ? '#d4ddf7' : '#3664ef',
              height: '48px',
              maxWidth: '250px'
            }}
          >
            Save & Next
          </Button>
        </footer>
      </div>

      {/* Question status sidebar */}
      <div className={`aside-right ${isStatusPanelMinimized ? 'minimized' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Question Status</h2>
          <button
            className="minimize-bar p-1 rounded hover:bg-gray-100 transition-colors"
            onClick={() => setIsStatusPanelMinimized(!isStatusPanelMinimized)}
            title={isStatusPanelMinimized ? "Expand panel" : "Minimize panel"}
          >
            <div className="bar-icon">{isStatusPanelMinimized ? "➕" : "➖"}</div>
          </button>
        </div>
        {/* Show only the current section in the status panel */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-blue-600"></div>
            {/* Display proper subject name */}
            {getSubjectDisplayName(subject, subjects)}
          </h3>
          <div className="grid grid-cols-5 gap-1" id={`question-status-list-${subject}`}>
            {questions
              .filter(q => q.subject === subject)
              .map((q, sectionIndex) => {
                // Find the global index of this question
                const globalIndex = questions.findIndex(question => question.id === q.id);
                const status = questionStatus[globalIndex];

                // Check if this is the current question
                const isCurrent = currentQuestionIndex === globalIndex;

                return (
                  <div
                    key={globalIndex}
                    className={`question-status ${status} ${isCurrent ? 'current' : ''}`}
                    onClick={() => handleQuestionSelect(globalIndex + 1)}
                    title={`${subject.charAt(0).toUpperCase() + subject.slice(1)}: Question ${sectionIndex + 1}`}
                  >
                    {/* Show section-specific numbering */}
                    {sectionIndex + 1}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Section selector */}
        <div className="section-selector mb-4 mt-6">
          <h3 className="text-sm font-semibold mb-2">Sections</h3>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.map((subjectId) => (
              <button
                key={subjectId}
                className={`section-btn ${subject === subjectId ? 'active' : ''}`}
                onClick={() => {
                  setSubject(subjectId);
                  setCurrentQuestion(1);
                }}
              >
                {/* Display proper subject name */}
                {getSubjectDisplayName(subjectId, subjects)}
                <span className="section-count">
                  {questions.filter(q => q.subject === subjectId).length}
                </span>
              </button>
            ))}
          </div>
        </div>


        <div className="status-legend">
          <div><div className="color-box bg-gray-300"></div>Not Visited <span className="font-semibold ml-auto">{counters["not-visited"]}</span></div>
          <div><div className="color-box bg-red-400"></div>Un-answered <span className="font-semibold ml-auto">{counters["unanswered"]}</span></div>
          <div><div className="color-box bg-green-400"></div>Answered <span className="font-semibold ml-auto">{counters["answered"]}</span></div>
          <div><div className="color-box bg-yellow-400"></div>Review <span className="font-semibold ml-auto">{counters["review"]}</span></div>
          <div><div className="color-box bg-purple-400"></div>Review with Answer <span className="font-semibold ml-auto">{counters["review-with-answer"]}</span></div>
        </div>
      </div>
      </>
      )}

      {/* CSS styles */}
      <style jsx>{`
        .option-container {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin: 12px 0 4px 0;
            cursor: pointer;
            transition: all 0.3s ease-in-out;
            display: flex;
            align-items: flex-start;
            max-height: 150px;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            width: 100%;
            background-color: white;
        }

        /* Scrollbar styling */
        .option-container::-webkit-scrollbar {
            width: 6px;
        }

        .option-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .option-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        .option-container::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* Scroll indicator */
        .option-container::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .option-container:hover::after {
            opacity: 1;
        }

        /* Question container scrollbar styling */
        #question::-webkit-scrollbar {
            width: 6px;
        }

        #question::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        #question::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        #question::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* Question scroll indicator */
        #question::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        #question:hover::after {
            opacity: 1;
        }

        /* Option letter styling */
        .option-letter {
            font-weight: 600;
            min-width: 30px;
            padding-top: 2px;
            font-size: 16px;
        }

        /* Option text styling */
        .option-text {
            flex: 1;
            word-break: break-word;
            white-space: pre-wrap;
            line-height: 1.5;
        }

        /* Question text styling */
        .question-text {
            word-break: break-word;
            white-space: pre-wrap;
            line-height: 1.5;
        }

        /* Scrollable container indicator */
        .scrollable-container {
            position: relative;
        }

        .scroll-indicator {
            position: absolute;
            right: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #3b82f6, #60a5fa);
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 0 4px 4px 0;
            z-index: 10;
        }

        .scrollable-container:hover .scroll-indicator.has-scroll {
            opacity: 0.5;
        }

        /* Hide scroll indicator when content is not scrollable */
        .scroll-indicator:not(.has-scroll) {
            display: none;
        }
        .option-container:hover {
            background-color: #f3f4f6;
        }
        .selected {
            background-color: #e0edff;
            border-color: #3b82f6;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Style for option image container when selected */
        .option-image-selected {
            border-color: #3b82f6 !important;
            background-color: rgba(59, 130, 246, 0.05);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .timer {
            font-size: 1.2rem;
            color: red;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        .aside-right {
            position: fixed;
            right: 0;
            top: 0;
            height: 100vh;
            width: 300px;
            background: #fff;
            box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
            padding: 20px;
            overflow-y: auto;
            transition: transform 0.3s ease, width 0.3s ease;
            z-index: 50;
        }

        .aside-right.minimized {
            transform: translateX(calc(100% - 40px));
        }

        .aside-right.minimized .minimize-bar {
            position: absolute;
            left: 10px;
            top: 20px;
        }

        .aside-right.minimized > div:not(:first-child),
        .aside-right.minimized > h2 {
            opacity: 0;
            pointer-events: none;
        }

        .minimize-bar {
            cursor: pointer;
            font-size: 16px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            background: white;
            transition: all 0.2s ease;
        }

        .minimize-bar:hover {
            background: #f1f5f9;
            transform: scale(1.05);
        }

        .bar-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        .aside-right.minimized .bar-icon {
            transform: rotate(90deg);
        }

        /* Add a vertical bar to the minimized panel */
        .aside-right.minimized::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #3b82f6, #60a5fa);
            opacity: 0.7;
        }
        .question-status {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            font-weight: 600;
            color: #000;
            margin: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 2px solid transparent;
            position: relative;
            z-index: 1;
        }

        .question-status:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 2;
        }

        .question-status.current {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
            transform: scale(1.05);
            z-index: 3;
        }
        .question-status.not-visited {
            background-color: #e2e8f0;
        }
        .question-status.unanswered {
            background-color: #f87171;
        }
        .question-status.answered {
            background-color: #4ade80;
        }
        .question-status.review {
            background-color: #fbbf24;
        }
        .question-status.review-with-answer {
            background-color: #a78bfa;
        }
        .main-content {
            margin-right: 320px;
            transition: margin-right 0.3s ease;
            width: calc(100% - 320px);
            max-width: 100%;
        }

        .main-content.panel-minimized {
            margin-right: 40px;
            width: calc(100% - 40px);
        }

        /* Question number display styling */
        .question-number-display {
            position: relative;
            transition: all 0.3s ease;
            background: linear-gradient(to right, #e6f0ff, #f0f7ff);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border-radius: 8px;
        }

        .question-number-display:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .question-number-display::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent);
            pointer-events: none;
            z-index: 0;
            border-radius: 8px;
        }
        .status-legend {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 24px;
            padding: 16px;
            background-color: #f8fafc;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        .status-legend div {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            justify-content: space-between;
            padding: 4px 0;
        }
        .status-legend .color-box {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.1);
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Section header styling */
        .aside-right h3 {
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 12px;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
        }

        /* Section selector styling */
        .section-selector {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 12px;
            border: 1px solid #e2e8f0;
        }

        .section-btn {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.875rem;
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .section-btn:hover {
            background-color: #e2e8f0;
        }

        .section-btn.active {
            background-color: #3b82f6;
            color: white;
            border-color: #2563eb;
        }

        .section-count {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 9999px;
            padding: 2px 6px;
            font-size: 0.75rem;
            min-width: 20px;
            text-align: center;
        }
      `}</style>
    </div>
  );
};

export default TakeTest;
