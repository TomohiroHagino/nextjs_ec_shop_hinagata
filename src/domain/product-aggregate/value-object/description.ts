import { ValidationException } from '@/domain/shared/exception';

/**
 * 説明値オブジェクト
 */
export class Description {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.trim();
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationException('Description must be a non-empty string');
    }

    if (value.length < 10 || value.length > 1000) {
      throw new ValidationException('Description must be between 10 and 1000 characters');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Description): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
