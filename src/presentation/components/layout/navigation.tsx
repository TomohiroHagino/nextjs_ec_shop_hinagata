'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import styles from './navigation.module.scss';

export default function Navigation() {
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.navigation__container}>
        <Link href="/" className={styles.navigation__logo}>
          ECショップ
        </Link>
        
        <div className={styles.navigation__menu}>
          <Link href="/products" className={styles.navigation__link}>
            商品一覧
          </Link>
          <Link href="/cart" className={styles.navigation__link}>
            カート
          </Link>
          <Link href="/orders" className={styles.navigation__link}>
            注文履歴
          </Link>
        </div>
        
        <div className={styles.navigation__auth}>
          {isLoggedIn ? (
            <>
              <span className={styles.navigation__user}>
                {user?.firstName}さん
              </span>
              <Link href="/profile" className={styles.navigation__link}>
                プロフィール
              </Link>
              <button 
                onClick={handleLogout}
                className={styles.navigation__link}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navigation__link}>
                ログイン
              </Link>
              <Link href="/register" className={styles.navigation__link}>
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

