import { ValidationException } from '@/domain/shared/exception';

/**
 * プロダクト名値オブジェクト
 */
export class ProductName {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.trim();
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationException('Product name must be a non-empty string');
    }

    if (value.length < 1 || value.length > 100) {
      throw new ValidationException('Product name must be between 1 and 100 characters');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: ProductName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
