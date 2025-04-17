import { render, screen, fireEvent } from '@testing-library/react';
import TestResultsSummary from '../components/TestResultsSummary';

describe('TestResultsSummary', () => {
  const mockProps = {
    score: 65,
    totalScore: 80,
    accuracy: 85,
    timeTaken: {
      minutes: 23,
      seconds: 16
    },
    totalQuestions: 20,
    correctAnswers: 17,
    incorrectAnswers: 3,
    partiallyCorrectAnswers: 0,
    unattemptedQuestions: 0,
    onViewSolutions: jest.fn()
  };

  it('renders the test results summary with correct data', () => {
    render(<TestResultsSummary {...mockProps} />);

    // Check score section
    expect(screen.getByText('SCORE')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('OUT OF 80')).toBeInTheDocument();

    // Check time taken
    expect(screen.getByText('23 minutes, 16 seconds')).toBeInTheDocument();

    // Check accuracy
    expect(screen.getByText('85% ACCURACY')).toBeInTheDocument();

    // Check breakdown section
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Correct Answers')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('Incorrect Answers')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Partially Correct Answers')).toBeInTheDocument();
    expect(screen.getByText('Unattempted Questions')).toBeInTheDocument();

    // Check view solutions button
    expect(screen.getByText('View Detailed Solutions')).toBeInTheDocument();
  });

  it('calls onViewSolutions when the View Solutions button is clicked', () => {
    render(<TestResultsSummary {...mockProps} />);

    const viewSolutionsButton = screen.getByText('View Detailed Solutions');
    fireEvent.click(viewSolutionsButton);

    expect(mockProps.onViewSolutions).toHaveBeenCalledTimes(1);
  });

  it('renders negative score correctly', () => {
    const negativeScoreProps = {
      ...mockProps,
      score: -5,
      correctAnswers: 5,
      incorrectAnswers: 10
    };

    render(<TestResultsSummary {...negativeScoreProps} />);

    // Check score section
    expect(screen.getByText('SCORE')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('OUT OF 80')).toBeInTheDocument();

    // Check for negative score message
    expect(screen.getByText(/Your score is negative because you had more incorrect answers than correct ones./i)).toBeInTheDocument();
  });
});
