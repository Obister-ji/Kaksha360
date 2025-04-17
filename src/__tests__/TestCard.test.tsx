import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TestCard from '../components/TestCard';

// Mock the TestInstructionsModal component
jest.mock('../components/TestInstructionsModal', () => {
  return jest.fn(({ isOpen, onClose, onStartTest, testTitle, testDuration }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="test-instructions-modal">
        <h2>{testTitle} - Test Instructions</h2>
        <p>Duration: {testDuration}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onStartTest}>Start Test</button>
      </div>
    );
  });
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('TestCard', () => {
  const testProps = {
    id: 'test-123',
    title: 'JEE Mock Test',
    instructor: 'LAKSHYA',
    date: '2025/01/20',
    time: '02:00 PM - 05:00 PM',
    duration: '3 hours',
    status: 'ONLINE' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the test card with correct information', () => {
    render(
      <BrowserRouter>
        <TestCard {...testProps} />
      </BrowserRouter>
    );

    expect(screen.getByText(testProps.title)).toBeInTheDocument();
    expect(screen.getByText(`Created by ${testProps.instructor}`)).toBeInTheDocument();
    expect(screen.getByText(testProps.status)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Test/i })).toBeInTheDocument();
  });

  it('opens the test instructions modal when Start Test button is clicked', () => {
    render(
      <BrowserRouter>
        <TestCard {...testProps} />
      </BrowserRouter>
    );

    // Click the Start Test button
    const startButton = screen.getByRole('button', { name: /Start Test/i });
    fireEvent.click(startButton);

    // Check if the modal is opened
    expect(screen.getByTestId('test-instructions-modal')).toBeInTheDocument();
    expect(screen.getByText(`${testProps.title} - Test Instructions`)).toBeInTheDocument();
  });

  it('navigates to the test page when Start Test is clicked in the instructions modal', () => {
    render(
      <BrowserRouter>
        <TestCard {...testProps} />
      </BrowserRouter>
    );

    // Click the Start Test button to open the modal
    const startButton = screen.getByRole('button', { name: /Start Test/i });
    fireEvent.click(startButton);

    // Verify the duration is passed to the modal
    expect(screen.getByText(`Duration: ${testProps.duration}`)).toBeInTheDocument();

    // Click the Start Test button in the modal
    const modalStartButton = screen.getByRole('button', { name: /Start Test/i, hidden: true });
    fireEvent.click(modalStartButton);

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith(`/take-test/${testProps.id}`);
  });

  it('closes the instructions modal without navigating when Cancel is clicked', () => {
    render(
      <BrowserRouter>
        <TestCard {...testProps} />
      </BrowserRouter>
    );

    // Click the Start Test button to open the modal
    const startButton = screen.getByRole('button', { name: /Start Test/i });
    fireEvent.click(startButton);

    // Click the Cancel button in the modal
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Check that the modal is closed and navigation was not triggered
    expect(screen.queryByTestId('test-instructions-modal')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows "Test Ended" for past tests', () => {
    const pastTestProps = {
      ...testProps,
      date: '2020/01/01', // Past date
    };

    render(
      <BrowserRouter>
        <TestCard {...pastTestProps} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Test Ended/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Ended/i })).toBeDisabled();
  });
});
