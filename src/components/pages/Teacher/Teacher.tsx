import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/auth';
import Loader from '../../common/Loader/Loader';
import styles from './Teacher.module.scss';
import type { Group } from '../../../types/user';

const Teacher: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  //Бесконечный цикл
  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchGroups = async () => {
      try {
        const res = await fetch(`/api/groups?teacherId=${Number(user.id)}`);
        if (!res.ok) throw new Error('Ошибка загрузки групп');
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const goToGroup = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  if (loading) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.teacherCard}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBackground}>
      <div className={styles.teacherCard}>
        <header className={styles.stickyHeader}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выход
          </button>
        </header>

        <div className={styles.groupsBlock}>
          <h2>🗿 Мои группы</h2>
          {groups.length === 0 ? (
            <p>У вас пока нет групп</p>
          ) : (
            <div className={styles.groupButtons}>
              {groups.map((g) => (
                <button
                  key={g.id}
                  className={styles.groupButton}
                  onClick={() => goToGroup(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teacher;