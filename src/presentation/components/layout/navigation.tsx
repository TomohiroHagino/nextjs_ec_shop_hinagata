'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './navigation.module.scss';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && userData !== 'undefined') {
      try {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        // 不正なデータをクリア
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
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
                こんにちは、{user?.firstName}さん
              </span>
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

