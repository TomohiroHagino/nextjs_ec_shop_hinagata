import { CartId, Quantity } from '@/domain/cart-aggregate/value-object';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartItem } from './cart-item';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

/**
 * カートエンティティ
 */
export class Cart {
  private constructor(
    private readonly _id: CartId,
    private readonly _userId: UserId,
    private readonly _items: CartItem[],
    private readonly _createdAt: CreatedAt,
    private readonly _updatedAt: UpdatedAt,
  ) {}

  static create(
    id: CartId,
    userId: UserId,
  ): Cart {
    const now = new Date();
    return new Cart(
      id,
      userId,
      [],
      new CreatedAt(now),
      new UpdatedAt(now),
    );
  }

  static reconstruct(
    id: CartId,
    userId: UserId,
    items: CartItem[],
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): Cart {
    return new Cart(id, userId, items, createdAt, updatedAt);
  }

  get id(): CartId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get items(): CartItem[] {
    return [...this._items];
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * アイテムを追加
   */
  addItem(item: CartItem): Cart {
    const existingItemIndex = this._items.findIndex(existingItem => 
      existingItem.isSameProduct(item)
    );

    let newItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      // 既存のアイテムの数量を更新
      const existingItem = this._items[existingItemIndex];
      const updatedItem = existingItem.increaseQuantity(item.quantity);
      newItems = [...this._items];
      newItems[existingItemIndex] = updatedItem;
    } else {
      // 新しいアイテムを追加
      newItems = [...this._items, item];
    }

    return new Cart(
      this._id,
      this._userId,
      newItems,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * アイテムを削除
   */
  removeItem(itemId: string): Cart {
    const newItems = this._items.filter(item => item.id.value !== itemId);
    
    return new Cart(
      this._id,
      this._userId,
      newItems,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * アイテムの数量を更新
   */
  updateItemQuantity(itemId: string, newQuantity: Quantity): Cart {
    const newItems = this._items.map(item => {
      if (item.id.value === itemId) {
        return item.updateQuantity(newQuantity);
      }
      return item;
    });

    return new Cart(
      this._id,
      this._userId,
      newItems,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * カートをクリア
   */
  clear(): Cart {
    return new Cart(
      this._id,
      this._userId,
      [],
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * アイテム数を取得
   */
  getItemCount(): number {
    return this._items.reduce((total, item) => total + item.quantity.value, 0);
  }

  /**
   * アイテムが存在するかチェック
   */
  hasItem(productId: string): boolean {
    return this._items.some(item => item.productId.value === productId);
  }

  /**
   * 指定されたアイテムを取得
   */
  getItem(productId: string): CartItem | null {
    return this._items.find(item => item.productId.value === productId) || null;
  }

  /**
   * カートが空かチェック
   */
  isEmpty(): boolean {
    return this._items.length === 0;
  }

  equals(other: Cart): boolean {
    return this._id.equals(other._id);
  }
}
