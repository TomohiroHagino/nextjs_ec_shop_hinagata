import { Order, OrderItem } from '../entity';
import { OrderId, OrderStatusValue } from '../value-object';
import { UserId } from '@/domain/user-aggregate/value-object';
import { OrderRepository } from '../repository';
import { ValidationException } from '@/domain/shared/exception';

/**
 * オーダードメインサービス
 */
export class OrderDomainService {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * オーダー存在確認
   */
  async ensureOrderExists(orderId: OrderId): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ValidationException('Order not found');
    }
    return order;
  }

  /**
   * オーダー作成の検証
   */
  async validateOrderCreation(
    userId: UserId,
    items: OrderItem[],
  ): Promise<void> {
    if (items.length === 0) {
      throw new ValidationException('Order must have at least one item');
    }

    // ユーザーのオーダー数制限チェック（例：月間最大10件）
    const orderCount = await this.orderRepository.countByUserId(userId);
    if (orderCount >= 10) {
      throw new ValidationException('Monthly order limit exceeded');
    }

    // 各アイテムの検証
    for (const item of items) {
      if (item.quantity.value <= 0) {
        throw new ValidationException('Item quantity must be positive');
      }
    }
  }

  /**
   * オーダーキャンセルの検証
   */
  async validateOrderCancellation(orderId: OrderId): Promise<Order> {
    const order = await this.ensureOrderExists(orderId);

    if (!order.status.canBeChanged()) {
      throw new ValidationException('Order cannot be cancelled');
    }

    return order;
  }

  /**
   * オーダーステータス更新の検証
   */
  async validateStatusUpdate(
    orderId: OrderId,
    newStatus: OrderStatusValue,
  ): Promise<Order> {
    const order = await this.ensureOrderExists(orderId);

    if (!order.status.canProgress()) {
      throw new ValidationException('Order status cannot be updated');
    }

    return order;
  }

  /**
   * 古いオーダーの自動キャンセル
   */
  async cancelStaleOrders(): Promise<void> {
    const staleOrders = await this.orderRepository.findByStatus('PENDING');
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前

    for (const order of staleOrders) {
      if (order.createdAt.value < staleThreshold) {
        const cancelledOrder = order.cancel();
        await this.orderRepository.save(cancelledOrder);
      }
    }
  }
}
