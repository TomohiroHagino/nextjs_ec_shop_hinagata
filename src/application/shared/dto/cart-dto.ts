import { BaseDto } from './base-dto';

/**
 * カートDTO（Data Transfer Object）
 * 
 * 役割:
 * - Cart エンティティから必要な情報だけを取り出して、API や UI に渡す
 * - ショッピングカートの内容を表示するために使う
 * 
 * 使用場面:
 * - GET /api/cart のレスポンス
 * - カートページの表示
 * - カート内の商品数をヘッダーに表示
 * 
 * 含まれる情報:
 * - id: カートID
 * - userId: ユーザーID（誰のカートか）
 * - items: カート内の商品リスト（CartItemDto の配列）
 * - itemCount: カート内の商品数（合計）
 * - createdAt, updatedAt: 作成・更新日時
 */
export class CartDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: CartItemDto[],
    public readonly itemCount: number,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {
    super();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items.map(item => item.toJSON()),
      itemCount: this.itemCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * カートアイテムDTO（Data Transfer Object）
 * 
 * 役割:
 * - CartItem エンティティから必要な情報だけを取り出して、API や UI に渡す
 * - カート内の各商品の情報を表示するために使う
 * 
 * 使用場面:
 * - CartDto の items 配列の要素として使用
 * - カートページの商品リスト表示
 * 
 * 含まれる情報:
 * - id: カートアイテムID
 * - productId: 商品ID
 * - quantity: 数量（何個カートに入っているか）
 * - product: 商品の詳細情報（名前、価格、画像URL）
 *   ※ CartRepository が Product 情報を取得してキャッシュから提供
 * - createdAt, updatedAt: 作成・更新日時
 */
export class CartItemDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly product?: {
      id: string;
      name: string;
      price: number;
      imageUrl?: string;
    },
    public readonly createdAt?: string,
    public readonly updatedAt?: string,
  ) {
    super();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      productId: this.productId,
      quantity: this.quantity,
      product: this.product,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
