import { Id } from '@/domain/shared/value-object';

/**
 * プロダクトID値オブジェクト
 */
export class ProductId extends Id<string> {
  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Product ID must be a non-empty string');
    }
    if (value.length < 1 || value.length > 50) {
      throw new Error('Product ID must be between 1 and 50 characters');
    }
  }
}
