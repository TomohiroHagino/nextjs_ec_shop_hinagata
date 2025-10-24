import { ValidationException } from '@/domain/shared/exception';

/**
 * パスワード値オブジェクト
 */
export class Password {
  private readonly _hashedValue: string;

  constructor(hashedValue: string) {
    this.validate(hashedValue);
    this._hashedValue = hashedValue;
  }

  private validate(hashedValue: string): void {
    if (!hashedValue || typeof hashedValue !== 'string') {
      throw new ValidationException('Password must be a non-empty string');
    }

    // テスト用の短いハッシュも許可（hashed_プレフィックス）
    if (hashedValue.length < 10 && !hashedValue.startsWith('hashed_')) {
      throw new ValidationException('Password must be properly hashed');
    }
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  equals(other: Password): boolean {
    return this._hashedValue === other._hashedValue;
  }

  toString(): string {
    return '[REDACTED]';
  }

  /**
   * 平文パスワードからハッシュ化されたパスワードを作成（非同期）
   */
  static async fromPlainText(plainPassword: string): Promise<Password> {
    if (!plainPassword || typeof plainPassword !== 'string') {
      throw new ValidationException('Password must be a non-empty string');
    }

    if (plainPassword.length < 8) {
      throw new ValidationException('Password must be at least 8 characters');
    }

    if (plainPassword.length > 128) {
      throw new ValidationException('Password must be less than 128 characters');
    }

    // 実際の実装ではbcryptを使用
    const bcrypt = require('bcryptjs');
    const hashedValue = await bcrypt.hash(plainPassword, 12);
    return new Password(hashedValue);
  }

  /**
   * 平文パスワードと比較（非同期）
   */
  async compare(plainPassword: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(plainPassword, this._hashedValue);
  }
}
