// src/services/authService.ts
import type { User } from '../types/user';

// ===== КОНФИГУРАЦИЯ =====
// /api проксируется на http://localhost:4000
const API_URL = '/api';

/** Поиск преподавателя по логину и паролю */
const findTeacher = async (
  login: string,
  password: string,
): Promise<User | null> => {
  try {
    console.log('🔍 Поиск преподавателя:', login);
    
    // Запрос через прокси /api → http://localhost:4000
    const response = await fetch(`${API_URL}/teachers?login=${login}&password=${password}`);
    
    if (!response.ok) {
      console.error('❌ Ошибка сервера:', response.status);
      return null;
    }

    const teachers = await response.json();
    console.log('📦 Получены преподаватели:', teachers);
    
    // Находим преподавателя с нужным логином и паролем
    const teacher = teachers.find(
      (t: any) => t.login === login && t.password === password
    );

    if (!teacher) {
      console.log('❌ Преподаватель не найден');
      return null;
    }

    console.log('✅ Найден преподаватель:', teacher.fullName);
    
    return {
      id: Number(teacher.id),
      fullName: teacher.fullName,
      role: 'teacher',
    };
  } catch (error) {
    console.error('💥 Ошибка запроса к серверу:', error);
    return null;
  }
};

/** Поиск студента по логину и паролю */
const findStudent = async (
  login: string,
  password: string,
): Promise<User | null> => {
  try {
    console.log('🔍 Поиск студента:', login);
    
    // Запрос через прокси /api → http://localhost:4000
    const response = await fetch(`${API_URL}/students?login=${login}&password=${password}`);
    
    if (!response.ok) {
      console.error('❌ Ошибка сервера:', response.status);
      return null;
    }

    const students = await response.json();
    console.log('📦 Получены студенты:', students);
    
    // Находим студента с нужным логином и паролем
    const student = students.find(
      (s: any) => s.login === login && s.password === password
    );

    if (!student) {
      console.log('❌ Студент не найден');
      return null;
    }

    console.log('✅ Найден студент:', student.fullName);
    
    return {
      id: Number(student.id),
      fullName: student.fullName,
      role: 'student',
      groupId: student.groupId,
    };
  } catch (error) {
    console.error('💥 Ошибка запроса к серверу:', error);
    return null;
  }
};

/** Аутентификация пользователя */
export const authenticateUser = async (
  login: string,
  password: string,
): Promise<User | null> => {
  console.log('🔐 Аутентификация:', { login, password });
  
  // Сначала ищем среди преподавателей
  const teacher = await findTeacher(login, password);
  if (teacher) {
    return teacher;
  }

  // Затем среди студентов
  const student = await findStudent(login, password);
  if (student) {
    return student;
  }

  console.log('❌ Пользователь не найден');
  return null;
};

/** Генерация уникального токена сессии */
export const generateToken = (): string => crypto.randomUUID();