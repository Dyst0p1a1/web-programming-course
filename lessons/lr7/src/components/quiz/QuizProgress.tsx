interface QuizProgressProps {
  current: number;
  total: number;
  theme?: 'light' | 'dark';
}

export function QuizProgress({ current, total, theme = 'light' }: QuizProgressProps) {
  const percentage = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-gray-700';
  const fillColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-500';
  const textColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

  return (
    <div className="mb-4">
      <div className={`flex justify-between text-sm ${textColor} mb-2`}>
        <span>Вопрос {current + 1} из {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className={`w-full ${bgColor} rounded-full h-2`}>
        <div
          className={`${fillColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}