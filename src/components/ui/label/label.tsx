import React from 'react';
import styles from './label.module.scss';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor, className = '' }) => {
  return (
    <label className={`${styles.label} ${className}`} htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export default Label;