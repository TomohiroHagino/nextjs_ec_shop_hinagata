'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/presentation/components/ui';
import styles from './page.module.scss';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      fetchProduct(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        throw new Error('商品の取得に失敗しました');
      }

      const data = await response.json();
      setProduct(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

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
          productId: product?.id,
          quantity,
        }),
      });

      if (response.ok) {
        alert('カートに追加しました');
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

  const handleQuantityChange = (value: number) => {
    if (product && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className={styles.product}>
        <div className={styles.product__container}>
          <div className={styles.product__loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.product}>
        <div className={styles.product__container}>
          <div className={styles.product__error}>
            {error || '商品が見つかりません'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.product}>
      <div className={styles.product__container}>
        <div className={styles.product__breadcrumb}>
          <Link href="/products" className={styles.product__breadcrumbLink}>
            商品一覧
          </Link>
          <span className={styles.product__breadcrumbSeparator}>/</span>
          <span className={styles.product__breadcrumbCurrent}>
            {product.name}
          </span>
        </div>

        <div className={styles.product__main}>
          <div className={styles.product__imageSection}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className={styles.product__image}
              />
            ) : (
              <div className={styles.product__imagePlaceholder}>
                画像なし
              </div>
            )}
          </div>

          <div className={styles.product__infoSection}>
            <header className={styles.product__header}>
              <h1 className={styles.product__title}>{product.name}</h1>
              <div className={styles.product__price}>
                ¥{product.price.toLocaleString()}
              </div>
            </header>

            <div className={styles.product__description}>
              <h2 className={styles.product__descriptionTitle}>商品説明</h2>
              <p className={styles.product__descriptionText}>
                {product.description}
              </p>
            </div>

            <div className={styles.product__stock}>
              <span className={styles.product__stockLabel}>在庫:</span>
              <span className={styles.product__stockValue}>
                {product.stock > 0 ? `${product.stock}個` : '在庫切れ'}
              </span>
            </div>

            {product.isActive && product.stock > 0 && (
              <div className={styles.product__purchase}>
                <div className={styles.product__quantity}>
                  <label className={styles.product__quantityLabel}>数量:</label>
                  <div className={styles.product__quantityControls}>
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
                      max={product.stock}
                      className={styles.product__quantityInput}
                    />
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className={styles.product__actions}>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={addToCart}
                    loading={addingToCart}
                    disabled={quantity > product.stock}
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
            )}

            {!product.isActive && (
              <div className={styles.product__unavailable}>
                <p className={styles.product__unavailableText}>
                  この商品は現在販売停止中です
                </p>
              </div>
            )}

            {product.stock === 0 && (
              <div className={styles.product__outOfStock}>
                <p className={styles.product__outOfStockText}>
                  在庫切れです
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.product__details}>
          <div className={styles.product__detailsSection}>
            <h2 className={styles.product__detailsTitle}>商品詳細</h2>
            <div className={styles.product__detailsContent}>
              <div className={styles.product__detailRow}>
                <span className={styles.product__detailLabel}>商品ID:</span>
                <span className={styles.product__detailValue}>{product.id}</span>
              </div>
              <div className={styles.product__detailRow}>
                <span className={styles.product__detailLabel}>価格:</span>
                <span className={styles.product__detailValue}>
                  ¥{product.price.toLocaleString()}
                </span>
              </div>
              <div className={styles.product__detailRow}>
                <span className={styles.product__detailLabel}>在庫数:</span>
                <span className={styles.product__detailValue}>{product.stock}個</span>
              </div>
              <div className={styles.product__detailRow}>
                <span className={styles.product__detailLabel}>ステータス:</span>
                <span className={styles.product__detailValue}>
                  {product.isActive ? '販売中' : '販売停止'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
