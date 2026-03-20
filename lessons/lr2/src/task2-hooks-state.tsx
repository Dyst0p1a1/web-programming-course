/**
 * Задание 2: Типизация хуков и состояния
 *
 * Цель: Освоить типизацию useState, useEffect и простых кастомных хуков
 *
 * Инструкции:
 * 1. Добавьте правильную типизацию ко всем хукам
 * 2. Создайте простые типизированные кастомные хуки
 * 3. Обработайте основные состояния приложения
 */

import { useState, useEffect, useCallback, FC, FormEvent, ChangeEvent } from 'react';

// ===== ЗАДАЧА 2.1: Счетчик с расширенным состоянием =====

interface CounterState {
  count: number;
  step: number;
  isRunning: boolean;
  history: number[];
}

const Counter: FC = () => {
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: [0]
  });

  const increment = useCallback((): void => {
    setState(prev => ({
      ...prev,
      count: prev.count + prev.step,
      history: [...prev.history, prev.count + prev.step]
    }));
  }, []);

  const decrement = useCallback((): void => {
    setState(prev => ({
      ...prev,
      count: prev.count - prev.step,
      history: [...prev.history, prev.count - prev.step]
    }));
  }, []);

  const setStep = useCallback((newStep: number): void => {
    setState(prev => ({
      ...prev,
      step: newStep
    }));
  }, []);

  const toggleRunning = useCallback((): void => {
    setState(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  }, []);

  const reset = useCallback((): void => {
    setState({
      count: 0,
      step: 1,
      isRunning: false,
      history: [0]
    });
  }, []);

  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        count: prev.count + prev.step,
        history: [...prev.history, prev.count + prev.step]
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.step]);

  return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>
          {state.isRunning ? '⏸ Остановить' : '▶️ Начать'}
        </button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="step-control">
        <label>
          Шаг:
          <input
            type="number"
            value={state.step}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStep(parseInt(e.currentTarget.value) || 1)}
            min="1"
          />
        </label>
      </div>

      <div className="history">
        <h3>История:</h3>
        <ul>
          {state.history.map((value: number, index: number) => (
            <li key={index}>{index}: {value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ===== ЗАДАЧА 2.2: Простое todo приложение =====

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoApp: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');

  const addTodo = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false
      };
      setTodos(prev => [...prev, newTodo]);
      setNewTodoText('');
    }
  }, [newTodoText]);

  const toggleTodo = useCallback((id: string): void => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string): void => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const completedCount = todos.filter((todo: Todo) => todo.completed).length;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodoText(e.currentTarget.value)}
          placeholder="Добавить новую задачу..."
        />
        <button type="submit">Добавить</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo: Todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      <div className="stats">
        <p>Всего: {todos.length}</p>
        <p>Завершено: {completedCount}</p>
      </div>
    </div>
  );
};

// ===== ЗАДАЧА 2.3: Кастомные хуки =====

function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback((): void => {
    setValue(prev => !prev);
  }, []);

  return [value, toggle];
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initialValue: number = 0): UseCounterReturn {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback((): void => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback((): void => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback((): void => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

const HooksDemo: FC = () => {
  const counter = useCounter(0);
  const [isVisible, toggleVisibility] = useToggle(false);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Счетчик: {counter.count}</p>
        <button onClick={counter.increment}>+1</button>
        <button onClick={counter.decrement}>-1</button>
        <button onClick={counter.reset}>Сброс</button>
      </div>

      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Видимость: {isVisible ? '✅ Видно' : '❌ Скрыто'}</p>
        <button onClick={toggleVisibility}>Переключить</button>
        {isVisible && <p>🎉 Секретное сообщение!</p>}
      </div>
    </div>
  );
};

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

type TabKey = 'counter' | 'todos' | 'hooks';

interface TabConfig {
  text: string;
  component: () => JSX.Element;
}

const TABS: Record<TabKey, TabConfig> = {
  counter: {
    text: 'Счетчик',
    component: () => <Counter />
  },
  todos: {
    text: 'Todo',
    component: () => <TodoApp />
  },
  hooks: {
    text: 'Хуки',
    component: () => <HooksDemo />
  }
};

const App: FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('counter');

  return (
    <div className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            onClick={() => setActiveTab(key as TabKey)}
          >
            {tab.text}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {TABS[activeTab].component()}
      </div>
    </div>
  );
};

export default App;