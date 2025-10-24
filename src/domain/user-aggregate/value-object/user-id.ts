import { Id } from '@/domain/shared/value-object';

/**
 * ユーザーID値オブジェクト
 */
export class UserId extends Id<string> {
  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
    if (value.length < 1 || value.length > 50) {
      throw new Error('User ID must be between 1 and 50 characters');
    }
  }
}
