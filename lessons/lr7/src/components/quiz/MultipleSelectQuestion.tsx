interface QuestionPreview {
  id: string | number;
  question?: string;
  text?: string;
  options?: string[];
  type?: 'essay' | 'choice';
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPoints?: number;
}

interface MultipleSelectQuestionProps {
  question: QuestionPreview;
  selectedAnswers: number[];
  onToggleAnswer: (index: number) => void;
  theme?: 'light' | 'dark';
}

export function MultipleSelectQuestion({
  question,
  selectedAnswers,
  onToggleAnswer,
  theme = 'light'
}: MultipleSelectQuestionProps) {
  if (!question.options || question.options.length === 0) return null;

  const getOptionStyles = (index: number) => {
    const isSelected = selectedAnswers.includes(index);
    const baseStyles = 'w-full p-4 text-left rounded-lg border-2 transition-all';
    
    if (!isSelected) {
      return `${baseStyles} ${theme === 'light' 
        ? 'border-gray-200 bg-white hover:border-purple-300' 
        : 'border-gray-600 bg-gray-700 hover:border-purple-500'}`;
    }
    
    return `${baseStyles} ${theme === 'light'
      ? 'border-purple-500 bg-purple-50'
      : 'border-purple-500 bg-gray-600'}`;
  };

  const getBadgeStyles = (index: number) => {
    const isSelected = selectedAnswers.includes(index);
    const baseStyles = 'w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold';
    
    if (isSelected) {
      return `${baseStyles} bg-purple-600 text-white`;
    }
    
    return `${baseStyles} ${theme === 'light' 
      ? 'bg-gray-200 text-gray-800' 
      : 'bg-gray-600 text-white'}`;
  };

  return (
    <div className="space-y-3">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => onToggleAnswer(index)}
          className={getOptionStyles(index)}
        >
          <div className="flex items-center">
            <span className={getBadgeStyles(index)}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className={`flex-1 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              {option}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}