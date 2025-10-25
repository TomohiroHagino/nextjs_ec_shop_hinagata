/**
 * トップページ（サーバーコンポーネント）
 * 
 * サーバーコンポーネントである理由:
 * - 静的コンテンツ中心（テキスト、見出し）
 * - SEOが重要（ランディングページ）
 * - 初回表示の高速化
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
import { HeroActions } from '@/presentation/components/features/hero-actions';
import styles from './page.module.scss';

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
 * サーバーコンポーネント:
 * - ページの静的コンテンツ（見出し、説明文、特徴リスト）
 * 
 * クライアントコンポーネント（HeroActions）:
 * - アクションボタンのクリックハンドリング
 * - ページ遷移処理
 */
export default function HomePage() {
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
