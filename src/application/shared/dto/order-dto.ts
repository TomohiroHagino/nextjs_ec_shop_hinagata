import { BaseDto } from './base-dto';

/**
 * オーダーDTO
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
 * オーダーアイテムDTO
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
