import { render, screen, fireEvent } from '@testing-library/react';
import TestInstructionsModal from '../components/TestInstructionsModal';

describe('TestInstructionsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnStartTest = jest.fn();
  const testTitle = "JEE Mock Test - 1";
  const testDuration = "3 hours";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with test title and instructions', () => {
    render(
      <TestInstructionsModal
        isOpen={true}
        onClose={mockOnClose}
        onStartTest={mockOnStartTest}
        testTitle={testTitle}
        testDuration={testDuration}
      />
    );

    // Check if the title is displayed
    expect(screen.getByText(`${testTitle} - Test Instructions`)).toBeInTheDocument();

    // Check if key instruction sections are present
    expect(screen.getByText(/Before you begin, please read the following instructions carefully/i)).toBeInTheDocument();
    expect(screen.getByText(/Navigating Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Answering MCQs/i)).toBeInTheDocument();

    // Check if the duration is displayed correctly
    expect(screen.getByText(new RegExp(`You have.*${testDuration}.*to complete this test`, 'i'))).toBeInTheDocument();

    // Check if the checkbox is present
    expect(screen.getByText(/I have read and understood the instructions/i)).toBeInTheDocument();

    // Check if buttons are present
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Test/i })).toBeInTheDocument();
  });

  it('disables the Start Test button until checkbox is checked', () => {
    render(
      <TestInstructionsModal
        isOpen={true}
        onClose={mockOnClose}
        onStartTest={mockOnStartTest}
        testTitle={testTitle}
        testDuration={testDuration}
      />
    );

    // Start Test button should be disabled initially
    const startButton = screen.getByRole('button', { name: /Start Test/i });
    expect(startButton).toBeDisabled();

    // Check the checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Start Test button should be enabled now
    expect(startButton).not.toBeDisabled();
  });

  it('calls onStartTest when Start Test button is clicked after checkbox is checked', () => {
    render(
      <TestInstructionsModal
        isOpen={true}
        onClose={mockOnClose}
        onStartTest={mockOnStartTest}
        testTitle={testTitle}
        testDuration={testDuration}
      />
    );

    // Check the checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click the Start Test button
    const startButton = screen.getByRole('button', { name: /Start Test/i });
    fireEvent.click(startButton);

    // Check if onStartTest was called
    expect(mockOnStartTest).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <TestInstructionsModal
        isOpen={true}
        onClose={mockOnClose}
        onStartTest={mockOnStartTest}
        testTitle={testTitle}
        testDuration={testDuration}
      />
    );

    // Click the Cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onStartTest when Start Test button is clicked if checkbox is not checked', () => {
    render(
      <TestInstructionsModal
        isOpen={true}
        onClose={mockOnClose}
        onStartTest={mockOnStartTest}
        testTitle={testTitle}
        testDuration={testDuration}
      />
    );

    // Try to click the Start Test button without checking the checkbox
    const startButton = screen.getByRole('button', { name: /Start Test/i });
    fireEvent.click(startButton);

    // Check that onStartTest was not called
    expect(mockOnStartTest).not.toHaveBeenCalled();
  });
});
