// src/pages/mainTeacher/mainTeacher.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LipShapka from '../../../components/layout/LipShapka/LipShapka';
import { getUser } from '../../../utils/auth';
import styles from './mainTeacher.module.scss';

interface Group {
  id: number;
  name: string;
  studentCount: number;
  disciplineCount: number;
  color?: string;
}

const MainTeacher: React.FC = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const groupsResponse = await fetch('/api/groups');
        const groupsData = await groupsResponse.json();
        console.log('📦 Группы из базы:', groupsData);

        const studentsResponse = await fetch('/api/students');
        const studentsData = await studentsResponse.json();
        console.log('📦 Студенты из базы:', studentsData);

        const disciplinesResponse = await fetch('/api/disciplines');
        const disciplinesData = await disciplinesResponse.json();
        console.log('📦 Дисциплины из базы:', disciplinesData);

        const formattedGroups: Group[] = groupsData.map((group: any) => {
          const groupId = Number(group.id);
          
          const studentCount = studentsData.filter(
            (student: any) => Number(student.groupId) === groupId
          ).length;

          const disciplineCount = disciplinesData.filter(
            (discipline: any) => Number(discipline.groupId) === groupId
          ).length;

          console.log(`📊 Группа ${group.name} (id: ${groupId}): студентов ${studentCount}, дисциплин ${disciplineCount}`);

          return {
            id: groupId,
            name: group.name,
            studentCount: studentCount,
            disciplineCount: disciplineCount,
            color: getGroupColor(groupId),
          };
        });

        setGroups(formattedGroups);
        console.log('✅ Сформированные группы:', formattedGroups);

      } catch (error) {
        console.error('💥 Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGroupColor = (id: number): string => {
    const colors = [
      '#4A90D9', '#27AE60', '#E67E22', '#8E44AD', 
      '#E74C3C', '#1ABC9C', '#F39C12', '#2ECC71',
      '#3498DB', '#9B59B6'
    ];
    return colors[(id - 1) % colors.length];
  };

  // ===== ИСПОЛЬЗУЕМ setSelectedGroup для выделения карточки =====
  const handleGroupClick = (id: number) => {
    setSelectedGroup(id); // ← выделяем карточку
    setTimeout(() => {
      navigate(`/teacher/group/${id}`);
    }, 300); // ← небольшая задержка для визуального эффекта
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <div className={styles.page}>
      <LipShapka 
        userName={user?.fullName || 'Преподаватель'}
        onLogout={handleLogout}
      />

      <div className={styles.content}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Добро пожаловать, <span className={styles.userNameHighlight}>{user?.fullName || 'Преподаватель'}</span>!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Управляйте группами и посещаемостью студентов
          </p>
        </div>

        <div className={styles.groupsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Учебные группы</h2>
            <span className={styles.groupCount}>
              {loading ? 'Загрузка...' : `${groups.length} групп`}
            </span>
          </div>
          
          <p className={styles.sectionSubtitle}>
            Выберите группу для просмотра подробной информации
          </p>

          {loading && (
            <div className={styles.loadingState}>
              <p>Загрузка данных...</p>
            </div>
          )}

          {!loading && groups.length === 0 && (
            <div className={styles.loadingState}>
              <p>Нет доступных групп</p>
            </div>
          )}

          {!loading && (
            <div className={styles.groupsGrid}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`${styles.groupCard} ${
                    selectedGroup === group.id ? styles.selected : ''
                  }`}
                  onClick={() => handleGroupClick(group.id)}
                  style={{
                    borderColor: selectedGroup === group.id ? group.color : 'var(--ramka)',
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span 
                      className={styles.groupNameBadge}
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.cardStat}>
                      <span className={styles.statIcon}>👨‍🎓</span>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Студентов</span>
                        <span className={styles.statValue}>{group.studentCount}</span>
                      </div>
                    </div>
                    
                    <div className={styles.cardStat}>
                      <span className={styles.statIcon}>📚</span>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Дисциплин</span>
                        <span className={styles.statValue}>{group.disciplineCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.viewDetails}>Подробнее →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainTeacher;