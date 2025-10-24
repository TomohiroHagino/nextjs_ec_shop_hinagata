import { BaseCommand } from './base-command';

/**
 * オーダー作成コマンド
 */
export class CreateOrderCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly items: OrderItemCommand[],
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    for (const item of this.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error('Product ID is required for each item');
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error('Quantity must be a positive number for each item');
      }
    }
  }
}

/**
 * オーダーアイテムコマンド
 */
export class OrderItemCommand {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}

/**
 * オーダーキャンセルコマンド
 */
export class CancelOrderCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly orderId: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.orderId || typeof this.orderId !== 'string') {
      throw new Error('Order ID is required');
    }
  }
}

/**
 * オーダーステータス更新コマンド
 */
export class UpdateOrderStatusCommand extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.orderId || typeof this.orderId !== 'string') {
      throw new Error('Order ID is required');
    }

    if (!this.status || typeof this.status !== 'string') {
      throw new Error('Status is required');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(this.status)) {
      throw new Error('Invalid order status');
    }
  }
}
