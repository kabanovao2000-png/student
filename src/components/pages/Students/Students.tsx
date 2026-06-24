import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Student.module.scss';
import { getUser, logout } from '../../../utils/auth';
import { subjects, grades, attendance, groupSubjects } from '../../../data/groupsData';

type ViewMode = 'subjects' | 'weekly';

const Student: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [view, setView] = useState<ViewMode>('subjects');
  const [studentGrades, setStudentGrades] = useState<Record<number, number>>({});
  const [weeklyData, setWeeklyData] = useState<{ date: string; subjects: Record<number, string> }[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    // Загружаем оценки студента
    const studentId = user.id;
    const gradesData = grades[studentId] || {};
    setStudentGrades(gradesData);

    // Подготавливаем еженедельные данные
    const groupId = user.groupId!;
    const groupSubjectIds = groupSubjects[groupId] || [];
    // Собираем все даты за неделю (из attendance)
    const allDates = Object.keys(attendance[studentId]?.[groupSubjectIds[0]] || {});
    const weekly = allDates.map(date => {
      const subjectsStatus: Record<number, string> = {};
      groupSubjectIds.forEach(subId => {
        subjectsStatus[subId] = attendance[studentId]?.[subId]?.[date] || '-';
      });
      return { date, subjects: subjectsStatus };
    });
    setWeeklyData(weekly);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <div>Ошибка</div>;

  const groupSubjectIds = groupSubjects[user.groupId!] || [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.userName}>{user.fullName}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Выход</button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.controls}>
          <button
            className={view === 'subjects' ? styles.activeBtn : styles.btn}
            onClick={() => setView('subjects')}
          >
            Предметы
          </button>
          <button
            className={view === 'weekly' ? styles.activeBtn : styles.btn}
            onClick={() => setView('weekly')}
          >
            Еженедельная
          </button>
        </div>

        <div className={styles.tableContainer}>
          {view === 'subjects' ? (
            <>
              <h2 className={styles.sectionTitle}>Успеваемость по предметам</h2>
              <table className={styles.table}>
                <thead>
                  <tr><th>Предмет</th><th>Оценка</th></tr>
                </thead>
                <tbody>
                  {groupSubjectIds.map(subId => {
                    const subject = subjects.find(s => s.id === subId);
                    const grade = studentGrades[subId] || '-';
                    return (
                      <tr key={subId}>
                        <td>{subject?.name || 'Неизвестно'}</td>
                        <td>{grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>Еженедельная успеваемость</h2>
              <table className={styles.table}>
                <thead>
                  <tr><th>Дата</th>
                    {groupSubjectIds.map(subId => {
                      const subject = subjects.find(s => s.id === subId);
                      return <th key={subId}>{subject?.name || '?'}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.date}</td>
                      {groupSubjectIds.map(subId => (
                        <td key={subId}>{item.subjects[subId] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Student;