import { Order, OrderId } from '@/domain/order-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { OrderRepository, OrderDomainService } from '@/domain/order-aggregate';
import { CancelOrderCommand } from '../shared/command';
import { OrderDto, OrderItemDto } from '../shared/dto';

/**
 * オーダーキャンセルサービス
 */
export class CancelOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderDomainService: OrderDomainService,
  ) {}

  async execute(command: CancelOrderCommand): Promise<OrderDto> {
    command.validate();

    const userId = new UserId(command.userId);
    const orderId = new OrderId(command.orderId);

    // ドメインサービスで検証
    const order = await this.orderDomainService.validateOrderCancellation(orderId);

    // オーダーをキャンセル
    const cancelledOrder = order.cancel();

    // リポジトリに保存
    await this.orderRepository.save(cancelledOrder);

    // DTOに変換して返却
    return this.toOrderDto(cancelledOrder);
  }

  private toOrderDto(order: Order): OrderDto {
    const itemDtos = order.items.map(item => new OrderItemDto(
      item.id,
      item.productId.value,
      item.quantity.value,
      item.price.value,
      item.getSubtotal().value,
      item.createdAt.toString(),
      item.updatedAt.toString(),
    ));

    return new OrderDto(
      order.id.value,
      order.userId.value,
      order.status.value,
      order.totalAmount.value,
      itemDtos,
      order.getItemCount(),
      order.createdAt.toString(),
      order.updatedAt.toString(),
    );
  }
}
