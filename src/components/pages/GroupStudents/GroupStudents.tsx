// GroupStudents.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GroupStudents/GroupStudents.module.scss';

type AttendanceStatus = 'был' | 'не был' | 'опоздал' | 'заболел' | 'пропустил';
type Grade = number | AttendanceStatus;
type MarkValue = Grade | ''; // теперь пустая строка допустима

interface Students {
  id: number;
  name: string;
}

interface GroupData {
  groupName: string;
  teacherName: string;
  students: Students[];
}

type Period = 'daily' | 'weekly' | 'monthly';

// Моковые данные
const mockGroup: GroupData = {
  groupName: 'ИС-21',
  teacherName: 'Иванов Иван Иванович',
  students: [
    { id: 1, name: 'Петров Петр' },
    { id: 2, name: 'Сидорова Анна' },
    { id: 3, name: 'Козлов Дмитрий' },
    { id: 4, name: 'Смирнова Екатерина' },
  ],
};

const attendanceOptions: AttendanceStatus[] = ['был', 'не был', 'опоздал', 'заболел', 'пропустил'];
// Все возможные значения для выпадающего списка, включая пустую строку
const selectOptions: MarkValue[] = ['', 2, 3, 4, 5, ...attendanceOptions];

const GroupStudents: React.FC = () => {
  const navigate = useNavigate();
  const [activePeriod, setActivePeriod] = useState<Period>('daily');
  const [marks, setMarks] = useState<Record<Period, Record<number, MarkValue>>>({
    daily: {},
    weekly: {},
    monthly: {},
  });

  // Возвращает MarkValue (число, статус или пустую строку)
  const getMark = (studentId: number): MarkValue => {
    const periodMarks = marks[activePeriod];
    return periodMarks?.[studentId] ?? '';
  };

  const handleMarkChange = (studentId: number, value: MarkValue) => {
    setMarks((prev) => ({
      ...prev,
      [activePeriod]: {
        ...prev[activePeriod],
        [studentId]: value,
      },
    }));
  };

  const handleLogout = () => {
    navigate('/teacher');
  };

  return (
    <div className="group-container">
      <header className="sticky-header">
        <div className="header-content">
          <div className="group-info">
            <h1>{mockGroup.groupName}</h1>
            <span className="teacher-name">Преподаватель: {mockGroup.teacherName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Выход
          </button>
        </div>
      </header>

      <div className="period-tabs">
        <button
          className={activePeriod === 'daily' ? 'active' : ''}
          onClick={() => setActivePeriod('daily')}
        >
          Ежедневные
        </button>
        <button
          className={activePeriod === 'weekly' ? 'active' : ''}
          onClick={() => setActivePeriod('weekly')}
        >
          Еженедельные
        </button>
        <button
          className={activePeriod === 'monthly' ? 'active' : ''}
          onClick={() => setActivePeriod('monthly')}
        >
          Ежемесячные
        </button>
      </div>

      <table className="marks-table">
        <thead>
          <tr>
            <th>Студент</th>
            <th>Отметка / Оценка</th>
          </tr>
        </thead>
        <tbody>
          {mockGroup.students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <select
                  value={getMark(student.id)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      handleMarkChange(student.id, '');
                    } else {
                      const num = Number(val);
                      if (!isNaN(num)) {
                        handleMarkChange(student.id, num);
                      } else {
                        handleMarkChange(student.id, val as AttendanceStatus);
                      }
                    }
                  }}
                >
                  {selectOptions.map((opt) => (
                    <option key={String(opt)} value={String(opt)}>
                      {opt === '' ? '—' : opt}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupStudents;