import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useAuth } from '../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ForgotPasswordModal', () => {
  const mockResetPassword = jest.fn();
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
      isLoading: false,
    });
  });

  it('renders the modal when isOpen is true', () => {
    render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByText(/Enter your email address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Instructions/i })).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<ForgotPasswordModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Reset Your Password')).not.toBeInTheDocument();
  });

  it('shows an error when submitting without an email', async () => {
    render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Send Instructions/i }));
    
    expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('calls resetPassword when submitting with an email', async () => {
    render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Instructions/i }));
    
    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('shows success message after successful submission', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    
    render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Instructions/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Check your email for password reset instructions/i)).toBeInTheDocument();
    });
  });

  it('shows error message when resetPassword fails', async () => {
    const errorMessage = 'Failed to send reset instructions';
    mockResetPassword.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Instructions/i }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('closes the modal when Cancel button is clicked', () => {
    render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
