import { Order, OrderItem, OrderId, OrderStatusValue, TotalAmount, OrderStatus } from '@/domain/order-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId, Price } from '@/domain/product-aggregate/value-object';
import { Quantity } from '@/domain/cart-aggregate/value-object';
import { ValidationException } from '@/domain/shared/exception';

describe('Order', () => {
  const orderId = new OrderId('order-123');
  const userId = new UserId('user-123');
  const productId = new ProductId('product-123');
  const price = new Price(100.50);
  const quantity = new Quantity(2);

  describe('create', () => {
    it('should create a new order', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);

      expect(order.id).toBe(orderId);
      expect(order.userId).toBe(userId);
      expect(order.status.value).toBe(OrderStatus.PENDING);
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount.value).toBe(201.00); // 100.50 * 2
    });

    it('should throw error for empty items', () => {
      expect(() => Order.create(orderId, userId, [])).toThrow(ValidationException);
    });

    it('should calculate total amount correctly', () => {
      const item1 = OrderItem.create('item-123', orderId, productId, quantity, price);
      const item2 = OrderItem.create('item-124', orderId, productId, new Quantity(1), new Price(50.25));
      const order = Order.create(orderId, userId, [item1, item2]);

      expect(order.totalAmount.value).toBe(251.25); // (100.50 * 2) + (50.25 * 1)
    });
  });

  describe('confirm', () => {
    it('should confirm pending order', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);

      const confirmedOrder = order.confirm();

      expect(confirmedOrder.status.value).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw error for non-changeable status', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);
      const cancelledOrder = order.cancel();

      expect(() => cancelledOrder.confirm()).toThrow(ValidationException);
    });
  });

  describe('ship', () => {
    it('should ship confirmed order', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);
      const confirmedOrder = order.confirm();

      const shippedOrder = confirmedOrder.ship();

      expect(shippedOrder.status.value).toBe(OrderStatus.SHIPPED);
    });

    it('should throw error for non-progressable status', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);
      const cancelledOrder = order.cancel();

      expect(() => cancelledOrder.ship()).toThrow(ValidationException);
    });
  });

  describe('deliver', () => {
    it('should deliver shipped order', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);
      const confirmedOrder = order.confirm();
      const shippedOrder = confirmedOrder.ship();

      const deliveredOrder = shippedOrder.deliver();

      expect(deliveredOrder.status.value).toBe(OrderStatus.DELIVERED);
      expect(deliveredOrder.isCompleted()).toBe(true);
    });
  });

  describe('cancel', () => {
    it('should cancel pending order', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);

      const cancelledOrder = order.cancel();

      expect(cancelledOrder.status.value).toBe(OrderStatus.CANCELLED);
      expect(cancelledOrder.isCancelled()).toBe(true);
    });

    it('should throw error for non-changeable status', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order = Order.create(orderId, userId, [item]);
      const confirmedOrder = order.confirm();
      const shippedOrder = confirmedOrder.ship();

      expect(() => shippedOrder.cancel()).toThrow(ValidationException);
    });
  });

  describe('getItemCount', () => {
    it('should return total item count', () => {
      const item1 = OrderItem.create('item-123', orderId, productId, quantity, price);
      const item2 = OrderItem.create('item-124', orderId, productId, new Quantity(1), price);
      const order = Order.create(orderId, userId, [item1, item2]);

      expect(order.getItemCount()).toBe(3); // 2 + 1
    });
  });

  describe('equals', () => {
    it('should return true for same order', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order1 = Order.create(orderId, userId, [item]);
      const order2 = Order.create(orderId, userId, [item]);

      expect(order1.equals(order2)).toBe(true);
    });

    it('should return false for different orders', () => {
      const item = OrderItem.create('item-123', orderId, productId, quantity, price);
      const order1 = Order.create(orderId, userId, [item]);
      const order2 = Order.create(new OrderId('order-456'), userId, [item]);

      expect(order1.equals(order2)).toBe(false);
    });
  });
});
