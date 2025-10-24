'use client';

import React, { useState, useEffect } from 'react';
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPriceDisplay, setMinPriceDisplay] = useState('');
  const [maxPriceDisplay, setMaxPriceDisplay] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (minPrice) {
        params.append('minPrice', minPrice);
      }
      if (maxPrice) {
        params.append('maxPrice', maxPrice);
      }

      const response = await fetch(`/api/products?${params}`);

      if (!response.ok) {
        throw new Error('商品の取得に失敗しました');
      }

      const data = await response.json();
      setProducts(data.data);
      
      // 実際の実装では、APIから総ページ数を取得
      setTotalPages(Math.ceil(data.data.length / 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setMinPriceDisplay('');
    setMaxPriceDisplay('');
    setCurrentPage(1);
  };

  const formatPriceInput = (value: string): string => {
    // 数字以外を削除
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    // カンマ区切りでフォーマット
    return parseInt(numericValue, 10).toLocaleString();
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setMinPrice(numericValue);
    setMinPriceDisplay(formatPriceInput(value));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setMaxPrice(numericValue);
    setMaxPriceDisplay(formatPriceInput(value));
  };

  const addToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ログインが必要です');
        return;
      }

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
        alert('カートに追加しました');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'カートへの追加に失敗しました');
      }
    } catch (err) {
      console.error('カート追加エラー:', err);
      alert('エラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div className={styles.products}>
        <div className={styles.products__container}>
          <div className={styles.products__loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.products}>
        <div className={styles.products__container}>
          <div className={styles.products__error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.products}>
      <div className={styles.products__container}>
        <header className={styles.products__header}>
          <h1 className={styles.products__title}>商品一覧</h1>
          <p className={styles.products__subtitle}>
            {products.length}件の商品が見つかりました
          </p>
        </header>

        <div className={styles.products__filters}>
          <form onSubmit={handleSearch} className={styles.products__searchForm}>
            <div className={styles.products__searchInput}>
              <Input
                type="text"
                placeholder="商品名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.products__searchField}
              />
              <Button type="submit" variant="primary">
                検索
              </Button>
            </div>
          </form>

          <div className={styles.products__priceFilters}>
            <div className={styles.products__priceInput}>
              <Input
                type="text"
                placeholder="最低価格"
                value={minPriceDisplay}
                onChange={handleMinPriceChange}
                className={styles.products__priceField}
              />
              <span className={styles.products__priceSeparator}>〜</span>
              <Input
                type="text"
                placeholder="最高価格"
                value={maxPriceDisplay}
                onChange={handleMaxPriceChange}
                className={styles.products__priceField}
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              フィルターをクリア
            </Button>
          </div>
        </div>

        <main className={styles.products__main}>
          {products.length === 0 ? (
            <div className={styles.products__empty}>
              <h2 className={styles.products__emptyTitle}>商品が見つかりません</h2>
              <p className={styles.products__emptyDescription}>
                検索条件を変更して再度お試しください
              </p>
              <Button variant="primary" onClick={clearFilters}>
                フィルターをクリア
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.products__grid}>
                {products.map((product) => (
                  <a
                    key={product.id} 
                    href={`/products/${product.id}`}
                    className={`${styles.products__card} product-card`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className={styles.products__cardImage}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className={styles.products__cardImg}
                        />
                      ) : (
                        <div className={styles.products__cardPlaceholder}>
                          画像なし
                        </div>
                      )}
                    </div>

                    <div className={styles.products__cardContent}>
                      <h3 className={styles.products__cardTitle}>
                        {product.name}
                      </h3>
                      <p className={styles.products__cardDescription}>
                        {product.description.length > 100 
                          ? `${product.description.substring(0, 100)}...`
                          : product.description
                        }
                      </p>
                      <div className={styles.products__cardPrice}>
                        ¥{product.price.toLocaleString()}
                      </div>
                      <div className={styles.products__cardStock}>
                        在庫: {product.stock > 0 ? `${product.stock}個` : '在庫切れ'}
                      </div>
                    </div>

                    <div className={styles.products__cardActions}>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/products/${product.id}`;
                        }}
                        className="product-detail-link"
                      >
                        詳細を見る
                      </Button>
                      {product.isActive && product.stock > 0 && (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product.id);
                          }}
                        >
                          カートに追加
                        </Button>
                      )}
                    </div>
                  </a>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.products__pagination}>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  <span className={styles.products__paginationInfo}>
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
