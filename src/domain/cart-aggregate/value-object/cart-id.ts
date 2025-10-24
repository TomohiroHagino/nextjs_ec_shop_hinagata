import { Id } from '@/domain/shared/value-object';

/**
 * カートID値オブジェクト
 */
export class CartId extends Id<string> {
  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Cart ID must be a non-empty string');
    }
    if (value.length < 1 || value.length > 50) {
      throw new Error('Cart ID must be between 1 and 50 characters');
    }
  }
}
