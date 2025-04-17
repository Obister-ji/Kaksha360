import { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "./ui/dialog";
import { Clock, Square, X, CheckSquare, HelpCircle, Search } from "lucide-react";

interface TestInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: () => void;
  testTitle: string;
  testDuration?: string;
}

const TestInstructionsModal = ({
  isOpen,
  onClose,
  onStartTest,
  testTitle,
  testDuration = "3 hours"
}: TestInstructionsModalProps) => {
  const [instructionsRead, setInstructionsRead] = useState(false);

  const handleStartTest = () => {
    if (instructionsRead) {
      console.log("Starting test from instructions modal");
      onStartTest();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {testTitle} - Test Instructions
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-2">Before you begin, please read the following instructions carefully:</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-red-500" />
                Time Management:
              </h3>
              <ul className="list-disc pl-10 space-y-1">
                <li>You have <strong>{testDuration}</strong> to complete this test.</li>
                <li>A timer at the top of the screen will show your remaining time.</li>
                <li>The test will be automatically submitted when time expires.</li>
                <li>You cannot pause the timer once the test begins.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">Question Status:</h3>
              <p className="mb-2">The question palette on the right side of the screen shows the status of each question:</p>
              <div className="grid grid-cols-2 gap-2 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>Not visited yet.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-400"></div>
                  <span>Seen but not answered.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span>Answered.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span>Marked for review.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                  <span>Answered and marked for review.</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Navigating Questions:</h3>
              <ul className="list-disc pl-10 space-y-1">
                <li>Click a question number in the palette to jump to it.</li>
                <li><strong>Previous:</strong> Moves to the previous question.</li>
                <li><strong>Save & Next:</strong> Saves your answer and moves to the next question.</li>
                <li><strong>Mark Review:</strong> Flags the question for later review.</li>
                <li><strong>Clear Response:</strong> Clears your selected answer.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">Answering MCQs:</h3>
              <ul className="list-disc pl-10 space-y-1">
                <li>Select one option (A, B, C, D) by clicking on it.</li>
                <li>Selected options will be highlighted in blue.</li>
                <li>To change your answer, simply click on another option.</li>
                <li>To clear your selection, use the Clear Selection or Clear Response buttons.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">Security Measures:</h3>
              <ul className="list-disc pl-10 space-y-1">
                <li>The test will run in fullscreen mode.</li>
                <li>Switching tabs or minimizing the window is not allowed.</li>
                <li>Copy, paste, and right-click functions are disabled.</li>
                <li>Opening developer tools or console is prohibited.</li>
                <li>Attempting to leave the test page will trigger a warning.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">Final Submission:</h3>
              <ul className="list-disc pl-10 space-y-1">
                <li>Click the Submit button when you've completed the test.</li>
                <li>All answers, including those marked for review, will be evaluated.</li>
                <li>Once submitted, you cannot return to the test.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="instructions-read"
              checked={instructionsRead}
              onCheckedChange={(checked) => setInstructionsRead(checked as boolean)}
            />
            <label
              htmlFor="instructions-read"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understood the instructions.
            </label>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStartTest}
            disabled={!instructionsRead}
            className="bg-gold hover:bg-gold/90 text-white"
          >
            Start Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestInstructionsModal;
