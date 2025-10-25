import React, { useId } from 'react';
import styles from './input.module.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  className = '',
  id,
  ...props
}) => {
  // useIdを使用してサーバー・クライアント間で一貫したIDを生成
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputClasses = [
    styles.input,
    styles[`input--${variant}`],
    error && styles['input--error'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.input__container}>
      {label && (
        <label htmlFor={inputId} className={styles.input__label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
      {error && (
        <span className={styles.input__error}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className={styles.input__helper}>
          {helperText}
        </span>
      )}
    </div>
  );
};
