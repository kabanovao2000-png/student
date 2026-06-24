import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Teacher.module.scss';
import { getUser, logout } from '../../../utils/auth';
import { groups } from '../../../data/groupsData';

const Teacher: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [teacherGroups, setTeacherGroups] = useState(groups); // все группы для преподавателя (мок)

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGroupClick = (groupId: number) => {
    navigate(`/group/${groupId}`);
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.userName}>{user.fullName}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Выход</button>
        </div>
      </header>
      <main className={styles.main}>
        <h2 className={styles.title}>Мои группы</h2>
        <div className={styles.groupsGrid}>
          {teacherGroups.map(group => (
            <div key={group.id} className={styles.groupCard} onClick={() => handleGroupClick(group.id)}>
              <h3>{group.name}</h3>
              <p>Количество студентов: {Math.floor(Math.random() * 20) + 10}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Teacher;