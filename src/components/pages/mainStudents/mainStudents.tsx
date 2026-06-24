// src/pages/mainStudents/mainStudents.tsx
import React, { useState, useEffect } from 'react'; // ← добавили useEffect
import LipShapka from '../../layout/LipShapka/LipShapka';
import { getUser } from '../../../utils/auth';
import styles from './mainStudents.module.scss';

interface Discipline {
  id: number;
  name: string;
  teacher: string;
  icon?: string;
  color?: string;
}

const MainStudents: React.FC = () => {
  // ===== СОСТОЯНИЕ ДЛЯ ИМЕНИ =====
  const [userName, setUserName] = useState<string>('Студент');

  // ===== ЗАГРУЖАЕМ ИМЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.fullName);
    }
  }, []); // ← выполняется один раз при загрузке

  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);

  // Временные данные дисциплин
  const disciplines: Discipline[] = [
    {
      id: 1,
      name: 'Веб-разработка',
      teacher: 'Михаил Скляров',
      icon: '🌐',
      color: '#4A90D9',
    },
    {
      id: 2,
      name: 'Базы данных',
      teacher: 'Татьяна Александровна',
      icon: '🗄️',
      color: '#27AE60',
    },
    {
      id: 3,
      name: 'Программирование',
      teacher: 'Дмитрий Граков',
      icon: '💻',
      color: '#E67E22',
    },
    {
      id: 4,
      name: 'Дизайн интерфейсов',
      teacher: 'Михаил Скляров',
      icon: '🎨',
      color: '#8E44AD',
    },
    {
      id: 5,
      name: 'Jujutsu Kaisen (Modulo)',
      teacher: 'Dabura Karaba',
      icon: '📚',
      color: '#E74C3C',
    },
  ];

  const handleDisciplineClick = (id: number) => {
    setSelectedDiscipline(id === selectedDiscipline ? null : id);
  };

  // ===== ВЫХОД ИЗ СИСТЕМЫ =====
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <div className={styles.page}>
      {/* ===== ЛИПКАЯ ШАПКА ===== */}
      <LipShapka 
        userName={userName} // ← используем состояние
        onLogout={handleLogout}
      />

      {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
      <div className={styles.content}>
        {/* ===== ПРИВЕТСТВИЕ ===== */}
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Добро пожаловать, <span className={styles.userNameHighlight}>{userName}</span>!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Выберите дисциплину для просмотра подробной информации
          </p>
        </div>

        {/* ===== БЛОК "УЧЕБНЫЕ ДИСЦИПЛИНЫ" ===== */}
        <div className={styles.disciplinesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Учебные дисциплины</h2>
            <span className={styles.disciplineCount}>
              {disciplines.length} дисциплин
            </span>
          </div>
          
          <p className={styles.sectionSubtitle}>
            Выберите дисциплину для просмотра подробной информации
          </p>

          {/* ===== СЕТКА ДИСЦИПЛИН ===== */}
          <div className={styles.disciplinesGrid}>
            {disciplines.map((discipline) => (
              <div
                key={discipline.id}
                className={`${styles.disciplineCard} ${
                  selectedDiscipline === discipline.id ? styles.selected : ''
                }`}
                onClick={() => handleDisciplineClick(discipline.id)}
                style={{
                  borderColor: selectedDiscipline === discipline.id ? discipline.color : 'var(--ramka)',
                }}
              >
                <div className={styles.cardIcon} style={{ backgroundColor: discipline.color }}>
                  {discipline.icon}
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.disciplineName}>{discipline.name}</h3>
                  <p className={styles.disciplineTeacher}>
                    <span className={styles.teacherLabel}>Преподаватель:</span>
                    {discipline.teacher}
                  </p>
                  <div className={styles.cardFooter}>
                    <span className={styles.viewDetails}>Подробнее →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ИНФОРМАЦИЯ О ВЫБРАННОЙ ДИСЦИПЛИНЕ ===== */}
        {selectedDiscipline && (
          <div className={styles.selectedDisciplineInfo}>
            <h3>Информация о дисциплине</h3>
            {/* Здесь будет подробная информация */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainStudents;