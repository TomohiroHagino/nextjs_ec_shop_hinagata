import { BaseDto } from './base-dto';

/**
 * 商品DTO（Data Transfer Object）
 * 
 * 役割:
 * - Product エンティティから必要な情報だけを取り出して、API や UI に渡す
 * - 商品一覧や商品詳細を表示するために使う
 * 
 * 使用場面:
 * - GET /api/products のレスポンス（商品一覧）
 * - GET /api/products/:id のレスポンス（商品詳細）
 * - 商品カード、商品詳細ページの表示
 * 
 * 含まれる情報:
 * - id: 商品ID
 * - name: 商品名
 * - description: 商品説明
 * - price: 価格
 * - stock: 在庫数
 * - imageUrl: 商品画像URL
 * - createdAt, updatedAt: 作成・更新日時
 */
export class ProductDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {
    super();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
