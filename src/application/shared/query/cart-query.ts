import { BaseQuery } from './base-query';

/**
 * カート取得クエリ（GetCartQuery）
 * 
 * 役割:
 * - 特定のユーザーのカート情報を取得するためのパラメータを定義
 * - カートの内容（商品、数量、合計金額など）を取得する際に使用
 * 
 * 使用場面:
 * - GET /api/cart のリクエスト処理
 * - カートページの表示
 * - ヘッダーのカート数表示
 * - 注文確定前のカート内容確認
 * 
 * パラメータ:
 * - userId: ユーザーID（誰のカートを取得するか）
 * 
 * バリデーション:
 * - userId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - カートの内容は変更しない（読み取り専用）
 * - ユーザーがログインしている必要がある
 */
export class GetCartQuery extends BaseQuery {
  constructor(public readonly userId: string) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }
  }
}
