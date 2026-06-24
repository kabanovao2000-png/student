// src/pages/disciplinePage/disciplinePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LipShapka from '../../../components/layout/LipShapka/LipShapka';
import { getUser } from '../../../utils/auth';
import styles from './disciplinePage.module.scss';

// ===== ТИПЫ =====
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
  status: 'П' | 'Н' | 'Б' | 'Оп' | '';
  reason: string;
}

interface Student {
  id: string;
  fullName: string;
  groupId: number;
}

type Period = 'daily' | 'weekly' | 'monthly';

// ===== КОМПОНЕНТ =====
const DisciplinePage: React.FC = () => {
  const { disciplineId } = useParams<{ disciplineId: string }>();
  const navigate = useNavigate();
  const user = getUser();

  // ===== СОСТОЯНИЯ =====
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [period, setPeriod] = useState<Period>('daily');
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

  function getStatusForDate(date: string): string {
    if (!student) return '';
    const record = attendance.find(
      (a) => a.studentId === Number(student.id) && a.date === date && a.disciplineId === Number(disciplineId)
    );
    return record?.status || '';
  }

  function getReasonForDate(date: string): string {
    if (!student) return '';
    const record = attendance.find(
      (a) => a.studentId === Number(student.id) && a.date === date && a.disciplineId === Number(disciplineId)
    );
    return record?.reason || '';
  }

  function getStats(): { present: number; absent: number; sick: number; late: number; total: number } {
    const records = attendance.filter(
      (a) => a.studentId === Number(student?.id) && a.disciplineId === Number(disciplineId)
    );

    return {
      present: records.filter(r => r.status === 'П').length,
      absent: records.filter(r => r.status === 'Н').length,
      sick: records.filter(r => r.status === 'Б').length,
      late: records.filter(r => r.status === 'Оп').length,
      total: records.length,
    };
  }

  // ===== ЗАГРУЗКА ДАННЫХ =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Загружаем дисциплину
        const disciplineRes = await fetch(`/api/disciplines/${disciplineId}`);
        const disciplineData = await disciplineRes.json();
        setDiscipline(disciplineData);
        console.log('📦 Дисциплина:', disciplineData);

        // 2. Загружаем данные студента
        if (user) {
          const studentRes = await fetch(`/api/students/${user.id}`);
          const studentData = await studentRes.json();
          setStudent(studentData);
          console.log('📦 Студент:', studentData);
        }

        // 3. Загружаем все записи посещаемости
        const attendanceRes = await fetch('/api/attendance');
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
        console.log('📦 Посещаемость:', attendanceData);

      } catch (error) {
        console.error('💥 Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplineId, user]);

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
  const stats = student ? getStats() : { present: 0, absent: 0, sick: 0, late: 0, total: 0 };

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

  // ===== РЕНДЕР =====
  if (loading) {
    return (
      <div className={styles.page}>
        <LipShapka userName={user?.fullName || 'Студент'} onLogout={handleLogout} />
        <div className={styles.loadingContainer}>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <LipShapka 
        userName={user?.fullName || 'Студент'}
        onLogout={handleLogout}
      />

      <div className={styles.content}>
        {/* ===== ЗАГОЛОВОК ===== */}
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate('/student')}>
              ← Назад
            </button>
            <h1 className={styles.disciplineTitle}>
              {discipline?.name || 'Загрузка...'}
            </h1>
          </div>
          <div className={styles.statsSummary}>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>✅ Присутствовал:</span>
              <span className={styles.statValue} style={{ color: '#27AE60' }}>{stats.present}</span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>❌ Неявка:</span>
              <span className={styles.statValue} style={{ color: '#E74C3C' }}>{stats.absent}</span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>🩺 Болезнь:</span>
              <span className={styles.statValue} style={{ color: '#F39C12' }}>{stats.sick}</span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>⏰ Опоздал:</span>
              <span className={styles.statValue} style={{ color: '#3498DB' }}>{stats.late}</span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>📊 Всего:</span>
              <span className={styles.statValue}>{stats.total}</span>
            </span>
          </div>
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
                {student && (
                  <tr>
                    <td className={`${styles.studentName} ${styles.stickyCol}`}>
                      {student.fullName}
                    </td>
                    {dates.map((date) => {
                      const status = getStatusForDate(date);
                      const reason = getReasonForDate(date);

                      return (
                        <td 
                          key={date} 
                          className={styles.statusCell}
                          title={reason || 'Нет комментария'}
                        >
                          <span 
                            className={styles.statusBadge}
                            style={{ 
                              backgroundColor: statusOptions.find(o => o.value === status)?.color || 'transparent',
                              color: status ? '#fff' : 'var(--text)',
                            }}
                          >
                            {status || '—'}
                          </span>
                          {reason && (
                            <span className={styles.reasonIndicator} title={reason}>
                              📝
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className={styles.commentCol}>
                      {getReasonForDate(dates[0] || '') || '—'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplinePage;