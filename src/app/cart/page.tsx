'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/presentation/components/ui';
import styles from './page.module.scss';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        return;
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('カートの取得に失敗しました');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update',
          itemId,
          quantity,
        }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('数量更新エラー:', err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/cart/update?itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('アイテム削除エラー:', err);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'clear',
        }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('カートクリアエラー:', err);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        return;
      }

      if (!cart || cart.items.length === 0) {
        setError('カートが空です');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('注文の作成に失敗しました');
      }

      const data = await response.json();
      
      // 注文完了ページにリダイレクト
      window.location.href = `/orders/${data.data.id}`;
    } catch (err) {
      console.error('注文作成エラー:', err);
      setError(err instanceof Error ? err.message : '注文の作成に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className={styles.cart}>
        <div className={styles.cart__container}>
          <div className={styles.cart__loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cart}>
        <div className={styles.cart__container}>
          <div className={styles.cart__error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <div className={styles.cart__container}>
        <header className={styles.cart__header}>
          <h1 className={styles.cart__title}>ショッピングカート</h1>
          {cart && cart.items.length > 0 && (
            <p className={styles.cart__subtitle}>
              {cart.itemCount}個の商品
            </p>
          )}
        </header>

        <main className={styles.cart__main}>
          {!cart || cart.items.length === 0 ? (
            <div className={styles.cart__empty}>
              <h2 className={styles.cart__emptyTitle}>カートが空です</h2>
              <p className={styles.cart__emptyDescription}>
                商品を追加してショッピングを始めましょう
              </p>
              <Button 
                variant="primary" 
                size="large"
                onClick={() => window.location.href = '/products'}
              >
                商品を見る
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.cart__items}>
                {cart.items.map((item) => (
                  <div key={item.id} className={styles.cart__item}>
                    <div className={styles.cart__itemImage}>
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className={styles.cart__itemImg}
                        />
                      ) : (
                        <div className={styles.cart__itemPlaceholder}>
                          画像なし
                        </div>
                      )}
                    </div>

                    <div className={styles.cart__itemInfo}>
                      <h3 className={styles.cart__itemName}>
                        {item.product.name}
                      </h3>
                      <p className={styles.cart__itemPrice}>
                        ¥{item.product.price.toLocaleString()}
                      </p>
                    </div>

                    <div className={styles.cart__itemQuantity}>
                      <label className={styles.cart__quantityLabel}>数量:</label>
                      <div className={styles.cart__quantityControls}>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className={styles.cart__quantityValue}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className={styles.cart__itemSubtotal}>
                      <p className={styles.cart__subtotalLabel}>小計:</p>
                      <p className={styles.cart__subtotalValue}>
                        ¥{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className={styles.cart__itemActions}>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => removeItem(item.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cart__summary}>
                <div className={styles.cart__summaryContent}>
                  <div className={styles.cart__summaryRow}>
                    <span className={styles.cart__summaryLabel}>合計:</span>
                    <span className={styles.cart__summaryValue}>
                      ¥{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={styles.cart__actions}>
                  <Button
                    variant="outline"
                    size="large"
                    onClick={clearCart}
                  >
                    カートをクリア
                  </Button>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={createOrder}
                  >
                    注文を確定する
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
