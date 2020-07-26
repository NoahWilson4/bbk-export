import React from 'react';
import { render } from '@testing-library/react';
import BBKExport from './App';

test('renders learn react link', () => {
  const { getByText } = render(<BBKExport />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
