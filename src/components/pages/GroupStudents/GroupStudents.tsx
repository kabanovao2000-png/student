// src/components/pages/GroupStudents/GroupStudents.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GroupStudents.module.scss'; // ← исправлен импорт стилей
import { getUser, logout } from '../../../utils/auth';
import { students, subjects, attendance, groupSubjects } from '../../../data/groupsData';

const GroupStudents: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = getUser();

  const [groupStudents, setGroupStudents] = useState<any[]>([]);
  const [groupSubjectIds, setGroupSubjectIds] = useState<number[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
      
    }

    const gId = Number(groupId);
    const studentsInGroup = students.filter(s => s.groupId === gId);
    setGroupStudents(studentsInGroup);

    const subIds = groupSubjects[gId] || [];
    setGroupSubjectIds(subIds);

    // Собираем все даты из посещаемости (для первого студента, первого предмета)
    if (studentsInGroup.length > 0 && subIds.length > 0) {
      const firstStudent = studentsInGroup[0];
      const dates = Object.keys(attendance[firstStudent.id]?.[subIds[0]] || {});
      const data = dates.map(date => {
        const row: any = { date };
        studentsInGroup.forEach(st => {
          const statuses: Record<number, string> = {};
          subIds.forEach(subId => {
            statuses[subId] = attendance[st.id]?.[subId]?.[date] || '-';
          });
          row[st.id] = statuses;
        });
        return row;
      });
      setMonthlyData(data);
    }
  }, [groupId, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => navigate('/teacher');

  if (!user) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.title}>Группа {groupId}</span>
          <div>
            <button className={styles.backBtn} onClick={handleBack}>Назад</button>
            <button className={styles.logoutBtn} onClick={handleLogout}>Выход</button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Ежемесячная успеваемость</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ФИО студента</th>
                {groupSubjectIds.map(subId => {
                  const sub = subjects.find(s => s.id === subId);
                  return <th key={subId}>{sub?.name || '?'}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {groupStudents.map(student => {
                // Для простоты показываем последний статус по каждому предмету
                const lastStatus: Record<number, string> = {};
                groupSubjectIds.forEach(subId => {
                  const dates = Object.keys(attendance[student.id]?.[subId] || {});
                  const lastDate = dates.length > 0 ? dates[dates.length - 1] : null;
                  lastStatus[subId] = lastDate ? attendance[student.id][subId][lastDate] : '-';
                });
                return (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    {groupSubjectIds.map(subId => (
                      <td key={subId}>{lastStatus[subId] || '-'}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default GroupStudents;