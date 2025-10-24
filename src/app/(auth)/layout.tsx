import React from 'react';
import styles from './layout.module.scss';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.auth}>
      <div className={styles.auth__container}>
        <div className={styles.auth__content}>
          {children}
        </div>
      </div>
    </div>
  );
}
