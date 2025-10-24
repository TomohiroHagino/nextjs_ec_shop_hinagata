'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/presentation/components/ui';
import styles from './page.module.scss';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  PENDING: '注文確認中',
  CONFIRMED: '注文確定',
  SHIPPED: '配送中',
  DELIVERED: '配送完了',
  CANCELLED: 'キャンセル',
};

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

export default function OrderDetailPage({ params }: any) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Next.js 15: paramsがPromiseになったので解決する
    const resolveParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        return;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('注文の取得に失敗しました');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm('この注文をキャンセルしますか？')) {
      return;
    }

    if (!orderId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setCancelling(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('注文をキャンセルしました');
        fetchOrder();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'キャンセルに失敗しました');
      }
    } catch (err) {
      console.error('キャンセルエラー:', err);
      alert('エラーが発生しました');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.order}>
        <div className={styles.order__container}>
          <div className={styles.order__loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.order}>
        <div className={styles.order__container}>
          <div className={styles.order__error}>
            {error || '注文が見つかりません'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.order}>
      <div className={styles.order__container}>
        <div className={styles.order__breadcrumb}>
          <Link href="/orders" className={styles.order__breadcrumbLink}>
            注文履歴
          </Link>
          <span className={styles.order__breadcrumbSeparator}>/</span>
          <span className={styles.order__breadcrumbCurrent}>
            注文詳細
          </span>
        </div>

        <header className={styles.order__header}>
          <div className={styles.order__headerContent}>
            <h1 className={styles.order__title}>注文詳細</h1>
            <div className={styles.order__status}>
              <span 
                className={styles.order__statusBadge}
                style={{ backgroundColor: statusColors[order.status] }}
              >
                {statusLabels[order.status]}
              </span>
            </div>
          </div>
          <div className={styles.order__orderId}>
            注文番号: {order.id}
          </div>
        </header>

        <div className={styles.order__main}>
          <div className={styles.order__info}>
            <div className={styles.order__infoSection}>
              <h2 className={styles.order__infoTitle}>注文情報</h2>
              <div className={styles.order__infoContent}>
                <div className={styles.order__infoRow}>
                  <span className={styles.order__infoLabel}>注文日時:</span>
                  <span className={styles.order__infoValue}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className={styles.order__infoRow}>
                  <span className={styles.order__infoLabel}>更新日時:</span>
                  <span className={styles.order__infoValue}>
                    {formatDate(order.updatedAt)}
                  </span>
                </div>
                <div className={styles.order__infoRow}>
                  <span className={styles.order__infoLabel}>商品数:</span>
                  <span className={styles.order__infoValue}>
                    {order.itemCount}個
                  </span>
                </div>
                <div className={styles.order__infoRow}>
                  <span className={styles.order__infoLabel}>合計金額:</span>
                  <span className={styles.order__infoValue}>
                    ¥{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <div className={styles.order__actions}>
                <Button
                  variant="danger"
                  size="large"
                  onClick={cancelOrder}
                  loading={cancelling}
                >
                  注文をキャンセル
                </Button>
              </div>
            )}
          </div>

          <div className={styles.order__items}>
            <h2 className={styles.order__itemsTitle}>注文商品</h2>
            <div className={styles.order__itemsList}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.order__item}>
                  <div className={styles.order__itemImage}>
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className={styles.order__itemImg}
                      />
                    ) : (
                      <div className={styles.order__itemPlaceholder}>
                        画像なし
                      </div>
                    )}
                  </div>

                  <div className={styles.order__itemInfo}>
                    <h3 className={styles.order__itemName}>
                      {item.product.name}
                    </h3>
                    <div className={styles.order__itemDetails}>
                      <span className={styles.order__itemPrice}>
                        ¥{item.price.toLocaleString()}
                      </span>
                      <span className={styles.order__itemQuantity}>
                        数量: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className={styles.order__itemSubtotal}>
                    <span className={styles.order__subtotalLabel}>小計:</span>
                    <span className={styles.order__subtotalValue}>
                      ¥{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.order__summary}>
          <div className={styles.order__summaryContent}>
            <div className={styles.order__summaryRow}>
              <span className={styles.order__summaryLabel}>合計金額:</span>
              <span className={styles.order__summaryValue}>
                ¥{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
