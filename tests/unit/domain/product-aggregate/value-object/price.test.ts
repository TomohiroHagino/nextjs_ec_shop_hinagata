import { Price } from '@/domain/product-aggregate/value-object/price';
import { ValidationException } from '@/domain/shared/exception';

describe('Price', () => {
  describe('constructor', () => {
    it('should create a valid price', () => {
      const price = new Price(100.50);
      expect(price.value).toBe(100.50);
    });

    it('should round to 2 decimal places', () => {
      const price = new Price(100.555);
      expect(price.value).toBe(100.56);
    });

    it('should throw ValidationException for negative price', () => {
      expect(() => new Price(-10)).toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid number', () => {
      expect(() => new Price(NaN)).toThrow(ValidationException);
      expect(() => new Price(Infinity)).toThrow(ValidationException);
    });

    it('should throw ValidationException for price too large', () => {
      expect(() => new Price(1000000)).toThrow(ValidationException);
    });
  });

  describe('add', () => {
    it('should add two prices', () => {
      const price1 = new Price(100.50);
      const price2 = new Price(50.25);
      const result = price1.add(price2);

      expect(result.value).toBe(150.75);
    });
  });

  describe('multiply', () => {
    it('should multiply price by factor', () => {
      const price = new Price(100.50);
      const result = price.multiply(2);

      expect(result.value).toBe(201.00);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when price is greater', () => {
      const price1 = new Price(100.50);
      const price2 = new Price(50.25);

      expect(price1.isGreaterThan(price2)).toBe(true);
    });

    it('should return false when price is not greater', () => {
      const price1 = new Price(50.25);
      const price2 = new Price(100.50);

      expect(price1.isGreaterThan(price2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same price', () => {
      const price1 = new Price(100.50);
      const price2 = new Price(100.50);

      expect(price1.equals(price2)).toBe(true);
    });

    it('should return false for different prices', () => {
      const price1 = new Price(100.50);
      const price2 = new Price(50.25);

      expect(price1.equals(price2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted price', () => {
      const price = new Price(100.50);
      expect(price.toString()).toBe('100.50');
    });
  });
});
