'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/presentation/components/ui';
import styles from './page.module.scss';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(data.error || '登録に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.register}>
        <div className={styles.register__success}>
          <div className={styles.register__successIcon}>✓</div>
          <h1 className={styles.register__successTitle}>登録完了</h1>
          <p className={styles.register__successText}>
            アカウントが正常に作成されました。
            <br />
            ログインページに移動します...
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
          >
            ログインページへ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.register}>
      <div className={styles.register__header}>
        <h1 className={styles.register__title}>新規登録</h1>
        <p className={styles.register__subtitle}>
          アカウントを作成してショッピングを始めましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.register__form}>
        {error && (
          <div className={styles.register__error}>
            {error}
          </div>
        )}

        <div className={styles.register__field}>
          <label htmlFor="firstName" className={styles.register__label}>
            名
          </label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="太郎"
            required
            className={styles.register__input}
          />
        </div>

        <div className={styles.register__field}>
          <label htmlFor="lastName" className={styles.register__label}>
            姓
          </label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="山田"
            required
            className={styles.register__input}
          />
        </div>

        <div className={styles.register__field}>
          <label htmlFor="email" className={styles.register__label}>
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
            className={styles.register__input}
          />
        </div>

        <div className={styles.register__field}>
          <label htmlFor="password" className={styles.register__label}>
            パスワード
          </label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="6文字以上で入力"
            required
            className={styles.register__input}
          />
          <p className={styles.register__helpText}>
            パスワードは6文字以上で入力してください
          </p>
        </div>

        <div className={styles.register__field}>
          <label htmlFor="confirmPassword" className={styles.register__label}>
            パスワード（確認）
          </label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="パスワードを再入力"
            required
            className={styles.register__input}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          loading={loading}
          className={styles.register__submit}
        >
          アカウントを作成
        </Button>
      </form>

      <div className={styles.register__footer}>
        <p className={styles.register__footerText}>
          すでにアカウントをお持ちの方は
        </p>
        <a href="/login" className={styles.register__footerLink}>
          ログインはこちら
        </a>
      </div>

      <div className={styles.register__terms}>
        <p className={styles.register__termsText}>
          アカウントを作成することで、
          <a href="/terms" className={styles.register__termsLink}>
            利用規約
          </a>
          および
          <a href="/privacy" className={styles.register__termsLink}>
            プライバシーポリシー
          </a>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
