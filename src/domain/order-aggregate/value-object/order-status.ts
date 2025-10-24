/**
 * オーダーステータス列挙型
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

/**
 * オーダーステータス値オブジェクト
 */
export class OrderStatusValue {
  private readonly _value: OrderStatus;

  constructor(value: OrderStatus) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: OrderStatus): void {
    if (!Object.values(OrderStatus).includes(value)) {
      throw new Error('Invalid order status');
    }
  }

  get value(): OrderStatus {
    return this._value;
  }

  equals(other: OrderStatusValue): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  /**
   * ステータスが確定済みかチェック
   */
  isConfirmed(): boolean {
    return this._value === OrderStatus.CONFIRMED;
  }

  /**
   * ステータスが配送済みかチェック
   */
  isShipped(): boolean {
    return this._value === OrderStatus.SHIPPED;
  }

  /**
   * ステータスが配達済みかチェック
   */
  isDelivered(): boolean {
    return this._value === OrderStatus.DELIVERED;
  }

  /**
   * ステータスがキャンセル済みかチェック
   */
  isCancelled(): boolean {
    return this._value === OrderStatus.CANCELLED;
  }

  /**
   * ステータスが変更可能かチェック
   */
  canBeChanged(): boolean {
    return this._value === OrderStatus.PENDING || this._value === OrderStatus.CONFIRMED;
  }

  /**
   * 次のステータスに進めるかチェック
   */
  canProgress(): boolean {
    return this._value === OrderStatus.PENDING || 
           this._value === OrderStatus.CONFIRMED || 
           this._value === OrderStatus.SHIPPED;
  }
}
