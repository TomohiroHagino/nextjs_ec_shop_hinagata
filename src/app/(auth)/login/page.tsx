'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/presentation/components/ui';
import styles from './page.module.scss';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // トークンをローカルストレージに保存
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // ホームページにリダイレクト
        window.location.href = '/';
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__header}>
        <h1 className={styles.login__title}>ログイン</h1>
        <p className={styles.login__subtitle}>
          アカウントにログインしてショッピングを始めましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.login__form}>
        {error && (
          <div className={`${styles.login__error} error-message`}>
            {error}
          </div>
        )}

        <div className={styles.login__field}>
          <label htmlFor="email" className={styles.login__label}>
            メールアドレス
          </label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
            className={styles.login__input}
          />
        </div>

        <div className={styles.login__field}>
          <label htmlFor="password" className={styles.login__label}>
            パスワード
          </label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="パスワードを入力"
            required
            className={styles.login__input}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          loading={loading}
          className={styles.login__submit}
        >
          ログイン
        </Button>
      </form>

      <div className={styles.login__footer}>
        <p className={styles.login__footerText}>
          アカウントをお持ちでない方は
        </p>
        <a href="/register" className={styles.login__footerLink}>
          新規登録はこちら
        </a>
      </div>

      <div className={styles.login__demo}>
        <h3 className={styles.login__demoTitle}>デモアカウント</h3>
        <p className={styles.login__demoText}>
          テスト用のアカウントでログインできます
        </p>
        <div className={styles.login__demoAccount}>
          <p><strong>メール:</strong> demo@example.com</p>
          <p><strong>パスワード:</strong> password123</p>
        </div>
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            setFormData({
              email: 'demo@example.com',
              password: 'password123',
            });
          }}
        >
          デモアカウントを入力
        </Button>
      </div>
    </div>
  );
}
