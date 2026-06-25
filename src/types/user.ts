// src/types/user.ts

export interface User {
  id: number;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
  groupId?: number; // опционально, если студент
}

export interface Student {
  id: number;          // или string, но оставим number, так как на бэке обычно число
  fullName: string;
  groupId: number;
}

export interface Group {
  id: string;          // теперь строка, чтобы совпадать с параметрами маршрута
  name: string;
  // другие поля при необходимости
}

export interface Discipline {
  id: string;          // тоже строка
  name: string;
  groupId?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  disciplineId: string;
  date: string;        // формат YYYY-MM-DD
  status: '' | 'present' | 'absent' | 'late' | 'sick';
  reason?: string;
  grade?: number;      // если понадобится для оценок
}