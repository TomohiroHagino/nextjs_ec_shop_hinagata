import { BaseQuery } from './base-query';

/**
 * オーダー取得クエリ
 */
export class GetOrderQuery extends BaseQuery {
  constructor(public readonly orderId: string) {
    super();
  }

  validate(): void {
    if (!this.orderId || typeof this.orderId !== 'string') {
      throw new Error('Order ID is required');
    }
  }
}

/**
 * オーダー一覧取得クエリ
 */
export class GetOrdersQuery extends BaseQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly status?: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (typeof this.page !== 'number' || this.page < 1) {
      throw new Error('Page must be a positive number');
    }

    if (typeof this.limit !== 'number' || this.limit < 1 || this.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (this.status && typeof this.status !== 'string') {
      throw new Error('Status must be a string');
    }
  }
}
