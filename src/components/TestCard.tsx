
import { CalendarClock, Clock, UserCircle2, Timer, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import TestInstructionsModal from "./TestInstructionsModal";

interface TestCardProps {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  status: "ONLINE" | "OFFLINE";
  startDateTime?: string;
  endDateTime?: string;
}

const TestCard = ({ id, title, instructor, date, time, duration, status, startDateTime, endDateTime }: TestCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [testAvailability, setTestAvailability] = useState<{
    isAvailable: boolean;
    status: 'past' | 'future' | 'active' | 'invalid';
    message: string;
    timeRemaining?: string;
  }>({ isAvailable: false, status: 'invalid', message: 'Unavailable' });
  const navigate = useNavigate();

  // Parse test time from the time string (e.g., "02:00 PM - 05:00 PM")
  const parseTestTime = () => {
    try {
      // If we have explicit startDateTime and endDateTime, use those
      if (startDateTime && endDateTime) {
        return {
          startTime: new Date(startDateTime),
          endTime: new Date(endDateTime)
        };
      }

      // Otherwise, parse from the date and time strings
      const [startTimeStr, endTimeStr] = time.split(' - ');
      if (!startTimeStr || !endTimeStr) {
        return null;
      }

      const testDateObj = new Date(date.replace(/\//g, "-"));
      const startTimeParts = startTimeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      const endTimeParts = endTimeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);

      if (!startTimeParts || !endTimeParts) {
        return null;
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

      return { startTime, endTime };
    } catch (error) {
      console.error('Error parsing test time:', error);
      return null;
    }
  };

  // Calculate time remaining until test starts
  const calculateTimeRemaining = (startTime: Date) => {
    const now = new Date();
    const diffMs = startTime.getTime() - now.getTime();

    if (diffMs <= 0) return '';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    } else {
      return `${diffMinutes}m remaining`;
    }
  };

  // Check if the test is past, future, or currently active
  useEffect(() => {
    const testTimes = parseTestTime();
    const now = new Date();

    if (!testTimes) {
      setTestAvailability({
        isAvailable: false,
        status: 'invalid',
        message: 'Unavailable'
      });
      return;
    }

    const { startTime, endTime } = testTimes;

    if (now > endTime) {
      // Test has ended
      setTestAvailability({
        isAvailable: false,
        status: 'past',
        message: 'Test Ended'
      });
    } else if (now < startTime) {
      // Test hasn't started yet
      const timeRemaining = calculateTimeRemaining(startTime);
      setTestAvailability({
        isAvailable: false,
        status: 'future',
        message: 'Not Yet Available',
        timeRemaining
      });
    } else {
      // Test is currently active
      setTestAvailability({
        isAvailable: true,
        status: 'active',
        message: 'Start Test'
      });
    }
  }, [date, time, startDateTime, endDateTime]);

  // Legacy check for backward compatibility
  const testDate = new Date(date.replace(/\//g, "-"));
  const today = new Date();
  const isPast = testDate < today;

  // Check if the test has been completed by the user
  useEffect(() => {
    const completedTests = localStorage.getItem('completed_tests');
    if (completedTests) {
      const testsArray = JSON.parse(completedTests);
      setIsCompleted(testsArray.includes(id));
    }
  }, [id]);

  // Handle start test button click
  const handleStartTest = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent opening the details dialog
    setIsInstructionsOpen(true);
  };

  // Handle view solutions button click
  const handleViewSolutions = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent opening the details dialog
    navigate(`/test-solution/${id}`);
  };

  // Handle actual test start after instructions are read
  const handleStartAfterInstructions = () => {
    setIsInstructionsOpen(false);
    console.log(`Navigating to test with ID: ${id}`);
    navigate(`/take-test/${id}`);
  };

  // Format the date to be more readable
  const formattedDate = new Date(date.replace(/\//g, "-")).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <>
      <div
        className="bg-white p-6 rounded-lg shadow-md transition-all hover:translate-y-[-5px] hover:shadow-lg border-l-4 border-gold relative cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <h3 className="font-playfair text-lg text-primary font-medium mb-2 pr-24">{title}</h3>
        <div className="flex flex-wrap gap-5 text-text-light text-sm">
          <span className="flex items-center gap-1">
            <UserCircle2 className="h-4 w-4" />
            Created by {instructor}
          </span>
          <span className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {time}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            {duration}
          </span>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            "absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-semibold",
            status === "ONLINE"
              ? "bg-green-100 text-green-600"
              : "bg-amber-100 text-amber-600"
          )}
        >
          {status}
        </div>

        {/* Start Test or View Solution button */}
        <div className="mt-4 flex justify-end">
          {isCompleted ? (
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={(e) => handleViewSolutions(e)}
            >
              View Solution
            </Button>
          ) : (
            <div className="flex flex-col items-end">
              <Button
                size="sm"
                className={`${testAvailability.isAvailable ? 'bg-gold hover:bg-gold/90' :
                  testAvailability.status === 'past' ? 'bg-gray-500' :
                  testAvailability.status === 'future' ? 'bg-amber-500' : 'bg-gray-400'} text-white`}
                onClick={(e) => handleStartTest(e)}
                disabled={!testAvailability.isAvailable}
              >
                {testAvailability.message}
              </Button>
              {testAvailability.status === 'future' && testAvailability.timeRemaining && (
                <span className="text-xs text-amber-600 mt-1">{testAvailability.timeRemaining}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription>
              Test details and information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Instructor:</span>
              <span className="col-span-3">{instructor}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Date:</span>
              <span className="col-span-3">{formattedDate}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Time:</span>
              <span className="col-span-3">{time}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Duration:</span>
              <span className="col-span-3">{duration}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <span className="col-span-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    status === "ONLINE"
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  )}
                >
                  {status}
                </span>
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
            {isCompleted ? (
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleViewSolutions();
                }}
              >
                View Solution
              </Button>
            ) : (
              <div className="flex flex-col items-center">
                <Button
                  className={`${testAvailability.isAvailable ? 'bg-gold hover:bg-gold/90' :
                    testAvailability.status === 'past' ? 'bg-gray-500' :
                    testAvailability.status === 'future' ? 'bg-amber-500' : 'bg-gray-400'} text-white`}
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleStartTest();
                  }}
                  disabled={!testAvailability.isAvailable}
                >
                  {testAvailability.message}
                </Button>
                {testAvailability.status === 'future' && testAvailability.timeRemaining && (
                  <span className="text-xs text-amber-600 mt-2">{testAvailability.timeRemaining}</span>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Instructions Modal */}
      <TestInstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        onStartTest={handleStartAfterInstructions}
        testTitle={title}
        testDuration={duration}
      />
    </>
  );
};

export default TestCard;
