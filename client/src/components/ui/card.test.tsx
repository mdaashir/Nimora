import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

describe('Card Components', () => {
  it('renders card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('renders CardHeader with proper styling', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild;
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5');
  });
});
