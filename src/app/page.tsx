import React from 'react';
import { Button, Input } from '@/presentation/components/ui';
import styles from './page.module.scss';

export default function HomePage() {
  return (
    <div className={styles.home}>
      <div className={styles.home__container}>
        <header className={styles.home__header}>
          <h1 className={styles.home__title}>
            ECショップへようこそ
          </h1>
          <p className={styles.home__subtitle}>
            高品質な商品をお手頃な価格でお届けします
          </p>
        </header>

        <main className={styles.home__main}>
          <section className={styles.home__hero}>
            <div className={styles.home__heroContent}>
              <h2 className={styles.home__heroTitle}>
                新商品が続々入荷中！
              </h2>
              <p className={styles.home__heroDescription}>
                最新トレンドの商品をチェックして、お気に入りを見つけましょう。
              </p>
              <div className={styles.home__heroActions}>
                <Button size="large" variant="primary">
                  商品を見る
                </Button>
                <Button size="large" variant="outline">
                  会員登録
                </Button>
              </div>
            </div>
          </section>

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
