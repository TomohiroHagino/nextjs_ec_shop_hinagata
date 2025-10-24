import { Password } from '@/domain/user-aggregate/value-object/password';
import { ValidationException } from '@/domain/shared/exception';

// bcryptjsをモック化
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((password: string) => `hashed_${password}`),
  compareSync: jest.fn((password: string, hash: string) => hash === `hashed_${password}`),
}));

describe('Password', () => {
  describe('fromPlainText', () => {
    it('should create password from plain text', () => {
      const password = Password.fromPlainText('password123');
      expect(password.hashedValue).toContain('hashed_password123');
    });

    it('should throw ValidationException for empty password', () => {
      expect(() => Password.fromPlainText('')).toThrow(ValidationException);
    });

    it('should throw ValidationException for password too short', () => {
      expect(() => Password.fromPlainText('1234567')).toThrow(ValidationException);
    });

    it('should throw ValidationException for password too long', () => {
      const longPassword = 'a'.repeat(129);
      expect(() => Password.fromPlainText(longPassword)).toThrow(ValidationException);
    });
  });

  describe('constructor', () => {
    it('should create password with hashed value', () => {
      const password = new Password('hashed_password123');
      expect(password.hashedValue).toBe('hashed_password123');
    });

    it('should throw ValidationException for invalid hashed value', () => {
      expect(() => new Password('short')).toThrow(ValidationException);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', () => {
      const password = Password.fromPlainText('password123');
      expect(password.compare('password123')).toBe(true);
    });

    it('should return false for non-matching password', () => {
      const password = Password.fromPlainText('password123');
      expect(password.compare('wrongpassword')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same hashed value', () => {
      const password1 = new Password('hashed_password123');
      const password2 = new Password('hashed_password123');
      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for different hashed values', () => {
      const password1 = new Password('hashed_password123');
      const password2 = new Password('hashed_password456');
      expect(password1.equals(password2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return redacted value', () => {
      const password = new Password('hashed_password123');
      expect(password.toString()).toBe('[REDACTED]');
    });
  });
});
