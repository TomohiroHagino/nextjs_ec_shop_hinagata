/**
 * トップページ（サーバーコンポーネント）
 * 
 * 動作モード:
 * - フルスタックモード: ECショップのトップページを表示
 * - APIモード: API情報ページを表示
 * 
 * サーバーコンポーネントである理由:
 * - 静的コンテンツ中心（テキスト、見出し）
 * - SEOが重要（ランディングページ）
 * - 初回表示の高速化
 * - サーバーサイドで商品一覧を取得
 * 
 * パフォーマンス最適化:
 * - サーバーサイドで完全なHTMLを生成
 * - クライアント側のJavaScriptを最小化
 * - Hydration前に完全な内容を表示
 * 
 * SEO対策:
 * - ページタイトルと説明を静的HTMLに含める
 * - 検索エンジンにサイトの概要を伝える
 */
import React from 'react';
import Link from 'next/link';
import { HeroActions } from '@/presentation/components/features/hero-actions';
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

/**
 * 商品一覧を取得（サーバーサイド）
 * トップページでは最新6件の商品を表示
 */
async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=6`, {
      // 30秒キャッシュ
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
 * メタデータ設定（SEO対策）
 */
export const metadata = {
  title: 'ECショップ - 高品質な商品をお手頃な価格で',
  description: 'ECショップは高品質な商品をお手頃な価格でお届けするオンラインショップです。新商品が続々入荷中！',
  openGraph: {
    title: 'ECショップ',
    description: '高品質な商品をお手頃な価格でお届けします',
  },
};

/**
 * トップページコンポーネント
 * 
 * 動作モード:
 * - フルスタックモード: ECショップのトップページ
 * - APIモード: API情報ページ
 * 
 * サーバーコンポーネント:
 * - ページの静的コンテンツ（見出し、説明文、特徴リスト）
 * - 商品一覧の取得と表示
 * 
 * クライアントコンポーネント（HeroActions、ProductCardActions）:
 * - アクションボタンのクリックハンドリング
 * - ページ遷移処理
 */
export default async function HomePage() {
  // APIモードかどうかを判定
  const isApiOnly = process.env.API_ONLY === 'true';

  // APIモードの場合はAPI情報ページを表示
  if (isApiOnly) {
    return (
      <div className={styles.apiMode}>
        <div className={styles.apiMode__container}>
          <header className={styles.apiMode__header}>
            <div className={styles.apiMode__badge}>API Mode</div>
            <h1 className={styles.apiMode__title}>
              ECショップ API
            </h1>
            <p className={styles.apiMode__version}>Version 1.0.0</p>
            <p className={styles.apiMode__description}>
              このサーバーはAPIモードで動作しています。<br />
              RESTful APIエンドポイントのみを提供します。
            </p>
          </header>

          <main className={styles.apiMode__main}>
            {/* クイックスタート */}
            <section className={styles.apiMode__section}>
              <h2 className={styles.apiMode__sectionTitle}>
                🚀 クイックスタート
              </h2>
              <div className={styles.apiMode__code}>
                <pre>
{`# API一覧を取得
curl http://localhost:3000/api

# ログイン
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "demo@example.com", "password": "password123"}'

