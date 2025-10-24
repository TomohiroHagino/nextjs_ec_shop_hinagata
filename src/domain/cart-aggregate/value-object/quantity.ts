import { ValidationException } from '@/domain/shared/exception';

/**
 * 数量値オブジェクト
 */
export class Quantity {
  private readonly _value: number;

  constructor(value: number) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationException('Quantity must be a valid number');
    }

    if (!Number.isInteger(value)) {
      throw new ValidationException('Quantity must be an integer');
    }

    if (value < 1) {
      throw new ValidationException('Quantity must be at least 1');
    }

    if (value > 999) {
      throw new ValidationException('Quantity must be less than 1000');
    }
  }

  get value(): number {
    return this._value;
  }

  equals(other: Quantity): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }

  /**
   * 数量の加算
   */
  add(other: Quantity): Quantity {
    return new Quantity(this._value + other._value);
  }

  /**
   * 数量の減算
   */
  subtract(other: Quantity): Quantity {
    return new Quantity(this._value - other._value);
  }

  /**
   * 数量の乗算
   */
  multiply(factor: number): Quantity {
    return new Quantity(this._value * factor);
  }

  /**
   * 数量の比較（より大きい）
   */
  isGreaterThan(other: Quantity): boolean {
    return this._value > other._value;
  }

  /**
   * 数量の比較（より小さい）
   */
  isLessThan(other: Quantity): boolean {
    return this._value < other._value;
  }
}
