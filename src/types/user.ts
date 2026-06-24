export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  groupId?: number; // только для студента
}