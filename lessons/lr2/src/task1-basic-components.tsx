/**
 * Задание 1: Базовые типизированные компоненты
 *
 * Цель: Научиться создавать простые типизированные React компоненты
 *
 * Инструкции:
 * 1. Создайте интерфейсы для всех props
 * 2. Добавьте правильную типизацию к компонентам
 * 3. Убедитесь что все компоненты работают без ошибок TypeScript
 */

import React, { FC, ReactNode } from 'react';

// ===== ЗАДАЧА 1.1: Простая карточка пользователя =====

interface UserCardProps {
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  isOnline: boolean;
}

const UserCard: FC<UserCardProps> = ({ name, email, age, avatar, isOnline }) => {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} className="avatar" />}
      <h2>{name}</h2>
      <p>{email}</p>
      {age && <p className="age">Возраст: {age}</p>}
      <span className={`status ${isOnline ? 'status--online' : 'status--offline'}`}>
        {isOnline ? '🟢 Online' : '⚫ Offline'}
      </span>
    </div>
  );
};

// ===== ЗАДАЧА 1.2: Кнопка с вариантами =====

interface ButtonProps {
  children: ReactNode;
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
}

const Button: FC<ButtonProps> = ({ 
  children, 
  variant, 
  size, 
  disabled = false, 
  onClick 
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ===== ЗАДАЧА 1.3: Простой список пользователей =====

interface UserListProps {
  users: string[];
  emptyMessage?: string;
}

const UserList: FC<UserListProps> = ({ 
  users, 
  emptyMessage = 'Нет пользователей' 
}) => {
  if (users.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>;
  }

  return (
    <ul className="user-list">
      {users.map((user: string, index: number) => (
        <li key={index}>{user}</li>
      ))}
    </ul>
  );
};

// ===== ЗАДАЧА 1.4: Карточка с children =====

interface CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Card: FC<CardProps> = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`card ${className}`.trim()}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-content">
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// ===== ЗАДАЧА 1.5: Демо компонент =====

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isOnline: boolean;
}

const App: FC = () => {
  const users: User[] = [
    { id: 1, name: 'Анна Иванова', email: 'anna@example.com', age: 28, isOnline: true },
    { id: 2, name: 'Петр Петров', email: 'petr@example.com', age: 35, isOnline: false },
    { id: 3, name: 'Мария Сидорова', email: 'maria@example.com', age: 24, isOnline: true }
  ];

  const userNames = users.map((user: User) => user.name);

  const handleButtonClick = (): void => {
    console.log('Кнопка нажата!');
  };

  return (
    <div className="app">
      <Card
        title="Список пользователей"
        footer={<p>Всего пользователей: {users.length}</p>}
      >
        <UserList
          users={userNames}
          emptyMessage="Пользователей не найдено"
        />

        <div style={{ marginTop: '20px' }}>
          <Button
            variant="primary"
            size="medium"
            onClick={handleButtonClick}
          >
            Добавить пользователя
          </Button>
        </div>
      </Card>

      {/* Дополнительный пример с UserCard */}
      <div style={{ marginTop: '30px' }}>
        <h2>Отдельные карточки пользователей:</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {users.map((user: User) => (
            <UserCard
              key={user.id}
              name={user.name}
              email={user.email}
              age={user.age}
              isOnline={user.isOnline}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
