import React from 'react';

interface QuizButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function QuizButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = ''
}: QuizButtonProps) {
  const baseClass = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClass = variant === 'primary'
    ? 'bg-purple-600 text-white hover:bg-purple-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}