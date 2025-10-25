import { BaseQuery } from './base-query';

/**
 * ユーザー取得クエリ（GetUserQuery）
 * 
 * 役割:
 * - 特定のユーザーの情報を取得するためのパラメータを定義
 * - ユーザーのプロフィール情報を取得する際に使用
 * 
 * 使用場面:
 * - GET /api/users/:id のリクエスト処理
 * - プロフィールページの表示
 * - ユーザー情報の確認
 * - 管理者によるユーザー情報確認
 * 
 * パラメータ:
 * - userId: ユーザーID（どのユーザーを取得するか）
 * 
 * バリデーション:
 * - userId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - ユーザーの内容は変更しない（読み取り専用）
 * - パスワードなどの機密情報は含まれない
 * - 存在しないユーザーIDの場合は404エラーを返す
 * - プライバシー保護のため、適切な権限チェックが必要
 */
export class GetUserQuery extends BaseQuery {
  constructor(public readonly userId: string) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }
  }
}

/**
 * ユーザー一覧取得クエリ（GetUsersQuery）
 * 
 * 役割:
 * - ユーザー一覧を取得するためのパラメータを定義
 * - ページネーション機能を提供
 * - 管理者によるユーザー管理に使用
 * 
 * 使用場面:
 * - GET /api/users のリクエスト処理
 * - 管理者のユーザー管理画面
 * - ユーザー一覧の表示
 * - ユーザー統計の取得
 * 
 * パラメータ:
 * - page: ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 10、最大: 100）
 * 
 * バリデーション:
 * - page が正の数であることを確認
 * - limit が1-100の範囲内であることを確認
 * 
 * 注意点:
 * - ユーザーの内容は変更しない（読み取り専用）
 * - パスワードなどの機密情報は含まれない
 * - 管理者権限が必要（セキュリティ）
 * - 大量のデータを取得する場合は limit で制限
 * - プライバシー保護のため、必要最小限の情報のみ返す
 */
export class GetUsersQuery extends BaseQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
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
  }
}
