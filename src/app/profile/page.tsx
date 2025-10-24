'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button, Input } from '@/presentation/components/ui';
import styles from './page.module.scss';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('プロフィールの取得に失敗しました');
      }

      const data = await response.json();
      setProfile(data.data);
      setFormData({
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロフィールの更新に失敗しました');
      }

      const data = await response.json();
      setProfile(data.data);
      
      // Contextを使用してユーザー情報を更新（リアルタイム）
      updateUser({
        id: data.data.id,
        email: data.data.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setSuccessMessage('プロフィールを更新しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'パスワードの変更に失敗しました');
      }

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setSuccessMessage('パスワードを変更しました');
    } catch (err) {
      console.error('Password change error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ネットワークエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.profile__container}>
          <div className={styles.profile__loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.profile}>
        <div className={styles.profile__container}>
          <div className={styles.profile__error}>プロフィールの読み込みに失敗しました</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.profile__container}>
        <header className={styles.profile__header}>
          <h1 className={styles.profile__title}>プロフィール設定</h1>
          <p className={styles.profile__subtitle}>
            アカウント情報を編集できます
          </p>
        </header>

        {error && (
          <div className={styles.profile__error}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className={styles.profile__success}>
            {successMessage}
          </div>
        )}

        <div className={styles.profile__content}>
          {/* アカウント情報 */}
          <section className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>アカウント情報</h2>
            <div className={styles.profile__info}>
              <div className={styles.profile__infoItem}>
                <span className={styles.profile__infoLabel}>メールアドレス</span>
                <span className={styles.profile__infoValue}>{profile.email}</span>
              </div>
              <div className={styles.profile__infoItem}>
                <span className={styles.profile__infoLabel}>登録日</span>
                <span className={styles.profile__infoValue}>
                  {new Date(profile.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </section>

          {/* プロフィール編集 */}
          <section className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>プロフィール編集</h2>
            <form onSubmit={handleProfileUpdate} className={styles.profile__form}>
              <div className={styles.profile__formGroup}>
                <label htmlFor="firstName" className={styles.profile__label}>
                  姓
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.profile__formGroup}>
                <label htmlFor="lastName" className={styles.profile__label}>
                  名
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className={styles.profile__submitButton}
              >
                {saving ? '保存中...' : 'プロフィールを更新'}
              </Button>
            </form>
          </section>

          {/* パスワード変更 */}
          <section className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>パスワード変更</h2>
            <form onSubmit={handlePasswordChange} className={styles.profile__form}>
              <div className={styles.profile__formGroup}>
                <label htmlFor="currentPassword" className={styles.profile__label}>
                  現在のパスワード
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.profile__formGroup}>
                <label htmlFor="newPassword" className={styles.profile__label}>
                  新しいパスワード
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
              </div>

              <div className={styles.profile__formGroup}>
                <label htmlFor="confirmPassword" className={styles.profile__label}>
                  新しいパスワード（確認）
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className={styles.profile__submitButton}
              >
                {saving ? '変更中...' : 'パスワードを変更'}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

