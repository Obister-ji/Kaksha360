import { render, screen, fireEvent } from '@testing-library/react';
import RankSummary from '../components/RankSummary';

describe('RankSummary', () => {
  const mockProps = {
    batchRank: 13,
    batchTotal: 128,
    instituteRank: 13,
    instituteTotal: 128,
    percentile: 89.84
  };

  it('renders the rank summary with correct data', () => {
    render(<RankSummary {...mockProps} />);

    // Check headings
    expect(screen.getByText('YOUR RANK')).toBeInTheDocument();
    expect(screen.getByText('LEADERBOARD')).toBeInTheDocument();

    // Check batch rank
    expect(screen.getByText('BATCH RANK')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText(/\/ 128/)).toBeInTheDocument();

    // Check institute rank
    expect(screen.getByText('INSTITUTE RANK')).toBeInTheDocument();

    // Check percentile
    expect(screen.getByText('PERCENTILE')).toBeInTheDocument();
    expect(screen.getByText('89.84')).toBeInTheDocument();
    expect(screen.getByText(/\/ 100/)).toBeInTheDocument();

    // Check note
    expect(screen.getByText(/Leaderboard will be updated as more students take the test/)).toBeInTheDocument();

    // Check view more button
    expect(screen.getByText('View More')).toBeInTheDocument();
  });

  it('toggles details when View More button is clicked', () => {
    render(<RankSummary {...mockProps} />);

    // Initially, details should be hidden
    expect(screen.queryByText('Top Performers')).not.toBeInTheDocument();

    // Click View More button
    fireEvent.click(screen.getByText('View More'));

    // Details should be visible
    expect(screen.getByText('Top Performers')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Your Performance Trend')).toBeInTheDocument();

    // Click View More button again to hide details
    fireEvent.click(screen.getByText('View More'));

    // Details should be hidden again
    expect(screen.queryByText('Top Performers')).not.toBeInTheDocument();
  });
});
