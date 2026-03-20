/*
 * ЗАДАЧА 4: Основы TypeScript
 *
 * упрощенное задание объединяет работу с интерфейсами, generics и DOM API.
 * Выполняйте задания по порядку, переименовав файл в .ts
 *
 * Инструкция:
 * 1. Переименуйте файл в task4-typescript-basics.ts
 * 2. Выполните TODO задания ниже по порядку
 */

// ============================================
// ЧАСТЬ 1: Интерфейсы и типы (5-10 минут)
// ============================================

// Интерфейсы / типы
export type UserRole = 'admin' | 'user';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}


// Функции
function createUser(name: string, email: string, role: UserRole): User {
    return {
        id: Math.floor(Math.random() * 1000),
        name,
        email,
        role
    };
}

function getFirst<T>(array: T[]): T | undefined {
    return array.length > 0 ? array[0] : undefined;
}

function filterArray<T>(array: T[], predicate: (n: T) => boolean): T[] {
    return array.filter(predicate);
}

// API
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

async function fetchUser<T = User>(userId: string | number): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const data = (await response.json()) as T;

        if (!response.ok) {
            return { success: false, data: null, error: 'Ошибка загрузки' };
        }

        return { success: true, data, error: null };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, data: null, error: message };
    }
}

// DOM helpers
function getElementById<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id) as T | null;
    if (!element) throw new Error(`Element ${id} not found`);
    return element;
}

class FormManager {
    form: HTMLFormElement;

    constructor(formId: string) {
        this.form = getElementById<HTMLFormElement>(formId);
    }

    getValue(fieldId: string): string {
        const field = getElementById<HTMLInputElement | HTMLTextAreaElement>(fieldId);
        return (field as HTMLInputElement | HTMLTextAreaElement).value ?? '';
    }

    setValue(fieldId: string, value: string): void {
        const field = getElementById<HTMLInputElement | HTMLTextAreaElement>(fieldId);
        (field as HTMLInputElement | HTMLTextAreaElement).value = value;
    }

    onSubmit(handler: (event: SubmitEvent) => void): void {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            handler(event as SubmitEvent);
        });
    }
}
// ============================================
// Примеры использования
// ============================================

console.log('=== Тестирование ===');

// Пример 1: Создание пользователя
const user = createUser('Анна', 'anna@example.com', 'admin');
console.log('Создан пользователь:', user);

// Пример 2: Работа с массивами
const numbers = [1, 2, 3, 4, 5];
const first = getFirst(numbers);
const evens = filterArray(numbers, n => n % 2 === 0);
console.log('Первый элемент:', first);
console.log('Четные числа:', evens);

// Пример 3: Работа с API
// await fetchUser(1).then(response => {
//     if (response.success) {
//         console.log('Пользователь:', response.data);
//     } else {
//         console.error('Ошибка:', response.error);
//     }
// });

// Пример 4: Работа с формой (требует HTML)
// const formManager = new FormManager('my-form');
// formManager.onSubmit((event) => {
//     const name = formManager.getValue('name');
//     console.log('Отправлено:', name);
// });