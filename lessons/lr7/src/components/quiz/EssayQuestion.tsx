interface EssayQuestionProps {
  question: {
    id: string | number;
    question?: string;
    text?: string;
    minLength?: number;
    maxLength?: number;
  };
  textAnswer: string;
  onTextChange: (text: string) => void;
  theme?: 'light' | 'dark';
}

export function EssayQuestion({
  question,
  textAnswer,
  onTextChange,
  theme = 'light'
}: EssayQuestionProps) {
  const charCount = textAnswer.length;
  const minLength = question.minLength || 0;
  const maxLength = question.maxLength || 1000;
  const isValid = charCount >= minLength;

  const borderColor = isValid
    ? theme === 'light' ? 'border-gray-300' : 'border-gray-600'
    : 'border-red-500';
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-700';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const counterColor = isValid
    ? theme === 'light' ? 'text-gray-500' : 'text-gray-400'
    : 'text-red-500';

  return (
    <div className="space-y-4">
      <textarea
        value={textAnswer}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Введите развернутый ответ..."
        minLength={minLength}
        maxLength={maxLength}
        rows={10}
        className={`w-full p-4 rounded-lg border-2 min-h-[150px] ${bgColor} ${textColor} ${borderColor} focus:outline-none focus:border-purple-500`}
      />
      <div className={`text-sm ${counterColor}`}>
        Символов: {charCount}
        {minLength > 0 && ` (минимум: ${minLength})`}
        {` (максимум: ${maxLength})`}
      </div>
    </div>
  );
}