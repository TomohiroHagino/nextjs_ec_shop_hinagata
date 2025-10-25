import { BaseQuery } from './base-query';

/**
 * 商品取得クエリ（GetProductQuery）
 * 
 * 役割:
 * - 特定の商品の詳細情報を取得するためのパラメータを定義
 * - 商品の詳細（名前、価格、説明、在庫など）を取得する際に使用
 * 
 * 使用場面:
 * - GET /api/products/:id のリクエスト処理
 * - 商品詳細ページの表示
 * - 商品情報の確認
 * - カートに追加する前の商品詳細確認
 * 
 * パラメータ:
 * - productId: 商品ID（どの商品を取得するか）
 * 
 * バリデーション:
 * - productId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 商品の内容は変更しない（読み取り専用）
 * - 存在しない商品IDの場合は404エラーを返す
 */
export class GetProductQuery extends BaseQuery {
  constructor(public readonly productId: string) {
    super();
  }

  validate(): void {
    if (!this.productId || typeof this.productId !== 'string') {
      throw new Error('Product ID is required');
    }
  }
}

/**
 * 商品一覧取得クエリ（GetProductsQuery）
 * 
 * 役割:
 * - 商品一覧を取得するためのパラメータを定義
 * - ページネーション、検索、価格フィルタリング機能を提供
 * - 商品一覧の表示に使用
 * 
 * 使用場面:
 * - GET /api/products のリクエスト処理
 * - 商品一覧ページの表示
 * - 商品検索機能
 * - 価格帯での絞り込み
 * 
 * パラメータ:
 * - page: ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 10、最大: 100）
 * - search: 検索キーワード（オプション、商品名で検索）
 * - minPrice: 最低価格（オプション、価格フィルタリング用）
 * - maxPrice: 最高価格（オプション、価格フィルタリング用）
 * 
 * バリデーション:
 * - page が正の数であることを確認
 * - limit が1-100の範囲内であることを確認
 * - minPrice, maxPrice が非負数であることを確認
 * - minPrice が maxPrice 以下であることを確認
 * 
 * 注意点:
 * - 商品の内容は変更しない（読み取り専用）
 * - 検索は商品名に対して部分一致で実行
 * - 価格フィルタリングは minPrice <= 商品価格 <= maxPrice
 * - 大量のデータを取得する場合は limit で制限
 */
export class GetProductsQuery extends BaseQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
  ) {
    super();
  }

  validate(): void {
    if (typeof this.page !== 'number' || this.page < 1) {
      throw new Error('Page must be a positive number');
    }

    if (typeof this.limit !== 'number' || this.limit < 1 || this.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (this.minPrice !== undefined && (typeof this.minPrice !== 'number' || this.minPrice < 0)) {
      throw new Error('Min price must be a non-negative number');
    }

    if (this.maxPrice !== undefined && (typeof this.maxPrice !== 'number' || this.maxPrice < 0)) {
      throw new Error('Max price must be a non-negative number');
    }

    if (this.minPrice !== undefined && this.maxPrice !== undefined && this.minPrice > this.maxPrice) {
      throw new Error('Min price must be less than or equal to max price');
    }
  }
}
