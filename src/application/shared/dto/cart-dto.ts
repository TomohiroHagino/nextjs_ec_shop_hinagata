import { BaseDto } from './base-dto';

/**
 * カートDTO
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
 * カートアイテムDTO
 */
export class CartItemDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {
    super();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      productId: this.productId,
      quantity: this.quantity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
