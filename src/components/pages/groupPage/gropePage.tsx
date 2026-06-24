// src/pages/groupPage/groupPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LipShapka from '../../layout/LipShapka/LipShapka';
import { getUser } from '../../../utils/auth';
import styles from '../groupPage/gropePage.module.scss';

// ===== ТИПЫ =====
interface Student {
  id: string;
  fullName: string;
  groupId: number;
}

interface Discipline {
  id: number;
  name: string;
  groupId: number;
}

interface AttendanceRecord {
  id: string;
  studentId: number;
  disciplineId: number;
  date: string;
  status: 'P' | 'N' | 'Б' | 'Оп' | '';
  reason: string;
}

interface Group {
  id: number;
  name: string;
  teacherId: number;
}

type Period = 'daily' | 'weekly' | 'monthly';

// ===== КОМПОНЕНТ =====
const GroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = getUser();

  // ===== СОСТОЯНИЯ =====
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ studentId: string; date: string } | null>(null);
  
  const [period, setPeriod] = useState<Period>('daily');
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekStart());
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const tableRef = useRef<HTMLDivElement>(null);

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  function getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatMonth(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  }

  // ===== ДОБАВЛЯЕМ getWeekRange =====
  function getWeekRange(startDate: string): string {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start.toISOString().split('T')[0])} - ${formatDate(end.toISOString().split('T')[0])}`;
  }

  function getWeekDates(startDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  function getDaysInMonth(year: number, month: number): string[] {
    const dates: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  function getMonthDays(): string[] {
    const [year, month] = selectedMonth.split('-').map(Number);
    return getDaysInMonth(year, month);
  }

  function getStatusForDate(studentId: string, date: string): string {
    const record = attendance.find(
      (a) => a.studentId === Number(studentId) && a.date === date && a.disciplineId === selectedDiscipline
    );
    return record?.status || '';
  }

  function getReasonForDate(studentId: string, date: string): string {
    const record = attendance.find(
      (a) => a.studentId === Number(studentId) && a.date === date && a.disciplineId === selectedDiscipline
    );
    return record?.reason || '';
  }

  function getRecordForDate(studentId: string, date: string): AttendanceRecord | undefined {
    return attendance.find(
      (a) => a.studentId === Number(studentId) && a.date === date && a.disciplineId === selectedDiscipline
    );
  }

  // ===== ЗАГРУЗКА ДАННЫХ =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const groupRes = await fetch(`/api/groups/${groupId}`);
        const groupData = await groupRes.json();
        setGroup(groupData);

        const studentsRes = await fetch(`/api/students?groupId=${groupId}`);
        const studentsData = await studentsRes.json();
        setStudents(studentsData);

        const disciplinesRes = await fetch(`/api/disciplines?groupId=${groupId}`);
        const disciplinesData = await disciplinesRes.json();
        setDisciplines(disciplinesData);
        if (disciplinesData.length > 0) {
          setSelectedDiscipline(disciplinesData[0].id);
        }

        const attendanceRes = await fetch('/api/attendance');
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);

      } catch (error) {
        console.error('💥 Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  // ===== ОБНОВЛЕНИЕ СТАТУСА =====
  const updateStatus = async (studentId: string, date: string, newStatus: 'P' | 'N' | 'Б' | 'Оп' | '') => {
    if (!selectedDiscipline) return;

    const existing = getRecordForDate(studentId, date);
    
    if (existing) {
      if (newStatus === '') {
        try {
          await fetch(`/api/attendance/${existing.id}`, {
            method: 'DELETE'
          });
          setAttendance(attendance.filter(a => a.id !== existing.id));
        } catch (error) {
          console.error('Ошибка удаления:', error);
        }
      } else {
        try {
          const response = await fetch(`/api/attendance/${existing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          const updated = await response.json();
          setAttendance(attendance.map(a => a.id === updated.id ? updated : a));
        } catch (error) {
          console.error('Ошибка обновления:', error);
        }
      }
    } else if (newStatus !== '') {
      try {
        const newRecord = {
          studentId: Number(studentId),
          disciplineId: selectedDiscipline,
          date: date,
          status: newStatus,
          reason: ''
        };
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        });
        const created = await response.json();
        setAttendance([...attendance, created]);
      } catch (error) {
        console.error('Ошибка создания:', error);
      }
    }

    setSelectedCell(null);
  };

  // ===== ОБНОВЛЕНИЕ КОММЕНТАРИЯ =====
  const updateComment = async (studentId: string, date: string, reason: string) => {
    const existing = getRecordForDate(studentId, date);
    
    if (existing) {
      try {
        const response = await fetch(`/api/attendance/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        const updated = await response.json();
        setAttendance(attendance.map(a => a.id === updated.id ? updated : a));
      } catch (error) {
        console.error('Ошибка обновления комментария:', error);
      }
    } else if (reason.trim() !== '') {
      try {
        const newRecord = {
          studentId: Number(studentId),
          disciplineId: selectedDiscipline,
          date: date,
          status: '',
          reason: reason
        };
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        });
        const created = await response.json();
        setAttendance([...attendance, created]);
      } catch (error) {
        console.error('Ошибка создания:', error);
      }
    }
  };

  // ===== ВЫХОД =====
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  // ===== СТАТУСЫ ДЛЯ ОТОБРАЖЕНИЯ =====
  const statusOptions: { value: 'P' | 'N' | 'Б' | 'Оп'; label: string; color: string; title: string }[] = [
    { value: 'P', label: 'П', color: '#27AE60', title: 'Присутствует' },
    { value: 'N', label: 'Н', color: '#E74C3C', title: 'Неявка' },
    { value: 'Б', label: 'Б', color: '#F39C12', title: 'Болезнь' },
    { value: 'Оп', label: 'Оп', color: '#3498DB', title: 'Опоздал' },
  ];

  // ===== ПОЛУЧЕНИЕ ДАТ ДЛЯ ОТОБРАЖЕНИЯ =====
  const getDates = (): string[] => {
    if (period === 'daily') {
      return [selectedDate];
    } else if (period === 'weekly') {
      return getWeekDates(selectedWeek);
    } else {
      return getMonthDays();
    }
  };

  const dates = getDates();

  // ===== РЕНДЕР =====
  if (loading) {
    return (
      <div className={styles.page}>
        <LipShapka userName={user?.fullName || 'Преподаватель'} onLogout={handleLogout} />
        <div className={styles.loadingContainer}>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <LipShapka 
        userName={user?.fullName || 'Преподаватель'}
        onLogout={handleLogout}
      />

      <div className={styles.content}>
        {/* ===== ЗАГОЛОВОК ===== */}
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate('/teacher')}>
              ← Назад
            </button>
            <h1 className={styles.groupTitle}>Группа: {group?.name || 'Загрузка...'}</h1>
          </div>
          <button className={styles.startPollButton}>
            📊 Начать опрос
          </button>
        </div>

        {/* ===== КНОПКИ ПЕРИОДОВ ===== */}
        <div className={styles.periodButtons}>
          <button 
            className={`${styles.periodButton} ${period === 'daily' ? styles.active : ''}`}
            onClick={() => setPeriod('daily')}
          >
            Ежедневный
          </button>
          <button 
            className={`${styles.periodButton} ${period === 'weekly' ? styles.active : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            Еженедельный
          </button>
          <button 
            className={`${styles.periodButton} ${period === 'monthly' ? styles.active : ''}`}
            onClick={() => setPeriod('monthly')}
          >
            Ежемесячный
          </button>
        </div>

        {/* ===== ФИЛЬТРЫ ===== */}
        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            {period === 'daily' && (
              <input
                type="date"
                className={styles.dateInput}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            )}
            {period === 'weekly' && (
              <div className={styles.weekSelector}>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                />
                <span className={styles.weekRange}>{getWeekRange(selectedWeek)}</span>
              </div>
            )}
            {period === 'monthly' && (
              <>
                <input
                  type="month"
                  className={styles.dateInput}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
                <span className={styles.monthDisplay}>
                  📅 {formatMonth(selectedMonth)}
                </span>
              </>
            )}
          </div>

          <div className={styles.filterGroup}>
            <select 
              className={styles.disciplineSelect}
              value={selectedDiscipline || ''}
              onChange={(e) => setSelectedDiscipline(Number(e.target.value))}
            >
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button className={styles.downloadButton}>
            📥 Скачать отчёт
          </button>
        </div>

        {/* ===== ТАБЛИЦА ===== */}
        <div className={styles.tableContainer} ref={tableRef}>
          <div className={styles.tableWrapper}>
            <table className={styles.attendanceTable}>
              <thead>
                <tr>
                  <th className={styles.stickyCol}>№</th>
                  <th className={styles.stickyCol}>ФИО студента</th>
                  {dates.map((date) => (
                    <th key={date} className={styles.dateHeader}>
                      {period === 'daily' ? formatDate(date) : date}
                    </th>
                  ))}
                  <th className={styles.commentCol}>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td className={styles.stickyCol}>{index + 1}</td>
                    <td className={`${styles.studentName} ${styles.stickyCol}`}>
                      {student.fullName}
                    </td>
                    {dates.map((date) => {
                      const status = getStatusForDate(student.id, date);
                      const isSelected = selectedCell?.studentId === student.id && selectedCell?.date === date;

                      return (
                        <td 
                          key={date} 
                          className={`${styles.statusCell} ${isSelected ? styles.selected : ''}`}
                          onClick={() => setSelectedCell({ studentId: student.id, date })}
                        >
                          {isSelected ? (
                            <div className={styles.statusDropdown}>
                              {statusOptions.map((opt) => (
                                <button
                                  key={opt.value}
                                  className={`${styles.dropdownOption} ${status === opt.value ? styles.activeOption : ''}`}
                                  style={{ backgroundColor: status === opt.value ? opt.color : 'transparent' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(student.id, date, opt.value);
                                  }}
                                >
                                  {opt.label} - {opt.title}
                                </button>
                              ))}
                              <button
                                className={styles.dropdownOptionClear}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus(student.id, date, '');
                                }}
                              >
                                ✕ Очистить
                              </button>
                            </div>
                          ) : (
                            <span 
                              className={styles.statusBadge}
                              style={{ 
                                backgroundColor: statusOptions.find(o => o.value === status)?.color || 'transparent',
                                color: status ? '#fff' : 'var(--text)',
                              }}
                            >
                              {status || '—'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className={styles.commentCol}>
                      <input
                        type="text"
                        className={styles.commentInput}
                        placeholder="Добавить комментарий..."
                        value={getReasonForDate(student.id, dates[0] || '')}
                        onChange={(e) => {
                          if (dates[0]) {
                            updateComment(student.id, dates[0], e.target.value);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;