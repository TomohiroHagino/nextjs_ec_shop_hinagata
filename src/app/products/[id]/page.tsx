/**
 * 商品詳細ページ（サーバーコンポーネント）
 * 
 * サーバーコンポーネントである理由:
 * - 商品情報の取得はサーバーサイドで実行（高速、SEO対応）
 * - 初回表示が高速（クライアント側のJavaScriptなし）
 * - 検索エンジンに商品情報を正しく伝達
 * 
 * パフォーマンス最適化:
 * - データフェッチがサーバー側で完了してからHTMLを送信
 * - クライアント側のローディング状態不要
 * - Hydration前に完全な内容を表示
 * 
 * SEO対策:
 * - metadataで商品名と説明を設定
 * - 商品情報が静的HTMLに含まれる
 * - OGPタグで SNS シェア対応
 */
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartForm } from '@/presentation/components/features/add-to-cart-form';
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
  params: Promise<{ id: string }>;
}

/**
 * 商品情報を取得（サーバーサイド）
 * 
 * Next.js 15では、APIルートを直接呼び出すのではなく、
 * サービス層を直接使用することも可能ですが、
 * 現状のアーキテクチャに合わせてAPI経由で取得します。
 */
async function getProduct(productId: string): Promise<Product | null> {
  try {
    // サーバー側なので絶対URLが必要
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/${productId}`, {
      // ISR（Incremental Static Regeneration）で60秒キャッシュ
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('商品取得エラー:', error);
    return null;
  }
}

/**
 * メタデータ生成（SEO対策）
 * 
 * 動的にページタイトルと説明を設定
 */
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return {
      title: '商品が見つかりません',
    };
  }

  return {
    title: `${product.name} - ECショップ`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

/**
 * 商品詳細ページコンポーネント
 * 
 * サーバーコンポーネント:
 * - 商品情報の取得とレンダリング
 * - 静的な商品詳細の表示
 * 
 * クライアントコンポーネント（AddToCartForm）:
 * - カートへの追加機能
 * - 数量選択のインタラクション
 */
export default async function ProductDetailPage({ params }: PageProps) {
  // paramsを解決
  const resolvedParams = await params;
  
  // サーバーサイドで商品情報を取得
  const product = await getProduct(resolvedParams.id);

  // 商品が見つからない場合は404ページを表示
  if (!product) {
    notFound();
  }

  return (
    <div className={styles.product}>
      <div className={styles.product__container}>
        {/* パンくずリスト */}
        <div className={styles.product__breadcrumb}>
          <Link href="/products" className={styles.product__breadcrumbLink}>
            商品一覧
          </Link>
          <span className={styles.product__breadcrumbSeparator}>/</span>
          <span className={styles.product__breadcrumbCurrent}>
            {product.name}
          </span>
        </div>

        {/* メイン商品情報 */}
        <div className={styles.product__main}>
          {/* 商品画像 */}
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

          {/* 商品詳細情報 */}
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

            {/* カート追加フォーム（クライアントコンポーネント） */}
            {product.isActive && product.stock > 0 && (
              <div className={styles.product__purchase}>
                <AddToCartForm
                  productId={product.id}
                  productName={product.name}
                  maxStock={product.stock}
                />
              </div>
            )}

            {/* 販売停止中メッセージ */}
            {!product.isActive && (
              <div className={styles.product__unavailable}>
                <p className={styles.product__unavailableText}>
                  この商品は現在販売停止中です
                </p>
              </div>
            )}

            {/* 在庫切れメッセージ */}
            {product.stock === 0 && (
              <div className={styles.product__outOfStock}>
                <p className={styles.product__outOfStockText}>
                  在庫切れです
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 商品詳細テーブル */}
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
