/**
 * 基底ID値オブジェクト
 */
export abstract class Id<T = string> {
  protected readonly _value: T;

  constructor(value: T) {
    this.validate(value);
    this._value = value;
  }

  protected abstract validate(value: T): void;

  get value(): T {
    return this._value;
  }

  equals(other: Id<T>): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return String(this._value);
  }
}
