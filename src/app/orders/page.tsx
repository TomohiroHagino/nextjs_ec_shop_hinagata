'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui';
import styles from './page.module.scss';

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        return;
      }

      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('注文履歴の取得に失敗しました');
      }

      const data = await response.json();
      setOrders(data.data);
      
      // 実際の実装では、APIから総ページ数を取得
      setTotalPages(Math.ceil(data.data.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
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

  const cancelOrder = async (orderId: string) => {
    if (!confirm('この注文をキャンセルしますか？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('注文をキャンセルしました');
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'キャンセルに失敗しました');
      }
    } catch (err) {
      console.error('キャンセルエラー:', err);
      alert('エラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div className={styles.orders}>
        <div className={styles.orders__container}>
          <div className={styles.orders__loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.orders}>
        <div className={styles.orders__container}>
          <div className={styles.orders__error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orders}>
      <div className={styles.orders__container}>
        <header className={styles.orders__header}>
          <h1 className={styles.orders__title}>注文履歴</h1>
          <p className={styles.orders__subtitle}>
            {orders.length}件の注文が見つかりました
          </p>
        </header>

        <div className={styles.orders__filters}>
          <div className={styles.orders__statusFilter}>
            <label className={styles.orders__filterLabel}>ステータス:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.orders__filterSelect}
            >
              <option value="">すべて</option>
              <option value="PENDING">注文確認中</option>
              <option value="CONFIRMED">注文確定</option>
              <option value="SHIPPED">配送中</option>
              <option value="DELIVERED">配送完了</option>
              <option value="CANCELLED">キャンセル</option>
            </select>
          </div>
        </div>

        <main className={styles.orders__main}>
          {orders.length === 0 ? (
            <div className={styles.orders__empty}>
              <h2 className={styles.orders__emptyTitle}>注文履歴がありません</h2>
              <p className={styles.orders__emptyDescription}>
                商品を購入すると、ここに注文履歴が表示されます
              </p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/products'}
              >
                商品を見る
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.orders__list}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orders__item}>
                    <div className={styles.orders__itemHeader}>
                      <div className={styles.orders__itemInfo}>
                        <h3 className={styles.orders__itemTitle}>
                          注文番号: {order.id}
                        </h3>
                        <div className={styles.orders__itemMeta}>
                          <span className={styles.orders__itemDate}>
                            {formatDate(order.createdAt)}
                          </span>
                          <span className={styles.orders__itemCount}>
                            {order.itemCount}個の商品
                          </span>
                        </div>
                      </div>
                      <div className={styles.orders__itemStatus}>
                        <span 
                          className={styles.orders__statusBadge}
                          style={{ backgroundColor: statusColors[order.status] }}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className={styles.orders__itemContent}>
                      <div className={styles.orders__itemDetails}>
                        <div className={styles.orders__itemDetail}>
                          <span className={styles.orders__itemDetailLabel}>合計金額:</span>
                          <span className={styles.orders__itemDetailValue}>
                            ¥{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.orders__itemDetail}>
                          <span className={styles.orders__itemDetailLabel}>更新日時:</span>
                          <span className={styles.orders__itemDetailValue}>
                            {formatDate(order.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.orders__itemActions}>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => window.location.href = `/orders/${order.id}`}
                        >
                          詳細を見る
                        </Button>
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => cancelOrder(order.id)}
                          >
                            キャンセル
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.orders__pagination}>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  <span className={styles.orders__paginationInfo}>
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
