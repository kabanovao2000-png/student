import React from 'react';
import styles from './LipShapka.module.scss';
import logo from '../../../assets/logo.png';

interface LipShapkaProps {
  /** ФИО пользователя */
  userName?: string;
  /** Функция выхода из аккаунта */
  onLogout?: () => void;
  /** Дополнительный контент справа (опционально) */
  rightContent?: React.ReactNode;
}

const LipShapka: React.FC<LipShapkaProps> = ({
  userName = 'Иванов Иван Иванович',
  onLogout,
  rightContent,
}) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Стандартный выход по умолчанию
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
  };

  return (
    <header className={styles.lipShapka}>
      <div className={styles.container}>
        {/* ===== ЛЕВАЯ ЧАСТЬ: ФИО ===== */}
        <div className={styles.leftSection}>
          <div className={styles.userInfo}>
            <span className={styles.userIcon}>👤</span>
            <span className={styles.userName}>{userName}</span>
          </div>
        </div>

        {/* ===== ЦЕНТРАЛЬНАЯ ЧАСТЬ: ЛОГОТИП И НАЗВАНИЕ ===== */}
        <div className={styles.centerSection}>
          <img src={logo} alt="Логотип" className={styles.logo} />
          <span className={styles.title}>Посещаемость</span>
        </div>

        {/* ===== ПРАВАЯ ЧАСТЬ: КНОПКА ВЫХОДА ===== */}
        <div className={styles.rightSection}>
          {rightContent}
          <button className={styles.logoutButton} onClick={handleLogout}>
            <span className={styles.logoutIcon}>🚪</span>
            <span className={styles.logoutText}>Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default LipShapka;