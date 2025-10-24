import { Quantity } from '@/domain/cart-aggregate/value-object/quantity';
import { ValidationException } from '@/domain/shared/exception';

describe('Quantity', () => {
  describe('constructor', () => {
    it('should create a valid quantity', () => {
      const quantity = new Quantity(5);
      expect(quantity.value).toBe(5);
    });

    it('should throw ValidationException for zero quantity', () => {
      expect(() => new Quantity(0)).toThrow(ValidationException);
    });

    it('should throw ValidationException for negative quantity', () => {
      expect(() => new Quantity(-1)).toThrow(ValidationException);
    });

    it('should throw ValidationException for non-integer quantity', () => {
      expect(() => new Quantity(5.5)).toThrow(ValidationException);
    });

    it('should throw ValidationException for quantity too large', () => {
      expect(() => new Quantity(1000)).toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid number', () => {
      expect(() => new Quantity(NaN)).toThrow(ValidationException);
    });
  });

  describe('add', () => {
    it('should add two quantities', () => {
      const quantity1 = new Quantity(5);
      const quantity2 = new Quantity(3);
      const result = quantity1.add(quantity2);

      expect(result.value).toBe(8);
    });

    it('should throw error if result exceeds limit', () => {
      const quantity1 = new Quantity(500);
      const quantity2 = new Quantity(500);

      expect(() => quantity1.add(quantity2)).toThrow(ValidationException);
    });
  });

  describe('subtract', () => {
    it('should subtract quantities', () => {
      const quantity1 = new Quantity(5);
      const quantity2 = new Quantity(3);
      const result = quantity1.subtract(quantity2);

      expect(result.value).toBe(2);
    });

    it('should throw error if result is zero or negative', () => {
      const quantity1 = new Quantity(5);
      const quantity2 = new Quantity(5);

      expect(() => quantity1.subtract(quantity2)).toThrow(ValidationException);
    });
  });

  describe('multiply', () => {
    it('should multiply quantity by factor', () => {
      const quantity = new Quantity(5);
      const result = quantity.multiply(2);

      expect(result.value).toBe(10);
    });

    it('should throw error if result exceeds limit', () => {
      const quantity = new Quantity(500);
      
      expect(() => quantity.multiply(2)).toThrow(ValidationException);
    });
  });

  describe('equals', () => {
    it('should return true for same quantity', () => {
      const quantity1 = new Quantity(5);
      const quantity2 = new Quantity(5);

      expect(quantity1.equals(quantity2)).toBe(true);
    });

    it('should return false for different quantities', () => {
      const quantity1 = new Quantity(5);
      const quantity2 = new Quantity(3);

      expect(quantity1.equals(quantity2)).toBe(false);
    });
  });
});
