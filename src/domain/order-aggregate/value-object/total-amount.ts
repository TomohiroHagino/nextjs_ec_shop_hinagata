import { ValidationException } from '@/domain/shared/exception';

/**
 * 合計金額値オブジェクト
 */
export class TotalAmount {
  private readonly _value: number;

  constructor(value: number) {
    this._value = Math.round(value * 100) / 100; // 小数点以下2桁に丸める
  }

  private validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationException('Total amount must be a valid number');
    }

    if (value < 0) {
      throw new ValidationException('Total amount must be non-negative');
    }

    if (value > 999999.99) {
      throw new ValidationException('Total amount must be less than 1,000,000');
    }
  }

  get value(): number {
    return this._value;
  }

  equals(other: TotalAmount): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(2);
  }

  /**
   * 金額の加算
   */
  add(other: TotalAmount): TotalAmount {
    return new TotalAmount(this._value + other._value);
  }

  /**
   * 金額の乗算
   */
  multiply(factor: number): TotalAmount {
    return new TotalAmount(this._value * factor);
  }

  /**
   * 金額の比較（より大きい）
   */
  isGreaterThan(other: TotalAmount): boolean {
    return this._value > other._value;
  }

  /**
   * 金額の比較（より小さい）
   */
  isLessThan(other: TotalAmount): boolean {
    return this._value < other._value;
  }
}
