/**
 * 更新日時値オブジェクト
 */
export class UpdatedAt {
  private readonly _value: Date;

  constructor(value?: Date) {
    this._value = value || new Date();
  }

  get value(): Date {
    return new Date(this._value);
  }

  equals(other: UpdatedAt): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  toString(): string {
    return this._value.toISOString();
  }

  update(): UpdatedAt {
    return new UpdatedAt();
  }
}
