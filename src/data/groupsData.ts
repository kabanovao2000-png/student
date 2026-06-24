// Моковые студенты
export const students = [
  { id: '1', fullName: 'Иванов Иван Иванович', groupId: 1 },
  { id: '2', fullName: 'Петров Пётр Петрович', groupId: 1 },
  { id: '3', fullName: 'Сидорова Анна Сергеевна', groupId: 2 },
  { id: '4', fullName: 'Кузнецов Дмитрий Алексеевич', groupId: 2 },
];

// Моковые группы
export const groups = [
  { id: 1, name: 'Группа 101' },
  { id: 2, name: 'Группа 102' },
];

// Моковые предметы
export const subjects = [
  { id: 1, name: 'Математика' },
  { id: 2, name: 'Физика' },
  { id: 3, name: 'Программирование' },
  { id: 4, name: 'Базы данных' },
  { id: 5, name: 'Веб-технологии' },
];

// Моковые оценки (студент -> предмет -> оценка)
// Для простоты создадим оценки для каждого студента по каждому предмету (число от 2 до 5)
export const grades: Record<string, Record<number, number>> = {
  '1': { 1: 5, 2: 4, 3: 5, 4: 3, 5: 4 },
  '2': { 1: 3, 2: 5, 3: 4, 4: 4, 5: 3 },
  '3': { 1: 4, 2: 4, 3: 3, 4: 5, 5: 4 },
  '4': { 1: 5, 2: 3, 3: 4, 4: 3, 5: 5 },
};

// Моковые еженедельные даты (последние 7 дней)
const today = new Date();
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (6 - i));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
});

// Моковые посещаемость за неделю (для каждого студента и предмета)
// Сгенерируем случайные статусы 'П', 'Н', 'Б'
export const attendance: Record<string, Record<number, Record<string, string>>> = {
  // studentId -> subjectId -> date -> status
};

// Заполним для каждого студента
students.forEach(s => {
  attendance[s.id] = {};
  subjects.forEach(sub => {
    attendance[s.id][sub.id] = {};
    weekDates.forEach(date => {
      const statuses = ['П', 'Н', 'Б'];
      attendance[s.id][sub.id][date] = statuses[Math.floor(Math.random() * statuses.length)];
    });
  });
});

// Также добавим данные о том, какие предметы у группы (все предметы для всех групп)
export const groupSubjects: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5],
  2: [1, 2, 3, 4, 5],
};