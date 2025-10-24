import { OrderId, OrderStatusValue, TotalAmount } from '../value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { Price } from '@/domain/product-aggregate/value-object';
import { Quantity } from '@/domain/cart-aggregate/value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

/**
 * オーダーアイテムエンティティ
 */
export class OrderItem {
  private constructor(
    private readonly _id: string,
    private readonly _orderId: OrderId,
    private readonly _productId: ProductId,
    private readonly _quantity: Quantity,
    private readonly _price: Price,
    private readonly _createdAt: CreatedAt,
    private readonly _updatedAt: UpdatedAt,
  ) {}

  static create(
    id: string,
    orderId: OrderId,
    productId: ProductId,
    quantity: Quantity,
    price: Price,
  ): OrderItem {
    const now = new Date();
    return new OrderItem(
      id,
      orderId,
      productId,
      quantity,
      price,
      new CreatedAt(now),
      new UpdatedAt(now),
    );
  }

  static reconstruct(
    id: string,
    orderId: OrderId,
    productId: ProductId,
    quantity: Quantity,
    price: Price,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): OrderItem {
    return new OrderItem(id, orderId, productId, quantity, price, createdAt, updatedAt);
  }

  get id(): string {
    return this._id;
  }

  get orderId(): OrderId {
    return this._orderId;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get price(): Price {
    return this._price;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * 小計を計算
   */
  getSubtotal(): TotalAmount {
    return new TotalAmount(this._price.multiply(this._quantity.value).value);
  }

  equals(other: OrderItem): boolean {
    return this._id === other._id;
  }
}
