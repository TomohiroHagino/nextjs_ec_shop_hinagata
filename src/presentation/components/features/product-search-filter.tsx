/**
 * 商品検索フィルターコンポーネント（クライアントコンポーネント）
 * 
 * 役割:
 * - 商品の検索とフィルタリング機能を提供
 * - ユーザーのインタラクションを処理
 * 
 * クライアントコンポーネントである理由:
 * - フォームの入力状態管理（useState）
 * - イベントハンドラー（onChange, onSubmit）
 * - URLパラメータの更新（useRouter）
 */
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/presentation/components/ui';
import styles from './product-search-filter.module.scss';

export function ProductSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 現在のURLパラメータから初期値を取得
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minPriceDisplay, setMinPriceDisplay] = useState(
    searchParams.get('minPrice') ? formatPriceInput(searchParams.get('minPrice')!) : ''
  );
  const [maxPriceDisplay, setMaxPriceDisplay] = useState(
    searchParams.get('maxPrice') ? formatPriceInput(searchParams.get('maxPrice')!) : ''
  );

  /**
   * 価格入力のフォーマット
   * 
   * 数字以外を削除し、3桁ごとにカンマを追加
   */
  function formatPriceInput(value: string): string {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString();
  }

  /**
   * 最低価格変更ハンドラー
   */
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setMinPrice(numericValue);
    setMinPriceDisplay(formatPriceInput(value));
  };

  /**
   * 最高価格変更ハンドラー
   */
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setMaxPrice(numericValue);
    setMaxPriceDisplay(formatPriceInput(value));
  };

  /**
   * 検索フォーム送信ハンドラー
   * 
   * URLパラメータを更新してサーバーコンポーネントを再レンダリング
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    // ページ番号をリセット
    params.append('page', '1');

    // URLを更新（サーバーコンポーネントが再レンダリングされる）
    router.push(`/products?${params.toString()}`);
  };

  /**
   * フィルタークリアハンドラー
   */
  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setMinPriceDisplay('');
    setMaxPriceDisplay('');
    router.push('/products?page=1');
  };

  return (
    <form onSubmit={handleSearch} className={styles.filter}>
      {/* 検索キーワード */}
      <div className={styles.filter__field}>
        <label htmlFor="search" className={styles.filter__label}>
          キーワード検索
        </label>
        <Input
          id="search"
          type="text"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="商品名で検索"
        />
      </div>

      {/* 価格フィルター */}
      <div className={styles.filter__priceRange}>
        <label className={styles.filter__label}>価格帯</label>
        <div className={styles.filter__priceInputs}>
          <Input
            type="text"
            name="minPrice"
            value={minPriceDisplay}
            onChange={handleMinPriceChange}
            placeholder="最低価格"
          />
          <span className={styles.filter__priceSeparator}>〜</span>
          <Input
            type="text"
            name="maxPrice"
            value={maxPriceDisplay}
            onChange={handleMaxPriceChange}
            placeholder="最高価格"
          />
        </div>
      </div>

      {/* アクションボタン */}
      <div className={styles.filter__actions}>
        <Button type="submit" variant="primary">
          検索
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          クリア
        </Button>
      </div>
    </form>
  );
}

