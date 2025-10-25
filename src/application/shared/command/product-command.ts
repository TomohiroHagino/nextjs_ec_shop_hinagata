import { BaseCommand } from './base-command';

/**
 * 商品作成コマンド（CreateProductCommand）
 * 
 * 役割:
 * - 新しい商品を作成するためのパラメータを定義
 * - 商品の登録操作を表現（管理者用）
 * 
 * 使用場面:
 * - POST /api/products のリクエスト処理
 * - 管理者による商品登録
 * - 商品マスタの追加
 * 
 * パラメータ:
 * - name: 商品名
 * - description: 商品説明
 * - price: 価格（非負数）
 * - stock: 在庫数（非負数）
 * - imageUrl: 商品画像URL（オプション）
 * 
 * バリデーション:
 * - name, description が存在し、文字列であることを確認
 * - price, stock が非負数であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 管理者権限が必要
 * - 商品IDは自動生成される
 * - 価格は整数または小数点以下2桁まで
 * - 画像URLは有効な形式である必要がある
 */
export class CreateProductCommand extends BaseCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl?: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Product name is required');
    }

    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Product description is required');
    }

    if (typeof this.price !== 'number' || this.price < 0) {
      throw new Error('Price must be a non-negative number');
    }

    if (typeof this.stock !== 'number' || this.stock < 0) {
      throw new Error('Stock must be a non-negative number');
    }
  }
}
