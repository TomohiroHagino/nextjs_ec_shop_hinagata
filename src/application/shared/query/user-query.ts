import { BaseQuery } from './base-query';

/**
 * ユーザー取得クエリ
 */
export class GetUserQuery extends BaseQuery {
  constructor(public readonly userId: string) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }
  }
}

/**
 * ユーザー一覧取得クエリ
 */
export class GetUsersQuery extends BaseQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
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
  }
}
