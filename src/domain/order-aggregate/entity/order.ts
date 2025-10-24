import { OrderId, OrderStatusValue, TotalAmount, OrderStatus } from '../value-object';
import { UserId } from '@/domain/user-aggregate/value-object';
import { OrderItem } from './order-item';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';
import { ValidationException } from '@/domain/shared/exception';

/**
 * オーダーエンティティ
 */
export class Order {
  private constructor(
    private readonly _id: OrderId,
    private readonly _userId: UserId,
    private readonly _status: OrderStatusValue,
    private readonly _totalAmount: TotalAmount,
    private readonly _items: OrderItem[],
    private readonly _createdAt: CreatedAt,
    private readonly _updatedAt: UpdatedAt,
  ) {}

  static create(
    id: OrderId,
    userId: UserId,
    items: OrderItem[],
  ): Order {
    if (items.length === 0) {
      throw new ValidationException('Order must have at least one item');
    }

    // 合計金額を計算
    const totalAmount = items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      new TotalAmount(0)
    );

    const now = new Date();
    return new Order(
      id,
      userId,
      new OrderStatusValue(OrderStatus.PENDING),
      totalAmount,
      items,
      new CreatedAt(now),
      new UpdatedAt(now),
    );
  }

  static reconstruct(
    id: OrderId,
    userId: UserId,
    status: OrderStatusValue,
    totalAmount: TotalAmount,
    items: OrderItem[],
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): Order {
    return new Order(id, userId, status, totalAmount, items, createdAt, updatedAt);
  }

  get id(): OrderId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get status(): OrderStatusValue {
    return this._status;
  }

  get totalAmount(): TotalAmount {
    return this._totalAmount;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * オーダーを確定
   */
  confirm(): Order {
    if (!this._status.canBeChanged()) {
      throw new ValidationException('Order status cannot be changed');
    }

    return new Order(
      this._id,
      this._userId,
      new OrderStatusValue(OrderStatus.CONFIRMED),
      this._totalAmount,
      this._items,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * オーダーを配送済みに変更
   */
  ship(): Order {
    if (!this._status.canProgress()) {
      throw new ValidationException('Order cannot be shipped');
    }

    return new Order(
      this._id,
      this._userId,
      new OrderStatusValue(OrderStatus.SHIPPED),
      this._totalAmount,
      this._items,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * オーダーを配達済みに変更
   */
  deliver(): Order {
    if (!this._status.canProgress()) {
      throw new ValidationException('Order cannot be delivered');
    }

    return new Order(
      this._id,
      this._userId,
      new OrderStatusValue(OrderStatus.DELIVERED),
      this._totalAmount,
      this._items,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * オーダーをキャンセル
   */
  cancel(): Order {
    if (!this._status.canBeChanged()) {
      throw new ValidationException('Order cannot be cancelled');
    }

    return new Order(
      this._id,
      this._userId,
      new OrderStatusValue(OrderStatus.CANCELLED),
      this._totalAmount,
      this._items,
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
   * オーダーが完了済みかチェック
   */
  isCompleted(): boolean {
    return this._status.isDelivered();
  }

  /**
   * オーダーがキャンセル済みかチェック
   */
  isCancelled(): boolean {
    return this._status.isCancelled();
  }

  equals(other: Order): boolean {
    return this._id.equals(other._id);
  }
}
