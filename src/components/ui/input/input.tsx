import React from 'react';
import styles from './input.module.scss';

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'search';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  id,
  name,
  disabled = false,
}) => {
  return (
    <input
      type={type}
      className={`${styles.input} ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      id={id}
      name={name}
      disabled={disabled}
    />
  );
};

export default Input;