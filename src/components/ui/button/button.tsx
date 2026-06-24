import React from 'react';
import styles from './button.module.scss';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type = 'submit',
  onClick,
  children,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;