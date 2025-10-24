import { ValidationException } from '@/domain/shared/exception';

/**
 * 価格値オブジェクト
 */
export class Price {
  private readonly _value: number;

  constructor(value: number) {
    this.validate(value);
    this._value = Math.round(value * 100) / 100; // 小数点以下2桁に丸める
  }

  private validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationException('Price must be a valid number');
    }

    if (value < 0) {
      throw new ValidationException('Price must be non-negative');
    }

    if (value > 999999.99) {
      throw new ValidationException('Price must be less than 1,000,000');
    }
  }

  get value(): number {
    return this._value;
  }

  equals(other: Price): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(2);
  }

  /**
   * 価格の加算
   */
  add(other: Price): Price {
    return new Price(this._value + other._value);
  }

  /**
   * 価格の乗算
   */
  multiply(factor: number): Price {
    return new Price(this._value * factor);
  }

  /**
   * 価格の比較（より大きい）
   */
  isGreaterThan(other: Price): boolean {
    return this._value > other._value;
  }

  /**
   * 価格の比較（より小さい）
   */
  isLessThan(other: Price): boolean {
    return this._value < other._value;
  }
}
