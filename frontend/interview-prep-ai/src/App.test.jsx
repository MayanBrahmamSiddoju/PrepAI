import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders the dashboard title', () => {
    render(<App />);
    // Adjust this selector/text to match your actual dashboard or landing page
    expect(screen.getByText(/dashboard|prep|interview/i)).toBeInTheDocument();
  });
});