# 商品一覧を取得
curl http://localhost:3000/api/products`}
                </pre>
              </div>
            </section>

            {/* エンドポイント一覧 */}
            <section className={styles.apiMode__section}>
              <h2 className={styles.apiMode__sectionTitle}>
                📡 利用可能なエンドポイント
              </h2>
              
              <div className={styles.apiMode__endpoints}>
                {/* 認証 */}
                <div className={styles.apiMode__endpointGroup}>
                  <h3 className={styles.apiMode__groupTitle}>認証 (Authentication)</h3>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="POST">POST</span>
                    <code>/api/auth/login</code>
                    <span className={styles.apiMode__desc}>ログイン</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="POST">POST</span>
                    <code>/api/auth/register</code>
                    <span className={styles.apiMode__desc}>新規登録</span>
                  </div>
                </div>

                {/* 商品 */}
                <div className={styles.apiMode__endpointGroup}>
                  <h3 className={styles.apiMode__groupTitle}>商品 (Products)</h3>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="GET">GET</span>
                    <code>/api/products</code>
                    <span className={styles.apiMode__desc}>商品一覧取得</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="GET">GET</span>
                    <code>/api/products/[id]</code>
                    <span className={styles.apiMode__desc}>商品詳細取得</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="POST">POST</span>
                    <code>/api/products</code>
                    <span className={styles.apiMode__desc}>商品作成（管理者のみ）</span>
                  </div>
                </div>

                {/* カート */}
                <div className={styles.apiMode__endpointGroup}>
                  <h3 className={styles.apiMode__groupTitle}>カート (Cart)</h3>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="GET">GET</span>
                    <code>/api/cart</code>
                    <span className={styles.apiMode__desc}>カート取得</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="POST">POST</span>
                    <code>/api/cart</code>
                    <span className={styles.apiMode__desc}>カートに追加</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="PUT">PUT</span>
                    <code>/api/cart/update</code>
                    <span className={styles.apiMode__desc}>カートアイテム更新</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="DELETE">DELETE</span>
                    <code>/api/cart</code>
                    <span className={styles.apiMode__desc}>カートクリア</span>
                  </div>
                </div>

                {/* 注文 */}
                <div className={styles.apiMode__endpointGroup}>
                  <h3 className={styles.apiMode__groupTitle}>注文 (Orders)</h3>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="GET">GET</span>
                    <code>/api/orders</code>
                    <span className={styles.apiMode__desc}>注文一覧取得</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="GET">GET</span>
                    <code>/api/orders/[id]</code>
                    <span className={styles.apiMode__desc}>注文詳細取得</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="POST">POST</span>
                    <code>/api/orders</code>
                    <span className={styles.apiMode__desc}>注文作成</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="PUT">PUT</span>
                    <code>/api/orders/[id]/cancel</code>
                    <span className={styles.apiMode__desc}>注文キャンセル</span>
                  </div>
                </div>

                {/* ユーザー */}
                <div className={styles.apiMode__endpointGroup}>
                  <h3 className={styles.apiMode__groupTitle}>ユーザー (Users)</h3>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="GET">GET</span>
                    <code>/api/users/profile</code>
                    <span className={styles.apiMode__desc}>プロフィール取得</span>
                  </div>
                  <div className={styles.apiMode__endpoint}>
                    <span className={styles.apiMode__method} data-method="PUT">PUT</span>
                    <code>/api/users/profile</code>
                    <span className={styles.apiMode__desc}>プロフィール更新</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 認証情報 */}
            <section className={styles.apiMode__section}>
              <h2 className={styles.apiMode__sectionTitle}>
                🔐 テストアカウント
              </h2>
              <div className={styles.apiMode__testAccount}>
                <div className={styles.apiMode__accountInfo}>
                  <strong>Email:</strong> <code>demo@example.com</code>
                </div>
                <div className={styles.apiMode__accountInfo}>
                  <strong>Password:</strong> <code>password123</code>
                </div>
              </div>
            </section>

            {/* 追加情報 */}
            <section className={styles.apiMode__section}>
              <h2 className={styles.apiMode__sectionTitle}>
                📚 ドキュメント
              </h2>
              <ul className={styles.apiMode__links}>
                <li><a href="/api" target="_blank">API詳細情報（JSON）</a></li>
                <li><a href="https://github.com" target="_blank">GitHub Repository</a></li>
                <li><a href="https://nextjs.org/docs" target="_blank">Next.js Documentation</a></li>
              </ul>
            </section>
          </main>

          <footer className={styles.apiMode__footer}>
            <p>© 2024 ECショップ API. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  // フルスタックモード: 通常のECショップページ
  // サーバーサイドで商品一覧を取得
  const products = await getProducts();

  return (
    <div className={styles.home}>
      <div className={styles.home__container}>
        {/* ヘッダー */}
        <header className={styles.home__header}>
          <h1 className={styles.home__title}>
            ECショップへようこそ
          </h1>
          <p className={styles.home__subtitle}>
            高品質な商品をお手頃な価格でお届けします
          </p>
        </header>

        <main className={styles.home__main}>
          {/* ヒーローセクション */}
          <section className={styles.home__hero}>
            <div className={styles.home__heroContent}>
              <h2 className={styles.home__heroTitle}>
                新商品が続々入荷中！
              </h2>
              <p className={styles.home__heroDescription}>
                最新トレンドの商品をチェックして、お気に入りを見つけましょう。
              </p>
              {/* アクションボタン（クライアントコンポーネント） */}
              <div className={styles.home__heroActions}>
                <HeroActions />
              </div>
            </div>
          </section>

          {/* 商品一覧セクション */}
          {products.length > 0 && (
            <section className={styles.home__products}>
              <div className={styles.home__productsHeader}>
                <h2 className={styles.home__productsTitle}>
                  おすすめ商品
                </h2>
                <Link href="/products" className={styles.home__productsLink}>
                  すべて見る →
                </Link>
              </div>
              <div className={styles.home__productsGrid}>
                {products.map((product) => (
                  <article key={product.id} className={styles.home__productCard}>
                    <Link href={`/products/${product.id}`} className={styles.home__productLink}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className={styles.home__productImage}
                        />
                      ) : (
                        <div className={styles.home__productImagePlaceholder}>
                          画像なし
                        </div>
                      )}
                      <div className={styles.home__productContent}>
                        <h3 className={styles.home__productName}>
                          {product.name}
                        </h3>
                        <p className={styles.home__productDescription}>
                          {product.description.length > 60 
                            ? `${product.description.substring(0, 60)}...` 
                            : product.description}
                        </p>
                        <div className={styles.home__productFooter}>
                          <span className={styles.home__productPrice}>
                            ¥{product.price.toLocaleString()}
                          </span>
                          <span className={styles.home__productStock}>
                            在庫: {product.stock}個
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className={styles.home__productActions}>
                      <ProductCardActions
                        product={product}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* サービス特徴セクション */}
          <section className={styles.home__features}>
            <h2 className={styles.home__featuresTitle}>
              サービス特徴
            </h2>
            <div className={styles.home__featuresGrid}>
              <div className={styles.home__feature}>
                <h3 className={styles.home__featureTitle}>
                  高品質な商品
                </h3>
                <p className={styles.home__featureDescription}>
                  厳選された商品のみを取り扱い、品質にこだわった商品をお届けします。
                </p>
              </div>
              <div className={styles.home__feature}>
                <h3 className={styles.home__featureTitle}>
                  迅速な配送
                </h3>
                <p className={styles.home__featureDescription}>
                  全国どこでも最短翌日配送。お急ぎの場合は当日配送も可能です。
                </p>
              </div>
              <div className={styles.home__feature}>
                <h3 className={styles.home__featureTitle}>
                  安心のサポート
                </h3>
                <p className={styles.home__featureDescription}>
                  24時間365日対応のカスタマーサポートで、いつでも安心してお買い物できます。
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
