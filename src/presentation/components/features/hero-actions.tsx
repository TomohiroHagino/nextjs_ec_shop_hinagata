/**
 * ヒーローアクションボタンコンポーネント（クライアントコンポーネント）
 * 
 * 役割:
 * - トップページのヒーローセクションのアクションボタン
 * - ページ遷移のインタラクション
 * 
 * クライアントコンポーネントである理由:
 * - useRouterによるクライアントサイドナビゲーション
 * - onClickイベントハンドラー
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui';
import styles from './hero-actions.module.scss';

export function HeroActions() {
  const router = useRouter();

  return (
    <div className={styles.actions}>
      <Button 
        size="large" 
        variant="primary"
        onClick={() => router.push('/products')}
      >
        商品を見る
      </Button>
      <Button 
        size="large" 
        variant="outline"
        onClick={() => router.push('/register')}
      >
        会員登録
      </Button>
    </div>
  );
}

