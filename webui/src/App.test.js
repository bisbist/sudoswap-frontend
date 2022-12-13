import { render, screen } from '@testing-library/react';
import App from './App';

test('renders test', () => {
  render(<App />);
  const linkElement = screen.getByText(/Animoca Swap Prototype/i);
  expect(linkElement).toBeInTheDocument();
});
