import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';
import { setAuth } from '../../../utils/auth';

// Моковые пользователи
const USERS = {
  '1': { id: '1', fullName: 'Иван Иванов', role: 'student' as const, groupId: 1 },
  '2': { id: '2', fullName: 'Пётр Петров', role: 'teacher' as const },
};

const Login: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === '1' && password === '1') {
      const user = USERS['1'];
      setAuth(user, 'fake-token');
      navigate('/student');
    } else if (login === '2' && password === '2') {
      const user = USERS['2'];
      setAuth(user, 'fake-token');
      navigate('/teacher');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1 className={styles.title}>Посещаемость студентов</h1>
        {error && <div className={styles.error}>{error}</div>}
        <p className={styles.comment}>Войдите в систему для отметки или просмотра</p>
        <form onSubmit={handleSubmit} className={styles.fieldsContainer}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Логин</label>
            <input
              type="text"
              className={styles.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Пароль</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>
          <button type="submit" className={styles.button}>Войти</button>
        </form>
      </div>
    </div>
  );
};

export default Login;