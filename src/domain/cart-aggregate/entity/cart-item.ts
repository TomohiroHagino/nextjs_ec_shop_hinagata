import { CartItemId, Quantity } from '../value-object';
import { CartId } from '../value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

/**
 * カートアイテムエンティティ
 */
export class CartItem {
  private constructor(
    private readonly _id: CartItemId,
    private readonly _cartId: CartId,
    private readonly _productId: ProductId,
    private readonly _quantity: Quantity,
    private readonly _createdAt: CreatedAt,
    private readonly _updatedAt: UpdatedAt,
  ) {}

  static create(
    id: CartItemId,
    cartId: CartId,
    productId: ProductId,
    quantity: Quantity,
  ): CartItem {
    const now = new Date();
    return new CartItem(
      id,
      cartId,
      productId,
      quantity,
      new CreatedAt(now),
      new UpdatedAt(now),
    );
  }

  static reconstruct(
    id: CartItemId,
    cartId: CartId,
    productId: ProductId,
    quantity: Quantity,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): CartItem {
    return new CartItem(id, cartId, productId, quantity, createdAt, updatedAt);
  }

  get id(): CartItemId {
    return this._id;
  }

  get cartId(): CartId {
    return this._cartId;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * 数量を更新
   */
  updateQuantity(newQuantity: Quantity): CartItem {
    return new CartItem(
      this._id,
      this._cartId,
      this._productId,
      newQuantity,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * 数量を増やす
   */
  increaseQuantity(amount: Quantity): CartItem {
    const newQuantity = this._quantity.add(amount);
    return this.updateQuantity(newQuantity);
  }

  /**
   * 数量を減らす
   */
  decreaseQuantity(amount: Quantity): CartItem {
    const newQuantity = this._quantity.subtract(amount);
    return this.updateQuantity(newQuantity);
  }

  equals(other: CartItem): boolean {
    return this._id.equals(other._id);
  }

  /**
   * 同じプロダクトかチェック
   */
  isSameProduct(other: CartItem): boolean {
    return this._productId.equals(other._productId);
  }
}
