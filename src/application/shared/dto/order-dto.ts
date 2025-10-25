import { BaseDto } from './base-dto';

/**
 * 注文DTO（Data Transfer Object）
 * 
 * 役割:
 * - Order エンティティから必要な情報だけを取り出して、API や UI に渡す
 * - 注文履歴や注文詳細を表示するために使う
 * 
 * 使用場面:
 * - GET /api/orders のレスポンス（注文履歴）
 * - GET /api/orders/:id のレスポンス（注文詳細）
 * - 注文履歴ページ、注文詳細ページの表示
 * 
 * 含まれる情報:
 * - id: 注文ID
 * - userId: ユーザーID（誰の注文か）
 * - status: 注文ステータス（PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED）
 * - totalAmount: 合計金額
 * - items: 注文商品リスト（OrderItemDto の配列）
 * - itemCount: 注文商品数（合計）
 * - createdAt, updatedAt: 作成・更新日時
 */
export class OrderDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly status: string,
    public readonly totalAmount: number,
    public readonly items: OrderItemDto[],
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
      status: this.status,
      totalAmount: this.totalAmount,
      items: this.items.map(item => item.toJSON()),
      itemCount: this.itemCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * 注文アイテムDTO（Data Transfer Object）
 * 
 * 役割:
 * - OrderItem エンティティから必要な情報だけを取り出して、API や UI に渡す
 * - 注文内の各商品の情報を表示するために使う
 * 
 * 使用場面:
 * - OrderDto の items 配列の要素として使用
 * - 注文詳細ページの商品リスト表示
 * 
 * 含まれる情報:
 * - id: 注文アイテムID
 * - productId: 商品ID
 * - quantity: 数量（何個注文したか）
 * - price: 注文時の単価（Price × Quantity = Subtotal）
 * - subtotal: 小計（この商品の合計金額）
 * - product: 商品の詳細情報（名前、画像URL）
 *   ※ OrderRepository が Product 情報を取得してキャッシュから提供
 * - createdAt, updatedAt: 作成・更新日時
 * 
 * 注意点:
 * - price は注文時の価格で固定（商品が後で値上げされても変わらない）
 */
export class OrderItemDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly subtotal: number,
    public readonly product?: {
      id: string;
      name: string;
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
      price: this.price,
      subtotal: this.subtotal,
      product: this.product,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
