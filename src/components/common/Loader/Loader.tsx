import React from 'react';
import styles from './Loader.module.scss';

const Loader: React.FC = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.stoneSpinner}></div>
      <p className={styles.loadingText}>Загрузка...</p>
    </div>
  );
};

export default Loader;