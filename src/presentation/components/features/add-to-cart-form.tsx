/**
 * カート追加フォームコンポーネント
 * 
 * 役割:
 * - 商品詳細ページでカートに商品を追加する機能を提供
 * - クライアントサイドでのインタラクションを担当
 * 
 * クライアントコンポーネントである理由:
 * - useState（数量管理）
 * - イベントハンドラー（ボタンクリック）
 * - localStorage（トークン取得）
 * - alert（ユーザー通知）
 */
'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/presentation/components/ui';
import styles from './add-to-cart-form.module.scss';

interface AddToCartFormProps {
  productId: string;
  productName: string;
  maxStock: number;
}

export function AddToCartForm({ productId, productName, maxStock }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  /**
   * 数量変更ハンドラー
   * 
   * 制約:
   * - 最小値: 1
   * - 最大値: 在庫数
   */
  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  /**
   * カート追加処理
   * 
   * 処理フロー:
   * 1. localStorageからトークンを取得
   * 2. トークンがない場合はログインを促す
   * 3. API経由でカートに商品を追加
   * 4. 成功/失敗をユーザーに通知
   */
  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

      setAddingToCart(true);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (response.ok) {
        alert(`${productName}をカートに追加しました`);
        setQuantity(1); // 数量をリセット
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'カートへの追加に失敗しました');
      }
    } catch (err) {
      console.error('カート追加エラー:', err);
      alert('エラーが発生しました');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className={styles.form}>
      {/* 数量選択 */}
      <div className={styles.form__quantity}>
        <label className={styles.form__quantityLabel}>数量:</label>
        <div className={styles.form__quantityControls}>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            type="number"
            name="quantity"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
            max={maxStock}
            className={styles.form__quantityInput}
          />
          <Button
            variant="outline"
            size="small"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxStock}
          >
            +
          </Button>
        </div>
      </div>

      {/* アクションボタン */}
      <div className={styles.form__actions}>
        <Button
          variant="primary"
          size="large"
          onClick={addToCart}
          loading={addingToCart}
          disabled={quantity > maxStock}
        >
          カートに追加
        </Button>
        <Button
          variant="outline"
          size="large"
          onClick={() => window.location.href = '/cart'}
        >
          カートを見る
        </Button>
      </div>
    </div>
  );
}

