// src/pages/teacher/GroupPage.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/auth';
import Loader from '../../common/Loader/Loader';
import styles from './groupPage.module.scss';
import type { Student, Discipline, AttendanceRecord, Group } from '../../../types/user';

type Period = 'daily' | 'weekly' | 'monthly';

const GroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);

  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekStart());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const tableRef = useRef<HTMLDivElement>(null);

  function getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function getWeekDates(startDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }

  function getMonthDays(): string[] {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: string[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  function getDates(): string[] {
    if (period === 'daily') return [selectedDate];
    if (period === 'weekly') return getWeekDates(selectedWeek);
    return getMonthDays();
  }

  const dates = getDates();

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    if (!user || user.role !== 'teacher' || !groupId) {
      navigate('/login');
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = getHeaders();

        const [groupRes, studentsRes, disciplinesRes, attendanceRes] = await Promise.all([
          fetch(`/api/groups/${groupId}`, { headers, signal }),
          fetch(`/api/students?groupId=${Number(groupId)}`, { headers, signal }),
          fetch(`/api/disciplines?groupId=${Number(groupId)}`, { headers, signal }),
          fetch('/api/attendance', { headers, signal }),
        ]);

        if (!groupRes.ok) throw new Error('Группа не найдена');
        if (!studentsRes.ok) throw new Error('Ошибка загрузки студентов');
        if (!disciplinesRes.ok) throw new Error('Ошибка загрузки дисциплин');
        if (!attendanceRes.ok) throw new Error('Ошибка загрузки посещаемости');

        const groupData = await groupRes.json();
        const studentsData = await studentsRes.json();
        const disciplinesData = await disciplinesRes.json();
        const attendanceData = await attendanceRes.json();

        setGroup(groupData);
        setStudents(studentsData);
        setDisciplines(disciplinesData);
        setAttendance(attendanceData);

        if (disciplinesData.length > 0) {
          setSelectedDiscipline(disciplinesData[0].id);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Запрос отменён');
          return;
        }
        console.error('Ошибка загрузки:', err);
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [groupId, user, navigate]);

  // ---- Получение статуса ----
  const getStatus = (studentId: number, date: string): string | undefined => {
    const rec = attendance.find(
      (a) =>
        a.studentId === studentId &&
        a.date === date &&
        a.disciplineId === selectedDiscipline
    );
    return rec?.status;
  };

  // ---- Обновление статуса ----
  const updateStatus = async (
    studentId: number,
    date: string,
    status: string | undefined
  ) => {
    if (!selectedDiscipline) return;

    const headers = getHeaders();
    const existing = attendance.find(
      (a) =>
        a.studentId === studentId &&
        a.date === date &&
        a.disciplineId === selectedDiscipline
    );

    if (existing) {
      if (status === undefined) {
        // Удаляем запись
        await fetch(`/api/attendance/${existing.id}`, { method: 'DELETE', headers });
        setAttendance(attendance.filter((a) => a.id !== existing.id));
      } else {
        // Обновляем статус
        const res = await fetch(`/api/attendance/${existing.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status }),
        });
        const updated = await res.json();
        setAttendance(attendance.map((a) => (a.id === updated.id ? updated : a)));
      }
    } else if (status !== undefined) {
      // Создаём новую запись
      const newRec = {
        studentId,
        disciplineId: selectedDiscipline,
        date,
        status,
        reason: '',
        grade: undefined,
      };
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify(newRec),
      });
      const created = await res.json();
      setAttendance([...attendance, created]);
    }
  };

  // ---- Генерация HTML-отчёта ----
  const generateReportHTML = (): string => {
    const disciplineName = disciplines.find((d) => d.id === selectedDiscipline)?.name || 'Без дисциплины';
    const groupName = group?.name || 'Группа';

    // Маппинг статусов на русские названия
    const statusMap: Record<string, string> = {
      present: 'Был',
      absent: 'Не был',
      late: 'Опоздал',
      sick: 'Заболел',
    };

    const headerRow = dates.map((date) => `<th>${formatDate(date)}</th>`).join('');

    const bodyRows = students
      .map((student, idx) => {
        const statusCells = dates
          .map((date) => {
            const status = getStatus(Number(student.id), date);
            const display = status ? statusMap[status] || status : '';
            return `<td>${display}</td>`;
          })
          .join('');
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${student.fullName}</td>
            ${statusCells}
          </tr>
        `;
      })
      .join('');

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Отчёт по группе ${groupName}</title>
          <style>
            body { font-family: 'Calibri', sans-serif; margin: 30px; }
            h1 { color: #2E4A2B; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #5D4037; padding: 8px 12px; text-align: center; }
            th { background: #A5D6A7; font-weight: bold; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .meta { color: #5D4037; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ведомость посещаемости</h1>
            <div><strong>Группа:</strong> ${groupName}</div>
          </div>
          <div class="meta">
            <strong>Дисциплина:</strong> ${disciplineName} &nbsp;|&nbsp;
            <strong>Период:</strong> ${dates.length} занятий
          </div>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>ФИО студента</th>
                ${headerRow}
              </tr>
            </thead>
            <tbody>
              ${bodyRows}
            </tbody>
          </table>
          <p style="margin-top:20px; color:#8D6E63;">
            Отчёт сгенерирован ${new Date().toLocaleString('ru-RU')}
          </p>
        </body>
      </html>
    `;
  };

  // ---- Скачивание отчёта ----
  const handleDownload = () => {
    const docHtml = generateReportHTML();
    const blob = new Blob([docHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    const groupName = group?.name || 'группа';
    const disciplineName = disciplines.find((d) => d.id === selectedDiscipline)?.name || 'дисциплина';
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Посещаемость_${groupName}_${disciplineName}_${dateStr}.doc`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // ---- Выход ----
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // ---- Компонент ячейки с выбором статуса ----
  const StatusCell: React.FC<{ studentId: number; date: string }> = ({ studentId, date }) => {
    const status = getStatus(studentId, date);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === '') {
        updateStatus(studentId, date, undefined);
      } else {
        updateStatus(studentId, date, val);
      }
    };

    return (
      <select className={styles.gradeSelect} value={status ?? ''} onChange={handleStatusChange}>
        <option value="">—</option>
        <option value="present">Был</option>
        <option value="absent">Не был</option>
        <option value="late">Опоздал</option>
        <option value="sick">Заболел</option>
      </select>
    );
  };

  // ---- Отрисовка ----
  if (loading) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.groupCard}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.groupCard}>
          <div className={styles.errorContainer}>
            <h3>⚠️ Ошибка</h3>
            <p>{error}</p>
            <button className={styles.backButton} onClick={() => navigate('/teacher')}>
              ← Вернуться к списку групп
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.groupCard}>
          <div className={styles.errorContainer}>
            <p>Группа не найдена</p>
            <button className={styles.backButton} onClick={() => navigate('/teacher')}>
              ← Вернуться к списку групп
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBackground}>
      <div className={styles.groupCard}>
        <header className={styles.stickyHeader}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName}</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.backButton} onClick={() => navigate('/teacher')}>
              ← Назад
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Выход
            </button>
          </div>
        </header>

        <div className={styles.filterCard}>
          <div className={styles.periodButtons}>
            <button
              className={`${styles.periodButton} ${period === 'daily' ? styles.active : ''}`}
              onClick={() => setPeriod('daily')}
            >
              ⏳ Ежедневная отметка
            </button>
            <button
              className={`${styles.periodButton} ${period === 'weekly' ? styles.active : ''}`}
              onClick={() => setPeriod('weekly')}
            >
              ⏳ Еженедельная отметка
            </button>
            <button
              className={`${styles.periodButton} ${period === 'monthly' ? styles.active : ''}`}
              onClick={() => setPeriod('monthly')}
            >
              ⏳ Ежемесячная отметка
            </button>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              {period === 'daily' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              )}
              {period === 'weekly' && (
                <input
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                />
              )}
              {period === 'monthly' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              )}
            </div>
            <div className={styles.filterGroup}>
              <select
                value={selectedDiscipline || ''}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
              >
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <button className={styles.downloadButton} onClick={handleDownload}>
              📜 Скачать документ
            </button>
          </div>
        </div>

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
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id}>
                    <td className={styles.stickyCol}>{idx + 1}</td>
                    <td className={`${styles.studentName} ${styles.stickyCol}`}>
                      {student.fullName}
                    </td>
                    {dates.map((date) => (
                      <td key={date} className={styles.gradeCell}>
                        <StatusCell studentId={Number(student.id)} date={date} />
                      </td>
                    ))}
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