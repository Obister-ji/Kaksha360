import React from "react";
import { Button } from "./ui/button";
import { Clock, CheckCircle, XCircle, HelpCircle, AlertCircle, Eye } from "lucide-react";
import { formatTimeObject } from "@/lib/utils";

interface TestResultsSummaryProps {
  score: number;
  totalScore: number;
  accuracy: number;
  timeTaken: {
    minutes: number;
    seconds: number;
  };
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  partiallyCorrectAnswers: number;
  unattemptedQuestions: number;
  onViewSolutions: () => void;
  questions?: any[]; // Add questions to access marks and negativeMarks
}

const TestResultsSummary: React.FC<TestResultsSummaryProps> = ({
  score,
  totalScore,
  accuracy,
  timeTaken,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  partiallyCorrectAnswers,
  unattemptedQuestions,
  onViewSolutions,
  questions = []
}) => {
  // Calculate total marks for correct answers
  const calculateCorrectMarks = () => {
    if (questions.length === 0) {
      // If no questions data, use default of 4 marks per correct answer
      return correctAnswers * 4;
    }

    // Calculate based on actual marks values in questions
    let totalMarks = 0;
    questions.forEach((question, index) => {
      const marks = question.marks !== undefined ? question.marks : 4;
      if (question.userAnswer && question.options) {
        const optionIndex = question.userAnswer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
        if (question.options[optionIndex]?.isCorrect) {
          totalMarks += marks;
        }
      }
    });
    return totalMarks;
  };

  // Calculate total negative marks for incorrect answers
  const calculateIncorrectMarks = () => {
    if (questions.length === 0) {
      // If no questions data, use default of 1 negative mark per incorrect answer
      return incorrectAnswers * 1;
    }

    // Calculate based on actual negative marks values in questions
    let totalNegativeMarks = 0;
    questions.forEach((question, index) => {
      const negativeMarks = question.negativeMarks !== undefined ? question.negativeMarks : 1;
      if (question.userAnswer && question.options) {
        const optionIndex = question.userAnswer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
        if (!question.options[optionIndex]?.isCorrect) {
          totalNegativeMarks += negativeMarks;
        }
      }
    });
    return totalNegativeMarks;
  };
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 my-8">
      {/* Score Section */}
      <div className="text-center mb-8">
        <h2 className="text-gray-600 font-semibold uppercase tracking-wide mb-4">SCORE</h2>
        <div className="text-7xl font-bold mb-2" style={{ color: score < 0 ? '#ef4444' : '#3b82f6' }}>{score}</div>
        <div className="text-gray-500 mb-4">OUT OF {Math.abs(totalScore)}</div>
        <div className="text-xs text-gray-500 italic mb-2">
          Scoring: Correct answers earn marks, incorrect answers deduct negative marks
          {score < 0 && <div className="mt-1 text-red-500">Your score is negative because you had more incorrect answers than correct ones.</div>}
        </div>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-green-700">{correctAnswers} correct</span>
            <span className="text-green-700">+{calculateCorrectMarks()} marks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-700">{incorrectAnswers} incorrect</span>
            <span className="text-red-700">-{calculateIncorrectMarks()} marks</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-amber-500 mb-6">
          <Clock className="h-5 w-5" />
          <span>{formatTimeObject(timeTaken)}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${accuracy}%` }}
          ></div>
        </div>
        <div className="text-gray-600 font-medium">{accuracy}% ACCURACY</div>
      </div>

      {/* Breakdown Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <HelpCircle className="h-5 w-5 text-purple-500" />
            </div>
            <span className="font-medium">Total Questions</span>
          </div>
          <span className="font-bold text-lg">{totalQuestions}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <span className="font-medium">Correct Answers</span>
          </div>
          <span className="font-bold text-lg">{correctAnswers}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <span className="font-medium">Incorrect Answers</span>
          </div>
          <span className="font-bold text-lg">{incorrectAnswers}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <span className="font-medium">Partially Correct Answers</span>
          </div>
          <span className="font-bold text-lg">{partiallyCorrectAnswers}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
            </div>
            <span className="font-medium">Unattempted Questions</span>
          </div>
          <span className="font-bold text-lg">{unattemptedQuestions}</span>
        </div>
      </div>

      {/* View Solutions Button */}
      <div className="text-center">
        <Button
          onClick={onViewSolutions}
          className="w-full py-6 text-white bg-blue-500 hover:bg-blue-600 font-medium text-lg flex items-center justify-center gap-2"
        >
          <Eye className="h-5 w-5" />
          View Detailed Solutions
        </Button>
      </div>
    </div>
  );
};

export default TestResultsSummary;
