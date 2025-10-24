import { Email } from '@/domain/user-aggregate/value-object/email';
import { ValidationException } from '@/domain/shared/exception';

describe('Email', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw ValidationException for empty email', () => {
      expect(() => new Email('')).toThrow(ValidationException);
      expect(() => new Email('   ')).toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid email format', () => {
      expect(() => new Email('invalid-email')).toThrow(ValidationException);
      expect(() => new Email('test@')).toThrow(ValidationException);
      expect(() => new Email('@example.com')).toThrow(ValidationException);
    });

    it('should throw ValidationException for email too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => new Email(longEmail)).toThrow(ValidationException);
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email value', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});
