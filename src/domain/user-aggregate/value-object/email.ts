import { ValidationException } from '@/domain/shared/exception';

/**
 * メールアドレス値オブジェクト
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const trimmedValue = value.trim();
    this.validate(trimmedValue);
    this._value = trimmedValue.toLowerCase();
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationException('Email must be a non-empty string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationException('Invalid email format');
    }

    if (value.length > 255) {
      throw new ValidationException('Email must be less than 255 characters');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
