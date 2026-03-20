/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */

// ПРОБЛЕМА 1: Функция с any типом
function processData(data: string | number | object | unknown[]): string[] {
    if (Array.isArray(data)) {
        return data.map(item => String(item));
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        return Object.entries(data).map(([key, value]) => `${key}: ${value}`);
    }
    
    return [String(data)];
}

// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current: any = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    
    return current;
}

// ПРОБЛЕМА 3: Функция с проблемами null/undefined
interface User {
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    avatar?: string;
}

interface FormattedUser {
    fullName: string;
    email: string;
    age: string | number;
    avatar: string;
}

function formatUser(user: User): FormattedUser {
    return {
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email.toLowerCase(),
        age: user.age ?? 'Не указан',
        avatar: user.avatar ?? '/default-avatar.png'
    };
}

// ПРОБЛЕМА 4: Функция с union типами без type guards
interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface ErrorResponse {
    success: false;
    error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
    return response.success === true;
}

function handleResponse<T>(response: ApiResponse<T>): T {
    if (isSuccessResponse(response)) {
        console.log('Данные:', response.data);
        return response.data;
    } else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: T[], index: number, newValue: T): T[] {
    if (index >= 0 && index < arr.length) {
        return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
    }
    return [...arr];
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
type EventListener = (...args: any[]) => void;

class EventEmitter {
    private listeners: Map<string, EventListener[]>;

    constructor() {
        this.listeners = new Map();
    }
    
    on(event: string, callback: EventListener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }
    
    emit(event: string, ...args: any[]): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    }
    
    off(event: string, callback: EventListener): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const filtered = callbacks.filter(cb => cb !== callback);
            if (filtered.length > 0) {
                this.listeners.set(event, filtered);
            } else {
                this.listeners.delete(event);
            }
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry(url: string, maxRetries: number): Promise<any> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error: unknown) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    throw lastError ?? new Error('Неизвестная ошибка');
}

// ПРОБЛЕМА 8: Функция валидации с проблемами типов
interface ValidationRule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
}

interface ValidationRules {
    [key: string]: ValidationRule;
}

interface ValidationErrors {
    [key: string]: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
}

function validateForm(formData: Record<string, string>, rules: ValidationRules): ValidationResult {
    const errors: ValidationErrors = {};
    
    for (const field in rules) {
        const value = formData[field] ?? '';
        const rule = rules[field];
        
        // Защита от undefined правила
        if (!rule) continue;
        
        if (rule.required && (!value || value.trim() === '')) {
            errors[field] = 'Поле обязательно для заполнения';
            continue;
        }
        
        if (value && rule.minLength && value.length < rule.minLength) {
            errors[field] = `Минимальная длина: ${rule.minLength} символов`;
            continue;
        }
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message ?? 'Неверный формат';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}


// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key: K) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every((key: string) => isEqual(a[key], b[key]));
    }
    
    return false;
}

// Примеры использования
console.log('=== Тестирование processData ===');
console.log(processData([1, 2, 3]));
console.log(processData({ a: 1, b: 2 }));
console.log(processData('hello'));

console.log('\n=== Тестирование getValue ===');
const testObj = { user: { profile: { name: 'Анна' } } };
console.log(getValue(testObj, 'user.profile.name'));
console.log(getValue(testObj, 'user.nonexistent'));

console.log('\n=== Тестирование formatUser ===');
const user: User = { firstName: 'Анна', lastName: 'Иванова', email: 'ANNA@EXAMPLE.COM', age: 25 };
console.log(formatUser(user));

console.log('\n=== Тестирование EventEmitter ===');
const emitter = new EventEmitter();
emitter.on('test', (message: string) => console.log('Получено:', message));
emitter.emit('test', 'Привет!');

console.log('\n=== Тестирование pick ===');
const userData = { name: 'Анна', age: 25, email: 'anna@example.com', password: 'secret' };
const publicData = pick(userData, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);

console.log('\n=== Тестирование updateArray ===');
const arr = [1, 2, 3, 4, 5];
console.log('Обновленный массив:', updateArray(arr, 2, 99));

console.log('\n=== Тестирование validateForm ===');
const formData = { name: 'Анна', email: 'anna@example.com' };
const validationRules: ValidationRules = {
    name: { required: true, minLength: 3 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' }
};
console.log(validateForm(formData, validationRules));

console.log('\n=== Тестирование isEqual ===');
console.log(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }));
console.log(isEqual([1, 2, 3], [1, 2, 3]));
console.log(isEqual('hello', 'hello'));