/**
 * 商品一覧ページ（サーバーコンポーネント）
 * 
 * サーバーコンポーネントである理由:
 * - 商品リストの取得はサーバーサイドで実行（高速、SEO対応）
 * - URLパラメータ（検索・フィルター）からサーバーサイドでデータ取得
 * - 検索エンジンに商品一覧を正しく伝達
 * 
 * パフォーマンス最適化:
 * - 初回表示が高速（クライアント側のfetchなし）
 * - ISR（Incremental Static Regeneration）でキャッシュ
 * 
 * SEO対策:
 * - 商品一覧が静的HTMLに含まれる
 * - クローラーがすべての商品を認識可能
 */
import React from 'react';
import Link from 'next/link';
import { ProductSearchFilter } from '@/presentation/components/features/product-search-filter';
import { ProductCardActions } from '@/presentation/components/features/product-card-actions';
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

interface PageProps {
  searchParams: Promise<{
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

/**
 * 商品一覧を取得（サーバーサイド）
 */
async function getProducts(searchParams: {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const params = new URLSearchParams({
      page: searchParams.page || '1',
      limit: '12',
    });

    if (searchParams.search) {
      params.append('search', searchParams.search);
    }
    if (searchParams.minPrice) {
      params.append('minPrice', searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      params.append('maxPrice', searchParams.maxPrice);
    }

    const response = await fetch(`${baseUrl}/api/products?${params}`, {
      // 30秒キャッシュ（商品情報は頻繁に変わる可能性がある）
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.error('商品一覧取得失敗:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('商品一覧取得エラー:', error);
    return [];
  }
}

/**
 * メタデータ生成（SEO対策）
 */
export async function generateMetadata({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  let title = '商品一覧 - ECショップ';
  if (resolvedParams.search) {
    title = `"${resolvedParams.search}"の検索結果 - ECショップ`;
  }

  return {
    title,
    description: 'ECショップの商品一覧ページです。お好みの商品を見つけてください。',
  };
}

/**
 * 商品一覧ページコンポーネント
 * 
 * サーバーコンポーネント:
 * - 商品リストの取得と表示
 * - SEO対応のHTML生成
 * 
 * クライアントコンポーネント（ProductSearchFilter）:
 * - 検索フィルターのインタラクション
 * - URLパラメータの更新
 */
export default async function ProductsPage({ searchParams }: PageProps) {
  // searchParamsを解決
  const resolvedParams = await searchParams;
  
  // サーバーサイドで商品一覧を取得
  const products = await getProducts(resolvedParams);

  return (
    <div className={styles.products}>
      <div className={styles.products__container}>
        <header className={styles.products__header}>
          <h1 className={styles.products__title}>商品一覧</h1>
          <p className={styles.products__subtitle}>
            全{products.length}件の商品
          </p>
        </header>

        {/* 検索フィルター（クライアントコンポーネント） */}
        <div className={styles.products__filters}>
          <ProductSearchFilter />
        </div>

        {/* 商品リスト */}
        <div className={styles.products__main}>
          {products.length === 0 ? (
            <div className={styles.products__empty}>
              <h3 className={styles.products__emptyTitle}>
                商品が見つかりませんでした
              </h3>
              <p className={styles.products__emptyDescription}>
                検索条件を変更してお試しください
              </p>
            </div>
          ) : (
            <div className={styles.products__grid}>
              {products.map((product) => (
                <div key={product.id} className={styles.products__card}>
                  {/* 商品画像 - リンクとして */}
                  <Link href={`/products/${product.id}`} className={styles.products__cardImage}>
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
                  </Link>

                  {/* 商品情報 */}
                  <div className={styles.products__cardContent}>
                    <Link href={`/products/${product.id}`}>
                      <h2 className={styles.products__cardTitle}>{product.name}</h2>
                    </Link>
                    <p className={styles.products__cardDescription}>
                      {product.description.length > 80
                        ? `${product.description.substring(0, 80)}...`
                        : product.description}
                    </p>
                    <div className={styles.products__cardPrice}>
                      ¥{product.price.toLocaleString()}
                    </div>
                    <div className={styles.products__cardStock}>
                      在庫: {product.stock > 0 ? `${product.stock}個` : '在庫切れ'}
                      {!product.isActive && ' (販売停止中)'}
                    </div>
                  </div>

                  {/* アクションボタン（クライアントコンポーネント） */}
                  <div className={styles.products__cardActions}>
                    <ProductCardActions
                      productId={product.id}
                      productName={product.name}
                      stock={product.stock}
                      isActive={product.isActive}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
