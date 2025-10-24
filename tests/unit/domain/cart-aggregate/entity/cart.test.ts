import { Cart, CartItem, CartId, CartItemId, Quantity } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

describe('Cart', () => {
  const cartId = new CartId('cart-123');
  const userId = new UserId('user-123');
  const productId = new ProductId('product-123');
  const quantity = new Quantity(2);

  describe('create', () => {
    it('should create an empty cart', () => {
      const cart = Cart.create(cartId, userId);

      expect(cart.id).toBe(cartId);
      expect(cart.userId).toBe(userId);
      expect(cart.items).toEqual([]);
      expect(cart.isEmpty()).toBe(true);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const cart = Cart.create(cartId, userId);
      const item = CartItem.create(
        new CartItemId('item-123'),
        cartId,
        productId,
        quantity,
      );

      const updatedCart = cart.addItem(item);

      expect(updatedCart.items).toHaveLength(1);
      expect(updatedCart.hasItem(productId.value)).toBe(true);
      expect(updatedCart.getItemCount()).toBe(2);
    });

    it('should increase quantity for existing item', () => {
      const cart = Cart.create(cartId, userId);
      const item1 = CartItem.create(
        new CartItemId('item-123'),
        cartId,
        productId,
        quantity,
      );
      const item2 = CartItem.create(
        new CartItemId('item-124'),
        cartId,
        productId,
        new Quantity(3),
      );

      const cartWithFirstItem = cart.addItem(item1);
      const cartWithSecondItem = cartWithFirstItem.addItem(item2);

      expect(cartWithSecondItem.items).toHaveLength(1);
      expect(cartWithSecondItem.getItemCount()).toBe(5); // 2 + 3
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const cart = Cart.create(cartId, userId);
      const item = CartItem.create(
        new CartItemId('item-123'),
        cartId,
        productId,
        quantity,
      );

      const cartWithItem = cart.addItem(item);
      const cartWithoutItem = cartWithItem.removeItem('item-123');

      expect(cartWithoutItem.items).toHaveLength(0);
      expect(cartWithoutItem.isEmpty()).toBe(true);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', () => {
      const cart = Cart.create(cartId, userId);
      const item = CartItem.create(
        new CartItemId('item-123'),
        cartId,
        productId,
        quantity,
      );

      const cartWithItem = cart.addItem(item);
      const updatedCart = cartWithItem.updateItemQuantity('item-123', new Quantity(5));

      expect(updatedCart.getItemCount()).toBe(5);
    });
  });

  describe('clear', () => {
    it('should clear all items from cart', () => {
      const cart = Cart.create(cartId, userId);
      const item = CartItem.create(
        new CartItemId('item-123'),
        cartId,
        productId,
        quantity,
      );

      const cartWithItem = cart.addItem(item);
      const clearedCart = cartWithItem.clear();

      expect(clearedCart.items).toHaveLength(0);
      expect(clearedCart.isEmpty()).toBe(true);
    });
  });

  describe('getItem', () => {
    it('should return item by product id', () => {
      const cart = Cart.create(cartId, userId);
      const item = CartItem.create(
        new CartItemId('item-123'),
        cartId,
        productId,
        quantity,
      );

      const cartWithItem = cart.addItem(item);
      const foundItem = cartWithItem.getItem(productId.value);

      expect(foundItem).toBeTruthy();
      expect(foundItem?.productId).toBe(productId);
    });

    it('should return null for non-existent product', () => {
      const cart = Cart.create(cartId, userId);
      const foundItem = cart.getItem('non-existent');

      expect(foundItem).toBeNull();
    });
  });

  describe('equals', () => {
    it('should return true for same cart', () => {
      const cart1 = Cart.create(cartId, userId);
      const cart2 = Cart.create(cartId, userId);

      expect(cart1.equals(cart2)).toBe(true);
    });

    it('should return false for different carts', () => {
      const cart1 = Cart.create(cartId, userId);
      const cart2 = Cart.create(new CartId('cart-456'), userId);

      expect(cart1.equals(cart2)).toBe(false);
    });
  });
});
