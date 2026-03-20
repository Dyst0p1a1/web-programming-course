/*
 * ЗАДАЧА 3: Работа с массивами и объектами сложной структуры
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех сложных объектов
 * 3. Типизируйте все функции работы с данными
 * 4. Используйте generic типы где это уместно
 */

// Система управления курсами и студентами

// TODO: Создать интерфейсы:
// - Student: id, name, email, enrolledCourses[], grades{}
// - Course: id, title, instructor, duration, maxStudents, enrolledStudents[]
// - Grade: studentId, courseId, score, date
// - CourseStats: courseId, averageGrade, totalStudents, completionRate

interface Grade {
    studentId: number;
    courseId: number;
    score: number;
    date: Date;
}

interface Student {
    id: number;
    name: string;
    email: string;
    enrolledCourses: number[];
    grades: Record<number, Grade[]>;
}

interface Course {
    id: number;
    title: string;
    instructor: string;
    duration: number;
    maxStudents: number;
    enrolledStudents: number[];
}

interface CourseStats {
    courseId: number;
    averageGrade: number;
    totalStudents: number;
    completionRate: number;
}

// Создание студента
function createStudent(id: number, name: string, email: string): Student {
    return {
        id,
        name,
        email,
        enrolledCourses: [],
        grades: {}
    };
}

// Создание курса
function createCourse(id: number, title: string, instructor: string, duration: number, maxStudents: number): Course {
    return {
        id,
        title,
        instructor,
        duration,
        maxStudents,
        enrolledStudents: []
    };
}

// Запись студента на курс
function enrollStudent(student: Student | undefined, course: Course | undefined) {
    if (!student || !course) {
        return { success: false, message: 'Студент или курс не найдены' };
    }

    if (course.enrolledStudents.length >= course.maxStudents) {
        return { success: false, message: 'Курс переполнен' };
    }

    if (student.enrolledCourses.includes(course.id)) {
        return { success: false, message: 'Студент уже записан на этот курс' };
    }

    student.enrolledCourses.push(course.id);
    course.enrolledStudents.push(student.id);

    return { success: true, message: 'Студент успешно записан на курс' };
}

// Выставление оценки
function assignGrade(student: Student | undefined, courseId: number, score: number) {
    if (!student) return { success: false, message: 'Студент не найден' };

    if (!student.enrolledCourses.includes(courseId)) {
        return { success: false, message: 'Студент не записан на этот курс' };
    }

    if (score < 0 || score > 100) {
        return { success: false, message: 'Оценка должна быть от 0 до 100' };
    }

    if (!student.grades[courseId]) {
        student.grades[courseId] = [];
    }

    student.grades[courseId].push({
        studentId: student.id,
        courseId,
        score,
        date: new Date()
    });

    return { success: true, message: 'Оценка выставлена' };
}

// Расчет средней оценки студента
function calculateStudentAverage(student: Student | undefined, courseId: number): number | null {
    if (!student) return null;

    const grades = student.grades[courseId] ?? [];
    if (grades.length === 0) return null;

    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round((sum / grades.length) * 100) / 100;
}

// Получение статистики по курсу
function getCourseStats(course: Course | undefined, students: Student[]): CourseStats | null {
    if (!course) return null;

    const enrolledStudents = students.filter(student =>
        student.enrolledCourses.includes(course.id)
    );

    const allGrades = enrolledStudents
        .map(student => student.grades[course.id] ?? [])
        .flat()
        .map(grade => grade.score);

    const averageGrade = allGrades.length > 0
        ? allGrades.reduce((sum, score) => sum + score, 0) / allGrades.length
        : 0;

    const studentsWithGrades = enrolledStudents.filter(student =>
        (student.grades[course.id] ?? []).length > 0
    ).length;

    const completionRate = enrolledStudents.length > 0
        ? (studentsWithGrades / enrolledStudents.length) * 100
        : 0;

    return {
        courseId: course.id,
        totalStudents: enrolledStudents.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
    };
}

// Поиск лучших студентов
function getTopStudents(students: Student[], courseId: number, limit: number) {
    return students
        .map(student => ({
            ...student,
            average: calculateStudentAverage(student, courseId)
        }))
        .filter(s => s.average !== null)
        .sort((a, b) => (b.average! - a.average!))
        .slice(0, limit);
}

// Примеры использования
const students = [
    createStudent(1, 'Анна Иванова', 'anna@example.com'),
    createStudent(2, 'Петр Петров', 'peter@example.com'),
    createStudent(3, 'Мария Сидорова', 'maria@example.com')
];

const courses = [
    createCourse(101, 'JavaScript Основы', 'Иван Учителев', 40, 20),
    createCourse(102, 'React Advanced', 'Мария Преподователь', 60, 15)
];

// Записываем студентов на курсы
enrollStudent(students[0], courses[0]);
enrollStudent(students[1], courses[0]);
enrollStudent(students[0], courses[1]);

// Выставляем оценки
assignGrade(students[0], 101, 95);
assignGrade(students[0], 101, 87);
assignGrade(students[1], 101, 78);

console.log('Средняя оценка Анны по JS:', calculateStudentAverage(students[0], 101));
console.log('Статистика курса JS:', getCourseStats(courses[0], students));
console.log('Лучшие студенты по JS:', getTopStudents(students, 101, 2));