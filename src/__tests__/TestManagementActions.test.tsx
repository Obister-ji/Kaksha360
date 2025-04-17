import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestManagementContent from '../components/TestManagementContent';
import { deleteTest } from '../services/testService';
import { toast } from 'sonner';

// Mock the dependencies
jest.mock('../services/testService', () => ({
  fetchTests: jest.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test 1',
      instructor: 'LAKSHYA',
      date: '2025/01/20',
      time: '02:00 PM - 05:00 PM',
      duration: '3 hours',
      status: 'ONLINE',
      participants: ['Class 12 - Science']
    }
  ]),
  createTest: jest.fn(),
  updateTest: jest.fn(),
  deleteTest: jest.fn().mockResolvedValue(true),
  saveTestQuestions: jest.fn(),
  fetchTestQuestions: jest.fn().mockResolvedValue([])
}));

jest.mock('../services/googleDriveService', () => ({
  openGoogleDriveTestFolder: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: {
      email: 'gauravattriji@gmail.com',
      app_metadata: { role: 'ADMIN' }
    }
  })
}));

// Mock the sidebar components
jest.mock('../components/ui/sidebar', () => ({
  SidebarTrigger: () => <button>Sidebar Trigger</button>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>
}));

describe('Test Management Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the enhanced action buttons', async () => {
    render(<TestManagementContent />);

    // Wait for the tests to load
    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    // Check if the action buttons are rendered with text labels
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /questions/i })).toBeInTheDocument();
  });

  it('should open edit dialog with pre-filled data when edit button is clicked', async () => {
    render(<TestManagementContent />);

    // Wait for the tests to load
    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    // Find and click the edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Check if the dialog is shown with the correct title
    expect(screen.getByText('Edit Test Schedule')).toBeInTheDocument();

    // Check if form is pre-filled
    const testNameInput = screen.getByLabelText(/test name/i);
    expect(testNameInput).toHaveValue('Test 1');
  });

  it('should show delete confirmation dialog when delete button is clicked', async () => {
    render(<TestManagementContent />);

    // Wait for the tests to load
    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Check if the confirmation dialog is shown
    expect(screen.getByText('Are you sure you want to delete this test?')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText(/Test 1/i)).toBeInTheDocument();

    // Check if the dialog has cancel and delete buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i, exact: true })).toBeInTheDocument();
  });

  it('should delete the test when confirmed', async () => {
    render(<TestManagementContent />);

    // Wait for the tests to load
    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Find and click the confirm button in the dialog
    const confirmButton = screen.getByRole('button', { name: /delete/i, exact: true });
    fireEvent.click(confirmButton);

    // Check if deleteTest was called with the correct ID
    await waitFor(() => {
      expect(deleteTest).toHaveBeenCalledWith('1');
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Test deleted successfully');
  });

  it('should close the dialog without deleting when canceled', async () => {
    render(<TestManagementContent />);

    // Wait for the tests to load
    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Check if deleteTest was not called
    expect(deleteTest).not.toHaveBeenCalled();
  });
});
