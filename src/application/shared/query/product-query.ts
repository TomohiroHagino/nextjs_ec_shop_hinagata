import { BaseQuery } from './base-query';

/**
 * プロダクト取得クエリ
 */
export class GetProductQuery extends BaseQuery {
  constructor(public readonly productId: string) {
    super();
  }

  validate(): void {
    if (!this.productId || typeof this.productId !== 'string') {
      throw new Error('Product ID is required');
    }
  }
}

/**
 * プロダクト一覧取得クエリ
 */
export class GetProductsQuery extends BaseQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
  ) {
    super();
  }

  validate(): void {
    if (typeof this.page !== 'number' || this.page < 1) {
      throw new Error('Page must be a positive number');
    }

    if (typeof this.limit !== 'number' || this.limit < 1 || this.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (this.minPrice !== undefined && (typeof this.minPrice !== 'number' || this.minPrice < 0)) {
      throw new Error('Min price must be a non-negative number');
    }

    if (this.maxPrice !== undefined && (typeof this.maxPrice !== 'number' || this.maxPrice < 0)) {
      throw new Error('Max price must be a non-negative number');
    }

    if (this.minPrice !== undefined && this.maxPrice !== undefined && this.minPrice > this.maxPrice) {
      throw new Error('Min price must be less than or equal to max price');
    }
  }
}
