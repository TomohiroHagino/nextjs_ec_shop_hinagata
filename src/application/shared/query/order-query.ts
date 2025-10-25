import { BaseQuery } from './base-query';

/**
 * 注文取得クエリ（GetOrderQuery）
 * 
 * 役割:
 * - 特定の注文の詳細情報を取得するためのパラメータを定義
 * - 注文の内容（商品、数量、価格、ステータスなど）を取得する際に使用
 * 
 * 使用場面:
 * - GET /api/orders/:id のリクエスト処理
 * - 注文詳細ページの表示
 * - 注文のステータス確認
 * - 注文キャンセル前の内容確認
 * 
 * パラメータ:
 * - orderId: 注文ID（どの注文を取得するか）
 * 
 * バリデーション:
 * - orderId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 注文の内容は変更しない（読み取り専用）
 * - 注文の所有者または管理者のみアクセス可能
 */
export class GetOrderQuery extends BaseQuery {
  constructor(public readonly orderId: string) {
    super();
  }

  validate(): void {
    if (!this.orderId || typeof this.orderId !== 'string') {
      throw new Error('Order ID is required');
    }
  }
}

/**
 * 注文一覧取得クエリ（GetOrdersQuery）
 * 
 * 役割:
 * - ユーザーの注文履歴を取得するためのパラメータを定義
 * - ページネーション、フィルタリング機能を提供
 * - 注文一覧の表示に使用
 * 
 * 使用場面:
 * - GET /api/orders のリクエスト処理
 * - 注文履歴ページの表示
 * - 管理者の注文管理画面
 * - 特定ステータスの注文のみを表示
 * 
 * パラメータ:
 * - userId: ユーザーID（誰の注文を取得するか）
 * - page: ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 10、最大: 100）
 * - status: 注文ステータス（オプション、フィルタリング用）
 * 
 * バリデーション:
 * - userId が存在し、文字列であることを確認
 * - page が正の数であることを確認
 * - limit が1-100の範囲内であることを確認
 * - status が指定されている場合、文字列であることを確認
 * 
 * 注意点:
 * - 注文の内容は変更しない（読み取り専用）
 * - 大量のデータを取得する場合は limit で制限
 * - ページネーションでパフォーマンスを考慮
 */
export class GetOrdersQuery extends BaseQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly status?: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (typeof this.page !== 'number' || this.page < 1) {
      throw new Error('Page must be a positive number');
    }

    if (typeof this.limit !== 'number' || this.limit < 1 || this.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (this.status && typeof this.status !== 'string') {
      throw new Error('Status must be a string');
    }
  }
}
