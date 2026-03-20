/**
 * ЗАДАНИЕ 1-2: Основы React + TypeScript
 *
 * Упрощенное задание, объединяющее базовые компоненты и хуки
 *
 * Что будем изучать:
 * - Типизация компонентов и props
 * - Работа с useState
 * - Обработка событий
 */

import React, { useState, FC, ReactNode, KeyboardEvent, ChangeEvent } from 'react';

// ============================================
// ЧАСТЬ 1: Простые компоненты
// ============================================

// Интерфейс для props кнопки
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Компонент Button с типизацией
const Button: FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button
      className={`btn btn--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Интерфейс для props UserCard
interface UserCardProps {
  name: string;
  email: string;
  isOnline: boolean;
}

// Компонент UserCard с типизацией
const UserCard: FC<UserCardProps> = ({ name, email, isOnline }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isOnline ? 'status-online' : 'status-offline'}>
        {isOnline ? '🟢 Online' : '⚫ Offline'}
      </span>
    </div>
  );
};

// ============================================
// ЧАСТЬ 2: Todo список
// ============================================

// Интерфейс для Todo
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Компонент TodoApp с типизацией
const TodoApp: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Добавление нового todo
  const addTodo = (): void => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  // Переключение статуса todo
  const toggleTodo = (id: number): void => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Удаление todo
  const deleteTodo = (id: number): void => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Обработчик нажатия Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  // Обработчик изменения input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.currentTarget.value);
  };

  const completedCount = todos.filter((t: Todo) => t.completed).length;

  return (
    <div className="todo-app">
      <h2>Todo список</h2>

      {/* Форма добавления */}
      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Новая задача..."
        />
        <Button onClick={addTodo} variant="primary">
          Добавить
        </Button>
      </div>

      {/* Список todos */}
      <ul className="todo-list">
        {todos.map((todo: Todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>

      {/* Статистика */}
      <div className="stats">
        Всего: {todos.length} | Завершено: {completedCount}
      </div>
    </div>
  );
};

// ============================================
// Главный компонент
// ============================================

const App: FC = () => {
  return (
    <div className="app">
      <h1>Todo приложение на React + TypeScript</h1>
      <TodoApp />
    </div>
  );
};

export default App;