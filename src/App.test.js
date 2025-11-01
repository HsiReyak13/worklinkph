import { render, screen } from '@testing-library/react';
import App from './App';

test('renders WorkLink PH splash screen', () => {
  render(<App />);
  const titleElement = screen.getByText(/WorkLink PH/i);
  expect(titleElement).toBeInTheDocument();
});
