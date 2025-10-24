import { BaseCommand } from './base-command';

/**
 * カートアイテム追加コマンド
 */
export class AddToCartCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly quantity: number,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.productId || typeof this.productId !== 'string') {
      throw new Error('Product ID is required');
    }

    if (typeof this.quantity !== 'number' || this.quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
  }
}

/**
 * カートアイテム削除コマンド
 */
export class RemoveFromCartCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.itemId || typeof this.itemId !== 'string') {
      throw new Error('Item ID is required');
    }
  }
}

/**
 * カートアイテム数量更新コマンド
 */
export class UpdateCartItemCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly quantity: number,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.itemId || typeof this.itemId !== 'string') {
      throw new Error('Item ID is required');
    }

    if (typeof this.quantity !== 'number' || this.quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
  }
}

/**
 * カートクリアコマンド
 */
export class ClearCartCommand extends BaseCommand {
  constructor(public readonly userId: string) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }
  }
}
