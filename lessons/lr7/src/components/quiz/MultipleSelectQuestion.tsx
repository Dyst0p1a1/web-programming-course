import { observer } from 'mobx-react-lite';
import type { Question } from '../../types/quiz';

interface Props {
  question: Question;
  selectedAnswers: number[];
  onToggleAnswer: (index: number) => void;
}

export const MultipleSelectQuestion = observer(({
  question,
  selectedAnswers,
  onToggleAnswer
}: Props) => {
  if (!question.options) return null;

  return (
    <div className="space-y-2">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswers.includes(index);
        return (
          <button
            key={index}
            onClick={() => onToggleAnswer(index)}
            className={`w-full text-left p-4 rounded border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="font-bold mr-3 text-lg">
              {isSelected ? '✓' : String.fromCharCode(65 + index)}
            </span>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
});