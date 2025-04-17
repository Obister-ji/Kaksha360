
import FullScreenMockTest from './MockTestTemplate';
import { Question } from './TestQuestionForm';

interface MockTestPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  testTitle: string;
  testTime?: string;
  testSubject?: string;
}

const MockTestPreview = ({ isOpen, onClose, questions, testTitle, testTime, testSubject }: MockTestPreviewProps) => {
  return (
    <FullScreenMockTest
      isOpen={isOpen}
      onClose={onClose}
      questions={questions}
      testTitle={testTitle}
      testTime={testTime || "3 hours"}
    />
  );
};

export default MockTestPreview;
