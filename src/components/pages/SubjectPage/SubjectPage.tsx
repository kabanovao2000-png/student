// src/pages/student/SubjectPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/auth';
import Loader from '../../common/Loader/Loader';
import styles from './SubjectPage.module.scss';
import type { AttendanceRecord } from '../../../types/user';

const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const user = getUser();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [disciplineName, setDisciplineName] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    if (!subjectId) return;

    const fetchData = async () => {
      try {
        const discRes = await fetch(`/api/disciplines/${subjectId}`);
        const disc = await discRes.json();
        setDisciplineName(disc.name || 'Предмет');

        const attRes = await fetch(
          `/api/attendance?studentId=${Number(user.id)}&disciplineId=${subjectId}`
        );
        if (!attRes.ok) throw new Error('Ошибка загрузки посещаемости');
        const data = await attRes.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId, user, navigate]);

  // Фильтруем по выбранному месяцу
  const filteredRecords = records.filter((r) =>
    r.date.startsWith(selectedMonth)
  );
  const sorted = [...filteredRecords].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Подсчёт статистики по статусам
  const total = sorted.length;
  const present = sorted.filter((r) => r.status === 'present').length;
  const absent = sorted.filter((r) => r.status === 'absent').length;
  const sick = sorted.filter((r) => r.status === 'sick').length;
  const late = sorted.filter((r) => r.status === 'late').length;

  // Маппинг для отображения
  const statusMap = {
    present: { label: 'Присутствовал', emoji: '✅', color: '#27AE60' },
    absent: { label: 'Отсутствовал', emoji: '❌', color: '#E74C3C' },
    sick: { label: 'Болел', emoji: '🤒', color: '#F39C12' },
    late: { label: 'Опоздал', emoji: '⏰', color: '#3498DB' },
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className={styles.subjectContainer}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.subjectContainer}>
      <header className={styles.stickyHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => navigate('/student')}>
            ← Назад
          </button>
          <h1>🧪 {disciplineName}</h1>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Выход
        </button>
      </header>

      <div className={styles.filters}>
        <label>Месяц:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      <div className={styles.reportBlock}>
        <div className={styles.reportItem}>Всего дней: {total}</div>
        <div className={styles.reportItem}>Присутствовал: {present}</div>
        <div className={styles.reportItem}>Отсутствовал: {absent}</div>
        <div className={styles.reportItem}>Болел: {sick}</div>
        <div className={styles.reportItem}>Опоздал: {late}</div>
      </div>

      <div className={styles.legend}>
        {Object.entries(statusMap).map(([key, val]) => (
          <span key={key} className={styles.legendItem} style={{ color: val.color }}>
            {val.emoji} {val.label}
          </span>
        ))}
      </div>

      <div className={styles.attendanceTableWrapper}>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Статус</th>
              <th>Причина</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={3}>Нет данных за этот месяц</td>
              </tr>
            ) : (
              sorted.map((rec) => {
                const info = statusMap[rec.status as keyof typeof statusMap] || {
                  label: 'Неизвестно',
                  emoji: '❓',
                  color: '#999',
                };
                return (
                  <tr key={rec.id}>
                    <td>{rec.date}</td>
                    <td style={{ color: info.color }}>
                      {info.emoji} {info.label}
                    </td>
                    <td>{rec.reason || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectPage;