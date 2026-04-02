import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EssayQuestion } from './EssayQuestion';

describe('EssayQuestion', () => {
  const mockQuestion = {
    id: 'q1',
    question: 'Explain React hooks',
    minLength: 50,
    maxLength: 500,
  };

  it('renders textarea', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays character count', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer="Hello World"
        onTextChange={() => {}}
      />
    );
    expect(screen.getByText(/Символов: 11/)).toBeInTheDocument();
  });

  it('shows minimum length requirement', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.getByText(/минимум: 50/)).toBeInTheDocument();
  });

  it('shows maximum length requirement', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.getByText(/максимум: 500/)).toBeInTheDocument();
  });

  it('calls onTextChange when user types', async () => {
    const handleChange = vi.fn();
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={handleChange}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'New text');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays current value in textarea', () => {
    const currentAnswer = 'This is my current answer';
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer={currentAnswer}
        onTextChange={() => {}}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue(currentAnswer);
  });

  it('shows red border when text is below minimum length', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer="Short"
        onTextChange={() => {}}
      />
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).toContain('border-red-500');
  });

  it('shows normal border when text meets minimum length', () => {
    const longText = 'A'.repeat(50);
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer={longText}
        onTextChange={() => {}}
      />
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).not.toContain('border-red-500');
  });

  it('does not show minimum when minLength is 0', () => {
    const questionNoMin = { ...mockQuestion, minLength: 0 };
    render(
      <EssayQuestion
        question={questionNoMin}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.queryByText(/минимум/)).not.toBeInTheDocument();
  });
});