import { render, screen } from '@testing-library/react';
import App from './App';

test('renders test', () => {
  render(<App />);
  const linkElement = screen.getByText(/Sudoswap Frontend/i);
  expect(linkElement).toBeInTheDocument();
});
