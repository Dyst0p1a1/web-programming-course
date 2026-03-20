/**
 * ЗАДАНИЕ 3-4: Формы и Context
 *
 * Упрощенное задание, объединяющее формы и Context API
 *
 * Что будем изучать:
 * - Типизация форм и событий
 * - Context API
 * - Custom hooks
 */

import React, { createContext, useContext, useState, ReactNode, FormEvent, ChangeEvent, FC } from 'react';

// ============================================
// ЧАСТЬ 1: Простая форма
// ============================================

// 1.1: Интерфейс FormData
interface FormData {
  name: string;
  email: string;
  message: string;
}

// 1.2: Типизируйте компонент SimpleForm
const SimpleForm: FC = () => {
  // 1.3: Создайте состояние formData с типом FormData
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  // 1.4: Типизируйте обработчик изменения
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 1.5: Типизируйте обработчик отправки
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    console.log('Отправлено:', formData);

    // Установите submitted в true чтобы показать сообщение об успехе
    setSubmitted(true);

    // Через 3 секунды верните submitted в false
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="simple-form">
      <h2>Форма обратной связи</h2>

      {submitted && (
        <div className="success">✅ Форма отправлена успешно!</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Поле имени */}
        <div className="form-group">
          <label htmlFor="name">Имя:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Поле email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Поле сообщения */}
        <div className="form-group">
          <label htmlFor="message">Сообщение:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

// ============================================
// ЧАСТЬ 2: Context API
// ============================================

// 2.1: Интерфейс User
interface User {
  id: number;
  name: string;
  email: string;
}

// 2.2: Интерфейс UserContextType
interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// 2.3: Создайте Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// 2.4: Типизируйте UserProvider
interface UserProviderProps {
  children: ReactNode;
}

const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User): void => {
    setUser(userData);
  };

  const logout = (): void => {
    setUser(null);
  };

  const value: UserContextType = { user, login, logout };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 2.5: Создайте custom hook useUser
function useUser(): UserContextType {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}

// 2.6: Создайте компонент UserStatus
const UserStatus: FC = () => {
  const { user, logout } = useUser();

  if (!user) {
    return <span>❌ Не авторизован</span>;
  }

  return (
    <div className="user-status">
      <span>👤 Привет, {user.name}!</span>
      <button onClick={logout}>Выйти</button>
    </div>
  );
};

// 2.7: Создайте компонент Profile
const Profile: FC = () => {
  const { user, login } = useUser();

  const handleLogin = (): void => {
    login({
      id: 1,
      name: 'Иван Иванов',
      email: 'ivan@example.com'
    });
  };

  if (!user) {
    return (
      <div className="profile">
        <h2>Вы не авторизованы</h2>
        <button onClick={handleLogin}>Войти</button>
      </div>
    );
  }

  return (
    <div className="profile">
      <h2>📋 Профиль</h2>
      <p><strong>Имя:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>ID:</strong> {user.id}</p>
    </div>
  );
};

// ============================================
// Главный компонент
// ============================================

const AppContent: FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'profile'>('form');

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Приложение с формами и авторизацией</h1>
        <UserStatus />
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'form' ? 'active' : ''}
          onClick={() => setActiveTab('form')}
        >
          Форма обратной связи
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Профиль пользователя
        </button>
      </nav>

      <div className="content">
        {activeTab === 'form' && <SimpleForm />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
};

const App: FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
