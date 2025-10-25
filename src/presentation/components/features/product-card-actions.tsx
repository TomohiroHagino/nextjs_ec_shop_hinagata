/**
 * 商品カード用カート追加ボタン（クライアントコンポーネント）
 * 
 * 役割:
 * - 商品一覧ページのカード内で直接カートに商品を追加
 * - クリックイベントの処理
 * 
 * クライアントコンポーネントである理由:
 * - onClick イベントハンドラー
 * - localStorage（トークン取得）
 * - API呼び出し
 * - alert（ユーザー通知）
 */
'use client';

import React, { useState } from 'react';
import { Button } from '@/presentation/components/ui';

interface ProductCardActionsProps {
  productId: string;
  productName: string;
  stock: number;
  isActive: boolean;
}

export function ProductCardActions({ productId, productName, stock, isActive }: ProductCardActionsProps) {
  const [adding, setAdding] = useState(false);

  /**
   * カート追加処理
   * 
   * 処理フロー:
   * 1. localStorageからトークンを取得
   * 2. トークンがない場合はログインを促す
   * 3. API経由でカートに商品を追加（数量1）
   * 4. 成功/失敗をユーザーに通知
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    // リンクのクリックイベントを防ぐ（カード全体がリンクになっているため）
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        window.location.href = '/login';
        return;
      }

      setAdding(true);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert(`${productName}をカートに追加しました`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'カートへの追加に失敗しました');
      }
    } catch (err) {
      console.error('カート追加エラー:', err);
      alert('エラーが発生しました');
    } finally {
      setAdding(false);
    }
  };

  /**
   * 詳細ページへの遷移
   */
  const handleViewDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/products/${productId}`;
  };

  return (
    <>
      {isActive && stock > 0 ? (
        <>
          <Button
            variant="primary"
            size="small"
            onClick={handleAddToCart}
            loading={adding}
            disabled={adding}
          >
            カートに追加
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={handleViewDetail}
          >
            詳細を見る
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="small"
          onClick={handleViewDetail}
        >
          詳細を見る
        </Button>
      )}
    </>
  );
}

