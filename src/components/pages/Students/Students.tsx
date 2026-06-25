import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/auth';
import Loader from '../../common/Loader/Loader';
import styles from './Students.module.scss';
import type { Discipline } from '../../../types/user';

const Student: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student' || !user.groupId) {
      navigate('/login');
      return;
    }

    const fetchDisciplines = async () => {
      try {
        const res = await fetch(`/api/disciplines?groupId=${user.groupId}`);
        if (!res.ok) throw new Error('Ошибка загрузки дисциплин');
        const data = await res.json();
        setDisciplines(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisciplines();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const goToSubject = (disciplineId: string) => {
    navigate(`/student/subject/${disciplineId}`);
  };

  if (loading) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.studentCard}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBackground}>
      <div className={styles.studentCard}>
        <header className={styles.stickyHeader}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName}</span>
            <span className={styles.userGroup}>Группа: {user?.groupId}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выход
          </button>
        </header>

        <div className={styles.subjectsBlock}>
          <h2>📚 Дисциплины</h2>
          <div className={styles.subjectButtons}>
            {disciplines.map((d) => (
              <button
                key={d.id}
                className={styles.subjectButton}
                onClick={() => goToSubject(d.id)}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;