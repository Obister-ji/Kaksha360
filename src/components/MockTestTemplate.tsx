
import { useState, useEffect } from 'react';
import { Question } from './TestQuestionForm';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { toast } from 'sonner';
import { parseDurationToSeconds } from '@/lib/utils';

interface MockTestTemplateProps {
  testTitle: string;
  questions: Question[];
  onClose: () => void;
  testTime?: string; // Expected format: "3 hours" or similar
}

const MockTestTemplate = ({ testTitle, questions, onClose, testTime = "3 hours" }: MockTestTemplateProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(Array(questions.length).fill(null));
  const [questionStatus, setQuestionStatus] = useState<string[]>(Array(questions.length).fill("not-visited"));
  const [timeRemaining, setTimeRemaining] = useState<number>(parseDurationToSeconds(testTime));
  const [activeSubject, setActiveSubject] = useState<string>("all");
  const [showSolution, setShowSolution] = useState(false);

  // Format seconds to MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Timer functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          toast.error("Time's up! Test will be submitted automatically.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mark current question as seen when it changes
  useEffect(() => {
    const newStatus = [...questionStatus];
    if (newStatus[currentQuestionIndex] === "not-visited") {
      newStatus[currentQuestionIndex] = "unanswered";
    }
    setQuestionStatus(newStatus);
  }, [currentQuestionIndex]);

  // Function to check if an element is scrollable
  const isScrollable = (element: HTMLElement) => {
    return element.scrollHeight > element.clientHeight;
  };

  // Calculate status counts
  const statusCounts = {
    "not-visited": questionStatus.filter(s => s === "not-visited").length,
    "unanswered": questionStatus.filter(s => s === "unanswered").length,
    "answered": questionStatus.filter(s => s === "answered").length,
    "review": questionStatus.filter(s => s === "review").length,
    "review-with-answer": questionStatus.filter(s => s === "review-with-answer").length
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionId;
    setSelectedOptions(newSelectedOptions);

    // Update question status
    const newStatus = [...questionStatus];
    newStatus[currentQuestionIndex] = newStatus[currentQuestionIndex] === "review" ? "review-with-answer" : "answered";
    setQuestionStatus(newStatus);
  };

  // Handle mark for review
  const handleMarkForReview = () => {
    const newStatus = [...questionStatus];
    newStatus[currentQuestionIndex] = selectedOptions[currentQuestionIndex] ? "review-with-answer" : "review";
    setQuestionStatus(newStatus);
    toast.info(`Question ${currentQuestionIndex + 1} marked for review`);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = null;
    setSelectedOptions(newSelectedOptions);

    // Update question status
    const newStatus = [...questionStatus];
    newStatus[currentQuestionIndex] = newStatus[currentQuestionIndex] === "review-with-answer" ? "review" : "unanswered";
    setQuestionStatus(newStatus);
    toast.info(`Selection cleared for question ${currentQuestionIndex + 1}`);
  };

  // Handle go to specific question
  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit test
  const handleSubmit = () => {
    // Calculate score
    let score = 0;
    let totalMarks = 0;

    questions.forEach((question, index) => {
      const selectedOption = selectedOptions[index];
      const correctOption = question.options.find(option => option.isCorrect)?.id;
      const marks = question.marks || 4;
      const negativeMarks = question.negativeMarks || 1;

      totalMarks += marks;

      if (selectedOption === correctOption) {
        score += marks;
      } else if (selectedOption !== null) {
        score -= negativeMarks;
      }
    });

    toast.success(`Test submitted! Score: ${score}/${totalMarks}`);
    onClose();
  };

  // Filter questions by subject
  const filteredQuestions = activeSubject === "all"
    ? questions
    : questions.filter(q => q.subject === activeSubject);

  // Current question
  const currentQuestion = filteredQuestions[currentQuestionIndex];

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
  }, [currentQuestionIndex, filteredQuestions]);

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-2xl font-bold mb-4">No questions available</h2>
        <p className="text-gray-600 mb-6">There are no questions available for this test.</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="main-content max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{testTitle}</h1>
          <div className="timer">
            <span id="timer">{Math.floor(timeRemaining / 60)}:{timeRemaining % 60 < 10 ? '0' : ''}{timeRemaining % 60}</span> MIN
          </div>
          <Button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </header>

        <section className="mb-6 bg-blue-100 p-4 rounded-lg">
          <select
            className="p-2 rounded-lg"
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="mathematics">Mathematics</option>
          </select>
        </section>

        <section id="question-container" className="mb-6">
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">
              Question <span id="question-number">{currentQuestionIndex + 1}</span>/{filteredQuestions.length}
            </h2>
            <div className="bg-gray-200 px-3 py-1 rounded-lg flex items-center gap-1" title="Marks for correct / negative marks for incorrect">
              <span className="text-green-600 font-medium">+{currentQuestion.marks || 4}</span> /
              <span className="text-red-600 font-medium">-{currentQuestion.negativeMarks || 1}</span>
              <span className="text-xs text-gray-500 ml-1">(marks)</span>
            </div>
          </div>

          <div id="question" className="mt-4 text-lg font-medium max-h-[200px] overflow-y-auto overflow-x-hidden p-4 border border-gray-200 rounded-lg relative scrollable-container">
            <div className="scroll-indicator"></div>
            {currentQuestion.text}
          </div>

          {currentQuestion.imageUrl && (
            <div className="mt-2 max-w-lg mx-auto">
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="max-h-80 object-contain mx-auto my-4"
              />
            </div>
          )}

          <div id="options" className="mt-4">
            {currentQuestion.options.map(option => (
              <div
                key={option.id}
                className={`option-container scrollable-container ${selectedOptions[currentQuestionIndex] === option.id ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="scroll-indicator"></div>
                <div className="option-letter mr-2 flex-shrink-0">
                  {option.id})
                </div>
                <div className="option-text">
                  {option.text}
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${option.id}`}
                      className="max-h-24 object-contain mt-2"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button
              id="mark-review-btn"
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
              onClick={handleMarkForReview}
            >
              Mark Review
            </Button>
            <Button
              id="clear-selection-btn"
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
              onClick={handleClearSelection}
            >
              Clear Selection
            </Button>
            <Button
              className="px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500"
              onClick={() => setShowSolution(!showSolution)}
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>
          </div>

          {showSolution && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-bold text-green-800">Solution:</h3>
              <p className="text-green-700 mt-2">{currentQuestion.solution || "No solution provided."}</p>
              <p className="mt-2 font-medium text-green-800">
                Correct Answer: {currentQuestion.options.find(o => o.isCorrect)?.id || "Not specified"}
              </p>
            </div>
          )}
        </section>

        <footer className="flex justify-between mt-4">
          <Button
            id="prev-btn"
            className="px-4 py-2 bg-yellow-400 rounded-full hover:bg-yellow-500"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            ⬅
          </Button>
          <Button
            id="next-btn"
            className="px-4 py-2 bg-yellow-400 rounded-full hover:bg-yellow-500"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex >= filteredQuestions.length - 1}
          >
            ➡
          </Button>
        </footer>
      </div>

      <div className="aside-right">
        <h2 className="text-lg font-bold">Question Status</h2>
        <ul className="grid grid-cols-5 gap-2 mt-4" id="question-status-list">
          {questions.map((q, index) => (
            <li
              key={index}
              className={`question-status ${questionStatus[index]}`}
              onClick={() => handleGoToQuestion(index)}
            >
              {index + 1}
            </li>
          ))}
        </ul>
        <div className="status-legend">
          <div>
            <div className="color-box bg-gray-300"></div>
            Not Visited ({statusCounts["not-visited"]})
          </div>
          <div>
            <div className="color-box bg-red-400"></div>
            Un-answered ({statusCounts["unanswered"]})
          </div>
          <div>
            <div className="color-box bg-green-400"></div>
            Answered ({statusCounts["answered"]})
          </div>
          <div>
            <div className="color-box bg-yellow-400"></div>
            Review ({statusCounts["review"]})
          </div>
          <div>
            <div className="color-box bg-purple-400"></div>
            Review with Answer ({statusCounts["review-with-answer"]})
          </div>
        </div>
      </div>

      <style jsx>{`
        .option-container {
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            cursor: pointer;
            transition: all 0.3s ease-in-out;
            display: flex;
            align-items: flex-start;
            max-height: 120px;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
        }

        /* Scrollbar styling */
        .option-container::-webkit-scrollbar,
        #question::-webkit-scrollbar {
            width: 6px;
        }

        .option-container::-webkit-scrollbar-track,
        #question::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .option-container::-webkit-scrollbar-thumb,
        #question::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        .option-container::-webkit-scrollbar-thumb:hover,
        #question::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* Scroll indicator */
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

        .scrollable-container {
            position: relative;
        }

        .scrollable-container:hover .scroll-indicator.has-scroll {
            opacity: 0.5;
        }

        /* Hide scroll indicator when content is not scrollable */
        .scroll-indicator:not(.has-scroll) {
            display: none;
        }

        /* Option letter styling */
        .option-letter {
            font-weight: 600;
            min-width: 20px;
            padding-top: 2px;
        }

        /* Option text styling */
        .option-text {
            flex: 1;
            word-break: break-word;
        }
        .option-container:hover {
            background-color: #f3f4f6;
        }
        .selected {
            background-color: #e0edff;
            border-color: #3b82f6;
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
        }
        .question-status {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s ease;
            font-size: 14px;
            color: #000;
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
        }
        .status-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        }
        .status-legend div {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .status-legend .color-box {
            width: 15px;
            height: 15px;
            border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export interface FullScreenMockTestProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  testTitle: string;
  testTime?: string;
}

const FullScreenMockTest = ({ isOpen, onClose, questions, testTitle, testTime }: FullScreenMockTestProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <MockTestTemplate
          testTitle={testTitle}
          questions={questions}
          onClose={onClose}
          testTime={testTime}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenMockTest;
