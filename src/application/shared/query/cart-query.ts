import { BaseQuery } from './base-query';

/**
 * カート取得クエリ
 */
export class GetCartQuery extends BaseQuery {
  constructor(public readonly userId: string) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }
  }
}
