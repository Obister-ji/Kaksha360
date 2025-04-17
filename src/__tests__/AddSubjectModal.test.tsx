import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddSubjectModal, { Subject } from '../components/AddSubjectModal';

describe('AddSubjectModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockExistingSubjects: Subject[] = [
    {
      id: '1',
      name: 'Physics',
      code: 'PHY101',
      category: 'Science',
      slug: 'physics'
    }
  ];

  const renderModal = (isOpen = true) => {
    render(
      <AddSubjectModal
        isOpen={isOpen}
        onClose={mockOnClose}
        onSave={mockOnSave}
        existingSubjects={mockExistingSubjects}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal when isOpen is true', () => {
    renderModal(true);
    expect(screen.getByText('Add New Subject')).toBeInTheDocument();
    expect(screen.getByText('Expand your test library by adding a new subject.')).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText('Add New Subject')).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByText('✖ Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    renderModal();

    // Try to save without entering a name
    fireEvent.click(screen.getByText('🗂️ Save Subject'));

    // Save button should be disabled
    expect(screen.getByText('🗂️ Save Subject')).toBeDisabled();
  });

  it('shows warning when subject name already exists', async () => {
    renderModal();

    // Enter a name that already exists
    fireEvent.change(screen.getByPlaceholderText(/E.g., 'Advanced Data Structures'/), {
      target: { value: 'Physics' }
    });

    // Warning should be displayed
    await waitFor(() => {
      expect(screen.getByText('This subject name already exists')).toBeInTheDocument();
    });

    // Save button should be disabled
    expect(screen.getByText('🗂️ Save Subject')).toBeDisabled();
  });

  it('generates a slug from the subject name', async () => {
    renderModal();

    // Enter a subject name
    fireEvent.change(screen.getByPlaceholderText(/E.g., 'Advanced Data Structures'/), {
      target: { value: 'Advanced Data Structures' }
    });

    // Slug should be generated
    await waitFor(() => {
      const slugInput = screen.getByDisplayValue('advanced-data-structures');
      expect(slugInput).toBeInTheDocument();
    });
  });

  it('calls onSave with correct data when Save button is clicked', async () => {
    renderModal();

    // Enter subject name
    fireEvent.change(screen.getByPlaceholderText(/E.g., 'Advanced Data Structures'/), {
      target: { value: 'Advanced Data Structures' }
    });

    // Enter subject code
    fireEvent.change(screen.getByPlaceholderText(/E.g., 'ADS101'/), {
      target: { value: 'ADS101' }
    });

    // Click save button
    fireEvent.click(screen.getByText('🗂️ Save Subject'));

    // onSave should be called with correct data
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Advanced Data Structures',
      code: 'ADS101',
      slug: 'advanced-data-structures'
    }));

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
